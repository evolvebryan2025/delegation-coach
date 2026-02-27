import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "./components/AuthGuard";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Loader2 } from "lucide-react";

// Route-level code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Framework = lazy(() => import("./pages/Framework"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Welcome = lazy(() => import("./pages/coach/Welcome"));
const DelegationAssessment = lazy(() => import("./pages/coach/DelegationAssessment"));
const TaskSelection = lazy(() => import("./pages/coach/TaskSelection"));
const PlanBuilder = lazy(() => import("./pages/coach/PlanBuilder"));
const PlanOutput = lazy(() => import("./pages/coach/PlanOutput"));
const FollowUp = lazy(() => import("./pages/coach/FollowUp"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Plans = lazy(() => import("./pages/Plans"));
const PlanDetail = lazy(() => import("./pages/PlanDetail"));
const Assessment = lazy(() => import("./pages/Assessment"));
const AssessmentResults = lazy(() => import("./pages/AssessmentResults"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/framework" element={<Framework />} />
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/assessment-results" element={<AssessmentResults />} />
              <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
              <Route path="/plans" element={<AuthGuard><Plans /></AuthGuard>} />
              <Route path="/plans/:id" element={<AuthGuard><PlanDetail /></AuthGuard>} />
              <Route path="/coach/welcome" element={<AuthGuard><Welcome /></AuthGuard>} />
              <Route path="/coach/assessment" element={<AuthGuard><DelegationAssessment /></AuthGuard>} />
              <Route path="/coach/task-selection" element={<AuthGuard><TaskSelection /></AuthGuard>} />
              <Route path="/coach/plan-builder" element={<AuthGuard><PlanBuilder /></AuthGuard>} />
              <Route path="/coach/plan-output/:id" element={<AuthGuard><PlanOutput /></AuthGuard>} />
              <Route path="/coach/plan-output" element={<AuthGuard><PlanOutput /></AuthGuard>} />
              <Route path="/coach/follow-up/:id" element={<AuthGuard><FollowUp /></AuthGuard>} />
              <Route path="/coach/follow-up" element={<AuthGuard><FollowUp /></AuthGuard>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
