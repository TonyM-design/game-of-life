import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface infoParameter {
    numberFrame: number;
    cellsNumber: number;
    stableCellsNumber: number;
    unstableCellsNumber: number;
    hoverPoint: HoverPointState | null;
    showAllCell: boolean,
    showStableCell: boolean,
    showUnstableCell: boolean
}

const initialState: infoParameter = {
    numberFrame: 0,
    cellsNumber: 0,
    stableCellsNumber: 0,
    unstableCellsNumber: 0,
    hoverPoint: null,
    showAllCell: true,
    showStableCell: false,
    showUnstableCell: false
}
interface DataPoint {
    frame: number;
    cellule: number;
}

interface HoverPointState {
    cell: string;
    mouseX: number;
    mouseY: number;
}
export const infoParameterSlice = createSlice(
    {
        name: 'info',
        initialState,
        reducers: {

            setNumberFrame: (state, action: PayloadAction<number>) => {
                state.numberFrame = action.payload
            },
            setCellsNumber: (state, action: PayloadAction<number>) => {
                state.cellsNumber = action.payload
            },
            setStableCellsNumber: (state, action: PayloadAction<number>) => {
                state.stableCellsNumber = action.payload;
            },
            setUnstableCellsNumber: (state, action: PayloadAction<number>) => {
                state.unstableCellsNumber = action.payload;
            },
            setHoverPoint: (state, action: PayloadAction<HoverPointState | null>) => {
                state.hoverPoint = action.payload;
            },
            setShowAllCell: (state, action: PayloadAction<boolean>) => {
                state.showAllCell = action.payload
            },
            setShowStableCell: (state, action: PayloadAction<boolean>) => {
                state.showStableCell = action.payload
            },
            setShowUnstableCell: (state, action: PayloadAction<boolean>) => {
                state.showUnstableCell = action.payload
            },
        }
    }
)

export const {
    setNumberFrame,
    setCellsNumber,
    setStableCellsNumber,
    setUnstableCellsNumber,
    setHoverPoint,
    setShowAllCell,
    setShowStableCell,
    setShowUnstableCell } = infoParameterSlice.actions;

export const selectNumberFrame = (state: { info: infoParameter }) => state.info.numberFrame
export const selectCellsNumber = (state: { info: infoParameter }) => state.info.cellsNumber
export const selectStableCellsNumber = (state: { info: infoParameter }) => state.info.stableCellsNumber
export const selectUnstableCellsNumber = (state: { info: infoParameter }) => state.info.unstableCellsNumber
export const selectHoverPoint = (state: { info: infoParameter }) => state.info.hoverPoint
export const selectShowAllCell = (state: { info: infoParameter }) => state.info.showAllCell
export const selectShowStableCell = (state: { info: infoParameter }) => state.info.showStableCell
export const selectShowUnstableCell = (state: { info: infoParameter }) => state.info.showUnstableCell
export default infoParameterSlice.reducer;
