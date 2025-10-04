import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export const MouseFollower = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  const cursorX = useSpring(0, { stiffness: 500, damping: 28 });
  const cursorY = useSpring(0, { stiffness: 500, damping: 28 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
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
      {/* Main cursor glow */}
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
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
            filter: 'blur(8px)',
          }}
          animate={isVisible ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : { scale: 0, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Secondary cursor ring */}
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
          animate={isVisible ? { scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] } : { scale: 0, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
        />
      </motion.div>
    </>
  );
};
