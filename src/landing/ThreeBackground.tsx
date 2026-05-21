import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { scrollState } from './scrollState'

const EVIDENCE = [
  'Reply client', 'NEPA don go', 'Pickup at Ojota',
  'Send invoice', 'Fix Figma export', 'Call mechanic',
  'Buy cement', 'Mr. Adebayo quote', 'Oyingbo parts',
  'Submit report', 'Water tank empty', 'Pay generator',
  'Order tiles', 'Confirm delivery', 'Traffic jam',
]

const PAPER_TONES = ['#F5E6C8', '#E8D5A8', '#F0E0C0', '#EDDFC5', '#F2E4C5']

function EvidenceCard({ position, color, text: _text, index }: {
  position: [number, number, number]
  color: string
  text: string
  index: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const rotZ = useMemo(() => (Math.random() - 0.5) * 0.3, [])
  const offset = useMemo(() => Math.random() * Math.PI * 2, [])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime * 0.25 + offset
    meshRef.current.position.y += Math.sin(t + index) * 0.0005
    meshRef.current.rotation.z = rotZ + Math.sin(t * 0.4 + index) * 0.01
  })

  return (
    <group position={position} rotation={[0, 0, rotZ]}>
      <mesh ref={meshRef} castShadow>
        <planeGeometry args={[2.4, 0.9]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.92}
          roughness={0.8}
          metalness={0}
        />
      </mesh>
      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[2.2, 0.12]} />
        <meshBasicMaterial color="#CC3333" opacity={0.6} transparent />
      </mesh>
      <mesh position={[1.05, 0.35, 0.005]}>
        <circleGeometry args={[0.04, 12]} />
        <meshBasicMaterial color="#CC3333" />
      </mesh>
    </group>
  )
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null)

  const cards = useMemo(() =>
    EVIDENCE.map((t, i) => ({
      text: t,
      color: PAPER_TONES[i % PAPER_TONES.length],
      position: [
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 9,
        -3 - Math.random() * 7,
      ] as [number, number, number],
      index: i,
    })), []
  )

  useFrame(() => {
    if (!groupRef.current) return
    const progress = scrollState.current
    groupRef.current.rotation.y = (progress - 0.3) * 0.2
    groupRef.current.position.x = (progress - 0.5) * 0.8
    groupRef.current.position.y = -progress * 0.5
  })

  return (
    <>
      <color attach="background" args={['#1A0F0A']} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 5, 4]} intensity={0.6} color="#FFEECC" />
      <pointLight position={[-2, 1, 3]} intensity={0.2} color="#FFDDBB" />
      <fog attach="fog" args={['#1A0F0A', 6, 16]} />

      <group ref={groupRef}>
        {cards.map((card) => (
          <Float key={card.text} speed={0.3 + card.index * 0.04} rotationIntensity={0.03} floatIntensity={0.15}>
            <EvidenceCard {...card} />
          </Float>
        ))}
      </group>
    </>
  )
}

export function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [0, 0, 7], fov: 45 }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 7]} fov={45} />
        <Scene />
      </Canvas>
    </div>
  )
}
