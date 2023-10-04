import { React, useState } from 'react'
import Ring from '../public/models/gltfjsx/Ring'
import Cylinder from '../public/models/gltfjsx/Cylinder'
import Sphere from '../public/models/gltfjsx/Sphere'
import { useSpring, animated } from '@react-spring/three'
import { Text } from '@react-three/drei'

export default function WeightRack(props) {
    const { objectType, position, offsetZ, scale } = props

    const weights = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    const totalDisplays = 5

    // Set the default weight to the middle item of the array
    const [weight, setWeight] = useState(Math.floor(weights.length / 2))

    const [objectAnim, setObjectAnim] = useSpring(() => ({
        from: [0, 0, 0],
        to: { positionOffset: [0, 0, 0] },
        onRest: () => {
            // Reset the position offset to 0,0,0 instantly
            setObjectAnim.set({ positionOffset: [0, 0, 0] })
        },
    }))

    const objectRack = Array.from({ length: totalDisplays }).map((_, index) => {
        const positionOffset = [0, 0, index * offsetZ]
        let object

        switch (objectType) {
            case 'ring':
                object = <Ring {...props} position={positionOffset} key={index} userData={{ display: index }} onPointerDown={(obj) => scrollObject(obj.eventObject)} />
                break
            case 'cylinder':
                object = <Cylinder {...props} position={positionOffset} key={index} userData={{ display: index }} onPointerDown={(obj) => scrollObject(obj.eventObject)} />
                break
            case 'sphere':
                object = <Sphere  {...props} position={positionOffset} key={index} userData={{ display: index }} onPointerDown={(obj) => scrollObject(obj.eventObject)} />
                break
            default:
                object = <Ring {...props} position={positionOffset} key={index} userData={{ display: index }} onPointerDown={(obj) => scrollObject(obj.eventObject)} />
                break
        }

        return object
    })

    const scrollObject = (object) => {
        let positionOffset = [0, 0, 0]

        if (object.userData.display < 2) {
            // Set the weight to the min or max if it goes out of bounds
            if (weight < 1) {
                setWeight(0)
            }
            else {
                setWeight(weight - 1)
            }
            positionOffset = [0, 0, offsetZ]
        }
        else if (object.userData.display > 2) {
            if (weight >= weights.length - 1) {
                setWeight(weights.length)
            }
            else {
                setWeight(weight + 1)
            }
            positionOffset = [0, 0, -offsetZ]
        }

        // Update the spring animation with the new position offset
        setObjectAnim.start({ positionOffset })
    }

    return <group position={position}>
        {objectRack.map((object, index) => (
            <>
                <Text fontSize={0.2} rotation={[0, Math.PI / 2, 0]} position={[0, .3, offsetZ * 2]}>{weight}</Text>
                <animated.group key={index} position={objectAnim.positionOffset}>
                    {object}
                </animated.group>
            </>
        ))}
    </group>
}
