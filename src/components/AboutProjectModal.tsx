import { motion } from 'framer-motion';
import { Heart, Code, Users, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const AboutProjectModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-muted-foreground hover:text-foreground transition-colors text-sm">
          About Project
        </button>
      </DialogTrigger>
      <DialogContent className="glass-strong sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-gradient flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Gyan Bharti Smart School
          </DialogTitle>
          <DialogDescription className="text-base">
            A modern, intelligent school management platform
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Project Story */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Our Vision
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Gyan Bharti Smart School (GBSS) is designed to revolutionize education management by
              providing a seamless, intelligent, and user-friendly platform for students, teachers,
              and administrators. Built with cutting-edge technology, GBSS empowers educational
              institutions to focus on what matters most — inspiring and educating the next generation.
            </p>
          </motion.div>

          {/* Features Highlight */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-3"
          >
            {[
              'Dynamic Dashboard',
              'Smart Events',
              'Interactive Timetable',
              'Role Management',
              'Gallery System',
              'Feedback Portal',
              'Activity Tracking',
              'Real-time Updates',
            ].map((feature, index) => (
              <Badge key={index} variant="secondary" className="py-2 justify-center">
                {feature}
              </Badge>
            ))}
          </motion.div>

          {/* Glowing Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-primary/20"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-background px-4">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Contributors */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Built By
            </h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold">
                  AR
                </div>
                <div>
                  <p className="font-semibold text-foreground">Aashutosh Ranjan</p>
                  <p className="text-sm text-muted-foreground">Lead Developer & Architect</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Credits Footer */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-4 border-t border-border text-center"
          >
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              Made with <Heart className="h-4 w-4 text-red-500 animate-pulse" fill="currentColor" /> by
              <span className="font-semibold text-foreground">Aashutosh Ranjan</span> and Team
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              © 2025 Gyan Bharti Smart School. All rights reserved.
            </p>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
