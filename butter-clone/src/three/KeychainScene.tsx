import { useRef, useMemo, Suspense, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'

type CharmProps = {
  url: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale?: number
  isGlass?: boolean
  springOffset?: number
}

function Charm({ url, position, rotation, scale = 1, isGlass = false, springOffset = 0 }: CharmProps) {
  const { scene } = useGLTF(url, '/draco/')
  const charmRef = useRef<THREE.Group>(null)
  const initialRot = useMemo(() => new THREE.Euler(...rotation), [rotation])

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (isGlass) {
          mesh.material = new THREE.MeshPhysicalMaterial({
            transmission: 0.8,
            roughness: 0.21,
            metalness: 0.63,
            transparent: true,
            opacity: 0.85,
            color: new THREE.Color('#d9e2ec'),
            ior: 1.5,
          })
        } else {
          mesh.material = new THREE.MeshStandardMaterial({
            metalness: 1.0,
            roughness: 0.1,
            color: new THREE.Color('#e8e8e8'),
          })
        }
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })
    return clone
  }, [scene, isGlass])

  useFrame((state) => {
    if (!charmRef.current) return
    const time = state.clock.getElapsedTime()
    // Subtle secondary charm sway
    const swayZ = Math.sin(time * 2.2 + springOffset) * 0.04
    const swayX = Math.cos(time * 1.8 + springOffset) * 0.03
    charmRef.current.rotation.x = initialRot.x + swayX
    charmRef.current.rotation.z = initialRot.z + swayZ
  })

  return (
    <group ref={charmRef} position={position} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  )
}

function KeychainRig() {
  const groupRef = useRef<THREE.Group>(null)
  const { pointer } = useThree()

  // Physics state: spring + inertia
  const currentRot = useRef(new THREE.Vector3(0, 0, 0))
  const velocity = useRef(new THREE.Vector3(0, 0, 0))

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const clampedDelta = Math.min(delta, 0.05)
    const time = state.clock.getElapsedTime()

    // Target rotation based on pointer position and gentle idle float
    const targetX = -pointer.y * 0.35 + Math.sin(time * 1.2) * 0.03
    const targetY = pointer.x * 0.65 + Math.cos(time * 0.9) * 0.04
    const targetZ = -pointer.x * 0.2

    // Spring physics equations (angular damping 2.9, stiffness 14.0)
    const stiffness = 14.0
    const damping = 2.9

    const forceX = (targetX - currentRot.current.x) * stiffness
    const forceY = (targetY - currentRot.current.y) * stiffness
    const forceZ = (targetZ - currentRot.current.z) * stiffness

    velocity.current.x += forceX * clampedDelta
    velocity.current.y += forceY * clampedDelta
    velocity.current.z += forceZ * clampedDelta

    // Apply damping
    const dampFactor = Math.exp(-damping * clampedDelta)
    velocity.current.multiplyScalar(dampFactor)

    // Integrate position
    currentRot.current.x += velocity.current.x * clampedDelta
    currentRot.current.y += velocity.current.y * clampedDelta
    currentRot.current.z += velocity.current.z * clampedDelta

    groupRef.current.rotation.x = currentRot.current.x
    groupRef.current.rotation.y = currentRot.current.y
    groupRef.current.rotation.z = currentRot.current.z
  })

  // Exact angles and offsets extracted from chunk 6955:
  // −60/−70/.2, −40/−60/−.2, −10/−10/.4, 20/10/.8, 40/50/−1, 70/80/.4 + key
  return (
    <group ref={groupRef} position={[0, -0.75, 0]}>
      {/* Carabiner / Main Ring at the top */}
      <Charm
        url="/models/keychain/carabiner.glb"
        position={[0, 1.8, 0]}
        rotation={[0, 0, 0]}
        scale={1.3}
        springOffset={0}
      />

      {/* Chain Link connecting */}
      <Charm
        url="/models/keychain/chain_link.glb"
        position={[0, 0.9, 0]}
        rotation={[0, Math.PI / 4, 0]}
        scale={1.1}
        springOffset={0.5}
      />

      {/* 1. Butter Tag (front & center) */}
      <Charm
        url="/models/keychain/butter_tag.glb"
        position={[-0.2, 0.1, 0.4]}
        rotation={[-0.17, -0.17, 0.1]}
        scale={1.2}
        springOffset={1.2}
      />

      {/* 2. B Tag */}
      <Charm
        url="/models/keychain/b_tag.glb"
        position={[-0.7, -0.2, 0.2]}
        rotation={[-0.7, -1.05, 0.2]}
        scale={1.1}
        springOffset={2.1}
      />

      {/* 3. Circle Tag (Frosted Glass / Transmission material) */}
      <Charm
        url="/models/keychain/circle_tag.glb"
        position={[0.5, 0.2, 0.3]}
        rotation={[0.35, 0.17, -0.1]}
        scale={1.15}
        isGlass={true}
        springOffset={3.0}
      />

      {/* 4. Gothic Tag */}
      <Charm
        url="/models/keychain/gothic_tag.glb"
        position={[-0.5, -0.7, -0.2]}
        rotation={[-0.7, -0.9, -0.2]}
        scale={1.05}
        springOffset={4.2}
      />

      {/* 5. Key charm hanging down */}
      <Charm
        url="/models/keychain/key.glb"
        position={[0.6, -0.8, -0.4]}
        rotation={[1.2, 1.4, 0.4]}
        scale={1.25}
        springOffset={5.1}
      />
    </group>
  )
}

export default function KeychainScene() {
  const [webglSupported, setWebglSupported] = useState(true)

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) setWebglSupported(false)
    } catch {
      setWebglSupported(false)
    }
  }, [])

  if (!webglSupported) {
    return (
      <div className="relative h-full w-full flex items-center justify-center">
        <img
          src="/images/embedded/keychain-with-butter-branded-charms-57a4.png"
          alt="Butter keychain"
          className="h-full w-full object-contain drop-shadow-[0_24px_34px_rgba(30,30,30,0.16)]"
        />
      </div>
    )
  }

  return (
    <div
      className="relative h-full w-full cursor-grab active:cursor-grabbing"
      style={{
        maskImage: 'linear-gradient(to bottom, black 72%, transparent 98%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 72%, transparent 98%)',
      }}
    >
      <Canvas
        camera={{ fov: 35, position: [0, 0, 8.5], near: 0.1, far: 500 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.8} />
          {/* Directional light matched to chunk 6955 */}
          <directionalLight
            position={[-29, -14.8, 35]}
            intensity={1.6}
            color="#ffffff"
          />
          <directionalLight
            position={[10, 15, 15]}
            intensity={2.2}
            color="#ffffff"
          />
          <Environment files="/images/hero/city.jpg" />
          <KeychainRig />
        </Suspense>
      </Canvas>
    </div>
  )
}

// Preload models for instant responsive rendering
useGLTF.preload('/models/keychain/carabiner.glb', '/draco/')
useGLTF.preload('/models/keychain/chain_link.glb', '/draco/')
useGLTF.preload('/models/keychain/butter_tag.glb', '/draco/')
useGLTF.preload('/models/keychain/b_tag.glb', '/draco/')
useGLTF.preload('/models/keychain/circle_tag.glb', '/draco/')
useGLTF.preload('/models/keychain/gothic_tag.glb', '/draco/')
useGLTF.preload('/models/keychain/key.glb', '/draco/')
