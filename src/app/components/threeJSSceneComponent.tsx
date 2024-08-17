"use client";

import React, { Ref, RefObject, useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { useDispatch, useSelector } from 'react-redux';
import { selectGridHeight, selectGridWidth, selectGridDepth, selectGridIsPointLines, selectGridIs3DGrid, selectCubeSize, selectBirthRate, selectSurpopulationLimit, selectLonelinessLimit, selectSpeed, selectHideGrid } from './lateralPanels/reducers/gridParametersReducer';
import { selectCellsNumber, selectNumberFrame, setCellsNumber, setNumberFrame } from '../components/lateralPanels/reducers/controllerParameterReducer'
import { setTimeout } from 'timers';
import { returnDeadCellAround, vectorsAreEqual, verifyBoxAround2D, verifyBoxAround3D, } from '@/services/gameService';
import { selectGameIsActive } from './lateralPanels/reducers/controllerParameterReducer';
import { log } from 'console';

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
    const gameIsRunning : boolean = useSelector(selectGameIsActive)
    const currentFrame: number = useSelector(selectNumberFrame)
    const cellsNumber: number = useSelector(selectCellsNumber)

    const [positionCamera, setPositionCamera] = useState<THREE.Vector3>(new THREE.Vector3(0, 50, 100));

    // juste pour placer les box initial en debut de partie
    const [planePositions, setPlanePosition] = useState<THREE.Vector3[]>([]);
    const [planeInstances, setPlaneInstances] = useState<THREE.InstancedMesh | null>(null);


    const [boxPositions, setBoxPositions] = useState<THREE.Vector3[]>([]);
    const [boxInstances, setBoxInstances] = useState<THREE.InstancedMesh | null>(null);



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
        // Positionner la caméra
        camera.position.set(0, -10, 10);

        // Faire en sorte que la caméra regarde vers le centre de la scène
        camera.lookAt(150, 0, 0);
        //CONTROLS
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = false;
        controls.saveState
        //LIGHT
        /* // DIRECTIONAL LIGHT FIXED ON CAMERA POSITION
          const bulbGeometry = new THREE.SphereGeometry( 0.02, 16, 8 );
                  let bulbLight = new THREE.PointLight( 0xffee88, 1, 100, 2 );
  
                  let bulbMat = new THREE.MeshStandardMaterial( {
                      emissive: 0xffffee,
                      emissiveIntensity: 1,
                      color: 0x000000
                  } );
                  bulbLight.add( new THREE.Mesh( bulbGeometry, bulbMat ) );
                  bulbLight.position.copy(positionCameraToLoad)
                  bulbLight.castShadow = true;
                  scene.add( bulbLight );*/

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
        const newBoxPositions = boxPositions
        const x: string = (bannedPosition.x as unknown as number).toFixed(2);
        const y: string = (bannedPosition.y as unknown as number).toFixed(2);
        const z: string = (bannedPosition.z as unknown as number).toFixed(2);
        const newPositionToExclude = new THREE.Vector3(x as unknown as number, y as unknown as number, z as unknown as number)
        console.log(newPositionToExclude)
        if (!newBoxPositions.some(cell => vectorsAreEqual(newPositionToExclude, cell))) {
            newBoxPositions.push(newPositionToExclude)
            return newBoxPositions

        }else  {
            console.log("cube deja present")
            
            console.log(newBoxPositions.filter((cell) => !vectorsAreEqual(newPositionToExclude, cell)))
              return newBoxPositions.filter((cell) => !vectorsAreEqual(newPositionToExclude, cell))

        }
      
    }

    function generatePlaneInstance(scene: THREE.Scene, positions: THREE.Vector3[]) {
        const geometry = new THREE.PlaneGeometry(cubeSizeParameter, cubeSizeParameter);
        const material = new THREE.MeshBasicMaterial({ color: 0xff42ff, wireframe: true });
        const instancedMesh = new THREE.InstancedMesh(geometry, material, positions.length);
        const dummy = new THREE.Object3D();
        positions.filter(position => !boxPositions.some(prevPosition => prevPosition.equals(position)))
        positions.forEach((position, index) => { // mettre une comparaison avec les position exclues
            dummy.position.copy(position);
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(index, dummy.matrix);
        });
        instancedMesh.userData.isPlane = true
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

        boxPositions.forEach((position, index) => {
            dummy.position.copy(position);
            dummy.updateMatrix();
            instancedMeshCube.setMatrixAt(index, dummy.matrix);
        });
        instancedMeshCube.userData.isBox = true
        scene.add(instancedMeshCube);
        return instancedMeshCube;
    }
    const generatePoint = (scene: THREE.Scene, positions: THREE.Vector3[]) => {
        const geometry = new THREE.BoxGeometry(cubeSizeParameter, cubeSizeParameter, cubeSizeParameter);
        const material = new THREE.MeshPhysicalMaterial({
            //   emissive: 0xffffff,
            color: 0xff42ff,
            transparent: true,
            opacity: 0.5,
            //   emissiveIntensity: 1,
            metalness: 0,
            reflectivity: 1
        }); const instancedMesh = new THREE.InstancedMesh(geometry, material, positions.length);
        const dummy = new THREE.Object3D();

        boxPositions.forEach((position, index) => { // mettre une comparaison avec les position exclues
            dummy.position.copy(position);
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(index, dummy.matrix);
        });
        instancedMesh.userData.isBox = true
        scene.add(instancedMesh);
        return instancedMesh;
    }


    const onPlaneClick = (event: MouseEvent) => {
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
                    if (instanceId !== undefined && intersectedObject.userData.isPlane) {
                        let bannedPosition = getInstancePosition(planeInstances, instanceId)
                        const newExcludePlanePosition = addBoxCell(bannedPosition)
                        setBoxPositions([...newExcludePlanePosition]);

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


            if (boxInstances) {
                console.log("onClickCUbe")
                console.log(boxInstances)
                const intersectsGrid = raycaster.intersectObject(boxInstances);
                if (intersectsGrid.length > 0) {
                    const instanceId = intersectsGrid[0].instanceId;
                    const intersectedObject = intersectsGrid[0].object;
                    if (instanceId !== undefined && intersectedObject.userData.isBox) {
                        let bannedPosition = getInstancePosition(boxInstances, instanceId)

                        const newExcludePlanePosition = addBoxCell(bannedPosition)
                    
                        setBoxPositions([...newExcludePlanePosition]);

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
        const initialPositions = calculatePlanePosition().filter(position => !boxPositions.some(prevPosition => prevPosition.equals(position)));
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
                setPlaneInstances(null); // Supprime la référence aux planeInstances
            }
            if (hideGridParameter === false && planePositions.length > 0 ) {
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
        if (sceneRef.current) {
            const newBoxInstances = generateCubeInstance(sceneRef.current, boxPositions);
            if (boxInstances) {
                sceneRef.current.remove(boxInstances);
            }
            sceneRef.current.add(newBoxInstances);
            setBoxInstances(newBoxInstances)
        }
    }, [boxPositions])

    useEffect(() => {
        setTimeout(() => {

         
            if (gameIsRunning && boxPositions.length !== 0) {
                dispatch(setNumberFrame(currentFrame + 1))

                let positionsToFilter: THREE.Vector3[] = boxPositions
                let boxToDelete: THREE.Vector3[] = []
                let boxToCreate: THREE.Vector3[] = []
                console.log(positionsToFilter)
                positionsToFilter.forEach(boxPosition => {
                    let countBoxAround: number = gridIs3DParameter ? verifyBoxAround3D(boxPositions, boxPosition, cubeSizeParameter) : verifyBoxAround2D(boxPositions, boxPosition, cubeSizeParameter)
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
                        let liveCellsAroundCounter: number = gridIs3DParameter ? verifyBoxAround3D(boxPositions, deadCell, cubeSizeParameter) : verifyBoxAround2D(boxPositions, deadCell, cubeSizeParameter)
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

                setBoxPositions(uniqueUpdatedPositions)
            }
        }, 1000 / speed)
    }, [boxPositions,gameIsRunning ])


    useEffect(() => {
        if (rendererRef.current) {
            rendererRef.current.domElement.addEventListener('click', onPlaneClick, false);
            rendererRef.current.domElement.addEventListener('click', onCubeClick, false);
        }

        return () => {
            if (rendererRef.current) {
                rendererRef.current.domElement.removeEventListener('click', onPlaneClick, false);
                rendererRef.current.domElement.removeEventListener('click', onCubeClick, false);
            }
        };
    }, [planeInstances,boxPositions, gameIsRunning]);



    return (
        <div className='w-full h-full' ref={workspace3D}></div>
    )
}

export default threeJSSceneComponent



