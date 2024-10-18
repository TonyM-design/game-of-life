import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import * as THREE from 'three';
interface GameController {
    gameIsActive: boolean;
    numberFrame: number;
    cellsNumber: number;
    dataPoints: DataPoint[];
    stableDataPoints: DataPoint[];
    unstableDataPoints: DataPoint[];
    stableCellsNumber: number;
    unstableCellsNumber: number;
    hoverPoint: HoverPointState | null;
    uploadModalIsOpen: boolean;
    downloadModalIsOpen: boolean;
    loadedData: LoadedData | null
}

const initialState: GameController = {
    gameIsActive: false,
    numberFrame: 0,
    cellsNumber: 0,
    dataPoints: [],
    stableDataPoints: [],
    unstableDataPoints: [],
    stableCellsNumber: 0,
    unstableCellsNumber: 0,
    hoverPoint: null,
    uploadModalIsOpen: false,
    downloadModalIsOpen: false,
    loadedData: null
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
    stability: number
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
            setStableDataPoints: (state, action: PayloadAction<DataPoint[]>) => {
                state.stableDataPoints = action.payload;
            },
            setUnstableDataPoints: (state, action: PayloadAction<DataPoint[]>) => {
                state.unstableDataPoints = action.payload;
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
            setLoadedData: (state, action: PayloadAction<LoadedData | null>) => {
                state.loadedData = action.payload;
            },
        }
    }
)

export const {
    setGameIsActive,
    setNumberFrame,
    setCellsNumber,
    setDataPoints,
    setStableDataPoints,
    setUnstableDataPoints,
    setStableCellsNumber,
    setUnstableCellsNumber,
    setHoverPoint,
    setUploadModalIsOpen,
    setDownloadModalIsOpen,
    setLoadedData } = gameControllerSlice.actions;

export const selectGameIsActive = (state: { game: GameController }) => state.game.gameIsActive
export const selectNumberFrame = (state: { game: GameController }) => state.game.numberFrame
export const selectCellsNumber = (state: { game: GameController }) => state.game.cellsNumber
export const selectDataPoints = (state: { game: GameController }) => state.game.dataPoints
export const selectStableDataPoints = (state: { game: GameController }) => state.game.stableDataPoints
export const selectUnstableDataPoints = (state: { game: GameController }) => state.game.unstableDataPoints
export const selectStableCellsNumber = (state: { game: GameController }) => state.game.stableCellsNumber
export const selectUnstableCellsNumber = (state: { game: GameController }) => state.game.unstableCellsNumber
export const selectHoverPoint = (state: { game: GameController }) => state.game.hoverPoint
export const selectUploadModalIsOpen = (state: { game: GameController }) => state.game.uploadModalIsOpen
export const selectDownloadModalIsOpen = (state: { game: GameController }) => state.game.downloadModalIsOpen
export const selectLoadedData = (state: { game: GameController }) => state.game.loadedData
export default gameControllerSlice.reducer;
