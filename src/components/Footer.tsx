import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Gyan Bharti Sr. Sec. School</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Excellence in Education. Nurturing minds, building futures since our establishment.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: 'Home', path: '/' },
                { name: 'About Us', path: '/about' },
                { name: 'Admissions', path: '/admissions' },
                { name: 'Events', path: '/events' },
                { name: 'Gallery', path: '/gallery' },
                { name: 'Contact', path: '/contact' },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>WRPJ+GG6, 41, SH 69, Tekari, Bihar 824236</span>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground text-sm">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href="tel:+919431448688" className="hover:text-primary transition-colors">
                  +91-94314-48688
                </a>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground text-sm">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <div className="flex flex-col">
                  <a href="mailto:gyanbhartitekari@yahoo.com" className="hover:text-primary transition-colors">
                    gyanbhartitekari@yahoo.com
                  </a>
                  <a href="mailto:info@gyanbhartitekari.com" className="hover:text-primary transition-colors">
                    info@gyanbhartitekari.com
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Connect With Us</h3>
            <div className="flex space-x-3">
              <a
                href="https://www.facebook.com/share/14MXddjrjMS/"
                target="_blank"
                rel="noopener noreferrer"
                className="glass p-3 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/gyanbhartitekari?igsh=dHduMzh5bWJ2Z3hm"
                target="_blank"
                rel="noopener noreferrer"
                className="glass p-3 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com/@scrollschool?si=V2wYPRqrlY21h-ND"
                target="_blank"
                rel="noopener noreferrer"
                className="glass p-3 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Gyan Bharti Sr. Sec. School — All rights reserved
            </p>
          </div>
          <div className="text-center">
            <a
              href="https://www.instagram.com/aashutosh_8055?igsh=MXRjYjYyMTBhNzYxdg=="
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              Made with ❤️ by <span className="font-semibold">Aashutosh Ranjan (KTR)</span>
            </a>
          </div>
          <div className="text-center">
            <a
              href="https://www.instagram.com/aashutosh_8055?igsh=MXRjYjYyMTBhNzYxdg=="
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Support / Help
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
