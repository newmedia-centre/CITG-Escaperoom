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
import Ocean from "./Ocean"
import Level01Formulas from "./level01-formulas.js";

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
  const [targetRef, targetApi] = useBox(() => ({
    args: [0.7, 0.7, 0.7],
    position: [-2.3, 7, 2],
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

  // Formula for the cannon velocity calculation
  // Sqrt( ( 9.81 * x^2) / ( (x * tan(25) + height_canon - height_water) * 2 * (cos(25))^2 ) )

  // Get a random id from level01-formulas.js
  const [randomId, setRandomId] = useState(Math.floor(Math.random() * Level01Formulas.formulaData.length));
  const x = Level01Formulas.formulaData[randomId].x // Distance to the target
  const heightCannon = Level01Formulas.formulaData[randomId].heightCannon // Height of the cannon
  const heightWater = Level01Formulas.formulaData[randomId].heightWater // Height of the water
  const forceMagnitudeVisual = Level01Formulas.formulaData[randomId].forceMagnitudeVisual // Visual hint for the cannon velocity

  const cannonVelocitySolutionAnswer = Math.sqrt((9.81 * x ** 2) / ((x * Math.tan(25 * Math.PI / 180) + heightCannon - heightWater) * 2 * (Math.cos(25 * Math.PI / 180)) ** 2))

  // Calculate fractions of x to be used for the width of the window and pilar, where the sum of the two is equal to x
  const fractionWindowHint = x / 10 * 7.4
  const fractionPilarHint = x / 10 * 2.6

  // sbayo margin for the cannon velocity for the solution
  const cannonVelocityErrorMargin = 0.2
  // Calculate an error margin for the cannon angle
  const cannonVelocitySolutionRange = [cannonVelocitySolutionAnswer - cannonVelocityErrorMargin, cannonVelocitySolutionAnswer + cannonVelocityErrorMargin]


  const cannonAngle = 25

  const changeCamera = (scene) => {
    switch (scene) {
      case "cannon":
        setCameraFocus(scene)
        cameraControlsRef.current?.setLookAt(2.3, heightCannon + 3, 4.8, -2.3, heightCannon + 1, 4.8, true)
        break;
      case "blueprint":
        setCameraFocus(scene)
        cameraControlsRef.current?.setLookAt(6, 7.8, 4.9, 7, 7.8, 4.9, true)
        break;
      default:
        setCameraFocus('default')
        cameraControlsRef.current?.setLookAt(-2.3, heightCannon + 5, 13, -2.3, heightCannon + 2, 4, true)
    }
  }

  const [elapsed, setElapsed] = useState(0) // time elapsed

  const waterLevel = (heightWater)
  targetApi.position.set(-2.3, waterLevel, -4.2)

  if (oceanRef.current) {
    oceanRef.current.position.y = waterLevel
  }

  const { cannonVelocity } = useControls({
    cannonVelocity: {
      value: 0.00, min: 0, max: 20, step: 0.01,
      label: "Snelheid in m/s"
    }
  })


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
        setGameWon(true)
      } else if (event.body.uuid === groundRef.current.uuid) {
        // console.log("The ground was hit first!")
        takeLive()
      }
      resetCannonBall()
    }
  }

  const fireFunction = () => {
    resetCannonBall()

    if (resetGame) {
      resetWaterLevel()
      setResetGame(false)
    }
    if (cannonRef.current && cannonBallRef.current) {
      let forceMagnitude = forceMagnitudeVisual
      cannonBallApi.mass.set(0.015)

      // Create a direction vector pointing in the direction of the cannon barrel
      const direction = new THREE.Vector3(0, 0, -1) // 1 unit along the z-axis


      // Offset the force magnitude if the angle solution is not within the error margin of the cannon angle
      // Check if the value is in between the solution range array
      if (cannonVelocity > cannonVelocitySolutionRange[1]) {
        forceMagnitude = forceMagnitude * 1.2
      }
      else if (cannonVelocity < cannonVelocitySolutionRange[0]) {
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
  }, [setFireFunction, cannonVelocity, resetGame])


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
        <Level01Model ref={meshRef} platformHeight={heightCannon} />
        <Cannon position={[-2, heightCannon, 0]} ref={cannonRef} setSelectedObject={setSelectedObject} />

        <WaterLevel position={[2, 0, 1.56]} />
        <WindowBlueprint setSelectedObject={setSelectedObject} yText={fractionWindowHint} xText={fractionWindowHint} />
        <PilarBlueprint setSelectedObject={setSelectedObject} yText={15} xText={fractionPilarHint} />
        <Box name={"default"} ref={platformRef} args={[40.5, 0.1, 100.5]} position={[0, 3.4, 2]} visible={false} onPointerDown={(obj) => {
          obj.stopPropagation()
          setSelectedObject(obj.eventObject)
        }} />
        {/* <CannonBallHint /> */}

        {/* Cannonball display */}
        {
          Array(lives).fill().map((_, index) => (
            <CannonBall key={index} position={[-0.7 + index * 1, heightCannon + 0.2, 5]} />
          ))
        }

        <Ground waterLevel={waterLevel} />
        <Ocean ref={oceanRef} />

        <group position={[0, -4, 0]}>
          <Target ref={targetRef} />
        </group>

        <Sphere castShadow receiveShadow ref={cannonBallRef} args={[0.2, 64, 64]}>
          <meshStandardMaterial color="gray" metalness={0.9} roughness={0.4} />
        </Sphere>

        <AccumulativeShadows temporal frames={200} color="black" colorBlend={0.5} opacity={1} scale={10} alphaTest={0.85}>
          <RandomizedLight amount={8} radius={4} ambient={0.5} intensity={1} position={[5, 5, -10]} bias={0.001} />
        </AccumulativeShadows>
        {/* <Effects /> */}
        <spotLight intensity={0.8} angle={1} penumbra={0.2} position={[25, 25, 0]} castShadow />
        <Env />


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

function Ground({ ...props }) {
  const { waterLevel } = props
  const gridConfig = {
    cellSize: 0.3,
    cellThickness: 0.5,
    cellColor: 'black',
    sectionSize: 3,
    sectionThickness: 1.6,
    sectionColor: 'gray',
    fadeDistance: 29,
    fadeStrength: 0.7,
    followCamera: false,
    infiniteGrid: true,
  }
  return (
    <group>
      <Grid position={[0.75, waterLevel + 0.1, -4.14]} args={[10, 10]} {...gridConfig} />
    </group>)
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
