import { Router } from 'express';
import validateUser from '../middleware/validateUser';
import { login, register, suggestions, user } from '../controller/user';
import { blog } from '../controller/user/blog';
import { followers, following } from '../controller/user/followers';

const router: Router = Router();

router.post('/user/register', register);

router.post('/user/login', login);

router.get('/user/suggestions', suggestions);

router.param('user', validateUser);

router.get('/user/:user', user);

router.get('/user/:user/blog', blog);

router.get('/user/:user/followers', followers);

router.get('/user/:user/following', following);

module.exports = router;
