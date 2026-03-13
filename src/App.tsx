import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { SavedProvider } from "@/hooks/use-saved";
import { ThemeProvider } from "@/hooks/use-theme";
import Navbar from "@/components/Navbar";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy-loaded route components
const Index = lazy(() => import("./pages/Index"));
const SavedPage = lazy(() => import("./pages/SavedPage"));
const OpportunityDetail = lazy(() => import("./pages/OpportunityDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ThemeProvider>
            <SavedProvider>
              <Navbar />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/saved" element={<SavedPage />} />
                  <Route path="/opportunity/:id" element={<OpportunityDetail />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </SavedProvider>
          </ThemeProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
