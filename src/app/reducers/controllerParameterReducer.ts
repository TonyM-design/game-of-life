import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import * as THREE from 'three';
interface GameController {
    gameIsActive: boolean;
    numberFrame: number;
    cellsNumber: number;
    dataPoints: DataPoint[];
    oldDataPoints: DataPoint[];
    newDataPoints: DataPoint[];
    oldCellsNumber: number;
    newCellsNumber: number;
    hoverPoint: HoverPointState | null;
    uploadModalIsOpen: boolean;
    downloadModalIsOpen: boolean;
    loadedData: LoadedData | null
    resetIsRequired : boolean;
}

const initialState: GameController = {
    gameIsActive: false,
    numberFrame: 0,
    cellsNumber: 0,
    dataPoints: [],
    oldDataPoints: [],
    newDataPoints: [],
    oldCellsNumber: 0,
    newCellsNumber: 0,
    hoverPoint: null,
    uploadModalIsOpen: false,
    downloadModalIsOpen: false,
    loadedData: null,
    resetIsRequired: false,
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

interface LoadedRules {
    zAxis: boolean,
    birthRate: number,
    surpopulation: number,
    loneliness: number,
}

interface LoadedData {
    rule: LoadedRules;
    cellPositions: string[];
}
export const gameControllerSlice = createSlice(
    {
        name: 'gameIsActive',
        initialState,
        reducers: {
            setGameIsActive: (state, action: PayloadAction<boolean>) => {
                state.gameIsActive = action.payload
            },
            setUploadModalIsOpen: (state, action: PayloadAction<boolean>) => {
                state.uploadModalIsOpen = action.payload
            },
            setDownloadModalIsOpen: (state, action: PayloadAction<boolean>) => {
                state.downloadModalIsOpen = action.payload
            },
            setNumberFrame: (state, action: PayloadAction<number>) => {
                state.numberFrame = action.payload
            },
            setCellsNumber: (state, action: PayloadAction<number>) => {
                state.cellsNumber = action.payload
            },
            setDataPoints: (state, action: PayloadAction<DataPoint[]>) => {
                state.dataPoints = action.payload;
            },
            setoldDataPoints: (state, action: PayloadAction<DataPoint[]>) => {
                state.oldDataPoints = action.payload;
            },
            setnewDataPoints: (state, action: PayloadAction<DataPoint[]>) => {
                state.newDataPoints = action.payload;
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
            setResetIsRequired: (state, action: PayloadAction<boolean>) => {
                state.resetIsRequired = action.payload
            },
           
        }
    }
)

export const {
    setGameIsActive,
    setNumberFrame,
    setCellsNumber,
    setDataPoints,
    setoldDataPoints,
    setnewDataPoints,
    setOldCellsNumber,
    setNewCellsNumber,
    setHoverPoint,
    setUploadModalIsOpen,
    setDownloadModalIsOpen,
    setResetIsRequired,
     } = gameControllerSlice.actions;

export const selectGameIsActive = (state: { game: GameController }) => state.game.gameIsActive
export const selectNumberFrame = (state: { game: GameController }) => state.game.numberFrame
export const selectCellsNumber = (state: { game: GameController }) => state.game.cellsNumber
export const selectDataPoints = (state: { game: GameController }) => state.game.dataPoints
export const selectoldDataPoints = (state: { game: GameController }) => state.game.oldDataPoints
export const selectnewDataPoints = (state: { game: GameController }) => state.game.newDataPoints
export const selectStableCellsNumber = (state: { game: GameController }) => state.game.oldCellsNumber
export const selectUnstableCellsNumber = (state: { game: GameController }) => state.game.newCellsNumber
export const selectHoverPoint = (state: { game: GameController }) => state.game.hoverPoint
export const selectUploadModalIsOpen = (state: { game: GameController }) => state.game.uploadModalIsOpen
export const selectDownloadModalIsOpen = (state: { game: GameController }) => state.game.downloadModalIsOpen
export const selectResetIsRequired = (state: { game: GameController }) => state.game.resetIsRequired

export default gameControllerSlice.reducer;
