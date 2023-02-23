import { Router } from 'express';
import verifyUser from '../middleware/verifyUser';
import verifyEmail from '../middleware/verifyEmail';
import { login, register, suggestions, user } from '../controller/user';
import { blog } from '../controller/user/blog';
import { followers, following } from '../controller/user/followers';

const router: Router = Router();

router.post('/register', verifyEmail, register);

router.post('/login', login);

router.get('/suggestions', suggestions);

router.param('user', verifyUser);

router.get('/:user', user);

router.get('/:user/blog', blog);

router.get('/:user/followers', followers);

router.get('/:user/following', following);

export default router;
