import { Router } from 'express';
import auth from '../middleware/auth';
import verifyUser from '../middleware/verifyUser';
import verifyPassword from '../middleware/verifyPassword';
import { authHandler, deleteImage, deleteProfile, logout, updateProfile } from '../controller/auth';
import { blogs, bookmarks, followingBlogs } from '../controller/auth/blog';
import { follow, unfollow } from '../controller/auth/follow';
import { followers, following } from '../controller/auth/followers';

const router: Router = Router();

router.use(['/', '/*'], auth);

router.param('user', verifyUser);

router.get('/', authHandler);

router.put('/', verifyPassword, updateProfile);

router.delete('/', verifyPassword, deleteProfile);

router.delete('/image', deleteImage);

router.delete('/logout', logout);

router.post('/:user/follow', follow);

router.delete('/:user/follow', unfollow);

router.get('/followers', followers);

router.get('/following', following);

router.get('/blog', blogs);

router.get('/blog/bookmarks', bookmarks);

router.get('/blog/following', followingBlogs);

export default router;
