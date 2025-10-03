import { Calendar, AlertCircle, Pin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Notices() {
  const notices = [
    {
      id: 1,
      title: 'Annual Day Celebration 2024',
      date: '2024-12-15',
      category: 'Event',
      pinned: true,
      content:
        'Annual Day celebration will be held on December 15, 2024. All students are requested to attend with their parents. The event will showcase cultural performances, prize distribution, and achievements of the year.',
    },
    {
      id: 2,
      title: 'Winter Break Schedule',
      date: '2024-12-20',
      category: 'Holiday',
      pinned: true,
      content:
        'School will remain closed from December 25, 2024 to January 5, 2025 for winter break. School will reopen on January 6, 2025. Enjoy your holidays!',
    },
    {
      id: 3,
      title: 'Parent-Teacher Meeting',
      date: '2024-11-30',
      category: 'Meeting',
      pinned: false,
      content:
        'Parent-Teacher meeting scheduled for November 30, 2024. Parents are requested to meet respective class teachers to discuss their ward\'s progress and performance.',
    },
    {
      id: 4,
      title: 'Sports Day Announcement',
      date: '2024-12-10',
      category: 'Sports',
      pinned: false,
      content:
        'Annual Sports Day will be organized on December 10, 2024. Students are requested to participate enthusiastically. Practice sessions will commence from November 25.',
    },
    {
      id: 5,
      title: 'Science Exhibition',
      date: '2024-12-05',
      category: 'Academic',
      pinned: false,
      content:
        'Science exhibition will be held on December 5, 2024. Students from classes 6-12 are encouraged to participate with innovative projects. Registration deadline is November 28.',
    },
    {
      id: 6,
      title: 'Library Extension Hours',
      date: '2024-11-15',
      category: 'Facility',
      pinned: false,
      content:
        'Library will be open until 5:00 PM from Monday to Friday for students who wish to study. Additional reading materials and digital resources have been added.',
    },
  ];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Event: 'bg-primary/20 text-primary',
      Holiday: 'bg-accent/20 text-accent',
      Meeting: 'bg-secondary text-secondary-foreground',
      Sports: 'bg-primary/20 text-primary',
      Academic: 'bg-accent/20 text-accent',
      Facility: 'bg-muted text-muted-foreground',
    };
    return colors[category] || 'bg-muted text-muted-foreground';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const pinnedNotices = notices.filter((n) => n.pinned);
  const regularNotices = notices.filter((n) => !n.pinned);

  return (
    <main className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-1000">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient">Notices & News</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay updated with the latest announcements and important information
          </p>
        </div>

        {/* Pinned Notices */}
        {pinnedNotices.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center">
              <Pin className="h-6 w-6 mr-2 text-primary" />
              Pinned Notices
            </h2>
            <div className="space-y-4">
              {pinnedNotices.map((notice, index) => (
                <Card
                  key={notice.id}
                  className="glass-strong p-6 rounded-3xl hover:scale-[1.02] transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">{notice.title}</h3>
                        <div className="flex items-center space-x-3 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(notice.date)}
                          </span>
                          <Badge className={getCategoryColor(notice.category)}>{notice.category}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed ml-0 md:ml-9">{notice.content}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Regular Notices */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-foreground">All Notices</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {regularNotices.map((notice, index) => (
              <Card
                key={notice.id}
                className="glass p-6 rounded-3xl hover:glass-strong transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-foreground mb-3">{notice.title}</h3>
                  <div className="flex items-center space-x-3 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(notice.date)}
                    </span>
                    <Badge className={getCategoryColor(notice.category)}>{notice.category}</Badge>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{notice.content}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <Card className="glass-strong p-8 rounded-3xl mt-16 text-center">
          <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-3 text-foreground">Stay Connected</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Important notices and updates are regularly posted here. Please check this section frequently to stay
            informed about school activities, events, and announcements. You can also follow us on our social
            media channels for instant updates.
          </p>
        </Card>
      </div>
    </main>
  );
}
