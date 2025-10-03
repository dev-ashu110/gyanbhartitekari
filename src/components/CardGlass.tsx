import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card } from '@/components/ui/card';

interface CardGlassProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export const CardGlass = ({ children, className = '', hover = true, delay = 0 }: CardGlassProps) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      whileHover={hover ? { scale: 1.05, y: -5 } : {}}
      className={className}
    >
      <Card className="glass p-6 rounded-3xl h-full transition-all duration-300 hover:glass-strong">
        {children}
      </Card>
    </motion.div>
  );
};
