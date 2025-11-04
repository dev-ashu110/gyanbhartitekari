import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollManager = () => {
  const location = useLocation();

  useEffect(() => {
    // Set manual scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Save scroll position before navigation
    const saveScrollPosition = () => {
      sessionStorage.setItem(`scroll_${location.pathname}`, window.pageYOffset.toString());
    };

    // Restore scroll position or scroll to top
    const restoreScrollPosition = () => {
      const savedPosition = sessionStorage.getItem(`scroll_${location.pathname}`);
      if (savedPosition) {
        // Restore saved position
        setTimeout(() => {
          window.scrollTo({
            top: parseInt(savedPosition, 10),
            behavior: 'auto',
          });
        }, 0);
      } else {
        // Scroll to top smoothly for new pages
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
    };

    window.addEventListener('beforeunload', saveScrollPosition);
    restoreScrollPosition();

    return () => {
      window.removeEventListener('beforeunload', saveScrollPosition);
    };
  }, [location]);

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80; // Account for fixed header
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
  };

  return { scrollToSection };
};
