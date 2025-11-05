import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { EventManager } from '@/components/admin/EventManager';
import { NoticeManager } from '@/components/admin/NoticeManager';
import { GalleryManager } from '@/components/admin/GalleryManager';
import { TimetableManager } from '@/components/admin/TimetableManager';
import { PageTransition } from '@/components/PageTransition';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  TrendingUp,
  Shield,
  LogOut,
  ExternalLink,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  Bell,
  Image,
  CalendarClock
} from 'lucide-react';

interface DashboardStats {
  totalStudents: number;
  totalProjects: number;
  totalPortfolios: number;
  recentSignups: number;
  pendingApprovals: number;
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

interface PendingRequest {
  id: string;
  user_id: string;
  requested_role: string;
  status: string;
  requested_at: string;
  profiles: {
    full_name: string;
  } | null;
}

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalProjects: 0,
    totalPortfolios: 0,
    recentSignups: 0,
    pendingApprovals: 0,
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
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

      // Let RLS policies handle authorization naturally by attempting to fetch admin-only data
      await fetchDashboardData();
      setIsAdmin(true);
    } catch (error: any) {
      // If RLS policy violation, user is not admin
      toast({
        title: 'Access Denied',
        description: 'You do not have admin privileges.',
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

      // Fetch pending role requests
      const { count: pendingCount } = await supabase
        .from('pending_role_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        totalStudents: studentsCount || 0,
        totalProjects: projectsCount || 0,
        totalPortfolios: portfoliosCount || 0,
        recentSignups: recentCount || 0,
        pendingApprovals: pendingCount || 0,
      });

      // Fetch all students
      const { data: studentsData, error: studentsError } = await supabase
        .from('student_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (studentsError) throw studentsError;
      setStudents(studentsData || []);

      // Fetch pending requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('pending_role_requests')
        .select('*')
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (requestsError) throw requestsError;
      
      // Fetch profile info for each request
      const enrichedRequests = await Promise.all(
        (requestsData || []).map(async (request) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', request.user_id)
            .single();
          
          return {
            ...request,
            profiles: profileData,
          };
        })
      );
      
      setPendingRequests(enrichedRequests);
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

  const handleApproval = async (requestId: string, userId: string, role: string, approve: boolean) => {
    try {
      if (approve) {
        // Add role to user_roles
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([{
            user_id: userId,
            role: role as any,
          }]);

        if (roleError) throw roleError;

        // Update request status
        const { data: { user } } = await supabase.auth.getUser();
        const { error: requestError } = await supabase
          .from('pending_role_requests')
          .update({
            status: 'approved',
            reviewed_by: user?.id,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', requestId);

        if (requestError) throw requestError;

        toast({
          title: 'Approved',
          description: `User has been granted ${role} access`,
        });
      } else {
        // Reject request
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
          .from('pending_role_requests')
          .update({
            status: 'rejected',
            reviewed_by: user?.id,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', requestId);

        if (error) throw error;

        toast({
          title: 'Rejected',
          description: 'Access request has been rejected',
        });
      }

      await fetchDashboardData();
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
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  return (
    <PageTransition>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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

        {/* Pending Role Requests */}
        {pendingRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card className="glass-strong">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-6 w-6 text-yellow-500" />
                  <div>
                    <CardTitle>Pending Role Requests</CardTitle>
                    <CardDescription>Review and approve or reject user role requests</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <Card key={request.id} className="glass-effect">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">
                                {request.profiles?.full_name || 'Unknown User'}
                              </h3>
                              <Badge variant="outline" className="uppercase">
                                {request.requested_role}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Requested: {new Date(request.requested_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApproval(request.id, request.user_id, request.requested_role, true)}
                              className="bg-green-500 hover:bg-green-600"
                              size="sm"
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleApproval(request.id, request.user_id, request.requested_role, false)}
                              variant="destructive"
                              size="sm"
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

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
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-2">
                  <TabsTrigger value="all">All Students</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="events">
                    <Calendar className="h-4 w-4 mr-2" />
                    Events
                  </TabsTrigger>
                  <TabsTrigger value="notices">
                    <Bell className="h-4 w-4 mr-2" />
                    Notices
                  </TabsTrigger>
                  <TabsTrigger value="gallery">
                    <Image className="h-4 w-4 mr-2" />
                    Gallery
                  </TabsTrigger>
                  <TabsTrigger value="timetable">
                    <CalendarClock className="h-4 w-4 mr-2" />
                    Timetable
                  </TabsTrigger>
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

                <TabsContent value="events" className="mt-6">
                  <EventManager />
                </TabsContent>

                <TabsContent value="notices" className="mt-6">
                  <NoticeManager />
                </TabsContent>

                <TabsContent value="gallery" className="mt-6">
                  <GalleryManager />
                </TabsContent>

                <TabsContent value="timetable" className="mt-6">
                  <TimetableManager />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
