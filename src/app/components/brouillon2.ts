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
        setGridPositionsPlanes(positions);
        return positions;
    };



    // instance mesh plane grid
    const generateInactiveInstancedMesh = (scene: THREE.Scene, count: number, cubeSize: number) => {
        const geometry = new THREE.PlaneGeometry(cubeSize, cubeSize, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0xff42ff, wireframe: true });
        const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
        scene.add(instancedMesh);
        return instancedMesh;
    };

    // instance mesh cube
    const generateActiveInstanceMesh = (scene: THREE.Scene, count: number, cubeSize: number) => {
        const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const material = new THREE.MeshPhysicalMaterial({
            emissive: 0xffffff,
            emissiveIntensity: 1,
            transparent: true,
            opacity: 0.5,
        });
        const instancedActiveMesh = new THREE.InstancedMesh(geometry, material, count);
        scene.add(instancedActiveMesh);
        return instancedActiveMesh;
    }
    useEffect(() => {
        const { scene, camera, renderer, controls, composer } = initScene(workspace3D, positionCamera);
        const raycaster = new THREE.Raycaster();
        const cubeSize = cubeSizeParameter;
        const instanceCount = gridHeightParameter * gridWidthParameter * gridDepthParameter;
        console.log('USE EFFECT')

        
        const instancedMeshGrid = generateInactiveInstancedMesh(scene, instanceCount, cubeSize);
        setInstancedMeshGrid(instancedMeshGrid);

       

        console.log(instancedMeshGrid)

        const mouse = new THREE.Vector2();
        const dummy = new THREE.Object3D();

        let i = 0
        for (let x = 0; x < gridHeightParameter; x++) {
            for (let y = 0; y < gridWidthParameter; y++) {
                for (let z = 0; z < gridDepthParameter; z++) {
                    dummy.position.set(x * cubeSize, y * cubeSize, z * cubeSize);
                    dummy.updateMatrix();
                    instancedMeshGrid.setMatrixAt(i, dummy.matrix);
               
                    i++
                }
            }
            instancedMeshGrid.instanceMatrix.needsUpdate = true;
        }
        // autosave camera position
        function handleCameraMove() {
            setPositionCamera(camera.position)
        }
        // click
        const onClick = (event: MouseEvent) => {
            console.log('onCLick')
            event.preventDefault();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);

            const intersectsGrid = raycaster.intersectObject(instancedMeshGrid);
            if (intersectsGrid.length > 0) {
                const instanceId = intersectsGrid[0].instanceId;
                if (instanceId !== undefined) {
                    instancedMeshGrid.getMatrixAt(instanceId, dummy.matrix);
                    dummy.position.set(
                        dummy.position.x,
                        dummy.position.y,
                        dummy.position.z
                    );
                    dummy.updateMatrix();
                    instancedMeshGrid.setMatrixAt(instanceId, dummy.matrix);
                    instancedMeshGrid.instanceMatrix.needsUpdate = true;
                }
            }
        };

        window.addEventListener('click', onClick, false);
        controls.addEventListener('change', handleCameraMove);
        // Animation de la scène
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            composer.render();
        };

        animate();

        return () => {
            window.removeEventListener('click', onClick, false);
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