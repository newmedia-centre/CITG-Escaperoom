/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.3 Cannon.glb --simplify --transform
*/
// Cannon.jsx

import React, { forwardRef } from 'react'
import { useGLTF } from '@react-three/drei'

export const Cannon = forwardRef((props, ref) => {
  const { nodes, materials } = useGLTF('models/gltfjsx/Cannon-transformed.glb')

  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Cannon.geometry} material={materials.PaintedMetal} position={[-0.261, 5.667, 4.789]} scale={0.549} />
      <mesh ref={ref} geometry={nodes.CannonBarrel.geometry} material={materials.DarkGrayMetal} position={[-0.261, 6.324, 4.789]} scale={0.482} />
    </group>
  )
})

useGLTF.preload('models/gltfjsx/Cannon-transformed.glb')
