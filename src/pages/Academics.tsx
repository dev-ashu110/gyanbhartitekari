import { BookOpen, Users, Clock, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import academicsBg from '@/assets/academics-bg.jpg';
import PageWrapper from '@/components/PageWrapper';

export default function Academics() {
  const classes = [
    { grade: 'Nursery - UKG', description: 'Play-based learning with focus on basic skills development' },
    { grade: 'Class 1 - 5', description: 'Foundation stage with emphasis on core subjects and holistic growth' },
    { grade: 'Class 6 - 8', description: 'Middle school curriculum with introduction to specialized subjects' },
    { grade: 'Class 9 - 10', description: 'Secondary education preparing for board examinations' },
    { grade: 'Class 11 - 12', description: 'Senior secondary with stream selection (Science, Commerce, Arts)' },
  ];

  const subjects = [
    'English Language & Literature',
    'Hindi Language & Literature',
    'Mathematics',
    'Science (Physics, Chemistry, Biology)',
    'Social Studies (History, Geography, Civics)',
    'Computer Science',
    'Physical Education',
    'Art & Craft',
  ];

  const facilities = [
    { icon: BookOpen, title: 'Modern Library', description: 'Extensive collection of books and digital resources' },
    { icon: Users, title: 'Smart Classrooms', description: 'Technology-enabled interactive learning spaces' },
    { icon: Clock, title: 'Regular Assessments', description: 'Continuous evaluation and progress tracking' },
    { icon: Award, title: 'Expert Faculty', description: 'Experienced and dedicated teaching professionals' },
  ];

  return (
    <PageWrapper>
      <main className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        {/* Header with Background */}
        <div className="relative mb-16 rounded-3xl overflow-hidden">
          <div className="absolute inset-0">
            <img src={academicsBg} alt="Academics" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/60"></div>
          </div>
          <div className="relative p-12 md:p-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient">Academics</h1>
            <p className="text-xl text-foreground max-w-2xl">
              Comprehensive curriculum designed to foster intellectual growth and practical skills
            </p>
          </div>
        </div>

        {/* Classes Offered */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-12 text-center text-gradient">Classes Offered</h2>
          <div className="space-y-4">
            {classes.map((item, index) => (
              <Card
                key={item.grade}
                className="glass p-6 rounded-3xl hover:glass-strong transition-all duration-300 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-foreground">{item.grade}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-block px-6 py-2 rounded-full bg-primary/20 text-primary font-medium">
                      Enrolling Now
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Subjects and Timetable */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <Card className="glass-strong p-8 rounded-3xl">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Core Subjects</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {subjects.map((subject, index) => (
                <div
                  key={subject}
                  className="glass p-4 rounded-2xl flex items-center space-x-3 hover:bg-primary/10 transition-colors"
                >
                  <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{subject}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="glass-strong p-8 rounded-3xl">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Sample Timetable</h2>
            <div className="space-y-3">
              {[
                { time: '8:00 AM - 8:45 AM', subject: 'Assembly & Morning Activities' },
                { time: '8:45 AM - 9:30 AM', subject: 'First Period' },
                { time: '9:30 AM - 10:15 AM', subject: 'Second Period' },
                { time: '10:15 AM - 10:30 AM', subject: 'Short Break' },
                { time: '10:30 AM - 11:15 AM', subject: 'Third Period' },
                { time: '11:15 AM - 12:00 PM', subject: 'Fourth Period' },
                { time: '12:00 PM - 12:45 PM', subject: 'Lunch Break' },
                { time: '12:45 PM - 1:30 PM', subject: 'Fifth Period' },
                { time: '1:30 PM - 2:15 PM', subject: 'Sixth Period' },
              ].map((slot, index) => (
                <div key={index} className="flex justify-between items-center p-3 glass rounded-xl">
                  <span className="text-sm font-medium text-foreground">{slot.time}</span>
                  <span className="text-sm text-muted-foreground">{slot.subject}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Academic Facilities */}
        <div>
          <h2 className="text-4xl font-bold mb-12 text-center text-gradient">Academic Facilities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((facility, index) => {
              const Icon = facility.icon;
              return (
                <Card
                  key={facility.title}
                  className="glass p-6 rounded-3xl hover:glass-strong transition-all duration-300 hover:scale-105 text-center"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-3 text-foreground">{facility.title}</h3>
                  <p className="text-muted-foreground text-sm">{facility.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Faculty Section */}
        <Card className="glass-strong p-8 md:p-12 rounded-3xl mt-16 text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Our Dedicated Faculty</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our team of over 50 experienced educators brings passion, expertise, and dedication to the classroom.
            With qualifications from premier institutions and years of teaching experience, our faculty members
            are committed to nurturing each student's potential. They employ innovative teaching methods, provide
            personalized attention, and create an engaging learning environment that inspires curiosity and
            academic excellence.
          </p>
        </Card>
      </div>
    </main>
    </PageWrapper>
  );
}
