import React, { useRef, useEffect, Suspense } from 'react'
import { useLoader } from '@react-three/fiber'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

// Loading fallback
function CarLoadingFallback() {
  const cubeRef = useRef()
  
  return (
    <mesh ref={cubeRef} position={[0, -2.2, 0]}>
      <boxGeometry args={[2, 1, 4]} />
      <meshStandardMaterial color="#3b82f6" wireframe />
    </mesh>
  )
}

// FBX Car Component
function FBXCar() {
  const fbx = useLoader(FBXLoader, '/BYD.FBX')
  const groupRef = useRef()

  // FBX dosyasını optimize etme - HDRI için enhanced
  useEffect(() => {
    if (fbx) {
      fbx.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          if (child.material) {
            // HDRI reflections için optimize material settings
            child.material.metalness = 0.8  // Daha metalik
            child.material.roughness = 0.2  // Daha parlak - HDRI yansımaları için
            child.material.envMapIntensity = 2.0 // HDRI environment map güçlü
            child.material.needsUpdate = true
          }
        }
      })
      
      // Scale'i doğru şekilde ayarla
      fbx.scale.setScalar(0.018)
    }
  }, [fbx])

  return (
    <group ref={groupRef}>
      <primitive 
        object={fbx} 
        position={[0, -2.0, 0]}  
        rotation={[0, 0, 0]}
      />
    </group>
  )
}

const CarModel = ({ currentSection, sections }) => {
  return (
    <Suspense fallback={<CarLoadingFallback />}>
      <FBXCar />
    </Suspense>
  )
}

export default CarModel 