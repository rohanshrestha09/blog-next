import { Router } from 'express';
import auth from '../middleware/auth';
import verifyUser from '../middleware/verifyUser';
import verifyPassword from '../middleware/verifyPassword';
import { changePassword, resetLink, resetPassword } from '../controller/security';

const router: Router = Router();

router.post('/reset-password', resetLink);

router.post('/reset-password/:user/:token', verifyUser, resetPassword);

router.post('/change-password', auth, verifyPassword, changePassword);

export default router;
