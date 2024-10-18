import { useEffect } from "react"
import { selectCurrentHoverCell } from "./reducers/gridParametersReducer"
import { useSelector } from "react-redux"

interface HoverPointState {
    data: string;
    mouseX: number;
    mouseY: number;
}

function cellTooltip(props : HoverPointState ) {
    const currentHoverCell = useSelector(selectCurrentHoverCell)

    useEffect(() => {
    }, [currentHoverCell])
    return (
        <div 
            className="absolute overflow-visible z-10 bg-slate-700 rounded-md bg-opacity-75 p-0.5"
            style={{ 
                top: props.mouseY + 10, // Ajustement de l'offset
                left: props.mouseX + 10, 
                position: 'fixed'
            }}
        >
            <div className="h-full w-full border border-white border-opacity-20 rounded-md text-white py-1 px-2 shadow-sm">
                {props.data}
            </div>
        </div>
    ) ;
}

export default cellTooltip