import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface GridParameters {
    typeOfCell: String;
    perimeter: boolean;
    linkCells: boolean;
    birthRate: number;
    surpopulationLimit: number;
    lonelinessLimit: number;
    speed: number;
    hideGrid: boolean;
    customGrid: boolean;
    is3DGrid: boolean;
    isPointLines: boolean;
    width: number;
    height: number;
    depth: number;
    cubeSize: number;
    iterationNumber: number;
    currentHoverCell: HoverCellState | null;
    stability: number;
    hideCells : boolean
}

const initialState: GridParameters = {
    typeOfCell: "Plane",
    perimeter: false,
    linkCells: false,
    birthRate: 3,
    surpopulationLimit: 3,
    lonelinessLimit: 1,
    speed: 1,
    hideGrid: false,
    customGrid: false,
    is3DGrid: false,
    isPointLines: false,
    width: 25,
    height: 25,
    depth: 1,
    cubeSize: 0.4,
    iterationNumber: 0,
    currentHoverCell: null,
    stability: 0,
    hideCells : false
};

interface HoverCellState {
    cell: string;
    mouseX: number;
    mouseY: number;
}



export const gridParametersSlice = createSlice(
    {
        name: 'gridParameters',
        initialState,
        reducers: {
            setTypeOfCell: (state, action: PayloadAction<String>) => {
                state.typeOfCell = action.payload;
            },
            setSpeed: (state, action: PayloadAction<number>) => {
                state.speed = action.payload;
            },
            setBirthRate: (state, action: PayloadAction<number>) => {
                state.birthRate = action.payload;
            },
            setSurpopulationLimit: (state, action: PayloadAction<number>) => {
                state.surpopulationLimit = action.payload;
            },
            setLonelinessLimit: (state, action: PayloadAction<number>) => {
                state.lonelinessLimit = action.payload;
            },
            setIs3dGrid: (state, action: PayloadAction<boolean>) => {
                state.is3DGrid = action.payload
            },
            setHideGrid: (state, action: PayloadAction<boolean>) => {
                state.hideGrid = action.payload
            },
            setIsCustomGrid: (state, action: PayloadAction<boolean>) => {
                state.customGrid = action.payload
            },
            setIsPointLines: (state, action: PayloadAction<boolean>) => {
                state.isPointLines = action.payload
            },
            setPerimeter: (state, action: PayloadAction<boolean>) => {
                state.perimeter = action.payload
            },
            setLinkCells: (state, action: PayloadAction<boolean>) => {
                state.linkCells = action.payload
            },
            setGridHeight: (state, action: PayloadAction<number>) => {
                state.height = action.payload;
            },
            setGridWidth: (state, action: PayloadAction<number>) => {
                state.width = action.payload;
            },
            setGridDepth: (state, action: PayloadAction<number>) => {
                state.depth = action.payload;
            },
            setCubeSize: (state, action: PayloadAction<number>) => {
                state.cubeSize = action.payload;
            },
            setCurrentHoverCell: (state, action: PayloadAction<HoverCellState | null>) => {
                state.currentHoverCell = action.payload;
            },
            incrementIterationNumber: (state) => {
                state.iterationNumber + 1;
            },
            setStability: (state, action: PayloadAction<number>) => {
                state.stability = action.payload;
            },
            setHideCells: (state, action: PayloadAction<boolean>) => {
                state.hideCells = action.payload
            },

        }
    }
)

export const { setIs3dGrid, setIsPointLines, setGridHeight, setGridWidth, setGridDepth, setCubeSize, incrementIterationNumber, setHideGrid, setIsCustomGrid, setBirthRate, setSurpopulationLimit, setLonelinessLimit, setSpeed, setPerimeter, setTypeOfCell, setLinkCells, setCurrentHoverCell,setStability,setHideCells } = gridParametersSlice.actions;

export const selectGridIs3DGrid = (state: { grid: GridParameters }) => state.grid.is3DGrid;
export const selectGridIsPointLines = (state: { grid: GridParameters }) => state.grid.isPointLines;
export const selectGridHeight = (state: { grid: GridParameters }) => state.grid.height;
export const selectGridWidth = (state: { grid: GridParameters }) => state.grid.width;
export const selectGridDepth = (state: { grid: GridParameters }) => state.grid.depth;
export const selectCubeSize = (state: { grid: GridParameters }) => state.grid.cubeSize;
export const selectIterationNumber = (state: { grid: GridParameters }) => state.grid.iterationNumber
export const selectCustomGrid = (state: { grid: GridParameters }) => state.grid.customGrid
export const selectHideGrid = (state: { grid: GridParameters }) => state.grid.hideGrid
export const selectBirthRate = (state: { grid: GridParameters }) => state.grid.birthRate
export const selectSurpopulationLimit = (state: { grid: GridParameters }) => state.grid.surpopulationLimit
export const selectLonelinessLimit = (state: { grid: GridParameters }) => state.grid.lonelinessLimit
export const selectSpeed = (state: { grid: GridParameters }) => state.grid.speed
export const selectPerimeter = (state: { grid: GridParameters }) => state.grid.perimeter
export const selectLinkCells = (state: { grid: GridParameters }) => state.grid.linkCells
export const selectTypeOfCell = (state: { grid: GridParameters }) => state.grid.typeOfCell
export const selectCurrentHoverCell = (state: { grid: GridParameters }) => state.grid.currentHoverCell
export const selectStability = (state: { grid: GridParameters }) => state.grid.stability
export const selectHideCells = (state: { grid: GridParameters }) => state.grid.hideCells


export default gridParametersSlice.reducer;
