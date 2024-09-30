import { NextApiRequest, NextApiResponse } from 'next';
import { createCommentDto } from 'server/dtos/comment';
import { ResponseDto } from 'server/dtos/response';
import { HttpException } from 'server/exception';
import { ICommentService } from 'server/ports/comment';
import { WithAuthRequest } from 'server/utils/types';

export class CommentController {
  constructor(private readonly commentService: ICommentService) {}

  async createComment(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    const data = await createCommentDto.validateAsync(req.body);

    await this.commentService.createComment(authUser, data);

    return res.status(201).json(new ResponseDto('Comment created'));
  }

  async likeComment(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    const { commentId } = req.query;

    if (!commentId || Array.isArray(commentId)) throw new HttpException(400, 'Invalid commentId');

    await this.commentService.likeComment(authUser, Number(commentId));

    return res.status(201).json(new ResponseDto('Comment liked'));
  }

  async unlikeComment(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    const { commentId } = req.query;

    if (!commentId || Array.isArray(commentId)) throw new HttpException(400, 'Invalid commentId');

    await this.commentService.unlikeComment(authUser, Number(commentId));

    return res.status(201).json(new ResponseDto('Comment unliked'));
  }

  async deleteComment(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    const { commentId } = req.query;

    if (!commentId || Array.isArray(commentId)) throw new HttpException(400, 'Invalid commentId');

    await this.commentService.deleteComment(authUser, Number(commentId));

    return res.status(201).json(new ResponseDto('Comment deleted'));
  }
}
