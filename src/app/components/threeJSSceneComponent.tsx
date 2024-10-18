"use client";

import React, { Ref, RefObject, useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { useDispatch, useSelector } from 'react-redux';
import { selectGridHeight, selectGridWidth, selectGridDepth, selectGridIs3DGrid, selectCubeSize, selectBirthRate, selectSurpopulationLimit, selectLonelinessLimit, selectSpeed, selectHideGrid, selectPerimeter, selectTypeOfCell, selectLinkCells, setCurrentHoverCell, selectStability, selectHideCells } from './lateralPanels/reducers/gridParametersReducer';
import { selectNumberFrame, setCellsNumber, setNumberFrame, setUnstableCellsNumber, setStableCellsNumber } from '../components/lateralPanels/reducers/infoParametersReducer'
import { setTimeout } from 'timers';
import { returnDeadCellAround, verifyCellAround2D, verifyCellAround3D, defineCellGroup, definePerimeterCellGroup, searchNeighborInstancesPositions, createLinkCells, } from '@/services/gameService';
import { stringToVector, vectorsAreEqual, vectorToString } from '@/services/dataProcessingService';
import { selectGameIsActive, selectLoadedData } from './lateralPanels/reducers/controllerParameterReducer';
import ModalComponent from './modalComponent';
import { selectCellPositions, selectLoadedCellPositions, selectStepByStepMode, setCellPositions, setStepByStepMode } from './lateralPanels/reducers/globalGameReducer';
import { instance } from 'three/examples/jsm/nodes/Nodes.js';

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
    const stabilityLimit: number = useSelector(selectStability)
    const hideCells: boolean = useSelector(selectHideCells)
    // <-- scene 
    const workspace3D = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.Camera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<any>(null);
    const composerRef = useRef<any>(null);
    const [positionCamera, setPositionCamera] = useState<THREE.Vector3>(new THREE.Vector3(0, 50, 100));
    const [positionMouse, setPositionMouse] = useState<THREE.Vector3 | null>(null);;
    // <-- scene END

    // <-- grid 
    const [planePositions, setPlanePosition] = useState<THREE.Vector3[]>([]);
    const [planeInstances, setPlaneInstances] = useState<THREE.InstancedMesh | null>(null);
    // <-- grid END

    // <-- load & save data
    const loadedData = useSelector(selectLoadedData)
    const [importedDataIsLoad, setImportedDataIsLoad] = useState<boolean>(false)
    const positionCellToLoad: string[] = useSelector(selectLoadedCellPositions)
    // <-- load && save data END

    const [positionsGenerated, setPositionsGenerated] = useState<THREE.Vector3[]>([]);
    // cell position redux 
    const cellsPositionsGenerated: string[] = useSelector(selectCellPositions)

    const [instancesGenerated, setInstancesGenerated] = useState<THREE.InstancedMesh | null>(null);
    const [particlesGenerated, setParticlesGenerated] = useState<THREE.Points | null>(null);
    const [particlesPlanesGenerated, setParticlesPlanesGenerated] = useState<THREE.Points | null>(null);

    const [perimeterObjects, setPerimeterObjects] = useState<THREE.Object3D[]>([]);
    const [linksCells, setLinksCells] = useState<THREE.Object3D[]>([])

    const [perimeterList, setPerimeterList] = useState<THREE.Vector3[][]>([]);

    interface Cell {
        id: String,
        position: THREE.Vector3,
        iterationWithoutChange: number,
        neighborCounter: number,
        stable: boolean;
    }


    // a conserver sert our l'optimisation uniquement

    const [stableCellsList, setStableCellsList] = useState<THREE.Vector3[]>([]);
    const [unstableCellsList, setUnstableCellsList] = useState<THREE.Vector3[]>([]);
    const [prevCellStatusList, setPrevCellStatusList] = useState<Cell[]>([]);
    const [currentCellStatusList, setCurrentCellStatusList] = useState<Cell[]>([]);


    const filterByStability = () => {
        const stableCellSet: Set<THREE.Vector3> = new Set()
        const unstableCellSet: Set<THREE.Vector3> = new Set()
        const newCurrentCellStatusList: Cell[] = [];
        // uniquement si la stability est activé et donc different de 0
        if (stabilityLimit !== 0) {
            // pour initialisation uniquement : si il n'y pas eu d'itérations au prealable et donc pas de prevlist a comparé on en créer une
            if (prevCellStatusList.length === 0) {
                positionsGenerated.forEach(cellPosition => {
                    const Cell: Cell = {
                        id: vectorToString(cellPosition),
                        position: cellPosition,
                        iterationWithoutChange: 0,
                        neighborCounter: verifyCellAround2D((surpopulationLimit > birthRate ? surpopulationLimit : birthRate), positionsGenerated, cellPosition, cubeSizeParameter),
                        stable: false
                    };
                    newCurrentCellStatusList.push(Cell);
                });
                console.log("bloc initialisation des liste des status des cellules")
                setPrevCellStatusList(newCurrentCellStatusList);
                //  setCurrentCellStatusList(newCurrentCellStatusList);
            }

            // sinon dans la plupart des cas 

            console.log(" bloc comportement general")
            for (const cellPosition of positionsGenerated) {
                const Cell: Cell = {
                    id: vectorToString(cellPosition),
                    position: cellPosition,
                    iterationWithoutChange: 0,
                    neighborCounter: verifyCellAround2D((surpopulationLimit > birthRate ? surpopulationLimit : birthRate), positionsGenerated, cellPosition, cubeSizeParameter),
                    stable: false
                };
                // on cherche la cell par son id pour trouver son status
                const prevCellMap = new Map(prevCellStatusList.map(cell => [cell.id, cell]));
                const prevCell = prevCellMap.get(Cell.id);
                if (prevCell !== undefined) {
                    // si il y a changement entre ancien nombe cell voisine et le nombre de cell voisine de la nouvelle cellule
                    if (prevCell.neighborCounter !== Cell.neighborCounter) {
                        Cell.stable = false;
                        Cell.iterationWithoutChange = 0;
                    }
                    // sinon si aucun changement on increment le counter de stability
                    else {
                        Cell.iterationWithoutChange = prevCell.iterationWithoutChange + 1;
                    }


                    if (Cell.iterationWithoutChange >= stabilityLimit) {
                        Cell.stable = true;
                    }
                }

                // maj de la liste des status
                if (!newCurrentCellStatusList.some(Cell => Cell.position.equals(cellPosition)))
                    newCurrentCellStatusList.push(Cell);
            }

            console.log(newCurrentCellStatusList)
            // filtre et ajoute les cells instables
            console.log(newCurrentCellStatusList.filter(cell => !cell.stable))
            console.log(newCurrentCellStatusList.filter(cell => cell.stable))

            newCurrentCellStatusList
                .filter(cell => !cell.stable)
                .forEach(cellUnstable => {
                    const cellPosition = new THREE.Vector3(cellUnstable.position.x, cellUnstable.position.y, cellUnstable.position.z);
                    unstableCellSet.add(cellPosition);

                });

            newCurrentCellStatusList
                .filter(cell => cell.stable).forEach(cellStable => {
                    const cellPosition = new THREE.Vector3(cellStable.position.x, cellStable.position.y, cellStable.position.z)

                    stableCellSet.add(cellPosition);

                })


            setPrevCellStatusList(currentCellStatusList);
            setCurrentCellStatusList(newCurrentCellStatusList);
            const stableArray = Array.from(stableCellSet);
            const unstableArray = Array.from(unstableCellSet);

            setStableCellsList(stableArray);
            setUnstableCellsList(unstableArray);

            dispatch(setStableCellsNumber(stableArray.length));
            dispatch(setUnstableCellsNumber(unstableArray.length));
            console.log("StableCell", stableArray);
            console.log("UnstableCell", unstableArray);

            console.log(newCurrentCellStatusList);
            console.log("nombre total de positionGenerated  ", positionsGenerated.length, positionsGenerated);

        }

        return { unstableCellSet, stableCellSet };

    };
    // <-- THREE scene initializer START
    const initScene = (workspace3D: React.RefObject<HTMLDivElement>, positionCameraToLoad: THREE.Vector3) => {
        const scene: THREE.Scene = new THREE.Scene();
        let camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(50, (window.innerWidth / window.innerHeight), 0.1, 2000);
        const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true });

        // RENDERER
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.toneMapping = THREE.NeutralToneMapping;

        if (workspace3D.current) {
            workspace3D.current.appendChild(renderer.domElement)
        }
        //CAMERA
        camera.position.set(0, -10, 10);
        camera.lookAt(150, 0, 0);
        //CONTROLS
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = false;
        controls.saveState
        //LIGHT

        const light = new THREE.AmbientLight(0x404040, 10);
        scene.add(light);
        //POST-EFFECT       
        const composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);
       
        //    composer.addPass(bloomPass);
        return { scene, camera, renderer, controls, composer };
    }
    // <-- THREE scene initializer END


    const getInstancePosition = (instancedMesh: THREE.InstancedMesh, instanceId: number): THREE.Vector3 => {
        const dummy = new THREE.Object3D();
        instancedMesh.getMatrixAt(instanceId, dummy.matrix);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
        const position = dummy.position.clone();
        return position;
    };



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
    function generatePlaneInstance(scene: THREE.Scene, positions: THREE.Vector3[]) {
        const geometry = new THREE.PlaneGeometry(cubeSizeParameter, cubeSizeParameter);
        const material = new THREE.MeshBasicMaterial({
            color: 0x9ca3af
            , wireframe: true
        });
        const instancedMesh = new THREE.InstancedMesh(geometry, material, positions.length);
        const dummy = new THREE.Object3D();
        positions.filter(position => !positionsGenerated.some(prevPosition => prevPosition.equals(position)))
        positions.forEach((position, index) => {
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
    function addPositionCell(clickedPosition: THREE.Vector3) {
        const currentCellPositions = positionsGenerated
        const x: string = (clickedPosition.x as unknown as number).toFixed(1);
        const y: string = (clickedPosition.y as unknown as number).toFixed(1);
        const z: string = (clickedPosition.z as unknown as number).toFixed(1);
        const newPositionToExclude = new THREE.Vector3((x as unknown) as number, (y as unknown) as number, (z as unknown) as number)
        if (!currentCellPositions.some(cell => vectorsAreEqual(newPositionToExclude, cell))) {
            currentCellPositions.push(newPositionToExclude)
            return currentCellPositions
        } else {
            return currentCellPositions.filter((cell) => !vectorsAreEqual(newPositionToExclude, cell))
        }
    }


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

    const generateParticle = (scene: THREE.Scene, positions: THREE.Vector3[]) => {
        if (typeOfCell == "Point") {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(positionsGenerated.length * 3);
            for (let i = 0; i < positionsGenerated.length; i++) {
                positions[i * 3] = positionsGenerated[i].x;
                positions[i * 3 + 1] = positionsGenerated[i].y;
                positions[i * 3 + 2] = positionsGenerated[i].z;
            }
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const material = new THREE.PointsMaterial({
                color: 0xff42ff,
                size: cubeSizeParameter / 2,
            });
            const particles = new THREE.Points(geometry, material);

            particles.userData.isPoint = true;
            particles.userData.isStable = false;

            scene.add(particles);
            return particles;
        }
        else return null;
    }

    // invisible plane is used with celltype "particle" to ease onClik event
    const generateInvisiblePlane = (scene: THREE.Scene, positions: THREE.Vector3[]) => {
        const geometry = new THREE.PlaneGeometry(cubeSizeParameter, cubeSizeParameter);
        const material = new THREE.MeshBasicMaterial({
            opacity: 0,
            transparent: true

        }); const instancedMeshPlane = new THREE.InstancedMesh(geometry, material, positions.length);
        const dummy = new THREE.Object3D();

        positionsGenerated.forEach((position, index) => {
            dummy.position.copy(position);
            dummy.updateMatrix();
            instancedMeshPlane.setMatrixAt(index, dummy.matrix);
        });
        instancedMeshPlane.userData.isPlane = true
        scene.add(instancedMeshPlane);
        return instancedMeshPlane;
    }

    const generateAllTypeInstance = (scene: THREE.Scene, positions: THREE.Vector3[]) => {

        if (typeOfCell == "Box") {
            const geometry = new THREE.BoxGeometry(cubeSizeParameter, cubeSizeParameter, cubeSizeParameter);
            const material = new THREE.MeshPhysicalMaterial({
                color: 0xf9fafb,
                transparent: true,
                opacity: 0.5,
                reflectivity: 1
            });
            const instancedMeshCube = new THREE.InstancedMesh(geometry, material, positions.length);
            const dummy = new THREE.Object3D();

            positionsGenerated.forEach((position, index) => {
                dummy.position.copy(position);
                dummy.updateMatrix();
                instancedMeshCube.setMatrixAt(index, dummy.matrix);
            });
            instancedMeshCube.userData.isBox = true
            instancedMeshCube.userData.isStable = false

            scene.add(instancedMeshCube);
            return instancedMeshCube;
        }
        else if (typeOfCell == "Plane") {
            const geometry = new THREE.PlaneGeometry(cubeSizeParameter, cubeSizeParameter);
            const material = new THREE.MeshPhysicalMaterial({
                color: 0xf9fafb,
                reflectivity: 0.1
            }); const instancedMeshPlane = new THREE.InstancedMesh(geometry, material, positions.length);
            const dummy = new THREE.Object3D();

            positionsGenerated.forEach((position, index) => {
                dummy.position.copy(position);
                dummy.updateMatrix();
                instancedMeshPlane.setMatrixAt(index, dummy.matrix);
            });
            instancedMeshPlane.userData.isPlane = true
            instancedMeshPlane.userData.isStable = false
            scene.add(instancedMeshPlane);
            return instancedMeshPlane;

        }

        else return null;
    }    // <-- cell management END 




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
                    const intersectedObject = intersectsGrid[0].object;
                    if (instanceId !== undefined && intersectedObject.userData.isGrid) {
                        let bannedPosition = getInstancePosition(planeInstances, instanceId)
                        console.log(bannedPosition)
                        const newExcludePlanePosition = addPositionCell(bannedPosition)
                        console.log(newExcludePlanePosition)
                      //  addPositionCellByRedux(bannedPosition)
                        setPositionsGenerated([...newExcludePlanePosition]);
                    }
                }
            }
        }
    };
    const onCellClick = (event: MouseEvent) => {
        console.log("ON CELL CLICK")
        event.preventDefault();
        if (gameIsRunning == false) {
            if (!cameraRef.current || !rendererRef.current) return;

            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, cameraRef.current);
            if (instancesGenerated) {
                const intersectsGrid = raycaster.intersectObject(instancesGenerated);
                if (intersectsGrid.length > 0) {
                    const instanceId = intersectsGrid[0].instanceId;
                    const intersectedObject = intersectsGrid[0].object;
                    if (instanceId !== undefined && (intersectedObject.userData.isBox || intersectedObject.userData.isPlane)) {
                        let bannedPosition = getInstancePosition(instancesGenerated, instanceId)
                        const newExcludePlanePosition = addPositionCell(bannedPosition)
                        setPositionsGenerated([...newExcludePlanePosition]);
                        dispatch(setCellPositions(positionsGenerated.map(vectorToString)))






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
        if (instancesGenerated !== null) {
            const intersectsGrid = raycaster.intersectObject(instancesGenerated);
            if (intersectsGrid.length > 0) {
                const instanceId = intersectsGrid[0].instanceId;
                const intersectedObject = intersectsGrid[0].object;

                if (instanceId !== undefined && (intersectedObject.userData.isBox || intersectedObject.userData.isPlane)) {
                    let bannedPosition = getInstancePosition(instancesGenerated, instanceId)
                    const cellPosition = {
                        x: Number((bannedPosition.x as unknown as number).toFixed(2)),
                        y: Number((bannedPosition.y as unknown as number).toFixed(2)),
                        z: Number((bannedPosition.z as unknown as number).toFixed(2))
                    };

                    if (cellPosition !== positionMouse) {
                        dispatch(setCurrentHoverCell({
                            cell: `x: ${(bannedPosition.x as unknown as number).toFixed(2)}, y: ${(bannedPosition.y as unknown as number).toFixed(2)}, z: ${bannedPosition.z}`,
                            mouseX: event.clientX,
                            mouseY: event.clientY,
                        }));
                        setPositionMouse(bannedPosition)
                    }
                }
            } else {
                dispatch(setCurrentHoverCell(null));
            }
        }

    };
    // <-- event system END

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
        const initialPositions = calculatePlanePosition().filter(position => !positionsGenerated.some(prevPosition => prevPosition.equals(position)));
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


    useEffect(() => {
        console.log(hideCells)
        if (sceneRef.current && typeOfCell !== "Point") {
            if (hideCells == false) {
                const newInstancesGenerated = generateAllTypeInstance(sceneRef.current, positionsGenerated);
                if (instancesGenerated) {
                    sceneRef.current.remove(instancesGenerated);
                    if (particlesGenerated) {
                        sceneRef.current.remove(particlesGenerated)
                    }
                }
                if (newInstancesGenerated !== null && newInstancesGenerated !== undefined) {
                    sceneRef.current.add(newInstancesGenerated);
                    setInstancesGenerated(newInstancesGenerated)
                }
            }
            else {
                if (instancesGenerated) {
                    sceneRef.current.remove(instancesGenerated);
                    if (particlesGenerated) {
                        sceneRef.current.remove(particlesGenerated)
                    }
                }
            }

        }
        else if (sceneRef.current && typeOfCell == "Point") {
            if (hideCells == false) {
                const newGeneratedParticles = generateParticle(sceneRef.current, positionsGenerated);
                const newInvisiblePlaneGenerated = generateInvisiblePlane(sceneRef.current, positionsGenerated);

                if (particlesGenerated) {
                    sceneRef.current.remove(particlesGenerated);
                    if (instancesGenerated) {
                        sceneRef.current.remove(instancesGenerated)
                    }
                }
                if (particlesPlanesGenerated) {
                    sceneRef.current.remove(particlesPlanesGenerated);

                }

                if (newGeneratedParticles !== null && newGeneratedParticles !== undefined) {
                    sceneRef.current.add(newGeneratedParticles);
                    setParticlesGenerated(newGeneratedParticles);
                }

                if (newInvisiblePlaneGenerated !== null && newInvisiblePlaneGenerated !== null) {
                    sceneRef.current.add(newInvisiblePlaneGenerated);
                    setInstancesGenerated(newInvisiblePlaneGenerated);
                }
            } else {
                if (particlesGenerated) {
                    sceneRef.current.remove(particlesGenerated);
                }
                if (particlesPlanesGenerated) {
                    sceneRef.current.remove(particlesPlanesGenerated);
                }
            }
        }
    }, [positionsGenerated, loadedData, positionCellToLoad, hideCells])

    // pour le chargement depuis client
    useEffect(() => {
        setPositionsGenerated([])
    }, [positionCellToLoad])


    useEffect(() => {
        const { unstableCellSet, stableCellSet } = filterByStability();
    }, [currentFrame])



    // game of life system in STEP BY STEP mode
    useEffect(() => {
        if (stepByStepMode) {
            if (positionsGenerated.length !== 0) {
                dispatch(setNumberFrame(currentFrame + 1))
                let positionsToFilter: THREE.Vector3[] = positionsGenerated
                let cellsToDelete: THREE.Vector3[] = []
                let cellsToCreate: THREE.Vector3[] = []
                positionsToFilter.forEach(boxPosition => {
                    let countBoxAround: number = gridIs3DParameter ? verifyCellAround3D(surpopulationLimit, positionsGenerated, boxPosition, cubeSizeParameter) : verifyCellAround2D(surpopulationLimit, positionsGenerated, boxPosition, cubeSizeParameter)
                    if (countBoxAround > surpopulationLimit || countBoxAround <= lonelinessLimit) {
                        if (!cellsToDelete.includes(boxPosition)) {
                            cellsToDelete.push(boxPosition)
                        }
                    }
                })
                positionsToFilter = positionsToFilter.filter(positionToFilter =>
                    !cellsToDelete.some(positionToDelete =>
                        positionToFilter.x == positionToDelete.x &&
                        positionToFilter.y == positionToDelete.y &&
                        positionToFilter.z == positionToDelete.z
                    )
                );
                positionsToFilter.forEach(filteredPosition => {
                    const deadCellAround: THREE.Vector3[] = returnDeadCellAround(positionsToFilter, filteredPosition, cubeSizeParameter, gridIs3DParameter ? true : false)
                    deadCellAround.forEach(deadCell => {
                        let liveCellsAroundCounter: number = gridIs3DParameter ? verifyCellAround3D(birthRate, positionsGenerated, deadCell, cubeSizeParameter) : verifyCellAround2D(birthRate, positionsGenerated, deadCell, cubeSizeParameter)
                        if (liveCellsAroundCounter == birthRate) {
                            const existsInBoxToCreate = cellsToCreate.some(cell => vectorsAreEqual(deadCell, cell));
                            if (!existsInBoxToCreate) {
                                cellsToCreate.push(deadCell);
                            }
                        }
                    })
                })
                const updatedPositions = [...positionsToFilter, ...cellsToCreate];
                const uniqueUpdatedPositions = updatedPositions.reduce((acc: THREE.Vector3[], current) => {
                    if (!acc.some(item => vectorsAreEqual(item, current))) {
                        acc.push(current);
                    }
                    return acc;
                }, []);


                dispatch(setCellsNumber(uniqueUpdatedPositions.length))
                setPositionsGenerated(uniqueUpdatedPositions)
                dispatch(setCellPositions(uniqueUpdatedPositions.map(vectorToString)))
            }
        }
        dispatch(setStepByStepMode(false))

    }, [stepByStepMode])

    // game of life system 
 /*  useEffect(() => {
        if (stepByStepMode == false) {
            if (loadedData && importedDataIsLoad === false) {
               // setPositionsGenerated(loadedData.cellPositions)
                
                setImportedDataIsLoad(true)
            }
            setTimeout(() => {
                if (gameIsRunning && positionsGenerated.length !== 0) {
                    dispatch(setNumberFrame(currentFrame + 1))

                    let positionsToFilter: THREE.Vector3[] = positionsGenerated
                    let cellsToDelete: THREE.Vector3[] = []
                    let cellsToCreate: THREE.Vector3[] = []
                    positionsToFilter.forEach(boxPosition => {
                        let countBoxAround: number = gridIs3DParameter ? verifyCellAround3D(surpopulationLimit, positionsGenerated, boxPosition, cubeSizeParameter) : verifyCellAround2D(surpopulationLimit, positionsGenerated, boxPosition, cubeSizeParameter)
                        if (countBoxAround > surpopulationLimit || countBoxAround <= lonelinessLimit) {
                            if (!cellsToDelete.includes(boxPosition)) {
                                cellsToDelete.push(boxPosition)
                            }
                        }
                    })
                    positionsToFilter = positionsToFilter.filter(positionToFilter =>
                        !cellsToDelete.some(positionToDelete =>
                            positionToFilter.x == positionToDelete.x &&
                            positionToFilter.y == positionToDelete.y &&
                            positionToFilter.z == positionToDelete.z
                        )
                    );
                    positionsToFilter.forEach(filteredPosition => {
                        const deadCellAround: THREE.Vector3[] = returnDeadCellAround(positionsToFilter, filteredPosition, cubeSizeParameter, gridIs3DParameter ? true : false)
                        deadCellAround.forEach(deadCell => {
                            let liveCellsAroundCounter: number = gridIs3DParameter ? verifyCellAround3D(birthRate, positionsGenerated, deadCell, cubeSizeParameter) : verifyCellAround2D(birthRate, positionsGenerated, deadCell, cubeSizeParameter)
                            if (liveCellsAroundCounter == birthRate) {
                                const existsInBoxToCreate = cellsToCreate.some(cell => vectorsAreEqual(deadCell, cell));
                                if (!existsInBoxToCreate) {
                                    cellsToCreate.push(deadCell);
                                }
                            }
                        })
                    })
                    const updatedPositions = [...positionsToFilter, ...cellsToCreate];
                    const uniqueUpdatedPositions = updatedPositions.reduce((acc: THREE.Vector3[], current) => {
                        if (!acc.some(item => vectorsAreEqual(item, current))) {
                            acc.push(current);
                        }
                        return acc;
                    }, []);
                    dispatch(setCellsNumber(uniqueUpdatedPositions.length))
                    setPositionsGenerated(uniqueUpdatedPositions)
                    dispatch(setCellPositions(uniqueUpdatedPositions.map(vectorToString)))


                }
            }, 1000 / speed)
        }
    }, [positionsGenerated, gameIsRunning, importedDataIsLoad])*/


    // game of life system REDUX VERSION 
    useEffect(() => {
        if (stepByStepMode == false) {
            if (loadedData && importedDataIsLoad === false) {
                setPositionsGenerated(loadedData.cellPositions.map((vectorString: string) => stringToVector(vectorString)));

                setImportedDataIsLoad(true)
            }
            setTimeout(() => {
                if (gameIsRunning && positionsGenerated.length !== 0) {
                    dispatch(setNumberFrame(currentFrame + 1))

                    let positionsToFilter: THREE.Vector3[] = positionsGenerated
                    let cellsToDelete: THREE.Vector3[] = []
                    let cellsToCreate: THREE.Vector3[] = []
                    positionsToFilter.forEach(boxPosition => {
                        let countBoxAround: number = gridIs3DParameter ? verifyCellAround3D(surpopulationLimit, positionsGenerated, boxPosition, cubeSizeParameter) : verifyCellAround2D(surpopulationLimit, positionsGenerated, boxPosition, cubeSizeParameter)
                        if (countBoxAround > surpopulationLimit || countBoxAround <= lonelinessLimit) {
                            if (!cellsToDelete.includes(boxPosition)) {
                                cellsToDelete.push(boxPosition)
                            }
                        }
                    })
                    positionsToFilter = positionsToFilter.filter(positionToFilter =>
                        !cellsToDelete.some(positionToDelete =>
                            positionToFilter.x == positionToDelete.x &&
                            positionToFilter.y == positionToDelete.y &&
                            positionToFilter.z == positionToDelete.z
                        )
                    );
                    positionsToFilter.forEach(filteredPosition => {
                        const deadCellAround: THREE.Vector3[] = returnDeadCellAround(positionsToFilter, filteredPosition, cubeSizeParameter, gridIs3DParameter ? true : false)
                        deadCellAround.forEach(deadCell => {
                            let liveCellsAroundCounter: number = gridIs3DParameter ? verifyCellAround3D(birthRate, positionsGenerated, deadCell, cubeSizeParameter) : verifyCellAround2D(birthRate, positionsGenerated, deadCell, cubeSizeParameter)
                            if (liveCellsAroundCounter == birthRate) {
                                const existsInBoxToCreate = cellsToCreate.some(cell => vectorsAreEqual(deadCell, cell));
                                if (!existsInBoxToCreate) {
                                    cellsToCreate.push(deadCell);
                                }
                            }
                        })
                    })
                    const updatedPositions = [...positionsToFilter, ...cellsToCreate];
                    const uniqueUpdatedPositions = updatedPositions.reduce((acc: THREE.Vector3[], current) => {
                        if (!acc.some(item => vectorsAreEqual(item, current))) {
                            acc.push(current);
                        }
                        return acc;
                    }, []);
                    dispatch(setCellsNumber(uniqueUpdatedPositions.length))
                    setPositionsGenerated(uniqueUpdatedPositions)
                    dispatch(setCellPositions(uniqueUpdatedPositions.map(vectorToString)))


                }
            }, 1000 / speed)
        }
    }, [cellsPositionsGenerated, gameIsRunning, importedDataIsLoad])



    useEffect(() => {
        setImportedDataIsLoad(false)
        if (loadedData)
            setPositionsGenerated(loadedData.cellPositions.map((vectorString: string) => stringToVector(vectorString)));

    }, [loadedData])


    useEffect(() => {
        if (showPerimeter) {
            if (sceneRef.current !== null) {
                for (const oldPerimeter of perimeterObjects) {
                    sceneRef.current.remove(oldPerimeter);
                }
                const cellGroups = defineCellGroup(positionsGenerated, cubeSizeParameter);
                const newPerimeterObjects: THREE.Object3D[] = [];

                for (const group of cellGroups) {
                    const perimeterToAdd = definePerimeterCellGroup(group, positionsGenerated, cubeSizeParameter, gridIs3DParameter);
                    sceneRef.current.add(perimeterToAdd);
                    newPerimeterObjects.push(perimeterToAdd);
                }
                setPerimeterObjects(newPerimeterObjects);
                setPerimeterList(cellGroups)
            }
        }

        else if (sceneRef.current !== null) {
            for (const oldPerimeter of perimeterObjects) {
                sceneRef.current.remove(oldPerimeter);
            }
        }


    }, [showPerimeter, positionsGenerated]);

    useEffect(() => {
        if (linkCells) {
            if (sceneRef.current !== null) {
                for (const oldLinks of linksCells) {
                    sceneRef.current.remove(oldLinks);
                }
                const newLinksCells: THREE.Object3D[] = [];

                for (const position of positionsGenerated) {
                    const neighborToLink = searchNeighborInstancesPositions(positionsGenerated, position, cubeSizeParameter, gridIs3DParameter);

                    const links = createLinkCells(neighborToLink, position)
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


    }, [linkCells, positionsGenerated]);

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
    }, [planeInstances, positionsGenerated, gameIsRunning, positionMouse]);




    return (
        <>

            <div className='w-full h-full' ref={workspace3D}></div>
        </>
    )
}


export default threeJSSceneComponent



