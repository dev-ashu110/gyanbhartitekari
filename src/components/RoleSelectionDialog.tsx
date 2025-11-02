import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RoleSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export const RoleSelectionDialog = ({ open, onOpenChange, userId }: RoleSelectionDialogProps) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRoleSelection = async (role: 'visitor' | 'student' | 'teacher' | 'admin') => {
    setLoading(true);
    try {
      if (role === 'visitor') {
        // Visitors get immediate access
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert([{ user_id: userId, role: 'visitor' }], { onConflict: 'user_id,role', ignoreDuplicates: true });

        if (roleError) throw roleError;

        toast({
          title: 'Welcome!',
          description: 'You have been granted visitor access.',
        });
        onOpenChange(false);
        navigate('/visitor-portal');
      } else {
        // Students, teachers, and admins need approval
        const { error } = await supabase
          .from('pending_role_requests')
          .insert([{
            user_id: userId,
            requested_role: role,
            status: 'pending',
          }]);

        if (error) {
          if (error.code === '23505') {
            toast({
              title: 'Request Already Exists',
              description: `You already have a pending ${role} request.`,
              variant: 'destructive',
            });
          } else {
            throw error;
          }
        } else {
          toast({
            title: 'Request Submitted',
            description: `Your ${role} access request has been submitted. An admin will review it soon.`,
          });
          
          // Assign visitor role temporarily
          await supabase
            .from('user_roles')
            .upsert([{ user_id: userId, role: 'visitor' }], { onConflict: 'user_id,role', ignoreDuplicates: true });
          
          onOpenChange(false);
          navigate('/visitor-portal');
        }
      }
    } catch (error: any) {
      console.error('Role selection error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process role selection. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: 'visitor',
      title: 'Visitor',
      description: 'Explore school information, faculty, and programs',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      approvalNeeded: false,
    },
    {
      id: 'student',
      title: 'Student',
      description: 'Access portfolio, submit projects and assignments',
      icon: GraduationCap,
      color: 'from-purple-500 to-pink-500',
      approvalNeeded: true,
    },
    {
      id: 'teacher',
      title: 'Teacher',
      description: 'Review student submissions and provide feedback',
      icon: BookOpen,
      color: 'from-orange-500 to-red-500',
      approvalNeeded: true,
    },
    {
      id: 'admin',
      title: 'Admin',
      description: 'Manage school content, approvals, and system settings',
      icon: Shield,
      color: 'from-red-500 to-pink-500',
      approvalNeeded: true,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-3xl text-center text-gradient">
            What describes you perfectly?
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            Select your role to continue with the appropriate access level
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="glass-effect p-6 hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-primary group"
                  onClick={() => !loading && handleRoleSelection(role.id as any)}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`p-4 rounded-full bg-gradient-to-br ${role.color}`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold">{role.title}</h3>
                    
                    <p className="text-sm text-muted-foreground">
                      {role.description}
                    </p>

                    {role.approvalNeeded && (
                      <div className="text-xs text-amber-500 font-medium bg-amber-500/10 px-3 py-1 rounded-full">
                        Requires Admin Approval
                      </div>
                    )}

                    <Button
                      className="w-full"
                      variant={role.approvalNeeded ? 'outline' : 'default'}
                      disabled={loading}
                    >
                      {role.approvalNeeded ? 'Request Access' : 'Continue'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Admin Note */}
        <div className="mt-4 pt-6 border-t border-border/50">
          <p className="text-center text-sm text-muted-foreground">
            Admin requests require approval. Contact your system administrator for assistance.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
