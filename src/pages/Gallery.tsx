import { useState, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { PageTransition } from '@/components/PageTransition';
import { TouchFeedback } from '@/components/TouchFeedback';

interface GalleryImage {
  id: string;
  url: string;
  title: string | null;
  caption: string | null;
  is_cover: boolean;
  is_thumbnail: boolean;
  attached_event_id: string | null;
}

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | 'covers' | 'thumbnails' | 'events'>('all');

  useEffect(() => {
    fetchImages();
    subscribeToImages();
  }, []);

  const subscribeToImages = () => {
    const channel = supabase
      .channel('public-gallery-changes')
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
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = images.filter((img) => {
    if (activeCategory === 'covers') return img.is_cover;
    if (activeCategory === 'thumbnails') return img.is_thumbnail;
    if (activeCategory === 'events') return img.attached_event_id !== null;
    return true;
  });

  return (
    <PageTransition>
      <main className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-1000">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient">Gallery</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Capturing moments of learning, growth, and achievement
          </p>
        </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {(['all', 'covers', 'thumbnails', 'events'] as const).map((category) => (
              <TouchFeedback key={category}>
                <Button
                  onClick={() => setActiveCategory(category)}
                  variant={activeCategory === category ? 'default' : 'outline'}
                  className="rounded-full capitalize"
                >
                  {category}
                </Button>
              </TouchFeedback>
            ))}
          </div>

          {/* Gallery Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading gallery...</p>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No images found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <TouchFeedback>
                      <Card
                        className="glass group cursor-pointer overflow-hidden rounded-3xl hover:glass-strong transition-all duration-300 hover:scale-105"
                        onClick={() => setSelectedImage(image)}
                      >
                        <div className="aspect-[4/3] relative overflow-hidden">
                          <img
                            src={image.url}
                            alt={image.title || 'Gallery image'}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ImageIcon className="h-12 w-12 text-white" />
                          </div>
                        </div>
                        <div className="p-4">
                          {image.title && <h3 className="font-bold text-lg text-foreground mb-1">{image.title}</h3>}
                          {image.caption && <p className="text-sm text-muted-foreground mb-2">{image.caption}</p>}
                          <div className="flex gap-2 flex-wrap">
                            {image.is_cover && <Badge variant="secondary">Cover</Badge>}
                            {image.is_thumbnail && <Badge variant="outline">Thumbnail</Badge>}
                          </div>
                        </div>
                      </Card>
                    </TouchFeedback>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Lightbox Modal */}
          <AnimatePresence>
            {selectedImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-lg"
                onClick={() => setSelectedImage(null)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 rounded-full glass-strong z-10"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-6 w-6" />
                </Button>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: 'spring', damping: 20 }}
                  className="max-w-5xl w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Card className="glass-strong overflow-hidden rounded-3xl">
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={selectedImage.url}
                        alt={selectedImage.title || 'Gallery image'}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="p-6">
                      {selectedImage.title && (
                        <h3 className="text-2xl font-bold text-foreground mb-2">{selectedImage.title}</h3>
                      )}
                      {selectedImage.caption && (
                        <p className="text-muted-foreground">{selectedImage.caption}</p>
                      )}
                      <div className="flex gap-2 mt-4 flex-wrap">
                        {selectedImage.is_cover && <Badge variant="secondary">Cover</Badge>}
                        {selectedImage.is_thumbnail && <Badge variant="outline">Thumbnail</Badge>}
                        {selectedImage.attached_event_id && <Badge>Event Attached</Badge>}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        {/* Info Section */}
        <Card className="glass-strong p-8 md:p-12 rounded-3xl mt-16 text-center">
          <ImageIcon className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-3 text-foreground">Memories in Making</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our gallery showcases the vibrant life at Gyan Bharti School. From academic achievements to cultural
            celebrations, sports events to daily classroom moments, we capture the essence of our school community.
            These images tell the story of growth, learning, and the joy of education.
          </p>
        </Card>
        </div>
      </main>
    </PageTransition>
  );
}
