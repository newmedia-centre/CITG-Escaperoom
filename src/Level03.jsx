//Level02.jsx
import {
  AccumulativeShadows,
  RandomizedLight,
  Center,
  Environment,
  PerformanceMonitor,
  CameraControls,
  ContactShadows
} from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { useControls } from "leva"
import { EffectComposer, N8AO, SMAA } from "@react-three/postprocessing"
import React, { useEffect, useMemo, useRef, forwardRef, useImperativeHandle, useState, useTransition } from "react"
import { Level03Model } from "../public/models/gltfjsx/Level03Model"
import { useSpring, animated, easings } from '@react-spring/three'
import PuzzlePiece from "./PuzzlePiece"

export const Level03 = forwardRef((props, ref) => {
  const { lives, setLives, setGameWon, gameWon, gameOver, setGameOver, setResetGame, resetGame } = props
  const [cameraFollowing, setCameraFollowing] = useState({})
  const [camControlsEnabled, setCamControls] = useState(true)
  const [selectedObject, setSelectedObject] = useState([])
  const cameraControlsRef = useRef()
  const tableRef = useRef()
  const { camera } = useThree()

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
        cameraControlsRef.current?.setLookAt(.2, 3, 0, 0, .1, 0, false)
        cameraControlsRef.current?.fitToBox(tableRef.current, false, {
          cover: true,
          paddingLeft: 2,
          paddingRight: 2,
          paddingBottom: 2,
          paddingTop: 2,
        })
        setTimeout(() => {
          setCamControls(false)
        }, 20) // Wait for camera to move in place
        break;
      case "ground":
        setCamControls(true)
        cameraControlsRef.current?.setLookAt(2, 2, 0, .2, 1, 0, false)
        break;
    }
  }

  const followModelPosition = () => {
    if (Object.keys(cameraFollowing) != 0 && cameraControlsRef.current) {
      var pos = cameraFollowing.current.children[0].getWorldPosition(new THREE.Vector3())
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

  useControls({
    // Switch camera list
    camera: {
      value: "default",
      options: ["default", "table"],
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
        <group name="Pieces" position={[0.193, 0.871, -0.505]}>
          <PuzzlePiece puzzleId={0} position={[0.221, 0.013, 0.217]} />
          <PuzzlePiece puzzleId={1} position={[-0.221, 0.013, 0.217]} />
          <PuzzlePiece puzzleId={2} position={[-0.221, 0.013, -0.217]} />
          <PuzzlePiece puzzleId={3} position={[0.221, 0.013, -0.217]} />
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

// Currently uses layer 1 to raycast
const useForwardRaycast = (obj) => {
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const pos = useMemo(() => new THREE.Vector3(), [])
  const dir = useMemo(() => new THREE.Vector3(), [])
  const scene = useThree((state) => state.scene)

  return () => {
    if (!obj.current) return []

    raycaster.set(obj.current.getWorldPosition(pos), obj.current.getWorldDirection(dir))
    return raycaster.intersectObjects(scene.children)
  }
}