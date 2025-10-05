import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Github, Globe, Mail, Phone, Award, ArrowLeft, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StudentData {
  id: string;
  student_name: string;
  admission_no: string;
  class: string;
  section: string;
  bio: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  profile_picture_url: string | null;
  achievements: string[] | null;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  project_url: string | null;
  github_url: string | null;
  tech_stack: string[] | null;
  image_url: string | null;
  created_at: string;
}

interface Portfolio {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_type: string | null;
  subject: string | null;
  assignment_type: string | null;
  created_at: string;
}

export default function PublicProfile() {
  const { studentId } = useParams();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudentProfile();
  }, [studentId]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);

      // Fetch student data
      const { data: studentData, error: studentError } = await supabase
        .from('student_data')
        .select('*')
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;
      setStudent(studentData);

      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('student_projects')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      // Fetch portfolios
      const { data: portfoliosData, error: portfoliosError } = await supabase
        .from('student_portfolios')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (portfoliosError) throw portfoliosError;
      setPortfolios(portfoliosData || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center">
        <Card className="glass-strong p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Student Not Found</h2>
          <p className="text-muted-foreground mb-6">The student profile you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="container mx-auto px-4">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="glass-strong mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <Avatar className="w-32 h-32 border-4 border-primary">
                  <AvatarImage src={student.profile_picture_url || ''} />
                  <AvatarFallback className="text-4xl">{student.student_name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-4xl font-bold mb-2 text-gradient">{student.student_name}</h1>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                    <Badge variant="secondary">Class {student.class}</Badge>
                    <Badge variant="secondary">Section {student.section}</Badge>
                    <Badge variant="outline">Roll No: {student.admission_no}</Badge>
                  </div>
                  
                  {student.bio && (
                    <p className="text-muted-foreground mb-4">{student.bio}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    {student.github_url && (
                      <Button asChild variant="outline" size="sm">
                        <a href={student.github_url} target="_blank" rel="noopener noreferrer">
                          <Github className="mr-2 h-4 w-4" />
                          GitHub
                        </a>
                      </Button>
                    )}
                    {student.portfolio_url && (
                      <Button asChild variant="outline" size="sm">
                        <a href={student.portfolio_url} target="_blank" rel="noopener noreferrer">
                          <Globe className="mr-2 h-4 w-4" />
                          Portfolio
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {student.achievements && student.achievements.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold">Achievements</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {student.achievements.map((achievement, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projects Section */}
          {projects.length > 0 && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-6 text-gradient">Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass-strong h-full hover:scale-105 transition-transform duration-300">
                      {project.image_url && (
                        <div className="aspect-video overflow-hidden rounded-t-xl">
                          <img 
                            src={project.image_url} 
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-xl">{project.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {project.description && (
                          <p className="text-muted-foreground mb-4">{project.description}</p>
                        )}
                        
                        {project.tech_stack && project.tech_stack.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.tech_stack.map((tech, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          {project.github_url && (
                            <Button asChild variant="outline" size="sm" className="flex-1">
                              <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                                <Github className="mr-2 h-4 w-4" />
                                Code
                              </a>
                            </Button>
                          )}
                          {project.project_url && (
                            <Button asChild variant="default" size="sm" className="flex-1">
                              <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Live
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio/Work Section */}
          {portfolios.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gradient">Portfolio</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portfolios.map((portfolio, index) => (
                  <motion.div
                    key={portfolio.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass-strong hover:scale-105 transition-transform duration-300">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl mb-2">{portfolio.title}</CardTitle>
                            <div className="flex flex-wrap gap-2">
                              {portfolio.subject && (
                                <Badge variant="secondary">{portfolio.subject}</Badge>
                              )}
                              {portfolio.assignment_type && (
                                <Badge variant="outline">{portfolio.assignment_type}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {portfolio.description && (
                          <p className="text-muted-foreground mb-4">{portfolio.description}</p>
                        )}
                        {portfolio.file_url && (
                          <Button asChild variant="outline" size="sm" className="w-full">
                            <a href={portfolio.file_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Work
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {projects.length === 0 && portfolios.length === 0 && (
            <Card className="glass-strong p-8 text-center">
              <p className="text-muted-foreground">No projects or portfolio items to display yet.</p>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
