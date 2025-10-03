import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface LiquidToggleProps {
  onToggle: (enabled: boolean) => void;
}

export const LiquidToggle = ({ onToggle }: LiquidToggleProps) => {
  const [isEnabled, setIsEnabled] = useState(() => {
    const saved = localStorage.getItem('liquidEffect');
    return saved !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('liquidEffect', isEnabled.toString());
    onToggle(isEnabled);
  }, [isEnabled, onToggle]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setIsEnabled(!isEnabled)}
      className="hidden md:flex rounded-full gap-2 px-4"
      title={isEnabled ? 'Disable Liquid Effect' : 'Enable Liquid Effect'}
    >
      <motion.span
        animate={{ scale: isEnabled ? [1, 1.2, 1] : 1 }}
        transition={{ repeat: isEnabled ? Infinity : 0, duration: 2 }}
        className="text-sm"
      >
        {isEnabled ? '🌊' : '⚡'}
      </motion.span>
      <span className="text-xs font-medium">
        {isEnabled ? 'Liquid ON' : 'Static'}
      </span>
    </Button>
  );
};
