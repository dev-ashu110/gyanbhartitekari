import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image as ImageIcon, Star, Trash2, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface GalleryImage {
  id: string;
  url: string;
  title: string | null;
  caption: string | null;
  attached_event_id: string | null;
  is_cover: boolean;
  is_thumbnail: boolean;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
}

export const GalleryManager = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filter, setFilter] = useState<'all' | 'covers' | 'thumbnails' | 'event-attached'>('all');
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  // Form state for new upload
  const [newImage, setNewImage] = useState({
    file: null as File | null,
    title: '',
    caption: '',
    attached_event_id: '',
    is_cover: false,
    is_thumbnail: false,
  });

  useEffect(() => {
    const initializeGallery = async () => {
      try {
        setLoading(true);
        setHasError(false);
        await Promise.all([fetchImages(), fetchEvents()]);
        subscribeToImages();
      } catch (error) {
        console.error('Gallery initialization error:', error);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };

    initializeGallery();
  }, [retryCount]);

  const subscribeToImages = () => {
    const channel = supabase
      .channel('gallery-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_images' }, () => {
        fetchImages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
      setHasError(false);
    } catch (error: any) {
      setHasError(true);
      throw error;
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title')
        .order('date', { ascending: false });
      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      // Events are optional, don't fail the whole component
      setEvents([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage({ ...newImage, file });
    }
  };

  const uploadImage = async () => {
    if (!newImage.file || !newImage.title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a file and provide a title",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(newImage.file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPEG, PNG, GIF, or WebP)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max for images)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (newImage.file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Image must be smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Upload to Supabase Storage
      const fileExt = newImage.file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('student-portfolios')
        .upload(filePath, newImage.file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage.from('student-portfolios').getPublicUrl(filePath);

      // Handle cover logic
      if (newImage.is_cover) {
        if (newImage.attached_event_id) {
          await supabase
            .from('gallery_images')
            .update({ is_cover: false })
            .eq('attached_event_id', newImage.attached_event_id);
        } else {
          await supabase
            .from('gallery_images')
            .update({ is_cover: false })
            .is('attached_event_id', null);
        }
      }

      // Insert into database
      const { data: user } = await supabase.auth.getUser();
      const { error: dbError } = await supabase.from('gallery_images').insert({
        url: publicUrl,
        title: newImage.title || null,
        caption: newImage.caption || null,
        attached_event_id: newImage.attached_event_id || null,
        is_cover: newImage.is_cover,
        is_thumbnail: newImage.is_thumbnail,
        uploaded_by: user.user?.id,
      });

      if (dbError) throw dbError;

      toast({ title: 'Success!', description: 'Image uploaded successfully' });
      setNewImage({ file: null, title: '', caption: '', attached_event_id: '', is_cover: false, is_thumbnail: false });
      setUploadProgress(0);
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const toggleCover = async (imageId: string, currentStatus: boolean, eventId: string | null) => {
    try {
      if (!currentStatus) {
        if (eventId) {
          await supabase.from('gallery_images').update({ is_cover: false }).eq('attached_event_id', eventId);
        } else {
          await supabase.from('gallery_images').update({ is_cover: false }).is('attached_event_id', null);
        }
      }

      const { error } = await supabase.from('gallery_images').update({ is_cover: !currentStatus }).eq('id', imageId);
      if (error) throw error;

      toast({ title: 'Success!', description: `Image ${!currentStatus ? 'set as' : 'removed from'} cover` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const toggleThumbnail = async (imageId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('gallery_images').update({ is_thumbnail: !currentStatus }).eq('id', imageId);
      if (error) throw error;
      toast({ title: 'Success!', description: `Thumbnail ${!currentStatus ? 'enabled' : 'disabled'}` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const deleteImage = async (imageId: string) => {
    try {
      const { error } = await supabase.from('gallery_images').delete().eq('id', imageId);
      if (error) throw error;
      toast({ title: 'Success!', description: 'Image deleted' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const filteredImages = images.filter((img) => {
    if (filter === 'covers') return img.is_cover;
    if (filter === 'thumbnails') return img.is_thumbnail;
    if (filter === 'event-attached') return img.attached_event_id !== null;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-8">
        <Card className="glass-strong p-6 rounded-3xl">
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <ImageIcon className="h-16 w-16 text-primary" />
            </motion.div>
            <h3 className="text-xl font-bold text-foreground mb-2 mt-4">Loading Gallery...</h3>
            <p className="text-muted-foreground">Please wait while we fetch your images</p>
          </div>
        </Card>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-8">
        <Card className="glass-strong p-6 rounded-3xl">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-12"
          >
            <ImageIcon className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Unable to Load Gallery</h3>
            <p className="text-muted-foreground mb-6">
              There was an error loading the gallery images. Please check your connection and try again.
            </p>
            <Button 
              onClick={() => setRetryCount(prev => prev + 1)} 
              variant="outline" 
              className="rounded-full"
            >
              Try Again
            </Button>
          </motion.div>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Upload Section */}
      <Card className="glass-strong p-6 rounded-3xl">
        <h3 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
          <Upload className="h-6 w-6 text-primary" />
          Upload New Image
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="image-file">Select Image</Label>
            <Input id="image-file" type="file" accept="image/*" onChange={handleFileChange} className="glass" />
          </div>
          <div>
            <Label htmlFor="image-title">Title</Label>
            <Input
              id="image-title"
              value={newImage.title}
              onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
              placeholder="Enter image title"
              className="glass"
              required
            />
          </div>
          <div>
            <Label htmlFor="image-caption">Caption (Optional)</Label>
            <Textarea
              id="image-caption"
              value={newImage.caption}
              onChange={(e) => setNewImage({ ...newImage, caption: e.target.value })}
              placeholder="Image caption"
              className="glass"
            />
          </div>
          <div>
            <Label htmlFor="attach-event">Attach to Event (Optional)</Label>
            <Select value={newImage.attached_event_id} onValueChange={(val) => setNewImage({ ...newImage, attached_event_id: val })}>
              <SelectTrigger className="glass">
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newImage.is_cover}
                onChange={(e) => setNewImage({ ...newImage, is_cover: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Set as Cover</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newImage.is_thumbnail}
                onChange={(e) => setNewImage({ ...newImage, is_thumbnail: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Make Thumbnail</span>
            </label>
          </div>
          {uploading && <Progress value={uploadProgress} className="w-full" />}
          <Button onClick={uploadImage} disabled={!newImage.file || uploading} className="w-full">
            {uploading ? 'Uploading...' : 'Upload Image'}
          </Button>
        </div>
      </Card>

      {/* Filter Section */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'covers', 'thumbnails', 'event-attached'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f as any)}
            className="rounded-full capitalize"
          >
            {f.replace('-', ' ')}
          </Button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredImages.map((image) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="glass group overflow-hidden rounded-3xl hover:glass-strong transition-all duration-300">
                <div className="aspect-square relative overflow-hidden">
                  <img src={image.url} alt={image.title || 'Gallery image'} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => toggleCover(image.id, image.is_cover, image.attached_event_id)}
                      className="rounded-full"
                    >
                      <Star className={image.is_cover ? 'fill-yellow-400 text-yellow-400' : ''} />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => toggleThumbnail(image.id, image.is_thumbnail)}
                      className="rounded-full"
                    >
                      <CheckCircle2 className={image.is_thumbnail ? 'fill-green-400 text-green-400' : ''} />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => deleteImage(image.id)}
                      className="rounded-full"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  {image.title && <h4 className="font-bold text-foreground">{image.title}</h4>}
                  {image.caption && <p className="text-sm text-muted-foreground mt-1">{image.caption}</p>}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {image.is_cover && <Badge variant="secondary">Cover</Badge>}
                    {image.is_thumbnail && <Badge variant="outline">Thumbnail</Badge>}
                    {image.attached_event_id && <Badge>Event Attached</Badge>}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!loading && filteredImages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Images Yet</h3>
          <p className="text-muted-foreground mb-4">Upload your first image to get started!</p>
        </motion.div>
      )}
    </motion.div>
  );
};
