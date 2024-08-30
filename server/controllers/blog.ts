import { NextApiRequest, NextApiResponse } from 'next';
import { ResponseDto } from 'server/dtos/response';
import { WithAuthRequest } from 'server/utils/types';
import { parseQuery } from 'server/utils/parser';
import { IBlogService } from 'server/ports/blog';

export class BlogController {
  constructor(private readonly blogService: IBlogService) {}

  async getBlogSuggestions(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    const filter = await parseQuery(req.query);

    const [data, count] = await this.blogService.getBlogSuggestions(filter, authUser?.id);

    return res.status(200).json(
      new ResponseDto('Blog suggestions fetched', data, {
        count,
        page: filter.page,
        size: filter.size,
      }),
    );
  }
}
