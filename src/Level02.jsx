//Level02.jsx
import {
  AccumulativeShadows,
  RandomizedLight,
  Center,
  Environment,
  PerformanceMonitor,
  CameraControls,
  ContactShadows,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useControls } from "leva";
import { EffectComposer, N8AO, SMAA } from "@react-three/postprocessing";
import React, { useEffect, useRef, useState, useTransition } from "react";
import { usePlane } from '@react-three/cannon'
import { Level02Model } from "../public/models/gltfjsx/Level02Model";

export default function Level01({ setSpeed, lives, setLives, setGameOver, gameOver, setGameWon, gameWon, setResetGame, resetGame }) {
  const weightRef = useRef()
  const cameraControlsRef = useRef()

  const [cameraFollowing, setCameraFollowing] = useState(false)

  var timer = 0

  const takeLive = () => {
    setLives(lives => lives - 1) // Updates lives using callback
  }

  const { camera } = useThree()
  camera.maxZoom = 0
  camera.minZoom = 0

  const changeCamera = (scene) => {
    switch (scene) {
      case "cabinet":
        cameraControlsRef.current?.setLookAt(-1.5, 1.6, 0.45, -2, 1.2, 0.45, true)
        break;
      case "door":
        cameraControlsRef.current?.setLookAt(0, 2, -5, -4, 0, 0, true)
        break;
      case "bench":
        cameraControlsRef.current?.setLookAt(5, 3, 0, 0, 0, 0, true)
        break;
      case "weight":
        cameraControlsRef.current?.fitToBox(weightRef.current?.children[0], true, { cover: false, paddingLeft: 0.5, paddingRight: 0.5, paddingBottom: 0.5, paddingTop: 0.5 })
        setCameraFollowing(true)
        break;
    }
  }

  const { weightHeight } = useControls({
    weightHeight: {
      value: 0.7,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (value) => setWeightHeight(value),
    },
  })

  const setWeightHeight = (height) => {
    if (weightRef.current) {
      weightRef.current.position.y = height
    }
  }

  const followModelPosition = () => {
    if (cameraFollowing && cameraControlsRef.current && weightRef.current) {
      var pos = weightRef.current.children[0].getWorldPosition(new THREE.Vector3())
      var offset = weightRef.current.children[0].position
      cameraControlsRef.current?.moveTo(pos.x, pos.y, offset.z, pos.x, pos.y, offset.z, true)
    }
  }

  useEffect(() => {
    if (cameraControlsRef.current) {
      cameraControlsRef.current?.setLookAt(50, 50, -10, 0, 0, 0, false)
      cameraControlsRef.current?.setLookAt(10, 5, 0, 0, 0, 0, true)
      changeCamera("bench")
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

    followModelPosition()
  })

  return (
    <>
      <group position={[0, 0, 0]}>
        <Center top>
        </Center>
        <Level02Model ref={weightRef} />

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
  const { weightHeight } = useControls({
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
        blur={0.7}
      >
      </Environment>
    </>
  )
}

function Effects() {
  const { ambinentOcclusion, smaa } = useControls({
    ambinentOcclusion: { value: true },
    smaa: { value: true },
  })

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
