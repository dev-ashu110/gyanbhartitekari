import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Upload, FileText, Image, File, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const StudentPortfolio = () => {
  const [user, setUser] = useState<User | null>(null);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

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
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      await fetchStudentData(user.id);
      await fetchPortfolios(user.id);
    }
    setLoading(false);
  };

  const fetchStudentData = async (userId: string) => {
    const { data, error } = await supabase
      .from('student_data')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching student data:', error);
    } else if (data) {
      setStudentData(data);
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

  const handleStudentDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase
      .from('student_data')
      .upsert({
        user_id: user.id,
        ...studentForm,
      });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Student data saved successfully',
      });
      await fetchStudentData(user.id);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handlePortfolioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedFile) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('student-portfolios')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('student-portfolios')
        .getPublicUrl(fileName);

      // Create portfolio entry
      const { error: insertError } = await supabase
        .from('student_portfolios')
        .insert({
          user_id: user.id,
          student_id: studentData?.id,
          title: newPortfolio.title,
          description: newPortfolio.description,
          file_url: publicUrl,
          file_type: selectedFile.type,
          file_name: selectedFile.name,
          assignment_type: newPortfolio.assignment_type,
          subject: newPortfolio.subject,
        });

      if (insertError) throw insertError;

      toast({
        title: 'Success',
        description: 'Portfolio item uploaded successfully',
      });

      // Reset form
      setNewPortfolio({
        title: '',
        description: '',
        assignment_type: '',
        subject: '',
      });
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

  const handleDelete = async (id: string, fileUrl?: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      // Delete from database
      const { error: deleteError } = await supabase
        .from('student_portfolios')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Delete file from storage if exists
      if (fileUrl) {
        const fileName = fileUrl.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('student-portfolios')
            .remove([`${user?.id}/${fileName}`]);
        }
      }

      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });

      await fetchPortfolios(user!.id);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="w-8 h-8" />;
    if (fileType.startsWith('image/')) return <Image className="w-8 h-8" />;
    return <FileText className="w-8 h-8" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <Card className="glass-strong max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Login Required</CardTitle>
              <CardDescription>
                Please log in to access the student portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/auth">
                <Button className="w-full">
                  Go to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-gradient">
            Student Portfolio
          </h1>

          <Tabs defaultValue="portfolio" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
              <TabsTrigger value="data">Student Data</TabsTrigger>
            </TabsList>

            <TabsContent value="portfolio">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Upload Form */}
                <Card className="glass-strong">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Upload New Work
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePortfolioSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={newPortfolio.title}
                          onChange={(e) =>
                            setNewPortfolio({ ...newPortfolio, title: e.target.value })
                          }
                          required
                          className="glass-effect"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newPortfolio.description}
                          onChange={(e) =>
                            setNewPortfolio({ ...newPortfolio, description: e.target.value })
                          }
                          className="glass-effect"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="subject">Subject</Label>
                          <Select
                            value={newPortfolio.subject}
                            onValueChange={(value) =>
                              setNewPortfolio({ ...newPortfolio, subject: value })
                            }
                          >
                            <SelectTrigger className="glass-effect">
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="math">Mathematics</SelectItem>
                              <SelectItem value="science">Science</SelectItem>
                              <SelectItem value="english">English</SelectItem>
                              <SelectItem value="hindi">Hindi</SelectItem>
                              <SelectItem value="social">Social Studies</SelectItem>
                              <SelectItem value="computer">Computer Science</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="type">Type</Label>
                          <Select
                            value={newPortfolio.assignment_type}
                            onValueChange={(value) =>
                              setNewPortfolio({ ...newPortfolio, assignment_type: value })
                            }
                          >
                            <SelectTrigger className="glass-effect">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="assignment">Assignment</SelectItem>
                              <SelectItem value="project">Project</SelectItem>
                              <SelectItem value="artwork">Artwork</SelectItem>
                              <SelectItem value="essay">Essay</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="file">File *</Label>
                        <div className="mt-2">
                          <Input
                            id="file"
                            type="file"
                            onChange={handleFileChange}
                            className="glass-effect"
                            accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                            required
                          />
                        </div>
                        {selectedFile && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Selected: {selectedFile.name}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={uploading}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? 'Uploading...' : 'Upload'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Portfolio List */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">My Uploads</h3>
                  {portfolios.length === 0 ? (
                    <Card className="glass-strong">
                      <CardContent className="py-8 text-center text-muted-foreground">
                        No uploads yet. Start by uploading your first work!
                      </CardContent>
                    </Card>
                  ) : (
                    portfolios.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="glass-strong hover-scale">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex gap-4 flex-1">
                                <div className="text-primary">
                                  {getFileIcon(item.file_type)}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold">{item.title}</h4>
                                  {item.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {item.description}
                                    </p>
                                  )}
                                  <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                                    {item.subject && (
                                      <span className="px-2 py-1 bg-primary/10 rounded">
                                        {item.subject}
                                      </span>
                                    )}
                                    {item.assignment_type && (
                                      <span className="px-2 py-1 bg-accent/10 rounded">
                                        {item.assignment_type}
                                      </span>
                                    )}
                                  </div>
                                  {item.file_name && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                      {item.file_name}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(item.id, item.file_url)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="data">
              <Card className="glass-strong max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>Student Information</CardTitle>
                  <CardDescription>
                    Update your student details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleStudentDataSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="student_name">Student Name *</Label>
                        <Input
                          id="student_name"
                          value={studentForm.student_name}
                          onChange={(e) =>
                            setStudentForm({ ...studentForm, student_name: e.target.value })
                          }
                          required
                          className="glass-effect"
                        />
                      </div>

                      <div>
                        <Label htmlFor="admission_no">Admission Number *</Label>
                        <Input
                          id="admission_no"
                          value={studentForm.admission_no}
                          onChange={(e) =>
                            setStudentForm({ ...studentForm, admission_no: e.target.value })
                          }
                          required
                          className="glass-effect"
                        />
                      </div>

                      <div>
                        <Label htmlFor="class">Class *</Label>
                        <Input
                          id="class"
                          value={studentForm.class}
                          onChange={(e) =>
                            setStudentForm({ ...studentForm, class: e.target.value })
                          }
                          required
                          className="glass-effect"
                        />
                      </div>

                      <div>
                        <Label htmlFor="section">Section *</Label>
                        <Input
                          id="section"
                          value={studentForm.section}
                          onChange={(e) =>
                            setStudentForm({ ...studentForm, section: e.target.value })
                          }
                          required
                          className="glass-effect"
                        />
                      </div>

                      <div>
                        <Label htmlFor="roll_no">Roll Number *</Label>
                        <Input
                          id="roll_no"
                          value={studentForm.roll_no}
                          onChange={(e) =>
                            setStudentForm({ ...studentForm, roll_no: e.target.value })
                          }
                          required
                          className="glass-effect"
                        />
                      </div>

                      <div>
                        <Label htmlFor="parent_phone">Parent Phone</Label>
                        <Input
                          id="parent_phone"
                          type="tel"
                          value={studentForm.parent_phone}
                          onChange={(e) =>
                            setStudentForm({ ...studentForm, parent_phone: e.target.value })
                          }
                          className="glass-effect"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="parent_email">Parent Email</Label>
                        <Input
                          id="parent_email"
                          type="email"
                          value={studentForm.parent_email}
                          onChange={(e) =>
                            setStudentForm({ ...studentForm, parent_email: e.target.value })
                          }
                          className="glass-effect"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      Save Student Data
                    </Button>
                  </form>

                  {studentData && (
                    <div className="mt-6 p-4 glass-effect rounded-lg">
                      <h4 className="font-semibold mb-2">Current Data:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name:</span>{' '}
                          {studentData.student_name}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Admission No:</span>{' '}
                          {studentData.admission_no}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Class:</span>{' '}
                          {studentData.class}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Section:</span>{' '}
                          {studentData.section}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Roll No:</span>{' '}
                          {studentData.roll_no}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentPortfolio;
