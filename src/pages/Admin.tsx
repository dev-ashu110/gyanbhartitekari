import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Notice {
  id: number;
  title: string;
  date: string;
  category: string;
  pinned: boolean;
  content: string;
}

export default function Admin() {
  const { toast } = useToast();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Event',
    pinned: false,
    content: '',
  });

  useEffect(() => {
    // Load notices from localStorage
    const saved = localStorage.getItem('schoolNotices');
    if (saved) {
      setNotices(JSON.parse(saved));
    }
  }, []);

  const saveNotices = (updatedNotices: Notice[]) => {
    localStorage.setItem('schoolNotices', JSON.stringify(updatedNotices));
    setNotices(updatedNotices);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (editingNotice) {
      // Update existing notice
      const updated = notices.map((n) =>
        n.id === editingNotice.id
          ? { ...editingNotice, ...formData, date: new Date().toISOString().split('T')[0] }
          : n
      );
      saveNotices(updated);
      toast({ title: 'Notice Updated', description: 'The notice has been updated successfully.' });
    } else {
      // Create new notice
      const newNotice: Notice = {
        id: Date.now(),
        ...formData,
        date: new Date().toISOString().split('T')[0],
      };
      saveNotices([newNotice, ...notices]);
      toast({ title: 'Notice Created', description: 'New notice has been published successfully.' });
    }

    resetForm();
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      category: notice.category,
      pinned: notice.pinned,
      content: notice.content,
    });
    setIsEditing(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this notice?')) {
      const updated = notices.filter((n) => n.id !== id);
      saveNotices(updated);
      toast({ title: 'Notice Deleted', description: 'The notice has been removed.' });
    }
  };

  const resetForm = () => {
    setFormData({ title: '', category: 'Event', pinned: false, content: '' });
    setEditingNotice(null);
    setIsEditing(false);
  };

  return (
    <main className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 text-gradient">Admin Panel</h1>
          <p className="text-xl text-muted-foreground">Manage notices and announcements</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Editor Form */}
          <Card className="glass-strong p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {editingNotice ? 'Edit Notice' : 'Create New Notice'}
              </h2>
              {isEditing && (
                <Button variant="ghost" size="icon" onClick={resetForm} className="rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Notice title"
                  className="glass rounded-2xl"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="glass rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Event">Event</SelectItem>
                    <SelectItem value="Holiday">Holiday</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Facility">Facility</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="pinned"
                  checked={formData.pinned}
                  onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="pinned" className="text-sm font-medium text-foreground">
                  Pin this notice
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Content *</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Notice content..."
                  rows={6}
                  className="glass rounded-2xl resize-none"
                  required
                />
              </div>

              <Button type="submit" className="w-full rounded-full" size="lg">
                <Save className="mr-2 h-5 w-5" />
                {editingNotice ? 'Update Notice' : 'Publish Notice'}
              </Button>
            </form>
          </Card>

          {/* Notices List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Published Notices</h2>
              <Badge>{notices.length} total</Badge>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {notices.length === 0 ? (
                <Card className="glass p-8 rounded-3xl text-center">
                  <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No notices yet. Create your first notice!</p>
                </Card>
              ) : (
                notices.map((notice) => (
                  <Card key={notice.id} className="glass p-4 rounded-2xl">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-foreground">{notice.title}</h3>
                          {notice.pinned && <Badge variant="secondary">Pinned</Badge>}
                        </div>
                        <Badge className="mb-2">{notice.category}</Badge>
                        <p className="text-sm text-muted-foreground line-clamp-2">{notice.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">{notice.date}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(notice)}
                          className="rounded-full h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(notice.id)}
                          className="rounded-full h-8 w-8 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
