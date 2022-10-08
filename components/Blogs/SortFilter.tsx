import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { Radio, Space, Divider, Input, Dropdown, Button, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { BiSearch } from 'react-icons/bi';
import { FaSort } from 'react-icons/fa';
import BlogAxios from '../../apiAxios/blogAxios';
import { setSearch, setGenre, setSort, setSortOrder } from '../../store/sortFilterSlice';
import { SORT_FILTER_KEYS, SORT_ORDER, SORT_TYPE } from '../../constants/reduxKeys';
import { GET_GENRE } from '../../constants/queryKeys';
import { RootState } from '../../store';

interface Props {
  sortFilterKey: SORT_FILTER_KEYS;
  isLoading: boolean;
}

const { HOME_SORT, AUTH_PROFILE_SORT } = SORT_FILTER_KEYS;

const { LIKES, CREATED_AT, UPDATED_AT } = SORT_TYPE;

const { ASCENDING, DESCENDING } = SORT_ORDER;

const SortFilter: React.FC<Props> = ({ sortFilterKey: key, isLoading }) => {
  const { search, genre, sort, sortOrder } = useSelector(
    (state: RootState) => state.sortFilter,
    shallowEqual
  );

  const dispatch = useDispatch();

  const { data: genreSelector } = useQuery({
    queryFn: () => new BlogAxios().getGenre(),
    queryKey: [GET_GENRE],
  });

  let timeout: any = 0;

  const getSortVal = (sort: SORT_TYPE) => {
    switch (sort) {
      case LIKES:
        return 'Most Liked';

      case CREATED_AT:
        return 'Latest/New';

      case UPDATED_AT:
        return 'Last Edited';
    }
  };

  const menuSort = (key === HOME_SORT || key === AUTH_PROFILE_SORT) && (
    <span className='flex flex-col items-center gap-2.5 bg-[#1F1F1F] rounded-lg p-3'>
      <Radio.Group
        onChange={({ target: { value: sort } }) => dispatch(setSort({ key, sort }))}
        value={sort[key]}
      >
        <Space direction='vertical'>
          <Radio value={LIKES}>{getSortVal(LIKES)}</Radio>
          <Radio value={CREATED_AT}>{getSortVal(CREATED_AT)}</Radio>
          {key === AUTH_PROFILE_SORT && <Radio value={UPDATED_AT}>{getSortVal(UPDATED_AT)}</Radio>}
        </Space>
      </Radio.Group>

      {key === AUTH_PROFILE_SORT && (
        <>
          <Divider className='my-0' />

          <Radio.Group
            onChange={({ target: { value: sortOrder } }) =>
              dispatch(setSortOrder({ key, sortOrder }))
            }
            value={sortOrder[key]}
          >
            <Space direction='vertical'>
              <Radio value={ASCENDING}>Ascending</Radio>
              <Radio value={DESCENDING}>Descending</Radio>
            </Space>
          </Radio.Group>
        </>
      )}
    </span>
  );

  return (
    <>
      <span className='w-full flex gap-3 items-center'>
        <Input
          className='rounded-lg py-[5px] bg-black'
          defaultValue={search[key]}
          placeholder='Search title...'
          prefix={<BiSearch />}
          onChange={({ target: { value } }) => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => dispatch(setSearch({ key, search: value })), 700);
          }}
        />

        {(key === HOME_SORT || key === AUTH_PROFILE_SORT) && (
          <Dropdown overlay={menuSort || <></>}>
            <Button className='w-[8.5rem] btn-secondary rounded-lg text-sm flex items-center justify-between px-2'>
              <span>{sort[key] && getSortVal(sort[key])}</span>
              <FaSort />
            </Button>
          </Dropdown>
        )}

        {isLoading && <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />}
      </span>

      <Divider />

      <span className='w-full flex gap-2 overflow-x-hidden'>
        {genreSelector &&
          genreSelector.map((val) => (
            <Button
              key={val}
              className={`rounded-full ${
                genre[key].includes(val) && 'text-[#165996] border-[#165996]'
              } bg-transparent focus:border-current`}
              onClick={(e) => {
                dispatch(setGenre({ key, genre: val }));
                e.currentTarget.blur();
              }}
            >
              {val}
            </Button>
          ))}
      </span>

      <Divider />
    </>
  );
};

export default SortFilter;
