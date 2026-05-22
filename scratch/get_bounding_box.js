1const fs = require('fs');

const glbPath = '/Users/nootnoot/occhacks2026/public/3d_model/d.s.s._harbinger_battle_cruiser.glb';

function parseGLB(glbPath) {
  const glbBuffer = fs.readFileSync(glbPath);
  const magic = glbBuffer.toString('utf8', 0, 4);
  if (magic !== 'glTF') throw new Error('Not a valid GLB file');
  const jsonLength = glbBuffer.readUInt32LE(12);
  const jsonStr = glbBuffer.toString('utf8', 20, 20 + jsonLength);
  const gltf = JSON.parse(jsonStr);
  const binOffset = 20 + jsonLength;
  const binLength = glbBuffer.readUInt32LE(binOffset);
  const binBuffer = glbBuffer.slice(binOffset + 8, binOffset + 8 + binLength);
  return { gltf, binBuffer };
}

try {
  const { gltf, binBuffer } = parseGLB(glbPath);

  function readAccessor(accessorIdx) {
    const accessor = gltf.accessors[accessorIdx];
    const bufferView = gltf.bufferViews[accessor.bufferView];
    const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
    const count = accessor.count;
    const elements = [];
    let offset = byteOffset;
    if (accessor.componentType !== 5126) return null; // only float
    for (let i = 0; i < count; i++) {
      const x = binBuffer.readFloatLE(offset);
      const y = binBuffer.readFloatLE(offset + 4);
      const z = binBuffer.readFloatLE(offset + 8);
      elements.push([x, y, z]);
      offset += 12;
    }
    return elements;
  }

  // Let's compute the bounding box of the entire model by traversing all mesh primitives
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  gltf.meshes.forEach((mesh) => {
    mesh.primitives.forEach((primitive) => {
      const posIdx = primitive.attributes.POSITION;
      if (posIdx !== undefined) {
        const accessor = gltf.accessors[posIdx];
        if (accessor.min && accessor.max) {
          if (accessor.min[0] < minX) minX = accessor.min[0];
          if (accessor.min[1] < minY) minY = accessor.min[1];
          if (accessor.min[2] < minZ) minZ = accessor.min[2];
          if (accessor.max[0] > maxX) maxX = accessor.max[0];
          if (accessor.max[1] > maxY) maxY = accessor.max[1];
          if (accessor.max[2] > maxZ) maxZ = accessor.max[2];
        }
      }
    });
  });

  console.log(`Entire model bounding box:`);
  console.log(`Min: [${minX}, ${minY}, ${minZ}]`);
  console.log(`Max: [${maxX}, ${maxY}, ${maxZ}]`);
  console.log(`Center: [${(minX + maxX) / 2}, ${(minY + maxY) / 2}, ${(minZ + maxZ) / 2}]`);
  console.log(`Size: [${maxX - minX}, ${maxY - minY}, ${maxZ - minZ}]`);
} catch (err) {
  console.error(err);
}
