import {
  AccumulativeShadows,
  RandomizedLight,
  Center,
  Environment,
  PerformanceMonitor,
  GizmoHelper,
  GizmoViewport,
  CameraControls,
  Grid
} from "@react-three/drei";
import { useControls } from "leva";
import { EffectComposer, N8AO, SMAA } from "@react-three/postprocessing";
import React, { useEffect, useRef, useState, useTransition } from "react";
import { Model } from "../public/models/gltfjsx/CannonLevel";

export default function Scene() {
  const meshRef = useRef()
  const cameraControlsRef = useRef()

  useEffect(() => {
    if (meshRef.current) {

    }

    if (cameraControlsRef.current) {
      cameraControlsRef.current?.setLookAt(0, 9, 36, 0, 9, 35, true)
    }
  }, [])

  return (
    <>
      <group position={[0, -0.3, 0]}>
        <GizmoHelper alignment={"bottom-right"} margin={[80, 80]} renderPriority={2}>
          <GizmoViewport axisColors={["red", "green", "blue"]} labelColor={"black"} />
        </GizmoHelper>
        <AccumulativeShadows temporal frames={200} color="yellow" colorBlend={0.5} opacity={1} scale={10} alphaTest={0.85}>
          <RandomizedLight amount={5} radius={4} ambient={0.3} position={[5, 3, 2]} bias={0.001} />
        </AccumulativeShadows>
        <Effects />
        <Env />

        <Center top>
          <Model ref={meshRef} />
        </Center>
        <Ground />
        <CameraControls ref={cameraControlsRef} enabled={true} />
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

function Ground() {
  const gridConfig = {
    cellSize: 0.5,
    cellThickness: 0.5,
    cellColor: '#6f6f6f',
    sectionSize: 3,
    sectionThickness: 1,
    sectionColor: '#9d4b4b',
    fadeDistance: 30,
    fadeStrength: 1,
    followCamera: false,
    infiniteGrid: true
  }
  return <Grid position={[0, -0.01, 0]} args={[10.5, 10.5]} {...gridConfig} />
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
