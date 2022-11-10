import { Router } from 'express';
import auth from '../middleware/auth';
import validateUser from '../middleware/validateUser';
import validatePassword from '../middleware/validatePassword';
import { changePassword, resetLink, resetPassword } from '../controller/security';

const router: Router = Router();

router.get('/security/reset-password', resetLink);

router.post('/security/reset-password/:user/:token', validateUser, resetPassword);

router.post('/security/change-password', auth, validatePassword, changePassword);

module.exports = router;
