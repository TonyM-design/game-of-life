"use client";
import React, {useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { selectCubeSize, selectGridIs3DGrid, setCubeSize, setIs3dGrid, setBirthRate, setLonelinessLimit, setSurpopulationLimit, selectBirthRate, selectSurpopulationLimit, selectLonelinessLimit, setSpeed, selectSpeed, setPerimeter, selectPerimeter, setTypeOfCell, selectTypeOfCell, setLinkCells, selectLinkCells, setStability, selectStability, selectHideCells, setHideCells } from './reducers/gridParametersReducer'
import { selectGameIsActive } from './reducers/controllerParameterReducer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import CellTooltip from './cellTooltip';
function lateralPanelParameter() {

    interface HoverPointState {
        data: string;
        mouseX: number;
        mouseY: number;
    }

    const gridIs3D = useSelector(selectGridIs3DGrid);
    const cubeSize = useSelector(selectCubeSize);
    const perimeter = useSelector(selectPerimeter);
    const linkCells = useSelector(selectLinkCells);
    const birthRate = useSelector(selectBirthRate);
    const surpopulationLimit = useSelector(selectSurpopulationLimit);
    const lonelinessLimit = useSelector(selectLonelinessLimit);
    const speed = useSelector(selectSpeed);
    const stability = useSelector(selectStability);
    const gameIsRunning = useSelector(selectGameIsActive)
    const hideCells = useSelector(selectHideCells)
    const dispatch = useDispatch();

    const [currentHoverTooltip, setCurrentHoverTooltip] = useState<HoverPointState | null>(null)


    const cubeSizeParameterChanges = (valueAsNumber: number) => {
        if (gameIsRunning === false) {
            const value: number = Number(valueAsNumber)
            dispatch(setCubeSize(value))
        }
    }

    const is3DGridParameterChanges = (boolean: boolean) => {
        dispatch(setIs3dGrid(boolean))
    }
    const isPerimeter = (boolean: boolean) => {
        dispatch(setPerimeter(boolean))
    }
    const isLinkCells = (boolean: boolean) => {
        dispatch(setLinkCells(boolean))
    }
    const isHideCells = (boolean: boolean) => {
        dispatch(setHideCells(boolean))
    }

    const birthRateParameterChanges = (valueAsNumber: number) => {
        const value: number = Number(valueAsNumber)
        dispatch(setBirthRate(value))
    }
    const surpopulationLimitParameterChanges = (valueAsNumber: number) => {
        const value: number = Number(valueAsNumber)
        dispatch(setSurpopulationLimit(value))
    }
    const lonelinessLimitParameterChanges = (valueAsNumber: number) => {
        const value: number = Number(valueAsNumber)
        dispatch(setLonelinessLimit(value))
    }
    const speedParameterChanges = (valueAsNumber: number) => {
        const value: number = Number(valueAsNumber)
        dispatch(setSpeed(value))
    }
    const typeOfCellChanges = (type: String) => {
        console.log(type)
        dispatch(setTypeOfCell(type))
    }

    const stabilityChanges = (valueAsNumber: number) => {
        const value: number = Number(valueAsNumber)
        dispatch(setStability(value))
    }

    const infoHover = (event: any, info: string) => {
        event.preventDefault();
        const newPoint: HoverPointState = {
            data: (`${info}`),
            mouseX: event.clientX,
            mouseY: event.clientY
        }
        console.log(newPoint)
        setCurrentHoverTooltip(newPoint)

    };


    return (
        <>
            <div className=' m-2 ml-4   animate-fade-right animate-duration-[800ms] animate-normal'>
                <div className='mt-6  -ml-1 p-2.5  bg-slate-700 bg-opacity-60 border-4 border-white border-y-0 border-r-0    '>
                    <h4 className='text-slate-300   opacity-80 w-fit mb-2'>Rules   </h4>
                    <hr className='border-slate-700' />
                    <form action="border-0 border-b border-slate-600 pb-2">
                        <div className='  grid grid-cols-12 mt-2  '>
                            <label className='text-slate-300 capitalize col-span-3  opacity-80'>
                                z-axis
                                <FontAwesomeIcon icon={faCircleQuestion} onMouseEnter={(event) => { infoHover(event, "Allow displaying cells on z-axis (3d)") }} onMouseLeave={() => { setCurrentHoverTooltip(null) }} className='text-slate-100 opacity-75 ml-1  cursor-pointer ' />
                            </label>
                            <input type="checkbox" checked={gridIs3D} onChange={event => { is3DGridParameterChanges(!gridIs3D) }} className='col-start-5 m-1' name="" id="" />
                        </div>
                        <div className='  grid grid-cols-12 mt-2  '>
                            <label className='text-slate-300 capitalize col-span-4  opacity-80'>perimeter</label>
                            <input type="checkbox" checked={perimeter} onChange={event => { isPerimeter(!perimeter) }} className='col-start-5 m-1' name="" id="" />
                        </div>
                        <div className='  grid grid-cols-12 mt-2  '>
                            <label className='text-slate-300 capitalize col-span-4  opacity-80'>link cells</label>
                            <input type="checkbox" checked={linkCells} onChange={event => { isLinkCells(!linkCells) }} className='col-start-5 m-1' name="" id="" />
                        </div>
                        <div className='  grid grid-cols-12 mt-2  '>
                            <label className='text-slate-300 capitalize col-span-4  opacity-80'>hide cells</label>
                            <input type="checkbox" checked={hideCells} onChange={event => { isHideCells(!hideCells) }} className='col-start-5 m-1' name="" id="" />
                        </div>
                        <div className='  grid grid-cols-12 mt-2  '>
                            <label className='text-slate-300 capitalize col-span-4  opacity-80'>cell type</label>
                            <select onChange={event => { typeOfCellChanges(event.target.value) }} className='text-slate-800 capitalize col-start-5 col-span-6 ' name="" id="">
                                <option>Plane</option>
                                <option>Box</option>
                                <option>Point</option>
                            </select>
                        </div>
                        <div className='  grid grid-cols-12 mt-2  '>
                            <label htmlFor="z" className='text-slate-300 capitalize col-span-4 opacity-80'>cell size</label>
                            <input type="range" value={cubeSize} min={0} max={1} step={0.1} name="cubeSize" id="cubeSize" onChange={event => { cubeSizeParameterChanges((event.target.valueAsNumber)) }} className='text-slate-300 col-start-5 col-span-5' />
                            <input type="number" value={cubeSize} min={0} max={1} step={0.1} name="cubeSize" id="cubeSize" onChange={event => { cubeSizeParameterChanges((event.target.valueAsNumber)) }} className='text-slate-300  text-opacity-100  border-2 border-opacity-100 border-slate-600 col-start-11 col-span-2 bg-transparent text-center ' />
                        </div>
                        <div className='  grid grid-cols-12 mt-2  '>
                            <label className='text-slate-300 capitalize col-span-4 opacity-80'>Birth rate
                                <FontAwesomeIcon icon={faCircleQuestion} onMouseEnter={(event) => { infoHover(event, "Number of adjacent cells required to generate a new cell") }} onMouseLeave={() => { setCurrentHoverTooltip(null) }} className='text-slate-100 opacity-75 ml-1  cursor-pointer ' />
                            </label>
                            <input type="range" value={birthRate} min={1} max={25} className='text-slate-300 col-start-5 col-span-5' onChange={event => { birthRateParameterChanges((event.target.valueAsNumber)) }} />
                            <input type="number" value={birthRate} min={1} max={25} className='text-slate-300  text-opacity-100  border-2 border-opacity-100 border-slate-600 col-start-11 col-span-2 bg-transparent text-center ' onChange={event => { birthRateParameterChanges((event.target.valueAsNumber)) }} />
                        </div>
                        <div className='border rounded-md border-slate-300 my-4 p-5'>

                            <p className='text-slate-300 capitalize col-span-12 opacity-80'>
                                Death rate : {lonelinessLimit}/{surpopulationLimit}</p>
                            <div className='  grid grid-cols-12 mt-2   '>
                                <label className='text-slate-300 capitalize col-span-12 opacity-80'>Surpopulation
                                    <FontAwesomeIcon icon={faCircleQuestion} onMouseEnter={(event) => { infoHover(event, "Maximum limit number of adjacent cells before death cell") }} onMouseLeave={() => { setCurrentHoverTooltip(null) }} className='text-slate-100 opacity-75 ml-1  cursor-pointer ' />
                                </label>

                                <input type="range" value={surpopulationLimit} min={0} max={25} className='text-slate-300  col-span-8' onChange={event => { surpopulationLimitParameterChanges((event.target.valueAsNumber)) }} />
                                <input type="number" value={surpopulationLimit} min={0} max={25} className='text-slate-300  text-opacity-100  border-2 border-opacity-100 border-slate-600 col-start-11 col-span-2 bg-transparent text-center ' onChange={event => { surpopulationLimitParameterChanges((event.target.valueAsNumber)) }} />
                            </div>
                            <div className='  grid grid-cols-12 mt-2  '>
                                <label className='text-slate-300 capitalize col-span-12 opacity-80'>Loneliness
                                    <FontAwesomeIcon icon={faCircleQuestion} onMouseEnter={(event) => { infoHover(event, "Minimum limit number of adjacent cells before death cell") }} onMouseLeave={() => { setCurrentHoverTooltip(null) }} className='text-slate-100 opacity-75 ml-1  cursor-pointer ' />
                                </label>

                                <input type="range" value={lonelinessLimit} min={0} max={5} className='text-slate-300  col-span-8' onChange={event => { lonelinessLimitParameterChanges((event.target.valueAsNumber)) }} />
                                <input type="number" value={lonelinessLimit} min={0} max={5} className='text-slate-300  text-opacity-100  border-2 border-opacity-100 border-slate-600 col-start-11 col-span-2 bg-transparent text-center ' onChange={event => { lonelinessLimitParameterChanges((event.target.valueAsNumber)) }} />
                            </div>



                        </div>


                        <div className='  grid grid-cols-12 mt-2  '>
                            <label htmlFor="y" className='text-slate-300 capitalize col-span-3 opacity-80'>Stability
                                <FontAwesomeIcon icon={faCircleQuestion} onMouseEnter={(event) => { infoHover(event, "Number of iterations without adjacent cell change before a cell become stable, set 0 to disable ") }} onMouseLeave={() => { setCurrentHoverTooltip(null) }} className='text-slate-100 opacity-75 ml-1  cursor-pointer ' />
                            </label>

                            <input type="range" value={stability} min={1} max={26} className='text-slate-300 col-start-5 col-span-5' onChange={event => { stabilityChanges((event.target.valueAsNumber)) }} />
                            <input type="number" value={stability} min={1} max={26} className='text-slate-300  text-opacity-100  border-2 border-opacity-100 border-slate-600 col-start-11 col-span-2 bg-transparent text-center ' onChange={event => { stabilityChanges((event.target.valueAsNumber)) }} />
                        </div>
                        <div className='  grid grid-cols-12 mt-2  '>
                            <label htmlFor="y" className='text-slate-300 capitalize col-span-2 opacity-80'>speed</label>
                            <input type="range" value={speed} min={1} max={5} className='text-slate-300 col-start-5 col-span-5' onChange={event => { speedParameterChanges((event.target.valueAsNumber)) }} />
                            <input type="number" value={speed} min={1} max={5} className='text-slate-300  text-opacity-100  border-2 border-opacity-100 border-slate-600 col-start-11 col-span-2 bg-transparent text-center ' onChange={event => { speedParameterChanges((event.target.valueAsNumber)) }} />
                        </div>



                    </form>


                </div>
            </div>

            {currentHoverTooltip ? <CellTooltip
                mouseX={currentHoverTooltip.mouseX - 50}
                mouseY={currentHoverTooltip.mouseY - 50}
                data={currentHoverTooltip.data}
            /> : null}</>
    )
}

export default lateralPanelParameter