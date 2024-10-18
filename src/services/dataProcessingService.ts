import * as THREE from 'three';

const roundToTwo = (num: number): number => {
    const formatedValue: string = (Math.round(num * 100) / 100).toFixed(2)
    return Number(formatedValue);
  }
  
  const stringToVector = (vectorString: string): THREE.Vector3 => {
    const [x, y, z] = vectorString.split(',').map(coord => parseFloat(coord));
    return new THREE.Vector3(x, y, z);
};

function vector3ToObject(vector: THREE.Vector3) {
    return { x: vector.x, y: vector.y, z: vector.z };
}

function objectToVector3(obj: { x: number, y: number, z: number }) {
    return new THREE.Vector3(obj.x, obj.y, obj.z);
}
const vectorToString = (vector: THREE.Vector3) => {
    return `${roundToTwo(vector.x)},${roundToTwo(vector.y)},${roundToTwo(vector.z)}`;
  }
  
  function vectorsAreEqual(v1: THREE.Vector3, v2: THREE.Vector3): boolean {
    return v1.x == v2.x && v1.y == v2.y && v1.z == v2.z;
  }

  export { roundToTwo, vector3ToObject,  objectToVector3, vectorToString, vectorsAreEqual, stringToVector }