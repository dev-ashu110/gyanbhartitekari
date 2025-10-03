import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Users, Award, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HeroGlass } from '@/components/HeroGlass';
import { CardGlass } from '@/components/CardGlass';
import heroImage from '@/assets/hero-school.jpg';

export default function Home() {
  const quickLinks = [
    { icon: BookOpen, title: 'Admissions', path: '/admissions', description: 'Join our school family' },
    { icon: GraduationCap, title: 'Academics', path: '/academics', description: 'Explore our programs' },
    { icon: Users, title: 'Events', path: '/events', description: 'Upcoming activities' },
    { icon: Award, title: 'Gallery', path: '/gallery', description: 'Our achievements' },
  ];

  const achievements = [
    { value: '500+', label: 'Students' },
    { value: '50+', label: 'Faculty Members' },
    { value: '15+', label: 'Years of Excellence' },
    { value: '95%', label: 'Success Rate' },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section with Advanced Glassmorphism */}
      <HeroGlass
        backgroundImage={heroImage}
        title="Gyan Bharti Senior Secondary School"
        subtitle="Excellence in Education • Nurturing Minds • Building Futures"
        ctaText="Admissions Open"
        ctaLink="/admissions"
        secondaryCtaText="Learn More"
        secondaryCtaLink="/about"
      />

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
  );
}
