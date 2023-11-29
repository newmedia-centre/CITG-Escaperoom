import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import { useThree } from "@react-three/fiber"
import { Point, Points, PointMaterial, useTexture, Text, useVideoTexture } from '@react-three/drei'
import { useGesture } from '@use-gesture/react'
import { useSpring, a } from '@react-spring/three'
import { useRaycastAll } from '@react-three/cannon'

export const PuzzlePiece = forwardRef(({ ...props }, ref) => {
    const yPos = props.position[1]
    const { puzzleId, position, video, setPuzzle, puzzle, setPuzzleSolved, solutionCoords, showPuzzle, setSolutionEntered } = props
    const { size, viewport } = useThree()
    const gridTexture = useTexture("grid-pattern.png")
    const puzzleTexture = useVideoTexture(video + ".mp4")
    const vectorTexture = useVideoTexture(video + "_Arrow.mp4")
    const index = Math.floor(Math.random() * 4)

    const aspect = size.width / viewport.width
    const scale = [0.4, 0.05, 0.4]
    const scaleFactor = 1.1
    const originalPosition = position

    const solutionRef = useRef()
    const inputRef = useRef()
    const materialRef = useRef()

    const [isDragging, setIsDragging] = useState(false); // Add state to track dragging
    const [currentIndex, setCurrentIndex] = useState(index); // State for index
    const [allowUserInput, setAllowUserInput] = useState(false)
    const [pieceSet, setPieceSet] = useState(false)
    const [solutionEnteredInt, setSolutionEnteredInt] = useState(false)
    const [hit, setHit] = useState({})

    const [spring, set] = useSpring(() => ({
        scale: scale,
        position: position,
        rotation: [0, (currentIndex * Math.PI) / 2, 0], // Rotate based on currentIndex
        index: index,
        config: { friction: 10 },
        color: "gray"
    }))

    useImperativeHandle(ref, () => ({
        resetLevel: () => resetLevel(),
    }))

    // Show puzzle vector when puzzle is selected, it should also check if puzzle id is in place
    const showPuzzleVector = (puzzleId) => {
        setPuzzle(prev => {
            const newShowVector = {}
            Object.keys(prev.showVector).forEach(key => {
                newShowVector[key] = false
            })
            newShowVector[puzzleId] = true
            return {
                ...prev,
                showVector: newShowVector
            }
        });
    }

    const resetLevel = () => {
        set({
            position: originalPosition,
            color: 'gray',
        })

        setSolutionEnteredInt(false)

        setTimeout(() => {
            setPieceSet(false)
            setAllowUserInput(false)
            setHit({})
        }, 500) // Delay the set function call by 1000 milliseconds (1 second)
    }

    function Raycast({ puzzleId, index, position }) {

        const pos = position
        var dir = [pos[0], pos[1] + 0.5, pos[2]]

        useEffect(() => {
            if (pieceSet === true) return

            // console.log("puzzleId:", puzzleId, "collided with:", hit?.body?.name, "currentIndex:", currentIndex, "to index:", hit?.body?.userData?.index)

            // Checks if the piece collided with the correct puzzle piece with the right orientation
            if (hit?.body?.name == puzzleId && hit?.body?.userData?.index == currentIndex) {
                setPieceSet(true)
                var hitPos = hit?.body?.position.toArray()

                set({
                    position: hitPos,
                    color: 'white',
                })
                setPuzzle()
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
        useRaycastAll({ from, to }, setHit);
    }

    const bind = useGesture({
        onDrag: ({ event, dragging, movement: [x, y] }) => {
            event.stopPropagation();

            if (pieceSet || solutionEnteredInt) return;

            if (dragging && pieceSet === false) {
                if (x > 0.5 || y > 0.5) {
                    setIsDragging(true);
                }

                set({
                    position: [originalPosition[0] + y / aspect, yPos, originalPosition[2] - x / aspect],
                    color: 'gray',
                });
            }
        },
        onHover: ({ event, hovering }) => {
            event.stopPropagation();

            if (pieceSet === true || solutionEnteredInt) return;

            set({
                color: hovering ? 'white' : 'gray',
                scale: hovering ? scale.map((value) => value * scaleFactor) : scale,
            });
        },
        onPointerUp: ({ event }) => {
            event.stopPropagation();

            if (pieceSet === false) {
                set({
                    position: originalPosition,
                    color: 'gray',
                })
            }

            setIsDragging(false)
        },
        onClick: ({ event }) => {
            event.stopPropagation();

            if (solutionEnteredInt) return;

            if (!isDragging && pieceSet === false) {
                // Increase the currentIndex by 1 when clicked
                const nextIndex = (currentIndex + 1) % 4;
                setCurrentIndex(nextIndex);
                set({
                    rotation: [0, (nextIndex * Math.PI) / 2, 0], // Rotate based on currentIndex
                });
            }

            if (allowUserInput) {
                showPuzzleVector(puzzleId)
            }

            // If the piece is not interactable, the user can input the solution
            if (allowUserInput && puzzle?.showVector[puzzleId] === true) {
                // Set the position of input ref to the event position
                inputRef.current?.position.set(event.uv.x - 0.5, 0, -event.uv.y + 0.5)
                inputRef.current.visible = true;

                // Calculate the distance between the solution and the input
                var distance = inputRef.current?.position.distanceTo(solutionRef.current?.position);

                // If the distance is less than x the puzzle is solved
                if (distance < 0.1) {
                    setPuzzleSolved();
                    setSolutionEntered();
                    setSolutionEnteredInt(true);
                    materialRef.current?.color.set("green");
                } else {
                    // takeLive()
                    setSolutionEntered();
                    setSolutionEnteredInt(true);
                    materialRef.current?.color.set("red");
                }
                // Use this to display the solution
                // solutionRef.current.parent.visible = true
            }

            if (pieceSet === true) {
                setAllowUserInput(true)
            }
        },
    });

    return (
        <>
            <a.group position={spring.position} rotation={spring.rotation}>
                <Text anchorX={"center"} anchorY={"middle"} color={"red"} fontSize={0.05} position={[0.16, 0.03, 0.16]} rotation={[-Math.PI / 2, 0, 0]} visible={!showPuzzle}>
                    {puzzleId + 1}
                </Text>
            </a.group>

            <a.mesh {...spring} {...bind()}>
                <boxBufferGeometry />
                <a.meshBasicMaterial visible={true} transparent={true} map={puzzleTexture} />
            </a.mesh >
            <a.mesh {...spring}>
                <boxBufferGeometry />
                <a.meshBasicMaterial visible={puzzle?.showVector[puzzleId] ? puzzle.showVector[puzzleId] : false} transparent={true} map={vectorTexture} />
            </a.mesh >

            <a.mesh {...spring} >
                <boxBufferGeometry />
                <a.meshStandardMaterial color={spring.color} />
            </a.mesh >
            <Raycast puzzleId={puzzleId} index={index} position={spring.position.get()} />
            <a.group {...spring}>

                <Points renderOrder={20} visible={false} positions={[0, 0, 0]}>
                    <PointMaterial transparent={true} vertexColors size={15} sizeAttenuation={false} depthTest={false} depthWrite={false} toneMapped={false} />
                    <Point name='solution' ref={solutionRef} position={solutionCoords} color={"red"} />
                </Points>

                <Points renderOrder={20} ref={inputRef} visible={solutionEnteredInt}>
                    <PointMaterial transparent={true} vertexColors size={15} sizeAttenuation={false} depthTest={false} depthWrite={false} toneMapped={false} />
                    <Point name='input' position={[0, 0.013, 0]} ref={materialRef} color={"red"} />
                </Points>
            </a.group>
            <a.mesh {...spring} >
                <boxBufferGeometry />
                <a.meshBasicMaterial visible={puzzle?.showVector[puzzleId] ? puzzle.showVector[puzzleId] : false} transparent={true} map={gridTexture} />
            </a.mesh >
        </>
    )
})

export default PuzzlePiece
