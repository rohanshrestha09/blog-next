import { Router } from 'express';
import auth from '../middleware/auth';
import verifyBlog from '../middleware/verifyBlog';
import authorizeBlog from '../middleware/authorizeBlog';
import { blog, blogs, suggestions, postBlog, updateBlog, deleteBlog } from '../controller/blog';
import { genre } from '../controller/blog/genre';
import { publish, unpublish } from '../controller/blog/publish';
import { likes, like, unlike } from '../controller/blog/like';
import { bookmark, unbookmark } from '../controller/blog/bookmark';
import { comments, comment, uncomment } from '../controller/blog/comment';
import { likeComment, unlikeComment } from '../controller/blog/comment/like';

const router: Router = Router();

router.get('/', blogs);

router.get('/suggestions', suggestions);

router.get('/genre', genre);

router.param('blog', verifyBlog);

router.get('/:blog', blog);

router.get('/:blog/like', likes);

router.get('/:blog/comment', comments);

router.use(['/', '/*'], auth);

router.post('/', postBlog);

router.put('/:blog', authorizeBlog, updateBlog);

router.delete('/:blog', authorizeBlog, deleteBlog);

router.post('/:blog/publish', authorizeBlog, publish);

router.delete('/:blog/publish', authorizeBlog, unpublish);

router.post('/:blog/like', like);

router.delete('/:blog/like', unlike);

router.post('/:blog/comment', comment);

router.delete('/:blog/comment', uncomment);

router.post('/:blog/bookmark', bookmark);

router.delete('/:blog/bookmark', unbookmark);

router.post('/:blog/comment/like', likeComment);

router.delete('/:blog/comment/like', unlikeComment);

export default router;
