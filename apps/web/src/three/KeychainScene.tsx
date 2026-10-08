import { useRef, useMemo, Suspense, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'

type CharmProps = {
  url: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale?: number
  charmType?: 'carabiner' | 'butter' | 'circle' | 'gothic' | 'b_tag' | 'key' | 'chain'
  springOffset?: number
}

function Charm({
  url,
  position,
  rotation,
  scale = 1,
  charmType,
  springOffset = 0,
}: CharmProps) {
  const { scene } = useGLTF(url, '/draco/')
  const charmRef = useRef<THREE.Group>(null)
  const initialRot = useMemo(() => new THREE.Euler(...rotation), [rotation])

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        const matName = (mesh.material as THREE.Material)?.name?.toLowerCase() || ''

        // Apply authentic materials matching original chunk 6955 & live site
        if (charmType === 'butter') {
          // Candy lime-green Butter cursive charm
          mesh.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#52C42B'),
            metalness: 0.15,
            roughness: 0.22,
            envMapIntensity: 1.3,
          })
        } else if (charmType === 'circle') {
          // Hot magenta / pink disc charm
          mesh.material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#DE1B85'),
            metalness: 0.45,
            roughness: 0.18,
            clearcoat: 0.5,
            clearcoatRoughness: 0.1,
            envMapIntensity: 1.4,
          })
        } else if (charmType === 'carabiner') {
          if (matName.includes('gate')) {
            // Silver gate
            mesh.material = new THREE.MeshStandardMaterial({
              color: new THREE.Color('#E0E0E0'),
              metalness: 0.95,
              roughness: 0.15,
              envMapIntensity: 1.2,
            })
          } else {
            // Rich anodized orange body
            mesh.material = new THREE.MeshStandardMaterial({
              color: new THREE.Color('#C7541B'),
              metalness: 0.85,
              roughness: 0.22,
              envMapIntensity: 1.2,
            })
          }
        } else if (charmType === 'b_tag') {
          if (matName.includes('block')) {
            // Matte black retro block
            mesh.material = new THREE.MeshStandardMaterial({
              color: new THREE.Color('#141414'),
              metalness: 0.08,
              roughness: 0.45,
              envMapIntensity: 0.8,
            })
          } else {
            // Silver chrome "B" letter & loop
            mesh.material = new THREE.MeshStandardMaterial({
              color: new THREE.Color('#E8E8E8'),
              metalness: 0.95,
              roughness: 0.12,
              envMapIntensity: 1.3,
            })
          }
        } else if (charmType === 'gothic') {
          // Mirror chrome gothic "B"
          mesh.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#F0F0F0'),
            metalness: 1.0,
            roughness: 0.06,
            envMapIntensity: 1.8,
          })
        } else if (charmType === 'key') {
          // Polished silver key
          mesh.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#D8D8D8'),
            metalness: 0.95,
            roughness: 0.15,
            envMapIntensity: 1.3,
          })
        } else {
          // Chain & rings
          mesh.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#E0E0E0'),
            metalness: 0.95,
            roughness: 0.12,
            envMapIntensity: 1.2,
          })
        }

        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })
    return clone
  }, [scene, charmType])

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

  return (
    <group ref={groupRef} position={[0, -0.1, 0]}>
      {/* Carabiner / Main Ring at the top left */}
      <Charm
        url="/models/keychain/carabiner.glb"
        charmType="carabiner"
        position={[-0.85, 1.45, -0.15]}
        rotation={[0.2, 0.3, -0.65]}
        scale={1.25}
        springOffset={0}
      />

      {/* Chain Link connecting */}
      <Charm
        url="/models/keychain/chain_link.glb"
        charmType="chain"
        position={[0, 1.25, 0]}
        rotation={[0, Math.PI / 4, 0]}
        scale={1.1}
        springOffset={0.5}
      />

      {/* 1. Black B Tag (left side) */}
      <Charm
        url="/models/keychain/b_tag.glb"
        charmType="b_tag"
        position={[-0.75, -0.15, 0.2]}
        rotation={[-0.3, -0.5, 0.2]}
        scale={1.12}
        springOffset={2.1}
      />

      {/* 2. Gothic Tag (shiny chrome B, front & center) */}
      <Charm
        url="/models/keychain/gothic_tag.glb"
        charmType="gothic"
        position={[-0.15, 0.05, 0.45]}
        rotation={[-0.15, -0.2, 0.1]}
        scale={1.2}
        springOffset={1.2}
      />

      {/* 3. Magenta Circle Tag (middle-right) */}
      <Charm
        url="/models/keychain/circle_tag.glb"
        charmType="circle"
        position={[0.32, -0.32, 0.3]}
        rotation={[0.25, 0.2, -0.15]}
        scale={1.18}
        springOffset={3.0}
      />

      {/* 4. Silver Key charm (right side) */}
      <Charm
        url="/models/keychain/key.glb"
        charmType="key"
        position={[0.65, -0.15, 0.1]}
        rotation={[0.4, 0.6, -0.2]}
        scale={1.28}
        springOffset={5.1}
      />

      {/* 5. Bright green Butter cursive tag (far right) */}
      <Charm
        url="/models/keychain/butter_tag.glb"
        charmType="butter"
        position={[1.15, 0.2, 0.35]}
        rotation={[-0.2, -0.4, 0.35]}
        scale={1.3}
        springOffset={4.2}
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
        maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
      }}
    >
      <Canvas
        camera={{ fov: 35, position: [0, 0, 7.5], near: 0.1, far: 500 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.9} />
          {/* Directional light matched to chunk 6955 */}
          <directionalLight
            position={[-29, -14.8, 35]}
            intensity={1.8}
            color="#ffffff"
          />
          <directionalLight
            position={[10, 15, 15]}
            intensity={2.4}
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
