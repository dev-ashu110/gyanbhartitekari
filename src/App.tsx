import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NavLiquid } from "@/components/NavLiquid";
import { Footer } from "@/components/Footer";
import { ParallaxLayers } from "@/components/ParallaxLayers";
import GlobalBackground from "@/components/GlobalBackground";
import Home from "./pages/Home";
import About from "./pages/About";
import Admissions from "./pages/Admissions";
import Academics from "./pages/Academics";
import Notices from "./pages/Notices";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import StudentPortfolio from "./pages/StudentPortfolio";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import PublicProfile from "./pages/PublicProfile";
import VisitorPortal from "./pages/VisitorPortal";
import { MouseFollower } from "./components/MouseFollower";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col w-full relative">
          <GlobalBackground />
          <MouseFollower />
          <ParallaxLayers />
          <NavLiquid />
          <div className="relative z-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/admissions" element={<Admissions />} />
              <Route path="/academics" element={<Academics />} />
              <Route path="/notices" element={<Notices />} />
              <Route path="/events" element={<Events />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/student-portfolio" element={<StudentPortfolio />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/profile/:studentId" element={<PublicProfile />} />
              <Route path="/visitor-portal" element={<VisitorPortal />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
