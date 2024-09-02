import { NextApiRequest, NextApiResponse } from 'next';
import { HttpException } from 'server/exception';
import { pusher } from 'server/lib/pusher';
import { WithAuthRequest } from 'server/utils/types';

export class PusherController {
  async authorizeChannel(req: WithAuthRequest<NextApiRequest>, res: NextApiResponse) {
    const authUser = req.authUser;

    if (!authUser) throw new HttpException(401, 'Unauthorized');

    const { socket_id: socketId, channel_name: channelName } = req.body;

    const user = {
      user_id: authUser.id,
      user_info: authUser,
    };

    const authResponse = pusher.authorizeChannel(socketId, channelName, user);

    return res.status(201).send(authResponse);
  }
}
