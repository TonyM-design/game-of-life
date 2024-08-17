import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface GridHeight{
    value: number;
}

const initialState : GridHeight = {
    value : 0
}

export const gridSlice = createSlice({
    name: 'height',
    initialState,
    reducers: {
        incrementHeight:(state) => {state.value += 1},
        decrementHeight:(state) => {state.value -= 1},
        setHeight: (state, action: PayloadAction<number>) => {
            state.value = action.payload;
        }
    }
});
export const { incrementHeight, decrementHeight, setHeight } = gridSlice.actions;
export const selectHeight = (state : number) => state.valueOf()

export default gridSlice.reducer;