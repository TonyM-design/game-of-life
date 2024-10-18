"use client";

import { faDownload, faForward, faPause, faRetweet, faUpload } from '@fortawesome/free-solid-svg-icons'
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { selectGameIsActive, selectNumberFrame, setGameIsActive, setUploadModalIsOpen } from './reducers/controllerParameterReducer';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons/faFolderOpen';
import * as THREE from 'three';
import { selectBirthRate, selectGridIs3DGrid, selectLonelinessLimit, selectStability, selectSurpopulationLimit } from './reducers/gridParametersReducer';
import { selectCellPositions, selectLoadedCellPositions, setCellPositions, setStepByStepMode } from './reducers/globalGameReducer';


function lateralPanelController() {
    const [rulesToSave, setRulesToSave] = useState<SavedRules | null>(null)
    const [cellsToSave, setCellsToSave] = useState<THREE.Vector3[]>([])


    const positionCellToLoad: string[] = useSelector(selectLoadedCellPositions)

    const cellPosition = useSelector(selectCellPositions)
    const gameIsActive: boolean = useSelector(selectGameIsActive)
    const dispatch = useDispatch();
    const savedZAxis: boolean = useSelector(selectGridIs3DGrid)
    const savedBirthRate: number = useSelector(selectBirthRate)
    const savedSurpopulation: number = useSelector(selectSurpopulationLimit)
    const savedLoneliness: number = useSelector(selectLonelinessLimit)
    const savedStability: number = useSelector(selectStability)

    let clickTest: boolean = false

    const startGame = () => {
        dispatch(setStepByStepMode(false))
        dispatch(setGameIsActive(true))
    }
    const stopGame = () => {
        dispatch(setGameIsActive(false))
        console.log(gameIsActive)

    }
    const openUploadModal = () => {
        dispatch(setUploadModalIsOpen(true))
    }

    const reset = () => {
        dispatch(setGameIsActive(false))
        const resetPositions: string[] = [];
        dispatch(setCellPositions(resetPositions))
    }

    const nextFrame = () => {
        dispatch(setStepByStepMode(true))
    }

    interface SavedRules {
        zAxis: boolean,
        birthRate: number,
        surpopulation: number,
        loneliness: number,
        stability: number
    }

    interface SavedData {
        rule: SavedRules;
        cellPositions: THREE.Vector3[];
    }


    const saveJsonToFile = () => {
        console.log(rulesToSave)
        console.log(cellsToSave)
        if (rulesToSave !== null && cellsToSave !== null) {
            const savedData: SavedData = {
                rule: rulesToSave,
                cellPositions: cellsToSave,
            }
            const fileData = JSON.stringify(savedData, null, 2);
            const blob = new Blob([fileData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `gol_${Date.now()}.json`;
            link.click();

            URL.revokeObjectURL(url);
        }
    };


    useEffect(() => {
   /*     console.log("test useEffect !!!")
        const newSavedRule: SavedRules = {
            zAxis: savedZAxis,
            birthRate: savedBirthRate,
            surpopulation: savedSurpopulation,
            loneliness: savedLoneliness,
            stability: savedStability
        }
        setRulesToSave(newSavedRule)
        const newSavedCellPositions: [] = cellPosition
        setCellsToSave(newSavedCellPositions)*/
    }, [cellPosition])



    return (
        <>
            <div className='flex mt-1 mr-2'>
                <button className='text-slate-300 text-xl mx-2 hover:text-slate-200 hover:cursor-pointer active:text-slate-500 px-0.5 '>
                    <FontAwesomeIcon
                        onClick={() => reset()}
                        icon={faRetweet}
                    />
                </button>
                <button onClick={() => stopGame()} className='text-slate-300 text-xl mx-2  hover:text-slate-200 hover:cursor-pointer active:text-slate-500 px-0.5 ' >
                    <FontAwesomeIcon
                        icon={faPause}
                    />
                </button>
                <button onClick={() => startGame()} className='text-slate-300 text-xl mx-2  hover:text-slate-200 hover:cursor-pointer active:text-slate-500 px-0.5 ' >
                    <FontAwesomeIcon
                        icon={faPlay}
                    />
                </button>
                <button onClick={() => nextFrame()} className='text-slate-300 text-xl ml-2  hover:text-slate-200 hover:cursor-pointer active:text-slate-500 px-0.5 '>
                    <FontAwesomeIcon
                        icon={faForward}
                    />
                </button>
                <div className='ml-4 border-l border-slate-600'>
                    <button onClick={() => { openUploadModal() }} className='text-slate-300 text-xl ml-4  hover:text-slate-200 hover:cursor-pointer active:text-slate-500 px-0.5  '>
                        <FontAwesomeIcon
                            icon={faFolderOpen}
                        />
                    </button>
                    <button type='submit' onClick={() => { saveJsonToFile() }} className='text-slate-300 text-xl ml-2  hover:text-slate-200 hover:cursor-pointer active:text-slate-500 px-0.5 '>

                        <FontAwesomeIcon
                            icon={faDownload}
                        />
                    </button>
                </div>

            </div>



        </>
    )
}

export default lateralPanelController