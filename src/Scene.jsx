//Scene.jsx
import {
  AccumulativeShadows,
  RandomizedLight,
  Center,
  Environment,
  PerformanceMonitor,
  CameraControls,
  Grid,
  Sphere,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { EffectComposer, N8AO, SMAA } from "@react-three/postprocessing";
import React, { useEffect, useRef, useState, useTransition } from "react";
import { Model as CannonLevel } from "../public/models/gltfjsx/CannonLevel";
import { Cannon } from "../public/models/gltfjsx/Cannon";
import { Target } from "../public/models/gltfjsx/Target";
import { useBox, usePlane } from '@react-three/cannon'


export default function Scene({ cannonRef, setFireFunction }) {
  const meshRef = useRef()
  const cameraControlsRef = useRef()
  const targetRef = useRef()
  const [cannonBallRef, api] = useBox(() => ({ mass: 1 }))

  // Define a function to switch the mass
  const switchMass = (newMass = 0) => {
    api.mass.set(newMass);
  }

  const applyCannonForce = (forceMagnitude = 1000) => {
    if (cannonRef.current && cannonBallRef.current) {
      api.mass.set(1)
      const cannonPosition = cannonRef.current.getWorldPosition(new THREE.Vector3())
      const cannonRotation = cannonRef.current.getWorldQuaternion(new THREE.Quaternion())

      // Create a direction vector pointing in the direction of the cannon barrel
      const direction = new THREE.Vector3(0, 1, 0); // 1 unit along the y-axis
      direction.applyQuaternion(cannonRotation);

      // Scale the direction by the magnitude of the force to be applied
      const force = direction.multiplyScalar(forceMagnitude);

      // Reset cannonball values
      api.position.set(cannonPosition.x, cannonPosition.y, cannonPosition.z)
      api.rotation.set(cannonRotation.x, cannonRotation.y, cannonRotation.z)
      api.velocity.set(0, 0, 0)

      // Apply the force at the center of the cannonball
      api.applyForce(force.toArray(), cannonBallRef.current.position.toArray());
    }
  }

  const { camera } = useThree()
  camera.maxZoom = 0
  camera.minZoom = 0

  useEffect(() => {
    if (cameraControlsRef.current) {
      cameraControlsRef.current?.setLookAt(0, 9, 40, 0, 9, 35, true)
    }
    if (cannonBallRef.current && cannonRef.current) {
      switchMass()
      let worldPos = new THREE.Vector3()
      cannonRef.current.getWorldPosition(worldPos)
      api.position.set(worldPos.x, worldPos.y, worldPos.z)
    }
    setFireFunction(() => applyCannonForce)
  }, [setFireFunction])

  // useFrame(({ clock }) => api.position.set(Math.sin(clock.getElapsedTime()) * 5, 0, 0))

  return (
    <>
      <group position={[0, 0, 0]}>
        <Center top>
          <CannonLevel ref={meshRef} />
          <Cannon ref={cannonRef} />
          <Target ref={targetRef} />
        </Center>

        <Sphere castShadow receiveShadow ref={cannonBallRef} args={[0.4, 32, 32]}>
          <meshStandardMaterial color="gray" metalness={0.9} roughness={0.4} />
        </Sphere>


        <AccumulativeShadows temporal frames={200} color="black" colorBlend={0.5} opacity={1} scale={10} alphaTest={0.85}>
          <RandomizedLight amount={8} radius={4} ambient={0.5} intensity={1} position={[5, 5, -10]} bias={0.001} />
        </AccumulativeShadows>
        <Effects />
        <spotLight intensity={0.8} angle={1} penumbra={0.2} position={[25, 25, 0]} castShadow />
        <Env />
        <Ground />
        <ContactShadows position={[0, 0, 0]} opacity={0.25} scale={10} blur={1.5} far={0.8} />
        <CameraControls
          ref={cameraControlsRef}
          enabled={true}
          dollySpeed={0}
          truckSpeed={0}
        />
      </group>
    </>
  );
}

function Env() {
  const [preset, setPreset] = useState("sunset");
  const [degraded, degrade] = useState(false);
  // You can use the "inTransition" boolean to react to the loading in-between state,
  // For instance by showing a message
  const [inTransition, startTransition] = useTransition();
  const { blur } = useControls({
    blur: { value: 0.65, min: 0, max: 1 },
    preset: {
      value: preset,
      options: [
        "sunset",
        "dawn",
        "night",
        "warehouse",
        "forest",
        "apartment",
        "studio",
        "city",
        "park",
        "lobby",
      ],
      onChange: (value) => startTransition(() => setPreset(value)),
    },
  });
  return (
    <>
      <PerformanceMonitor onDecline={() => degrade(true)} />
      <Environment
        preset={preset}
        background={true}
        blur={blur}
      >
      </Environment>
    </>
  );
}

function Ground() {
  const gridConfig = {
    cellSize: 0.5,
    cellThickness: 0.5,
    cellColor: 'white',
    sectionSize: 3,
    sectionThickness: 1,
    sectionColor: 'gray',
    fadeDistance: 30,
    fadeStrength: 1,
    followCamera: false,
    infiniteGrid: true
  }
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, 0.0, 0], type: 'Static' }), useRef(null))

  return (
    <>
      <Grid ref={ref} position={[0, -0.01, 0]} args={[10.5, 10.5]} {...gridConfig} />
    </>)
}

function Effects() {
  const { ambinentOcclusion, smaa } = useControls({
    ambinentOcclusion: { value: true },
    smaa: { value: true },
  });

  return (
    <>
      <EffectComposer disableNormalPass multisampling={0}>
        {ambinentOcclusion && (
          <N8AO
            aoRadius={0.2}
            intensity={2}
            aoSamples={6}
            denoiseSamples={4}
          />
        )}
        {smaa && <SMAA />}
      </EffectComposer>

    </>
  );
}
