import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'

// Smooth easing function - yavaş başla, yavaş bitir
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

const CameraController = ({ currentSection, sections }) => {
  const { camera, gl } = useThree()
  const targetPosition = useRef(new Vector3())
  const targetLookAt = useRef(new Vector3())
  const targetFov = useRef(45)
  const animationProgress = useRef(0)
  const lastSection = useRef(currentSection)
  
  // Smooth camera interpolation - EASED
  useFrame(() => {
    if (!sections[currentSection]) return
    
    const currentSectionData = sections[currentSection]
    
    // Section değişti mi kontrol et
    if (lastSection.current !== currentSection) {
      animationProgress.current = 0
      lastSection.current = currentSection
    }
    
    // Target values
    targetPosition.current.copy(currentSectionData.cameraPosition)
    targetLookAt.current.copy(currentSectionData.cameraTarget)
    targetFov.current = currentSectionData.cameraFov
    
    // Animation progress artır
    if (animationProgress.current < 1) {
      animationProgress.current += 0.012 // Yavaş progress artışı
    }
    
    // Eased lerp değeri hesapla
    const easedProgress = easeInOutCubic(animationProgress.current)
    const smoothSpeed = 0.05 * easedProgress // Eased speed
    
    // SMOOTH kamera position lerp 
    camera.position.lerp(targetPosition.current, smoothSpeed)
    
    // SMOOTH camera look-at
    const currentTarget = new Vector3()
    camera.getWorldDirection(currentTarget)
    currentTarget.add(camera.position)
    currentTarget.lerp(targetLookAt.current, smoothSpeed * 0.8) // Biraz daha yavaş look-at
    camera.lookAt(currentTarget)
    
    // SMOOTH FOV transition
    camera.fov += (targetFov.current - camera.fov) * (smoothSpeed * 0.6) // Daha yavaş FOV
    camera.updateProjectionMatrix()
  })

  return null
}

export default CameraController 