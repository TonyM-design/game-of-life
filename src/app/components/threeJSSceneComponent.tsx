"use client";

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { useDispatch, useSelector } from 'react-redux';
import { selectGridHeight, selectGridWidth, selectGridDepth, selectGridIs3DGrid, selectCubeSize, selectBirthRate, selectSurpopulationLimit, selectLonelinessLimit, selectSpeed, selectHideGrid, selectPerimeter, selectTypeOfCell, selectLinkCells, setCurrentHoverCell, selectHideCells } from '../reducers/gridParametersReducer';
import { selectNumberFrame, setCellsNumber, setNumberFrame, setNewCellsNumber, setOldCellsNumber } from '../reducers/infoParametersReducer'
import { setTimeout } from 'timers';
import { returnDeadCellAround, verifyCellAround2D, verifyCellAround3D, defineCellGroup, definePerimeterCellGroup, searchNeighborInstancesPositions, createLinkCells, } from '@/services/gameService';
import { stringToVector, vectorToString } from '@/services/dataProcessingService';
import { selectGameIsActive, selectResetIsRequired, setResetIsRequired } from '../reducers/controllerParameterReducer';
import { selectCellPositions, selectLoadedCellPositions, selectStepByStepMode, setCellPositions, setStepByStepMode } from '../reducers/globalGameReducer';

function threeJSSceneComponent() {
    const dispatch = useDispatch()
    const hideGridParameter = useSelector(selectHideGrid)
    const gridHeightParameter = useSelector(selectGridHeight);
    const gridWidthParameter = useSelector(selectGridWidth);
    const gridDepthParameter = useSelector(selectGridDepth);
    const gridIs3DParameter = useSelector(selectGridIs3DGrid);
    const cubeSizeParameter: number = useSelector(selectCubeSize);
    const birthRate: number = useSelector(selectBirthRate);
    const surpopulationLimit: number = useSelector(selectSurpopulationLimit);
    const lonelinessLimit: number = useSelector(selectLonelinessLimit);
    const speed: number = useSelector(selectSpeed);
    const gameIsRunning: boolean = useSelector(selectGameIsActive)
    const currentFrame: number = useSelector(selectNumberFrame)
    const showPerimeter: boolean = useSelector(selectPerimeter)
    const linkCells: boolean = useSelector(selectLinkCells)
    const typeOfCell: String = useSelector(selectTypeOfCell)
    const stepByStepMode: boolean = useSelector(selectStepByStepMode)
    const hideCellsIsRequested: boolean = useSelector(selectHideCells)
    const resetIsRequired: boolean = useSelector(selectResetIsRequired)
    // <-- scene 
    const workspace3D = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.Camera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<any>(null);
    const composerRef = useRef<any>(null);
    const cellsAreHiden = useRef<boolean>(false)


    const [positionCamera, setPositionCamera] = useState<THREE.Vector3>(new THREE.Vector3(0, 50, 100));
    const [positionMouse, setPositionMouse] = useState<THREE.Vector3 | null>(null);;
    // <-- scene END

    // <-- grid 
    const [planePositions, setPlanePosition] = useState<THREE.Vector3[]>([]);
    const [planeInstances, setPlaneInstances] = useState<THREE.InstancedMesh | null>(null);
    // <-- grid END

    // <-- load & save data
    const [importedDataIsLoad, setImportedDataIsLoad] = useState<boolean>(false)
    const positionCellToLoad: string[] = useSelector(selectLoadedCellPositions)
    // <-- load && save data END

    // cell position redux 
    const cellsPositionsGenerated: string[] = useSelector(selectCellPositions)
    const prevCellsPositionGeneratedRef = useRef<string[]>([]);


    const [objectCellGenerated, setObjectCellGenerated] = useState<THREE.Object3D[] | null>(null);
    const [particlesGenerated, setParticlesGenerated] = useState<THREE.Points | null>(null);

    const [perimeterObjects, setPerimeterObjects] = useState<THREE.Object3D[]>([]);
    const [linksCells, setLinksCells] = useState<THREE.Object3D[]>([])




    const updateCells = () => {
        const newCells: string[] = cellsPositionsGenerated.filter(pos => !prevCellsPositionGeneratedRef.current.some(position => position == pos))
        const oldCells: string[] = cellsPositionsGenerated.filter(pos => prevCellsPositionGeneratedRef.current.some(position => position == pos))
        sceneRef.current?.children.forEach(child => {
            if (child.userData.isBox || child.userData.isPlane) {
                if (child instanceof THREE.Mesh) {

                    const material = new THREE.MeshPhysicalMaterial({
                        color: newCells.some(pos => pos == vectorToString(child.position)) ? 0x1bff00 : 0xf9fafb,
                        transparent: true,
                        opacity: 0.5,
                        reflectivity: 1
                    });
                    child.material = material
                    child.material.needUpdate = true
                }

            }
        })

        dispatch(setOldCellsNumber(newCells.length));
        dispatch(setNewCellsNumber(oldCells.length));
        const allCellNumber = (newCells.length + oldCells.length)
        dispatch(setCellsNumber(allCellNumber))


        return { newCells, oldCells };

    };

    // <-- THREE scene initializer START
    const initScene = (workspace3D: React.RefObject<HTMLDivElement>, positionCameraToLoad: THREE.Vector3) => {
        const scene: THREE.Scene = new THREE.Scene();
        let camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(50, (window.innerWidth / window.innerHeight), 0.1, 2000);
        const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.toneMapping = THREE.NeutralToneMapping;

        if (workspace3D.current) {
            workspace3D.current.appendChild(renderer.domElement)
        }

        camera.position.set(0, -10, 10);
        camera.lookAt(150, 0, 0);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = false;
        controls.saveState

        const light = new THREE.AmbientLight(0x404040, 10);
        scene.add(light);

        const composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);
        return { scene, camera, renderer, controls, composer };
    }
    // <-- THREE scene initializer END


    // <-- grid methods bloc START
    function calculatePlanePosition() {
        const positions: THREE.Vector3[] = [];
        for (let i = 0; i < gridHeightParameter; i++) {
            for (let j = 0; j < gridWidthParameter; j++) {
                for (let k = 0; k < gridDepthParameter; k++) {
                    const x: number = i * cubeSizeParameter;
                    const y: number = j * cubeSizeParameter;
                    const z: number = k * cubeSizeParameter;
                    positions.push(new THREE.Vector3((x.toFixed(2)) as unknown as number, (y.toFixed(2)) as unknown as number, (z.toFixed(2)) as unknown as number));
                }
            }
        }
        return positions
    }
    function generatePlaneInstance(scene: THREE.Scene, positionsGrid: THREE.Vector3[]) {
        const geometry = new THREE.PlaneGeometry(cubeSizeParameter, cubeSizeParameter);
        const material = new THREE.MeshBasicMaterial({
            color: 0x9ca3af
            , wireframe: true
        });
        const instancedMesh = new THREE.InstancedMesh(geometry, material, positionsGrid.length);
        const dummy = new THREE.Object3D();
        positionsGrid.filter(position => !positionsGrid.some(prevPosition => prevPosition.equals(position)))
        positionsGrid.forEach((position, index) => {
            dummy.position.copy(position);
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(index, dummy.matrix);
        });
        instancedMesh.userData.isGrid = true
        scene.add(instancedMesh);
        return instancedMesh;
    }
    // <-- grid methods END


    // <-- cell management START
    function addPositionCellByRedux(clickedPosition: THREE.Vector3) {
        const x: string = (clickedPosition.x as unknown as number).toFixed(1);
        const y: string = (clickedPosition.y as unknown as number).toFixed(1);
        const z: string = (clickedPosition.z as unknown as number).toFixed(1);
        const newPositionToExclude = new THREE.Vector3(((x as unknown) as number), (y as unknown) as number, (z as unknown) as number)
        const newPositionToExcludeFromSelector = vectorToString(newPositionToExclude)
        if (!cellsPositionsGenerated.some(cell => cell == newPositionToExcludeFromSelector)) {
            const newPositions = [...cellsPositionsGenerated, newPositionToExcludeFromSelector];
            dispatch(setCellPositions(newPositions))
            return cellsPositionsGenerated
        } else {
            dispatch(setCellPositions(cellsPositionsGenerated.filter((cell) => cell !== newPositionToExcludeFromSelector)))
            return cellsPositionsGenerated.filter((cell) => cell !== newPositionToExcludeFromSelector)
        }
    }

    const generateParticle = (scene: THREE.Scene) => {
        const positionsList = cellsPositionsGenerated.map(stringToVector)
        if (typeOfCell == "Point") {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(positionsList.length * 3);
            for (let i = 0; i < positionsList.length; i++) {
                positions[i * 3] = positionsList[i].x;
                positions[i * 3 + 1] = positionsList[i].y;
                positions[i * 3 + 2] = positionsList[i].z;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const material = new THREE.PointsMaterial({
                color: 0xff42ff,
                size: cubeSizeParameter / 2,
            });
            const particles = new THREE.Points(geometry, material);
            particles.userData.isPoint = true;
            scene.add(particles);

            return particles;
        }
        else return null;
    }

    const createBoxCell = (position: THREE.Vector3) => {
        const geometry = new THREE.BoxGeometry(cubeSizeParameter, cubeSizeParameter, cubeSizeParameter);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x1bff00,
            transparent: true,
            opacity: 0.5,
            reflectivity: 1
        });
        const newBoxObject = new THREE.Mesh(geometry, material);
        newBoxObject.position.set(position.x, position.y, position.z)
        newBoxObject.userData.isBox = true;
        return newBoxObject
    }

    const createPlaneCell = (position: THREE.Vector3) => {
        const geometry = new THREE.PlaneGeometry(cubeSizeParameter, cubeSizeParameter);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x1bff00,
            transparent: true,
            opacity: 0.5,
            reflectivity: 1
        });
        const newPlaneObject = new THREE.Mesh(geometry, material);
        newPlaneObject.position.set(position.x, position.y, position.z)
        newPlaneObject.userData.isBox = false;
        return newPlaneObject
    }

    const hideCells = () => {
        if (typeOfCell !== "Point") {
            objectCellGenerated?.forEach(object => {
                sceneRef.current!.remove(object)
            })
        }
        else sceneRef.current!.remove(particlesGenerated!)

    }

    const changeCellType = () => {
        if (objectCellGenerated) {
            objectCellGenerated.forEach(object => {
                sceneRef.current!.remove(object)
            })
        }
        if (particlesGenerated) {
            sceneRef.current!.remove(particlesGenerated)
        }

        if (typeOfCell == "Plane" || typeOfCell == "Box") {
            if (typeOfCell == "Box") {
                prevCellsPositionGeneratedRef.current.filter(prevCell => !sceneRef.current?.children
                    .some(children => children.userData.id == prevCell))
                    .forEach((position, index) => {
                    const newBox = createBoxCell(stringToVector(position))
                    newBox.userData.id = position
                    newBox.userData.isBox = true
                    sceneRef.current!.add(newBox)

                })
            }
            else if (typeOfCell == "Plane") {
                prevCellsPositionGeneratedRef.current.filter(prevCell => !sceneRef.current?.children
                    .some(children => children.userData.id == prevCell))
                    .forEach((position, index) => {
                    const newPlane = createPlaneCell(stringToVector(position))
                    newPlane.userData.id = position
                    newPlane.userData.isPlane = true
                    sceneRef.current!.add(newPlane)
                })
            }
        }


        if (typeOfCell == "Point") {
            generateParticle(sceneRef.current!)
        }



    }



    const generateMeshObjects = (scene: THREE.Scene) => {
        if (typeOfCell == "Box") {
            cellsPositionsGenerated.filter(pos => !prevCellsPositionGeneratedRef.current.some(prevPos => pos == prevPos)).forEach((position, index) => {
                const newBox = createBoxCell(stringToVector(position))
                newBox.userData.id = position
                newBox.userData.isBox = true
                scene.add(newBox)

            })
            return scene.children.filter(children => children.type == "Mesh" && children.userData.isBox == true)
        }
        else if (typeOfCell == "Plane") {
            cellsPositionsGenerated.filter(pos => !prevCellsPositionGeneratedRef.current.some(prevPos => pos == prevPos)).forEach((position, index) => {
                const newPlane = createPlaneCell(stringToVector(position))
                newPlane.userData.id = position
                newPlane.userData.isPlane = true
                scene.add(newPlane)

            })
            return scene.children.filter(children => children.type == "Mesh" && children.userData.isPlane == true)
        }
        else return null
    }   // <-- cell management END 

    const removeOldCells = () => {
        if (typeOfCell !== "Point" && sceneRef.current) {
            if (particlesGenerated) {
                sceneRef.current!.remove(particlesGenerated)
            }

            const objectsToRemove = sceneRef.current!.children.filter(child =>
                (child.userData.isPlane || child.userData.isBox) &&
                !cellsPositionsGenerated.includes(vectorToString(child.position))
            );

            objectsToRemove.forEach(child => {
                sceneRef.current!.remove(child);
            });
            setObjectCellGenerated(objectsToRemove);

        }
        else if (sceneRef.current && typeOfCell == "Point") {
            if (objectCellGenerated) {
                sceneRef.current.children.forEach(child => {
                    if (child.userData.isBox == true || child.userData.isPlane == true) {
                        sceneRef.current!.remove(child)
                    }
                })
            }
            if (particlesGenerated) {
                sceneRef.current.remove(particlesGenerated)
            }
        }

    }

    const gameOfLifeSystem = () => {
        let positionsToFilter: string[] = cellsPositionsGenerated


        let cellsToDelete: string[] = []
        let cellsToCreate: string[] = []
        positionsToFilter.forEach(cellPosition => {
            let countBoxAround: number = gridIs3DParameter ? verifyCellAround3D(positionsToFilter.map(stringToVector), stringToVector(cellPosition), cubeSizeParameter) : verifyCellAround2D(surpopulationLimit, positionsToFilter.map(stringToVector), stringToVector(cellPosition), cubeSizeParameter)
            if (countBoxAround > surpopulationLimit || countBoxAround <= lonelinessLimit) {
                if (!cellsToDelete.includes(cellPosition)) {
                    cellsToDelete.push(cellPosition)
                }
            }
        })
        positionsToFilter.forEach(filteredPosition => {
            const deadCellAround: string[] = returnDeadCellAround(positionsToFilter.map(stringToVector), stringToVector(filteredPosition), cubeSizeParameter, gridIs3DParameter ? true : false).map(vectorToString)
            deadCellAround.forEach(deadCell => {
                let liveCellsAroundCounter: number = gridIs3DParameter ? verifyCellAround3D(positionsToFilter.map(stringToVector), stringToVector(deadCell), cubeSizeParameter) : verifyCellAround2D(birthRate, positionsToFilter.map(stringToVector), stringToVector(deadCell), cubeSizeParameter)
                if (liveCellsAroundCounter == birthRate) {
                    const existsInBoxToCreate = cellsToCreate.some(cell => (deadCell == cell));
                    if (!existsInBoxToCreate) {
                        cellsToCreate.push(deadCell);
                    }
                }
            })
        })
        positionsToFilter = positionsToFilter.filter(positionToFilter =>
            !cellsToDelete.some(positionToDelete => positionToFilter == positionToDelete)
        );
        const updatedPositions = [...positionsToFilter, ...cellsToCreate];
        const uniqueUpdatedPositions = updatedPositions.reduce((acc: string[], current) => {
            if (!acc.some(item => item == current)) {
                acc.push(current);
            }
            return acc;
        }, []);
        dispatch(setCellPositions(uniqueUpdatedPositions))
    }

    const displayCells = () => {
        if (hideCellsIsRequested) {
            hideCells()
            cellsAreHiden.current = true
        }
        else {
            if (cellsAreHiden.current == true) {
                if (typeOfCell !== "Point") {
                    objectCellGenerated?.forEach(child => sceneRef.current?.add(child))
                }
                else if (particlesGenerated) {
                    sceneRef.current?.add(particlesGenerated)

                }
                cellsAreHiden.current = false
            }
            else {
                removeOldCells()
                if (typeOfCell !== "Point") {
                    const newAddedObjectsMesh = generateMeshObjects(sceneRef.current!)
                    setObjectCellGenerated(newAddedObjectsMesh)
                }
                else {
                    const newAddedObjectsParticle = generateParticle(sceneRef.current!)
                    setParticlesGenerated(newAddedObjectsParticle)
                }

            }
        }
    }

    // <-- event systems  START
    const onGridClick = (event: MouseEvent) => {
        event.preventDefault();
        if (gameIsRunning == false) {
            if (!cameraRef.current || !rendererRef.current) return;

            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, cameraRef.current);

            if (planeInstances) {
                const intersectsGrid = raycaster.intersectObject(planeInstances);
                if (intersectsGrid.length > 0) {
                    const instanceId = intersectsGrid[0].instanceId;
                    if (instanceId !== undefined) {
                        const intersectedObject = intersectsGrid[0].object;
                        const instanceMatrix = new THREE.Matrix4();
                        planeInstances!.getMatrixAt(instanceId, instanceMatrix);
                        const bannedPosition = new THREE.Vector3();
                        bannedPosition.setFromMatrixPosition(instanceMatrix);

                        if (intersectedObject.userData.isGrid) {
                            addPositionCellByRedux(bannedPosition);
                        }
                    }
                }
            }
        }
    };
    const onCellClick = (event: MouseEvent) => {
        event.preventDefault();
        if (gameIsRunning == false) {
            if (!cameraRef.current || !rendererRef.current) return;

            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, cameraRef.current);
            if (objectCellGenerated) {
                const intersectsGrid = raycaster.intersectObjects(objectCellGenerated);
                if (intersectsGrid.length > 0) {
                    const intersectedObject = intersectsGrid[0].object;
                    if (intersectedObject !== undefined && (intersectedObject.userData.isBox || intersectedObject.userData.isPlane)) {
                        let bannedPosition = intersectedObject.position
                        addPositionCellByRedux(bannedPosition)
                    }
                }
            }
        }
    };
    const onCellHover = (event: MouseEvent) => {
        event.preventDefault();
        if (!cameraRef.current || !rendererRef.current) return;
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, cameraRef.current);


        if (objectCellGenerated !== null && objectCellGenerated.length > 0) {
            const intersectsGrid = raycaster.intersectObjects(objectCellGenerated);
            if (intersectsGrid.length > 0) {
                const intersectedObject = intersectsGrid[0].object;

                if (intersectedObject !== undefined && (intersectedObject.userData.isBox || intersectedObject.userData.isPlane)) {
                    const cellPosition = {
                        x: Number(intersectedObject.position.x.toFixed(2)),
                        y: Number(intersectedObject.position.y.toFixed(2)),
                        z: Number(intersectedObject.position.z.toFixed(2))
                    };

                    if (cellPosition !== positionMouse) {
                        dispatch(setCurrentHoverCell({
                            cell: `x: ${(cellPosition.x as unknown as number).toFixed(2)}, y: ${(cellPosition.y as unknown as number).toFixed(2)}, z: ${cellPosition.z}`,
                            mouseX: event.clientX,
                            mouseY: event.clientY,
                        }));
                        setPositionMouse(cellPosition as THREE.Vector3)
                    }
                }
            } else {
                dispatch(setCurrentHoverCell(null));
            }
        }



        else if (particlesGenerated !== null) {
            raycaster.params.Points.threshold = 0.05
            const intersectsParticles = raycaster.intersectObject(particlesGenerated);
            if (intersectsParticles.length > 0) {
                const intersectedObject = intersectsParticles[0].object;
                const intersectedPoint = intersectsParticles[0].point;


                if (intersectedObject !== undefined && intersectedObject.userData.isPoint) {
                    const cellPosition = {
                        x: Number(intersectedPoint.x.toFixed(1)),
                        y: Number(intersectedPoint.y.toFixed(1)),
                        z: Number(intersectedPoint.z.toFixed(1))
                    };

                    if (cellPosition !== positionMouse) {
                        dispatch(setCurrentHoverCell({
                            cell: `x: ${cellPosition.x}, y: ${cellPosition.y}, z: ${cellPosition.z}`,
                            mouseX: event.clientX,
                            mouseY: event.clientY,
                        }));
                        setPositionMouse(cellPosition as THREE.Vector3);
                    }
                }
            } else {
                dispatch(setCurrentHoverCell(null));
            }
        }

    };


    useEffect(() => {
        const { scene, camera, renderer, controls, composer } = initScene(workspace3D, positionCamera);
        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;
        controlsRef.current = controls;
        composerRef.current = composer;

        function handleCameraMove() {
            setPositionCamera(camera.position);

        }
        controls.addEventListener('change', handleCameraMove);
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            composer.render();
        };
        animate();
        return () => {
            controls.removeEventListener('change', handleCameraMove);
            if (workspace3D.current) {
                workspace3D.current.removeChild(renderer.domElement);
            }
        };
    }, [
        gridHeightParameter,
        gridWidthParameter,
        gridDepthParameter,
        cubeSizeParameter,


    ]);


    useEffect(() => {
        const initialPositions = calculatePlanePosition().filter(position => !cellsPositionsGenerated.some(prevPosition => prevPosition == vectorToString(position)));
        setPlanePosition(initialPositions);
    }, [gridHeightParameter,
        gridWidthParameter,
        gridDepthParameter,
        cubeSizeParameter,
    ]);


    useEffect(() => {
        if (sceneRef.current) {
            if (hideGridParameter === true && planeInstances) {
                sceneRef.current.remove(planeInstances);
                setPlaneInstances(null);
            }
            if (hideGridParameter === false && planePositions.length > 0) {
                const newPlaneInstances = generatePlaneInstance(sceneRef.current, planePositions);
                if (planeInstances) {
                    sceneRef.current.remove(planeInstances);
                }
                sceneRef.current.add(newPlaneInstances);
                setPlaneInstances(newPlaneInstances);
            }
        }
    }, [gridHeightParameter,
        gridWidthParameter,
        gridDepthParameter,
        cubeSizeParameter,
        planePositions,
        hideGridParameter,
    ]);

    // generation des cellule
    useEffect(() => {

        if (gameIsRunning == true || stepByStepMode == true) {
            dispatch(setNumberFrame(currentFrame + 1))
            dispatch(setStepByStepMode(false))
        }
        if (resetIsRequired == true) {
            dispatch(setNumberFrame(0))
            dispatch(setResetIsRequired(false))
        }
        displayCells()
        updateCells()


    }, [cellsPositionsGenerated, positionCellToLoad, hideCellsIsRequested])

    useEffect(() => {

        changeCellType()
        displayCells()


    }, [typeOfCell])


    // game of life system  STEP BY STEP mode
    useEffect(() => {
        prevCellsPositionGeneratedRef.current = cellsPositionsGenerated
        if (stepByStepMode) {
            gameOfLifeSystem()
        }
    }, [stepByStepMode])

    // game of life system  
    useEffect(() => {
        prevCellsPositionGeneratedRef.current = cellsPositionsGenerated

        if (stepByStepMode == false) {
            setTimeout(() => {
                if (gameIsRunning && cellsPositionsGenerated.length !== 0) {
                    gameOfLifeSystem()
                }
            }, 1000 / speed)
        }
    }, [cellsPositionsGenerated, gameIsRunning, importedDataIsLoad, stepByStepMode])

    useEffect(() => {
        if (showPerimeter) {
            if (sceneRef.current !== null) {
                for (const oldPerimeter of perimeterObjects) {
                    sceneRef.current.remove(oldPerimeter);
                }
                const cellGroups = defineCellGroup(cellsPositionsGenerated, cubeSizeParameter, gridIs3DParameter);
                const newPerimeterObjects: THREE.Object3D[] = [];

                for (const group of cellGroups) {
                    const perimeterToAdd = definePerimeterCellGroup(group, cellsPositionsGenerated, cubeSizeParameter, gridIs3DParameter);
                    sceneRef.current.add(perimeterToAdd);
                    newPerimeterObjects.push(perimeterToAdd);
                }
                setPerimeterObjects(newPerimeterObjects);
            }
        }

        else if (sceneRef.current !== null) {
            for (const oldPerimeter of perimeterObjects) {
                sceneRef.current.remove(oldPerimeter);
            }
        }


    }, [showPerimeter, cellsPositionsGenerated]);

    useEffect(() => {
        if (linkCells) {
            if (sceneRef.current !== null) {
                for (const oldLinks of linksCells) {
                    sceneRef.current.remove(oldLinks);
                }
                const newLinksCells: THREE.Object3D[] = [];
                for (const position of cellsPositionsGenerated) {
                    const neighborToLink = searchNeighborInstancesPositions(cellsPositionsGenerated.map(stringToVector), stringToVector(position), cubeSizeParameter, gridIs3DParameter);
                    const links = createLinkCells(neighborToLink, stringToVector(position))
                    for (const element of links) {
                        sceneRef.current.add(element);
                        newLinksCells.push(element);
                    }
                }
                setLinksCells(newLinksCells);
            }
        }
        else if (sceneRef.current !== null) {
            for (const oldLinks of linksCells) {
                sceneRef.current.remove(oldLinks);
            }
        }
    }, [linkCells, cellsPositionsGenerated]);

    useEffect(() => {
        if (rendererRef.current) {
            rendererRef.current.domElement.addEventListener('click', onGridClick, false);
            rendererRef.current.domElement.addEventListener('click', onCellClick, false);
            rendererRef.current.domElement.addEventListener('mousemove', onCellHover);
        }

        return () => {
            if (rendererRef.current) {
                rendererRef.current.domElement.removeEventListener('click', onGridClick, false);
                rendererRef.current.domElement.removeEventListener('click', onCellClick, false);
                rendererRef.current.domElement.removeEventListener('mousemove', onCellHover, false);
            }
        };
    }, [planeInstances, cellsPositionsGenerated, gameIsRunning, positionMouse]);




    return (
        <>
            <div className='w-full h-full' ref={workspace3D}></div>
        </>
    )
}


export default threeJSSceneComponent



