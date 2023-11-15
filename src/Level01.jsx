//Level01.jsx
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
  Box,
} from "@react-three/drei";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { EffectComposer, N8AO, SMAA } from "@react-three/postprocessing";
import React, { useEffect, useRef, useState } from "react";
import { Model as CannonLevel } from "../public/models/gltfjsx/CannonLevel";
import { Cannon } from "../public/models/gltfjsx/Cannon";
import { Target } from "../public/models/gltfjsx/Target";
import { CannonBallHint } from "../public/models/gltfjsx/CannonBallHint"
import { WaterLevel } from "../public/models/gltfjsx/WaterLevel"
import { WindowBlueprint } from "../public/models/gltfjsx/WindowBlueprint"
import { PilarBlueprint } from "../public/models/gltfjsx/PilarBlueprint"
import { useSphere, usePlane, useBox } from '@react-three/cannon'
import Ocean from "./Ocean";

export default function Level01({ cannonRef, setFireFunction, lives, setLives, setGameOver, gameOver, setGameWon, gameWon, setResetGame, resetGame }) {
  const meshRef = useRef()
  const cameraControlsRef = useRef()
  const oceanRef = useRef()
  const platformRef = useRef()
  const [cannonBallRef, cannonBallApi] = useSphere(() => ({
    args: [0.8],
    mass: 1,
    onCollide: (e) => handleCollision(e, "cannonBall")
  }))
  const [targetRef] = useBox(() => ({
    args: [1.9, 0.3, 1.9],
    position: [-2, 2.4, -10.7],
    type: "Kinematic",
    onCollide: (e) => handleCollision(e, "target")
  }))
  const [groundRef] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0.1, 0],
    type: "Static",
    onCollide: (e) => handleCollision(e, "ground")
  }))

  const [cameraFocus, setCameraFocus] = useState('default')
  const [selectedObject, setSelectedObject] = useState([])

  const changeCamera = (scene) => {
    switch (scene) {
      case "cannon":
        setCameraFocus(scene)
        cameraControlsRef.current?.setLookAt(2, 7, 10.8, -2, 5, 10.8, true)
        break;
      case "blueprint":
        setCameraFocus(scene)
        cameraControlsRef.current?.setLookAt(6, 9, 11.0, 7, 9, 11.0, true)
        break;
      default:
        setCameraFocus('default')
        cameraControlsRef.current?.setLookAt(-2.3, 7, 18, -2.3, 6, 10, true)
    }
  }

  let hitHandled = false
  const [elapsed, setElapsed] = useState(0) // time elapsed

  const waterLevel = 1.4
  if (oceanRef.current) {
    oceanRef.current.position.y = waterLevel
  }

  const handleCollision = (event, name) => {
    if (name === "cannonBall" && !hitHandled && !gameOver && !gameWon) {
      if (event.body.uuid === targetRef.current.uuid) {
        console.log("The target was hit first!")
        setGameWon(true)
      } else if (event.body.uuid === groundRef.current.uuid) {
        console.log("The ground was hit first!")
        takeLive()
      }
      hitHandled = true
    }
  }

  function CannonBall({ position }) {
    return (
      <Sphere position={position} castShadow receiveShadow args={[0.4, 64, 64]}>
        <meshStandardMaterial color="gray" metalness={0.9} roughness={0.4} />
      </Sphere>
    )
  }

  const takeLive = () => {
    setLives(lives => lives - 1) // Updates lives using callback
  }

  // Define a function to switch the mass
  const switchMass = (newMass = 0) => {
    cannonBallApi.mass.set(newMass);
  }

  // Cannon speed is 7.5 m/s
  const fireCannon = (forceMagnitude = 1000) => {
    if (cannonRef.current && cannonBallRef.current) {

      hitHandled = false

      cannonBallApi.mass.set(1)
      const cannonPosition = cannonRef.current.getWorldPosition(new THREE.Vector3())
      const cannonRotation = cannonRef.current.getWorldQuaternion(new THREE.Quaternion())

      // Create a direction vector pointing in the direction of the cannon barrel
      const direction = new THREE.Vector3(0, 0, -1); // 1 unit along the y-axis
      direction.applyQuaternion(cannonRotation);

      // Scale the direction by the magnitude of the force to be applied
      const force = direction.multiplyScalar(forceMagnitude);

      // Reset cannonball values
      cannonBallApi.position.set(cannonPosition.x, cannonPosition.y, cannonPosition.z)
      cannonBallApi.rotation.set(cannonRotation.x, cannonRotation.y, cannonRotation.z)
      cannonBallApi.velocity.set(0, 0, 0)

      // Apply the force at the center of the cannonball
      cannonBallApi.applyForce(force.toArray(), cannonBallRef.current.position.toArray());
    }
  }

  const resetWaterLevel = () => {
    setElapsed(0);
    if (oceanRef.current) {
      oceanRef.current.position.y = 0;
    }
  }

  const { camera } = useThree()
  camera.maxZoom = 0
  camera.minZoom = 0

  useEffect(() => {
    changeCamera("cannon")
    if (resetGame) {
      setResetGame(false)
    }
  }, [])

  useEffect(() => {
    changeCamera(selectedObject?.name)
  }, [selectedObject])

  useEffect(() => {
    if (cannonBallRef.current && cannonRef.current) {
      switchMass()
      let worldPos = new THREE.Vector3()
      cannonRef.current.getWorldPosition(worldPos)
      cannonBallApi.position.set(worldPos.x, worldPos.y, worldPos.z)
    }
    if (resetGame) {
      resetWaterLevel()
      setResetGame(false)
    }
    setFireFunction(() => fireCannon)
  }, [setFireFunction])

  useControls({
    cannonAngle: {
      value: 0.000, min: 0, max: (THREE.MathUtils.RAD2DEG * Math.PI / 2), step: 0.001,
      onChange: (value) => cannonRef.current.rotation.x = THREE.MathUtils.DEG2RAD * value,
      label: "Kanon hoek in graden"
    }
  })

  return (
    <>
      <group position={[0, 0, 0]}>
        <Center top>
          <CannonLevel ref={meshRef} />
          <Cannon position={[-2, 0, 0]} ref={cannonRef} setSelectedObject={setSelectedObject} />

          <WaterLevel position={[2, 0, 1.56]} />
          <WindowBlueprint setSelectedObject={setSelectedObject} selectedObject={selectedObject} />
          <PilarBlueprint setSelectedObject={setSelectedObject} selectedObject={selectedObject} />
          <Box name={"default"} ref={platformRef} args={[40.5, 0.1, 100.5]} position={[0, 3.4, 2]} visible={false} onPointerDown={(obj) => {
            obj.stopPropagation()
            setSelectedObject(obj.eventObject)
          }} />
          {/* <CannonBallHint /> */}

          {/* Cannonball display */}
          {
            Array(lives).fill().map((_, index) => (
              <CannonBall key={index} position={[-0.7 + index * 1, 3.8, 5]} />
            ))
          }
          <Target ref={targetRef} />
        </Center>

        <Sphere castShadow receiveShadow ref={cannonBallRef} args={[0.4, 64, 64]}>
          <meshStandardMaterial color="gray" metalness={0.9} roughness={0.4} />
        </Sphere>

        <AccumulativeShadows temporal frames={200} color="black" colorBlend={0.5} opacity={1} scale={10} alphaTest={0.85}>
          <RandomizedLight amount={8} radius={4} ambient={0.5} intensity={1} position={[5, 5, -10]} bias={0.001} />
        </AccumulativeShadows>
        {/* <Effects /> */}
        <spotLight intensity={0.8} angle={1} penumbra={0.2} position={[25, 25, 0]} castShadow />
        <Env />

        <Ground />
        <Ocean ref={oceanRef} />
        <ContactShadows position={[0, 0, 0]} opacity={0.25} scale={10} blur={1.5} far={0.8} />
        <CameraControls
          ref={cameraControlsRef}
          enabled={true}
          dollySpeed={0}
          truckSpeed={0}
        />
      </group >
    </>
  );
}

function Env() {
  const [preset, setPreset] = useState("sunset");
  const blur = 0.65

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

function Ground({ ref }) {
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
