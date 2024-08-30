import { NextApiRequest, NextApiResponse } from 'next';
import { NotificationResponseDto, ResponseDto } from 'server/dtos/response';
import { HttpException } from 'server/exception';
import { INotificationService } from 'server/ports/notification';
import { parseQuery } from 'server/utils/parser';
import { WithAuthRequest } from 'server/utils/types';

export class NotificationController {
  constructor(private readonly notificationService: INotificationService) {}

  async markAllAsRead(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    await this.notificationService.markAllReceiverNotificationsAsRead(authUser?.id);

    return res.status(201).json(new ResponseDto('Notifications updated'));
  }

  async markAsRead(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    const notificationId = req.query?.notificationId;

    if (typeof notificationId !== 'string') throw new HttpException(400, 'Invalid notificationId');

    await this.notificationService.markReceiverNotificationAsRead({
      id: notificationId,
      receiverId: authUser?.id,
    });

    return res.status(201).json(new ResponseDto('Notification updated'));
  }

  async getNotifications(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    const filter = await parseQuery(req.query);

    const [data, count] = await this.notificationService.getReceiverNotifications(
      authUser.id,
      filter,
    );

    const { read, unread } = await this.notificationService.getReceiverNotificationsCount(
      authUser.id,
    );

    return res.status(200).json(
      new NotificationResponseDto('Notifications fetched', data, {
        count,
        read,
        unread,
        page: filter.page,
        size: filter.size,
      }),
    );
  }
}
