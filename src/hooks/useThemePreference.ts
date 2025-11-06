import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from 'next-themes';

export const useThemePreference = () => {
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserTheme();
  }, []);

  const loadUserTheme = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('theme')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data?.theme) {
        setTheme(data.theme);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveThemePreference = async (newTheme: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          theme: newTheme,
        }, {
          onConflict: 'user_id',
        });

      setTheme(newTheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  return { theme, setTheme: saveThemePreference, loading };
};
