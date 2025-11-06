import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Users, Clock } from 'lucide-react';

interface ActivityStat {
  label: string;
  value: number;
  icon: any;
  color: string;
}

export const ActivityAnalytics = () => {
  const [stats, setStats] = useState<ActivityStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityStats();
  }, []);

  const fetchActivityStats = async () => {
    try {
      setLoading(true);

      // Total activities today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: todayCount } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Total activities this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { count: weekCount } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      // Total activities this month
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);

      const { count: monthCount } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthAgo.toISOString());

      // Active users (unique user_ids in last 24 hours)
      const { data: activeUsers } = await supabase
        .from('activity_logs')
        .select('user_id')
        .gte('created_at', today.toISOString());

      const uniqueUsers = new Set(activeUsers?.map((log) => log.user_id)).size;

      setStats([
        {
          label: 'Today',
          value: todayCount || 0,
          icon: Activity,
          color: 'text-blue-500',
        },
        {
          label: 'This Week',
          value: weekCount || 0,
          icon: TrendingUp,
          color: 'text-green-500',
        },
        {
          label: 'This Month',
          value: monthCount || 0,
          icon: Clock,
          color: 'text-purple-500',
        },
        {
          label: 'Active Users',
          value: uniqueUsers,
          icon: Users,
          color: 'text-orange-500',
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch activity stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass animate-pulse">
            <CardContent className="p-6 h-24"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-strong group hover:scale-105 transition-transform">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className="p-3 rounded-full bg-primary/10">
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
