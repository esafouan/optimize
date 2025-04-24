import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import MainLayout from "@/components/layout/main-layout";
import Dashboard from "@/pages/dashboard";
import Engines from "@/pages/engines";
import Solar from "@/pages/solar";
import Consumption from "@/pages/consumption";
import Reports from "@/pages/reports";
import Instructions from "@/pages/instructions";
import NotFound from "@/pages/not-found";
import { initializeStorage } from "./lib/storage";


// Initialize storage with mock data
initializeStorage();

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/engines" component={Engines} />
        <Route path="/solar" component={Solar} />
        <Route path="/consumption" component={Consumption} />
        <Route path="/instructions" component={Instructions} />
        <Route path="/reports" component={Reports} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
