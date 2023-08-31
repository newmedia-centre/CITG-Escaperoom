//Level02.jsx
import {
  AccumulativeShadows,
  RandomizedLight,
  Center,
  Environment,
  PerformanceMonitor,
  CameraControls,
  Grid,
  ContactShadows,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { EffectComposer, N8AO, SMAA } from "@react-three/postprocessing";
import React, { useEffect, useRef, useState, useTransition } from "react";
import { Model as CannonLevel } from "../public/models/gltfjsx/CannonLevel";
import { usePlane } from '@react-three/cannon'
import Ocean from "./Ocean";
import { Ring } from "../public/models/gltfjsx/Ring";

export default function Level01({ setSpeed, lives, setLives, setGameOver, gameOver, setGameWon, gameWon, setResetGame, resetGame }) {
  const meshRef = useRef()
  const cameraControlsRef = useRef()
  const oceanRef = useRef()

  var timer = 0

  const takeLive = () => {
    setLives(lives => lives - 1) // Updates lives using callback
  }

  const { camera } = useThree()
  camera.maxZoom = 0
  camera.minZoom = 0

  useEffect(() => {
    if (cameraControlsRef.current) {
      cameraControlsRef.current?.setLookAt(-2, 9, 40, -2, 9, 35, true)
    }
    if (resetGame) {
      setResetGame(false)
    }
  }, [])

  useFrame(({ clock }) => {
    timer += clock.getDelta()
    if (timer > 0.1) {
      setSpeed((Math.random() * 2))
      timer = 0
    }
  })

  return (
    <>
      <group position={[0, 0, 0]}>
        <Center top>
          <CannonLevel ref={meshRef} />
          <Ring position={[-2, 7, 5]} rotation={[0, Math.PI * 0.5, Math.PI * 0.5]} />
        </Center>

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
