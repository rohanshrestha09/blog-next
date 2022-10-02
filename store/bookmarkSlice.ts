import { createSlice } from '@reduxjs/toolkit';

const bookmarkSlice = createSlice({
  name: 'authBlog',
  initialState: {
    pageSize: 20,
    genre: [] as Array<string>,
    search: '',
  },
  reducers: {
    setPageSize: (state, { payload: { pageSize } }: { payload: { pageSize: number } }) => {
      return (state = { ...state, pageSize });
    },
    setGenre: (
      state,
      { payload: { genre, checked } }: { payload: { genre: string; checked: boolean } }
    ) => {
      return (state = checked
        ? { ...state, genre: [...state.genre, genre] }
        : {
            ...state,
            genre: state.genre.filter((val: string) => val !== genre),
          });
    },

    setSearch: (state, { payload: { search } }: { payload: { search: string } }) => {
      return (state = { ...state, search });
    },
  },
});

export const { setPageSize, setGenre, setSearch } = bookmarkSlice.actions;

export default bookmarkSlice.reducer;
