import React from 'react'
import LateralPanelParameter from './lateralPanels/lateralPanelParameter'
import LateralPanelController from './lateralPanels/lateralPanelController'

function lateralMenuComponent() {
    return (
        <div className='absolute z-10 w-2/12   '>
            <LateralPanelParameter />
            <LateralPanelController />
            </div>
    )
}

export default lateralMenuComponent