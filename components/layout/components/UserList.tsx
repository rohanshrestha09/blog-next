import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { Modal, Input, Spin, Divider, Skeleton, List } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroll-component';
import { BiSearch } from 'react-icons/bi';
import UserSkeleton from 'components/common/UserSkeleton';
import { setSize, setSearch } from 'store/sortFilterSlice';
import { closeModal } from 'store/modalSlice';
import { getUserSuggestions } from 'request/user';
import { queryKeys } from 'utils';
import { HOME_KEYS, MODAL_KEYS } from 'constants/reduxKeys';
import { USER } from 'constants/queryKeys';

const { USER_SUGGESTIONS_MODAL } = MODAL_KEYS;

const { USER_SUGGESTIONS } = HOME_KEYS;

const UserList: React.FC = () => {
  const {
    isOpen: { [USER_SUGGESTIONS_MODAL]: isOpen },
  } = useSelector((state: RootState) => state.modal);

  const {
    size: { [USER_SUGGESTIONS]: size },
    search: { [USER_SUGGESTIONS]: search },
  } = useSelector((state: RootState) => state.sortFilter);

  const dispatch = useDispatch();

  const { data: users, isPreviousData: isLoading } = useQuery({
    queryFn: () => getUserSuggestions({ size, search }),
    queryKey: queryKeys(USER).list({ size, search }),
    keepPreviousData: true,
  });

  let timeout: any = 0;

  return (
    <Modal
      destroyOnClose
      className='font-sans'
      open={isOpen}
      onCancel={() => dispatch(closeModal({ key: USER_SUGGESTIONS_MODAL }))}
      footer={null}
    >
      <span className='w-full flex gap-3 items-center pt-7'>
        <Input
          className='rounded-lg py-[5px] bg-black'
          defaultValue={search}
          placeholder='Search users...'
          prefix={<BiSearch />}
          onChange={({ target: { value } }) => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(
              () => dispatch(setSearch({ key: USER_SUGGESTIONS, search: value })),
              700,
            );
          }}
          allowClear
        />

        {isLoading && <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />}
      </span>

      <Divider />

      <InfiniteScroll
        dataLength={users?.result?.length ?? 0}
        next={() => dispatch(setSize({ key: USER_SUGGESTIONS, size: 10 }))}
        hasMore={users?.result ? users?.result?.length < users?.count : false}
        loader={<Skeleton avatar round paragraph={{ rows: 1 }} active />}
      >
        <List
          itemLayout='vertical'
          dataSource={users?.result}
          renderItem={(user) => (
            <UserSkeleton key={user.id} user={user} descriptionMode='bio' isModal />
          )}
        />
      </InfiniteScroll>
    </Modal>
  );
};

export default UserList;
