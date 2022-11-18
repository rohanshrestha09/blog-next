import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { Radio, Space, Divider, Input, Dropdown, Button, Spin } from 'antd';
import { LoadingOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { BiSearch } from 'react-icons/bi';
import { FaSort } from 'react-icons/fa';
import BlogAxios from '../../api/BlogAxios';
import { setSearch, setGenre, setSort, setSortOrder } from '../../store/sortFilterSlice';
import { SORT_FILTER_KEYS, SORT_ORDER, SORT_TYPE } from '../../constants/reduxKeys';
import { GET_GENRE } from '../../constants/queryKeys';
import { RootState } from '../../store';
import { useRef, useState } from 'react';

interface Props {
  sortFilterKey: any;
  isLoading: boolean;
  hasSort?: boolean;
  hasSortOrder?: boolean;
}

const { LIKES, CREATED_AT } = SORT_TYPE;

const { ASCENDING, DESCENDING } = SORT_ORDER;

const SortFilter: React.FC<Props> = ({ sortFilterKey: key, isLoading, hasSort, hasSortOrder }) => {
  const { search, genre, sort, sortOrder } = useSelector(
    (state: RootState) => state.sortFilter,
    shallowEqual
  );

  const dispatch = useDispatch();

  const blogAxios = new BlogAxios();

  const { data: genreSelector } = useQuery({
    queryFn: () => blogAxios.getGenre(),
    queryKey: [GET_GENRE],
  });

  const initialRef = useRef<HTMLButtonElement>(null);

  const finalRef = useRef<HTMLButtonElement>(null);

  const [refPosition, setRefPosition] = useState(10);

  let timeout: any = 0;

  const getSortVal = (sort: SORT_TYPE) => {
    switch (sort) {
      case LIKES:
        return 'Most Liked';

      case CREATED_AT:
        return 'Latest/New';
    }
  };

  const menuSort = (
    <span className='flex flex-col items-center gap-2.5 bg-[#1F1F1F] rounded-lg p-3'>
      <Radio.Group
        onChange={({ target: { value: sort } }) => dispatch(setSort({ key, sort }))}
        value={sort[key]}
      >
        <Space direction='vertical'>
          <Radio value={LIKES}>{getSortVal(LIKES)}</Radio>
          <Radio value={CREATED_AT}>{getSortVal(CREATED_AT)}</Radio>
        </Space>
      </Radio.Group>

      {hasSortOrder && (
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

        {hasSort && (
          <Dropdown overlay={menuSort}>
            <Button className='w-[8.5rem] btn-secondary rounded-lg text-sm flex items-center justify-between px-2'>
              <span>{getSortVal(sort[key])}</span>
              <FaSort />
            </Button>
          </Dropdown>
        )}

        {isLoading && <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />}
      </span>

      <Divider />

      <div className='w-full items-center flex gap-2'>
        <LeftOutlined
          className='cursor-pointer'
          onClick={() => {
            initialRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            setRefPosition(10);
          }}
        />
        <span className='flex gap-2 sm:overflow-x-hidden overflow-x-scroll hideScrollbar items-center'>
          {genreSelector &&
            genreSelector.map((val, index) => (
              <Button
                key={val}
                ref={(index === 0 && initialRef) || (index === refPosition && finalRef) || null}
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
        <RightOutlined
          className='cursor-pointer'
          onClick={() => {
            finalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            if (genreSelector && refPosition + 4 > genreSelector?.length - 1)
              setRefPosition(genreSelector.length - 1);
            else setRefPosition((prev) => prev + 4);
          }}
        />
      </div>

      <Divider />
    </>
  );
};

export default SortFilter;
