"use client";
import React, { ChangeEvent, useState } from 'react'
import gridParameterReducer, { selectHeight } from './reducers/gridHeightReducer';
import { useSelector, useDispatch } from 'react-redux';
import { selectHideGrid, selectCustomGrid, selectCubeSize, selectGridDepth, selectGridHeight, selectGridIs3DGrid, selectGridIsPointLines, selectGridWidth, setCubeSize, setGridDepth, setGridHeight, setGridWidth, setIs3dGrid, setHideGrid, setIsCustomGrid, setBirthRate, setLonelinessLimit, setSurpopulationLimit, selectBirthRate, selectSurpopulationLimit, selectLonelinessLimit, setSpeed, selectSpeed, setPerimeter, selectPerimeter, setTypeOfCell, selectTypeOfCell } from './reducers/gridParametersReducer'
import { selectGameIsActive } from './reducers/controllerParameterReducer';
function lateralPanelParameter() {
    const gridHeightParameter = useSelector(selectGridHeight);
    const gridwidthParameter = useSelector(selectGridWidth);
    const gridDepthParameter = useSelector(selectGridDepth);
    const gridIsInfiniteParameter = useSelector(selectGridIsPointLines); // ici a modifier
    const gridIs3D = useSelector(selectGridIs3DGrid);
    const cubeSize = useSelector(selectCubeSize);
    const hideGrid = useSelector(selectHideGrid);
    const perimeter = useSelector(selectPerimeter);
    const customGrid = useSelector(selectCustomGrid);
    const birthRate = useSelector(selectBirthRate);
    const surpopulationLimit = useSelector(selectSurpopulationLimit);
    const lonelinessLimit = useSelector(selectLonelinessLimit);
    const speed = useSelector(selectSpeed);
    const gameIsRunning = useSelector(selectGameIsActive)
    const typeOfCell = useSelector(selectTypeOfCell)
    // ajouter le diabled des dimension si case non cocher
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
    const cubeSizeParameterChanges = (valueAsNumber: number) => {
        if (gameIsRunning === false) {
            const value: number = Number(valueAsNumber)
            dispatch(setCubeSize(value))
        }
    }

    const is3DGridParameterChanges = (boolean: boolean) => {
        dispatch(setIs3dGrid(boolean))
    }
    const isHideGrid = (boolean: boolean) => {
        dispatch(setHideGrid(boolean))
    }
    const isPerimeter = (boolean: boolean) => {
        dispatch(setPerimeter(boolean))
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

    return (
        <div className='w-12/12 m-2 ml-4 '>
            <h4 className='text-slate-300 bg-slate-700 opacity-80 w-fit'>Parameters </h4>
            <div className='mt-1  rounded-md p-2.5  bg-slate-700 bg-opacity-80  '>
                <h4 className='text-slate-300   opacity-80 w-fit mb-2'>Grid <text className='text-slate-400 ml-2'>(only for initial displaying)</text> {">"}</h4>

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
            <div className='mt-2  rounded-md p-2.5  bg-slate-700 bg-opacity-80  '>
                <h4 className='text-slate-300   opacity-80 w-fit mb-2'>Rules  {">"} </h4>

                <form action="border-0 border-b border-slate-600 pb-2">
                    <div className='  grid grid-cols-12 mt-2  '>
                        <label className='text-slate-300 capitalize col-span-3  opacity-80'>z-axis</label>
                        <input type="checkbox" checked={gridIs3D} onChange={event => { is3DGridParameterChanges(!gridIs3D) }} className='col-start-4 m-1' name="" id="" />
                    </div>
                    <div className='  grid grid-cols-12 mt-2  '>
                        <label className='text-slate-300 capitalize col-span-3  opacity-80'>perimeter</label>
                        <input disabled type="checkbox" checked={perimeter} onChange={event => { isPerimeter(!perimeter) }} className='col-start-4 m-1' name="" id="" />
                    </div>
                    <div className='  grid grid-cols-12 mt-2  '>
                        <label className='text-slate-300 capitalize col-span-3  opacity-80'>cell type</label>
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
                        <label className='text-slate-300 capitalize col-span-2 opacity-80'>Birth rate</label>
                        <input type="range" value={birthRate} min={1} max={25} className='text-slate-300 col-start-4 col-span-6' onChange={event => { birthRateParameterChanges((event.target.valueAsNumber)) }} />
                        <input type="number" value={birthRate} min={1} max={25} className='text-slate-300  text-opacity-100  border-2 border-opacity-100 border-slate-600 col-start-11 col-span-2 bg-transparent text-center ' onChange={event => { birthRateParameterChanges((event.target.valueAsNumber)) }} />
                    </div>
                    <div className='border rounded-md border-slate-300 my-4 p-5'>

                        <p className='text-slate-300 capitalize col-span-12 opacity-80'>
                            Death rate : {lonelinessLimit}/{surpopulationLimit}</p>
                        <div className='  grid grid-cols-12 mt-2   '>
                            <label className='text-slate-300 capitalize col-span-12 opacity-80'>Surpopulation</label>
                            <input type="range" value={surpopulationLimit} min={0} max={25} className='text-slate-300  col-span-8' onChange={event => { surpopulationLimitParameterChanges((event.target.valueAsNumber)) }} />
                            <input type="number" value={surpopulationLimit} min={0} max={25} className='text-slate-300  text-opacity-100  border-2 border-opacity-100 border-slate-600 col-start-11 col-span-2 bg-transparent text-center ' onChange={event => { surpopulationLimitParameterChanges((event.target.valueAsNumber)) }} />
                        </div>
                        <div className='  grid grid-cols-12 mt-2  '>
                            <label className='text-slate-300 capitalize col-span-12 opacity-80'>Loneliness </label>
                            <input type="range" value={lonelinessLimit} min={0} max={5} className='text-slate-300  col-span-8' onChange={event => { lonelinessLimitParameterChanges((event.target.valueAsNumber)) }} />
                            <input type="number" value={lonelinessLimit} min={0} max={5} className='text-slate-300  text-opacity-100  border-2 border-opacity-100 border-slate-600 col-start-11 col-span-2 bg-transparent text-center ' onChange={event => { lonelinessLimitParameterChanges((event.target.valueAsNumber)) }} />
                        </div>



                    </div>


                    <div className='  grid grid-cols-12 mt-2  '>
                        <label htmlFor="y" className='text-slate-300 capitalize col-span-2 opacity-80'>speed</label>
                        <input type="range" value={speed} min={1} max={5} className='text-slate-300 col-start-4 col-span-6' onChange={event => { speedParameterChanges((event.target.valueAsNumber)) }} />
                        <input type="number" value={speed} min={1} max={5} className='text-slate-300  text-opacity-100  border-2 border-opacity-100 border-slate-600 col-start-11 col-span-2 bg-transparent text-center ' onChange={event => { speedParameterChanges((event.target.valueAsNumber)) }} />
                    </div>



                </form>


            </div>
        </div>
    )
}

export default lateralPanelParameter