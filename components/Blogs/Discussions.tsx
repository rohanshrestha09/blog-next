import { NextRouter, useRouter } from 'next/router';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { Modal } from 'antd';
import { closeModal } from '../../store/modalSlice';
import BlogAxios from '../../apiAxios/blogAxios';
import { BLOG_KEYS, MODAL_KEYS } from '../../constants/reduxKeys';
import type { RootState } from '../../store';
import { GET_COMMENTS } from '../../constants/queryKeys';

const { DISCUSSIONS_MODAL } = MODAL_KEYS;

const { COMMENTS } = BLOG_KEYS;

const Discussions: React.FC = () => {
  const {
    query: { blogId },
  }: NextRouter = useRouter();

  const {
    isOpen: { [DISCUSSIONS_MODAL]: isOpen },
  } = useSelector((state: RootState) => state.modal);

  const {
    pageSize: { [COMMENTS]: pageSize },
  } = useSelector((state: RootState) => state.sortFilter, shallowEqual);

  const dispatch = useDispatch();

  const blogAxios = new BlogAxios();

  const { data: comments } = useQuery({
    queryFn: () => blogAxios.getComments({ id: String(blogId), pageSize }),
    queryKey: [GET_COMMENTS, blogId, pageSize],
  });

  return (
    <Modal
      className='font-sans'
      open={isOpen}
      onCancel={() => dispatch(closeModal({ key: DISCUSSIONS_MODAL }))}
      footer={null}
    >
      <p>some contents...</p>
      <p>some contents...</p>
      <p>some contents...</p>
    </Modal>
  );
};

export default Discussions;
