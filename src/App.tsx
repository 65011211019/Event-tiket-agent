import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider, ThemeProvider, AuthProvider } from "@/contexts/AppContext";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Home from "@/pages/Home";
import Events from "@/pages/Events";
import EventDetail from "@/pages/EventDetail";
import EventBooking from "@/pages/EventBooking";
import MyTickets from "@/pages/MyTickets";
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminEvents from "@/pages/admin/AdminEvents";
import AdminEventForm from "@/pages/admin/AdminEventForm";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={
                  <ProtectedRoute requireNonAdmin={true}>
                    <Layout>
                      <Home />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/events" element={
                  <Layout>
                    <Events />
                  </Layout>
                } />
                <Route path="/events/:id" element={
                  <Layout>
                    <EventDetail />
                  </Layout>
                } />
                <Route path="/events/:id/book" element={
                  <Layout>
                    <EventBooking />
                  </Layout>
                } />
                <Route path="/login" element={<Login />} />
                
                {/* Protected User Routes */}
                <Route path="/my-tickets" element={
                  <ProtectedRoute requireAuth={true}>
                    <Layout>
                      <MyTickets />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute requireAdmin={true}>
                    <Layout>
                      <AdminDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/events" element={
                  <ProtectedRoute requireAdmin={true}>
                    <Layout>
                      <AdminEvents />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/events/:id/edit" element={
                  <ProtectedRoute requireAdmin={true}>
                    <Layout>
                      <AdminEventForm />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/events/create" element={
                  <ProtectedRoute requireAdmin={true}>
                    <Layout>
                      <AdminEventForm />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

<button className="bg-blue-500 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded">
  Button
</button>
