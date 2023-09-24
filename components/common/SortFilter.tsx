import { useRef, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { Divider, Input, Dropdown, Button, Spin } from 'antd';
import { LoadingOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { BiSearch } from 'react-icons/bi';
import { FaSort } from 'react-icons/fa';
import { getGenre } from 'api/blog';
import { setSearch, setGenre, setSort, setOrder } from 'store/sortFilterSlice';
import { queryKeys } from 'utils';
import { GENRE } from 'constants/queryKeys';
import { SORT_FILTER_KEYS, SORT_ORDER, SORT_TYPE } from 'constants/reduxKeys';

interface Props {
  sortFilterKey: SORT_FILTER_KEYS;
  isLoading: boolean;
  hasSort?: boolean;
  hasSortOrder?: boolean;
}

const { LIKE_COUNT, CREATED_AT } = SORT_TYPE;

const { ASCENDING, DESCENDING } = SORT_ORDER;

const SortFilter: React.FC<Props> = ({ sortFilterKey: key, isLoading, hasSort, hasSortOrder }) => {
  const { search, genre, sort, order } = useSelector(
    (state: RootState) => state.sortFilter,
    shallowEqual,
  );

  const dispatch = useDispatch();

  const { data: genres } = useQuery({
    queryFn: getGenre,
    queryKey: queryKeys(GENRE).lists(),
  });

  const initialRef = useRef<HTMLButtonElement>(null);

  const finalRef = useRef<HTMLButtonElement>(null);

  const [refPosition, setRefPosition] = useState(10);

  let timeout: any = 0;

  const getSortLabel = (sort: SORT_TYPE) => {
    switch (sort) {
      case LIKE_COUNT:
        return 'Most Liked';

      case CREATED_AT:
        return 'Latest/New';
    }
  };

  const menuSort = [
    {
      key: LIKE_COUNT,
      label: <p className='py-1'>{getSortLabel(LIKE_COUNT)}</p>,
    },
    {
      key: CREATED_AT,
      label: <p className='py-1'>{getSortLabel(CREATED_AT)}</p>,
    },
    {
      key: ASCENDING,
      label: <p className='py-1'>Ascending</p>,
    },
    {
      key: DESCENDING,
      label: <p className='py-1'>Descending</p>,
    },
  ];

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
          allowClear
        />

        {hasSort && (
          <Dropdown
            overlayClassName='font-sans'
            menu={{
              items: hasSortOrder
                ? menuSort
                : menuSort.filter(
                    ({ key }) => !Object.values(SORT_ORDER).includes(key as SORT_ORDER & SORT_TYPE),
                  ),
              selectable: true,
              selectedKeys: [sort[key], order[key]],
              onSelect: ({ key: sort }) => {
                if (Object.values(SORT_TYPE).includes(sort as SORT_TYPE))
                  dispatch(setSort({ key, sort } as { key: SORT_FILTER_KEYS; sort: SORT_TYPE }));

                if (hasSortOrder && Object.values(SORT_ORDER).includes(sort as SORT_ORDER))
                  dispatch(
                    setOrder({ key, order: sort } as {
                      key: SORT_FILTER_KEYS;
                      order: SORT_ORDER;
                    }),
                  );
              },
            }}
          >
            <Button className='w-[8.5rem] btn-secondary rounded-lg text-sm flex items-center justify-between px-2'>
              <span>{getSortLabel(sort[key])}</span>
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
          {genres &&
            Object.values(genres).map((val, index) => (
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

            if (genres && refPosition + 4 > Object.values(genres)?.length - 1)
              setRefPosition(Object.values(genres).length - 1);
            else setRefPosition((prev) => prev + 4);
          }}
        />
      </div>

      <Divider />
    </>
  );
};

export default SortFilter;
