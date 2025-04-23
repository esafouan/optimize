import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import { SimulationState } from "@shared/schema";

export function useSimulation() {
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);

  // Get current simulation state
  const { 
    data: simulationState,
    isLoading,
    error
  } = useQuery<SimulationState>({
    queryKey: ['/api/simulation'],
  });

  // Update simulation state
  const updateSimulation = useMutation({
    mutationFn: async (data: { day?: number; hour?: number }) => {
      return apiRequest("PATCH", "/api/simulation", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/simulation'] });
      queryClient.invalidateQueries({ queryKey: ['/api/engines'] });
      queryClient.invalidateQueries({ queryKey: ['/api/solar'] });
      queryClient.invalidateQueries({ queryKey: ['/api/consumption'] });
      queryClient.invalidateQueries({ queryKey: ['/api/optimization'] });
    }
  });

  // Advance simulation by one hour
  const advanceOneHour = () => {
    if (!simulationState) return;
    
    let newHour = simulationState.currentHour + 1;
    let newDay = simulationState.currentDay;
    
    if (newHour >= 24) {
      newHour = 0;
      newDay = newDay >= 7 ? 1 : newDay + 1;
    }
    
    updateSimulation.mutate({ day: newDay, hour: newHour });
  };

  // Advance simulation by one day
  const advanceOneDay = () => {
    if (!simulationState) return;
    
    const newDay = simulationState.currentDay >= 7 ? 1 : simulationState.currentDay + 1;
    updateSimulation.mutate({ day: newDay, hour: simulationState.currentHour });
  };

  // Reset simulation to day 1, hour 8
  const resetSimulation = () => {
    updateSimulation.mutate({ day: 1, hour: 8 });
  };

  // Toggle auto advance mode (simulates time passing automatically)
  const toggleAutoAdvance = () => {
    setIsAutoAdvancing(prev => !prev);
  };

  // Auto advance effect
  useEffect(() => {
    if (!isAutoAdvancing) return;
    
    const timer = setInterval(() => {
      advanceOneHour();
    }, 3000); // Advance every 3 seconds
    
    return () => clearInterval(timer);
  }, [isAutoAdvancing, simulationState]);

  return {
    simulationState,
    isLoading,
    error,
    advanceOneHour,
    advanceOneDay,
    resetSimulation,
    isAutoAdvancing,
    toggleAutoAdvance,
    isPending: updateSimulation.isPending
  };
}
