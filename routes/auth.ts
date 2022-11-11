import { Router } from 'express';
import auth from '../middleware/auth';
import verifyUser from '../middleware/verifyUser';
import verifyPassword from '../middleware/verifyPassword';
import { authHandler, deleteImage, deleteProfile, logout, updateProfile } from '../controller/auth';
import { blogs, bookmarks, followingBlogs } from '../controller/auth/blog';
import { follow, unfollow } from '../controller/auth/follow';
import { followers, following } from '../controller/auth/followers';

const router: Router = Router();

router.use(['/auth', '/auth/*'], auth);

router.param('user', verifyUser);

router.get('/auth', authHandler);

router.put('/auth', verifyPassword, updateProfile);

router.delete('/auth', verifyPassword, deleteProfile);

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
