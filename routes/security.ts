import { Router } from 'express';
import auth from '../middleware/auth';
import verifyUser from '../middleware/verifyUser';
import verifyPassword from '../middleware/verifyPassword';
import { changePassword, resetLink, resetPassword } from '../controller/security';

const router: Router = Router();

router.post('/security/reset-password', resetLink);

router.post('/security/reset-password/:user/:token', verifyUser, resetPassword);

router.post('/security/change-password', auth, verifyPassword, changePassword);

module.exports = router;
