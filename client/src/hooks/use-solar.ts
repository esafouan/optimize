import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { SolarProduction, InsertSolarProduction } from "@shared/schema";
import { generateSolarProduction } from "@/lib/utils";

export function useSolar() {
  // Get current solar production
  const { 
    data: solarData,
    isLoading,
    error
  } = useQuery<SolarProduction>({
    queryKey: ['/api/solar/current'],
  });

  // Get hourly solar production for current day
  const { 
    data: dailySolarData
  } = useQuery<SolarProduction[]>({
    queryKey: ['/api/solar/day'],
  });

  // Get 7-day solar production history
  const { 
    data: weeklySolarData
  } = useQuery<SolarProduction[]>({
    queryKey: ['/api/solar/week'],
  });

  // Create solar production data
  const createSolarProduction = useMutation({
    mutationFn: async (data: InsertSolarProduction) => {
      return apiRequest("/api/solar", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/solar'] });
    }
  });

  // Update existing solar production
  const updateSolarProduction = useMutation({
    mutationFn: async ({ id, output }: { id: number, output: number }) => {
      return apiRequest(`/api/solar/${id}`, "PATCH", { output });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/solar'] });
      // Also invalidate instructions since they depend on solar output
      queryClient.invalidateQueries({ queryKey: ['/api/instructions'] });
    }
  });

  // Generate random solar production for the current hour
  const generateRandomSolarProduction = () => {
    if (!solarData) return;
    
    const production = generateSolarProduction(solarData.hour);
    updateSolarProduction.mutate({
      id: solarData.id,
      output: production
    });
  };

  // Current solar production
  const currentSolarProduction = solarData?.output || 0;

  return {
    currentSolarProduction,
    solarData,
    dailySolarData,
    weeklySolarData,
    isLoading,
    error,
    generateRandomSolarProduction,
    createSolarProduction,
    updateSolarProduction,
    isPending: updateSolarProduction.isPending
  };
}
