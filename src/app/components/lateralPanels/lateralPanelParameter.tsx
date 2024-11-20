"use client";
import React from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { selectGameIsActive } from '../../reducers/controllerParameterReducer';
import { selectGridDepth, selectGridHeight, selectGridWidth, selectHideGrid, setGridDepth, setGridHeight, setGridWidth, setHideGrid } from '../../reducers/gridParametersReducer';
function lateralPanelParameter() {
    const gridHeightParameter = useSelector(selectGridHeight);
    const gridwidthParameter = useSelector(selectGridWidth);
    const gridDepthParameter = useSelector(selectGridDepth);

    const hideGrid = useSelector(selectHideGrid);
    const gameIsRunning = useSelector(selectGameIsActive)
    const dispatch = useDispatch();

    const heightParameterChanges = (valueAsNumber: number) => {
        if (gameIsRunning === false) {
            const value: number = Number(valueAsNumber)
            dispatch(setGridHeight(value))
        }
    }
    const widthParameterChanges = (valueAsNumber: number) => {
        if (gameIsRunning === false) {
            const value: number = Number(valueAsNumber)
            dispatch(setGridWidth(value))
        }
    }
    const depthParameterChanges = (valueAsNumber: number) => {
        if (gameIsRunning === false) {
            const value: number = Number(valueAsNumber)
            dispatch(setGridDepth(value))
        }
    }


    const isHideGrid = (boolean: boolean) => {
        dispatch(setHideGrid(boolean))
    }





    return (
        <div className=' m-2 ml-4 animate-fade-right animate-duration-[800ms] animate-normal '>






            <div className='mt-6  -ml-1 p-0.5  bg-slate-700 bg-opacity-60 border-4 border-white border-y-0 border-r-0   '>
                <div className=" p-2.5 ">


                    <h4 className='text-slate-300   opacity-80 w-fit mb-2'>Grid <text className='text-slate-400 ml-2'>(only for initial displaying)</text></h4>
                    <hr className='border-slate-700' />

                    <form action="border-0 border-b border-slate-600 pb-2">

                        <div className='  grid grid-cols-12 mt-2  '>
                            <label htmlFor="" className='text-slate-300 capitalize col-span-3 opacity-80'>hide </label>
                            <input type="checkbox" checked={hideGrid} onChange={() => { isHideGrid(!hideGrid) }} className='col-start-4 m-1' name="" id="" />
                        </div>

                        <div className='  grid grid-cols-12 mt-2  ' >
                            <label htmlFor="x" className='text-slate-300 capitalize col-span-2 opacity-80' >width</label>
                            <input type="range" value={gridwidthParameter} min={1} max={100} name="x" id="x" onChange={event => { widthParameterChanges((event.target.valueAsNumber)) }} className='text-slate-300 col-start-4 col-span-6' />
                            <input type="number" value={gridwidthParameter} min={1} max={100} name="x" id="x" onChange={event => { widthParameterChanges((event.target.valueAsNumber)) }} className='text-slate-300  text-opacity-100  border-2 border-opacity-100 border-slate-600 col-start-11 col-span-2 bg-transparent text-center ' />
                        </div>
                        <div className='  grid grid-cols-12 mt-2  '>
                            <label htmlFor="y" className='text-slate-300 capitalize col-span-2 opacity-80'>height</label>
                            <input type="range" value={gridHeightParameter} min={1} max={100} name="y" id="y" onChange={event => { heightParameterChanges((event.target.valueAsNumber)) }} className='text-slate-300 col-start-4 col-span-6' />
                            <input type="number" value={gridHeightParameter} min={1} max={100} name="y" id="y" onChange={event => { heightParameterChanges((event.target.valueAsNumber)) }} className='text-slate-300  text-opacity-100  border-2 border-opacity-100 border-slate-600 col-start-11 col-span-2 bg-transparent text-center ' />
                        </div>
                        <div className='  grid grid-cols-12 mt-2  '>
                            <label htmlFor="z" className='text-slate-300 capitalize col-span-2 opacity-80'>depth</label>
                            <input type="range" value={gridDepthParameter} min={1} max={100} name="z" id="z" onChange={event => { depthParameterChanges((event.target.valueAsNumber)) }} className='text-slate-300 col-start-4 col-span-6' />
                            <input type="number" value={gridDepthParameter} min={1} max={100} name="z" id="z" onChange={event => { depthParameterChanges((event.target.valueAsNumber)) }} className='text-slate-300  text-opacity-100  border-2 border-opacity-100 border-slate-600 col-start-11 col-span-2 bg-transparent text-center ' />
                        </div>



                    </form>

                </div>
            </div>
        </div>
    )
}

export default lateralPanelParameter