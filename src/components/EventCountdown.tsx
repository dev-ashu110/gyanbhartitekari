import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EventCountdownProps {
  eventDate: string;
  eventTime?: string | null;
  eventTitle: string;
}

export const EventCountdown = ({ eventDate, eventTime, eventTitle }: EventCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const eventDateTime = new Date(eventDate);
      if (eventTime) {
        const [hours, minutes] = eventTime.split(':').map(Number);
        eventDateTime.setHours(hours, minutes, 0, 0);
      }

      const now = new Date();
      const difference = eventDateTime.getTime() - now.getTime();

      if (difference <= 0) {
        setIsExpired(true);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [eventDate, eventTime]);

  if (isExpired) {
    return (
      <Badge variant="secondary" className="text-xs">
        <Calendar className="h-3 w-3 mr-1" />
        Event Completed
      </Badge>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 text-sm"
    >
      <Clock className="h-4 w-4 text-primary" />
      <div className="flex gap-1">
        {timeLeft.days > 0 && (
          <span className="font-bold text-primary">{timeLeft.days}d </span>
        )}
        <span className="font-bold text-primary">{timeLeft.hours}h </span>
        <span className="font-bold text-primary">{timeLeft.minutes}m </span>
        <span className="font-bold text-primary">{timeLeft.seconds}s</span>
      </div>
    </motion.div>
  );
};
