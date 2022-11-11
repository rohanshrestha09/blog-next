import { Router } from 'express';
import auth from '../middleware/auth';
import validateUser from '../middleware/validateUser';
import validatePassword from '../middleware/validatePassword';
import { authHandler, deleteImage, deleteProfile, logout, updateProfile } from '../controller/auth';
import { blogs, bookmarks, followingBlogs } from '../controller/auth/blog';
import { follow, unfollow } from '../controller/auth/follow';
import { followers, following } from '../controller/auth/followers';

const router: Router = Router();

router.use(['/auth', '/auth/*'], auth);

router.param('user', validateUser);

router.get('/auth', authHandler);

router.put('/auth', validatePassword, updateProfile);

router.delete('/auth', validatePassword, deleteProfile);

router.delete('/auth/image', deleteImage);

router.delete('/auth/logout', logout);

router.post('/auth/:user/follow', follow);

router.delete('/auth/:user/follow', unfollow);

router.get('/auth/followers', followers);

router.get('/auth/following', following);

router.get('/auth/blog', blogs);

router.get('/auth/blog/bookmarks', bookmarks);

router.get('/auth/blog/following', followingBlogs);

module.exports = router;
