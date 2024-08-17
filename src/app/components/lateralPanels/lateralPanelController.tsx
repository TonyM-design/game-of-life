"use client";

import { faAmbulance, faBackward, faForward, faPause } from '@fortawesome/free-solid-svg-icons'
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { selectCellsNumber, selectGameIsActive, selectNumberFrame, setGameIsActive } from './reducers/controllerParameterReducer';

function lateralPanelController() {

    const gameIsActive: boolean = useSelector(selectGameIsActive)
    const currentFrame : number = useSelector(selectNumberFrame)
    const cellsNumber : number = useSelector(selectCellsNumber)
    const dispatch = useDispatch();


    const startGame = () => {
        dispatch(setGameIsActive(true))
        console.log(gameIsActive)
    }
    const stopGame = () => {
        dispatch(setGameIsActive(false))
        console.log(gameIsActive)

    }


    const gameIsActiveChanges = (bool: boolean) => {
        const value: boolean = Boolean(bool)
        dispatch(setGameIsActive(value))
    }


    return (
        <div className=' m-2 '>
            <h4 className='text-slate-300 bg-slate-700 opacity-80 w-fit'>Controller</h4>

            <div className='mt-1  rounded-md p-2.5  bg-slate-700 bg-opacity-80  '>
                <h4 className='text-slate-300   opacity-80 w-fit mb-2'>Controller {">"} </h4>

                <div className="border-0 border-b border-slate-600 pb-2">
                 
                    <p className='text-slate-300 capitalize opacity-80'>current frame: {currentFrame}</p>
                    <p className='text-slate-300 capitalize opacity-80'>number cells: {cellsNumber}</p>
                    <p className='text-slate-300 capitalize opacity-80'> test {gameIsActive.toString()} </p>

                    <div className='grid grid-cols-12'>
                        <div className='flex col-span-6 col-start-4 justify-center mt-4 bg-slate-800 p-2 rounded-lg  '>
                            <FontAwesomeIcon
                                icon={faBackward}
                                className='text-slate-400 text-xl mx-2 hover:text-slate-200 hover:cursor-pointer active:text-slate-500' />
                            <FontAwesomeIcon
                                onClick={() => startGame()}
                                icon={faPlay}
                                className='text-slate-400 text-xl mx-2  hover:text-slate-200 hover:cursor-pointer active:text-slate-500' />
                            <FontAwesomeIcon
                                onClick={() => stopGame()}
                                icon={faPause}
                                className='text-slate-400 text-xl mx-2  hover:text-slate-200 hover:cursor-pointer active:text-slate-500' />
                            <FontAwesomeIcon
                                icon={faForward}
                                className='text-slate-400 text-xl mx-2  hover:text-slate-200 hover:cursor-pointer active:text-slate-500' />

                        </div>
                    </div>


                </div>


            </div>

        </div>)
}

export default lateralPanelController