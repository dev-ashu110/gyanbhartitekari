import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export const MouseFollower = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  const cursorX = useSpring(0, { stiffness: 400, damping: 25 });
  const cursorY = useSpring(0, { stiffness: 400, damping: 25 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      
      // Detect if hovering over interactive elements
      const target = e.target as HTMLElement;
      const isInteractive = target.tagName === 'A' || 
                           target.tagName === 'BUTTON' ||
                           target.closest('a') !== null ||
                           target.closest('button') !== null;
      setIsHovering(isInteractive);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      {/* Main cursor glow with liquid effect */}
      <motion.div
        className="pointer-events-none fixed z-50 hidden lg:block"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          className="w-8 h-8 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
            filter: 'blur(12px)',
            willChange: 'transform, opacity',
          }}
          animate={
            isVisible
              ? isHovering
                ? { scale: [1.5, 1.8, 1.5], opacity: [0.5, 0.7, 0.5] }
                : { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }
              : { scale: 0, opacity: 0 }
          }
          transition={{ duration: isHovering ? 1 : 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Glass reflection layer */}
      <motion.div
        className="pointer-events-none fixed z-50 hidden lg:block"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          className="w-24 h-24 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 60%)',
            filter: 'blur(20px)',
            mixBlendMode: 'overlay',
            willChange: 'transform, opacity',
          }}
          animate={isVisible ? { scale: [1, 1.3, 1], opacity: [0.2, 0.3, 0.2] } : { scale: 0, opacity: 0 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Secondary cursor ring with liquid expansion */}
      <motion.div
        className="pointer-events-none fixed z-50 hidden lg:block"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          className="w-12 h-12 rounded-full border border-primary/30"
          style={{ willChange: 'transform, opacity' }}
          animate={
            isVisible
              ? isHovering
                ? { scale: [1.2, 2, 1.2], opacity: [0.6, 0, 0.6] }
                : { scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }
              : { scale: 0, opacity: 0 }
          }
          transition={{ duration: isHovering ? 1 : 1.5, repeat: Infinity, ease: 'easeOut' }}
        />
      </motion.div>
    </>
  );
};
