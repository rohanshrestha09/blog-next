import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { Radio, Space, Divider, Input, Dropdown, Button, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { BiSearch } from 'react-icons/bi';
import { FaSort } from 'react-icons/fa';
import BlogAxios from '../../apiAxios/blogAxios';
import { SORT_ORDER, SORT_TYPE } from '../../constants/reduxKeys';
import { GET_GENRE } from '../../constants/queryKeys';

interface Props {
  hasSort?: boolean;
  sort?: SORT_TYPE;
  search: string;
  sortOrder?: SORT_ORDER;
  isLoading: boolean;
  setSort?: any;
  setSearch: any;
  setSortOrder?: any;
}

const { LIKES, CREATED_AT, UPDATED_AT } = SORT_TYPE;

const { ASCENDING, DESCENDING } = SORT_ORDER;

const SearchFilter: React.FC<Props> = ({
  hasSort,
  sort,
  search,
  sortOrder,
  setSort,
  setSearch,
  setSortOrder,
  isLoading,
}) => {
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

  const menuSort = (
    <span className='flex flex-col items-center gap-2.5 bg-[#1F1F1F] rounded-lg p-3'>
      <Radio.Group
        onChange={({ target: { value: sort } }) => dispatch(setSort({ sort }))}
        value={sort}
      >
        <Space direction='vertical'>
          <Radio value={LIKES}>{getSortVal(LIKES)}</Radio>
          <Radio value={CREATED_AT}>{getSortVal(CREATED_AT)}</Radio>
          <Radio value={UPDATED_AT}>{getSortVal(UPDATED_AT)}</Radio>
        </Space>
      </Radio.Group>

      <Divider className='my-0' />

      <Radio.Group
        onChange={({ target: { value: sortOrder } }) => dispatch(setSortOrder({ sortOrder }))}
        value={sortOrder}
      >
        <Space direction='vertical'>
          <Radio value={ASCENDING}>Ascending</Radio>
          <Radio value={DESCENDING}>Descending</Radio>
        </Space>
      </Radio.Group>
    </span>
  );

  return (
    <>
      <span className='w-full flex gap-3 items-center'>
        <Input
          className='rounded-lg py-[5px] bg-black'
          defaultValue={search}
          placeholder='Search title...'
          prefix={<BiSearch />}
          onChange={({ target: { value } }) => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => dispatch(setSearch({ search: value })), 700);
          }}
        />

        {hasSort && (
          <Dropdown overlay={menuSort}>
            <Button className='w-[8.5rem] !bg-gray-200 border-gray-200 !text-black rounded-lg text-sm flex items-center justify-between px-2'>
              <span>{sort && getSortVal(sort)}</span>
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
            <Button key={val} className={`rounded-full`}>
              {val}
            </Button>
          ))}
      </span>

      <Divider />
    </>
  );
};

export default SearchFilter;
