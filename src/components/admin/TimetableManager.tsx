import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Trash2, Edit, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface TimetableEntry {
  id: string;
  class: string;
  day: string;
  period_name: string;
  start_time: string;
  end_time: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TimetableManager = () => {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    class: '',
    day: 'Monday',
    period_name: '',
    start_time: '',
    end_time: '',
  });

  useEffect(() => {
    fetchEntries();
    subscribeToTimetables();
  }, []);

  const subscribeToTimetables = () => {
    const channel = supabase
      .channel('timetable-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timetables' }, () => {
        fetchEntries();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('timetables')
        .select('*')
        .order('day', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEntries(data || []);
    } catch (error: any) {
      toast({ title: 'Error fetching timetable', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingEntry) {
        const { error } = await supabase
          .from('timetables')
          .update(formData)
          .eq('id', editingEntry.id);

        if (error) throw error;
        toast({ title: 'Success!', description: 'Timetable entry updated' });
      } else {
        const { error } = await supabase.from('timetables').insert(formData);
        if (error) throw error;
        toast({ title: 'Success!', description: 'Timetable entry added' });
      }

      resetForm();
      setDialogOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase.from('timetables').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success!', description: 'Entry deleted' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const openEditDialog = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setFormData({
      class: entry.class,
      day: entry.day,
      period_name: entry.period_name,
      start_time: entry.start_time,
      end_time: entry.end_time,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ class: '', day: 'Monday', period_name: '', start_time: '', end_time: '' });
    setEditingEntry(null);
  };

  // Group entries by day
  const groupedEntries = DAYS.map((day) => ({
    day,
    entries: entries.filter((e) => e.day === day),
  }));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          Timetable Management
        </h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong">
            <DialogHeader>
              <DialogTitle>{editingEntry ? 'Edit Entry' : 'Add New Entry'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="class">Class</Label>
                <Input
                  id="class"
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  placeholder="e.g., Class 10-A"
                  required
                  className="glass"
                />
              </div>
              <div>
                <Label htmlFor="day">Day</Label>
                <Select value={formData.day} onValueChange={(val) => setFormData({ ...formData, day: val })}>
                  <SelectTrigger className="glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="period_name">Period Name</Label>
                <Input
                  id="period_name"
                  value={formData.period_name}
                  onChange={(e) => setFormData({ ...formData, period_name: e.target.value })}
                  placeholder="e.g., Assembly, Period 1, Lunch"
                  required
                  className="glass"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                    className="glass"
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                    className="glass"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingEntry ? 'Update Entry' : 'Add Entry'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Timetable Display */}
      <div className="space-y-6">
        {groupedEntries.map(({ day, entries: dayEntries }) => (
          <Card key={day} className="glass-strong p-6 rounded-3xl">
            <h4 className="text-xl font-bold mb-4 text-foreground">{day}</h4>
            {dayEntries.length === 0 ? (
              <p className="text-muted-foreground text-sm">No entries for this day</p>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {dayEntries.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="glass p-4 rounded-2xl flex items-center justify-between group hover:glass-strong transition-all"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-foreground">
                            {entry.start_time} - {entry.end_time}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {entry.class} • {entry.period_name}
                        </p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="secondary" onClick={() => openEditDialog(entry)} className="rounded-full">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="destructive" onClick={() => deleteEntry(entry.id)} className="rounded-full">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Card>
        ))}
      </div>

      {loading && <p className="text-center text-muted-foreground">Loading timetable...</p>}
    </div>
  );
};
