import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { selectNumberFrame, selectCellsNumber, selectShowOldCell, selectShowNewCell, selectOldCellsNumber, selectNewCellsNumber } from '../reducers/infoParametersReducer';
import * as d3 from "d3";
import CellTooltip from './lateralPanels/cellTooltip';
import { selectShowAllCell } from '../reducers/infoParametersReducer';
import { selectResetIsRequired } from '../reducers/controllerParameterReducer';


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
    showOldCell: boolean;
    showNewCell: boolean;
}

function infosChartComponent(props: showParameters) {
    const currentFrame: number = useSelector(selectNumberFrame)
    const cellsNumber: number = useSelector(selectCellsNumber)
    const oldCellsNumber: number = useSelector(selectOldCellsNumber)
    const newCellsNumber: number = useSelector(selectNewCellsNumber)
    const showAllCell: boolean = useSelector(selectShowAllCell)
    const showOldCell: boolean = useSelector(selectShowOldCell)
    const showNewCell: boolean = useSelector(selectShowNewCell)
    const resetIsRequired: boolean = useSelector(selectResetIsRequired)
    const [allCellDataPoint, setAllCellsDataPoint] = useState<DataPoint[]>()
    const [newCellDataPoint, setNewCellsDataPoint] = useState<DataPoint[]>()
    const [oldCellDataPoint, setOldCellsDataPoint] = useState<DataPoint[]>()

    const data: ArrayPoint[] = []

    const [currentHoverPoint, setCurrentHoverPoint] = useState<HoverPointState | null>(null)
    interface HoverPointState {
        data: string;
        mouseX: number;
        mouseY: number;
    }


    const onPointHover = (event: MouseEvent, datapoint: DataPoint) => {
        event.preventDefault();
        const newPoint: HoverPointState = {
            data: (`frame : ${datapoint.frame}, cells : ${datapoint.cellule}`),
            mouseX: event.clientX,
            mouseY: event.clientY
        }
        setCurrentHoverPoint(newPoint)
    };
    useEffect(() => {
        setAllCellsDataPoint([])
        setOldCellsDataPoint([])
        setNewCellsDataPoint([])

    }, [resetIsRequired])


    useEffect(() => {
        const newDataAllCells: DataPoint = {
            frame: currentFrame,
            cellule: cellsNumber,
        };
        const newDataOldCells: DataPoint = {
            frame: currentFrame,
            cellule: oldCellsNumber,
        };
        const newDataNewCells: DataPoint = {
            frame: currentFrame,
            cellule: newCellsNumber,
        };
        if (allCellDataPoint === undefined) {
            setAllCellsDataPoint([newDataAllCells]);
        }
        else {
            setAllCellsDataPoint([...allCellDataPoint, newDataAllCells]);
        }
        if (oldCellDataPoint === undefined) {
            setOldCellsDataPoint([newDataOldCells])
        }
        else {
            setOldCellsDataPoint([...oldCellDataPoint, newDataOldCells])
        }
        if (newCellDataPoint === undefined) {
            setNewCellsDataPoint([newDataNewCells]);
        }
        else {
            setNewCellsDataPoint([...newCellDataPoint, newDataNewCells])
        }


        const newArrayAll: ArrayPoint = { id: 'all', pointList: allCellDataPoint || [] };
        const newArrayOld: ArrayPoint = { id: 'old', pointList: oldCellDataPoint || [] };
        const newArrayNew: ArrayPoint = { id: 'new', pointList: newCellDataPoint || [] };
        data.push(newArrayAll, newArrayOld, newArrayNew);
    }, [currentFrame]);

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
                ...allCellDataPoint || [],
                ...oldCellDataPoint || [],
                ...newCellDataPoint || []
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


        chart.append("g")
            .attr("transform", `translate(0,${height})`)
            .attr('class', 'text-sm text-slate-500')
            .call(d3.axisBottom(xScale).ticks(5));

        chart.append("g")
            .attr('class', 'text-sm  text-slate-500')
            .call(d3.axisLeft(yScale).ticks(5));


        const line = d3.line<DataPoint>()
            .x(d => xScale(d.frame))
            .y(d => yScale(d.cellule));

        const seriesData = [];
        if (showAllCell == true) {
            seriesData.push({ name: 'Normal', data: allCellDataPoint, color: '#81d4fa' })
        }
        if (showOldCell == true) {
            seriesData.push({ name: 'Old', data: oldCellDataPoint, color: '#4caf50' })
        }
        if (showNewCell == true) {
            seriesData.push({ name: 'New', data: newCellDataPoint, color: '#f44336' })
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
            .attr('d', d => line(d.data || []))
            .style('stroke', d => d.color)
            .style('fill', 'none')
            .style('stroke-width', '1.5px')

        lines.selectAll('.circle-group')
            .data(seriesData)
            .enter()
            .append('g')
            .style('fill', d => d.color)
            .selectAll('.circle')
            .data(d => d.data || [])
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
    }, [allCellDataPoint, oldCellDataPoint, newCellDataPoint, showAllCell, showOldCell, showNewCell]);



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