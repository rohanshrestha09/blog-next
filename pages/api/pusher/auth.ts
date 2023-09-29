import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { User } from 'lib/prisma';
import { pusher } from 'lib/pusher';
import { auth } from 'middlewares/auth';
import { errorHandler } from 'utils/exception';

const router = createRouter<NextApiRequest & { auth: User }, NextApiResponse>();

router.use(auth()).post(async (req, res) => {
  const authUser = req.auth;

  const { socket_id: socketId, channel_name: channelName } = req.body;

  const user = {
    user_id: authUser.id,
    user_info: authUser,
  };

  const authResponse = pusher.authorizeChannel(socketId, channelName, user);

  return res.status(201).send(authResponse);
});

export default router.handler({ onError: errorHandler });
