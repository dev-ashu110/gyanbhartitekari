import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, Clock, XCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PageWrapper from '@/components/PageWrapper';
import { AccessDenied } from '@/components/AccessDenied';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Submission {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback: string | null;
  created_at: string;
}

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<any>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null as File | null,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        navigate('/auth');
        return;
      }

      setUser(authUser);

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUser.id)
        .single();

      if (!roleData || roleData.role !== 'student') {
        setIsStudent(false);
        setLoading(false);
        return;
      }

      setIsStudent(true);
      setRole(roleData);
      await fetchSubmissions(authUser.id);
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (userId: string) => {
    const { data, error } = await supabase
      .from('submissions' as any)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSubmissions(data as any);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file || !user) return;

    // Validate file type
    const validTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (!validTypes.includes(formData.file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image or document file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB max)
    if (formData.file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 10MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Upload to Supabase Storage
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('student-portfolios')
        .upload(fileName, formData.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('student-portfolios')
        .getPublicUrl(fileName);

      // Save metadata to submissions table
      const { error: dbError } = await (supabase as any)
        .from('submissions')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          file_url: publicUrl,
          file_path: fileName,
          file_type: formData.file.type,
          file_size: formData.file.size,
          status: 'pending',
        });

      if (dbError) throw dbError;

      toast({
        title: 'Upload successful',
        description: 'Your submission is pending approval',
      });

      setFormData({ title: '', description: '', file: null });
      setShowUploadForm(false);
      await fetchSubmissions(user.id);
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
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

  if (!isStudent) {
    return <AccessDenied title="Student Access Only" message="You need to have a student role to access this dashboard." />;
  }

  return (
    <PageWrapper>
      <main className="min-h-screen pt-32 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
              Student Dashboard
            </h1>
            <p className="text-muted-foreground">
              Upload and manage your portfolio submissions
            </p>
          </motion.div>

          {/* Upload Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="glass-strong"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              New Submission
            </Button>
          </motion.div>

          {/* Upload Form */}
          {showUploadForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <Card className="glass-strong p-6">
                <form onSubmit={handleFileUpload} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="glass-effect"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="glass-effect"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="file">File * (PDF, DOCX, JPG, PNG, ZIP - Max 10MB)</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.docx,.jpg,.jpeg,.png,.zip"
                      onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                      required
                      className="glass-effect"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={uploading}>
                      <Upload className="mr-2 h-4 w-4" />
                      {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowUploadForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}

          {/* Submissions List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map((submission, index) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className="glass-effect p-6 hover:scale-105 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <FileText className="h-8 w-8 text-primary" />
                    {getStatusIcon(submission.status)}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{submission.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{submission.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">Status:</span>
                      <span className={`capitalize ${
                        submission.status === 'approved' ? 'text-green-500' :
                        submission.status === 'rejected' ? 'text-red-500' :
                        'text-yellow-500'
                      }`}>
                        {submission.status}
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      {new Date(submission.created_at).toLocaleDateString()}
                    </p>
                    {submission.feedback && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <p className="font-semibold mb-1">Feedback:</p>
                        <p className="text-muted-foreground">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {submissions.length === 0 && !showUploadForm && (
            <Card className="glass-effect p-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No submissions yet. Click "New Submission" to get started.</p>
            </Card>
          )}
        </div>
      </main>
    </PageWrapper>
  );
}
