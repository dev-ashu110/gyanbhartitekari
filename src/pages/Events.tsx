import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Events() {
  const upcomingEvents = [
    {
      id: 1,
      title: 'Annual Day Celebration',
      date: '2024-12-15',
      time: '10:00 AM - 2:00 PM',
      venue: 'School Auditorium',
      type: 'Cultural',
      description:
        'Grand annual day celebration featuring cultural performances, prize distribution, and showcase of student achievements throughout the year.',
      participants: 'All Students & Parents',
    },
    {
      id: 2,
      title: 'Sports Day 2024',
      date: '2024-12-10',
      time: '8:00 AM - 4:00 PM',
      venue: 'School Sports Ground',
      type: 'Sports',
      description:
        'Annual sports meet with athletics, team sports, and friendly competitions. Students will participate in various sporting events.',
      participants: 'Classes 1-12',
    },
    {
      id: 3,
      title: 'Science Exhibition',
      date: '2024-12-05',
      time: '9:00 AM - 3:00 PM',
      venue: 'Science Labs & Corridors',
      type: 'Academic',
      description:
        'Students will present innovative science projects and experiments. Parents and guests are invited to view the exhibits.',
      participants: 'Classes 6-12',
    },
  ];

  const pastEvents = [
    {
      id: 4,
      title: 'Diwali Celebration',
      date: '2024-11-01',
      type: 'Cultural',
      description: 'Festive celebration with rangoli competition, diya decoration, and cultural programs.',
    },
    {
      id: 5,
      title: 'Independence Day',
      date: '2024-08-15',
      type: 'National',
      description: 'Flag hoisting ceremony followed by cultural programs and patriotic performances.',
    },
    {
      id: 6,
      title: 'Teacher\'s Day Celebration',
      date: '2024-09-05',
      type: 'Special',
      description: 'Students organized special programs to honor and appreciate teachers.',
    },
  ];

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

  return (
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
          <div className="space-y-6">
            {upcomingEvents.map((event, index) => (
              <Card
                key={event.id}
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
            ))}
          </div>
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
  );
}
