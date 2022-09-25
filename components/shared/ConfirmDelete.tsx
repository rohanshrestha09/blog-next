import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, Space, Spin } from 'antd';
import { closeDeleteModal } from '../../store/deleteModalSlice';
import DeleteIcon from './DeleteIcon';
import type { RootState } from '../../store';

interface Props {
  isLoading: boolean;
  deleteMutation: () => void;
}

const ConfirmDelete: React.FC<Props> = ({ isLoading, deleteMutation }) => {
  const { isOpen } = useSelector((state: RootState) => state.deleteModal);

  const dispatch = useDispatch();

  return (
    <Modal
      className='font-sans'
      open={isOpen}
      footer={null}
      onCancel={() => dispatch(closeDeleteModal())}
      zIndex={2000}
    >
      <div className='flex flex-col items-center'>
        {isLoading ? <Spin className='my-4' size='large' /> : <DeleteIcon />}

        <h2 className='my-5 text-lg font-medium'>Confirm Delete</h2>
        <div className=' text-center w-80 text-sm text-gray-500'>
          This is a permanent action and cannot be undone. Are you sure you want to delete this
          item?
        </div>

        <Space className='mt-8'>
          <Button
            className='rounded-lg h-10 uppercase'
            disabled={isLoading}
            onClick={() => dispatch(closeDeleteModal())}
          >
            Cancel
          </Button>
          <Button
            className='rounded-lg h-10 uppercase'
            disabled={isLoading}
            type='primary'
            onClick={deleteMutation}
            danger
          >
            Yes, Delete
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default ConfirmDelete;
