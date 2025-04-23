import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { EnergyConsumption, InsertEnergyConsumption } from "@shared/schema";
import { generateConsumptionDemand } from "@/lib/utils";

export function useConsumption() {
  // Get current consumption
  const { 
    data: consumptionData,
    isLoading,
    error
  } = useQuery<EnergyConsumption>({
    queryKey: ['/api/consumption/current'],
  });

  // Get hourly consumption for current day
  const { 
    data: dailyConsumptionData
  } = useQuery<EnergyConsumption[]>({
    queryKey: ['/api/consumption/day'],
  });

  // Get 7-day consumption history
  const { 
    data: weeklyConsumptionData
  } = useQuery<EnergyConsumption[]>({
    queryKey: ['/api/consumption/week'],
  });

  // Create/Update consumption data
  const createConsumption = useMutation({
    mutationFn: async (data: InsertEnergyConsumption) => {
      return apiRequest("/api/consumption", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/consumption'] });
    }
  });

  // Update existing consumption
  const updateConsumption = useMutation({
    mutationFn: async ({ id, demand }: { id: number, demand: number }) => {
      return apiRequest(`/api/consumption/${id}`, "PATCH", { demand });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/consumption'] });
    }
  });

  // Generate random consumption for the current hour
  const generateRandomConsumption = () => {
    if (!consumptionData) return;
    
    const demand = generateConsumptionDemand(consumptionData.hour);
    updateConsumption.mutate({
      id: consumptionData.id,
      demand
    });
  };

  // Import consumption data from JSON
  const importConsumptionData = async (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.day && (item.hour !== undefined) && item.demand) {
            await createConsumption.mutateAsync({
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
    consumptionData,
    dailyConsumptionData,
    weeklyConsumptionData,
    isLoading,
    error,
    generateRandomConsumption,
    importConsumptionData,
    createConsumption,
    updateConsumption,
    isPending: updateConsumption.isPending
  };
}
