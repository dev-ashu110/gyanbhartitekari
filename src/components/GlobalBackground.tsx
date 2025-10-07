import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring, useScroll } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface GradientBlob {
  color: string;
  size: number;
  initialX: string;
  initialY: string;
}

const sectionColors: Record<string, GradientBlob[]> = {
  '/': [
    { color: 'rgba(59, 130, 246, 0.4)', size: 600, initialX: '10%', initialY: '20%' },
    { color: 'rgba(139, 92, 246, 0.4)', size: 500, initialX: '60%', initialY: '50%' },
    { color: 'rgba(236, 72, 153, 0.3)', size: 400, initialX: '30%', initialY: '70%' },
  ],
  '/about': [
    { color: 'rgba(34, 197, 94, 0.4)', size: 550, initialX: '15%', initialY: '25%' },
    { color: 'rgba(59, 130, 246, 0.4)', size: 500, initialX: '70%', initialY: '45%' },
    { color: 'rgba(168, 85, 247, 0.3)', size: 450, initialX: '40%', initialY: '75%' },
  ],
  '/academics': [
    { color: 'rgba(249, 115, 22, 0.4)', size: 580, initialX: '20%', initialY: '15%' },
    { color: 'rgba(59, 130, 246, 0.4)', size: 520, initialX: '65%', initialY: '55%' },
    { color: 'rgba(236, 72, 153, 0.3)', size: 420, initialX: '35%', initialY: '80%' },
  ],
  '/contact': [
    { color: 'rgba(14, 165, 233, 0.4)', size: 560, initialX: '25%', initialY: '30%' },
    { color: 'rgba(168, 85, 247, 0.4)', size: 490, initialX: '60%', initialY: '40%' },
    { color: 'rgba(34, 197, 94, 0.3)', size: 440, initialX: '45%', initialY: '70%' },
  ],
  '/admissions': [
    { color: 'rgba(139, 92, 246, 0.4)', size: 590, initialX: '12%', initialY: '22%' },
    { color: 'rgba(236, 72, 153, 0.4)', size: 510, initialX: '68%', initialY: '48%' },
    { color: 'rgba(59, 130, 246, 0.3)', size: 430, initialX: '38%', initialY: '78%' },
  ],
  default: [
    { color: 'rgba(59, 130, 246, 0.4)', size: 600, initialX: '10%', initialY: '20%' },
    { color: 'rgba(139, 92, 246, 0.4)', size: 500, initialX: '60%', initialY: '50%' },
    { color: 'rgba(236, 72, 153, 0.3)', size: 400, initialX: '30%', initialY: '70%' },
  ],
};

export default function GlobalBackground() {
  const location = useLocation();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const { scrollYProgress } = useScroll();
  const [hoverPositions, setHoverPositions] = useState<Array<{ x: number; y: number; active: boolean }>>([]);
  
  // Get current path colors or default
  const currentBlobs = sectionColors[location.pathname] || sectionColors.default;
  
  // Mouse-based transforms with different intensities for each blob
  const createTransforms = (multiplier: number) => {
    const x = useTransform(
      mouseX,
      [0, typeof window !== 'undefined' ? window.innerWidth : 1920],
      [-100 * multiplier, 100 * multiplier]
    );
    const y = useTransform(
      mouseY,
      [0, typeof window !== 'undefined' ? window.innerHeight : 1080],
      [-100 * multiplier, 100 * multiplier]
    );
    
    return {
      springX: useSpring(x, { stiffness: 50, damping: 30 }),
      springY: useSpring(y, { stiffness: 50, damping: 30 }),
    };
  };

  const blob1 = createTransforms(1);
  const blob2 = createTransforms(0.5);
  const blob3 = createTransforms(0.7);
  
  // Scroll-based transforms
  const scrollY1 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const scrollY2 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const scrollY3 = useTransform(scrollYProgress, [0, 1], [0, -150]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      
      // Create liquid ripple effect at cursor position
      setHoverPositions(prev => [
        ...prev.slice(-2), // Keep only last 2 positions for performance
        { x: e.clientX, y: e.clientY, active: true }
      ]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);
  
  // Fade out hover positions
  useEffect(() => {
    if (hoverPositions.length > 0) {
      const timer = setTimeout(() => {
        setHoverPositions(prev => prev.map(pos => ({ ...pos, active: false })));
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [hoverPositions]);

  const transforms = [
    { ...blob1, scrollY: scrollY1 },
    { ...blob2, scrollY: scrollY2 },
    { ...blob3, scrollY: scrollY3 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {currentBlobs.map((blob, index) => {
        const transform = transforms[index];
        return (
          <motion.div
            key={`${location.pathname}-${index}`}
            className="absolute rounded-full"
            style={{
              width: blob.size,
              height: blob.size,
              background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
              filter: 'blur(80px)',
              x: transform.springX,
              y: transform.springY,
              translateY: transform.scrollY,
              left: blob.initialX,
              top: blob.initialY,
              willChange: 'transform',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8 + index * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.5,
            }}
          />
        );
      })}
      
      {/* Interactive liquid hover effects */}
      {hoverPositions.map((pos, idx) => (
        <motion.div
          key={`hover-${idx}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: pos.x,
            top: pos.y,
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
            transform: 'translate(-50%, -50%)',
            willChange: 'opacity, transform',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: pos.active ? [0, 1.5, 1.2] : [1.2, 0],
            opacity: pos.active ? [0, 0.4, 0.2] : [0.2, 0],
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
      
      {/* Multi-layered glass reflections */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle 800px at ${mouseX.get()}px ${mouseY.get()}px, rgba(255, 255, 255, 0.08) 0%, transparent 60%)`,
          mixBlendMode: 'overlay',
          willChange: 'background',
        }}
      />
      
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle 400px at ${mouseX.get()}px ${mouseY.get()}px, rgba(59, 130, 246, 0.06) 0%, transparent 70%)`,
          mixBlendMode: 'screen',
          willChange: 'background',
        }}
      />
      
      {/* Subtle gradient shift on scroll */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(139, 92, 246, 0.03) 50%, transparent 100%)',
          opacity: scrollYProgress,
          willChange: 'opacity',
        }}
      />
    </div>
  );
}
