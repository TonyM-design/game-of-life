import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface GameController {
    gameIsActive: boolean;
    numberFrame : number;
    cellsNumber : number;
}

const initialState: GameController = {
    gameIsActive: false,
    numberFrame : 0,
    cellsNumber : 0,
}

export const gameControllerSlice = createSlice(
    {
        name: 'gameIsActive',
        initialState,
        reducers: {
            setGameIsActive: (state, action: PayloadAction<boolean>) => {
                state.gameIsActive = action.payload
            },
            setNumberFrame: (state, action: PayloadAction<number>) => {
                state.numberFrame = action.payload
            },
            setCellsNumber: (state, action: PayloadAction<number>) => {
                state.cellsNumber = action.payload
            }
        }
    }
)

export const {setGameIsActive,setNumberFrame, setCellsNumber} = gameControllerSlice.actions;

export const selectGameIsActive = (state : {game : GameController}) => state.game.gameIsActive
export const selectNumberFrame  = (state : {game : GameController}) => state.game.numberFrame
export const selectCellsNumber  = (state : {game : GameController}) => state.game.cellsNumber

export default gameControllerSlice.reducer;
