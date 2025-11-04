import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Star, Medal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';

interface Achievement {
  id: string;
  title: string;
  description: string;
  year: number;
  category: string;
  image_url?: string;
}

const categoryIcons = {
  academic: Award,
  sports: Trophy,
  cultural: Star,
  infrastructure: Medal,
  awards: Medal,
};

const categoryColors = {
  academic: 'from-blue-500 to-cyan-500',
  sports: 'from-green-500 to-emerald-500',
  cultural: 'from-purple-500 to-pink-500',
  infrastructure: 'from-orange-500 to-red-500',
  awards: 'from-yellow-500 to-amber-500',
};

export const AchievementsSection = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const fetchAchievements = async () => {
      const { data } = await supabase
        .from('achievements')
        .select('*')
        .order('display_order', { ascending: true })
        .limit(4);
      
      if (data) setAchievements(data);
    };

    fetchAchievements();

    const channel = supabase
      .channel('achievements-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'achievements' }, () => {
        fetchAchievements();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (achievements.length === 0) return null;

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
            School Achievements
          </h2>
          <p className="text-xl text-muted-foreground">
            Celebrating our excellence across all domains
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((achievement, index) => {
            const Icon = categoryIcons[achievement.category as keyof typeof categoryIcons] || Award;
            const gradient = categoryColors[achievement.category as keyof typeof categoryColors];

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="glass-strong p-6 h-full hover:scale-105 transition-transform duration-300">
                  <div className={`bg-gradient-to-br ${gradient} p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-foreground">{achievement.title}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {achievement.year}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
