import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Testimonial {
  id: string;
  author_name: string;
  author_role: string;
  content: string;
  rating: number;
  avatar_url?: string;
}

export const TestimonialsCarousel = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_featured', true)
        .order('display_order', { ascending: true });
      
      if (data) setTestimonials(data);
    };

    fetchTestimonials();

    // Auto-advance every 5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.max(testimonials.length, 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  if (testimonials.length === 0) return null;

  const currentTestimonial = testimonials[currentIndex];

  const roleColors = {
    parent: 'from-blue-500 to-cyan-500',
    student: 'from-green-500 to-emerald-500',
    alumni: 'from-purple-500 to-pink-500',
    teacher: 'from-orange-500 to-red-500',
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-20"></div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
            What People Say
          </h2>
          <p className="text-xl text-muted-foreground">
            Hear from our community members
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Card className="glass-strong p-8 md:p-12 relative">
            <Quote className="h-12 w-12 text-primary/20 absolute top-6 left-6" />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <div className="flex justify-center gap-1 mb-4">
                  {Array.from({ length: currentTestimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-lg md:text-xl text-foreground mb-6 italic">
                  "{currentTestimonial.content}"
                </p>

                <div className="flex items-center justify-center gap-4">
                  <div className={`bg-gradient-to-br ${roleColors[currentTestimonial.author_role as keyof typeof roleColors]} p-3 rounded-full`}>
                    <span className="text-2xl text-white font-bold">
                      {currentTestimonial.author_name.charAt(0)}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-foreground">{currentTestimonial.author_name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{currentTestimonial.author_role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrev}
                className="rounded-full glass-effect"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-primary/30'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                className="rounded-full glass-effect"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
