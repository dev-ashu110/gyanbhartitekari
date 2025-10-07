import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Calendar, Award, Users, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { CardGlass } from '@/components/CardGlass';
import PageWrapper from '@/components/PageWrapper';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SchoolInfo {
  school_name: string;
  description: string;
  established_year: number;
  principal_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
}

interface Teacher {
  id: string;
  name: string;
  subject: string;
  qualification: string;
  experience_years: number;
  photo_url: string | null;
}

export default function VisitorPortal() {
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSchoolData();
  }, []);

  const fetchSchoolData = async () => {
    try {
      // Fetch school info
      const { data: schoolData, error: schoolError } = await supabase
        .from('school_info')
        .select('*')
        .single();

      if (schoolError) throw schoolError;
      setSchoolInfo(schoolData);

      // Fetch teachers
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('*')
        .order('display_order', { ascending: true });

      if (teachersError) throw teachersError;
      setTeachers(teachersData || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load school information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <main className="min-h-screen pt-32 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient">
              {schoolInfo?.school_name || 'Welcome'}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {schoolInfo?.description}
            </p>
          </motion.div>

          {/* School Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <CardGlass delay={0.1}>
              <div className="flex items-center gap-4">
                <Calendar className="h-10 w-10 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Established</p>
                  <p className="text-2xl font-bold">{schoolInfo?.established_year}</p>
                </div>
              </div>
            </CardGlass>

            <CardGlass delay={0.2}>
              <div className="flex items-center gap-4">
                <Award className="h-10 w-10 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Principal</p>
                  <p className="text-lg font-bold">{schoolInfo?.principal_name}</p>
                </div>
              </div>
            </CardGlass>

            <CardGlass delay={0.3}>
              <div className="flex items-center gap-4">
                <Users className="h-10 w-10 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Faculty</p>
                  <p className="text-2xl font-bold">{teachers.length}+</p>
                </div>
              </div>
            </CardGlass>

            <CardGlass delay={0.4}>
              <div className="flex items-center gap-4">
                <BookOpen className="h-10 w-10 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Programs</p>
                  <p className="text-2xl font-bold">10+</p>
                </div>
              </div>
            </CardGlass>
          </div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <Card className="glass-strong p-8">
              <h2 className="text-3xl font-bold mb-6 text-gradient">Contact Us</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <p className="font-semibold mb-1">Email</p>
                    <p className="text-muted-foreground">{schoolInfo?.contact_email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <p className="font-semibold mb-1">Phone</p>
                    <p className="text-muted-foreground">{schoolInfo?.contact_phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <p className="font-semibold mb-1">Address</p>
                    <p className="text-muted-foreground">{schoolInfo?.address}</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Faculty Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-4xl font-bold mb-8 text-center text-gradient">Our Faculty</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map((teacher, index) => (
                <motion.div
                  key={teacher.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Card className="glass-effect p-6 hover:scale-105 transition-all duration-300">
                    <div className="flex flex-col items-center text-center">
                      {teacher.photo_url ? (
                        <img
                          src={teacher.photo_url}
                          alt={teacher.name}
                          className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-primary/20"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 text-white text-2xl font-bold">
                          {teacher.name.charAt(0)}
                        </div>
                      )}
                      <h3 className="text-xl font-bold mb-2">{teacher.name}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p className="font-semibold text-primary">{teacher.subject}</p>
                        {teacher.qualification && <p>{teacher.qualification}</p>}
                        {teacher.experience_years && (
                          <p>{teacher.experience_years}+ years experience</p>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {teachers.length === 0 && (
              <Card className="glass-effect p-12 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Faculty information will be available soon.</p>
              </Card>
            )}
          </motion.div>
        </div>
      </main>
    </PageWrapper>
  );
}
