import { useRouter } from 'next/router';
import Image from 'next/image';
import { Fragment, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { List, Comment, Avatar, Tooltip } from 'antd';
import moment from 'moment';
import { LikeFilled, LikeOutlined } from '@ant-design/icons';
import { useAuth } from 'auth';
import ConfirmDelete from 'components/common/ConfirmDelete';
import { useModalStore } from 'store/hooks';
import { deleteComment, likeComment, unlikeComment } from 'request/blog';
import { errorNotification, successNotification } from 'utils/notification';
import { queryKeys } from 'utils';
import { MODALS } from 'constants/reduxKeys';
import { BLOG, COMMENT } from 'constants/queryKeys';
import { Comment as CommentSchema } from 'interface/models';

interface Props {
  data: CommentSchema[];
  count: number;
}

export const DiscussionList: React.FC<Props> = ({ data, count }) => {
  const { push } = useRouter();

  const queryClient = useQueryClient();

  const { authUser } = useAuth();

  const { openModal: openDeleteModal, closeModal: closeDeleteModal } = useModalStore(
    MODALS.DELETE_MODAL,
  );

  const [comment, setComment] = useState<{
    id: number | null;
    slug: string | null;
  }>({ id: null, slug: null });

  const [isSSR, setIsSSR] = useState(true);

  const handleLikeComment = useMutation(likeComment, {
    onSuccess: () => queryClient.refetchQueries(queryKeys(COMMENT).all),
    onError: errorNotification,
  });

  const handleUnlikeComment = useMutation(unlikeComment, {
    onSuccess: () => queryClient.refetchQueries(queryKeys(COMMENT).all),
    onError: errorNotification,
  });

  const handleDeleteComment = useMutation(deleteComment, {
    onSuccess: (res) => {
      successNotification(res.message);
      queryClient.refetchQueries(queryKeys(COMMENT).all);
      queryClient.refetchQueries(queryKeys(BLOG).detail(comment.slug as string));
      setComment({ id: null, slug: null });
      closeDeleteModal();
    },
    onError: errorNotification,
  });

  useEffect(() => {
    setIsSSR(false);
  }, []);

  return (
    <Fragment>
      <List
        header={`${count} discussions`}
        itemLayout='vertical'
        dataSource={data}
        renderItem={(comment) => (
          <li>
            <Comment
              author={
                <span
                  className='cursor-pointer'
                  onClick={() => push(`/profile/${comment?.userId}`)}
                >
                  {comment?.user?.name}
                </span>
              }
              avatar={
                comment?.user?.image ? (
                  <Avatar
                    src={
                      <Image
                        alt=''
                        className='object-cover'
                        src={comment?.user?.image}
                        layout='fill'
                        priority
                      />
                    }
                  />
                ) : (
                  <Avatar className='bg-[#1890ff]'>{comment?.user?.name[0]}</Avatar>
                )
              }
              actions={[
                <Tooltip key='comment-basic-like' title='Like'>
                  <span
                    onClick={() =>
                      comment?.hasLiked
                        ? handleUnlikeComment.mutate({
                            commentId: comment?.id,
                            slug: comment?.blog?.slug,
                          })
                        : handleLikeComment.mutate({
                            commentId: comment?.id,
                            slug: comment?.blog?.slug,
                          })
                    }
                  >
                    {comment?.hasLiked ? <LikeFilled /> : <LikeOutlined />}
                    <span className='pl-2'>{comment?._count?.likedBy}</span>
                  </span>
                </Tooltip>,
                authUser?.id === comment?.userId && (
                  <span
                    key={comment?.id}
                    onClick={() => {
                      setComment({ id: comment?.id, slug: comment?.blog?.slug });
                      openDeleteModal();
                    }}
                  >
                    Delete
                  </span>
                ),
              ]}
              content={comment?.content}
              datetime={
                <Tooltip title={moment(comment?.createdAt).format('lll')}>
                  {!isSSR ? (
                    <span>{moment(comment?.createdAt).fromNow()}</span>
                  ) : (
                    <span>{moment(comment?.createdAt).fromNow()}</span>
                  )}
                </Tooltip>
              }
            />
          </li>
        )}
      />

      <ConfirmDelete
        isLoading={handleDeleteComment.isLoading}
        deleteMutation={() =>
          comment.slug &&
          comment.id &&
          handleDeleteComment.mutate({ slug: comment.slug, commentId: comment.id })
        }
      />
    </Fragment>
  );
};
