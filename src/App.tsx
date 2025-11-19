import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "./components/AuthGuard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Framework from "./pages/Framework";
import Dashboard from "./pages/Dashboard";
import Welcome from "./pages/coach/Welcome";
import DelegationAssessment from "./pages/coach/DelegationAssessment";
import TaskSelection from "./pages/coach/TaskSelection";
import PlanBuilder from "./pages/coach/PlanBuilder";
import PlanOutput from "./pages/coach/PlanOutput";
import FollowUp from "./pages/coach/FollowUp";
import NotFound from "./pages/NotFound";
import Plans from "./pages/Plans";
import PlanDetail from "./pages/PlanDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/framework" element={<Framework />} />
          <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/plans" element={<AuthGuard><Plans /></AuthGuard>} />
          <Route path="/plans/:id" element={<AuthGuard><PlanDetail /></AuthGuard>} />
          <Route path="/coach/welcome" element={<AuthGuard><Welcome /></AuthGuard>} />
          <Route path="/coach/assessment" element={<AuthGuard><DelegationAssessment /></AuthGuard>} />
          <Route path="/coach/task-selection" element={<AuthGuard><TaskSelection /></AuthGuard>} />
          <Route path="/coach/plan-builder" element={<AuthGuard><PlanBuilder /></AuthGuard>} />
          <Route path="/coach/plan-output" element={<AuthGuard><PlanOutput /></AuthGuard>} />
          <Route path="/coach/follow-up" element={<AuthGuard><FollowUp /></AuthGuard>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
