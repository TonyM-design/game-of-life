"use client";

import React, { Ref, RefObject, useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { useDispatch, useSelector } from 'react-redux';
import { selectGridHeight, selectGridWidth, selectGridDepth, selectGridIsPointLines, selectGridIs3DGrid, selectCubeSize, selectBirthRate, selectSurpopulationLimit, selectLonelinessLimit, selectSpeed, selectHideGrid, selectPerimeter, selectTypeOfCell } from './lateralPanels/reducers/gridParametersReducer';
import { selectCellsNumber, selectNumberFrame, setCellsNumber, setNumberFrame } from '../components/lateralPanels/reducers/controllerParameterReducer'
import { setTimeout } from 'timers';
import { returnDeadCellAround, vectorsAreEqual, verifyBoxAround2D, verifyBoxAround3D, defineCellGroup, definePerimeterCellGroup2D } from '@/services/gameService';
import { selectGameIsActive } from './lateralPanels/reducers/controllerParameterReducer';

function threeJSSceneComponent() {
    const dispatch = useDispatch()
    const workspace3D = useRef<HTMLDivElement>(null);
    const hideGridParameter = useSelector(selectHideGrid)
    const gridHeightParameter = useSelector(selectGridHeight);
    const gridWidthParameter = useSelector(selectGridWidth);
    const gridDepthParameter = useSelector(selectGridDepth);
    const gridIsInfiniteParameter = useSelector(selectGridIsPointLines);
    const gridIs3DParameter = useSelector(selectGridIs3DGrid);
    const cubeSizeParameter: number = useSelector(selectCubeSize);
    const birthRate: number = useSelector(selectBirthRate);
    const surpopulationLimit: number = useSelector(selectSurpopulationLimit);
    const lonelinessLimit: number = useSelector(selectLonelinessLimit);
    const speed: number = useSelector(selectSpeed);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.Camera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<any>(null);
    const composerRef = useRef<any>(null);
    /* const raycasterRef = useRef(new THREE.Raycaster());
     const mouseRef = useRef(new THREE.Vector2());
     const cameraRef = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
 */
    const gameIsRunning: boolean = useSelector(selectGameIsActive)
    const currentFrame: number = useSelector(selectNumberFrame)
    const showPerimeter: boolean = useSelector(selectPerimeter)
    const cellsNumber: number = useSelector(selectCellsNumber)
    const typeOfCell: String = useSelector(selectTypeOfCell)

    const [positionCamera, setPositionCamera] = useState<THREE.Vector3>(new THREE.Vector3(0, 50, 100));

    // grid 
    const [planePositions, setPlanePosition] = useState<THREE.Vector3[]>([]);
    const [planeInstances, setPlaneInstances] = useState<THREE.InstancedMesh | null>(null);
    // end grid

    const [positionsGenerated, setPositionsGenerated] = useState<THREE.Vector3[]>([]);
    const [instancesGenerated, setInstancesGenerated] = useState<THREE.InstancedMesh | null>(null);
    const [particlesGenerated, setParticlesGenerated] = useState<THREE.Points | null>(null);
    
    
    const [perimeterList, setPerimeterList] = useState<THREE.Vector3[][]>([]);



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
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.3, // strength
            0.2, // radius
            0.2 // threshold
        );
        composer.addPass(bloomPass);

        return { scene, camera, renderer, controls, composer };
    }

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

    function addBoxCell(bannedPosition: THREE.Vector3) {
        const newBoxPositions = positionsGenerated
        const x: string = (bannedPosition.x as unknown as number).toFixed(2);
        const y: string = (bannedPosition.y as unknown as number).toFixed(2);
        const z: string = (bannedPosition.z as unknown as number).toFixed(2);
        const newPositionToExclude = new THREE.Vector3(x as unknown as number, y as unknown as number, z as unknown as number)
        if (!newBoxPositions.some(cell => vectorsAreEqual(newPositionToExclude, cell))) {
            newBoxPositions.push(newPositionToExclude)
            return newBoxPositions
        } else {
            return newBoxPositions.filter((cell) => !vectorsAreEqual(newPositionToExclude, cell))
        }
    }

    function generatePlaneInstance(scene: THREE.Scene, positions: THREE.Vector3[]) {
        const geometry = new THREE.PlaneGeometry(cubeSizeParameter, cubeSizeParameter);
        const material = new THREE.MeshBasicMaterial({ color: 0xff42ff, wireframe: true });
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

    const getInstancePosition = (instancedMesh: THREE.InstancedMesh, instanceId: number): THREE.Vector3 => {
        const dummy = new THREE.Object3D();
        instancedMesh.getMatrixAt(instanceId, dummy.matrix);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
        const position = dummy.position.clone();
        return position;
    };

    const generateCubeInstance = (scene: THREE.Scene, positions: THREE.Vector3[]) => {
        const geometry = new THREE.BoxGeometry(cubeSizeParameter, cubeSizeParameter, cubeSizeParameter);
        const material = new THREE.MeshPhysicalMaterial({
            //   emissive: 0xffffff,
            color: 0xff42ff,
            transparent: true,
            opacity: 0.5,
            //   emissiveIntensity: 1,
            metalness: 0,
            reflectivity: 1
        }); const instancedMeshCube = new THREE.InstancedMesh(geometry, material, positions.length);
        const dummy = new THREE.Object3D();

        positionsGenerated.forEach((position, index) => {
            dummy.position.copy(position);
            dummy.updateMatrix();
            instancedMeshCube.setMatrixAt(index, dummy.matrix);
        });
        instancedMeshCube.userData.isBox = true
        scene.add(instancedMeshCube);
        return instancedMeshCube;
    }


    const generateParticle = (scene: THREE.Scene, positions: THREE.Vector3[]) => {
           if (typeOfCell == "Point") {
            
                // Créer la géométrie pour les points
                const geometry = new THREE.BufferGeometry();
            
                // Extraire les positions de tes vecteurs en un tableau
                const positions = new Float32Array(positionsGenerated.length * 3);
                for (let i = 0; i < positionsGenerated.length; i++) {
                    positions[i * 3] = positionsGenerated[i].x;
                    positions[i * 3 + 1] = positionsGenerated[i].y;
                    positions[i * 3 + 2] = positionsGenerated[i].z;
                }
            
                // Ajouter les positions à la géométrie
                geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
                // Créer le matériau pour les points
                const material = new THREE.PointsMaterial({
                    color: 0xff42ff,  // Couleur des points
                    size: cubeSizeParameter ,  // Taille des points, ajustable
             
                });
            
                // Créer le système de particules
                const particles = new THREE.Points(geometry, material);
            
                particles.userData.isPoint = true;
            
                // Ajouter le système de particules à la scène
                scene.add(particles);
            
                return particles;
            }

          else  return null;
        }
    const generateAllTypeInstance = (scene: THREE.Scene, positions: THREE.Vector3[]) => {
            if (typeOfCell == "Box") {
                const geometry = new THREE.BoxGeometry(cubeSizeParameter, cubeSizeParameter, cubeSizeParameter);
                const material = new THREE.MeshPhysicalMaterial({
                    color: 0xff42ff,
                    transparent: true,
                    opacity: 0.5,
                    metalness: 0,
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
                scene.add(instancedMeshCube);
                return instancedMeshCube;
            }
           else if (typeOfCell == "Plane") {
                const geometry = new THREE.PlaneGeometry(cubeSizeParameter, cubeSizeParameter);
                const material = new THREE.MeshPhysicalMaterial({
                    color: 0xff42ff,
                    metalness: 0.5,
                    reflectivity: 1
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

          else  return null;
        }
    
   

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
                        const newExcludePlanePosition = addBoxCell(bannedPosition)
                        setPositionsGenerated([...newExcludePlanePosition]);

                    }
                }
            }
        }
    };
    const onCubeClick = (event: MouseEvent) => {
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
                        const newExcludePlanePosition = addBoxCell(bannedPosition)
                        setPositionsGenerated([...newExcludePlanePosition]);

                    }
                }
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
        if (sceneRef.current && typeOfCell !== "Point") {
            const newInstancesGenerated = generateAllTypeInstance(sceneRef.current, positionsGenerated);
            if (instancesGenerated) {
                sceneRef.current.remove(instancesGenerated);      
            if(particlesGenerated){
                sceneRef.current.remove(particlesGenerated)

            }     
         }
            if(newInstancesGenerated !== null && newInstancesGenerated !== undefined ){
            sceneRef.current.add(newInstancesGenerated);
            setInstancesGenerated(newInstancesGenerated)}
        }
        else  if (sceneRef.current && typeOfCell == "Point"){
            const newGeneratedParticles = generateParticle(sceneRef.current, positionsGenerated)
            if(particlesGenerated){
                sceneRef.current.remove(particlesGenerated)
                if (instancesGenerated) {
                    sceneRef.current.remove(instancesGenerated);   
                }
            }
            if(newGeneratedParticles !== null && newGeneratedParticles !== undefined ){
                sceneRef.current.add(newGeneratedParticles);
            setParticlesGenerated(newGeneratedParticles)
            }

        }
    }, [positionsGenerated])

    useEffect(() => {
        setTimeout(() => {
            if (gameIsRunning && positionsGenerated.length !== 0) {
                dispatch(setNumberFrame(currentFrame + 1))

                let positionsToFilter: THREE.Vector3[] = positionsGenerated
                let boxToDelete: THREE.Vector3[] = []
                let boxToCreate: THREE.Vector3[] = []
                positionsToFilter.forEach(boxPosition => {
                    let countBoxAround: number = gridIs3DParameter ? verifyBoxAround3D(positionsGenerated, boxPosition, cubeSizeParameter) : verifyBoxAround2D(positionsGenerated, boxPosition, cubeSizeParameter)
                    if (countBoxAround > surpopulationLimit || countBoxAround <= lonelinessLimit) {
                        if (!boxToDelete.includes(boxPosition)) {
                            boxToDelete.push(boxPosition)
                        }
                    }
                })
                positionsToFilter = positionsToFilter.filter(positionToFilter =>
                    !boxToDelete.some(positionToDelete =>
                        positionToFilter.x == positionToDelete.x &&
                        positionToFilter.y == positionToDelete.y &&
                        positionToFilter.z == positionToDelete.z
                    )
                );
                positionsToFilter.forEach(filteredPosition => {
                    const deadCellAround: THREE.Vector3[] = returnDeadCellAround(positionsToFilter, filteredPosition, cubeSizeParameter, gridIs3DParameter ? true : false)
                    deadCellAround.forEach(deadCell => {
                        let liveCellsAroundCounter: number = gridIs3DParameter ? verifyBoxAround3D(positionsGenerated, deadCell, cubeSizeParameter) : verifyBoxAround2D(positionsGenerated, deadCell, cubeSizeParameter)
                        if (liveCellsAroundCounter === birthRate) {
                            const existsInBoxToCreate = boxToCreate.some(cell => vectorsAreEqual(deadCell, cell));
                            if (!existsInBoxToCreate) {
                                boxToCreate.push(deadCell);
                            }
                        }
                    })
                })
                const updatedPositions = [...positionsToFilter, ...boxToCreate];
                const uniqueUpdatedPositions = updatedPositions.reduce((acc: THREE.Vector3[], current) => {
                    if (!acc.some(item => vectorsAreEqual(item, current))) {
                        acc.push(current);
                    }
                    return acc;
                }, []);
                dispatch(setCellsNumber(uniqueUpdatedPositions.length))
                setPositionsGenerated(uniqueUpdatedPositions)
            }
        }, 1000 / speed)
    }, [positionsGenerated, gameIsRunning])


    useEffect(() => {
        if (showPerimeter) {
            if (sceneRef.current !== null) {
                const cellGroups = defineCellGroup(positionsGenerated, cubeSizeParameter)
                for (const group of cellGroups) {
                    const perimeterToAdd = definePerimeterCellGroup2D(group,positionsGenerated,cubeSizeParameter)
                    sceneRef.current.add(perimeterToAdd);

                }
                setPerimeterList(cellGroups)

            }
        }


    }, [showPerimeter]);
    useEffect(() => {
        if (rendererRef.current) {
            rendererRef.current.domElement.addEventListener('click', onGridClick, false);
            rendererRef.current.domElement.addEventListener('click', onCubeClick, false);
        }

        return () => {
            if (rendererRef.current) {
                rendererRef.current.domElement.removeEventListener('click', onGridClick, false);
                rendererRef.current.domElement.removeEventListener('click', onCubeClick, false);
            }
        };
    }, [planeInstances, positionsGenerated, gameIsRunning]);



    return (
        <div className='w-full h-full' ref={workspace3D}></div>
    )
}

export default threeJSSceneComponent



