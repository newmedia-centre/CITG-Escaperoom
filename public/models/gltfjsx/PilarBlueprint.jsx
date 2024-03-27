/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.3 PilarBlueprint.glb --transform --simplify
*/

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { Text } from '@react-three/drei'

export function PilarBlueprint(props) {
  const { setSelectedObject, xText, yText } = props
  const { nodes, materials } = useGLTF('models/PilarBlueprint-v2.glb')
  return (
    <group name='blueprint' {...props} dispose={null} onPointerDown={(obj) => setSelectedObject(obj.eventObject)}>
      <mesh geometry={nodes.PilarBlueprint.geometry} material={materials['WindowBlueprint.001']} position={[13, 9.003, 5]}>
          <Text
            color='white'
            fontSize={1.8}
            letterSpacing={0.05}
            position={[-0.1, -0.75, 0]}
            rotation={[0, -Math.PI / 2, 0]}
            scale={[0.1, 0.1, 0.1]}>
                {xText.toFixed(3)}m
          </Text>
          <Text
              color='white'
              fontSize={1.8}
              letterSpacing={0.05}
              textAlign={"left"}
              anchorX={"left"}
              position={[-0.1, 0, 0.3]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={[0.1, 0.1, 0.1]}>
              {yText.toFixed(3)}m
          </Text>
      </mesh>
    </group>
  )
}

useGLTF.preload('models/PilarBlueprint-v2.glb')
