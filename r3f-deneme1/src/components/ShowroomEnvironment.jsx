import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
// import { Environment } from '@react-three/drei' // Environment sorunu var, kaldırıyoruz

const ShowroomEnvironment = () => {
  const floorsRef = useRef()
  
  // TEXTURE LOADING
  const [highwayTexture, brickTexture] = useTexture([
    '/src/assets/highway-lanes_albedo.png',
    '/src/assets/white-brick-wall_albedo.png.png'
  ])
  
  // TEXTURE TILING SETUP
  React.useEffect(() => {
    // Highway texture - ORİJİNAL (tiling yok)
    highwayTexture.wrapS = THREE.ClampToEdgeWrapping
    highwayTexture.wrapT = THREE.ClampToEdgeWrapping
    highwayTexture.repeat.set(1, 1) // Tek resim
    
    // Brick texture - ORİJİNAL (tiling yok)
    brickTexture.wrapS = THREE.ClampToEdgeWrapping
    brickTexture.wrapT = THREE.ClampToEdgeWrapping
    brickTexture.repeat.set(1, 1) // Tek resim
  }, [highwayTexture, brickTexture])
  
  useFrame((state) => {
    if (floorsRef.current) {
      // Çok hafif rotation efekti
      floorsRef.current.rotation.y += 0.0002
    }
  })
  
  return (
    <group>
      {/* HIGHWAY TEXTURE ZEMİNLER - 3 PARÇA */}
      {/* Arka highway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, -40]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial 
          map={highwayTexture}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
      
      {/* Merkez highway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial 
          map={highwayTexture}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
      
      {/* Ön highway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 40]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial 
          map={highwayTexture}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
      
      {/* 4 DUVAR SİSTEMİ - WHITE BRICK - MEGA TALL */}
      {/* Arka duvar */}
      <mesh position={[0, 7.5, -60]}>
        <planeGeometry args={[60, 35]} />
        <meshStandardMaterial 
          map={brickTexture}
          metalness={0.0}
          roughness={0.9}
        />
      </mesh>
      
      {/* Ön duvar */}
      <mesh position={[0, 7.5, 60]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[60, 35]} />
        <meshStandardMaterial 
          map={brickTexture}
          metalness={0.0}
          roughness={0.9}
        />
      </mesh>
      
      {/* Sol duvar */}
      <mesh position={[-30, 7.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[120, 35]} />
        <meshStandardMaterial 
          map={brickTexture}
          metalness={0.0}
          roughness={0.9}
        />
      </mesh>
      
      {/* Sağ duvar */}
      <mesh position={[30, 7.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[120, 35]} />
        <meshStandardMaterial 
          map={brickTexture}
          metalness={0.0}
          roughness={0.9}
        />
      </mesh>
      
      {/* TAVAN - BEYAZ */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 16, 0]}>
        <planeGeometry args={[60, 120]} />
        <meshStandardMaterial 
          color="#f5f5f5"
          metalness={0.0}
          roughness={0.9}
        />
      </mesh>
      
      {/* MANUAL LIGHTING SYSTEM */}
      <ambientLight intensity={0.8} color="#ffffff" />
      
      {/* Ana spot ışıklar */}
      <directionalLight 
        position={[10, 15, 10]} 
        intensity={3.0} 
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Karşı açıdan dolgu ışığı */}
      <directionalLight 
        position={[-8, 10, -8]} 
        intensity={1.5} 
        color="#f0f8ff"
      />
      
      {/* Spot light gallery efekti */}
      {[...Array(4)].map((_, i) => {
        const x = ((i % 2) - 0.5) * 20
        const z = (Math.floor(i / 2) - 0.5) * 20
        return (
          <pointLight 
            key={i}
            position={[x, 12, z]} 
            intensity={2.0} 
            color="#ffffff"
            distance={25}
            decay={2}
          />
        )
      })}
    </group>
  )
}

export default ShowroomEnvironment 