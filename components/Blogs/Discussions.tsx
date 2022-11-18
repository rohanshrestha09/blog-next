import { NextRouter, useRouter } from 'next/router';
import Image from 'next/image';
import { useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal, List, Comment, Tooltip, Avatar, Form, Input } from 'antd';
import { LikeFilled, LikeOutlined } from '@ant-design/icons';
import { useAuth } from '../../utils/UserAuth';
import BlogAxios from '../../apiAxios/blogAxios';
import { openModal, closeModal } from '../../store/modalSlice';
import { errorNotification, successNotification } from '../../utils/notification';
import { BLOG_KEYS, MODAL_KEYS } from '../../constants/reduxKeys';
import { GET_BLOG, GET_COMMENTS } from '../../constants/queryKeys';
import type { RootState } from '../../store';
import ConfirmDelete from '../shared/ConfirmDelete';
import moment from 'moment';

const { DISCUSSIONS_MODAL, DELETE_MODAL } = MODAL_KEYS;

const { COMMENTS } = BLOG_KEYS;

const Discussions: React.FC = () => {
  const {
    query: { blogId },
    push,
  }: NextRouter = useRouter();

  const [commentId, setCommentId] = useState<string>('');

  const queryClient = useQueryClient();

  const [form] = Form.useForm();

  const { authUser } = useAuth();

  const {
    isOpen: { [DISCUSSIONS_MODAL]: isOpen },
  } = useSelector((state: RootState) => state.modal);

  const {
    pageSize: { [COMMENTS]: pageSize },
  } = useSelector((state: RootState) => state.sortFilter, shallowEqual);

  const dispatch = useDispatch();

  const blogAxios = new BlogAxios();

  const { data: comments, refetch } = useQuery({
    queryFn: () => blogAxios.getComments({ id: String(blogId), pageSize }),
    queryKey: [GET_COMMENTS, blogId, { pageSize }],
  });

  const handlePostComment = useMutation(
    ({ id, data }: { id: string; data: { comment: string } }) =>
      blogAxios.postComment({ id, data }),
    {
      onSuccess: (res) => {
        successNotification(res.message);
        form.resetFields();
        refetch();
        queryClient.refetchQueries([GET_BLOG, String(blogId)]);
      },
      onError: (err: Error) => errorNotification(err),
    }
  );

  const handleDeleteComment = useMutation(
    ({ blogId, commentId }: { blogId: string; commentId: string }) =>
      blogAxios.deleteComment({ blogId, commentId }),
    {
      onSuccess: (res) => {
        successNotification(res.message);
        refetch();
        queryClient.refetchQueries([GET_BLOG, String(blogId)]);
        setCommentId('');
        dispatch(closeModal({ key: DELETE_MODAL }));
      },
      onError: (err: Error) => errorNotification(err),
    }
  );

  const handleLikeComment = useMutation(
    ({
      blogId,
      commentId,
      shouldLike,
    }: {
      blogId: string;
      commentId: string;
      shouldLike: boolean;
    }) => blogAxios.likeComment({ blogId, commentId, shouldLike }),
    {
      onSuccess: () => refetch(),
      onError: (err: Error) => errorNotification(err),
    }
  );

  return (
    <Modal
      className='font-sans'
      open={isOpen}
      onCancel={() => {
        dispatch(closeModal({ key: DISCUSSIONS_MODAL }));
        form.resetFields();
      }}
      footer={null}
    >
      {authUser && (
        <Comment
          className='mt-3'
          avatar={
            authUser.image ? (
              <Avatar src={<Image alt='' src={authUser.image} layout='fill' />} />
            ) : (
              <Avatar className='bg-[#1890ff]'>{authUser.fullname[0]}</Avatar>
            )
          }
          content={
            <Form form={form} requiredMark={false}>
              <Form.Item
                className='mb-0'
                name='comment'
                rules={[{ required: true, message: 'Write something' }]}
              >
                <Input.TextArea
                  className='rounded-lg py-2'
                  placeholder='Write a comment...'
                  onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                  onPressEnter={async () =>
                    form
                      .validateFields()
                      .then((values) =>
                        handlePostComment.mutate({ id: String(blogId), data: values })
                      )
                  }
                  autoSize
                />
              </Form.Item>
            </Form>
          }
        />
      )}

      {comments && (
        <List
          header={`${comments.commentsCount} discussions`}
          itemLayout='horizontal'
          dataSource={comments.data}
          renderItem={({ _id: commentId, user, comment, likesCount, likers, createdAt }) => (
            <li>
              <Comment
                author={
                  <span className='cursor-pointer' onClick={() => push(`/profile/${user._id}`)}>
                    {user.fullname}
                  </span>
                }
                avatar={user.image}
                actions={[
                  <Tooltip key='comment-basic-like' title='Like'>
                    <span
                      className='text-xs flex items-center gap-2'
                      onClick={() =>
                        handleLikeComment.mutate({
                          blogId: String(blogId),
                          commentId,
                          shouldLike: !likers.includes(authUser?._id as never),
                        })
                      }
                    >
                      {likers.includes(authUser?._id as never) ? <LikeFilled /> : <LikeOutlined />}
                      <span>{likesCount}</span>
                    </span>
                  </Tooltip>,
                  authUser?._id === user._id && (
                    <span
                      key={commentId}
                      onClick={() => {
                        setCommentId(commentId);
                        dispatch(openModal({ key: DELETE_MODAL }));
                      }}
                    >
                      Delete
                    </span>
                  ),
                ]}
                content={comment}
                datetime={
                  <Tooltip title={moment(createdAt).format('lll')}>
                    <span>{moment(createdAt).fromNow()}</span>
                  </Tooltip>
                }
              />
            </li>
          )}
        />
      )}

      <ConfirmDelete
        isLoading={handleDeleteComment.isLoading}
        deleteMutation={() => handleDeleteComment.mutate({ blogId: String(blogId), commentId })}
      />
    </Modal>
  );
};

export default Discussions;
