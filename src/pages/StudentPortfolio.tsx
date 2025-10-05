import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  File, 
  Trash2, 
  Plus,
  Github,
  Globe,
  ExternalLink,
  Award,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';

interface StudentData {
  id: string;
  student_name: string;
  admission_no: string;
  roll_no: string;
  section: string;
  class: string;
  parent_email?: string;
  parent_phone?: string;
  github_url?: string;
  portfolio_url?: string;
  bio?: string;
  profile_picture_url?: string;
  achievements?: string[];
}

interface Portfolio {
  id: string;
  title: string;
  description?: string;
  file_url?: string;
  file_type?: string;
  file_name?: string;
  assignment_type?: string;
  subject?: string;
  created_at: string;
}

interface Project {
  id: string;
  title: string;
  description?: string;
  project_url?: string;
  github_url?: string;
  tech_stack?: string[];
  image_url?: string;
  created_at: string;
}

const StudentPortfolio = () => {
  const [user, setUser] = useState<User | null>(null);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form states
  const [newPortfolio, setNewPortfolio] = useState({
    title: '',
    description: '',
    assignment_type: '',
    subject: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Student data form
  const [studentForm, setStudentForm] = useState({
    student_name: '',
    admission_no: '',
    roll_no: '',
    section: '',
    class: '',
    parent_email: '',
    parent_phone: '',
    github_url: '',
    portfolio_url: '',
    bio: '',
    achievements: '',
  });

  // Project form
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    project_url: '',
    github_url: '',
    tech_stack: '',
    image_url: '',
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    
    setUser(user);
    await fetchStudentData(user.id);
    await fetchPortfolios(user.id);
    await fetchProjects(user.id);
    setLoading(false);
  };

  const fetchStudentData = async (userId: string) => {
    const { data, error } = await supabase
      .from('student_data')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching student data:', error);
    } else if (data) {
      setStudentData(data);
      setStudentForm({
        student_name: data.student_name || '',
        admission_no: data.admission_no || '',
        roll_no: data.roll_no || '',
        section: data.section || '',
        class: data.class || '',
        parent_email: data.parent_email || '',
        parent_phone: data.parent_phone || '',
        github_url: data.github_url || '',
        portfolio_url: data.portfolio_url || '',
        bio: data.bio || '',
        achievements: data.achievements?.join(', ') || '',
      });
    }
  };

  const fetchPortfolios = async (userId: string) => {
    const { data, error } = await supabase
      .from('student_portfolios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching portfolios:', error);
    } else {
      setPortfolios(data || []);
    }
  };

  const fetchProjects = async (userId: string) => {
    const { data, error } = await supabase
      .from('student_projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setProjects(data || []);
    }
  };

  const handleSaveStudentData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const achievementsArray = studentForm.achievements
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      const dataToSave = {
        user_id: user.id,
        student_name: studentForm.student_name,
        admission_no: studentForm.admission_no,
        roll_no: studentForm.roll_no,
        section: studentForm.section,
        class: studentForm.class,
        parent_email: studentForm.parent_email || null,
        parent_phone: studentForm.parent_phone || null,
        github_url: studentForm.github_url || null,
        portfolio_url: studentForm.portfolio_url || null,
        bio: studentForm.bio || null,
        achievements: achievementsArray.length > 0 ? achievementsArray : null,
      };

      if (studentData) {
        const { error } = await supabase
          .from('student_data')
          .update(dataToSave)
          .eq('id', studentData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('student_data')
          .insert([dataToSave]);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'Student information saved successfully!',
      });

      await fetchStudentData(user.id);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedFile || !studentData) {
      toast({
        title: 'Error',
        description: 'Please complete your student information first and select a file.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('student-portfolios')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('student-portfolios')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('student_portfolios')
        .insert([{
          user_id: user.id,
          student_id: studentData.id,
          title: newPortfolio.title,
          description: newPortfolio.description || null,
          file_url: publicUrl,
          file_name: selectedFile.name,
          file_type: selectedFile.type,
          assignment_type: newPortfolio.assignment_type || null,
          subject: newPortfolio.subject || null,
        }]);

      if (insertError) throw insertError;

      toast({
        title: 'Success',
        description: 'File uploaded successfully!',
      });

      setNewPortfolio({ title: '', description: '', assignment_type: '', subject: '' });
      setSelectedFile(null);
      await fetchPortfolios(user.id);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    try {
      const { error } = await supabase
        .from('student_portfolios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Portfolio item deleted successfully!',
      });

      if (user) await fetchPortfolios(user.id);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !studentData) {
      toast({
        title: 'Error',
        description: 'Please complete your student information first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const techStackArray = projectForm.tech_stack
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const { error } = await supabase
        .from('student_projects')
        .insert([{
          user_id: user.id,
          student_id: studentData.id,
          title: projectForm.title,
          description: projectForm.description || null,
          project_url: projectForm.project_url || null,
          github_url: projectForm.github_url || null,
          tech_stack: techStackArray.length > 0 ? techStackArray : null,
          image_url: projectForm.image_url || null,
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Project added successfully!',
      });

      setProjectForm({
        title: '',
        description: '',
        project_url: '',
        github_url: '',
        tech_stack: '',
        image_url: '',
      });

      await fetchProjects(user.id);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('student_projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Project deleted successfully!',
      });

      if (user) await fetchProjects(user.id);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gradient">Student Portfolio</h1>
            <p className="text-muted-foreground">Manage your academic work and showcase your projects</p>
          </div>
          <div className="flex gap-2">
            {studentData && (
              <Button asChild variant="outline">
                <Link to={`/profile/${studentData.id}`} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Public Profile
                </Link>
              </Button>
            )}
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="glass-strong">
                <CardHeader>
                  <CardTitle>Student Information</CardTitle>
                  <CardDescription>
                    Complete your profile to showcase your academic journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveStudentData} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="student_name">Full Name *</Label>
                        <Input
                          id="student_name"
                          value={studentForm.student_name}
                          onChange={(e) => setStudentForm({ ...studentForm, student_name: e.target.value })}
                          required
                          className="glass-effect"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admission_no">Admission Number *</Label>
                        <Input
                          id="admission_no"
                          value={studentForm.admission_no}
                          onChange={(e) => setStudentForm({ ...studentForm, admission_no: e.target.value })}
                          required
                          className="glass-effect"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="roll_no">Roll Number *</Label>
                        <Input
                          id="roll_no"
                          value={studentForm.roll_no}
                          onChange={(e) => setStudentForm({ ...studentForm, roll_no: e.target.value })}
                          required
                          className="glass-effect"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="class">Class *</Label>
                        <Input
                          id="class"
                          value={studentForm.class}
                          onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                          required
                          className="glass-effect"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="section">Section *</Label>
                        <Input
                          id="section"
                          value={studentForm.section}
                          onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
                          required
                          className="glass-effect"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parent_email">Parent Email</Label>
                        <Input
                          id="parent_email"
                          type="email"
                          value={studentForm.parent_email}
                          onChange={(e) => setStudentForm({ ...studentForm, parent_email: e.target.value })}
                          className="glass-effect"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parent_phone">Parent Phone</Label>
                        <Input
                          id="parent_phone"
                          type="tel"
                          value={studentForm.parent_phone}
                          onChange={(e) => setStudentForm({ ...studentForm, parent_phone: e.target.value })}
                          className="glass-effect"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="github_url">GitHub URL</Label>
                        <Input
                          id="github_url"
                          type="url"
                          placeholder="https://github.com/username"
                          value={studentForm.github_url}
                          onChange={(e) => setStudentForm({ ...studentForm, github_url: e.target.value })}
                          className="glass-effect"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="portfolio_url">Portfolio Website</Label>
                        <Input
                          id="portfolio_url"
                          type="url"
                          placeholder="https://yourportfolio.com"
                          value={studentForm.portfolio_url}
                          onChange={(e) => setStudentForm({ ...studentForm, portfolio_url: e.target.value })}
                          className="glass-effect"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us about yourself, your interests, and goals..."
                        value={studentForm.bio}
                        onChange={(e) => setStudentForm({ ...studentForm, bio: e.target.value })}
                        className="glass-effect min-h-[100px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="achievements">Achievements (comma-separated)</Label>
                      <Textarea
                        id="achievements"
                        placeholder="First Prize in Science Fair, School Topper, Sports Champion, etc."
                        value={studentForm.achievements}
                        onChange={(e) => setStudentForm({ ...studentForm, achievements: e.target.value })}
                        className="glass-effect"
                      />
                      <p className="text-xs text-muted-foreground">
                        Separate multiple achievements with commas
                      </p>
                    </div>

                    <Button type="submit" className="w-full btn-primary">
                      Save Profile
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <div className="space-y-8">
              {/* Add Project Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="glass-strong">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Github className="h-6 w-6 text-primary" />
                      Add New Project
                    </CardTitle>
                    <CardDescription>
                      Showcase your coding projects and GitHub repositories
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddProject} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="project_title">Project Title *</Label>
                        <Input
                          id="project_title"
                          value={projectForm.title}
                          onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                          required
                          placeholder="My Awesome Project"
                          className="glass-effect"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="project_description">Description</Label>
                        <Textarea
                          id="project_description"
                          value={projectForm.description}
                          onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                          placeholder="Describe what your project does..."
                          className="glass-effect"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="github_url">GitHub URL</Label>
                          <Input
                            id="github_url"
                            type="url"
                            value={projectForm.github_url}
                            onChange={(e) => setProjectForm({ ...projectForm, github_url: e.target.value })}
                            placeholder="https://github.com/username/repo"
                            className="glass-effect"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="project_url">Live Demo URL</Label>
                          <Input
                            id="project_url"
                            type="url"
                            value={projectForm.project_url}
                            onChange={(e) => setProjectForm({ ...projectForm, project_url: e.target.value })}
                            placeholder="https://yourproject.com"
                            className="glass-effect"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tech_stack">Tech Stack (comma-separated)</Label>
                        <Input
                          id="tech_stack"
                          value={projectForm.tech_stack}
                          onChange={(e) => setProjectForm({ ...projectForm, tech_stack: e.target.value })}
                          placeholder="React, TypeScript, Node.js, MongoDB"
                          className="glass-effect"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="image_url">Project Image URL</Label>
                        <Input
                          id="image_url"
                          type="url"
                          value={projectForm.image_url}
                          onChange={(e) => setProjectForm({ ...projectForm, image_url: e.target.value })}
                          placeholder="https://example.com/project-image.jpg"
                          className="glass-effect"
                        />
                      </div>

                      <Button type="submit" className="w-full btn-primary">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Project
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Projects List */}
              <div>
                <h3 className="text-2xl font-bold mb-4 text-gradient">Your Projects</h3>
                {projects.length > 0 ? (
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
                          <CardContent className="space-y-4">
                            {project.description && (
                              <p className="text-muted-foreground text-sm">{project.description}</p>
                            )}
                            
                            {project.tech_stack && project.tech_stack.length > 0 && (
                              <div className="flex flex-wrap gap-2">
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
                                    <Globe className="mr-2 h-4 w-4" />
                                    Live
                                  </a>
                                </Button>
                              )}
                            </div>

                            <Button
                              onClick={() => handleDeleteProject(project.id)}
                              variant="destructive"
                              size="sm"
                              className="w-full"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="glass-strong p-8 text-center">
                    <Github className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No projects added yet. Start showcasing your work!</p>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            <div className="space-y-8">
              {/* Upload Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="glass-strong">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-6 w-6 text-primary" />
                      Upload Portfolio Item
                    </CardTitle>
                    <CardDescription>
                      Upload assignments, projects, or other academic work
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleFileUpload} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={newPortfolio.title}
                          onChange={(e) => setNewPortfolio({ ...newPortfolio, title: e.target.value })}
                          required
                          className="glass-effect"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newPortfolio.description}
                          onChange={(e) => setNewPortfolio({ ...newPortfolio, description: e.target.value })}
                          className="glass-effect"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject</Label>
                          <Input
                            id="subject"
                            value={newPortfolio.subject}
                            onChange={(e) => setNewPortfolio({ ...newPortfolio, subject: e.target.value })}
                            className="glass-effect"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="assignment_type">Type</Label>
                          <Select
                            value={newPortfolio.assignment_type}
                            onValueChange={(value) => setNewPortfolio({ ...newPortfolio, assignment_type: value })}
                          >
                            <SelectTrigger className="glass-effect">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="assignment">Assignment</SelectItem>
                              <SelectItem value="project">Project</SelectItem>
                              <SelectItem value="presentation">Presentation</SelectItem>
                              <SelectItem value="report">Report</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="file">File *</Label>
                        <Input
                          id="file"
                          type="file"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          required
                          className="glass-effect"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full btn-primary" 
                        disabled={uploading}
                      >
                        {uploading ? 'Uploading...' : 'Upload File'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Portfolio Items List */}
              <div>
                <h3 className="text-2xl font-bold mb-4 text-gradient">Your Portfolio</h3>
                {portfolios.length > 0 ? (
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
                              <div className="flex-1">
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
                              {portfolio.file_type?.startsWith('image/') ? (
                                <ImageIcon className="h-6 w-6 text-primary" />
                              ) : portfolio.file_type?.includes('pdf') ? (
                                <FileText className="h-6 w-6 text-primary" />
                              ) : (
                                <File className="h-6 w-6 text-primary" />
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {portfolio.description && (
                              <p className="text-muted-foreground text-sm">{portfolio.description}</p>
                            )}
                            
                            <div className="flex gap-2">
                              {portfolio.file_url && (
                                <Button asChild variant="outline" size="sm" className="flex-1">
                                  <a href={portfolio.file_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    View
                                  </a>
                                </Button>
                              )}
                              <Button
                                onClick={() => handleDeletePortfolio(portfolio.id)}
                                variant="destructive"
                                size="sm"
                                className="flex-1"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="glass-strong p-8 text-center">
                    <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No portfolio items yet. Upload your first file!</p>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentPortfolio;
