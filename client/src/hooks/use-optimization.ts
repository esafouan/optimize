import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { OptimizationSuggestion } from "@shared/schema";
import { useSimulation } from "./use-simulation";
import { useEngines } from "./use-engines";
import { useSolar } from "./use-solar";
import { useConsumption } from "./use-consumption";

export function useOptimization() {
  const { simulationState } = useSimulation();
  const { engines, totalEngineProduction } = useEngines();
  const { currentSolarProduction } = useSolar();
  const { currentConsumptionDemand } = useConsumption();
  
  // Get current optimization suggestions
  const { 
    data: suggestions,
    isLoading,
    error
  } = useQuery<OptimizationSuggestion[]>({
    queryKey: ['/api/optimization/suggestions'],
    enabled: !!simulationState,
  });

  // Apply an optimization suggestion
  const applySuggestion = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("POST", `/api/optimization/suggestions/${id}/apply`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/optimization/suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/engines'] });
    }
  });

  // Generate new optimization suggestions
  const generateSuggestions = useMutation({
    mutationFn: async () => {
      if (!simulationState) return;
      return apiRequest("POST", `/api/optimization/generate`, {
        day: simulationState.currentDay,
        hour: simulationState.currentHour
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/optimization/suggestions'] });
    }
  });

  // Get economic impact data
  const { 
    data: economicImpact
  } = useQuery({
    queryKey: ['/api/optimization/impact'],
  });

  // Calculate if there's overproduction
  const totalProduction = totalEngineProduction + currentSolarProduction;
  const isOverproducing = totalProduction > currentConsumptionDemand;
  
  // Calculate production deficit
  const productionDeficit = currentConsumptionDemand - totalProduction;
  
  // Get engines below optimal threshold
  const enginesNotOptimal = engines?.filter(engine => {
    return engine.isRunning && engine.currentOutput < engine.optimalThreshold;
  }) || [];

  return {
    suggestions,
    economicImpact,
    isLoading,
    error,
    applySuggestion,
    generateSuggestions,
    isOverproducing,
    productionDeficit, 
    enginesNotOptimal,
    isPending: applySuggestion.isPending || generateSuggestions.isPending
  };
}
