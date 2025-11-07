import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  ShieldCheck, 
  Mail, 
  Calendar,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Ban,
  Trash2,
  Shield,
  BookOpen,
  GraduationCap,
  UserCog
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  status: string;
  created_at: string;
  role: string | null;
}

const ROLES = [
  { value: 'visitor', label: 'Visitor', icon: Users },
  { value: 'student', label: 'Student', icon: GraduationCap },
  { value: 'teacher', label: 'Teacher', icon: BookOpen },
  { value: 'admin', label: 'Admin', icon: Shield },
];

export const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; newRole: string } | null>(null);
  const [actionDialog, setActionDialog] = useState<{ type: 'ban' | 'unban' | 'delete'; userId: string; userName: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    subscribeToChanges();
  }, []);

  const subscribeToChanges = () => {
    const channel = supabase
      .channel('user-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUsers();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_roles' }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, status, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine profiles with their roles
      const usersWithRoles: UserProfile[] = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role || null
        };
      });

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;

    try {
      const { id, newRole } = selectedUser;

      // Check if user already has any role
      const { data: existingRoles } = await supabase
        .from('user_roles')
        .select('id, role')
        .eq('user_id', id);

      if (existingRoles && existingRoles.length > 0) {
        // Update existing role
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({ role: newRole as any })
          .eq('user_id', id);

        if (updateError) throw updateError;
      } else {
        // Insert new role
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: id,
            role: newRole as any,
          });

        if (insertError) throw insertError;
      }

      // Update status to active when role is assigned
      await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', id);

      toast({
        title: 'Role Updated',
        description: `User role has been changed to ${newRole}`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSelectedUser(null);
    }
  };

  const handleBanUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'banned' })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'User Banned',
        description: 'The user has been successfully banned.',
      });
      
      fetchUsers();
    } catch (error: any) {
      console.error('Error banning user:', error);
      toast({
        title: 'Error',
        description: 'Failed to ban user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActionDialog(null);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'User Unbanned',
        description: 'The user has been successfully unbanned.',
      });
      
      fetchUsers();
    } catch (error: any) {
      console.error('Error unbanning user:', error);
      toast({
        title: 'Error',
        description: 'Failed to unban user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActionDialog(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Delete from user_roles first (foreign key constraint)
      await supabase.from('user_roles').delete().eq('user_id', userId);
      
      // Delete profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'User Deleted',
        description: 'The user has been successfully deleted.',
      });
      
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActionDialog(null);
    }
  };

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'teacher':
        return 'default';
      case 'student':
        return 'secondary';
      case 'visitor':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getRoleIcon = (role: string | null) => {
    switch (role) {
      case 'admin':
        return Shield;
      case 'teacher':
        return BookOpen;
      case 'student':
        return GraduationCap;
      case 'visitor':
        return Users;
      default:
        return UserCog;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="inline-block"
        >
          <Users className="h-16 w-16 text-primary" />
        </motion.div>
        <h3 className="text-xl font-bold text-foreground mb-2 mt-4">Loading Users...</h3>
        <p className="text-muted-foreground">Fetching user data</p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">User Management</h3>
              <p className="text-sm text-muted-foreground">
                {users.length} {users.length === 1 ? 'user' : 'users'} registered
              </p>
            </div>
          </div>
          <Button onClick={fetchUsers} variant="outline" size="sm" className="rounded-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Users Grid */}
        <div className="grid gap-4">
          <AnimatePresence>
            {users.map((user, index) => {
              const RoleIcon = getRoleIcon(user.role);
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="glass group hover:glass-strong transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* User Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <RoleIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg flex items-center gap-2">
                                {user.full_name || 'Unnamed User'}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {user.email || 'No email'}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge 
                              variant={user.status === 'banned' ? 'destructive' : user.status === 'active' ? 'default' : 'outline'}
                            >
                              {user.status === 'banned' && <Ban className="h-3 w-3 mr-1" />}
                              {user.status === 'active' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                              {user.status === 'pending' && <XCircle className="h-3 w-3 mr-1" />}
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </Badge>
                          </div>
                        </div>

                        {/* User Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border/50">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Joined</span>
                            <span className="text-sm font-medium flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(user.created_at), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Current Role</span>
                            <Badge variant={getRoleBadgeVariant(user.role)}>
                              {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'No Role'}
                            </Badge>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-border/50">
                          <div className="flex-1">
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">
                              Assign Role
                            </label>
                            <Select
                              value={user.role || ''}
                              onValueChange={(newRole) => {
                                setSelectedUser({
                                  id: user.id,
                                  name: user.full_name || 'User',
                                  newRole
                                });
                              }}
                            >
                              <SelectTrigger className="glass">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLES.map((role) => {
                                  const Icon = role.icon;
                                  return (
                                    <SelectItem key={role.value} value={role.value}>
                                      <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        {role.label}
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex gap-2">
                            {user.status === 'banned' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setActionDialog({ type: 'unban', userId: user.id, userName: user.full_name || 'User' })}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Unban
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setActionDialog({ type: 'ban', userId: user.id, userName: user.full_name || 'User' })}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Ban
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setActionDialog({ type: 'delete', userId: user.id, userName: user.full_name || 'User' })}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {users.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Users Yet</h3>
            <p className="text-muted-foreground">Users will appear here once they register</p>
          </motion.div>
        )}
      </motion.div>

      {/* Role Change Confirmation Dialog */}
      <AlertDialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <AlertDialogContent className="glass-strong">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change <strong>{selectedUser?.name}</strong>'s role to{' '}
              <strong className="capitalize">{selectedUser?.newRole}</strong>?
              <br />
              <br />
              This will update their access permissions immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRoleChange}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban/Unban/Delete Confirmation Dialog */}
      <AlertDialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <AlertDialogContent className="glass-strong">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog?.type === 'ban' && 'Ban User'}
              {actionDialog?.type === 'unban' && 'Unban User'}
              {actionDialog?.type === 'delete' && 'Delete User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog?.type === 'ban' && (
                <>
                  Are you sure you want to ban <strong>{actionDialog.userName}</strong>? They will not be able to log in until unbanned.
                </>
              )}
              {actionDialog?.type === 'unban' && (
                <>
                  Are you sure you want to unban <strong>{actionDialog.userName}</strong>? They will be able to log in again.
                </>
              )}
              {actionDialog?.type === 'delete' && (
                <>
                  Are you sure you want to permanently delete <strong>{actionDialog?.userName}</strong>? This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (actionDialog?.type === 'ban') {
                  handleBanUser(actionDialog.userId);
                } else if (actionDialog?.type === 'unban') {
                  handleUnbanUser(actionDialog.userId);
                } else if (actionDialog?.type === 'delete') {
                  handleDeleteUser(actionDialog.userId);
                }
              }}
              className={actionDialog?.type === 'delete' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {actionDialog?.type === 'ban' && 'Ban User'}
              {actionDialog?.type === 'unban' && 'Unban User'}
              {actionDialog?.type === 'delete' && 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};