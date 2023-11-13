//Level04.jsx
import {
  AccumulativeShadows,
  RandomizedLight,
  Center,
  Environment,
  PerformanceMonitor,
  CameraControls,
  ContactShadows,
  Text3D,
} from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { Vector3 } from "three"
import { useControls } from "leva"
import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState, useTransition } from "react"
import { Level04Model } from "../public/models/gltfjsx/Level04Model"
import { useSpring, animated, easings } from '@react-spring/three'
import JSONPretty from 'react-json-pretty'

export const Level04 = forwardRef((props, ref) => {
  const { lives, setLives, setGameWon, setGameOver, setResetGame, resetGame } = props
  const [cameraFollowing, setCameraFollowing] = useState({})
  const [camControlsEnabled, setCamControls] = useState(true)
  const [selectedObject, setSelectedObject] = useState([])
  const [animation, setAnimation] = useState()
  const { camera } = useThree()

  const cameraControlsRef = useRef()
  const boatRef = useRef()
  const materialsRef = useRef()

  const resetLevel = () => {
  }

  const takeLive = () => {
    setLives(lives => lives - 1) // Updates lives using callback
  }

  camera.maxZoom = 0
  camera.minZoom = 0

  const changeCamera = (scene) => {
    switch (scene) {
      case "default":
        setCamControls(true)
        cameraControlsRef.current?.setLookAt(100, 30, 0, 0, .1, 0, true)
        break;
      case "materials":
        setCamControls(true)
        // Fit the camera to the materials

        cameraControlsRef.current?.setLookAt(100, 30, 0, 0, .1, 0, false)
        cameraControlsRef.current?.fitToBox(materialsRef.current, true, {
          cover: true
        })
        // Get position of the materials
        var dir = materialsRef.current?.getWorldPosition(new Vector3())
        cameraControlsRef.current?.setTarget(dir.x, dir.y - 0.2, dir.z - 0.2, true)

        break;
      case "boat":
        setCamControls(true)
        cameraControlsRef.current?.setLookAt(.2, 3, 0, 0, .1, 0, false)
        cameraControlsRef.current?.fitToBox(boatRef.current, false, {
          cover: true,
        })
        setTimeout(() => {
          setCamControls(false)
        }, 20)
        break;
    }
  }

  const followModelPosition = () => {
    if (Object.keys(cameraFollowing) != 0 && cameraControlsRef.current) {
      var pos = cameraFollowing.current.children[0].getWorldPosition(new Vector3())
      var offset = cameraFollowing.current.children[0].position
      cameraControlsRef.current.moveTo(pos.x, pos.y, offset.z, pos.x, pos.y, offset.z, true)
    }
  }

  useImperativeHandle(ref, () => ({
    resetLevel: () => resetLevel(),
    changeCamera: (scene) => changeCamera(scene),
    setCameraFollowing: (object) => setCameraFollowing(object),
    play: () => {
      switch (selectedObject?.name) {
        case "Wood":
          setAnimation("Correct")
          break;
        case "Ice":
          setAnimation("TooFar")
          break;
        case "Sand":
          setAnimation("TooFar")
          break;
        case "Concrete":
          setAnimation("TooNear")
          break;
      }
    }
  }))

  useEffect(() => {
    changeCamera(selectedObject?.name)
  }, [selectedObject])

  useControls({
    // Switch camera list
    camera: {
      value: "materials",
      options: ["default", "materials", "boot"],
      onChange: (value) => {
        changeCamera(value)
      },
    },
  })

  useFrame(({ clock }) => {
    // Updates the camera position to follow the model
    followModelPosition()
  })

  useEffect(() => {
    if (lives < 1) {
      setGameOver(true)
    }
  }, [lives])

  return (
    <>
      <Center left>
        <Level04Model ref={{ materialsRef, boatRef }}
          animation={animation}
          setAnimation={setAnimation}
          setSelectedObject={setSelectedObject}
          selectedObject={selectedObject}
          setGameWon={setGameWon}
          setGameOver={setGameOver}
        />
      </Center>

      <AccumulativeShadows temporal frames={200} color="black" colorBlend={0.5} opacity={1} scale={10} alphaTest={0.85}>
        <RandomizedLight amount={8} radius={4} ambient={0.5} intensity={1} position={[5, 5, -10]} bias={0.001} />
      </AccumulativeShadows>
      {/* <Effects /> */}
      <spotLight intensity={0.8} angle={1} penumbra={0.2} position={[25, 25, 0]} castShadow />
      <Env />
      <ContactShadows position={[0, 0, 0]} opacity={0.25} scale={10} blur={1.5} far={0.8} />
      <CameraControls
        ref={cameraControlsRef}
        enabled={camControlsEnabled}
        dollySpeed={0}
        truckSpeed={0}
      />
    </>
  )
})

export default Level04

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