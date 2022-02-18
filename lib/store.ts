import { configureStore } from '@reduxjs/toolkit';
import searchSlicer from '../components/Layout/search';


export default configureStore({
  reducer: {
    search: searchSlicer,
  },
});