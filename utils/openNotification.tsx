import { notification, Space } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { AiFillInfoCircle } from 'react-icons/ai';
import { MdOutlineTaskAlt } from 'react-icons/md';

export const openSuccessNotification = (message: string): void => {
  notification.open({
    className: 'rounded-lg',
    closeIcon: <CloseOutlined className='text-white' />,
    message: (
      <Space>
        <MdOutlineTaskAlt className='text-white' size={23} />

        <span className='text-white text-base'>{message}</span>
      </Space>
    ),
    style: {
      backgroundColor: '#38A169',
    },
  });
};

export const openErrorNotification = (message: string): void => {
  notification.open({
    className: 'rounded-lg',
    closeIcon: <CloseOutlined className='text-white' />,
    message: (
      <Space>
        <AiFillInfoCircle className='text-white' size={23} />

        <span className='text-white text-base'>{message}</span>
      </Space>
    ),
    style: {
      backgroundColor: '#E53E3E',
    },
  });
};
