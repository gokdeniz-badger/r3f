import React, { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import './App.css'
import ShowroomEnvironment from './components/ShowroomEnvironment'
import CarModel from './components/CarModel'
import CameraController from './components/CameraController'

// Global scroll state
let currentScrollProgress = 0
const sections = [
  {
    id: 1,
    title: "BYD ATTO 3",
    description: "Geleceğin elektrikli SUV'u. Çevreci teknoloji ve premium tasarımın mükemmel birleşimi.",
    icon: "🚗",
    color: "#3b82f6",
    // Kamera pozisyonları - Önden bakış (daha yakın)
    cameraPosition: new Vector3(3.5, 0.5, 7),
    cameraTarget: new Vector3(0, -0.3, 2),
    cameraFov: 50
  },
  {
    id: 2,
    title: "Aerodinamik Jantlar",
    description: "18'' alüminyum alaşım jantlar. 235/55 R18 premium lastikler ile mükemmel yol tutuş.",
    icon: "⚡",
    color: "#ef4444",
    // Kamera pozisyonları - Yan taraftan jantlara odaklanma (daha yakın)
    cameraPosition: new Vector3(4, -1, 3.2),
    cameraTarget: new Vector3(-8, -1.5, 2),
    cameraFov: 55
  },
  {
    id: 3,
    title: "Bagaj Hacmi", 
    description: "400 litre bagaj hacmi. 1000 litre toplam bagaj hacmi. 1000 litre toplam bagaj hacmi.",
    icon: "⚙️",
    color: "#f59e0b",
    // Kamera pozisyonları - Arkadan bagaj görünümü (daha yakın)
    cameraPosition: new Vector3(3, 0, -7.5),
    cameraTarget: new Vector3(0, 0, 0),
    cameraFov: 52
  },
  {
    id: 4,
    title: "Batarya Teknolojisi",
    description: "60.5 kWh LFP batarya. AC 11kW & DC 70kW hızlı şarj. 8 yıl garanti ile güvenli.",
    icon: "🔋",
    color: "#10b981",
    // Kamera pozisyonları - Alttan/çapraz batarya görünümü (daha yakın)
    cameraPosition: new Vector3(1, 5.8, -1.5),
    cameraTarget: new Vector3(-4,-30,-1.4),
    cameraFov: 60
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

// ScrollInstruction component
function ScrollInstruction({ currentSection }) {
  const [isVisible, setIsVisible] = useState(true)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 4000)
    
    return () => clearTimeout(timer)
  }, [])
  
  if (!isVisible || currentSection !== 0) return null
  
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center animate-bounce z-30">
      <div className="bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
        <p className="text-sm">↕️ Scroll yapın veya ↑↓ tuşları kullanın</p>
      </div>
    </div>
  )
}

// Alt Navigation Butonları - INLINE STYLE
function BottomNavigation({ currentSection, sections, onSectionChange }) {
  const canGoLeft = currentSection > 0
  const canGoRight = currentSection < sections.length - 1

  return (
    <div style={{
      position: 'fixed',
      bottom: '32px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(16px)',
        borderRadius: '50px',
        padding: '16px 32px',
        border: '2px solid rgba(255,255,255,0.3)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        
        {/* Sol Buton */}
        <button
          onClick={() => canGoLeft && onSectionChange(currentSection - 1)}
          disabled={!canGoLeft}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '2px solid',
            borderColor: canGoLeft ? '#3b82f6' : 'rgba(128,128,128,0.5)',
            backgroundColor: canGoLeft ? 'rgba(59, 130, 246, 0.9)' : 'rgba(128,128,128,0.3)',
            cursor: canGoLeft ? 'pointer' : 'not-allowed',
            opacity: canGoLeft ? 1 : 0.5,
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'white'
          }}
        >
          ←
        </button>

        {/* Section Göstergeleri */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => onSectionChange(index)}
              style={{
                width: index === currentSection ? '56px' : '40px',
                height: index === currentSection ? '56px' : '40px',
                borderRadius: '50%',
                border: '2px solid',
                borderColor: index === currentSection ? 'white' : 'rgba(255,255,255,0.5)',
                backgroundColor: index === currentSection ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.25)',
                color: index === currentSection ? '#1f2937' : 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: index === currentSection ? '20px' : '16px',
                fontWeight: 'bold',
                transform: 'scale(1)',
                boxShadow: index === currentSection ? '0 4px 12px rgba(255,255,255,0.3)' : 'none'
              }}
            >
              {section.icon}
            </button>
          ))}
        </div>

        {/* Sağ Buton */}
        <button
          onClick={() => canGoRight && onSectionChange(currentSection + 1)}
          disabled={!canGoRight}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '2px solid',
            borderColor: canGoRight ? '#3b82f6' : 'rgba(128,128,128,0.5)',
            backgroundColor: canGoRight ? 'rgba(59, 130, 246, 0.9)' : 'rgba(128,128,128,0.3)',
            cursor: canGoRight ? 'pointer' : 'not-allowed',
            opacity: canGoRight ? 1 : 0.5,
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'white'
          }}
        >
          →
        </button>
        
      </div>
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
    <div className="w-full h-screen relative overflow-hidden" style={{ pointerEvents: 'auto' }}>
      <Canvas 
        camera={{ 
          position: [0, 0.5, 4],
          fov: 50,
          near: 0.1, 
          far: 1000 
        }}
        shadows
        style={{ pointerEvents: 'auto' }}
      >
        <CameraController currentSection={currentSection} sections={sections} />
        <ShowroomEnvironment />
        <CarModel currentSection={currentSection} sections={sections} />
      </Canvas>
      
      {/* Section Kartı - Basit ve Çalışır */}
      <SectionCard 
        section={sections[currentSection]} 
        isVisible={cardVisible}
      />
      
      {/* Scroll Talimatı */}
      <ScrollInstruction currentSection={currentSection} />
      
      {/* Alt Navigation Butonları - Sol/Sağ + Section Göstergeleri */}
      <BottomNavigation 
        currentSection={currentSection}
        sections={sections}
        onSectionChange={goToSection}
      />
    </div>
  )
}

export default App