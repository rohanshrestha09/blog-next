import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
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
import { mailConfig } from 'server/config/mail';
import { IUnitOfWork } from 'server/ports/unitofwork';

export class AuthService implements IAuthService {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly userRepository: IUserRepository,
    private readonly blogRepository: IBlogRepository,
    private readonly supabaseService: ISupabaseService,
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
    return await this.unitOfWork.beginTx(async (tx) => {
      const userExists = await tx.userRepository.findUserByEmail(data.email);

      if (userExists) throw new HttpException(403, 'User already exists. Choose a different email');

      const salt = await bcrypt.genSalt(10);

      const encryptedPassword = await bcrypt.hash(data.password, salt);

      const user = await tx.userRepository.createUser({
        name: data.name,
        email: data.email,
        password: encryptedPassword,
        dateOfBirth: moment(data.dateOfBirth).toDate(),
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

        await tx.userRepository.updateUserByID(user.id, {
          image: previewUrl,
          imageName: uploadedFilePath,
        });
      }

      const token = sign({ id: user.id, email: user.email }, jwtConfig.secretKey, {
        expiresIn: '30d',
      });

      return token;
    });
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
    return await this.userRepository.findSensitiveUserByID(user.id);
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

      if (user.image && user.imageName) this.supabaseService.deleteFile('users', [user.imageName]);

      previewUrl = await this.supabaseService.downloadFile('users', filename);
    }

    await this.userRepository.updateUserByID(user.id, {
      name: data.name,
      bio: data.bio,
      website: data.website,
      image: previewUrl,
      imageName: uploadedFilePath,
      dateOfBirth: data.dateOfBirth && moment(data.dateOfBirth).toDate(),
    });
  }

  async deleteProfile(user: User, password: string): Promise<void> {
    await this.unitOfWork.beginTx(async (tx) => {
      const userPassword = await tx.userRepository.findUserPasswordByEmail(user.email);

      const isMatched = await bcrypt.compare(password, userPassword);

      if (!isMatched) throw new HttpException(403, 'Incorrect Password');

      if (user.image && user.imageName) {
        await this.supabaseService.deleteFile('users', [user.imageName]);
      }

      const deletedUser = await tx.userRepository.deleteUserByID(user.id, { blogs: true });

      if (deletedUser?.blogs?.length) {
        this.supabaseService.deleteFile(
          'blogs',
          deletedUser.blogs
            .map((blog) => blog.imageName)
            .filter((filename): filename is string => typeof filename === 'string'),
        );
      }
    });
  }

  async getUserBlogs(
    user: User,
    options: Partial<Pick<Blog, 'genre' | 'isPublished'>>,
    filter: FilterProps,
  ): Promise<[Blog[], number]> {
    return await this.blogRepository
      .findAllBlogs({ isPublished: options.isPublished, authorId: user.id })
      .hasGenre(options.genre)
      .withPagination(filter.page, filter.size)
      .withSort(filter.sort, filter.order)
      .withSearch(filter.search)
      .execute(user.id);
  }

  async getBookmarkedBlogs(
    user: User,
    options: Partial<Pick<Blog, 'genre'>>,
    filter: FilterProps,
  ): Promise<[Blog[], number]> {
    return await this.blogRepository
      .findAllBlogs({ isPublished: true })
      .bookmarkedBy(user.id)
      .hasGenre(options.genre)
      .withPagination(filter.page, filter.size)
      .withSort(filter.sort, filter.order)
      .withSearch(filter.search)
      .execute(user.id);
  }

  async getFollowingBlogs(user: User, filter: FilterProps): Promise<[Blog[], number]> {
    return await this.blogRepository
      .findAllBlogs({ isPublished: true })
      .followedBy(user.id)
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
    const user = await this.userRepository.findSensitiveUserByEmail(email);

    const password = await this.userRepository.findUserPasswordByEmail(email);

    const token = sign({ id: user.id, email: user.email }, `${jwtConfig.secretKey}${password}`, {
      expiresIn: '15min',
    });

    const resetUrl = `${appConfig.appUrl}/security/reset-password/${user.email}/${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      auth: mailConfig,
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

  async resetPassword(token: string, data: Pick<User, 'email' | 'password'>): Promise<void> {
    const password = await this.userRepository.findUserPasswordByEmail(data.email);

    const { id } = verify(token, `${jwtConfig.secretKey}${password}`) as JwtPayload;

    const salt = await bcrypt.genSalt(10);

    const encryptedPassword = await bcrypt.hash(data.password, salt);

    await this.userRepository.updateUserByID(id, {
      password: encryptedPassword,
    });
  }
}
