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

  const handleRoleSelection = async (role: 'visitor' | 'student' | 'teacher') => {
    setLoading(true);
    try {
      if (role === 'visitor') {
        // Visitors get immediate access - assign role directly
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'visitor' });

        if (roleError) throw roleError;

        toast({
          title: 'Welcome!',
          description: 'You have been granted visitor access.',
        });
        onOpenChange(false);
        navigate('/visitor-portal');
      } else {
        // Students and teachers need approval
        const { error } = await supabase
          .from('pending_role_requests')
          .insert({
            user_id: userId,
            requested_role: role,
            status: 'pending',
          });

        if (error) {
          // Check if request already exists
          if (error.code === '23505') {
            toast({
              title: 'Request Already Exists',
              description: `You already have a pending ${role} request. Please wait for admin approval.`,
              variant: 'destructive',
            });
          } else {
            throw error;
          }
        } else {
          toast({
            title: 'Request Submitted',
            description: `Your ${role} access request has been submitted. An administrator will review it shortly.`,
          });
          
          // Assign visitor role temporarily so they can browse
          await supabase
            .from('user_roles')
            .insert({ user_id: userId, role: 'visitor' })
            .then(() => {
              onOpenChange(false);
              navigate('/visitor-portal');
            });
        }
      }
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
      description: 'Access your portfolio, projects, and academic records',
      icon: GraduationCap,
      color: 'from-purple-500 to-pink-500',
      approvalNeeded: true,
    },
    {
      id: 'teacher',
      title: 'Teacher',
      description: 'Manage student data and review portfolios',
      icon: BookOpen,
      color: 'from-orange-500 to-red-500',
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

        {/* Admin Section */}
        <div className="mt-4 pt-6 border-t border-border/50">
          <Card className="glass-strong p-4 bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gradient-to-br from-primary to-accent">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Administrator Access</h4>
                <p className="text-sm text-muted-foreground">
                  Requires special permission from the system owner
                </p>
              </div>
              <Button variant="secondary" disabled>
                Contact Owner
              </Button>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
