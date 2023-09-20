/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.3 Level02.glb --transform
*/

import React, { forwardRef, useRef, useState, createRef } from 'react'
import { useFrame } from "@react-three/fiber"
import { useGLTF, Plane } from '@react-three/drei'
import * as THREE from 'three'
import { MathUtils } from 'three'

export const Level02Model = forwardRef((props, ref) => {
  const { weightRef, wellRef } = ref
  var { progress } = props
  const { nodes, materials } = useGLTF('models/gltfjsx/Level02-transformed.glb')

  const rope001Ref = useRef()
  const rope002Ref = useRef()
  const rope003Ref = useRef()
  const circle003Ref = useRef()
  const rope004Ref = useRef()
  const ropeRef = useRef()

  const initRope001Position = new THREE.Vector3(0, 0.6, 2.304)
  const initRope002Position = new THREE.Vector3(0, 0.6, -2.366)
  const initRope003Position = new THREE.Vector3(0, 0.548, -2.416)
  const initCircle003Position = new THREE.Vector3(0, 0.355, -2.418)
  const initRope004Position = new THREE.Vector3(0, 0.356, -2.518)
  const initRopePosition = new THREE.Vector3(0, 2.847, -2.518)
  const initWeightPosition = new THREE.Vector3(0, 0, 0)

  const [planes] = useState(() => [[-0.05, 0, 0]].map(v => new THREE.Plane(new THREE.Vector3(...v), 1))) // prettier-ignore
  const [planeObjects] = useState(() => [createRef()])

  // Function to scale ropes to make it look like they are connected
  const ropeScaler = () => {

    // Get the positions of the ropes
    const rope001Position = rope001Ref.current?.position
    const rope002Position = rope002Ref.current?.position
    const rope003Position = rope003Ref.current?.position
    const circle003Position = circle003Ref.current?.position
    const rope004Position = rope004Ref.current?.position
    const ropePosition = ropeRef.current?.position

    // Calculate the distance between ropes
    const distance12 = rope001Position.distanceTo(rope002Position)
    const distance23 = rope003Position.distanceTo(circle003Position)
    const distance40 = rope004Position.distanceTo(ropePosition)

    // Set the scale of ropes based on the distance and original length
    rope001Ref.current.scale.y = (distance12 / 4.66989)
    rope003Ref.current.scale.y = (distance23 / 0.194032)
    ropeRef.current.scale.y = (distance40 / 2.49068)
  }

  const getClippedMat = (planes) => ({
    color: 0xffc107,
    metalness: 0.1,
    roughness: 0.75,
    clippingPlanes: planes,
    clipShadows: true,
    shadowSide: THREE.DoubleSide,
  })

  const getPlaneMat = (plane) => ({
    color: 0xe91e63,
    metalness: 0.1,
    roughness: 0.75,
    clippingPlanes: plane,
    stencilWrite: true,
    stencilRef: 0,
    stencilFunc: THREE.NotEqualStencilFunc,
    stencilFail: THREE.ReplaceStencilOp,
    stencilZFail: THREE.ReplaceStencilOp,
    stencilZPass: THREE.ReplaceStencilOp,
  })

  // Call the scaleRope001 function in the useFrame hook to update the scale continuously
  useFrame(({ clock }) => {

    rope001Ref.current.position.z = MathUtils.lerp(initRope001Position.z, -2, progress.get())
    rope002Ref.current.position.z = MathUtils.lerp(initRope002Position.z, -2.36, progress.get())
    circle003Ref.current.position.y = MathUtils.lerp(initCircle003Position.y, -4, progress.get())
    rope003Ref.current.position.y = MathUtils.lerp(initRope003Position.y, 0.55, progress.get())
    rope004Ref.current.position.y = MathUtils.lerp(initRope004Position.y, -4, progress.get())
    weightRef.current.position.y = MathUtils.lerp(initWeightPosition.y, -4.35, progress.get())
    ropeScaler()

    planes.forEach((plane, i) => {
      const po = planeObjects[i].current
      plane.coplanarPoint(po.position)
      po.lookAt(po.position.x - plane.normal.x, po.position.y - plane.normal.y, po.position.z - plane.normal.z)
    })
  })

  return (
    <group {...props} dispose={null}>
      <group ref={weightRef}>
        <mesh geometry={nodes.Pulley004.geometry} material={materials.BlackMetal} position={[0, 0.355, -2.467]} />
        <mesh geometry={nodes.PulleyWeight.geometry} material={materials.Alluminium} position={[0, 0.355, -2.467]} rotation={[0, 0, -Math.PI / 2]} scale={[0.01, 0.032, 0.01]} />
        <mesh geometry={nodes.Weight.geometry} material={materials.AlluminiumDark} position={[0, 0.178, -2.467]} scale={[0.069, 0.089, 0.069]} />
      </group>
      <mesh ref={rope004Ref} geometry={nodes.Rope004.geometry} material={materials.Rope} position={[0, 0.356, -2.518]} />
      <mesh ref={circle003Ref} geometry={nodes.Circle003.geometry} material={materials.Rope} position={[0, 0.355, -2.418]} />
      <mesh geometry={nodes.Ring.geometry} material={nodes.Ring.material} position={[0, 0.595, 2.5]} />
      <mesh geometry={nodes.Ground.geometry} material={materials.Ground} />
      <mesh geometry={nodes.Sphere.geometry} material={nodes.Sphere.material} position={[0, 0.6, 2.5]} />
      <mesh ref={rope003Ref} geometry={nodes.Rope003.geometry} material={materials.Rope} position={[0, 0.548, -2.416]} rotation={[0, 0, -Math.PI]} />
      <mesh ref={rope001Ref} geometry={nodes.Rope001.geometry} material={materials.Rope} position={[0, 0.6, 2.304]} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Laser.geometry} material={nodes.Laser.material} position={[0, -4, -2.835]} />
      <mesh geometry={nodes.Cylinder.geometry} material={nodes.Cylinder.material} position={[0, 0.595, 2.5]} scale={[1.196, 0.598, 1.196]} />
      <mesh geometry={nodes.Bench.geometry} material={materials.Wood} position={[0, 0.35, 0.231]} />
      <mesh geometry={nodes.Foots.geometry} material={materials.Wood} position={[0.155, 0.233, -1.95]} />
      <mesh geometry={nodes.Pulley.geometry} material={materials.BlackMetal} position={[0, 0.348, -2.02]} rotation={[Math.PI / 6, 0, 0]} scale={[0.336, 1, 1]} />
      <mesh geometry={nodes.Pulley001.geometry} material={materials.BlackMetal} position={[0, 0.548, -2.366]} rotation={[Math.PI / 6, 0, 0]} scale={[0.158, 1, 1]} />
      <mesh ref={rope002Ref} geometry={nodes.Rope002.geometry} material={materials.Rope} position={[0, 0.6, -2.366]} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Cabinet.geometry} material={materials.Alluminium} position={[-2.75, 0, 0.463]} />
      <mesh geometry={nodes.CabinetDoor.geometry} material={materials.AlluminiumDark} position={[-2.307, 0, 1.147]} rotation={[-Math.PI, -0.527, -Math.PI]} />
      <mesh geometry={nodes.CabinetDoor001.geometry} material={materials.AlluminiumDark} position={[-2.307, 0, -0.22]} rotation={[-Math.PI, Math.PI / 6, -Math.PI]} />
      <mesh geometry={nodes.Plane.geometry} material={materials.AlluminiumDark} position={[-2.694, 0.4, 0.463]} scale={[0.286, 0.656, 0.656]} />
      <mesh geometry={nodes.Ceiling.geometry} material={materials.Walls} position={[0, 3, -0.5]} rotation={[-Math.PI, 0, 0]} />
      <mesh geometry={nodes.PulleyCeiling.geometry} material={materials.BlackMetal} position={[0, 3, -2.518]} />
      <mesh ref={ropeRef} geometry={nodes.Rope.geometry} material={materials.Rope} position={[0, 2.847, -2.518]} rotation={[0, 0, Math.PI]} />
      <mesh geometry={nodes.Walls.geometry} material={materials.Walls} position={[3, 1, 3]} />
      <mesh geometry={nodes.DoorFrame.geometry} material={materials.WoodWhite} position={[-2.75, 0, -1.963]} rotation={[0, Math.PI / 2, 0]} />
      <mesh geometry={nodes.Door.geometry} material={materials.Wood} position={[-2.728, 1.05, -2.381]} rotation={[0, Math.PI / 2, 0]} />
      <mesh geometry={nodes.Handle_Back.geometry} material={materials.Alluminium} position={[-2.733, 1.05, -1.617]} rotation={[0, Math.PI / 2, 0]} />
      <mesh geometry={nodes.Handle_Front.geometry} material={nodes.Handle_Front.material} position={[-2.757, 1.05, -1.617]} rotation={[Math.PI, -Math.PI / 2, 0]} />

      <group ref={wellRef}>
        {/* <mesh geometry={nodes.Well.geometry} position={[0, -0.01, 0]} renderOrder={6}> */}
        <mesh geometry={nodes.Well.geometry} position={[0, -0.01, -2.5]} renderOrder={6}>
          <meshStandardMaterial {...getClippedMat(planes)} />
        </mesh>
        {planes.map((plane, i) => (
          <PlaneStencilGroup position={[0, -0.01, -2.5]} geometry={nodes.Well.geometry} plane={plane} renderOrder={i + 1} />
        ))}
        {planeObjects.map((planeRef, index) => (
          <Plane key={`0`} ref={planeRef} args={[10, 10]} renderOrder={index + 1.1} onAfterRender={(gl) => gl.clearStencil()}>
            <meshStandardMaterial {...getPlaneMat(planes.filter((_, i) => i !== index))} />
          </Plane>
        ))}
      </group>
    </group>
  )
})

function PlaneStencilGroup({ position, geometry, plane, renderOrder }) {
  const mat = {
    depthWrite: false,
    depthTest: false,
    colorWrite: false,
    stencilWrite: true,
    stencilFunc: THREE.AlwaysStencilFunc,
  }
  const matBack = {
    ...mat,
    side: THREE.BackSide,
    clippingPlanes: [plane],
    stencilFail: THREE.IncrementWrapStencilOp,
    stencilZFail: THREE.IncrementWrapStencilOp,
    stencilZPass: THREE.IncrementWrapStencilOp,
  }
  const matFront = {
    ...mat,
    side: THREE.FrontSide,
    clippingPlanes: [plane],
    stencilFail: THREE.DecrementWrapStencilOp,
    stencilZFail: THREE.DecrementWrapStencilOp,
    stencilZPass: THREE.DecrementWrapStencilOp,
  }

  return (
    <group position={position}>
      <mesh geometry={geometry} renderOrder={renderOrder}>
        <meshBasicMaterial {...matFront} />
      </mesh>
      <mesh geometry={geometry} renderOrder={renderOrder}>
        <meshBasicMaterial {...matBack} />
      </mesh>
    </group>
  )
}

useGLTF.preload('models/gltfjsx/Level02-transformed.glb')