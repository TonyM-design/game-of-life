"use client";
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { selectGameIsActive } from './reducers/controllerParameterReducer';

import InfosChartComponent from '../infosChartComponent';
import { selectShowAllCell, selectShowStableCell, selectShowUnstableCell, selectUnstableCellsNumber, selectNumberFrame, selectStableCellsNumber, selectCellsNumber, setShowAllCell, setShowStableCell, setShowUnstableCell } from './reducers/infoParametersReducer';
function lateralPanelInfos() {

    const gameIsActive: boolean = useSelector(selectGameIsActive)
    const currentFrame: number = useSelector(selectNumberFrame)
    const cellsNumber: number = useSelector(selectCellsNumber)
    const stableCellsNumber: number = useSelector(selectStableCellsNumber)
    const unstableCellsNumber: number = useSelector(selectUnstableCellsNumber)
    const showAllCells: boolean = useSelector(selectShowAllCell)
    const showStableCells: boolean = useSelector(selectShowStableCell)
    const showUnstableCells: boolean = useSelector(selectShowUnstableCell)
    const dispatch = useDispatch();

useEffect(() => {
 
}, [stableCellsNumber,unstableCellsNumber,currentFrame,cellsNumber])

    return (
        <div className=' m-2 ml-4  animate-fade-right animate-once animate-duration-[800ms] animate-ease-in-out animate-normal animate-fill-forwards '>
            <div className='mt-6  -ml-1 p-2.5  bg-slate-800 bg-opacity-60 border-4 border-white border-y-0 border-r-0   '>


                <div className='flex justify-around items-center   '>
                    <p className='text-slate-300 capitalize opacity-80 text-xs'>frames: {currentFrame}</p>
                    <p className='text-slate-300 capitalize opacity-80 text-xs'>total cells: {cellsNumber}</p>
                    <p className='text-slate-300 capitalize opacity-80 text-xs'>stables cells: {stableCellsNumber}</p>
                    <p className='text-slate-300 capitalize opacity-80 text-xs'>unstables cells: {unstableCellsNumber}</p>
                </div>
                <hr className='mt-2 border-slate-700' />

                <div className=''>
                    <InfosChartComponent
                        showAllCell={showAllCells}
                        showStableCell={showStableCells}
                        showUnstableCell={showUnstableCells} />
                </div>
                <hr className='mt-2 border-slate-700' />

                <div className='  grid grid-cols-12 mt-2  '>
                    <label className='text-slate-300 capitalize col-span-4  opacity-80'>show all cells</label>
                    <input type="checkbox" checked={showAllCells} onClick={() => dispatch(setShowAllCell(!showAllCells))} className='col-start-5 m-1' name="" id="" />
                </div>
                <div className='  grid grid-cols-12 mt-2  '>
                    <label className='text-slate-300 capitalize col-span-4  opacity-80'>show stable cells</label>
                    <input type="checkbox" checked={showStableCells} onClick={() => dispatch(setShowStableCell(!showStableCells))} className='col-start-5 m-1' name="" id="" />
                </div>
                <div className='  grid grid-cols-12 mt-2  '>
                    <label className='text-slate-300 capitalize col-span-4  opacity-80'>show unstable cells</label>
                    <input type="checkbox" checked={showUnstableCells} onClick={() => dispatch(setShowUnstableCell(!showUnstableCells))} className='col-start-5 m-1' name="" id="" />
                </div>
            </div>



        </div>
    )
}

export default lateralPanelInfos