/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.3 WaterLevel.glb --simplify --transform
*/

import React, { forwardRef } from 'react'
import { useGLTF } from '@react-three/drei'

export const WaterLevel = forwardRef((props, ref) => {
  const { nodes, materials } = useGLTF('models/gltfjsx/WaterLevel-transformed.glb')
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.WaterLevel.geometry} material={materials.WaterLevel} position={[-14.972, 0, 1.957]} rotation={[0, 0, -Math.PI / 2]} scale={[1.647, 1, 1]} />
    </group>
  )
})

useGLTF.preload('models/gltfjsx/WaterLevel-transformed.glb')