import React, { useState, useRef, useEffect } from 'react'
import { useThree } from "@react-three/fiber"
import { Svg } from '@react-three/drei'
import { useGesture } from '@use-gesture/react'
import { useSpring, a } from '@react-spring/three'
import { useRaycastAll } from '@react-three/cannon'

function PuzzlePiece({ ...props }) {
    const yPos = props.position[1]
    const { puzzleId, position, svg, setPuzzleInPlace } = props
    const { size, viewport } = useThree()
    const index = Math.floor(Math.random() * 4)

    const aspect = size.width / viewport.width
    const scale = [0.4, 0.05, 0.4]
    const scaleFactor = 1.1
    const originalPosition = position

    const svgHint = useRef()

    const [isDragging, setDragging] = useState(false); // Add state to track dragging
    const [currentIndex, setCurrentIndex] = useState(index); // State for index
    const [interactable, setInteractable] = useState(true); // State for index
    const [hint, setHint] = useState(0) // State for hints

    const [spring, set] = useSpring(() => ({
        scale: scale,
        position: position,
        rotation: [0, (currentIndex * Math.PI) / 2, 0], // Rotate based on currentIndex
        index: index,
        config: { friction: 10 },
        color: "white"
    }))

    useEffect(() => {
        switch (hint) {
            case 0:
                svgHint.current.visible = true
                break;
        }
    }, [hint])

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
                var hitPos = hit?.body?.position.toArray()

                set({
                    position: hitPos,
                    color: 'white',
                })

                setPuzzleInPlace()
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
                if (x > 0.5 || y > 0.5) {
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

            if (!isDragging) {
                // Increase the currentIndex by 1 when clicked
                const nextIndex = (currentIndex + 1) % 4;
                setCurrentIndex(nextIndex);
                set({
                    rotation: [0, (nextIndex * Math.PI) / 2, 0], // Rotate based on currentIndex
                })
            }
        }
    })

    return (
        <>
            <a.group position={spring.position} rotation={spring.rotation}>
                <Svg
                    name='puzzle'
                    scale={0.00074}
                    src={svg + "Puzzle.svg"}
                    position={[-scale[0] / 2, .0289, scale[2] / 2]}
                    rotation={[-Math.PI / 2, 0, Math.PI / 2]}
                />
                <Svg
                    ref={svgHint}
                    visible={false}
                    name='hint'
                    scale={0.00074}
                    src={svg + "Hint.svg"}
                    position={[-scale[0] / 2, .0289, scale[2] / 2]}
                    rotation={[-Math.PI / 2, 0, Math.PI / 2]}
                />
            </a.group>
            <a.mesh {...spring} {...bind()} castShadow>
                <boxBufferGeometry />
                <a.meshStandardMaterial color={spring.color} />
            </a.mesh >
            <Raycast puzzleId={puzzleId} index={index} position={spring.position.get()} />
        </>
    )
}

export default PuzzlePiece
