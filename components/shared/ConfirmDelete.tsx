import { Button, Space, Spin } from 'antd';
import DeleteIcon from './DeleteIcon';

interface Props {
  deleteModalRef: React.RefObject<HTMLLabelElement>;
  isLoading: boolean;
  deleteMutation: () => void;
}

const ConfirmDelete: React.FC<Props> = ({ deleteModalRef, isLoading, deleteMutation }) => {
  return (
    <>
      <input className='modal-toggle' id='deleteModal' type='checkbox' />
      <label htmlFor='deleteModal' className='modal' data-theme='winter'>
        <label className='modal-box'>
          <label
            ref={deleteModalRef}
            className='btn btn-sm btn-circle absolute right-2 top-2'
            htmlFor='deleteModal'
          >
            ✕
          </label>

          <div className='flex flex-col items-center'>
            {isLoading ? <Spin className='my-4' size='large' /> : <DeleteIcon />}

            <h2 className='my-5 text-lg font-medium'>Confirm Delete</h2>
            <div className=' text-center w-80 text-sm text-gray-500'>
              This is a permanent action and cannot be undone. Are you sure you want to delete this
              item?
            </div>

            <Space className='mt-8'>
              <Button
                className='rounded-lg'
                disabled={isLoading}
                onClick={() => deleteModalRef.current?.click()}
              >
                Cancel
              </Button>
              <Button
                className='rounded-lg'
                disabled={isLoading}
                type='primary'
                onClick={deleteMutation}
                danger
              >
                Yes, Delete
              </Button>
            </Space>
          </div>
        </label>
      </label>
    </>
  );
};

export default ConfirmDelete;
