import { Award, Target, Heart, BookOpen, Facebook, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TypewriterText } from '@/components/TypewriterText';
import { TouchFeedback } from '@/components/TouchFeedback';
import PageWrapper from '@/components/PageWrapper';
import schoolBuilding1 from '@/assets/school-building-1.jpg';
import schoolBuilding2 from '@/assets/school-building-2.jpg';
import schoolBuilding3 from '@/assets/school-building-3.jpg';

export default function About() {
  const typewriterTexts = [
    "Our Campus is filled with discipline, peace, and inspiration",
    "Excellence in Education Since 2008",
    "Nurturing Future Leaders Today"
  ];

  const socialLinks = [
    { icon: Facebook, label: 'Facebook', href: '#', color: 'hover:text-blue-500' },
    { icon: Instagram, label: 'Instagram', href: '#', color: 'hover:text-pink-500' },
    { icon: Youtube, label: 'YouTube', href: '#', color: 'hover:text-red-500' },
  ];

  const values = [
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for academic excellence and holistic development of every student.',
    },
    {
      icon: Target,
      title: 'Innovation',
      description: 'Embracing modern teaching methodologies and technology in education.',
    },
    {
      icon: Heart,
      title: 'Compassion',
      description: 'Fostering a caring and inclusive environment for all students.',
    },
    {
      icon: BookOpen,
      title: 'Knowledge',
      description: 'Promoting lifelong learning and intellectual curiosity.',
    },
  ];

  return (
    <PageWrapper>
      <main className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6 text-gradient">About Us</h1>
          <div className="text-xl text-muted-foreground max-w-3xl mx-auto h-12 flex items-center justify-center">
            <TypewriterText 
              texts={typewriterTexts}
              className="font-heading"
              delay={3000}
              speed={60}
            />
          </div>
        </motion.div>

        {/* Campus Images Section */}
        <motion.div 
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold mb-4 text-gradient">Our Beautiful Campus</h2>
            <p className="text-xl text-muted-foreground">
              State-of-the-art facilities in a peaceful learning environment
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[schoolBuilding1, schoolBuilding2, schoolBuilding3].map((building, index) => (
              <motion.div
                key={index}
                className="relative overflow-hidden rounded-3xl glass-effect group"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img 
                  src={building} 
                  alt={`School Building ${index + 1}`}
                  className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="glass-strong p-8 rounded-3xl">
              <h2 className="text-3xl font-heading font-bold mb-6 text-foreground">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Gyan Bharti Senior Secondary School, located in the heart of Tekari, Gaya, Bihar, has been a
                  beacon of quality education for over 15 years. Our institution stands as a testament to our
                  unwavering commitment to academic excellence and holistic student development.
                </p>
                <p>
                  Founded with a vision to provide accessible, world-class education to students in the region,
                  we have grown into one of the most respected educational institutions in Bihar. Our state-of-the-art
                  facilities, dedicated faculty, and innovative teaching methodologies create an environment where
                  students thrive academically, socially, and personally.
                </p>
                <p>
                  We believe in nurturing not just scholars, but well-rounded individuals who are prepared to face
                  the challenges of tomorrow. Through a balanced curriculum that emphasizes both academic rigor and
                  extracurricular activities, we ensure that every student discovers and develops their unique potential.
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Card className="glass-strong p-8 rounded-3xl">
              <h2 className="text-3xl font-heading font-bold mb-6 text-foreground">Contact & Location</h2>
              <div className="space-y-6">
                <div className="space-y-4 text-muted-foreground">
                  <p className="leading-relaxed">
                    Our school is recognized by the relevant education authorities and maintains the highest
                    standards of academic excellence. We are committed to continuous improvement and regularly
                    update our curriculum to meet the evolving needs of modern education.
                  </p>
                  <div className="glass p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h3 className="font-bold text-foreground">School Address</h3>
                    </div>
                    <p className="text-sm">WRPJ+GG6, 41, SH 69</p>
                    <p className="text-sm">Tekari, Raniganj</p>
                    <p className="text-sm">Gaya, Bihar 824236</p>
                  </div>
                  <div className="glass p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="h-5 w-5 text-primary" />
                      <Mail className="h-5 w-5 text-primary" />
                      <h3 className="font-bold text-foreground">Contact Information</h3>
                    </div>
                    <p className="text-sm">Phone: +91-94314-48688</p>
                    <p className="text-sm">Email: gyanbhartitekari@yahoo.com</p>
                    <p className="text-sm">Email: info@gyanbhartitekari.com</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Values Section */}
        <motion.div 
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold mb-4 text-gradient">Our Core Values</h2>
            <p className="text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                >
                  <TouchFeedback>
                    <Card className="glass p-6 rounded-3xl hover:glass-strong transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10">
                      <Icon className="h-12 w-12 text-primary mb-4" />
                      <h3 className="text-xl font-heading font-bold mb-3 text-foreground">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </Card>
                  </TouchFeedback>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Mission & Vision */}
        <motion.div 
          className="grid md:grid-cols-2 gap-8 mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <TouchFeedback>
            <Card className="glass-strong p-8 rounded-3xl hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
              <h2 className="text-3xl font-heading font-bold mb-6 text-primary">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To provide a nurturing and stimulating learning environment that empowers students to reach their
                full potential, develop critical thinking skills, and become responsible global citizens who
                contribute positively to society.
              </p>
            </Card>
          </TouchFeedback>
          <TouchFeedback>
            <Card className="glass-strong p-8 rounded-3xl hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
              <h2 className="text-3xl font-heading font-bold mb-6 text-primary">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To be recognized as a leading educational institution that sets the standard for academic excellence,
                innovation in teaching, and holistic student development, preparing future leaders who make a
                meaningful difference in the world.
              </p>
            </Card>
          </TouchFeedback>
        </motion.div>

        {/* Social Media Section */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <Card className="glass-strong p-8 rounded-3xl">
            <h2 className="text-3xl font-heading font-bold mb-6 text-gradient">Connect With Us</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Follow us on social media for the latest updates and achievements
            </p>
            <div className="flex justify-center items-center gap-6">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.div
                    key={social.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.6 + index * 0.1 }}
                  >
                    <TouchFeedback>
                      <Button
                        variant="outline"
                        size="lg"
                        className={`glass-effect p-4 rounded-full ${social.color} transition-all duration-300 hover:scale-110 hover:shadow-lg`}
                        asChild
                      >
                        <a href={social.href} target="_blank" rel="noopener noreferrer">
                          <Icon className="h-6 w-6" />
                          <span className="sr-only">{social.label}</span>
                        </a>
                      </Button>
                    </TouchFeedback>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>
    </main>
    </PageWrapper>
  );
}
