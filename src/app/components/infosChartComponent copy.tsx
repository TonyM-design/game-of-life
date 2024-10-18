import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { selectGameIsActive, selectNumberFrame, selectCellsNumber, selectStableCellsNumber, selectUnstableCellsNumber, setStableDataPoints, setUnstableDataPoints, selectStableDataPoints, selectUnstableDataPoints } from './lateralPanels/reducers/controllerParameterReducer';
import { select, selectAll } from 'd3';
import * as d3 from "d3";
import { selectDataPoints, setDataPoints } from './lateralPanels/reducers/controllerParameterReducer';


interface DataPoint {
    frame: number;
    cellule: number;
}
function infosChartComponent() {
    const dispatch = useDispatch();

    const currentFrame: number = useSelector(selectNumberFrame)
    const cellsNumber: number = useSelector(selectCellsNumber)

    const normalDataPointsToDisplay: DataPoint[] = useSelector(selectDataPoints)
    const stableDataPointsToDisplay: DataPoint[] = useSelector(selectStableDataPoints)
    const unstableDataPointsToDisplay: DataPoint[] = useSelector(selectUnstableDataPoints)
    const stableCellsNumber: number = useSelector(selectStableCellsNumber)
    const unstableCellsNumber: number = useSelector(selectUnstableCellsNumber)
    const stablesCells: DataPoint[] = useSelector(selectDataPoints)
    const unstablesCells: DataPoint[] = useSelector(selectDataPoints)

//ok
    useEffect(() => {
        const newData: DataPoint = {
            frame: currentFrame,
            cellule: cellsNumber
        }
        const newDataStable: DataPoint = {
            frame: currentFrame,
            cellule: stableCellsNumber
        }
        const newDataUnstable: DataPoint = {
            frame: currentFrame,
            cellule: unstableCellsNumber
        }

        const newDatasArray: DataPoint[] = [...normalDataPointsToDisplay]
        newDatasArray.push(newData)

        const newDatasStablesArray: DataPoint[] = [...normalDataPointsToDisplay]
        newDatasStablesArray.push(newDataStable)

        const newDatasUnstableArray: DataPoint[] = [...normalDataPointsToDisplay]
        newDatasUnstableArray.push(newDataUnstable)


        dispatch(setDataPoints(newDatasArray))
        dispatch(setStableDataPoints(newDatasStablesArray))
        dispatch(setUnstableDataPoints(newDatasUnstableArray))


    }, [cellsNumber, currentFrame])

    useEffect(() => {

        // Sélectionne l'élément SVG
        const svg = d3.select("#line-chart")
            .attr("width", "auto")
            .attr("height", 300)


        svg.selectAll("*").remove();

        // Marges et dimensions du graphique
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = 600 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        // Groupe pour le graphique
        const chart = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Définir les échelles des axes via min-max 
        const x = d3.scaleLinear()
            .domain([d3.min(normalDataPointsToDisplay.slice(-35), d => d.frame) as unknown as number, d3.max(normalDataPointsToDisplay.slice(-35), d => d.frame) as number])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([d3.min(normalDataPointsToDisplay.slice(-35), d => d.cellule) as unknown as number, d3.max(normalDataPointsToDisplay.slice(-35), d => d.cellule) as number])
            .range([height, 0]);

        // Définir l'axe X
        chart.append("g")
            .attr("transform", `translate(0,${height})`)
            .attr('class', 'x-axis')
            .call(d3.axisBottom(x).ticks(5));

        // Définir l'axe Y
        chart.append("g")
        .attr('class', 'z-axis')
            .call(d3.axisLeft(y).ticks(5));

        // Ligne de connexion entre les points de données
        const line = d3.line<DataPoint>()
            .x(d => x(d.frame))
            .y(d => y(d.cellule));

        // ajout lignes sur graphique
        // <---DEBUT normal number cell
        chart.append("path")
        .datum(normalDataPointsToDisplay.slice(-35))
        .attr("fill", "none")
        .attr("stroke", "#81d4fa")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    chart.append("g")
        .selectAll("circle")
        .data(normalDataPointsToDisplay.slice(-35))
        .enter()
        .append("circle")
        .attr("cx", d => x(d.frame))
        .attr("cy", d => y(d.cellule))
        .attr("r", 2.5)
        .attr("fill", "#81d4fa")
        .attr("stroke", "grey");
        // <---FIN normal number cell

        // <---DEBUT stable number cell
     const lineStable = d3.line<DataPoint>()
        .x(d => x(d.frame))
        .y(d => y(d.cellule));


    chart.append("g")
        .selectAll("circleStable")
        .data(stableDataPointsToDisplay.slice(-35)) 
        .enter()
        .append("circleStable")
        .attr("cx", d => x(d.frame))
        .attr("cy", d => y(d.cellule))
        .attr("r", 2.5)
        .attr("fill", "#4caf50")
        .attr("stroke", "grey");
        // <---FIN stable number cell



        
}, [normalDataPointsToDisplay, stableDataPointsToDisplay, cellsNumber, currentFrame]);


    return (
        <svg id="line-chart" className='-ml-4 w-full overflow-scroll'></svg>
    );
}

export default infosChartComponent