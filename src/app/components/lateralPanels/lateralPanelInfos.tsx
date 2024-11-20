"use client";
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { selectGameIsActive } from '../../reducers/controllerParameterReducer';

import InfosChartComponent from '../infosChartComponent';
import { selectShowAllCell, selectNumberFrame, selectCellsNumber, setShowAllCell, selectShowOldCell, selectShowNewCell, selectNewCellsNumber, selectOldCellsNumber, setShowOldCell, setShowNewCell } from '../../reducers/infoParametersReducer';
function lateralPanelInfos() {
    const currentFrame: number = useSelector(selectNumberFrame)
    const allCellNumber: number = useSelector(selectCellsNumber)
    const oldCellNumber: number = useSelector(selectOldCellsNumber)
    const newCellNumber: number = useSelector(selectNewCellsNumber)
    const showAllCells: boolean = useSelector(selectShowAllCell)
    const showOldCell: boolean = useSelector(selectShowOldCell)
    const showNewCell: boolean = useSelector(selectShowNewCell)
    const dispatch = useDispatch();

    return (
        <div className=' m-2 ml-4  animate-fade-right animate-once animate-duration-[800ms] animate-ease-in-out animate-normal animate-fill-forwards '>
            <div className='mt-6  -ml-1 p-2.5  bg-slate-800 bg-opacity-60 border-4 border-white border-y-0 border-r-0   '>


                <div className='flex justify-around items-center   '>
                    <p className='text-slate-300 capitalize opacity-80 text-xs'>frames: {currentFrame}</p>
                    <p className='text-slate-300 capitalize opacity-80 text-xs'>total cells: {allCellNumber}</p>
                    <p className='text-slate-300 capitalize opacity-80 text-xs'>old cells: {oldCellNumber}</p>
                    <p className='text-slate-300 capitalize opacity-80 text-xs'>new cells: {newCellNumber}</p>
                </div>
                <hr className='mt-2 border-slate-700' />

                <div className=''>
                    <InfosChartComponent
                        showAllCell={showAllCells}
                        showOldCell={showOldCell}
                        showNewCell={showNewCell} />
                </div>
                <hr className='mt-2 border-slate-700' />

                <div className='  grid grid-cols-12 mt-2  '>
                    <label className='text-slate-300 capitalize col-span-4  opacity-80'>show all cells</label>
                    <input type="checkbox" checked={showAllCells} onClick={() => dispatch(setShowAllCell(!showAllCells))} className='col-start-5 m-1' name="" id="" />
                </div>
                <div className='  grid grid-cols-12 mt-2  '>
                    <label className='text-slate-300 capitalize col-span-4  opacity-80'>show stable cells</label>
                    <input type="checkbox" checked={showOldCell} onClick={() => dispatch(setShowOldCell(!showOldCell))} className='col-start-5 m-1' name="" id="" />
                </div>
                <div className='  grid grid-cols-12 mt-2  '>
                    <label className='text-slate-300 capitalize col-span-4  opacity-80'>show unstable cells</label>
                    <input type="checkbox" checked={showNewCell} onClick={() => dispatch(setShowNewCell(!showNewCell))} className='col-start-5 m-1' name="" id="" />
                </div>
            </div>



        </div>
    )
}

export default lateralPanelInfos