import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { PageTransition } from '@/components/PageTransition';
import { TouchFeedback } from '@/components/TouchFeedback';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  type: string;
  participants: string;
}

export default function Events() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();

    // Real-time subscription
    const channel = supabase
      .channel('events-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEvents = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: upcoming } = await supabase
      .from('events')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true });

    const { data: past } = await supabase
      .from('events')
      .select('*')
      .lt('date', today)
      .order('date', { ascending: false })
      .limit(6);

    setUpcomingEvents(upcoming || []);
    setPastEvents(past || []);
    setLoading(false);
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      Cultural: 'bg-primary/20 text-primary',
      Sports: 'bg-accent/20 text-accent',
      Academic: 'bg-secondary text-secondary-foreground',
      National: 'bg-primary/20 text-primary',
      Special: 'bg-accent/20 text-accent',
    };
    return colors[type] || 'bg-muted text-muted-foreground';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </main>
    );
  }

  return (
    <PageTransition>
      <main className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-1000">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient">Events</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Celebrating learning, culture, and community through memorable events
          </p>
        </div>

        {/* Upcoming Events */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-foreground">Upcoming Events</h2>
          {upcomingEvents.length === 0 ? (
            <Card className="glass p-8 text-center rounded-3xl">
              <p className="text-muted-foreground">No upcoming events at the moment.</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {upcomingEvents.map((event, index) => (
                <TouchFeedback key={event.id}>
                  <Card
                    className="glass-strong p-6 md:p-8 rounded-3xl hover:scale-[1.01] transition-all duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Date Section */}
                  <div className="md:col-span-1">
                    <div className="glass p-6 rounded-2xl text-center">
                      <div className="text-4xl font-bold text-primary mb-2">
                        {new Date(event.date).getDate()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                      </div>
                      <Badge className={`${getTypeColor(event.type)} mt-4`}>{event.type}</Badge>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="md:col-span-2">
                    <h3 className="text-2xl font-bold mb-4 text-foreground">{event.title}</h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">{event.description}</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{event.venue}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground sm:col-span-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span>{event.participants}</span>
                      </div>
                    </div>
                  </div>
                </div>
                  </Card>
                </TouchFeedback>
              ))}
            </div>
          )}
        </div>

        {/* Past Events */}
        <div>
          <h2 className="text-3xl font-bold mb-8 text-foreground">Past Events</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event, index) => (
              <Card
                key={event.id}
                className="glass p-6 rounded-3xl hover:glass-strong transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-4">
                  <Badge className={getTypeColor(event.type)}>{event.type}</Badge>
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{event.title}</h3>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{event.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Calendar Info */}
        <Card className="glass-strong p-8 md:p-12 rounded-3xl mt-16 text-center">
          <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-3 text-foreground">Academic Calendar</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our academic calendar is packed with exciting events throughout the year. From cultural celebrations
            to academic competitions, we ensure students have diverse opportunities for growth and development.
            Check this page regularly for updates on upcoming events and activities.
          </p>
        </Card>
        </div>
      </main>
    </PageTransition>
  );
}
