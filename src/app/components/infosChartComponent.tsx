import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setStableDataPoints, setUnstableDataPoints, selectStableDataPoints, selectUnstableDataPoints } from './lateralPanels/reducers/controllerParameterReducer';
import { selectNumberFrame, selectCellsNumber, selectStableCellsNumber, selectUnstableCellsNumber } from './lateralPanels/reducers/infoParametersReducer';
import * as d3 from "d3";
import { selectDataPoints, setDataPoints } from './lateralPanels/reducers/controllerParameterReducer';
import CellTooltip from './lateralPanels/cellTooltip';
import { selectShowAllCell, selectShowStableCell, selectShowUnstableCell } from './lateralPanels/reducers/infoParametersReducer';


interface DataPoint {
    frame: number;
    cellule: number;
}
interface ArrayPoint {
    id: string
    pointList: DataPoint[]
}

interface showParameters {
    showAllCell: boolean;
    showStableCell: boolean;
    showUnstableCell: boolean;
}

function infosChartComponent(props: showParameters) {
    const dispatch = useDispatch();

    const currentFrame: number = useSelector(selectNumberFrame)
    const cellsNumber: number = useSelector(selectCellsNumber)

    const normalDataPointsToDisplay: DataPoint[] = useSelector(selectDataPoints)
    const stableDataPointsToDisplay: DataPoint[] = useSelector(selectStableDataPoints)
    const unstableDataPointsToDisplay: DataPoint[] = useSelector(selectUnstableDataPoints)
    const stableCellsNumber: number = useSelector(selectStableCellsNumber)
    const unstableCellsNumber: number = useSelector(selectUnstableCellsNumber)
    const showAllCell: boolean = useSelector(selectShowAllCell)
    const showStableCell: boolean = useSelector(selectShowStableCell)
    const showUnstableCell: boolean = useSelector(selectShowUnstableCell)

    const data: ArrayPoint[] = []

    const [currentHoverPoint, setCurrentHoverPoint] = useState<HoverPointState | null>(null)
    //const hoverPoint: HoverPointState | null = useSelector(selectUnstableCellsNumber)

    interface HoverPointState {
        data: string;
        mouseX: number;
        mouseY: number;
    }


    const onPointHover = (event: MouseEvent, d: DataPoint) => {
        event.preventDefault();
        const newPoint: HoverPointState = {
            data: (`frame : ${d.frame}, cells : ${d.cellule}`),
            mouseX: event.clientX,
            mouseY: event.clientY
        }
        setCurrentHoverPoint(newPoint)
    };

    useEffect(() => {
        const newData: DataPoint = {
            frame: currentFrame,
            cellule: cellsNumber,
        };
        const newDataStable: DataPoint = {
            frame: currentFrame,
            cellule: stableCellsNumber,
        };
        const newDataUnstable: DataPoint = {
            frame: currentFrame,
            cellule: unstableCellsNumber,
        };

        const newDatasArray: DataPoint[] = [...normalDataPointsToDisplay];
        newDatasArray.push(newData);
        const newDatasStablesArray: DataPoint[] = [...stableDataPointsToDisplay];
        newDatasStablesArray.push(newDataStable);
        const newDatasUnstableArray: DataPoint[] = [...unstableDataPointsToDisplay];
        newDatasUnstableArray.push(newDataUnstable);
        dispatch(setDataPoints(newDatasArray));
        dispatch(setStableDataPoints(newDatasStablesArray));
        dispatch(setUnstableDataPoints(newDatasUnstableArray));

        const newArrayAll: ArrayPoint = { id: 'all', pointList: newDatasArray };
        const newArrayStable: ArrayPoint = { id: 'stable', pointList: newDatasStablesArray };
        const newArrayUnstable: ArrayPoint = { id: 'unstable', pointList: newDatasUnstableArray };
        data.push(newArrayAll, newArrayStable, newArrayUnstable);
    }, [cellsNumber, currentFrame]);

    useEffect(() => {
        const svg = d3.select('#line-chart')
            .attr('width', 500)
            .attr('height', 300);

        svg.selectAll('*').remove();

        const margin = { top: 20, right: 50, bottom: 30, left: 40 };
        const width = 500 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;



        const selectGlobalScale = () => {
            const allDataPoints = [
                ...normalDataPointsToDisplay,
                ...stableDataPointsToDisplay,
                ...unstableDataPointsToDisplay
            ];

            const [minX, maxX] = d3.extent(allDataPoints, d => d.frame) as [number, number];
            const [minY, maxY] = d3.extent(allDataPoints, d => d.cellule) as [number, number];
            return { minX, maxX, minY, maxY };
        };

        const chart = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const globalScale = selectGlobalScale()
        const xScale = d3.scaleLinear()
            .domain([globalScale.minX, globalScale.maxX])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([globalScale.minY, globalScale.maxY])
            .range([height, 0]);

        const color = d3.scaleOrdinal(d3.schemeCategory10);


        // Définir l'axe X
        chart.append("g")
            .attr("transform", `translate(0,${height})`)
            .attr('class', 'text-sm text-slate-500')
            .call(d3.axisBottom(xScale).ticks(5));

        // Définir l'axe Y
        chart.append("g")
            .attr('class', 'text-sm  text-slate-500')
            .call(d3.axisLeft(yScale).ticks(5));


        const line = d3.line<DataPoint>()
            .x(d => xScale(d.frame))
            .y(d => yScale(d.cellule));

        const seriesData = [];
        if (showAllCell == true) {
            seriesData.push({ name: 'Normal', data: normalDataPointsToDisplay, color: '#81d4fa' })
        }
        if (showStableCell == true) {
            seriesData.push({ name: 'Stable', data: stableDataPointsToDisplay, color: '#4caf50' })
        }
        if (showUnstableCell == true) {
            seriesData.push({ name: 'Unstable', data: unstableDataPointsToDisplay, color: '#f44336' })
        }


        let lines = chart.append('g')
            .attr('class', 'lines');

        lines.selectAll('.line-group')
            .data(seriesData)
            .enter()
            .append('g')
            .attr('class', 'line-group')
            .append('path')
            .attr('class', 'line')
            .attr('d', d => line(d.data))
            .style('stroke', d => d.color)
            .style('fill', 'none')
            .style('stroke-width', '1.5px')



        // Ajoute les cercles pour chaque serie
        lines.selectAll('.circle-group')
            .data(seriesData)
            .enter()
            .append('g')
            .style('fill', d => d.color)
            .selectAll('.circle')
            .data(d => d.data)
            .enter()
            .append('circle')
            .attr('cx', d => xScale(d.frame))
            .attr('cy', d => yScale(d.cellule))
            .attr('r', 3)
            .style('opacity', 0.85)
            .on('mouseover', function (event, d) {
                onPointHover(event, d)
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', 6);
            })
            .on('mouseout', function (event) {
                setCurrentHoverPoint(null)
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', 3);
            });
    }, [normalDataPointsToDisplay, stableDataPointsToDisplay, unstableDataPointsToDisplay, showAllCell, showStableCell, showUnstableCell]);



    return (
        <>
            <svg id="line-chart" className=''></svg>

            {currentHoverPoint ? (<CellTooltip
                mouseX={currentHoverPoint.mouseX - 50}
                mouseY={currentHoverPoint.mouseY - 50}
                data={currentHoverPoint.data}
            />) : null}</>
    );
}

export default infosChartComponent