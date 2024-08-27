import { serialize } from 'cookie';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  completeProfileDto,
  deleteProfileDto,
  loginDto,
  registerDto,
  updateProfileDto,
} from 'server/dtos/auth';
import { ResponseDto } from 'server/dtos/response';
import { WithAuthRequest } from 'server/utils/types';
import { parseFormData, parseQuery } from 'server/utils/parser';
import { HttpException } from 'server/exception';
import { IAuthService } from 'server/ports/auth';
import { IUserService } from 'server/ports/user';
import { IBlogService } from 'server/ports/blog';

export class AuthController {
  constructor(
    private readonly authService: IAuthService,
    private readonly userService: IUserService,
    private readonly blogService: IBlogService,
  ) {}

  async login(req: NextApiRequest, res: NextApiResponse) {
    const data = await loginDto.validateAsync(req.body);

    const token = await this.authService.login(data);

    const serialized = serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    res.setHeader('Set-Cookie', serialized);

    return res.status(200).json(new ResponseDto('Login Successful', { token }));
  }

  async register(req: NextApiRequest, res: NextApiResponse) {
    const { fields, files } = await parseFormData(req);

    const data = await registerDto.validateAsync(fields);

    const token = await this.authService.register(data, files?.[0]);

    const serialized = serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    res.setHeader('Set-Cookie', serialized);

    return res.status(201).json(new ResponseDto('Signup Successful', { token }));
  }

  async completeProfile(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    const data = await completeProfileDto.validateAsync(req.body);

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    await this.authService.completeProfile(authUser, data);

    return res.status(201).json(new ResponseDto('Profile Completed'));
  }

  async logout(_: NextApiRequest, res: NextApiResponse) {
    const serialized = serialize('token', '', {
      maxAge: -1,
      path: '/',
    });

    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');

    res.setHeader('Set-Cookie', serialized);

    return res.status(201).json(new ResponseDto('Logged out'));
  }

  async getFollowers(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    const filter = await parseQuery(req.query);

    const [data, count] = await this.userService.getFollowers(authUser.id, filter, authUser.id);

    return res.status(200).json(
      new ResponseDto('Followers fetched', data, {
        count,
        page: filter.page,
        size: filter.size,
      }),
    );
  }

  async getFollowing(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    const filter = await parseQuery(req.query);

    const [data, count] = await this.userService.getFollowing(authUser.id, filter, authUser.id);

    return res.status(200).json(
      new ResponseDto('Following fetched', data, {
        count,
        page: filter.page,
        size: filter.size,
      }),
    );
  }

  async removeImage(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    await this.authService.removeImage(authUser);

    return res.status(201).json(new ResponseDto('Profile image removed'));
  }

  async getProfile(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    const data = this.authService.getProfile(authUser);

    return res.status(200).json(new ResponseDto('Profile fetched', data));
  }

  async updateProfile(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    const { fields, files } = await parseFormData(req);

    const data = await updateProfileDto.validateAsync(fields);

    await this.authService.updateProfile(authUser, data, files?.[0]);

    return res.status(201).json(new ResponseDto('Profile updated'));
  }

  async deleteProfile(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    const { fields } = await parseFormData(req);

    const data = await deleteProfileDto.validateAsync(fields);

    await this.authService.deleteProfile(authUser, data.password);

    const serialized = serialize('token', '', {
      maxAge: 0,
      path: '/',
    });

    res.setHeader('Set-Cookie', serialized);

    return res.status(201).json(new ResponseDto('Profile deleted'));
  }

  async getBookmarks(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    const filter = await parseQuery(req.query);

    const [data, count] = await this.blogService.getBookmarks(authUser.id, filter, authUser.id);

    return res.status(200).json(
      new ResponseDto('Bookmarks fetched', data, {
        count,
        page: filter.page,
        size: filter.size,
      }),
    );
  }

  async getFollowingBlogs(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    const filter = await parseQuery(req.query);

    const [data, count] = await this.blogService.getFollowingBlogs(
      authUser.id,
      filter,
      authUser.id,
    );

    return res.status(200).json(
      new ResponseDto('Following blogs fetched', data, {
        count,
        page: filter.page,
        size: filter.size,
      }),
    );
  }

  async getAuthorBlogs(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    const filter = await parseQuery(req.query);

    const [data, count] = await this.blogService.getAuthorBlogs(authUser.id, filter, authUser.id);

    return res.status(200).json(
      new ResponseDto('Author blogs fetched', data, {
        count,
        page: filter.page,
        size: filter.size,
      }),
    );
  }
}
