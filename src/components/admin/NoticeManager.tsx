import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, Trash2, Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  date: string;
}

export const NoticeManager = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Event',
    pinned: false,
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchNotices();

    // Real-time subscription
    const channel = supabase
      .channel('notices-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notices' },
        () => {
          fetchNotices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotices = async () => {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch notices',
        variant: 'destructive',
      });
    } else {
      setNotices(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingNotice) {
        const { error } = await supabase
          .from('notices')
          .update(formData)
          .eq('id', editingNotice.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Notice updated successfully!',
        });
      } else {
        const { error } = await supabase.from('notices').insert([formData]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Notice created successfully!',
        });
      }

      setDialogOpen(false);
      setEditingNotice(null);
      setFormData({
        title: '',
        content: '',
        category: 'Event',
        pinned: false,
        date: new Date().toISOString().split('T')[0],
      });
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;

    setLoading(true);
    const { error } = await supabase.from('notices').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete notice',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Notice deleted successfully!',
      });
    }
    setLoading(false);
  };

  const openEditDialog = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      pinned: notice.pinned,
      date: notice.date,
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Notices</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Notice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingNotice ? 'Edit Notice' : 'Create New Notice'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={6}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pinned"
                  checked={formData.pinned}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, pinned: checked as boolean })
                  }
                />
                <Label htmlFor="pinned">Pin this notice</Label>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingNotice ? (
                  'Update Notice'
                ) : (
                  'Create Notice'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {notices.map((notice) => (
          <Card key={notice.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold">{notice.title}</h3>
                  {notice.pinned && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                      Pinned
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {notice.content}
                </p>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <span>📅 {notice.date}</span>
                  <span>🏷️ {notice.category}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => openEditDialog(notice)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(notice.id)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
