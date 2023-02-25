import { Router } from 'express';
import { markAllAsRead, markAsRead, notifications } from '../controller/notification';
import auth from '../middleware/auth';

const router: Router = Router();

router.use(['/', '/*'], auth);

router.get('/', notifications);

router.put('/:notification', markAsRead);

router.put('/', markAllAsRead);

export default router;
