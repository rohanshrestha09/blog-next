import { Router } from 'express';
import auth from '../middleware/auth';
import verifyBlog from '../middleware/verifyBlog';
import { blog, blogs, suggestions, postBlog, updateBlog, deleteBlog } from '../controller/blog';
import { genre } from '../controller/blog/genre';
import { publish, unpublish } from '../controller/blog/publish';
import { likes, like, unlike } from '../controller/blog/like';
import { bookmark, unbookmark } from '../controller/blog/bookmark';
import { comments, comment, uncomment } from '../controller/blog/comment';
import { likeComment, unlikeComment } from '../controller/blog/comment/like';

const router: Router = Router();

router.get('/blog', blogs);

router.get('/blog/suggestions', suggestions);

router.get('/blog/genre', genre);

router.param('blog', verifyBlog);

router.get('/blog/:blog', blog);

router.get('/blog/:blog/like', likes);

router.get('/blog/:blog/comment', comments);

router.use(['/blog', '/blog/*'], auth);

router.post('/blog', postBlog);

router.put('/blog/:blog', updateBlog);

router.delete('/blog/:blog', deleteBlog);

router.post('/blog/:blog/publish', publish);

router.delete('/blog/:blog/publish', unpublish);

router.post('/blog/:blog/like', like);

router.delete('/blog/:blog/like', unlike);

router.post('/blog/:blog/comment', comment);

router.delete('/blog/:blog/comment', uncomment);

router.post('/blog/:blog/bookmark', bookmark);

router.delete('/blog/:blog/bookmark', unbookmark);

router.post('/blog/:blog/comment/like', likeComment);

router.delete('/blog/:blog/comment/like', unlikeComment);

module.exports = router;
