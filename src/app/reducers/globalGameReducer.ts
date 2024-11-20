import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import * as THREE from 'three';

export interface GlobalGame{
    cellPositions: string[];
    loadedCellPositions : string[];
    stepByStepMode : boolean;
}

const initialState : GlobalGame = {
    cellPositions : [],
    loadedCellPositions : [],
    stepByStepMode : false
}

export const gridSlice = createSlice({
    name: 'global',
    initialState,
    reducers: {
            setCellPositions: (state, action: PayloadAction<string[]>) => {
        state.cellPositions = action.payload;
    },
            setLoadedCellPositions: (state, action: PayloadAction<string[]>) => {
        state.loadedCellPositions = action.payload;
    },
            setStepByStepMode: (state, action: PayloadAction<boolean>) => {
        state.stepByStepMode = action.payload;
    },
    }
});
export const { setCellPositions,setStepByStepMode,setLoadedCellPositions } = gridSlice.actions;
export const selectCellPositions = (state: { global: GlobalGame }) => state.global.cellPositions
export const selectLoadedCellPositions = (state: { global: GlobalGame }) => state.global.loadedCellPositions
export const selectStepByStepMode = (state: { global: GlobalGame }) => state.global.stepByStepMode

export default gridSlice.reducer;