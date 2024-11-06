import { Water } from 'three/examples/jsm/objects/Water2'
import { PlaneBufferGeometry } from 'three'

// After setting up a THREE.js scene...

let geometry = new PlaneBufferGeometry(1000, 1000);
let water = new Water(geometry, {
    color: '#aabbcc',
    scale: 4,
    flowDirection: new Vector2(1, 1),
    textureWidth: 1024,
    textureHeight: 1024
});

water.position.y = 10; // Adjust this value to move the water surface up or down

scene.add(water);