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
import { Level02Model } from "../public/models/gltfjsx/Level02Model"
import { useSpring, animated } from '@react-spring/three'

export default function Level01({ setSpeed, lives, setLives, setGameOver, gameOver, setGameWon, gameWon, setResetGame, resetGame }) {
  const weightRef = useRef()
  const cameraControlsRef = useRef()

  const { camera } = useThree()

  const [cameraFollowing, setCameraFollowing] = useState(false)

  const [progress, setProgress] = useSpring(() => ({
    progress: 0,
    config: {
      mass: 30,
      friction: 130,
      tension: 120,
      // velocity: 4,
    },
  }))

  // Function to trigger the animation with a new 'to' value
  const playAnimation = (newValue) => {
    setProgress({
      progress: newValue,
    })
  }

  var timer = 0

  const takeLive = () => {
    setLives(lives => lives - 1) // Updates lives using callback
  }

  camera.maxZoom = 0
  camera.minZoom = 0

  const changeCamera = (scene) => {
    switch (scene) {
      case "cabinet":
        setCameraFollowing(false)
        cameraControlsRef.current?.setLookAt(0.2, 1.6, 1.209, -2, 1, 1.209, true)
        break;
      case "door":
        setCameraFollowing(false)
        cameraControlsRef.current?.setLookAt(2, 2, 1, -1, 1, -0.5, true)
        break;
      case "bench":
        setCameraFollowing(false)
        cameraControlsRef.current?.setLookAt(5, 3, 0, 0, 0, 0, true)
        break;
      case "weight":
        setCameraFollowing(true)
        cameraControlsRef.current?.fitToBox(weightRef.current?.children[0], true, { cover: false, paddingLeft: 0.5, paddingRight: 0.5, paddingBottom: 0.5, paddingTop: 0.5 })
        break;
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

  useControls({
    progressValue: {
      value: 0,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (value) => {
        playAnimation(value)
      },
    },
    // Switch camera list
    camera: {
      value: "bench",
      options: ["cabinet", "door", "bench", "weight"],
      onChange: (value) => {
        changeCamera(value)
      },
    },
  })

  useFrame(({ clock }) => {
    timer += clock.getDelta()
    if (timer > 0.1) {
      // setSpeed((Math.random() * 2))
      timer = 0
    }

    followModelPosition()
  })

  return (
    <>
      <group position={[0, 0, 0]}>
        <Center top>
        </Center>
        <animated.group ref={{
          weightRef: weightRef,
        }}
          progress={progress.progress}
        >
          <Level02Model ref={{
            weightRef: weightRef
          }}
            progress={progress.progress}
          />
        </animated.group>

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
  )
}
