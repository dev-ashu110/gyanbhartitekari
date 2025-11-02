import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';

interface TouchFeedbackProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export const TouchFeedback = ({ children, className = '', disabled = false }: TouchFeedbackProps) => {
  const [isPressed, setIsPressed] = useState(false);

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <motion.div
      className={className}
      animate={{
        scale: isPressed ? 0.97 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      {children}
    </motion.div>
  );
};