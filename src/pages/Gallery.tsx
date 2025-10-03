import { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  // Placeholder images with descriptions
  const images = [
    { id: 1, title: 'Annual Day 2023', category: 'Events', color: 'from-blue-500 to-purple-500' },
    { id: 2, title: 'Science Exhibition', category: 'Academic', color: 'from-green-500 to-teal-500' },
    { id: 3, title: 'Sports Day', category: 'Sports', color: 'from-orange-500 to-red-500' },
    { id: 4, title: 'Independence Day', category: 'Celebrations', color: 'from-indigo-500 to-blue-500' },
    { id: 5, title: 'Classroom Activities', category: 'Academic', color: 'from-pink-500 to-rose-500' },
    { id: 6, title: 'Cultural Program', category: 'Events', color: 'from-yellow-500 to-orange-500' },
    { id: 7, title: 'Laboratory Session', category: 'Academic', color: 'from-cyan-500 to-blue-500' },
    { id: 8, title: 'Prize Distribution', category: 'Events', color: 'from-purple-500 to-pink-500' },
    { id: 9, title: 'Inter-School Competition', category: 'Sports', color: 'from-red-500 to-orange-500' },
  ];

  const categories = ['All', 'Events', 'Academic', 'Sports', 'Celebrations'];
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredImages =
    activeCategory === 'All' ? images : images.filter((img) => img.category === activeCategory);

  return (
    <main className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-1000">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient">Gallery</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Capturing moments of learning, growth, and achievement
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setActiveCategory(category)}
              variant={activeCategory === category ? 'default' : 'outline'}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image, index) => (
            <Card
              key={image.id}
              className="glass group cursor-pointer overflow-hidden rounded-3xl hover:glass-strong transition-all duration-300 hover:scale-105"
              onClick={() => setSelectedImage(image.id)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Placeholder with gradient */}
              <div className={`aspect-[4/3] bg-gradient-to-br ${image.color} relative overflow-hidden`}>
                <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ImageIcon className="h-12 w-12 text-white" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-foreground mb-1">{image.title}</h3>
                <p className="text-sm text-muted-foreground">{image.category}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-lg animate-in fade-in duration-300"
            onClick={() => setSelectedImage(null)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 rounded-full glass-strong"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-6 w-6" />
            </Button>
            <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
              <Card className="glass-strong overflow-hidden rounded-3xl">
                {(() => {
                  const image = images.find((img) => img.id === selectedImage);
                  if (!image) return null;
                  return (
                    <>
                      <div className={`aspect-video bg-gradient-to-br ${image.color}`}></div>
                      <div className="p-6">
                        <h3 className="text-2xl font-bold text-foreground mb-2">{image.title}</h3>
                        <p className="text-muted-foreground">{image.category}</p>
                      </div>
                    </>
                  );
                })()}
              </Card>
            </div>
          </div>
        )}

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
  );
}
