import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { GraduationCap, BookOpen, Users, Award, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CardGlass } from '@/components/CardGlass';
import { useEffect } from 'react';

export default function Home() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const x1 = useTransform(mouseX, [0, typeof window !== 'undefined' ? window.innerWidth : 1920], [-100, 100]);
  const y1 = useTransform(mouseY, [0, typeof window !== 'undefined' ? window.innerHeight : 1080], [-100, 100]);
  const x2 = useTransform(mouseX, [0, typeof window !== 'undefined' ? window.innerWidth : 1920], [-50, 50]);
  const y2 = useTransform(mouseY, [0, typeof window !== 'undefined' ? window.innerHeight : 1080], [-50, 50]);

  const springX1 = useSpring(x1, { stiffness: 50, damping: 30 });
  const springY1 = useSpring(y1, { stiffness: 50, damping: 30 });
  const springX2 = useSpring(x2, { stiffness: 100, damping: 30 });
  const springY2 = useSpring(y2, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

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
      {/* Hero Section with Circular Gradient Masks */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated gradient blobs */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
            filter: 'blur(80px)',
            x: springX1,
            y: springY1,
            top: '20%',
            left: '10%',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
            filter: 'blur(80px)',
            x: springX2,
            y: springY2,
            top: '50%',
            right: '10%',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
            filter: 'blur(80px)',
            bottom: '10%',
            left: '30%',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Hero Content */}
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-6"
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
            
            <motion.p
              className="text-xl md:text-2xl text-muted-foreground mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              A Seat of Learning - Empowering Minds, Building Futures
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Link to="/admissions">
                <Button size="lg" className="glass-strong">
                  Admissions Open
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="glass-effect">
                  Contact Us
                </Button>
              </Link>
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
