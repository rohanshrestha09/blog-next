import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { closeModal, openModal } from './modalSlice';
import { setGenre, setOrder, setPublished, setSearch, setSize, setSort } from './filterSlice';
import { closeDrawer, openDrawer } from './drawerSlice';
import { turnOffReadingMode, turnOnReadingMode } from './readingModeSlice';
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
  const { size, search, sort, order, genre, isPublished } = useSelector(
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
    isPublished,
    setSize: (size: number) => dispatch(setSize({ key, size })),
    setSearch: (search: string) => dispatch(setSearch({ key, search })),
    setSort: (sort: SORT_TYPE) => dispatch(setSort({ key, sort })),
    setOrder: (order: SORT_ORDER) => dispatch(setOrder({ key, order })),
    setGenre: (genre: Genre) => dispatch(setGenre({ key, genre })),
    setPublished: (isPublished?: boolean) => dispatch(setPublished({ key, isPublished })),
  };
};

export const useDrawerStore = () => {
  const { isOpen } = useSelector((state: RootState) => state.drawer, shallowEqual);

  const dispatch = useDispatch();

  return {
    isOpen,
    openDrawer: () => dispatch(openDrawer()),
    closeDrawer: () => dispatch(closeDrawer()),
  };
};

export const useReadingModeStore = () => {
  const { isReadingMode } = useSelector((state: RootState) => state.readingMode, shallowEqual);

  const dispatch = useDispatch();

  return {
    isReadingMode,
    turnOnReadingMode: () => dispatch(turnOnReadingMode()),
    turnOffReadingMode: () => dispatch(turnOffReadingMode()),
  };
};
