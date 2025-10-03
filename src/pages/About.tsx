import { Award, Target, Heart, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function About() {
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
    <main className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-1000">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient">About Us</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Committed to providing quality education and shaping future leaders
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <Card className="glass-strong p-8 rounded-3xl">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Our Story</h2>
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

          <Card className="glass-strong p-8 rounded-3xl">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Accreditation & Recognition</h2>
            <div className="space-y-6">
              <div className="space-y-4 text-muted-foreground">
                <p className="leading-relaxed">
                  Our school is recognized by the relevant education authorities and maintains the highest
                  standards of academic excellence. We are committed to continuous improvement and regularly
                  update our curriculum to meet the evolving needs of modern education.
                </p>
                <div className="glass p-4 rounded-2xl">
                  <h3 className="font-bold text-foreground mb-2">School Address</h3>
                  <p className="text-sm">WRPJ+GG6, 41, SH 69</p>
                  <p className="text-sm">Tekari, Raniganj</p>
                  <p className="text-sm">Gaya, Bihar 824236</p>
                </div>
                <div className="glass p-4 rounded-2xl">
                  <h3 className="font-bold text-foreground mb-2">Contact Information</h3>
                  <p className="text-sm">Phone: +91-94314-48688</p>
                  <p className="text-sm">Email: gyanbhartitekari@yahoo.com</p>
                  <p className="text-sm">Email: info@gyanbhartitekari.com</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gradient">Our Core Values</h2>
            <p className="text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card
                  key={value.title}
                  className="glass p-6 rounded-3xl hover:glass-strong transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-3 text-foreground">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="glass-strong p-8 rounded-3xl">
            <h2 className="text-3xl font-bold mb-6 text-primary">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              To provide a nurturing and stimulating learning environment that empowers students to reach their
              full potential, develop critical thinking skills, and become responsible global citizens who
              contribute positively to society.
            </p>
          </Card>
          <Card className="glass-strong p-8 rounded-3xl">
            <h2 className="text-3xl font-bold mb-6 text-primary">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              To be recognized as a leading educational institution that sets the standard for academic excellence,
              innovation in teaching, and holistic student development, preparing future leaders who make a
              meaningful difference in the world.
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}
