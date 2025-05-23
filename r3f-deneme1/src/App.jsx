import React, { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { Environment } from '@react-three/drei'
import { Vector3 } from 'three'
import './App.css'

// Global scroll state
let currentScrollProgress = 0

// Gelişmiş section konfigürasyonu
const sections = [
  {
    id: 1,
    title: "BYD ATTO 3",
    description: "Geleceğin elektrikli SUV'u. Çevreci teknoloji ve premium tasarımın mükemmel birleşimi.",
    icon: "🚗",
    color: "#3b82f6",
    carPosition: new Vector3(1.5, -1.2, -1.5),
    carRotation: 0,
    carRotationX: 0,
    carScale: 2
  },
  {
    id: 2,
    title: "Aerodinamik Jantlar",
    description: "18'' alüminyum alaşım jantlar. 235/55 R18 premium lastikler ile mükemmel yol tutuş.",
    icon: "⚡",
    color: "#ef4444",
    carPosition: new Vector3(5, -0.8, -2),
    carRotation: -Math.PI / 2,
    carRotationX: 0,
    carScale: 3.2
  },
  {
    id: 3,
    title: "Bagaj Hacmi", 
    description: "400 litre bagaj hacmi. 1000 litre toplam bagaj hacmi. 1000 litre toplam bagaj hacmi.",
    icon: "⚙️",
    color: "#f59e0b",
    carPosition: new Vector3(1.6, -1, -1),
    carRotation: Math.PI,
    carRotationX: 0,
    carScale: 2
  },
  {
    id: 4,
    title: "Batarya Teknolojisi",
    description: "60.5 kWh LFP batarya. AC 11kW & DC 70kW hızlı şarj. 8 yıl garanti ile güvenli.",
    icon: "🔋",
    color: "#10b981",
    carPosition: new Vector3(2, -0.5, -1),
    carRotation: 0,
    carRotationX: -Math.PI / 2, // -90° X ekseni - TABAN görünümü!
    carScale: 2.5
  }
]

// Easing functions - Daha smooth
const easeInOutCubic = (t) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// Daha gelişmiş easing - çok smooth
const easeInOutQuart = (t) => {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2
}

// Araba modeli komponenti - Discrete scroll için optimize
function CarModel() {
  const carRef = useRef()
  
  useFrame((state) => {
    if (carRef.current) {
      // Current section config'i al
      const currentSection = sections[Math.floor(currentScrollProgress * (sections.length - 1))] || sections[0]
      const currentSectionIndex = Math.floor(currentScrollProgress * (sections.length - 1))
      
      // Direct assignment - No interpolation between sections anymore
      const targetPosition = currentSection.carPosition.clone()
      const targetRotationY = currentSection.carRotation
      const targetRotationX = currentSection.carRotationX || 0
      const targetScale = currentSection.carScale
      
      // Özel yavaşlık faktörleri - Section 3↔4 arası ekstra yavaş
      const isSection3or4 = currentSectionIndex === 2 || currentSectionIndex === 3
      const basePositionSpeed = 0.01 // %50 daha yavaş (0.02 -> 0.01)
      const baseRotationSpeed = 0.015 // %50 daha yavaş (0.03 -> 0.015) 
      const baseScaleSpeed = 0.0125 // %50 daha yavaş (0.025 -> 0.0125)
      
      // Section 3↔4 arası ekstra yavaşlık
      const positionSpeed = isSection3or4 ? basePositionSpeed * 0.6 : basePositionSpeed // %40 daha yavaş
      const rotationSpeed = isSection3or4 ? baseRotationSpeed * 0.5 : baseRotationSpeed // %50 daha yavaş  
      const scaleSpeed = isSection3or4 ? baseScaleSpeed * 0.7 : baseScaleSpeed // %30 daha yavaş
      
      // Ultra slow smooth interpolation - Cinematic premium feel
      carRef.current.position.lerp(targetPosition, positionSpeed)
      
      // Y Rotation smooth assignment - Ekstra yavaş
      let currentCarRotationY = carRef.current.rotation.y
      let rotationDiffY = targetRotationY - currentCarRotationY
      
      // Normalize rotation difference for smooth transitions
      while (rotationDiffY > Math.PI) {
        rotationDiffY -= 2 * Math.PI
      }
      while (rotationDiffY < -Math.PI) {
        rotationDiffY += 2 * Math.PI
      }
      
      carRef.current.rotation.y = currentCarRotationY + rotationDiffY * rotationSpeed
      
      // X Rotation smooth assignment - Ekstra yavaş (özellikle Section 4 için önemli)
      let currentCarRotationX = carRef.current.rotation.x
      let rotationDiffX = targetRotationX - currentCarRotationX
      
      carRef.current.rotation.x = currentCarRotationX + rotationDiffX * rotationSpeed
      
      // Scale smooth assignment - Ekstra yavaş
      const currentScale = carRef.current.scale.x
      carRef.current.scale.setScalar(currentScale + (targetScale * 0.01 - currentScale) * scaleSpeed)
      
      // Floating animation - Section 4'te kapalı
      if (currentSectionIndex !== 3) { // Section 4 değilse floating yap
        carRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.6) * 0.005
      }
    }
  })
  
  try {
    const fbx = useLoader(FBXLoader, "./BYD.FBX")
    
    return (
      <primitive 
        ref={carRef} 
        object={fbx} 
        scale={0.012} 
        position={[0, 0, 0]}
      />
    )
  } catch (error) {
    console.error("Araba modeli yüklenemedi:", error)
    return <LoadingFallback />
  }
}

// Yükleme fallback - İyileştirilmiş
function LoadingFallback() {
  const cubeRef = useRef()
  
  useFrame((state) => {
    if (cubeRef.current) {
      cubeRef.current.rotation.x = state.clock.elapsedTime
      cubeRef.current.rotation.y = state.clock.elapsedTime * 0.5
      cubeRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1)
    }
  })
  
  return (
    <group>
      <mesh ref={cubeRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#3b82f6" wireframe />
      </mesh>
    </group>
  )
}

// Showroom Arka Planı - Araba Galerisi
function ShowroomBackground() {
  const floorsRef = useRef()
  
  useFrame((state) => {
    if (floorsRef.current) {
      // Çok hafif rotation efekti
      floorsRef.current.rotation.y += 0.0002
    }
  })
  
  return (
    <group ref={floorsRef}>
      {/* Ana zemin - Parlak showroom zeminı */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={1}
        />
      </mesh>
      
      {/* Arka duvar */}
      <mesh position={[0, 8, -20]}>
        <planeGeometry args={[100, 20]} />
        <meshStandardMaterial 
          color="#2a2a2a" 
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      
      {/* Sol duvar */}
      <mesh position={[-20, 8, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial 
          color="#252525" 
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>
      
      {/* Sağ duvar */}
      <mesh position={[20, 8, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial 
          color="#252525" 
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>
      
      {/* Tavan */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 18, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#1f1f1f" 
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>
      
      {/* Showroom spot ışıkları simülasyonu */}
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[
          (i % 3 - 1) * 15, 
          17, 
          Math.floor(i / 3) * 15 - 7.5
        ]}>
          <cylinderGeometry args={[0.5, 0.8, 0.2, 8]} />
          <meshBasicMaterial 
            color="#ffffff"
            transparent={true}
            opacity={0.1}
          />
        </mesh>
      ))}
      
      {/* Ambient showroom detayları */}
      <mesh position={[-15, -1.8, -15]}>
        <boxGeometry args={[2, 0.4, 2]} />
        <meshStandardMaterial 
          color="#333333" 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      <mesh position={[15, -1.8, -15]}>
        <boxGeometry args={[2, 0.4, 2]} />
        <meshStandardMaterial 
          color="#333333" 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  )
}

// Navigation butonları
function NavigationButtons({ currentSection, onSectionChange }) {
  const canGoUp = currentSection > 0
  const canGoDown = currentSection < sections.length - 1
  
  return (
    <div style={{
      position: 'fixed',
      right: '30px',
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      zIndex: 1000
    }}>
      {/* Previous Button */}
      <button
        onClick={() => canGoUp && onSectionChange(currentSection - 1)}
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: 'none',
          background: canGoUp
            ? `linear-gradient(135deg, ${sections[currentSection]?.color}80, rgba(255, 255, 255, 0.3))`
            : 'rgba(255, 255, 255, 0.1)',
          color: canGoUp ? 'white' : 'rgba(255, 255, 255, 0.3)',
          cursor: canGoUp ? 'pointer' : 'not-allowed',
          backdropFilter: 'blur(20px)',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          boxShadow: canGoUp ? '0 6px 20px rgba(0, 0, 0, 0.2)' : 'none'
        }}
      >
        ⬆️
      </button>
      
      {/* Section Indicators */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '15px 0' }}>
        {sections.map((section, index) => (
          <div
            key={index}
            onClick={() => onSectionChange(index)}
            style={{
              width: index === currentSection ? '16px' : '10px',
              height: index === currentSection ? '16px' : '10px',
              borderRadius: '50%',
              backgroundColor: index === currentSection ? section.color : 'rgba(255,255,255,0.4)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              margin: '0 auto',
              boxShadow: index === currentSection ? `0 0 15px ${section.color}60` : 'none',
              border: index === currentSection ? '2px solid white' : 'none'
            }}
          />
        ))}
      </div>
      
      {/* Next Button */}
      <button
        onClick={() => canGoDown && onSectionChange(currentSection + 1)}
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: 'none',
          background: canGoDown
            ? `linear-gradient(135deg, ${sections[currentSection]?.color}80, rgba(255, 255, 255, 0.3))`
            : 'rgba(255, 255, 255, 0.1)',
          color: canGoDown ? 'white' : 'rgba(255, 255, 255, 0.3)',
          cursor: canGoDown ? 'pointer' : 'not-allowed',
          backdropFilter: 'blur(20px)',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          boxShadow: canGoDown ? '0 6px 20px rgba(0, 0, 0, 0.2)' : 'none'
        }}
      >
        ⬇️
      </button>
    </div>
  )
}

// Basit ve Çalışır Section Kartı - Soldan gelme efekti
function SectionCard({ section, isVisible }) {
  if (!section) return null
  
  const isMobileView = window.innerWidth < 768
  
  return (
    <div style={{
      position: 'fixed',
      left: isMobileView ? '20px' : '50px',
      right: isMobileView ? '20px' : 'auto',
      top: isMobileView ? 'auto' : '50%',
      bottom: isMobileView ? '20px' : 'auto',
      background: 'rgba(0, 0, 0, 0.9)',
      padding: isMobileView ? '20px' : '25px',
      borderRadius: '15px',
      backdropFilter: 'blur(20px)',
      border: `2px solid ${section.color}`,
      maxWidth: isMobileView ? 'none' : '320px',
      minWidth: isMobileView ? 'none' : '300px',
      width: isMobileView ? 'calc(100vw - 40px)' : 'auto',
      // Basit soldan gelme animasyonu
      transform: isVisible 
        ? (isMobileView ? 'translateY(0)' : 'translateY(-50%) translateX(0)')
        : (isMobileView ? 'translateY(50px)' : 'translateY(-50%) translateX(-300px)'),
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
      zIndex: 1000,
      boxShadow: isVisible 
        ? `0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px ${section.color}40`
        : `0 10px 20px rgba(0, 0, 0, 0.3)`,
      // Glow efekti
      filter: isVisible ? `drop-shadow(0 0 25px ${section.color}60)` : 'none'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '20px'
      }}>
        <span style={{
          fontSize: isMobileView ? '28px' : '32px',
          marginRight: '15px',
          transform: isVisible ? 'scale(1) rotate(0deg)' : 'scale(0.8) rotate(-15deg)',
          transition: 'transform 0.6s ease'
        }}>
          {section.icon}
        </span>
        <div>
          <h3 style={{ 
            margin: 0, 
            color: 'white',
            fontSize: isMobileView ? '18px' : '20px',
            fontWeight: '700',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'transform 0.7s ease'
          }}>
            {section.title}
          </h3>
        </div>
      </div>
      
      {/* Description */}
      <p style={{ 
        margin: 0, 
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: isMobileView ? '14px' : '15px',
        lineHeight: '1.6',
        marginBottom: '0',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        transform: isVisible ? 'translateY(0)' : 'translateY(25px)',
        transition: 'transform 0.8s ease'
      }}>
        {section.description}
      </p>
    </div>
  )
}

// Mobile-friendly scroll talimatı
function ScrollInstruction({ currentSection }) {
  if (currentSection !== 0) return null
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      color: 'rgba(255, 255, 255, 0.8)',
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '12px 20px',
      borderRadius: '25px',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      zIndex: 1000,
      fontSize: window.innerWidth < 768 ? '12px' : '14px',
      textAlign: 'center',
      animation: 'pulse 2s infinite'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
        <span>{window.innerWidth < 768 ? '📱' : '🖱️'}</span>
        <span>{window.innerWidth < 768 ? 'Kaydır veya butona bas' : 'Scroll wheel ile section değiştir'}</span>
      </div>
      {window.innerWidth >= 768 && (
        <div style={{ 
          fontSize: '11px', 
          marginTop: '5px', 
          opacity: 0.7 
        }}>
          ⌨️ Arrow keys, Space, PageUp/Down da kullanılabilir
        </div>
      )}
    </div>
  )
}

const App = () => {
  const [currentSection, setCurrentSection] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [cardVisible, setCardVisible] = useState(true) // Kart görünürlüğü için

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Soldan gelme efekti ile section geçiş fonksiyonu
  const goToSection = (targetSection) => {
    if (isTransitioning || targetSection < 0 || targetSection >= sections.length || targetSection === currentSection) {
      return
    }
    
    setIsTransitioning(true)
    
    // 1. Önce kartı gizle (solda -300px)
    setCardVisible(false)
    
    // 2. 100ms sonra section'ı değiştir
    setTimeout(() => {
      setCurrentSection(targetSection)
      
      // Progress'i güncelle
      const targetProgress = targetSection / (sections.length - 1)
      setScrollProgress(targetProgress)
      currentScrollProgress = targetProgress
    }, 100)
    
    // 3. 200ms sonra kartı göster (soldan 0px'a gelir)
    setTimeout(() => {
      setCardVisible(true)
    }, 200)
    
    // 4. Transition lock'ı kaldır
    setTimeout(() => {
      setIsTransitioning(false)
    }, 1200)
  }

  // Discrete scroll sistem
  useEffect(() => {
    let scrollTimeout = null
    
    const handleWheel = (e) => {
      if (isTransitioning) return
      
      // Prevent default scroll behavior
      e.preventDefault()
      
      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      
      // Debounce scroll events
      scrollTimeout = setTimeout(() => {
        const direction = e.deltaY > 0 ? 1 : -1 // Aşağı: +1, Yukarı: -1
        const targetSection = currentSection + direction
        
        goToSection(targetSection)
      }, 50) // 50ms debounce
    }
    
    const handleKeyDown = (e) => {
      if (isTransitioning) return
      
      switch(e.key) {
        case 'ArrowDown':
        case 'PageDown':
        case ' ': // Space
          e.preventDefault()
          goToSection(currentSection + 1)
          break
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault()
          goToSection(currentSection - 1)
          break
        case 'Home':
          e.preventDefault()
          goToSection(0)
          break
        case 'End':
          e.preventDefault()
          goToSection(sections.length - 1)
          break
      }
    }
    
    // Touch/Mobile swipe support
    let touchStartY = 0
    let touchEndY = 0
    
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY
    }
    
    const handleTouchEnd = (e) => {
      if (isTransitioning) return
      
      touchEndY = e.changedTouches[0].clientY
      const swipeDistance = touchStartY - touchEndY
      const minSwipeDistance = 50
      
      if (Math.abs(swipeDistance) > minSwipeDistance) {
        e.preventDefault()
        const direction = swipeDistance > 0 ? 1 : -1
        goToSection(currentSection + direction)
      }
    }

    // Event listeners
    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: false })
    
    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
      if (scrollTimeout) clearTimeout(scrollTimeout)
    }
  }, [currentSection, isTransitioning])

  return (
    <>
      {/* Three.js Canvas - Fixed position */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%' 
      }}>
        <Canvas 
          camera={{ 
            position: [0, 2, isMobile ? 10 : 8], 
            fov: isMobile ? 50 : 45 
          }}
          shadows
          gl={{ antialias: true }}
        >
          <color attach="background" args={["#151515"]} />
          
          {/* Profesyonel ışıklandırma */}
          <ambientLight intensity={1} />
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={1.8} 
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <directionalLight position={[-5, 5, -5]} intensity={0.8} />
          <directionalLight position={[0, 5, 5]} intensity={0.6} />
          <directionalLight position={[0, -3, 0]} intensity={0.4} />
          
          {/* Araba modeli */}
          <Suspense fallback={<LoadingFallback />}>
            <CarModel />
            <Environment preset="studio" />
          </Suspense>
          
          {/* Showroom Arka Planı */}
          <ShowroomBackground />
        </Canvas>
      </div>
      
      {/* Navigation Butonları */}
      <NavigationButtons 
        currentSection={currentSection}
        onSectionChange={goToSection}
      />
      
      {/* Section Kartı - Basit ve Çalışır */}
      <SectionCard 
        section={sections[currentSection]} 
        isVisible={cardVisible}
      />
      
      {/* Scroll Talimatı */}
      <ScrollInstruction currentSection={currentSection} />
    </>
  )
}

export default App