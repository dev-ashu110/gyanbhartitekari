import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, UserCheck, UserX, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PageWrapper from '@/components/PageWrapper';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Approval {
  id: string;
  user_id: string;
  requested_role: string;
  status: string;
  requested_at: string;
  user_email: string;
}

const OWNER_EMAIL = 'ashu1592125@gmail.com';

export default function OwnerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser || authUser.email !== OWNER_EMAIL) {
        toast({
          title: 'Access Denied',
          description: 'This page is restricted to the system owner',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      setUser(authUser);
      await fetchApprovals();
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovals = async () => {
    const { data, error } = await supabase
      .from('approvals' as any)
      .select('*')
      .order('requested_at', { ascending: false });

    if (!error && data) {
      setApprovals(data as any);
    }
  };

  const handleApproval = async (approvalId: string, userId: string, role: string, approve: boolean) => {
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

        // Update approval status
        const { error: approvalError } = await (supabase as any)
          .from('approvals')
          .update({
            status: 'approved',
            approved_by: user.id,
            approved_at: new Date().toISOString(),
          })
          .eq('id', approvalId);

        if (approvalError) throw approvalError;

        toast({
          title: 'Approved',
          description: `User has been granted ${role} access`,
        });
      } else {
        // Reject approval
        const { error } = await (supabase as any)
          .from('approvals')
          .update({
            status: 'rejected',
            approved_by: user.id,
            approved_at: new Date().toISOString(),
          })
          .eq('id', approvalId);

        if (error) throw error;

        toast({
          title: 'Rejected',
          description: 'Access request has been rejected',
        });
      }

      await fetchApprovals();
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

  const pendingApprovals = approvals.filter(a => a.status === 'pending');
  const approvedCount = approvals.filter(a => a.status === 'approved').length;
  const rejectedCount = approvals.filter(a => a.status === 'rejected').length;

  return (
    <PageWrapper>
      <main className="min-h-screen pt-32 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-10 w-10 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-gradient">
                Owner Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground">
              System administration and approval management
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-strong p-6">
              <div className="flex items-center gap-4">
                <Clock className="h-10 w-10 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold">{pendingApprovals.length}</p>
                </div>
              </div>
            </Card>

            <Card className="glass-strong p-6">
              <div className="flex items-center gap-4">
                <UserCheck className="h-10 w-10 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-3xl font-bold">{approvedCount}</p>
                </div>
              </div>
            </Card>

            <Card className="glass-strong p-6">
              <div className="flex items-center gap-4">
                <UserX className="h-10 w-10 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-3xl font-bold">{rejectedCount}</p>
                </div>
              </div>
            </Card>

            <Card className="glass-strong p-6">
              <div className="flex items-center gap-4">
                <Users className="h-10 w-10 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-3xl font-bold">{approvals.length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Pending Approvals */}
          {pendingApprovals.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Pending Approvals</h2>
              <div className="space-y-4">
                {pendingApprovals.map((approval, index) => (
                  <motion.div
                    key={approval.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="glass-effect p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{approval.user_email}</h3>
                            <span className="text-sm px-3 py-1 rounded-full bg-primary/20 text-primary font-semibold uppercase">
                              {approval.requested_role}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Requested: {new Date(approval.requested_at).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApproval(approval.id, approval.user_id, approval.requested_role, true)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleApproval(approval.id, approval.user_id, approval.requested_role, false)}
                            variant="destructive"
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* All Approvals History */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Approval History</h2>
            <div className="space-y-4">
              {approvals.map((approval, index) => (
                <motion.div
                  key={approval.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Card className="glass-effect p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold">{approval.user_email}</h3>
                          <span className="text-sm px-3 py-1 rounded-full bg-primary/20 text-primary font-semibold uppercase">
                            {approval.requested_role}
                          </span>
                          <span className={`text-sm px-3 py-1 rounded-full ${
                            approval.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                            approval.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                            'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {approval.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Requested: {new Date(approval.requested_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {approvals.length === 0 && (
              <Card className="glass-effect p-12 text-center">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No approval requests yet.</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </PageWrapper>
  );
}
