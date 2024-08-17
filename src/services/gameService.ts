
import { selectGameIsActive, setGameIsActive } from '@/app/components/lateralPanels/reducers/controllerParameterReducer';
import { useDispatch, useSelector } from 'react-redux';
import * as THREE from 'three';


const offsets3D = [
    { x: 1, y: 0, z: 0 }, { x: -1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: -1, z: 0 },
    { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: -1 }, { x: 1, y: 1, z: 0 }, { x: -1, y: 1, z: 0 },
    { x: 1, y: -1, z: 0 }, { x: -1, y: -1, z: 0 }, { x: 1, y: 0, z: 1 }, { x: -1, y: 0, z: 1 },
    { x: 1, y: 0, z: -1 }, { x: -1, y: 0, z: -1 }, { x: 0, y: 1, z: 1 }, { x: 0, y: -1, z: 1 },
    { x: 0, y: 1, z: -1 }, { x: 0, y: -1, z: -1 }, { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 },
    { x: 1, y: -1, z: 1 }, { x: -1, y: -1, z: 1 }, { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
    { x: 1, y: -1, z: -1 }, { x: -1, y: -1, z: -1 }
];
const offsets2D = [
    { x: 1, y: 0, z: 0 }, { x: -1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: -1, z: 0 },
     { x: 1, y: 1, z: 0 }, { x: -1, y: 1, z: 0 },
    { x: 1, y: -1, z: 0 }, { x: -1, y: -1, z: 0 }

];




function vectorsAreEqual(v1: THREE.Vector3, v2: THREE.Vector3): boolean {
    return v1.x == v2.x && v1.y == v2.y && v1.z == v2.z;
}

const roundToTwo = (num: number) : number => {
    const formatedValue: String = (Math.round(num * 100) / 100).toFixed(2)
    return Number(formatedValue);
}


const generateNewPosition = (position: THREE.Vector3, offsets: { x: number, y: number, z: number }, cubeSize: number): THREE.Vector3 => {
    return new THREE.Vector3(
        roundToTwo(Number(position.x) + (Number(offsets.x) * Number(cubeSize))),
        roundToTwo(Number(position.y) + (Number(offsets.y )* Number(cubeSize))),
        roundToTwo(Number(position.z) +(Number( offsets.z) * Number(cubeSize)))
    );
};
const positionExists = (positions: THREE.Vector3[], target: THREE.Vector3): boolean => {
    return positions.some(position =>
        position.x === target.x && position.y === target.y && position.z === target.z
    );
};

const propagateCube2D = (prevBoxPositions: THREE.Vector3[], positionToVerify: THREE.Vector3, cubeSizeParameter: number): THREE.Vector3 | null => {
    let newCubePosition: THREE.Vector3 | null = null;
    let stop = false;
    while (!stop) {
        const randomIndex = Math.floor(Math.random() * offsets2D.length);
        const newPosition = generateNewPosition(positionToVerify, offsets2D[randomIndex], cubeSizeParameter);
        if (!positionExists(prevBoxPositions, newPosition)) {
            newCubePosition = newPosition;
            stop = true;
        }
    }

    return newCubePosition;
};
const propagateCube3D = (prevBoxPositions: THREE.Vector3[], positionToVerify: THREE.Vector3, cubeSizeParameter: number): THREE.Vector3 | null => {
    let newCubePosition: THREE.Vector3 | null = null;
    let stop = false;
    while (!stop) {
        const randomIndex = Math.floor(Math.random() * offsets3D.length);
        const newPosition = generateNewPosition(positionToVerify, offsets3D[randomIndex], cubeSizeParameter);
        if (!positionExists(prevBoxPositions, newPosition)) {
            newCubePosition = newPosition;
            stop = true;
        }
    }

    return newCubePosition;
};

const verifyBoxAround3D = (
    prevBoxPositions: THREE.Vector3[],
    positionToVerify: THREE.Vector3,
    cubeSizeParameter: number
  ): number => {
    let counterPosition = 0;
      offsets3D.forEach((offset) => {
      const targetPosition = new THREE.Vector3(
        roundToTwo(Number(positionToVerify.x) + offset.x * cubeSizeParameter),
        roundToTwo(Number(positionToVerify.y) + offset.y * cubeSizeParameter),
        roundToTwo(Number(positionToVerify.z) + offset.z * cubeSizeParameter)
      );
        if (prevBoxPositions.some(position =>
          position.x == targetPosition.x &&
          position.y == targetPosition.y &&
          position.z == targetPosition.z
      )) {
        counterPosition += 1;
      }
    });
  
    return counterPosition;
  };
const verifyBoxAround2D = (
    prevBoxPositions: THREE.Vector3[],
    positionToVerify: THREE.Vector3,
    cubeSizeParameter: number
  ): number => {
    let counterPosition = 0;
    offsets2D.forEach((offset) => {
      const targetPosition = new THREE.Vector3(
        roundToTwo(Number(positionToVerify.x) + offset.x * cubeSizeParameter),
        roundToTwo(Number(positionToVerify.y) + offset.y * cubeSizeParameter),
        roundToTwo(Number(positionToVerify.z) + offset.z * cubeSizeParameter)
      );  
      if (prevBoxPositions.some(position =>
          position.x == targetPosition.x &&
          position.y == targetPosition.y &&
          position.z == targetPosition.z
      )) {
        counterPosition += 1;
      }
    });
  
    return counterPosition;
  };

  const returnDeadCellAround = (
    prevBoxPositions: THREE.Vector3[],
    positionToVerify: THREE.Vector3,
    cubeSizeParameter: number,
    is3D: boolean = true
): THREE.Vector3[] => {
    const deadCellsAround: THREE.Vector3[] = [];
    const offsets = is3D ? offsets3D : offsets2D;

    const existingPositionsSet = new Set(prevBoxPositions.map(pos => `${pos.x},${pos.y},${pos.z}`));
    offsets.forEach((offset) => {
        const targetPosition = new THREE.Vector3(
            roundToTwo(Number(positionToVerify.x) + offset.x * cubeSizeParameter),
            roundToTwo(Number(positionToVerify.y) + offset.y * cubeSizeParameter),
            roundToTwo(Number(positionToVerify.z) + offset.z * cubeSizeParameter)
        );

        if (
            !existingPositionsSet.has(`${targetPosition.x},${targetPosition.y},${targetPosition.z}`) &&
            !(targetPosition.x == positionToVerify.x && 
              targetPosition.y == positionToVerify.y && 
              targetPosition.z == positionToVerify.z)
        ) {
            deadCellsAround.push(targetPosition);
        }
    });
    return deadCellsAround;
};



export {propagateCube3D,propagateCube2D, verifyBoxAround3D,verifyBoxAround2D,roundToTwo,vectorsAreEqual,returnDeadCellAround}