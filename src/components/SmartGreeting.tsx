import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Sun, Moon, Sunrise, Sunset } from 'lucide-react';

export const SmartGreeting = () => {
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState<string | null>(null);
  const [icon, setIcon] = useState<any>(Sun);

  useEffect(() => {
    loadUserData();
    updateGreeting();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.full_name) {
        setUserName(profile.full_name);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const updateGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      setGreeting('Good Morning');
      setIcon(Sunrise);
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good Afternoon');
      setIcon(Sun);
    } else if (hour >= 17 && hour < 21) {
      setGreeting('Good Evening');
      setIcon(Sunset);
    } else {
      setGreeting('Good Night');
      setIcon(Moon);
    }
  };

  const GreetingIcon = icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-2 text-lg font-semibold text-foreground"
    >
      <GreetingIcon className="h-5 w-5 text-primary" />
      <span>
        {greeting}{userName && `, ${userName}`}
        <span className="ml-1">👋</span>
      </span>
    </motion.div>
  );
};
