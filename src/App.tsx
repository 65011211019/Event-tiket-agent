import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider, ThemeProvider, AuthProvider } from "@/contexts/AppContext";
import Layout from "@/components/layout/Layout";
import ScrollToTop from "@/components/common/ScrollToTop";
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
import AdminTickets from "@/pages/admin/AdminTickets";
import AdminTicketTypeForm from "@/pages/admin/AdminTicketTypeForm";
import AdminReports from "@/pages/admin/AdminReports";
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
            <BrowserRouter 
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <ScrollToTop />
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
                <Route path="/events/:id/booking" element={
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
                <Route path="/admin/tickets" element={
                  <ProtectedRoute requireAdmin={true}>
                    <Layout>
                      <AdminTickets />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/ticket-types/create" element={
                  <ProtectedRoute requireAdmin={true}>
                    <Layout>
                      <AdminTicketTypeForm />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/reports" element={
                  <ProtectedRoute requireAdmin={true}>
                    <Layout>
                      <AdminReports />
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