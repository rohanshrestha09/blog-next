import { Router } from 'express';
import { markAllAsRead, markAsRead, notifications } from '../controller/notification';
import auth from '../middleware/auth';

const router: Router = Router();

router.get('/notification', auth, notifications);

router.put('/notification/:notification', markAsRead);

router.put('/notification', markAllAsRead);

module.exports = router;
