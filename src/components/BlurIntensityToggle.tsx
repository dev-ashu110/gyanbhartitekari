import { useState, useEffect } from 'react';
import { Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const BlurIntensityToggle = () => {
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('high');

  useEffect(() => {
    const saved = localStorage.getItem('blurIntensity') as 'low' | 'medium' | 'high' | null;
    if (saved) setIntensity(saved);
  }, []);

  const handleChange = (value: 'low' | 'medium' | 'high') => {
    setIntensity(value);
    localStorage.setItem('blurIntensity', value);
    
    // Dispatch custom event for ParallaxLayers to listen
    window.dispatchEvent(new CustomEvent('blurIntensityChange', { detail: value }));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          aria-label="Adjust blur intensity"
        >
          <Droplets className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleChange('low')} className={intensity === 'low' ? 'bg-accent/10' : ''}>
          Low Blur (Performance)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChange('medium')} className={intensity === 'medium' ? 'bg-accent/10' : ''}>
          Medium Blur
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChange('high')} className={intensity === 'high' ? 'bg-accent/10' : ''}>
          High Blur (Quality)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
