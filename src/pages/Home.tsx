import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Users, Award, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CardGlass } from '@/components/CardGlass';
import { TypewriterText } from '@/components/TypewriterText';
import { TouchFeedback } from '@/components/TouchFeedback';
import { useAuth } from '@/contexts/AuthContext';
import PageWrapper from '@/components/PageWrapper';
import { AchievementsSection } from '@/components/AchievementsSection';
import { TestimonialsCarousel } from '@/components/TestimonialsCarousel';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function Home() {
  const { user, profile } = useAuth();
  const [counts, setCounts] = useState({
    students: '5500+',
    faculty: '150+',
    years: '15+',
    success: '95%'
  });

  useEffect(() => {
    const fetchCounts = async () => {
      const { data } = await supabase
        .from('site_config')
        .select('key, value')
        .in('key', ['students_count', 'faculty_count', 'years_excellence', 'success_rate']);
      
      if (data) {
        const config = data.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {} as any);
        setCounts({
          students: `${config.students_count}+`,
          faculty: `${config.faculty_count}+`,
          years: `${config.years_excellence}+`,
          success: `${config.success_rate}%`
        });
      }
    };
    fetchCounts();
  }, []);

  const typewriterTexts = [
    "Empowering Minds, Inspiring Futures",
    "A Seat of Learning Excellence", 
    "Building Tomorrow's Leaders",
    "Where Dreams Take Flight"
  ];

  const quickLinks = [
    { icon: BookOpen, title: 'Admissions', path: '/admissions', description: 'Join our school family' },
    { icon: GraduationCap, title: 'Academics', path: '/academics', description: 'Explore our programs' },
    { icon: Users, title: 'Events', path: '/events', description: 'Upcoming activities' },
    { icon: Award, title: 'Gallery', path: '/gallery', description: 'Our achievements' },
  ];

  const achievements = [
    { value: counts.students, label: 'Students' },
    { value: counts.faculty, label: 'Faculty Members' },
    { value: counts.years, label: 'Years of Excellence' },
    { value: counts.success, label: 'Success Rate' },
  ];

  return (
    <PageWrapper>
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          {/* Hero Content */}
          <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h1
              className="text-5xl md:text-7xl font-heading font-bold mb-6"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Welcome to Gyan Bharti
            </motion.h1>
            
            <motion.div
              className="text-xl md:text-2xl text-muted-foreground mb-8 h-16 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <TypewriterText 
                texts={typewriterTexts}
                className="font-heading font-medium"
                delay={2500}
                speed={80}
              />
            </motion.div>

            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <TouchFeedback className="w-full max-w-md">
                <Link to="/admissions" className="block w-full">
                  <Button 
                    size="lg" 
                    className="btn-primary w-full text-lg animate-gradient-shift bg-gradient-to-r from-primary via-accent to-primary bg-[length:300%_100%] hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
                  >
                    {user ? 'Admission Open - Apply Now' : 'Join Our School Family'}
                  </Button>
                </Link>
              </TouchFeedback>
              
              {!user && (
                <TouchFeedback className="w-full max-w-md">
                  <Link to="/auth" className="block w-full">
                    <Button size="lg" variant="outline" className="glass-effect w-full hover:bg-primary/10 transition-all duration-300">
                      Login / Sign Up
                    </Button>
                  </Link>
                </TouchFeedback>
              )}

              <motion.p
                className="text-sm text-muted-foreground mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                Made with ❤️ By Aashutosh Ranjan
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link key={link.path} to={link.path}>
                  <CardGlass delay={index * 0.1}>
                    <Icon className="h-12 w-12 text-primary mb-4 transition-transform group-hover:scale-110" />
                    <h3 className="text-xl font-bold mb-2 text-foreground">{link.title}</h3>
                    <p className="text-muted-foreground">{link.description}</p>
                    <ChevronRight className="h-5 w-5 text-primary mt-4 transition-transform group-hover:translate-x-2" />
                  </CardGlass>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">Our Achievements</h2>
            <p className="text-xl text-muted-foreground">Proud milestones in our journey</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div
                key={achievement.label}
                className="glass-strong p-8 rounded-3xl text-center hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">{achievement.value}</div>
                <div className="text-muted-foreground">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* School Achievements Section */}
      <AchievementsSection />

      {/* Testimonials Section */}
      <TestimonialsCarousel />

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <Card className="glass-strong p-12 text-center rounded-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Ready to Join Us?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start your journey towards excellence. Admissions are now open for the upcoming academic year.
            </p>
            <Button asChild size="lg" className="rounded-full text-lg px-8">
              <Link to="/admissions">
                Apply Now <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </Card>
        </div>
      </section>
    </main>
    </PageWrapper>
  );
}
