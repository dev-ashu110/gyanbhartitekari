import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, UserPlus } from 'lucide-react';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Defer any Supabase calls to avoid deadlocks
        setTimeout(() => {
          checkUserRole(session.user.id);
        }, 0);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setTimeout(() => {
          checkUserRole(session.user.id);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUserRole = async (userId: string) => {
    try {
      // Check if user is banned
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      if (profile?.status === 'banned') {
        await supabase.auth.signOut();
        toast({
          title: 'Access Denied',
          description: 'Your account has been suspended. Please contact the administrator.',
          variant: 'destructive',
        });
        return;
      }

      // Check user role
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .limit(1);

      if (error && (error as any)?.code !== 'PGRST116') {
        throw error;
      }

      if (roles && roles.length > 0) {
        const userRole = roles[0].role;
        redirectByRole(userRole);
      } else {
        // No role assigned yet - show pending message
        toast({
          title: 'Account Created Successfully!',
          description: 'Waiting for admin approval to assign your role. You will be notified once approved.',
        });
        navigate('/');
      }
    } catch (error: any) {
      console.error('Error checking user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify account status. Please try again.',
        variant: 'destructive',
      });
      navigate('/');
    }
  };

  const redirectByRole = (role: string) => {
    switch (role) {
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'teacher':
        navigate('/admin-dashboard');
        break;
      case 'student':
        navigate('/student-portfolio');
        break;
      case 'visitor':
        navigate('/visitor-portal');
        break;
      default:
        navigate('/');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { full_name: fullName },
        },
      });

      if (error) throw error;

      toast({
        title: 'Account Created Successfully!',
        description: 'Waiting for admin approval to assign your role. You will be notified once approved.',
      });
      
      // Clear form
      setEmail('');
      setPassword('');
      setFullName('');
    } catch (error: any) {
      console.error('Sign up error:', error);
      const msg = String(error?.message || '').toLowerCase();
      if (msg.includes('already') && msg.includes('user')) {
        toast({
          title: 'Account exists',
          description: 'An account with this email already exists. Please sign in.',
        });
      } else {
        toast({
          title: 'Sign up failed',
          description: error?.message || 'Unable to sign up. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
    } catch (error: any) {
      const msg = String(error?.message || '').toLowerCase();
      toast({
        title: 'Sign in failed',
        description: msg.includes('invalid login credentials')
          ? 'Invalid email or password.'
          : (error?.message || 'Unable to sign in. Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md mx-auto"
          >
            <Card className="glass-strong">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-gradient">
                  Welcome
                </CardTitle>
                <CardDescription>
                  Sign in or create an account to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email">Email</Label>
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="glass-effect"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signin-password">Password</Label>
                        <Input
                          id="signin-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="glass-effect"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            <LogIn className="mr-2 h-4 w-4" />
                            Sign In
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Full name</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          className="glass-effect"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="glass-effect"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          className="glass-effect"
                        />
                        <p className="text-xs text-muted-foreground">
                          Password must be at least 6 characters
                        </p>
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Sign Up
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

    </>
  );
};

export default Auth;
