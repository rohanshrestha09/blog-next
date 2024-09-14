import { NextApiRequest, NextApiResponse } from 'next';
import { ResponseDto } from 'server/dtos/response';
import { WithAuthRequest } from 'server/utils/types';
import { parseQuery } from 'server/utils/parser';
import { IUserService } from 'server/ports/user';
import { HttpException } from 'server/exception';

export class UserController {
  constructor(private readonly userService: IUserService) {}

  async getUser(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    const { userId } = req.query;

    if (typeof userId !== 'string') throw new HttpException(400, 'Invalid userId');

    const data = await this.userService.getUser(userId, authUser?.id);

    return res.status(200).json(new ResponseDto('User fetched', data));
  }

  async getUserSuggestions(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    const filter = await parseQuery(req.query);

    const [data, count] = await this.userService.getUserSuggestions(filter, authUser?.id);

    return res.status(200).json(
      new ResponseDto('User suggestions fetched', data, {
        count,
        page: filter.page,
        size: filter.size,
      }),
    );
  }

  async getUserBlogs(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const { userId } = req.query;

    if (typeof userId !== 'string') throw new HttpException(400, 'Invalid userId');

    const authUser = req.authUser;

    const filter = await parseQuery(req.query);

    const [data, count] = await this.userService.getUserBlogs(userId, filter, authUser?.id);

    return res.status(200).json(
      new ResponseDto('User blogs fetched', data, {
        count,
        page: filter.page,
        size: filter.size,
      }),
    );
  }

  async followUser(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    const { userId } = req.query;

    if (typeof userId !== 'string') throw new HttpException(400, 'Invalid userId');

    await this.userService.followUser(authUser, userId);

    return res.status(201).json(new ResponseDto('Followed'));
  }

  async unfollowUser(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    const { userId } = req.query;

    if (typeof userId !== 'string') throw new HttpException(400, 'Invalid userId');

    await this.userService.unfollowUser(authUser, userId);

    return res.status(201).json(new ResponseDto('Unfollowed'));
  }

  async getFollowers(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    const { userId } = req.query;

    if (typeof userId !== 'string') throw new HttpException(400, 'Invalid userId');

    const filter = await parseQuery(req.query);

    const [data, count] = await this.userService.getFollowers(userId, filter, authUser?.id);

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

    const { userId } = req.query;

    if (typeof userId !== 'string') throw new HttpException(400, 'Invalid userId');

    const filter = await parseQuery(req.query);

    const [data, count] = await this.userService.getFollowing(userId, filter, authUser?.id);

    return res.status(200).json(
      new ResponseDto('Following fetched', data, {
        count,
        page: filter.page,
        size: filter.size,
      }),
    );
  }
}
