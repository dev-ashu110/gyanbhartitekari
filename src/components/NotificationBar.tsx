import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface Notice {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
}

export const NotificationBar = () => {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchPinnedNotice = async () => {
      const { data } = await supabase
        .from('notices')
        .select('id, title, content, pinned')
        .eq('pinned', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (data) {
        setNotice(data);
        setIsVisible(true);
      }
    };

    fetchPinnedNotice();

    const channel = supabase
      .channel('pinned-notices')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notices',
        filter: 'pinned=eq.true'
      }, () => {
        fetchPinnedNotice();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!notice || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="fixed top-20 left-0 right-0 z-40 px-4"
      >
        <div className="container mx-auto">
          <div className="glass-strong border-l-4 border-primary p-4 rounded-lg shadow-lg">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <Bell className="h-5 w-5 text-primary flex-shrink-0" />
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-sm md:text-base truncate">
                  {notice.title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                  {notice.content}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsVisible(false)}
                className="flex-shrink-0 hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
