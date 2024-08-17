"use client";

import React, { Ref, RefObject, useEffect, useRef, useState } from 'react'
import * as THREE from 'three';
import { Octree, OrbitControls } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh';
import Geometries from 'three/examples/jsm/renderers/common/Geometries.js';
import { useSelector } from 'react-redux';
import { selectGridHeight, selectGridWidth, selectGridDepth, selectGridIsInfiniteGrid, selectGridIs3DGrid, selectCubeSize } from './lateralPanels/reducers/gridParametersReducer';

function threeJSSceneComponent() {
    const workspace3D = useRef<HTMLDivElement>(null);
    const gridHeightParameter = useSelector(selectGridHeight)
    const gridWidthParameter = useSelector(selectGridWidth)
    const gridDepthParameter = useSelector(selectGridDepth)
    const gridIsInfiniteParameter = useSelector(selectGridIsInfiniteGrid)
    const gridIs3DParameter = useSelector(selectGridIs3DGrid)
    const cubeSizeParameter = useSelector(selectCubeSize)

    const [positionCamera, setPositionCamera] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 5));
    const [instancedMeshCube, setInstancedMeshCube] = useState<THREE.InstancedMesh | null>(null);
    const [cubeCounter, setCubeCounter] = useState(0)
    const [inactiveIndices, setInactiveIndices] = useState<number[]>([]);

    const [gridPositionsPlanes, setGridPositionsPlanes] = useState<THREE.Vector3[]>([]);
    const [instancedMeshGrid, setInstancedMeshGrid] = useState<THREE.InstancedMesh | null>(null);




    const initScene = (workspace3D: React.RefObject<HTMLDivElement>, positionCameraToLoad: THREE.Vector3) => {
        const scene: THREE.Scene = new THREE.Scene();
        const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
        const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true });
        // RENDERER
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.toneMapping = THREE.NeutralToneMapping;
        renderer.toneMappingExposure = 1;
        if (workspace3D.current) {
            workspace3D.current.appendChild(renderer.domElement)
        }
        //CAMERA
        camera.position.copy(positionCameraToLoad)

        //CONTROLS
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = false;
        controls.saveState
        //LIGHT
        const light = new THREE.AmbientLight(0x404040); // soft white light
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

    const generateGridPositions = (count: number, cubeSize: number) => {
        const positions: THREE.Vector3[] = [];
        for (let x = 0; x < gridHeightParameter; x++) {
            for (let y = 0; y < gridWidthParameter; y++) {
                for (let z = 0; z < gridDepthParameter; z++) {
                    positions.push(new THREE.Vector3(x * cubeSize, y * cubeSize, z * cubeSize));
                }
            }
        }
        console.log('GRID POSITIONS')
        console.log(positions)
        setGridPositionsPlanes(positions);

        return positions;
    }

    const createPlaneInstancedMesh = (scene: THREE.Scene, positions: THREE.Vector3[], cubeSize: number) => {
        const geometry = new THREE.PlaneGeometry(cubeSize, cubeSize);
        const material = new THREE.MeshBasicMaterial({ color: 0xff42ff, wireframe: true });
        const instancedMesh = new THREE.InstancedMesh(geometry, material, positions.length);
        const dummy = new THREE.Object3D();

        positions.forEach((position, index) => {
            console.log(position)
            dummy.position.copy(position);
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(index, dummy.matrix);
        });
        instancedMesh.userData.isPlane = true

        scene.add(instancedMesh);
        return instancedMesh;
    };

    useEffect(() => {
        const { scene, camera, renderer, controls, composer } = initScene(workspace3D, positionCamera);
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const cubeSize = cubeSizeParameter;
        const instanceCount = gridHeightParameter * gridWidthParameter * gridDepthParameter;
        console.log('USE EFFECT')
        const initialPositions = generateGridPositions(instanceCount, cubeSize);
        console.log("initial position ----------------------")
        console.log(initialPositions) // jusqu'ici ok sur les position enregistrées

        const instancedMeshGrid = createPlaneInstancedMesh(scene, initialPositions, cubeSize);
        setInstancedMeshGrid(instancedMeshGrid);
        console.log("instanceMeshGrid")
        console.log(instancedMeshGrid.count)


        // autosave camera position
        function handleCameraMove() {
            setPositionCamera(camera.position)
        }
        // click
        const onClick = (event: MouseEvent) => {
            console.log('onCLick');
            event.preventDefault();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
    
            if (instancedMeshGrid) {
                const intersectsGrid = raycaster.intersectObject(instancedMeshGrid);
                console.log("intersectGrid :");
                console.log(intersectsGrid);
    
                if (intersectsGrid.length > 0) {
                    const instanceId = intersectsGrid[0].instanceId;
                    const intersectedObject = intersectsGrid[0].object;
                    console.log('Clicked instanceId:', instanceId);
    
                    if (instanceId !== undefined && intersectedObject.userData.isPlane) {
                        console.log('Current grid positions:', gridPositionsPlanes);
                                scene.remove(instancedMeshGrid);

                        setGridPositionsPlanes((prevPositions) => {
                            const newPositions = prevPositions.filter((_, index) => index !== instanceId);
                            console.log('New positions after click:', newPositions);                            console.log(newPositions);
                       
                            
                            const newInstancedMesh = createPlaneInstancedMesh(scene, newPositions, cubeSize);
                            setInstancedMeshGrid(newInstancedMesh);
                            return newPositions;
                        });
                                  }
                }
            }
        };

        renderer.domElement.addEventListener('click', onClick, false);
        controls.addEventListener('change', handleCameraMove);
        // Animation de la scène
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            composer.render();
        };

        animate();

        return () => {
            renderer.domElement.removeEventListener('click', onClick, false);
            controls.removeEventListener('change', handleCameraMove);
            if (workspace3D.current) {
                workspace3D.current.removeChild(renderer.domElement);
                setPositionCamera(camera.position.clone())
            }
        };
    }, [
        gridHeightParameter,
        gridWidthParameter,
        gridDepthParameter,
        cubeSizeParameter,
        gridIsInfiniteParameter,
        gridIs3DParameter]);




    return (
        <div className='w-full h-full' ref={workspace3D}></div>
    )
}

export default threeJSSceneComponent


/*
    const getInstanceGrid = (instancedMesh: THREE.InstancedMesh): THREE.Vector3[] => {
        const dummy = new THREE.Object3D();
        const positions: THREE.Vector3[] = [];

        for (let i = 0; i < instancedMesh.count; i++) {
            instancedMesh.getMatrixAt(i, dummy.matrix);
            dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
            positions.push(dummy.position.clone());
        }
        console.log(positions)
        return positions;
    };

    const getInstancePosition = (instancedMesh: THREE.InstancedMesh, instanceId: number): THREE.Vector3 => {
        const dummy = new THREE.Object3D();
        instancedMesh.getMatrixAt(instanceId, dummy.matrix);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
        const position = dummy.position.clone();

        console.log(position)
        return position;
    };
    const generateInstanceCubeAtPostion = (instancedMesh: THREE.InstancedMesh, instanceId: number): THREE.Vector3 => {
        const dummy = new THREE.Object3D();
        instancedMesh.getMatrixAt(instanceId, dummy.matrix);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
        const position = dummy.position.clone();

        console.log(position)
        return position;
    };

    const upgradeGridData = () => {

    }*/