import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { EnergyConsumption, InsertEnergyConsumption } from "@shared/schema";
import { useSimulation } from "./use-simulation";
import { generateConsumptionDemand } from "@/lib/utils";

export function useConsumption() {
  const { simulationState } = useSimulation();
  
  // Get current consumption
  const { 
    data: consumptionData,
    isLoading,
    error
  } = useQuery<EnergyConsumption>({
    queryKey: ['/api/consumption/current'],
    enabled: !!simulationState,
  });

  // Get hourly consumption for current day
  const { 
    data: dailyConsumptionData
  } = useQuery<EnergyConsumption[]>({
    queryKey: ['/api/consumption/day', simulationState?.currentDay],
    enabled: !!simulationState,
  });

  // Get 7-day consumption history
  const { 
    data: weeklyConsumptionData
  } = useQuery<EnergyConsumption[]>({
    queryKey: ['/api/consumption/week'],
  });

  // Update consumption data
  const updateConsumption = useMutation({
    mutationFn: async (data: InsertEnergyConsumption) => {
      return apiRequest("POST", "/api/consumption", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/consumption'] });
    }
  });

  // Generate random consumption for the current hour
  const generateRandomConsumption = () => {
    if (!simulationState) return;
    
    const demand = generateConsumptionDemand(simulationState.currentHour);
    updateConsumption.mutate({
      day: simulationState.currentDay,
      hour: simulationState.currentHour,
      demand
    });
  };

  // Generate consumption data for a full day
  const generateDayConsumption = () => {
    if (!simulationState) return;
    
    for (let hour = 0; hour < 24; hour++) {
      const demand = generateConsumptionDemand(hour);
      updateConsumption.mutate({
        day: simulationState.currentDay,
        hour,
        demand
      });
    }
  };

  // Generate consumption data for a full week
  const generateWeekConsumption = () => {
    if (!simulationState) return;
    
    for (let day = 1; day <= 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const demand = generateConsumptionDemand(hour);
        // Add some variability between days (±20%)
        const variability = 0.8 + Math.random() * 0.4;
        
        updateConsumption.mutate({
          day,
          hour,
          demand: demand * variability
        });
      }
    }
  };

  // Import consumption data from JSON
  const importConsumptionData = async (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.day && (item.hour !== undefined) && item.demand) {
            await updateConsumption.mutateAsync({
              day: item.day,
              hour: item.hour,
              demand: item.demand
            });
          }
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to import consumption data:", err);
      return false;
    }
  };

  // Current consumption demand
  const currentConsumptionDemand = consumptionData?.demand || 0;

  return {
    currentConsumptionDemand,
    dailyConsumptionData,
    weeklyConsumptionData,
    isLoading,
    error,
    generateRandomConsumption,
    generateDayConsumption,
    generateWeekConsumption,
    importConsumptionData,
    updateConsumption: updateConsumption.mutate,
    isPending: updateConsumption.isPending
  };
}
