import React, { useState, useRef, useMemo, useEffect } from 'react'
import { useThree, useFrame } from "@react-three/fiber"
import { Vector3, BoxGeometry } from 'three'
import { useGesture } from '@use-gesture/react'
import { useSpring, a } from '@react-spring/three'
import { useBox, useRaycastAll } from '@react-three/cannon'

function PuzzlePiece({ ...props }) {
    const yPos = props.position[1]
    const { puzzleId, index, position } = props
    const { size, viewport } = useThree()

    const aspect = size.width / viewport.width
    const scale = [0.4, 0.05, 0.4]
    const scaleFactor = 1.1
    const originalPosition = position

    const [isDragging, setDragging] = useState(false); // Add state to track dragging
    const [currentIndex, setCurrentIndex] = useState(index); // State for index
    const [interactable, setInteractable] = useState(true); // State for index

    const [spring, set] = useSpring(() => ({
        scale: scale,
        position: position,
        rotation: [0, (currentIndex * Math.PI) / 2, 0], // Rotate based on currentIndex
        index: index,
        config: { friction: 10 },
        color: "white"
    }))

    function Raycast({ puzzleId, index, position }) {
        const [hit, setHit] = useState({})
        const pos = position
        var dir = [pos[0], pos[1] + 0.5, pos[2]]

        useEffect(() => {
            if (!interactable) return

            // console.log("puzzleId:", puzzleId, "collided with:", hit?.body?.name, "currentIndex:", currentIndex, "to index:", hit?.body?.userData?.index)

            // Checks if the piece collided with the correct puzzle piece with the right orientation
            if (hit?.body?.name == puzzleId && hit?.body?.userData?.index == currentIndex) {
                setInteractable(false)
            }
        }, [hit])

        return (
            <>
                <Ray from={pos} to={dir} setHit={setHit} />
            </>
        )
    }

    function Ray({ from, to, setHit }) {
        useRaycastAll({ from, to }, setHit)
    }

    const bind = useGesture({
        onDrag: ({ event, dragging, movement: [x, y] }) => {
            event.stopPropagation()

            if (!interactable) return

            if (dragging) {
                if (x > 1 || y > 1) {
                    setDragging(true)
                }

                set({
                    position: [originalPosition[0] + y / aspect, yPos, originalPosition[2] - x / aspect],
                    color: 'gray',
                });
            }
        },
        onHover: ({ event, hovering }) => {
            event.stopPropagation()

            if (!interactable) return

            set({
                scale: hovering ? scale.map((value) => value * scaleFactor) : scale
            })
        },
        onPointerUp: ({ event }) => {
            event.stopPropagation()

            if (!interactable) return

            set({
                position: originalPosition,
                color: 'white',
            })

            setDragging(false)
        },
        onClick: () => {

            if (!interactable) return

            // Increase the currentIndex by 1 when clicked
            const nextIndex = (currentIndex + 1) % 4;
            setCurrentIndex(nextIndex);

            if (!isDragging) {
                set({
                    rotation: [0, (nextIndex * Math.PI) / 2, 0], // Rotate based on currentIndex
                })
            }
        }
    })

    return (
        <>

            <a.mesh {...spring} {...bind()} castShadow>
                <boxBufferGeometry />
                <a.meshStandardMaterial color={spring.color} />
            </a.mesh >
            <Raycast puzzleId={puzzleId} index={index} position={spring.position.get()} />
        </>
    )
}

export default PuzzlePiece
