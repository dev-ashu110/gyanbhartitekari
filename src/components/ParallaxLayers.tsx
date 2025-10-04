import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const ParallaxLayers = () => {
  const { scrollY } = useScroll();
  const [blurIntensity, setBlurIntensity] = useState<'low' | 'medium' | 'high'>('high');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Load blur intensity preference
  useEffect(() => {
    const saved = localStorage.getItem('blurIntensity') as 'low' | 'medium' | 'high' | null;
    if (saved) setBlurIntensity(saved);

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Listen for blur intensity changes
  useEffect(() => {
    const handleBlurChange = (e: CustomEvent<'low' | 'medium' | 'high'>) => {
      setBlurIntensity(e.detail);
    };
    window.addEventListener('blurIntensityChange', handleBlurChange as EventListener);
    return () => window.removeEventListener('blurIntensityChange', handleBlurChange as EventListener);
  }, []);

  // Parallax transforms with different speeds
  const layer1Y = useTransform(scrollY, [0, 1000], [0, prefersReducedMotion ? 0 : 150]);
  const layer2Y = useTransform(scrollY, [0, 1000], [0, prefersReducedMotion ? 0 : 300]);
  const layer3Y = useTransform(scrollY, [0, 1000], [0, prefersReducedMotion ? 0 : 600]);

  const blurValues = {
    low: { blur1: '40px', blur2: '50px', blur3: '60px' },
    medium: { blur1: '72px', blur2: '100px', blur3: '120px' },
    high: { blur1: '100px', blur2: '120px', blur3: '140px' },
  };

  const blurs = blurValues[blurIntensity];

  return (
    <>
      {/* Layer 1 - Blue/Primary gradient */}
      <motion.div
        style={{ y: layer1Y }}
        className="parallax-layer parallax-layer-1"
        data-blur={blurs.blur1}
      >
        <div
          className="layer-gradient"
          style={{
            background: 'radial-gradient(circle at 20% 30%, hsl(var(--gradient-start) / 0.4) 0%, transparent 60%)',
            filter: `blur(${blurs.blur1})`,
          }}
        />
      </motion.div>

      {/* Layer 2 - Purple/Mid gradient */}
      <motion.div
        style={{ y: layer2Y }}
        className="parallax-layer parallax-layer-2"
        data-blur={blurs.blur2}
      >
        <div
          className="layer-gradient"
          style={{
            background: 'radial-gradient(circle at 80% 50%, hsl(var(--gradient-mid) / 0.35) 0%, transparent 60%)',
            filter: `blur(${blurs.blur2})`,
          }}
        />
      </motion.div>

      {/* Layer 3 - Pink/Accent gradient */}
      <motion.div
        style={{ y: layer3Y }}
        className="parallax-layer parallax-layer-3"
        data-blur={blurs.blur3}
      >
        <div
          className="layer-gradient"
          style={{
            background: 'conic-gradient(from 45deg at 50% 70%, hsl(var(--gradient-end) / 0.3) 0deg, hsl(var(--accent) / 0.25) 120deg, transparent 240deg)',
            filter: `blur(${blurs.blur3})`,
          }}
        />
      </motion.div>
    </>
  );
};
