
import { selectGameIsActive, setGameIsActive } from '@/app/components/lateralPanels/reducers/controllerParameterReducer';
import { group } from 'console';
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
/*
const definePointPerimeterOrder = (positions: THREE.Vector3[]) => {
  let positionsList = positions
  // Initialisation du tableau pour stocker les positions dans l'ordre
  let orderedList: THREE.Vector3[] = [];

  // Départ avec le premier élément
  let prevPosition = positionsList.shift()!;
  orderedList.push(prevPosition);

  while (orderedList.length !== positions.length) {

    let alignedCellsOnPrevX = positionsList.filter(cell => { return cell.x == prevPosition.x })
    if (alignedCellsOnPrevX.length > 0) {
      alignedCellsOnPrevX.sort((a, b) => a.x - b.x)

      for (let index = 0; index < alignedCellsOnPrevX.length; index++) {
        const element = positions[index];
        orderedList.push(element)
        const toDelete = positionsList.findIndex(cell => cell.x == element.x && cell.y == element.y && cell.z == element.z)
        positionsList.splice(toDelete,1)

      }

    }

    else if (alignedCellsOnPrevX.length == 0) {
      let alignedCellsOnPrevY = positionsList.filter(cell => { return cell.y == prevPosition.y })
      if (alignedCellsOnPrevY.length > 0){}
    }
    /* // Chercher une position qui partage le même x
     if (nextPositionIndex === -1) {
       nextPositionIndex = positionsList.findIndex(position => position.x === prevPosition.x);
     }
     // Si aucun n'a le même x, chercher un y similaire
     if (nextPositionIndex === -1) {
       nextPositionIndex = positionsList.findIndex(position => position.y === prevPosition.y);
     }
 
 
     // Si une position est trouvée
     if (nextPositionIndex !== -1) {
       // Mettre à jour prevPosition et ajouter à la liste ordonnée
       prevPosition = positionsList.splice(nextPositionIndex, 1)[0];
       orderedList.push(prevPosition);
     } else {
       // Si aucune position n'est trouvée, sortir de la boucle (cas improbable mais préventif)
       break;
     }
   }
    console.log(orderedList)
    return orderedList;
  }

*/

  const drawPerimeter = (positions: THREE.Vector3[]) => {
    console.log(positions)
   // const test = definePointPerimeterOrder(positions)
    let curvePath: THREE.CurvePath<THREE.Vector3> = new THREE.CurvePath<THREE.Vector3>()
    const geometry = new THREE.BufferGeometry().setFromPoints(positions); // revoir la logique ici pour ne pas relier les points de maniere chaotique definir un ordre de liaison en fonction des positions 

    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

    const curveObject = new THREE.Line(geometry, material);

    return curveObject;
  }

  const vectorToString = (vector: THREE.Vector3) => {
    return `${roundToTwo(vector.x)},${roundToTwo(vector.y)},${roundToTwo(vector.z)}`;
  }

  function vectorsAreEqual(v1: THREE.Vector3, v2: THREE.Vector3): boolean {
    return v1.x == v2.x && v1.y == v2.y && v1.z == v2.z;
  }

  const roundToTwo = (num: number): number => {
    const formatedValue: String = (Math.round(num * 100) / 100).toFixed(2)
    return Number(formatedValue);
  }


  const defineCellGroup = (positionsList: THREE.Vector3[], cubeSizeParameter: number): Array<THREE.Vector3[]> => {
    let groupList: Array<THREE.Vector3[]> = new Array()
    const positions = positionsList
    const visited = new Set();

    const depthFirstSearch = (cell: THREE.Vector3, group: Array<THREE.Vector3>, cubeSizeParameter: number) => {
      visited.add(vectorToString(cell));
      group.push(cell);
      for (const offset of offsets2D) {
        const neighbor = new THREE.Vector3(
          roundToTwo(Number(cell.x) + offset.x * cubeSizeParameter),
          roundToTwo(Number(cell.y) + offset.y * cubeSizeParameter),
          roundToTwo(Number(cell.z) + offset.z * cubeSizeParameter)
        );
        if (
          positions.some(position =>
            position.x == neighbor.x && position.y == neighbor.y && position.z == neighbor.z) &&
          !visited.has(vectorToString(neighbor))
        ) {
          depthFirstSearch(neighbor, group, cubeSizeParameter);
        }
      }
    }
    for (const pos of positions) {
      if (!visited.has(vectorToString(pos))) {
        const group: THREE.Vector3[] = [];
        depthFirstSearch(pos, group, cubeSizeParameter);
        groupList.push(group);
      }
    }

    return groupList
  }

  const definePerimeterCellGroup3D = (groupCell: THREE.Vector3[]) => {
    const perimiterLimits = getMinMax(groupCell)
    const newCellGroup: THREE.Vector3[] = groupCell.filter(cell => {
      return cell.x == perimiterLimits.minX || cell.x == perimiterLimits.maxX || cell.y == perimiterLimits.minY || cell.y == perimiterLimits.maxY || cell.z == perimiterLimits.minZ || cell.z == perimiterLimits.maxZ
    })
    return newCellGroup
  }


  const definePerimeterCellGroup2D = (groupCell: THREE.Vector3[], prevBoxPositions: THREE.Vector3[], cubeSizeParameter: number) => {
    console.log('Total Cells:', groupCell.length);
    const perimiterLimits = getMinMax(groupCell);
    console.log('Perimeter Limits:', perimiterLimits);

    // erreur su les forme complexe , rajouter une logique qui dit que si il y a une case vide a coté , c'est qu'il s'agit d'un element en bordure et donc a prendre en compte

    const newCellGroup: THREE.Vector3[] = groupCell.filter(cell => {
      const x = Number(cell.x);
      const y = Number(cell.y);
      return (
        ((x === Number(perimiterLimits.minX) ||
          x === Number(perimiterLimits.maxX) ||
          y === Number(perimiterLimits.minY) ||
          y === Number(perimiterLimits.maxY)) || (deadBoxAround2D(prevBoxPositions, cell, cubeSizeParameter) === true))
      );
    });

    console.log('Cells in Perimeter:', newCellGroup.length);

    // Assurer que drawPerimeter est bien définie et renvoie le bon type
    const perimeter = drawPerimeter(newCellGroup);
    return perimeter;
  }

  const getMinMax = (positionsList: THREE.Vector3[]) => {
    let minX: number = Infinity;
    let maxX: number = -Infinity;
    let minY: number = Infinity;
    let maxY: number = -Infinity;
    let minZ: number = Infinity;
    let maxZ: number = -Infinity;
    positionsList.forEach(elem => {
      if (elem.x < minX) {
        minX = elem.x
      }
      if (elem.x > maxX) {
        maxX = elem.x
      }
      if (elem.y < minY) {
        minY = elem.y
      }
      if (elem.y > maxY) {
        maxY = elem.y
      }
      if (elem.z < minZ) {
        minZ = elem.z
      }
      if (elem.z > maxZ) {
        maxZ = elem.z
      }


    })
    console.log({ minX, maxX, minY, maxY, minZ, maxZ })
    return { minX, maxX, minY, maxY, minZ, maxZ }
  }

  const generateNewPosition = (position: THREE.Vector3, offsets: { x: number, y: number, z: number }, cubeSize: number): THREE.Vector3 => {
    return new THREE.Vector3(
      roundToTwo(Number(position.x) + (Number(offsets.x) * Number(cubeSize))),
      roundToTwo(Number(position.y) + (Number(offsets.y) * Number(cubeSize))),
      roundToTwo(Number(position.z) + (Number(offsets.z) * Number(cubeSize)))
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
  const deadBoxAround2D = (
    prevBoxPositions: THREE.Vector3[],
    positionToVerify: THREE.Vector3,
    cubeSizeParameter: number
  ): boolean => {

    return offsets2D.some((offset) => {

      const targetPosition = new THREE.Vector3(
        roundToTwo(Number(positionToVerify.x) + offset.x * cubeSizeParameter),
        roundToTwo(Number(positionToVerify.y) + offset.y * cubeSizeParameter),
        roundToTwo(Number(positionToVerify.z) + offset.z * cubeSizeParameter)
      );

      return !prevBoxPositions.some(position =>
        position.x == targetPosition.x &&
        position.y == targetPosition.y &&
        position.z == targetPosition.z
      );
    });
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



  export { propagateCube3D, propagateCube2D, verifyBoxAround3D, verifyBoxAround2D, roundToTwo, vectorsAreEqual, returnDeadCellAround, defineCellGroup, definePerimeterCellGroup2D, definePerimeterCellGroup3D }