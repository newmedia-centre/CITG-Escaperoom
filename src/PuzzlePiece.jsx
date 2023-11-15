import React, { useState, useRef, useEffect } from 'react'
import { useThree } from "@react-three/fiber"
import { Svg, Point, Points, PointMaterial, useTexture, Text } from '@react-three/drei'
import { useGesture } from '@use-gesture/react'
import { useSpring, a } from '@react-spring/three'
import { useRaycastAll } from '@react-three/cannon'

function PuzzlePiece({ ...props }) {
    const yPos = props.position[1]
    const { puzzleId, position, svg, setPuzzleInPlace, setPuzzleSolved, solutionCoords, showPuzzle, takeLive } = props
    const { size, viewport } = useThree()
    const gridTexture = useTexture("grid-pattern.png")
    const index = Math.floor(Math.random() * 4)

    const aspect = size.width / viewport.width
    const scale = [0.4, 0.05, 0.4]
    const scaleFactor = 1.1
    const originalPosition = position

    const svgHint = useRef()
    const solutionRef = useRef()
    const inputRef = useRef()
    const materialRef = useRef()

    const [isDragging, setDragging] = useState(false); // Add state to track dragging
    const [currentIndex, setCurrentIndex] = useState(index); // State for index
    const [interactable, setInteractable] = useState(true); // State for index
    const [hint, setHint] = useState(5) // State for hints
    const [solutionEntered, setSolutionEntered] = useState(false) // State for puzzle solution entered internally

    const [spring, set] = useSpring(() => ({
        scale: scale,
        position: position,
        rotation: [0, (currentIndex * Math.PI) / 2, 0], // Rotate based on currentIndex
        index: index,
        config: { friction: 10 },
        color: "gray"
    }))

    useEffect(() => {
        switch (hint) {
            case 4:
                svgHint.current.visible = true
                break;
            case 3:
                solutionRef.current.parent.visible = true
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

                setPuzzleInPlace(true)
                // console.log("puzzleId:", puzzleId, "collided with:", hit?.body?.name, "currentIndex:", currentIndex, "to index:", hit?.body?.userData?.index)
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

            if (!interactable || solutionEntered) return

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

            if (!interactable || solutionEntered) return

            set({
                color: hovering ? 'white' : 'gray',
                scale: hovering ? scale.map((value) => value * scaleFactor) : scale
            })
        },
        onPointerUp: ({ event }) => {
            event.stopPropagation()

            if (!interactable || solutionEntered) return

            set({
                position: originalPosition,
                color: 'gray',
            })

            setDragging(false)
        },
        onClick: ({ event }) => {
            event.stopPropagation()

            if (solutionEntered) return

            if (!isDragging && interactable) {
                // Increase the currentIndex by 1 when clicked
                const nextIndex = (currentIndex + 1) % 4;
                setCurrentIndex(nextIndex);
                set({
                    rotation: [0, (nextIndex * Math.PI) / 2, 0], // Rotate based on currentIndex
                })
            }

            // If the piece is not interactable, the user can input the solution
            if (!interactable) {
                // Set the position of input ref to the event position
                inputRef.current?.position.set(event.uv.x - 0.5, 0, -event.uv.y + 0.5)
                inputRef.current.visible = true

                // Calculate the distance between the solution and the input
                var distance = inputRef.current?.position.distanceTo(solutionRef.current?.position)


                // If the distance is less than 0.08, the puzzle is solved
                if (distance < 0.08) {
                    setPuzzleSolved()
                    setSolutionEntered(true)
                    materialRef.current?.color.set("green")

                    // Use this to display the solution
                    // solutionRef.current.parent.visible = true
                }
                else {
                    // TODO: Take away a life
                    takeLive()
                    setSolutionEntered(true)
                    materialRef.current?.color.set("red")

                    // Use this to display the solution
                    // solutionRef.current.parent.visible = true
                }
            }
        }
    })

    return (
        <>
            <a.group position={spring.position} rotation={spring.rotation}>
                <Svg
                    visible={showPuzzle}
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
                <Text anchorX={"center"} anchorY={"middle"} color={"black"} fontSize={0.05} position={[0.16, 0.03, 0.16]} rotation={[-Math.PI / 2, 0, 0]} visible={!showPuzzle}>
                    {puzzleId}
                </Text>
            </a.group>
            <a.group {...spring}>

                <Points visible={false}>
                    <PointMaterial transparent={true} vertexColors size={15} sizeAttenuation={false} depthTest={false} depthWrite={false} toneMapped={false} />
                    <Point name='solution' ref={solutionRef} position={solutionCoords} color={"red"} />
                </Points>

                <Points ref={inputRef} position={[0, 0, 0]} visible={false}>
                    <PointMaterial transparent={true} vertexColors size={15} sizeAttenuation={false} depthTest={false} depthWrite={false} toneMapped={false} />
                    <Point name='input' position={[0, 0, 0]} ref={materialRef} color={"yellow"} />
                </Points>
            </a.group>
            <a.mesh {...spring} {...bind()} castShadow>
                <boxBufferGeometry />
                <a.meshStandardMaterial color={spring.color} map={showPuzzle ? gridTexture : ""} />
            </a.mesh >
            <Raycast puzzleId={puzzleId} index={index} position={spring.position.get()} />
        </>
    )
}

export default PuzzlePiece
