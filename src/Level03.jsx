//Level02.jsx
import {
  AccumulativeShadows,
  RandomizedLight,
  Center,
  Environment,
  PerformanceMonitor,
  CameraControls,
  ContactShadows,
  Box,
  Svg,
  Text3D,
} from "@react-three/drei"
import { Physics, useBox } from "@react-three/cannon"
import { useFrame, useThree } from "@react-three/fiber"
import { Vector3 } from "three"
import { useControls } from "leva"
import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState, useTransition } from "react"
import { Level03Model } from "../public/models/gltfjsx/Level03Model"
import { useSpring, animated, easings } from '@react-spring/three'
import PuzzlePiece from "./PuzzlePiece"
import JSONPretty from 'react-json-pretty'

export const Level03 = forwardRef((props, ref) => {
  const { lives, setLives, setGameWon, gameWon, gameOver, setGameOver, setResetGame, resetGame } = props
  const [cameraFollowing, setCameraFollowing] = useState({})
  const [camControlsEnabled, setCamControls] = useState(true)
  const [selectedObject, setSelectedObject] = useState([])
  const [puzzleInPlace, setPuzzleInPlace] = useState(0)
  const [puzzleSolved, setPuzzleSolved] = useState(0)
  const { camera } = useThree()

  const cameraControlsRef = useRef()
  const tableRef = useRef()
  const puzzleSlotViewRef = useRef()


  const resetLevel = () => {
  }

  const takeLive = () => {
    setLives(lives => lives - 1) // Updates lives using callback
  }

  camera.maxZoom = 0
  camera.minZoom = 0

  const changeCamera = (scene) => {
    switch (scene) {
      case "table":
        if (puzzleInPlace == 4) return

        cameraControlsRef.current?.setLookAt(.2, 3, 0, 0, .1, 0, false)
        cameraControlsRef.current?.fitToBox(tableRef.current, false, {
          cover: true,
          paddingLeft: 1,
          paddingRight: 1,
          paddingBottom: 1,
          paddingTop: 1,
        })
        setTimeout(() => {
          setCamControls(false)
        }, 20) // Wait for camera to move in place
        break;
      case "ground":
        if (puzzleInPlace !== 4) {
          setCamControls(true)
          cameraControlsRef.current?.setLookAt(2, 2, 0, .2, 1, 0, false)
        }
        break;
      case "puzzleslot":
        setCamControls(true)
        cameraControlsRef.current?.setLookAt(.2, 3, 0, 0, .1, 0, false)
        cameraControlsRef.current?.fitToBox(puzzleSlotViewRef.current, false, {
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
  }))

  useEffect(() => {
    changeCamera("ground")
    if (resetGame) {
      setResetGame(false)
    }
  }, [])

  useEffect(() => {
    changeCamera(selectedObject?.name)
  }, [selectedObject])

  useEffect(() => {
    if (puzzleInPlace == 4) {
      changeCamera("puzzleslot")
    }
  }, [puzzleInPlace])

  useEffect(() => {
    if (puzzleSolved == 4) {
      setGameWon(true)
    }
  }, [puzzleSolved])

  useControls({
    // Switch camera list
    camera: {
      value: "default",
      options: ["default", "table", "puzzleslot"],
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
      <group position={[0, 0, 0]}>
        <Center top>
        </Center>

        <Level03Model ref={{ tableRef }}
          setSelectedObject={setSelectedObject}
        />
        <Center rotation={[0, Math.PI / 2, 0]} position={[0.7, 0.91, 0]} >
          <Text3D font="/Roboto_Regular.json" size={0.1} rotation={[-Math.PI / 3, 0, 0]} height={0.02} textAlign="center">
            <meshStandardMaterial color="#356e73" />
            Instantanious Center
          </Text3D>

        </Center>

        <Box ref={puzzleSlotViewRef} args={[1.5, .1, 1.5]} position={[0.2, 0.8, 0.5]} visible={false} />

        <Physics iterations={6}>
          <group name="Pieces" position={[0.193, 0.871, -0.505]}>
            <PuzzlePiece puzzleId={0} position={[0.221, 0.013, 0.217]} svg="/svg/puzzle01/" setPuzzleInPlace={() => setPuzzleInPlace(puzzleInPlace + 1)} setPuzzleSolved={() => setPuzzleSolved(puzzleSolved + 1)} solutionCoords={[-0.47, 0.6, -0.18]} />
            <PuzzlePiece puzzleId={1} position={[-0.221, 0.013, 0.217]} svg="/svg/puzzle02/" setPuzzleInPlace={() => setPuzzleInPlace(puzzleInPlace + 1)} setPuzzleSolved={() => setPuzzleSolved(puzzleSolved + 1)} solutionCoords={[-0.41, 0.6, 0.4]} />
            <PuzzlePiece puzzleId={2} position={[-0.221, 0.013, -0.217]} svg="/svg/puzzle03/" setPuzzleInPlace={() => setPuzzleInPlace(puzzleInPlace + 1)} setPuzzleSolved={() => setPuzzleSolved(puzzleSolved + 1)} solutionCoords={[-0.33, 0.6, -0.11]} />
            <PuzzlePiece puzzleId={3} position={[0.221, 0.013, -0.217]} svg="/svg/puzzle04/" setPuzzleInPlace={() => setPuzzleInPlace(puzzleInPlace + 1)} setPuzzleSolved={() => setPuzzleSolved(puzzleSolved + 1)} solutionCoords={[0.16, 0.6, -0.15]} />
            <PuzzleSlot puzzleId={0} position={[-0.221, 0.013, 1.217]} svg="/svg/puzzle01/" />
            <PuzzleSlot puzzleId={1} position={[-0.221, 0.013, 0.783]} svg="/svg/puzzle02/" />
            <PuzzleSlot puzzleId={2} position={[0.221, 0.013, 1.217]} svg="/svg/puzzle03/" />
            <PuzzleSlot puzzleId={3} position={[0.221, 0.013, 0.783]} svg="/svg/puzzle04/" />
          </group>

        </Physics>

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
      </group >
    </>
  )
})

export default Level03

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

function PuzzleSlot({ position, puzzleId, svg }) {
  const size = [0.35, 0.2, 0.35]
  const index = 0

  const [hint, setHint] = useState(0)

  const svgHint = useRef()

  const [physicsRef, api] = useBox(() => ({
    args: size,
    position: position,
    type: 'Static',
  }))

  useEffect(() => {
    switch (hint) {
      case 0:
        // svgHint.current.visible = true
        break;
    }
  }, [hint])

  return (
    <>
      <Box args={size} position={position} ref={physicsRef} name={puzzleId} userData={{ index }}>
        <meshBasicMaterial visible={false} />
        <Svg
          name='puzzle'
          scale={0.00074}
          src={svg + "Puzzle.svg"}
          position={[-size[0] / 2, 0, size[2] / 2]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        />
        <Svg
          ref={svgHint}
          visible={false}
          name='hint'
          scale={0.00074}
          src={svg + "Hint.svg"}
          position={[-size[0] / 2, 0, size[2] / 2]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        />
      </Box>

    </>
  )
}