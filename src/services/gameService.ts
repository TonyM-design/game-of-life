
import * as THREE from 'three';

import { roundToTwo, stringToVector, vectorToString } from '@/services/dataProcessingService';

const offsets3D: string[] = [];
for (let x = -1; x <= 1; x++) {
  for (let y = -1; y <= 1; y++) {
    for (let z = -1; z <= 1; z++) {
      if (x !== 0 || y !== 0 || z !== 0) {
        offsets3D.push(`${roundToTwo(x)},${roundToTwo(y)},${roundToTwo(z)}`);
      }
    }
  }
}
const offsets3DRedux: string[] = [];
for (let x = -1; x <= 1; x++) {
  for (let y = -1; y <= 1; y++) {
    for (let z = -1; z <= 1; z++) {
      if (x !== 0 || y !== 0 || z !== 0) {
        offsets3DRedux.push(`${roundToTwo(x)},${roundToTwo(y)},${roundToTwo(z)}`);
      }
    }
  }
}

const offsets2D: string[] = [];
for (let x = -1; x <= 1; x++) {
  for (let y = -1; y <= 1; y++) {
    if (x !== 0 || y !== 0) {
      offsets2D.push(`${roundToTwo(x)},${roundToTwo(y)},${roundToTwo(0)}`);
    }
  }
}
const offsets2DExtend2Levels: string[] = [];
for (let x = -2; x <= 2; x++) {
  for (let y = -2; y <= 2; y++) {
    if (x !== 0 || y !== 0) {
      offsets2DExtend2Levels.push(`${roundToTwo(x)},${roundToTwo(y)},${roundToTwo(0)}`);
    }
  }
}

const offsets2DExtend3Levels: string[] = [];
for (let x = -3; x <= 3; x++) {
  for (let y = -3; y <= 3; y++) {
    if (x !== 0 || y !== 0) {
      offsets2DExtend3Levels.push(`${roundToTwo(x)},${roundToTwo(y)},${roundToTwo(0)}`);
    }
  }
}

const searchNeighborInstancesPositions = (positionsList: THREE.Vector3[], startCell: THREE.Vector3, cubeSizeParameter: number, is3dContext: boolean) => {
  const neighbors: THREE.Vector3[] = []
  if (is3dContext == false) {
    offsets2D.forEach(offset => {
      let offsetVector = stringToVector(offset)
      const targetPosition = new THREE.Vector3(
        roundToTwo(Number(startCell.x) + offsetVector.x * cubeSizeParameter),
        roundToTwo(Number(startCell.y) + offsetVector.y * cubeSizeParameter),
        roundToTwo(Number(startCell.z) + offsetVector.z * cubeSizeParameter)
      );

      if (positionsList.some(position =>
        position.x == targetPosition.x &&
        position.y == targetPosition.y &&
        position.z == targetPosition.z
      )) {
        neighbors.push(startCell)
        neighbors.push(targetPosition)
      }

    })
  }
  offsets3D.forEach(offset => {
    let offsetVector = stringToVector(offset)
    const targetPosition = new THREE.Vector3(
      roundToTwo(Number(startCell.x) + offsetVector.x * cubeSizeParameter),
      roundToTwo(Number(startCell.y) + offsetVector.y * cubeSizeParameter),
      roundToTwo(Number(startCell.z) + offsetVector.z * cubeSizeParameter)
    );

    if (positionsList.some(position =>
      position.x == targetPosition.x &&
      position.y == targetPosition.y &&
      position.z == targetPosition.z
    )) {
      neighbors.push(startCell)
      neighbors.push(targetPosition)
    }

  })
    ; return neighbors

}


const createLinkCells = (neighbors: THREE.Vector3[], startCell: THREE.Vector3) => {
  let segmentPairToDraw: [THREE.Vector3, THREE.Vector3][] = [];
  let linksToAdd: THREE.Line[] = []
  for (const element of neighbors) {
    segmentPairToDraw.push([startCell, element]);
  }

  for (const element of segmentPairToDraw) {
    const geometryLine = new THREE.BufferGeometry().setFromPoints(element);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const link = new THREE.Line(geometryLine, material);
    linksToAdd.push(link)
  }

  return linksToAdd

}
const drawPerimeter = (positions: string[], cubeSizeParameter: number, groupCell: string[], is3dContext: boolean) => {
  const perimeter = (definePerimeter(positions.map(stringToVector), cubeSizeParameter, groupCell.map(stringToVector), is3dContext))
  const geometry = new THREE.PlaneGeometry(cubeSizeParameter, cubeSizeParameter);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.1, transparent: true });
  const instancedMesh = new THREE.InstancedMesh(geometry, material, perimeter.length);
  const dummy = new THREE.Object3D();
  perimeter.forEach((position, index) => {
    dummy.position.copy(position);
    dummy.updateMatrix();
    instancedMesh.setMatrixAt(index, dummy.matrix);
  });
  instancedMesh.userData.isPerimeter = true
  return instancedMesh
}



const definePerimeter = (perimeterCells: THREE.Vector3[], cubeSizeParameter: number, cellPositions: THREE.Vector3[], is3dContext: boolean) => {
  let pointPerimeterList: THREE.Vector3[] = []
  for (const position of perimeterCells) {
    offsets2D.forEach(offset => {
      let offsetVector = stringToVector(offset)
      const targetPosition = new THREE.Vector3(
        roundToTwo(Number(position.x) + offsetVector.x * cubeSizeParameter),
        roundToTwo(Number(position.y) + offsetVector.y * cubeSizeParameter),
        roundToTwo(Number(position.z) + offsetVector.z * cubeSizeParameter)
      );
      if (pointPerimeterList.some(savedPosition => savedPosition.x == targetPosition.x && savedPosition.y == targetPosition.y && savedPosition.z == targetPosition.z) == false) {
        pointPerimeterList.push(targetPosition)
      }
    });
  }
  return pointPerimeterList.filter(position => !cellPositions.some(alivePosition => position.x == alivePosition.x && position.y == alivePosition.y && position.z == alivePosition.z))

}



const defineCellGroup = (positionsList: string[], cubeSizeParameter: number, is3DContext: boolean): Array<string[]> => {
  let groupList: Array<string[]> = new Array()
  const positions = positionsList
  const visited = new Set<string>();


  const depthFirstSearch = (cell: string, group: string[], cubeSizeParameter: number) => {
    visited.add(cell);
    group.push(cell);
    const vectorPositionCell = stringToVector(cell)
    for (const offset of offsets2D) {
      let vectorOffset = stringToVector(offset)
      const neighbor = new THREE.Vector3(
        roundToTwo(Number(vectorPositionCell.x) + vectorOffset.x * cubeSizeParameter),
        roundToTwo(Number(vectorPositionCell.y) + vectorOffset.y * cubeSizeParameter),
        roundToTwo(Number(vectorPositionCell.z) + vectorOffset.z * cubeSizeParameter)
      );
      if (
        positions.map(stringToVector).some(position =>
          
          position.x == neighbor.x && position.y == neighbor.y && position.z == neighbor.z) &&
        !visited.has(vectorToString(neighbor))
      ) {
        depthFirstSearch(vectorToString(neighbor), group, cubeSizeParameter);
      }
    }


  }



for (const pos of positions) {
  if (!visited.has(pos)) {
    const group: string[] = [];
    depthFirstSearch(pos, group, cubeSizeParameter);
    groupList.push(group);
  }
}
return groupList
}



const definePerimeterCellGroup = (groupCell: string[], prevBoxPositions: string[], cubeSizeParameter: number, is3dContext: boolean) => {
  const perimiterLimits = getMinMax(groupCell.map(stringToVector));
  const newCellGroup: string[] = groupCell.filter(cell => {

    const x = Number(stringToVector(cell).x);
    const y = Number(stringToVector(cell).y);
    return (
      ((x === Number(perimiterLimits.minX) ||
        x === Number(perimiterLimits.maxX) ||
        y === Number(perimiterLimits.minY) ||
        y === Number(perimiterLimits.maxY)) || (deadBoxAround2D(prevBoxPositions.map(stringToVector), stringToVector(cell), cubeSizeParameter) === true))
    );
  });
  const perimeter = drawPerimeter(newCellGroup, cubeSizeParameter, groupCell, is3dContext);
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
  return { minX, maxX, minY, maxY, minZ, maxZ }
}

const verifyCellAround3D = (
  prevBoxPositions: THREE.Vector3[],
  positionToVerify: THREE.Vector3,
  cubeSizeParameter: number
): number => {
  let counterPosition = 0;
  offsets3D.forEach((offset) => {
    let offsetVector = stringToVector(offset)
    const targetPosition = new THREE.Vector3(
      roundToTwo(Number(positionToVerify.x) + offsetVector.x * cubeSizeParameter),
      roundToTwo(Number(positionToVerify.y) + offsetVector.y * cubeSizeParameter),
      roundToTwo(Number(positionToVerify.z) + offsetVector.z * cubeSizeParameter)
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

const verifyCellAround2D = (
  parameterLimit: number,
  prevBoxPositions: THREE.Vector3[],
  positionToVerify: THREE.Vector3,
  cubeSizeParameter: number
): number => {

  let contextOffset: string[] = []
  if (parameterLimit <= 8) {
    contextOffset = offsets2D
  }
  else if (parameterLimit <= 24) {
    contextOffset = offsets2DExtend2Levels

  }
  else if (parameterLimit <= 48) {
    contextOffset = offsets2DExtend3Levels

  }
  let counterPosition = 0;
  contextOffset.forEach((offset) => {
    let offsetVector = stringToVector(offset)
    const targetPosition = new THREE.Vector3(
      roundToTwo(Number(positionToVerify.x) + offsetVector.x * cubeSizeParameter),
      roundToTwo(Number(positionToVerify.y) + offsetVector.y * cubeSizeParameter),
      roundToTwo(Number(positionToVerify.z) + offsetVector.z * cubeSizeParameter)
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

    let offsetVector = stringToVector(offset)
    const targetPosition = new THREE.Vector3(
      roundToTwo(Number(positionToVerify.x) + offsetVector.x * cubeSizeParameter),
      roundToTwo(Number(positionToVerify.y) + offsetVector.y * cubeSizeParameter),
      roundToTwo(Number(positionToVerify.z) + offsetVector.z * cubeSizeParameter)
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

  const existingPositionsSet = new Set(prevBoxPositions.map(vectorToString));
  offsets.forEach((offset) => {
    let offsetVector = stringToVector(offset)
    const targetPosition = new THREE.Vector3(
      roundToTwo(Number(positionToVerify.x) + offsetVector.x * cubeSizeParameter),
      roundToTwo(Number(positionToVerify.y) + offsetVector.y * cubeSizeParameter),
      roundToTwo(Number(positionToVerify.z) + offsetVector.z * cubeSizeParameter)
    );

    if (
      !existingPositionsSet.has(vectorToString(targetPosition)) &&
      !targetPosition.equals(positionToVerify)
    ) {
      deadCellsAround.push(targetPosition);
    }
  });
  return deadCellsAround;
};



export { verifyCellAround3D, verifyCellAround2D, roundToTwo, returnDeadCellAround, defineCellGroup, definePerimeterCellGroup, searchNeighborInstancesPositions, createLinkCells }