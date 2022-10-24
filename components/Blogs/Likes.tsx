import { NextRouter, useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { Empty, Modal } from 'antd';
import { isEmpty } from 'lodash';
import { useAuth } from '../../utils/UserAuth';
import BlogAxios from '../../apiAxios/blogAxios';
import UserSkeleton from '../shared/UserSkeleton';
import { closeModal } from '../../store/modalSlice';
import { BLOG_KEYS, MODAL_KEYS } from '../../constants/reduxKeys';
import { GET_LIKERS } from '../../constants/queryKeys';
import type { RootState } from '../../store';

const { LIKERS_MODAL } = MODAL_KEYS;

const { LIKES } = BLOG_KEYS;

const Likes: React.FC = () => {
  const {
    query: { blogId },
  }: NextRouter = useRouter();

  const {
    isOpen: { [LIKERS_MODAL]: isOpen },
  } = useSelector((state: RootState) => state.modal);

  const {
    pageSize: { [LIKES]: pageSize },
  } = useSelector((state: RootState) => state.sortFilter);

  const dispatch = useDispatch();

  const { authUser } = useAuth();

  const blogAxios = new BlogAxios();

  const { data: likers } = useQuery({
    queryFn: () => blogAxios.getLikers({ id: String(blogId), pageSize }),
    queryKey: [GET_LIKERS, blogId, pageSize],
  });

  return (
    <Modal
      className='font-sans'
      open={isOpen}
      onCancel={() => dispatch(closeModal({ key: LIKERS_MODAL }))}
      footer={null}
    >
      {isEmpty(likers?.data) ? (
        <Empty />
      ) : (
        likers?.data.map((user) => (
          <UserSkeleton
            key={user._id}
            user={user}
            shouldFollow={!authUser.following.includes(user._id as never)}
          />
        ))
      )}
    </Modal>
  );
};

export default Likes;
