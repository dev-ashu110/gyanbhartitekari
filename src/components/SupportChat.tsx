import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Mail, Phone, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);

  const supportOptions = [
    {
      icon: Phone,
      label: 'Call Us',
      value: '+91-94314-48688',
      href: 'tel:+919431448688',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Mail,
      label: 'Email Us',
      value: 'info@gyanbhartitekari.com',
      href: 'mailto:info@gyanbhartitekari.com',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Instagram,
      label: 'Instagram',
      value: '@aashutosh_8055',
      href: 'https://www.instagram.com/aashutosh_8055?igsh=MXRjYjYyMTBhNzYxdg==',
      color: 'from-pink-500 to-rose-500',
    },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-4 md:right-8 z-50 w-80 max-w-[calc(100vw-2rem)]"
          >
            <Card className="glass-strong p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-foreground">Need Help?</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Choose how you'd like to reach us:
              </p>

              <div className="space-y-3">
                {supportOptions.map((option, index) => {
                  const Icon = option.icon;
                  return (
                    <motion.a
                      key={option.label}
                      href={option.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg glass-effect hover:bg-primary/5 transition-colors group"
                    >
                      <div className={`bg-gradient-to-br ${option.color} p-2 rounded-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{option.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{option.value}</p>
                      </div>
                    </motion.a>
                  );
                })}
              </div>

              <p className="text-xs text-center text-muted-foreground mt-4">
                We're here to help! 🎓
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-primary to-accent hover:shadow-primary/50 transition-all duration-300"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
    </>
  );
};
