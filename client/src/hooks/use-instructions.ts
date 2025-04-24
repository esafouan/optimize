import { useQuery } from "@tanstack/react-query";
import { Engine, SolarProduction, EnergyConsumption } from "@shared/schema";
import { apiRequest } from "@/lib/api";

type Instruction = {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  type: 'immediate' | 'scheduled';
  engineId?: number;
  action?: string;
};

type ForecastInstruction = {
  hour: number;
  day: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  engineId?: number;
  action?: string;
};

type InstructionResponse = {
  currentInstructions: Instruction[];
  forecastInstructions: ForecastInstruction[];
};

export interface EngineInstruction {
  engineId: number;
  engineName: string;
  currentOutput: number;
  suggestedOutput: number;
  reason: string;
}

export interface Instructions {
  currentHour: number;
  nextHour: number;
  currentDemand: number;
  predictedDemand: number;
  currentSolar: number;
  predictedSolar: number;
  batteryLevel: number;
  engineInstructions: EngineInstruction[];
}

export function useInstructions() {
  // Get instructions data
  const { 
    data: instructionsData,
    isLoading,
    error,
    refetch
  } = useQuery<InstructionResponse>({
    queryKey: ['/api/instructions'],
  });

  // Get current solar data for reference
  const { data: solarData } = useQuery<SolarProduction>({
    queryKey: ['/api/solar/current'],
  });

  // Get current consumption data for reference
  const { data: consumptionData } = useQuery<EnergyConsumption>({
    queryKey: ['/api/consumption/current'],
  });

  // Get engines data for reference
  const { data: enginesData } = useQuery<Engine[]>({
    queryKey: ['/api/engines'],
  });

  const currentInstructions = instructionsData?.currentInstructions || [];
  const forecastInstructions = instructionsData?.forecastInstructions || [];

  return {
    currentInstructions,
    forecastInstructions,
    solarData,
    consumptionData,
    enginesData,
    isLoading,
    error,
    refetchInstructions: refetch
  };
}

export function useEngineInstructions() {
  const { 
    data: instructions,
    isLoading,
    error,
    refetch
  } = useQuery<Instructions>({
    queryKey: ['/api/instructions'],
  });

  return {
    instructions,
    isLoading,
    error,
    refetch
  };
}