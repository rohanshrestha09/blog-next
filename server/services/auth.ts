import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { sign } from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import moment from 'moment';
import { v4 as uuidV4 } from 'uuid';
import { jwtConfig } from 'server/config/jwt';
import { HttpException } from 'server/exception';
import { User } from 'server/models/user';
import { IAuthService } from 'server/ports/auth';
import { FilterProps, MultipartyFile } from 'server/utils/types';
import { IUserRepository } from 'server/ports/user';
import { ISupabaseService } from 'server/ports/supabase';
import { Blog } from 'server/models/blog';
import { IBlogRepository } from 'server/ports/blog';
import { appConfig } from 'server/config/app';

export class AuthService implements IAuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly supabaseService: ISupabaseService,
    private readonly blogRepository: IBlogRepository,
  ) {}

  async login(data: Pick<User, 'email' | 'password'>): Promise<string> {
    const password = await this.userRepository.findUserPasswordByEmail(data.email);

    const isMatched = await bcrypt.compare(data.password, password);

    if (!isMatched) throw new HttpException(403, 'Incorrect Password');

    const user = await this.userRepository.findUserByEmail(data.email);

    const token = sign({ id: user.id, email: user.email }, jwtConfig.secretKey, {
      expiresIn: jwtConfig.expiresIn,
    });

    return token;
  }

  async register(
    data: Pick<User, 'name' | 'email' | 'password' | 'dateOfBirth'>,
    file?: MultipartyFile,
  ): Promise<string> {
    const userExists = await this.userRepository.findUserByEmail(data.email);

    if (userExists) throw new HttpException(403, 'User already exists. Choose a different email');

    const salt = await bcrypt.genSalt(10);

    const encryptedPassword = await bcrypt.hash(data.password, salt);

    const user = await this.userRepository.createUser({
      name: data.name,
      email: data.email,
      password: encryptedPassword,
      dateOfBirth: new Date(moment(data.dateOfBirth).format()),
      isVerified: true,
    });

    if (file) {
      if (!file?.headers?.['content-type'].startsWith('image/'))
        throw new HttpException(403, 'Please choose an image');

      const filename = file?.headers?.['content-type'].replace('image/', `${user.id}.`);

      const uploadedFilePath = await this.supabaseService.uploadFile(
        'users',
        filename,
        readFileSync(file?.path),
      );

      const previewUrl = await this.supabaseService.downloadFile('users', filename);

      await this.userRepository.updateUserByID(user.id, {
        image: previewUrl,
        imageName: uploadedFilePath,
      });
    }

    const token = sign({ id: user.id, email: user.email }, jwtConfig.secretKey, {
      expiresIn: '30d',
    });

    return token;
  }

  async completeProfile(user: User, data: Pick<User, 'password'>): Promise<void> {
    const salt = await bcrypt.genSalt(10);

    const encryptedPassword = await bcrypt.hash(data.password, salt);

    await this.userRepository.updateUserByID(user.id, {
      password: encryptedPassword,
      isVerified: true,
    });
  }

  async removeImage(user: User): Promise<void> {
    if (user.image && user.imageName) {
      await this.supabaseService.deleteFile('users', [user.imageName]);
    }

    await this.userRepository.updateUserByID(user.id, { image: null, imageName: null });
  }

  async getProfile(user: User): Promise<User> {
    return await this.userRepository.findUserByID(user.id);
  }

  async updateProfile(
    user: User,
    data: Partial<Pick<User, 'name' | 'bio' | 'website' | 'dateOfBirth'>>,
    file?: MultipartyFile,
  ): Promise<void> {
    let previewUrl: string | undefined, uploadedFilePath: string | undefined;

    if (file) {
      if (!file?.headers?.['content-type'].startsWith('image/'))
        throw new HttpException(403, 'Please choose an image');

      const uuid = uuidV4();

      const filename = file?.headers?.['content-type'].replace('image/', `${uuid}.`);

      uploadedFilePath = await this.supabaseService.uploadFile(
        'users',
        filename,
        readFileSync(file.path),
      );

      if (user.image && user.imageName)
        await this.supabaseService.deleteFile('users', [user.imageName]);

      previewUrl = await this.supabaseService.downloadFile('users', filename);
    }

    await this.userRepository.updateUserByID(user.id, {
      name: data.name,
      bio: data.bio,
      website: data.website,
      image: previewUrl,
      imageName: uploadedFilePath,
      dateOfBirth: data.dateOfBirth && new Date(moment(data.dateOfBirth).format()),
    });
  }

  async deleteProfile(user: User, password: string): Promise<void> {
    const userPassword = await this.userRepository.findUserPasswordByEmail(user.email);

    const isMatched = await bcrypt.compare(password, userPassword);

    if (!isMatched) throw new HttpException(403, 'Incorrect Password');

    if (user.image && user.imageName) {
      await this.supabaseService.deleteFile('users', [user.imageName]);
    }

    const deletedUser = await this.userRepository.deleteUserByID(user.id, { blogs: true });

    if (deletedUser?.blogs?.length) {
      this.supabaseService
        .deleteFile(
          'blogs',
          deletedUser.blogs
            .map((blog) => blog.imageName)
            .filter((filename): filename is string => typeof filename === 'string'),
        )
        .catch(() => {});
    }
  }

  async getUserBlogs(
    user: User,
    filter: FilterProps,
    isPublished?: boolean,
  ): Promise<[Blog[], number]> {
    return await this.blogRepository
      .findAllBlogs({ isPublished, authorId: user.id })
      .withPagination(filter.page, filter.size)
      .withSort(filter.sort, filter.order)
      .withSearch(filter.search)
      .execute(user.id);
  }

  async changePassword(
    user: User,
    data: { oldPassword: string; newPassword: string },
  ): Promise<void> {
    const isMatched = await bcrypt.compare(data.oldPassword, user.password);

    if (!isMatched) throw new HttpException(403, 'Incorrect Password');

    const salt = await bcrypt.genSalt(10);

    const encryptedPassword = await bcrypt.hash(data.newPassword, salt);

    await this.userRepository.updateUserByID(user.id, { password: encryptedPassword });
  }

  async sendPasswordResetMail(email: string): Promise<void> {
    const user = await this.userRepository.findUserByEmail(email);

    const token = sign(
      { id: user.id, email: user.email },
      `${process.env.JWT_PASSWORD}${user.password}`,
      {
        expiresIn: '15min',
      },
    );

    const resetUrl = `${appConfig.appUrl}/security/reset-password/${user.email}/${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      auth: {
        user: process.env.MAILING_EMAIL,
        pass: process.env.MAILING_PASSWORD,
      },
      port: 465,
    });

    await transporter.sendMail({
      from: '"Do not reply to this email (via BlogSansar)" <blogsansar0@gmail.com>',
      to: email,
      subject: 'Password Reset Link',
      html: `
        <h1>Click on the link below to reset your password</h1>
        <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
      `,
    });
  }
}
