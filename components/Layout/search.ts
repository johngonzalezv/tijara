import { createSlice } from "@reduxjs/toolkit";

export const searchSlicer = createSlice({
    name: 'search',
    initialState: {
        text: '',
    },
    reducers: {
        searchText: (state, action) => {
            state.text = action.payload
        }
    }
});
export const { searchText } = searchSlicer.actions;
export default searchSlicer.reducer;