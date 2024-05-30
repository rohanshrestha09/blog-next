import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Divider, Input, Dropdown, Button, Spin } from 'antd';
import { LoadingOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { BiSearch } from 'react-icons/bi';
import { FaSort } from 'react-icons/fa';
import { getGenre } from 'request/blog';
import { useFilterStore } from 'store/hooks';
import { queryKeys } from 'utils';
import { GENRE } from 'constants/queryKeys';
import { FILTERS, SORT_ORDER, SORT_TYPE } from 'constants/reduxKeys';

interface Props {
  filterType: FILTERS;
  isLoading: boolean;
  hasSort?: boolean;
  hasSortOrder?: boolean;
}

const SortFilter: React.FC<Props> = ({ filterType, isLoading, hasSort, hasSortOrder }) => {
  const { search, genre, sort, order, setSearch, setSort, setOrder, setGenre } =
    useFilterStore(filterType);

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
      case SORT_TYPE.LIKE_COUNT:
        return 'Most Liked';

      case SORT_TYPE.CREATED_AT:
        return 'Latest/New';
    }
  };

  const menuSort = [
    {
      key: SORT_TYPE.LIKE_COUNT,
      label: <p className='py-1'>{getSortLabel(SORT_TYPE.LIKE_COUNT)}</p>,
    },
    {
      key: SORT_TYPE.CREATED_AT,
      label: <p className='py-1'>{getSortLabel(SORT_TYPE.CREATED_AT)}</p>,
    },
    {
      key: SORT_ORDER.ASC,
      label: <p className='py-1'>Ascending</p>,
    },
    {
      key: SORT_ORDER.DESC,
      label: <p className='py-1'>Descending</p>,
    },
  ];

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
            timeout = setTimeout(() => setSearch(value), 700);
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
              selectedKeys: [sort, order],
              onSelect: ({ key: sort }) => {
                if (Object.values(SORT_TYPE).includes(sort as SORT_TYPE))
                  setSort(sort as SORT_TYPE);

                if (hasSortOrder && Object.values(SORT_ORDER).includes(sort as SORT_ORDER))
                  setOrder(sort as SORT_ORDER);
              },
            }}
          >
            <Button className='w-[8.5rem] btn-secondary rounded-lg text-sm flex items-center justify-between px-2'>
              <span>{getSortLabel(sort)}</span>
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
                className={`rounded-lg bg-[#272727] border-none hover:bg-gray-200 hover:border-gray-200 hover:text-black transition-all duration-300 ${
                  genre.includes(val) ? 'btn-secondary' : ''
                }`}
                onClick={(e) => {
                  setGenre(val);
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
