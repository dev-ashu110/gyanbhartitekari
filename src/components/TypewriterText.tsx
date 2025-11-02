import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
  texts: string[];
  className?: string;
  delay?: number;
  speed?: number;
}

export const TypewriterText = ({ 
  texts, 
  className = '', 
  delay = 2000, 
  speed = 100 
}: TypewriterTextProps) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const fullText = texts[currentTextIndex];
    
    if (isTyping) {
      if (currentText.length < fullText.length) {
        const timer = setTimeout(() => {
          setCurrentText(fullText.slice(0, currentText.length + 1));
        }, speed);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setIsTyping(false);
        }, delay);
        return () => clearTimeout(timer);
      }
    } else {
      if (currentText.length > 0) {
        const timer = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, speed / 2);
        return () => clearTimeout(timer);
      } else {
        setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        setIsTyping(true);
      }
    }
  }, [currentText, isTyping, currentTextIndex, texts, delay, speed]);

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorTimer);
  }, []);

  return (
    <motion.span
      className={`inline-block ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {currentText}
      <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-150`}>
        |
      </span>
    </motion.span>
  );
};