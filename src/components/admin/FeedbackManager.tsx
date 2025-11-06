import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Star, Send, Filter, RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Feedback {
  id: string;
  user_id: string;
  category: string;
  message: string;
  rating: number;
  status: string;
  admin_reply: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
  } | null;
}

export const FeedbackManager = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchFeedbacks();
    subscribeToFeedbacks();
  }, []);

  const subscribeToFeedbacks = () => {
    const channel = supabase
      .channel('feedback-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback' }, () => {
        fetchFeedbacks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich with profile data
      const enriched = await Promise.all(
        (data || []).map(async (feedback) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', feedback.user_id)
            .maybeSingle();

          return { ...feedback, profiles: profile };
        })
      );

      setFeedbacks(enriched);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load feedback',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (feedbackId: string) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({
          admin_reply: replyText,
          status: 'responded',
        })
        .eq('id', feedbackId);

      if (error) throw error;

      toast({
        title: 'Reply Sent',
        description: 'Your response has been recorded',
      });

      setReplyingTo(null);
      setReplyText('');
      fetchFeedbacks();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredFeedbacks = feedbacks.filter((f) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return f.status === 'pending';
    if (filter === 'responded') return f.status === 'responded';
    return f.category === filter;
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="inline-block"
        >
          <MessageSquare className="h-16 w-16 text-primary" />
        </motion.div>
        <h3 className="text-xl font-bold text-foreground mb-2 mt-4">Loading Feedback...</h3>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header with Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-primary/10">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">Feedback Management</h3>
            <p className="text-sm text-muted-foreground">
              {filteredFeedbacks.length} {filteredFeedbacks.length === 1 ? 'feedback' : 'feedbacks'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px] glass">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Feedback</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
              <SelectItem value="ui">UI Issues</SelectItem>
              <SelectItem value="feature">Features</SelectItem>
              <SelectItem value="bug">Bugs</SelectItem>
              <SelectItem value="suggestion">Suggestions</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchFeedbacks} variant="outline" size="sm" className="rounded-full">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Feedback Grid */}
      <div className="grid gap-4">
        <AnimatePresence>
          {filteredFeedbacks.map((feedback, index) => (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="glass group hover:glass-strong transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-foreground">
                          {feedback.profiles?.full_name || 'Anonymous User'}
                        </h4>
                        <Badge variant="outline" className="capitalize">
                          {feedback.category}
                        </Badge>
                        <Badge variant={feedback.status === 'pending' ? 'secondary' : 'default'}>
                          {feedback.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(feedback.created_at).toLocaleString()}
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < feedback.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <p className="text-muted-foreground">{feedback.message}</p>

                  {/* Admin Reply */}
                  {feedback.admin_reply && (
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-sm font-semibold text-foreground mb-1">Admin Response:</p>
                      <p className="text-sm text-muted-foreground">{feedback.admin_reply}</p>
                    </div>
                  )}

                  {/* Reply Section */}
                  {replyingTo === feedback.id ? (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Type your response..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="glass"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleReply(feedback.id)}>
                          <Send className="h-4 w-4 mr-2" />
                          Send Reply
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    !feedback.admin_reply && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setReplyingTo(feedback.id)}
                        className="rounded-full"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                    )
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredFeedbacks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Feedback Yet</h3>
          <p className="text-muted-foreground">User feedback will appear here</p>
        </motion.div>
      )}
    </motion.div>
  );
};
