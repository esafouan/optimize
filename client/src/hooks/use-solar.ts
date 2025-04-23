import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { SolarProduction, InsertSolarProduction } from "@shared/schema";
import { useSimulation } from "./use-simulation";
import { generateSolarProduction } from "@/lib/utils";

export function useSolar() {
  const { simulationState } = useSimulation();
  
  // Get current solar production
  const { 
    data: solarData,
    isLoading,
    error
  } = useQuery<SolarProduction>({
    queryKey: ['/api/solar/current'],
    enabled: !!simulationState,
  });

  // Get hourly solar production for current day
  const { 
    data: dailySolarData
  } = useQuery<SolarProduction[]>({
    queryKey: ['/api/solar/day', simulationState?.currentDay],
    enabled: !!simulationState,
  });

  // Get 7-day solar production history
  const { 
    data: weeklySolarData
  } = useQuery<SolarProduction[]>({
    queryKey: ['/api/solar/week'],
  });

  // Update solar production data
  const updateSolarProduction = useMutation({
    mutationFn: async (data: InsertSolarProduction) => {
      return apiRequest("POST", "/api/solar", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/solar'] });
    }
  });

  // Generate random solar production for the current hour
  const generateRandomSolarProduction = () => {
    if (!simulationState) return;
    
    const production = generateSolarProduction(simulationState.currentHour);
    updateSolarProduction.mutate({
      day: simulationState.currentDay,
      hour: simulationState.currentHour,
      output: production
    });
  };

  // Generate solar production data for a full day
  const generateDayProduction = () => {
    if (!simulationState) return;
    
    for (let hour = 0; hour < 24; hour++) {
      const production = generateSolarProduction(hour);
      updateSolarProduction.mutate({
        day: simulationState.currentDay,
        hour,
        output: production
      });
    }
  };

  // Generate solar production data for a full week
  const generateWeekProduction = () => {
    if (!simulationState) return;
    
    for (let day = 1; day <= 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const production = generateSolarProduction(hour);
        // Add some variability between days (±20%)
        const variability = 0.8 + Math.random() * 0.4;
        
        updateSolarProduction.mutate({
          day,
          hour,
          output: production * variability
        });
      }
    }
  };

  // Current solar production
  const currentSolarProduction = solarData?.output || 0;

  return {
    currentSolarProduction,
    dailySolarData,
    weeklySolarData,
    isLoading,
    error,
    generateRandomSolarProduction,
    generateDayProduction,
    generateWeekProduction,
    updateSolarProduction: updateSolarProduction.mutate,
    isPending: updateSolarProduction.isPending
  };
}
