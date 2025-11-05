import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, FileCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import PageWrapper from '@/components/PageWrapper';
import { AccessDenied } from '@/components/AccessDenied';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Submission {
  id: string;
  user_id: string;
  title: string;
  description: string;
  file_url: string;
  status: string;
  feedback: string | null;
  created_at: string;
  student_name: string;
}

export default function TeacherDashboard() {
  const [user, setUser] = useState<any>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isTeacher, setIsTeacher] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

      if (!roleData || roleData.role !== 'teacher') {
        setIsTeacher(false);
        setLoading(false);
        return;
      }

      setIsTeacher(true);
      await fetchSubmissions();
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    const { data, error } = await supabase
      .from('submissions' as any)
      .select(`
        *,
        student_data!inner(student_name)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const formatted = data.map((s: any) => ({
        ...s,
        student_name: s.student_data?.student_name || 'Unknown Student',
      }));
      setSubmissions(formatted);
    }
  };

  const handleReview = async (submissionId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await (supabase as any)
        .from('submissions')
        .update({
          status,
          feedback: feedback || null,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast({
        title: 'Review submitted',
        description: `Submission ${status}`,
      });

      setSelectedSubmission(null);
      setFeedback('');
      await fetchSubmissions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
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

  if (!isTeacher) {
    return <AccessDenied title="Teacher Access Only" message="You need to have a teacher role to access this dashboard." />;
  }

  const pendingCount = submissions.filter(s => s.status === 'pending').length;

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
              Teacher Dashboard
            </h1>
            <p className="text-muted-foreground">
              Review and approve student submissions
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="glass-strong p-6">
              <div className="flex items-center gap-4">
                <Clock className="h-10 w-10 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold">{pendingCount}</p>
                </div>
              </div>
            </Card>

            <Card className="glass-strong p-6">
              <div className="flex items-center gap-4">
                <FileCheck className="h-10 w-10 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-3xl font-bold">
                    {submissions.filter(s => s.status === 'approved').length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="glass-strong p-6">
              <div className="flex items-center gap-4">
                <Users className="h-10 w-10 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-3xl font-bold">{submissions.length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Submissions List */}
          <div className="space-y-4">
            {submissions.map((submission, index) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-effect p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{submission.title}</h3>
                        <span className={`text-sm px-3 py-1 rounded-full ${
                          submission.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                          submission.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                          'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {submission.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Student: {submission.student_name}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        {submission.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted: {new Date(submission.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => window.open(submission.file_url, '_blank')}
                        variant="outline"
                        size="sm"
                      >
                        View File
                      </Button>
                      {submission.status === 'pending' && (
                        <Button
                          onClick={() => setSelectedSubmission(
                            selectedSubmission === submission.id ? null : submission.id
                          )}
                          size="sm"
                        >
                          Review
                        </Button>
                      )}
                    </div>
                  </div>

                  {selectedSubmission === submission.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-border"
                    >
                      <Textarea
                        placeholder="Add feedback (optional)"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="glass-effect mb-4"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleReview(submission.id, 'approved')}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReview(submission.id, 'rejected')}
                          variant="destructive"
                        >
                          Reject
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedSubmission(null);
                            setFeedback('');
                          }}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {submission.feedback && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-semibold mb-1">Feedback:</p>
                      <p className="text-sm text-muted-foreground">{submission.feedback}</p>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          {submissions.length === 0 && (
            <Card className="glass-effect p-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No submissions to review yet.</p>
            </Card>
          )}
        </div>
      </main>
    </PageWrapper>
  );
}
