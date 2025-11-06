import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useActivityLogger = () => {
  const logActivity = useCallback(async (action: string, details?: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action,
        details: details || null,
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }, []);

  return { logActivity };
};
