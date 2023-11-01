import React, { useMemo, useRef } from 'react'
import { useThree } from "@react-three/fiber"
import { useGesture } from '@use-gesture/react'
import { useSpring, a } from '@react-spring/three'

function PuzzlePiece({ ...props }) {
    const { size, viewport } = useThree()
    const aspect = size.width / viewport.width
    const [spring, set] = useSpring(() => ({
        scale: [1, 1, 1],
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        config: { friction: 10 }
    }))
    const bind = useGesture({
        onDrag: ({ offset: [x, y] }) => {
            set({ position: [y / aspect, 0, -x / aspect], rotation: [y / aspect, x / aspect, 0] })
            console.log("hi")
            // TODO: Fix dragging when table is selected
        },
        onHover: ({ hovering }) => set({ scale: hovering ? [1.2, 1.2, 1.2] : [1, 1, 1] })
    })

    return (
        <a.mesh {...spring} {...bind()} castShadow>
            <boxBufferGeometry />
            <meshStandardMaterial color="white" />
        </a.mesh >
    )
}

export default PuzzlePiece
