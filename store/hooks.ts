import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { closeModal, openModal } from './modalSlice';
import { setGenre, setOrder, setSearch, setSize, setSort } from './filterSlice';
import { FILTERS, MODALS, SORT_ORDER, SORT_TYPE } from 'constants/reduxKeys';
import { Genre } from 'interface/models';

export const useModalStore = (key: MODALS) => {
  const { isOpen } = useSelector((state: RootState) => state.modal[key], shallowEqual);

  const dispatch = useDispatch();

  return {
    isOpen,
    openModal: () => dispatch(openModal(key)),
    closeModal: () => dispatch(closeModal(key)),
  };
};

export const useFilterStore = (key: FILTERS) => {
  const { size, search, sort, order, genre } = useSelector(
    (state: RootState) => state.filter[key],
    shallowEqual,
  );

  const dispatch = useDispatch();

  return {
    size,
    search,
    sort,
    order,
    genre,
    setSize: (size: number) => dispatch(setSize({ key, size })),
    setSearch: (search: string) => dispatch(setSearch({ key, search })),
    setSort: (sort: SORT_TYPE) => dispatch(setSort({ key, sort })),
    setOrder: (order: SORT_ORDER) => dispatch(setOrder({ key, order })),
    setGenre: (genre: Genre) => dispatch(setGenre({ key, genre })),
  };
};
