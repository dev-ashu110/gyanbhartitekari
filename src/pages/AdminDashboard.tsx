import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  TrendingUp,
  Shield,
  LogOut,
  ExternalLink
} from 'lucide-react';

interface DashboardStats {
  totalStudents: number;
  totalProjects: number;
  totalPortfolios: number;
  recentSignups: number;
}

interface Student {
  id: string;
  student_name: string;
  admission_no: string;
  class: string;
  section: string;
  parent_email: string | null;
  parent_phone: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalProjects: 0,
    totalPortfolios: 0,
    recentSignups: 0,
  });
  const [students, setStudents] = useState<Student[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (roleError || !roleData) {
        toast({
          title: 'Access Denied',
          description: 'You do not have admin privileges.',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      setIsAdmin(true);
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch total students
      const { count: studentsCount } = await supabase
        .from('student_data')
        .select('*', { count: 'exact', head: true });

      // Fetch total projects
      const { count: projectsCount } = await supabase
        .from('student_projects')
        .select('*', { count: 'exact', head: true });

      // Fetch total portfolios
      const { count: portfoliosCount } = await supabase
        .from('student_portfolios')
        .select('*', { count: 'exact', head: true });

      // Fetch recent signups (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: recentCount } = await supabase
        .from('student_data')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      setStats({
        totalStudents: studentsCount || 0,
        totalProjects: projectsCount || 0,
        totalPortfolios: portfoliosCount || 0,
        recentSignups: recentCount || 0,
      });

      // Fetch all students
      const { data: studentsData, error: studentsError } = await supabase
        .from('student_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (studentsError) throw studentsError;
      setStudents(studentsData || []);
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
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: BookOpen,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Portfolio Items',
      value: stats.totalPortfolios,
      icon: GraduationCap,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Recent Signups',
      value: stats.recentSignups,
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gradient">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage students and monitor school activities</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-strong">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                      </div>
                      <div className={`${stat.bgColor} p-3 rounded-full`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Students Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-strong">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Student Management</CardTitle>
                  <CardDescription>View and manage all registered students</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="all">All Students</TabsTrigger>
                  <TabsTrigger value="recent">Recent (30 days)</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4 mt-6">
                  <div className="space-y-4">
                    {students.map((student) => (
                      <Card key={student.id} className="glass-effect">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">{student.student_name}</h3>
                                <Badge variant="outline">Class {student.class}-{student.section}</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p>Admission No: {student.admission_no}</p>
                                {student.parent_email && <p>Parent Email: {student.parent_email}</p>}
                                {student.parent_phone && <p>Parent Phone: {student.parent_phone}</p>}
                                <p>Joined: {new Date(student.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <Button 
                              asChild 
                              variant="outline" 
                              size="sm"
                            >
                              <a href={`/profile/${student.id}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Profile
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {students.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No students registered yet.
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="recent" className="space-y-4 mt-6">
                  <div className="space-y-4">
                    {students
                      .filter((student) => {
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        return new Date(student.created_at) >= thirtyDaysAgo;
                      })
                      .map((student) => (
                        <Card key={student.id} className="glass-effect">
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-lg">{student.student_name}</h3>
                                  <Badge variant="outline">Class {student.class}-{student.section}</Badge>
                                  <Badge variant="secondary">New</Badge>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <p>Admission No: {student.admission_no}</p>
                                  {student.parent_email && <p>Parent Email: {student.parent_email}</p>}
                                  <p>Joined: {new Date(student.created_at).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <Button 
                                asChild 
                                variant="outline" 
                                size="sm"
                              >
                                <a href={`/profile/${student.id}`} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  View Profile
                                </a>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    
                    {students.filter((student) => {
                      const thirtyDaysAgo = new Date();
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                      return new Date(student.created_at) >= thirtyDaysAgo;
                    }).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No recent signups in the last 30 days.
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
