"use client";

import React, { Ref, RefObject, useEffect, useRef } from 'react'
import * as THREE from 'three';
import { Octree, OrbitControls } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh';
import Geometries from 'three/examples/jsm/renderers/common/Geometries.js';

function threeJSSceneComponent() {
    const workspace3D = useRef<HTMLDivElement>(null);
    const gridHeight: number = 10;
    const gridwidth: number = 1;
    const gridDepth: number = 10;
    const cubeSize: number = 0.4;

    interface cellOfLife extends THREE.Mesh {
        isActive?: boolean;
        positionX?: number;
        positionY?: number;
        positionZ?: number;
    }



    const initScene = (workspace3D: React.RefObject<HTMLDivElement>) => {
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
        camera.position.z = 15;
        //CONTROLS
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = false;
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
    


    const generateCubes = (scene: THREE.Scene, gridHeight: number, gridwidth: number, gridDepth: number, cubeSize: number) => {
        const cubes: cellOfLife[] = [];
        THREE.Mesh.prototype.raycast = acceleratedRaycast;
        for (let x = 0; x < gridHeight; x++) {
            for (let y = 0; y < gridwidth; y++) {
                for (let z = 0; z < gridDepth; z++) {
                    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
                    const geometry1 = new THREE.SphereGeometry(cubeSize);
                    // @ts-ignore
                    THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
                    // @ts-ignore
                    THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
                    // @ts-ignore
                    geometry.computeBoundsTree()
                    const material = new THREE.MeshPhysicalMaterial({
                        emissive: 0xffffff,
                        emissiveIntensity: 0,
                        transparent: true,
                        opacity: 0.2, // Opacité (0 = complètement transparent, 1 = complètement opaque)
                    
                        visible:false,
                    });
                   
                    const cube = new THREE.Mesh(geometry, material) as cellOfLife;
                    cube.position.set(x * cubeSize, y * cubeSize, z * cubeSize);
                    cube.positionX = x;
                    cube.positionY = y;
                    cube.positionZ = z;
                    scene.add(cube);
                    cubes.push(cube);
                    const edges = new THREE.EdgesGeometry(geometry);
                    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.1 });
                    const lineSegments = new THREE.LineSegments(edges, lineMaterial);
                    lineSegments.position.copy(cube.position);
                    scene.add(lineSegments);

                }
            }
        }
        return cubes;
    }

    useEffect(() => {
        const { scene, camera, renderer, controls, composer } = initScene(workspace3D)
        const cubes = generateCubes(scene, gridHeight, gridwidth, gridDepth, cubeSize)
       // const grid3D = generateGrid3D(scene, gridHeight, gridwidth, gridDepth, cubeSize)
        THREE.Mesh.prototype.raycast = acceleratedRaycast;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        window.addEventListener('click', onClickCube, false);
        //window.addEventListener('mousemove', onMouseMove, false);


        function onClickCube(event: MouseEvent) {
            event.stopPropagation();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(cubes);
            const intersectedCube = intersects[0]?.object as cellOfLife;

            if (intersectedCube !== undefined) {
                const selectedCube = cubes.findIndex(cube => cube === intersectedCube)
                if (cubes[selectedCube].isActive !== undefined) {
                    cubes[selectedCube].isActive = !cubes[selectedCube].isActive
                }
                else if (cubes[selectedCube].isActive === undefined) {
                    cubes[selectedCube].isActive = true
                }
                console.log(cubes[selectedCube].isActive)
                console.log(cubes[selectedCube])
              
                if (cubes[selectedCube].isActive === true) {
                    (cubes[selectedCube].material as THREE.MeshPhysicalMaterial).visible = true;
                    (cubes[selectedCube].material as THREE.MeshPhysicalMaterial).opacity = 0.5;
                    (cubes[selectedCube].material as THREE.MeshPhysicalMaterial).color.set(0xff0000);
                    (cubes[selectedCube].material as THREE.MeshPhysicalMaterial).emissiveIntensity = 1;
                }
                else if (cubes[selectedCube].isActive === false) {

                    (cubes[selectedCube].material as THREE.MeshPhysicalMaterial).visible=false;
                }
            }
        }
       


        function onMouseMove(event: MouseEvent) {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObjects(cubes);
            cubes.forEach(cube => {
                if (cube.isActive === undefined || cube.isActive === false) {
                    cubes.forEach(cube => (cube.material as THREE.MeshPhysicalMaterial).visible = false);
                }
                else if (cube.isActive) {
                    (cube.material as THREE.MeshPhysicalMaterial).color.set(0xff0000);
                    (cube.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 1;
                }
            })


            for (let i = 0; i < intersects.length; i++) {
                const intersectedCube = intersects[i].object as THREE.Mesh;
                (intersectedCube.material as THREE.MeshPhysicalMaterial).color.set(0xff0000);
                (intersectedCube.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 1;
            }
        }


        const animate = () => {
            requestAnimationFrame(animate);

            controls.update();
            renderer.render(scene, camera);
            composer.render();

        };

        animate();

        return () => {
            window.removeEventListener('mousemove', onMouseMove, false);
            window.removeEventListener('click', onClickCube, false);
            if (workspace3D.current) {
                workspace3D.current.removeChild(renderer.domElement);
            }
        };
    }, [])




    return (
        <div className='w-full h-full' ref={workspace3D}></div>
    )
}

export default threeJSSceneComponent