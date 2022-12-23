import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { Empty, Modal, Input, Spin, Divider, Skeleton, List } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { isEmpty } from 'lodash';
import InfiniteScroll from 'react-infinite-scroll-component';
import { BiSearch } from 'react-icons/bi';
import { useAuth } from '../../utils/UserAuth';
import UserAxios from '../../api/UserAxios';
import UserSkeleton from './UserSkeleton';
import { setPageSize, setSearch } from '../../store/sortFilterSlice';
import { closeModal } from '../../store/modalSlice';
import { HOME_KEYS, MODAL_KEYS } from '../../constants/reduxKeys';
import { GET_USER_SUGGESTIONS } from '../../constants/queryKeys';

const { USER_SUGGESTIONS_MODAL } = MODAL_KEYS;

const { USER_SUGGESTIONS } = HOME_KEYS;

const UserSuggestions: React.FC = () => {
  const {
    isOpen: { [USER_SUGGESTIONS_MODAL]: isOpen },
  } = useSelector((state: RootState) => state.modal);

  const {
    pageSize: { [USER_SUGGESTIONS]: pageSize },
    search: { [USER_SUGGESTIONS]: search },
  } = useSelector((state: RootState) => state.sortFilter);

  const dispatch = useDispatch();

  const { authUser } = useAuth();

  const userAxios = UserAxios();

  const { data: users, isPreviousData: isLoading } = useQuery({
    queryFn: () => userAxios.getUserSuggestions({ pageSize, search }),
    queryKey: [GET_USER_SUGGESTIONS, { pageSize, search }],
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
              700
            );
          }}
          allowClear
        />

        {isLoading && <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />}
      </span>

      <Divider />

      {isEmpty(users?.data) ? (
        <Empty />
      ) : (
        <InfiniteScroll
          dataLength={users?.data.length ?? 0}
          next={() => dispatch(setPageSize({ key: USER_SUGGESTIONS, pageSize: 10 }))}
          hasMore={users?.data ? users?.data.length < users?.count : false}
          loader={<Skeleton avatar round paragraph={{ rows: 1 }} active />}
        >
          <List
            itemLayout='vertical'
            dataSource={users?.data}
            renderItem={(user) => (
              <UserSkeleton
                key={user._id}
                user={user}
                shouldFollow={!authUser?.following.includes(user._id as never)}
                bioAsDesc
                isModal
              />
            )}
          />
        </InfiniteScroll>
      )}
    </Modal>
  );
};

export default UserSuggestions;
