/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.3 CannonBallHint.glb --simplify --transform
*/

import React, { forwardRef } from 'react'
import { useGLTF } from '@react-three/drei'

export const CannonBallHint = forwardRef((props, ref) => {
  const { nodes, materials } = useGLTF('models/gltfjsx/CannonBallHint-transformed.glb')
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.CannonBallHint.geometry} material={materials.CannonBallHint} position={[-3.604, 6.001, 5.038]} rotation={[-Math.PI / 6, -1.571, 0]} scale={0.4} />
    </group>
  )
})

useGLTF.preload('models/gltfjsx/CannonBallHint-transformed.glb')
