//Level02.jsx
import {
  AccumulativeShadows,
  RandomizedLight,
  Center,
  Environment,
  PerformanceMonitor,
  CameraControls,
  ContactShadows,
} from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { useControls } from "leva"
import { EffectComposer, N8AO, SMAA } from "@react-three/postprocessing"
import React, { useEffect, useMemo, useRef, forwardRef, useImperativeHandle, useState, useTransition } from "react"
import { Level02Model } from "../public/models/gltfjsx/Level02Model"
import { useSpring, animated, easings } from '@react-spring/three'
import { WeightRack } from "./WeightRack"
import level02Solutions from "./level02-solutions"

export const Level02 = forwardRef((props, ref) => {
  const { speed: acceleration, setSpeed: setAcceleration, lives, setLives, setGameOver, setGameWon } = props
  const weightRef = useRef()
  const cabinetRef = useRef()
  const cameraControlsRef = useRef()
  const laserRef = useRef()
  const solutionRef = useRef()
  const [weightRingIndex, setWeightRingIndex] = useState(0)
  const [weightSphereIndex, setWeightSphereIndex] = useState(0)
  const [weightCylinderIndex, setWeightCylinderIndex] = useState(0)
  const { camera } = useThree()
  const [cameraFollowing, setCameraFollowing] = useState({})
  const [weightHit, setWeightHit] = useState(false)
  const [selectedObject, setSelectedObject] = useState([])
  const [selectedSolution, setSelectedSolution] = useState()
  const [progress, setProgress] = useSpring(() => ({
    progress: 0,
    reset: true,
    config: {
      duration: 8500,
      easing: easings.easeOutQuart,
    },
    onRest: () => {
      if (progress.progress.get() === 1) {
        resetLevel()
      }
    }
  }))
  const [cameraPosition, setCameraPosition] = useSpring(() => ({
    lerp: 0,
    reset: true,
    config: {
      duration: 3000,
      easing: easings.easeInOutCubic
    },
    onChange: ({ value }) => {
      var w = weightRef.current?.children[0].getWorldPosition(new THREE.Vector3())
      var s = solutionRef.current?.getWorldPosition(new THREE.Vector3())
      cameraControlsRef.current?.lerpLookAt(
        s.x + 4, s.y, s.z, // Position A
        s.x, s.y, s.z, // Target A
        w.x + 2, w.y, w.z - 1, // Position B
        w.x, w.y - 0.5, w.z, // Target B
        value.lerp, // Lerp value
      )
    }
  }))

  const resetLevel = () => {
    changeCamera("bench")
    setProgress({
      progress: 0,
    })
    progress.progress.set(0)
    setWeightHit(false)
    setCameraPosition({
      lerp: 0,
    })

  }

  const activatePulley = () => {
    setProgress({
      progress: 1,
    })
    updateAcceleration()
    setCameraPosition({
      lerp: 1,
    })
  }

  // Function to trigger the animation with a new 'to' value
  const updateAcceleration = () => {
    // Set the acceleration based on the selected solution and weight
    switch (selectedSolution) {
      case "sphere":
        setAcceleration(level02Solutions.solutions.sphere[weightSphereIndex].acceleration)
        break;
      case "cylinder":
        setAcceleration(level02Solutions.solutions.cylinder[weightCylinderIndex].acceleration)
        break;
      case "ring":
        setAcceleration(level02Solutions.solutions.ring[weightRingIndex].acceleration)
        break;
    }
  }

  var timer = 0

  const takeLive = () => {
    setLives(lives => lives - 1) // Updates lives using callback
  }

  const laserRaycast = useForwardRaycast(laserRef)

  camera.maxZoom = 0
  camera.minZoom = 0

  const changeCamera = (scene) => {
    switch (scene) {
      case "cabinet":
        setCameraFollowing({})
        cameraControlsRef.current?.setLookAt(1.2, 1.6, 1.209, -2, 1.2, 1.209, true)
        break;
      case "door":
        setCameraFollowing({})
        cameraControlsRef.current?.setLookAt(2, 2, 1, -1, 1, -0.5, true)
        break;
      case "bench":
        setCameraFollowing({})
        cameraControlsRef.current?.setLookAt(16, 9, 3, 0, 0, 0, true)
        break;
      case "weight":
        cameraControlsRef.current?.fitToBox(weightRef.current?.children[0], true, { cover: false, paddingLeft: 0.5, paddingRight: 0.5, paddingBottom: 0.5, paddingTop: 0.5 })
        setCameraFollowing(weightRef)
        break;
      case "solution":
        setCameraFollowing({})
        cameraControlsRef.current?.fitToBox(solutionRef.current, true, { cover: false, paddingLeft: 0.5, paddingRight: 0.5, paddingBottom: 0.5, paddingTop: 0.5 })
        cameraControlsRef.current?.elevate(0.18, true)
        break;
      default:
        setCameraFollowing({})
        cameraControlsRef.current?.setLookAt(16, 9, 3, 0, 0, 0, true)
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
    activatePulley: () => activatePulley(),
  }))

  useEffect(() => {
    changeCamera(selectedObject?.name)
  }, [selectedObject])

  useControls({
    // progressValue: {
    //   value: 0,
    //   min: 0,
    //   max: 1,
    //   step: 0.01,
    //   onChange: (value) => {
    //     setProgress({ progress: value })
    //   },
    // },
    // Switch camera list
    // camera: {
    //   value: "bench",
    //   options: ["cabinet", "door", "bench", "weight", "solution"],
    //   onChange: (value) => {
    //     changeCamera(value)
    //   },
    // },
  })

  useFrame(({ clock }) => {
    timer += clock.getDelta()
    if (timer > 0.1) {
      timer = 0
    }

    // Updates the camera position to follow the model
    followModelPosition()

    if (weightHit === false) {
      // Checks if the weight hits the laser
      const intersections = laserRaycast()
      if (intersections.length > 3) {
        setWeightHit(true)
        if (acceleration <= 1.05 && acceleration >= 0.95) {
          setGameWon(true)
        }
        else {
          takeLive()
        }
      }
    }
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
        <animated.group ref={{
          weightRef: weightRef,
        }}
          progress={progress.progress}
        >
          <WeightRack weight={weightSphereIndex} setWeight={setWeightSphereIndex} setSelectedSolution={setSelectedSolution} objectType={'sphere'} scale={1} position={[-2.55, .81, 2.08]} offsetZ={-0.44} rotation={[0, Math.PI / 2, 0]} />
          <WeightRack weight={weightCylinderIndex} setWeight={setWeightCylinderIndex} setSelectedSolution={setSelectedSolution} objectType={'cylinder'} scale={1} position={[-2.55, 1.23, 2.08]} offsetZ={-0.44} rotation={[0, Math.PI / 2, 0]} />
          <WeightRack weight={weightRingIndex} setWeight={setWeightRingIndex} setSelectedSolution={setSelectedSolution} objectType={'ring'} scale={1} position={[-2.55, .42, 2.08]} offsetZ={-0.44} rotation={[0, Math.PI / 2, 0]} />

          <Level02Model ref={{
            weightRef: weightRef,
            laserRef: laserRef,
            cabinetRef: cabinetRef,
            solutionRef: solutionRef,
          }}
            progress={progress.progress}
            setSelectedObject={setSelectedObject}
            selectedSolution={selectedSolution}
            weightsIndex={{ weightSphere: weightSphereIndex, weightRing: weightRingIndex, weightCylinder: weightCylinderIndex }}
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
  )
})

export default Level02

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