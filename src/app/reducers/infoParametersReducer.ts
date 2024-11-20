import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface infoParameter {
    numberFrame: number;
    cellsNumber: number;
    oldCellsNumber: number;
    newCellsNumber: number;
    hoverPoint: HoverPointState | null;
    showAllCell: boolean,
    showOldCell: boolean,
    showNewCell: boolean
}

const initialState: infoParameter = {
    numberFrame: 0,
    cellsNumber: 0,
    oldCellsNumber: 0,
    newCellsNumber: 0,
    hoverPoint: null,
    showAllCell: true,
    showOldCell: false,
    showNewCell: false
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
            setOldCellsNumber: (state, action: PayloadAction<number>) => {
                state.oldCellsNumber = action.payload;
            },
            setNewCellsNumber: (state, action: PayloadAction<number>) => {
                state.newCellsNumber = action.payload;
            },
            setHoverPoint: (state, action: PayloadAction<HoverPointState | null>) => {
                state.hoverPoint = action.payload;
            },
            setShowAllCell: (state, action: PayloadAction<boolean>) => {
                state.showAllCell = action.payload
            },
            setShowOldCell: (state, action: PayloadAction<boolean>) => {
                state.showOldCell = action.payload
            },
            setShowNewCell: (state, action: PayloadAction<boolean>) => {
                state.showNewCell = action.payload
            },
        }
    }
)

export const {
    setNumberFrame,
    setCellsNumber,
    setOldCellsNumber,
    setNewCellsNumber,
    setHoverPoint,
    setShowAllCell,
    setShowOldCell,
    setShowNewCell } = infoParameterSlice.actions;

export const selectNumberFrame = (state: { info: infoParameter }) => state.info.numberFrame
export const selectCellsNumber = (state: { info: infoParameter }) => state.info.cellsNumber
export const selectOldCellsNumber = (state: { info: infoParameter }) => state.info.oldCellsNumber
export const selectNewCellsNumber = (state: { info: infoParameter }) => state.info.newCellsNumber
export const selectHoverPoint = (state: { info: infoParameter }) => state.info.hoverPoint
export const selectShowAllCell = (state: { info: infoParameter }) => state.info.showAllCell
export const selectShowOldCell = (state: { info: infoParameter }) => state.info.showOldCell
export const selectShowNewCell = (state: { info: infoParameter }) => state.info.showNewCell
export default infoParameterSlice.reducer;
