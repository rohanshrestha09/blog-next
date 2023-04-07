import { Router, Request, Response, NextFunction } from 'express';
import auth from './auth';
import user from './user';
import blog from './blog';
import security from './security';
import notification from './notification';
import viewer from '../middleware/viewer';

const router = Router();

router.use(viewer);

router.use('/auth', auth);

router.use('/user', user);

router.use('/blog', blog);

router.use('/security', security);

router.use('/notification', notification);

router.use((err: Error & { status: number }, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;

  const message = err.message || 'Something went wrong';

  res.status(status).json({
    ...err,
    status,
    message,
  });
});

export default router;
