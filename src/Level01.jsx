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
import React, { useEffect, useRef, useState, useMemo } from "react";
import { Level01Model } from "../public/models/gltfjsx/Level01Model";
import { Cannon } from "../public/models/gltfjsx/Cannon";
import { Target } from "../public/models/gltfjsx/Target";
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
    args: [0.2],
    position: [0, 20, 0],
    mass: 1,
    onCollide: (e) => handleCollision(e, "cannonBall")
  }))
  const [targetRef] = useBox(() => ({
    args: [0.15, 0.15, 0.15],
    position: [-2.3, 2, 2.75],
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

  const cannonAngleSolutionRange = [22, 26]

  const changeCamera = (scene) => {
    switch (scene) {
      case "cannon":
        setCameraFocus(scene)
        cameraControlsRef.current?.setLookAt(2, 9, 10.8, -2, 7, 10.8, true)
        break;
      case "blueprint":
        setCameraFocus(scene)
        cameraControlsRef.current?.setLookAt(6, 9, 11.0, 7, 9, 11.0, true)
        break;
      default:
        setCameraFocus('default')
        cameraControlsRef.current?.setLookAt(-2.3, 9, 18, -2.3, 7, 10, true)
    }
  }

  const [elapsed, setElapsed] = useState(0) // time elapsed

  const waterLevel = 2.3

  if (oceanRef.current) {
    oceanRef.current.position.y = waterLevel
  }

  // const { cannonAngle } = useControls({
  //   cannonAngle: {
  //     value: 0.000, min: 0, max: (THREE.MathUtils.RAD2DEG * Math.PI / 2), step: 0.001,
  //     label: "Kanon hoek in graden"
  //   }
  // })
  const cannonAngle = 25
  
  useEffect(() => {
    if (cannonRef.current) {
      cannonRef.current.rotation.x = THREE.MathUtils.DEG2RAD * cannonAngle
    }

  }, [cannonAngle])

  useEffect(() => {
    if (cannonRef.current) {
      resetCannonBall()
    }
  }, [cannonRef.current])

  function CannonBall({ position }) {
    return (
      <Sphere position={position} castShadow receiveShadow args={[0.2, 64, 64]}>
        <meshStandardMaterial color="gray" metalness={0.9} roughness={0.4} />
      </Sphere>
    )
  }

  const resetCannonBall = () => {
    // Reset cannonball
    if (cannonRef.current == null) return

    const cannonPosition = cannonRef.current.getWorldPosition(new THREE.Vector3())
    const cannonRotation = cannonRef.current.getWorldQuaternion(new THREE.Quaternion())
    cannonBallApi.position.set(cannonPosition.x, cannonPosition.y, cannonPosition.z)
    cannonBallApi.rotation.set(cannonRotation.x, cannonRotation.y, cannonRotation.z)
    cannonBallApi.velocity.set(0, 0, 0)
    cannonBallApi.angularVelocity.set(0, 0, 0)
    cannonBallApi.mass.set(0)
  }

  const takeLive = () => {
    setLives(lives => lives - 1) // Updates lives using callback
  }

  const handleCollision = (event, name) => {
    if (name === "cannonBall" && !gameOver && !gameWon) {
      if (event.body.uuid === targetRef.current.uuid) {
        // console.log("The target was hit first!")
        // setGameWon(true)
      } else if (event.body.uuid === groundRef.current.uuid) {
        // console.log("The ground was hit first!")
        // takeLive()
      }
      resetCannonBall()
    }
  }

  // Cannon speed is 7.5 m/s
  const fireFunction = () => {
    resetCannonBall()

    if (resetGame) {
      resetWaterLevel()
      setResetGame(false)
    }
    if (cannonRef.current && cannonBallRef.current) {

      let forceMagnitude = 7.5
      cannonBallApi.mass.set(0.0165)

      // Create a direction vector pointing in the direction of the cannon barrel
      const direction = new THREE.Vector3(0, 0, -1) // 1 unit along the z-axis


      // Offset the force magnitude if the angle solution is not within the error margin of the cannon angle
      // Check if the value is in between the solution range array
      if (cannonAngle > cannonAngleSolutionRange[1]) {
        forceMagnitude = forceMagnitude * 1.2
      }
      else if (cannonAngle < cannonAngleSolutionRange[0]) {
        forceMagnitude = forceMagnitude * 0.8
      }

      // Calculate force vector
      const force = direction.multiplyScalar(forceMagnitude);

      // Apply directional force
      cannonBallApi.applyLocalForce(force.toArray(), [0, 0, 0])

    }
  }

  useMemo(() => {
    setFireFunction(() => fireFunction)
  }, [setFireFunction, cannonAngle, resetGame])


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

  return (
    <>
      <group position={[0, 0, 0]}>
        <Center top>
          <Level01Model ref={meshRef} />
          <Cannon position={[-2, 0.98, 0]} ref={cannonRef} setSelectedObject={setSelectedObject} />

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
              <CannonBall key={index} position={[-0.7 + index * 1, 4.77, 5]} />
            ))
          }
          <Target ref={targetRef} />
        </Center>

        <Sphere castShadow receiveShadow ref={cannonBallRef} args={[0.2, 64, 64]}>
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
    cellThickness: 0.34,
    cellColor: 'black',
    sectionSize: 3,
    sectionThickness: 1,
    sectionColor: 'gray',
    fadeDistance: 39,
    fadeStrength: 1,
    followCamera: false,
    infiniteGrid: true
  }
  return (
    <>
      <Grid ref={ref} position={[0, 2.1, 0]} args={[10.5, 10.5]} {...gridConfig} />
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
