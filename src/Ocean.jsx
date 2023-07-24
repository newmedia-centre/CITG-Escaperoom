//Ocean.jsx
import * as THREE from 'three';
import { useMemo, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';

const Ocean = forwardRef((props, ref) => {
    const uniforms = useMemo(
        () => ({
            time: { value: 0.0 },
            u_colorA: { value: new THREE.Color("#186691") },
            u_colorB: { value: new THREE.Color("#9bd8ff") },
            alpha: { value: 0.2 },
        }), []
    )

    // vertex shader
    const vertexShader = `
        uniform float time;
        varying vec2 vUv;

        void main() {
            vec4 modelPosition = modelMatrix * vec4(position, 1.0);

            modelPosition.y += sin(modelPosition.x * 650.0 + time * 2.0) * 0.08;
            modelPosition.y += cos(modelPosition.z * 900.0 + time * 1.0) * 0.04;

            vUv = uv; // send the uv coordinate to the fragment shader

            vec4 viewPosition = viewMatrix * modelPosition;
            vec4 projectedPosition = projectionMatrix * viewPosition;
            gl_Position = projectedPosition;
        }
  `;

    // fragment shader
    const fragmentShader = `
    uniform vec3 u_colorA;
    uniform vec3 u_colorB;
    uniform float alpha;
    varying vec2 vUv; // get the uv coordinate from the vertex shader

    void main() {
        vec3 color = mix(u_colorA, u_colorB, vUv.y); // use the uv's y coordinate instead of vZ
        gl_FragColor = vec4(color, alpha);
    }
  `;

    // Update the 'time' uniform in the material
    useFrame(({ clock }) => {
        if (ref.current && ref.current.material.uniforms.time) {
            ref.current.material.uniforms.time.value = clock.elapsedTime
        }
    })

    return (
        <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
            <planeBufferGeometry args={[100, 100, 32, 32]} />
            <shaderMaterial
                opacity={1}
                fragmentShader={fragmentShader}
                vertexShader={vertexShader}
                uniforms={uniforms}
                transparent
                side={THREE.DoubleSide}
            />
        </mesh>
    )
})

export default Ocean;
