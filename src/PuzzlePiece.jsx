import React, { useMemo, useRef } from 'react'
import { useThree } from "@react-three/fiber"
import { useGesture } from '@use-gesture/react'
import { useSpring, a } from '@react-spring/three'

function PuzzlePiece({ ...props }) {
    const yPos = props.position[1]
    const { size, viewport } = useThree()
    const aspect = size.width / viewport.width
    const scale = [0.4, 0.05, 0.4]
    const scaleFactor = 1.1
    const [spring, set] = useSpring(() => ({
        scale: scale,
        position: props.position,
        rotation: [0, 0, 0],
        config: { friction: 10 },
        color: "white"
    }))
    const bind = useGesture({
        onDrag: ({ event, dragging, offset: [x, y] }) => {
            event.stopPropagation()
            set({ position: [y / aspect, yPos, -x / aspect] })
            set({ color: dragging ? 'gray' : 'white' })
        },
        onHover: ({ event, hovering }) => {
            event.stopPropagation()
            set({
                scale: hovering ? scale.map((value) => value * scaleFactor) : scale
            })
        },
        onClick: () => {
            console.log("hi")
        }
    })

    return (
        <a.mesh {...spring} {...bind()} castShadow>
            <boxBufferGeometry />
            <a.meshStandardMaterial color={spring.color} />
        </a.mesh >
    )
}

export default PuzzlePiece
