import { useQuery } from '@tanstack/react-query';
import { Modal, Input, Spin, Divider, Skeleton, List } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroll-component';
import { BiSearch } from 'react-icons/bi';
import UserSkeleton from 'components/common/UserSkeleton';
import { useFilterStore } from 'store/hooks';
import { getUserSuggestions } from 'request/user';
import { useModalStore } from 'store/hooks';
import { queryKeys } from 'utils';
import { FILTERS, MODALS } from 'constants/reduxKeys';
import { USER } from 'constants/queryKeys';

const UserList: React.FC = () => {
  const { isOpen: isUserSuggestionModalOpen, closeModal: closeUserSuggestionModal } = useModalStore(
    MODALS.USER_SUGGESTION_MODAL,
  );

  const { size, search, setSize, setSearch } = useFilterStore(FILTERS.USER_SUGGESTION_FILTER);

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
      open={isUserSuggestionModalOpen}
      onCancel={closeUserSuggestionModal}
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
            timeout = setTimeout(() => setSearch(value), 700);
          }}
          allowClear
        />

        {isLoading && <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />}
      </span>

      <Divider />

      <InfiniteScroll
        dataLength={users?.result?.length ?? 0}
        next={() => setSize(10)}
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
