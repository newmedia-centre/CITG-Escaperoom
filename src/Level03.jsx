//Level03.jsx
import {
  AccumulativeShadows,
  RandomizedLight,
  Center,
  Environment,
  PerformanceMonitor,
  CameraControls,
  ContactShadows,
  Box,
  useVideoTexture,
  Text3D,
  Text,
  Plane,
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
  const [puzzles, setPuzzle] = useState({ puzzleInPlace: 0, puzzleId: -1, showPuzzle: -1, showVector: -1 })
  const [puzzleSolved, setPuzzleSolved] = useState(0)
  const [solutionEntered, setSolutionEntered] = useState(0)
  const { camera } = useThree()

  const cameraControlsRef = useRef()
  const tableRef = useRef()
  const puzzleSlotViewRef = useRef()
  const puzzle00Ref = useRef()
  const puzzle01Ref = useRef()
  const puzzle02Ref = useRef()
  const puzzle03Ref = useRef()

  const resetLevel = () => {
    setSolutionEntered(0)
    setPuzzleSolved(0)
    Object.keys(puzzles.showPuzzle).forEach(key => {
      puzzles.showPuzzle[key] = false
      puzzles.showVector[key] = false
      puzzles.puzzleInPlace = 0
      puzzles.puzzleId = -1
    })
    changeCamera("ground")
    puzzle00Ref?.current.resetLevel()
    puzzle01Ref?.current.resetLevel()
    puzzle02Ref?.current.resetLevel()
    puzzle03Ref?.current.resetLevel()
  }

  const takeLive = () => {
    setLives(lives => lives - 1) // Updates lives using callback
  }

  camera.maxZoom = 0
  camera.minZoom = 0

  const changeCamera = (scene) => {
    switch (scene) {
      case "puzzleslots":
        setCamControls(true)
        cameraControlsRef.current?.setLookAt(.2, 3, 0, 0, .1, 0, false)
        cameraControlsRef.current?.fitToBox(puzzleSlotViewRef.current, false, {
          cover: true,
        })
        setTimeout(() => {
          setCamControls(false)
        }, 20) // Wait for camera to move in place
        break;

      case "ground":
        if (puzzles?.puzzleInPlace !== 4) {
          setCamControls(true)
          cameraControlsRef.current?.setLookAt(2, 2, 0, .2, 1, 0, false)
        }
        break;
      case "puzzletable":
        setCamControls(true)
        cameraControlsRef.current?.setLookAt(.2, 3, 0, 0, .1, 0, false)
        cameraControlsRef.current?.fitToBox(tableRef.current, false, {
          cover: true,
        })
        setTimeout(() => {
          setCamControls(false)
        }, 20) // Wait for camera to move in place
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
  }, [])

  useEffect(() => {
    if (selectedObject?.name) {
      changeCamera(selectedObject.name)
    }
  }, [selectedObject])

  useEffect(() => {
    changeCamera("puzzletable")

    if (solutionEntered === 4 && puzzleSolved === 4) {
      setGameWon(true)
    }
    else if (solutionEntered === 4) {
      takeLive()

      const fn = (e) => {
        resetLevel()
      }

      window.addEventListener('click', fn)
      return () => window.removeEventListener('click', fn)
    }
  }, [solutionEntered, puzzleSolved])

  useEffect(() => {
    setPuzzle(prev => {
      const newShowVector = {}
      Object.keys(prev.showVector).forEach(key => {
        newShowVector[key] = false
      })
      newShowVector[prev.puzzleId] = true
      return {
        ...prev,
        showPuzzle: { ...prev.showPuzzle, [prev.puzzleId]: true },
        showVector: newShowVector
      }
    });

    // Only change camera when new puzzle is selected
    if (puzzles.puzzleId !== -1) {
      changeCamera("puzzleslots")
    }

  }, [puzzles.puzzleId])

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
            Ogenblikkelijk Rotatiecentrum
          </Text3D>

        </Center>
        <Box ref={puzzleSlotViewRef} args={[2, 2, 2]} position={[0, 0, 0.5]} visible={false} />
        <Box ref={tableRef} args={[3.5, 3.5, 3.5]} position={[0, 0, 0]} visible={false} />

        <group name="Pieces" position={[0.193, 0.871, -0.505]}>
          <PuzzlePiece ref={puzzle00Ref} puzzleId={0} position={[0.221, 0.013, 0.217]} video="videos/Puzzle_0"
            setPuzzle={() => setPuzzle(prev => ({
              ...prev,
              puzzleInPlace: puzzles.puzzleInPlace + 1,
              puzzleId: 0
            }))}
            puzzle={puzzles}
            setPuzzleSolved={() => setPuzzleSolved(puzzleSolved + 1)}
            setSolutionEntered={() => setSolutionEntered(solutionEntered + 1)} solutionCoords={[0.22, 0, -0.25]} />
          <PuzzlePiece ref={puzzle01Ref} puzzleId={1} position={[-0.221, 0.013, 0.217]} video="videos/Puzzle_1"
            setPuzzle={() => setPuzzle(prev => ({
              ...prev,
              puzzleInPlace: puzzles.puzzleInPlace + 1,
              puzzleId: 1
            }))}
            puzzle={puzzles}
            setPuzzleSolved={() => setPuzzleSolved(puzzleSolved + 1)}
            setSolutionEntered={() => setSolutionEntered(solutionEntered + 1)} solutionCoords={[0.40, 0, -0.4]} />
          <PuzzlePiece ref={puzzle02Ref} puzzleId={2} position={[-0.221, 0.013, -0.217]} video="videos/Puzzle_2"
            setPuzzle={() => setPuzzle(prev => ({
              ...prev,
              puzzleInPlace: puzzles.puzzleInPlace + 1,
              puzzleId: 2
            }))}
            puzzle={puzzles}
            setPuzzleSolved={() => setPuzzleSolved(puzzleSolved + 1)}
            setSolutionEntered={() => setSolutionEntered(solutionEntered + 1)} solutionCoords={[-0.33, 0, -0.39]} />
          <PuzzlePiece ref={puzzle03Ref} puzzleId={3} position={[0.221, 0.013, -0.217]} video="videos/Puzzle_3"
            setPuzzle={() => setPuzzle(prev => ({
              ...prev,
              puzzleInPlace: puzzles.puzzleInPlace + 1,
              puzzleId: 3
            }))}
            puzzle={puzzles}
            setPuzzleSolved={() => setPuzzleSolved(puzzleSolved + 1)}
            setSolutionEntered={() => setSolutionEntered(solutionEntered + 1)} solutionCoords={[0.265, 0, 0.12]} />
          <PuzzleSlot puzzleId={0} position={[-0.221, 0.013, 1.217]} video="videos/Puzzle_0" />
          <PuzzleSlot puzzleId={1} position={[-0.221, 0.013, 0.783]} video="videos/Puzzle_1" />
          <PuzzleSlot puzzleId={2} position={[0.221, 0.013, 1.217]} video="videos/Puzzle_2" />
          <PuzzleSlot puzzleId={3} position={[0.221, 0.013, 0.783]} video="videos/Puzzle_3" />
        </group>


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

function PuzzleSlot({ position, puzzleId, video, showPuzzle }) {
  const size3D = [0.35, 0.2, 0.35]
  const size2D = [0.35, 0.35]
  const index = 0

  var puzzleTexture = useVideoTexture(video + ".mp4")

  const [hint, setHint] = useState(0)

  const svgHint = useRef()
  const svgPuzzle = useRef()

  const [physicsRef, api] = useBox(() => ({
    args: size3D,
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
      <Box args={size3D} position={position} ref={physicsRef} name={puzzleId} userData={{ index }}>
        <meshBasicMaterial visible={false} />
        <Text anchorX={"center"} anchorY={"middle"} color={"black"} fontSize={0.05} position={[0.16, 0.01, 0.16]} rotation={[-Math.PI / 2, 0, 0]} visible={!showPuzzle}>
          {puzzleId}
        </Text>
        <Plane args={size2D} visible={false} rotation={[-Math.PI / 2, 0, 0]}>
          <meshStandardMaterial map={puzzleTexture} />
        </Plane>
      </Box>

    </>
  )
}