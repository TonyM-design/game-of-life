import React, { useState } from 'react'
import LateralPanelParameter from './lateralPanels/lateralPanelParameter'
import LateralPanelController from './lateralPanels/lateralPanelController'
import CellTooltip from './lateralPanels/cellTooltip'
import { useDispatch, useSelector } from 'react-redux'
import { selectGameIsActive } from '../reducers/controllerParameterReducer'
import LateralPanelRule from './lateralPanels/lateralPanelRule'
import LateralPanelInfos from './lateralPanels/lateralPanelInfos'
import { selectCurrentHoverCell } from '../reducers/gridParametersReducer'


function lateralMenuComponent() {

    const [parametersIsOpen, setParameterIsOpen] = useState(false)
    const [rulesIsOpen, setRulesIsOpen] = useState(false)
    const [infosIsOpen, setInfosIsOpen] = useState(false)

    const gameIsActive: boolean = useSelector(selectGameIsActive)
    const dispatch = useDispatch();

    const currentHoverCell = useSelector(selectCurrentHoverCell)


    const changeParametersIsOpen = () => {
        setParameterIsOpen(!parametersIsOpen)
        setInfosIsOpen(false)
        setRulesIsOpen(false)
    }
    const changeRulesIsOpen = () => {
        setParameterIsOpen(false)
        setInfosIsOpen(false)
        setRulesIsOpen(!rulesIsOpen)
    }
    const changeInfosIsOpen = () => {
        setParameterIsOpen(false)
        setInfosIsOpen(!infosIsOpen)
        setRulesIsOpen(false)
    }

    return (
        <div>



            <div className='absolute z-10 w-full  '>
                <div className=' mt-2 mx-4 '>

                    <div className=' flex '>
                        <div className=' flex ' >
                            <div className='   focus:border-opacity-100' onClick={() => changeParametersIsOpen()}>
                                <button className={'tracking-widest w-fit   border-4 border-white  border-y-0 -skew-x-12  focus:border-opacity-100 	 text-slate-300 justify-center d-flex px-2 py-1  hover:text-slate-900  shadow-sm hover:cursor-pointer hover:bg-slate-500   border-r-transparent ' + (parametersIsOpen ? "bg-slate-500 bg-opacity-60 border-opacity-100 " : " border-opacity-30")}>
                                    <h4 className='skew-x-12 uppercase '> Parameters</h4>
                                </button>
                            </div>
                            <div className='   focus:border-opacity-100' onClick={() => changeRulesIsOpen()}>
                                <button className={'tracking-widest w-fit   border-4 border-white  border-y-0 -skew-x-12  focus:border-opacity-100 	 text-slate-300 justify-center d-flex px-2 py-1  hover:text-slate-900  shadow-sm hover:cursor-pointer hover:bg-slate-500   border-r-transparent ' + (rulesIsOpen ? "bg-slate-500 bg-opacity-60 border-opacity-100 " : " border-opacity-30")}>
                                    <h4 className='skew-x-12 uppercase '> Rules</h4>
                                </button>
                            </div>

                            <div className='   focus:border-opacity-100' onClick={() => changeInfosIsOpen()}>
                                <button className={'tracking-widest w-fit   border-4 border-white  border-y-0 -skew-x-12  focus:border-opacity-100 	 text-slate-300 justify-center d-flex px-2 py-1  hover:text-slate-900  shadow-sm hover:cursor-pointer hover:bg-slate-500   border-r-transparent ' + (infosIsOpen ? "bg-slate-500 bg-opacity-60 border-opacity-100 " : " border-opacity-30")}>
                                    <h4 className='skew-x-12 uppercase '> Infos</h4>
                                </button>
                            </div>

                        </div>
                        <div className=' ml-6' >
                            <LateralPanelController />

                        </div>  <text className={' ml-6 mt-0.5 capitalize opacity-80 ' + (gameIsActive ? "text-green-500" : "text-red-500")}>{gameIsActive ? "App is running" : "App isn't running"}
                            <span className={"animate-ping absolute m-2.5  h-2 w-2 rounded-full opacity-75 " + (gameIsActive ? "bg-green-400" : "bg-red-500")}></span>
                            <span className={" absolute m-2.5  rounded-full h-2 w-2  " + (gameIsActive ? "bg-green-400" : "bg-red-500")}></span>
                        </text>
                    </div>

                </div>


            </div>
            <div className='absolute z-11 w-1/5 mt-8'>

                {parametersIsOpen ? <LateralPanelParameter /> : null}
                {rulesIsOpen ? <LateralPanelRule /> : null}

                {currentHoverCell ? (<CellTooltip
                    mouseX={currentHoverCell.mouseX}
                    mouseY={currentHoverCell.mouseY}
                    data={currentHoverCell.cell}
                />) : null}
            </div>

            <div className='absolute z-11 mt-8'>

                {infosIsOpen ? <LateralPanelInfos /> : null}




            </div>
        </div>
    )
}

export default lateralMenuComponent