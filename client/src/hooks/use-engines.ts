import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Engine, InsertEngine, UpdateEngine } from "@shared/schema";

export function useEngines() {
  // Get all engines
  const { 
    data: engines,
    isLoading,
    error
  } = useQuery<Engine[]>({
    queryKey: ['/api/engines'],
  });

  // Add a new engine
  const addEngine = useMutation({
    mutationFn: async (data: InsertEngine) => {
      return apiRequest("POST", "/api/engines", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/engines'] });
    }
  });

  // Update an engine
  const updateEngine = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: UpdateEngine }) => {
      return apiRequest("PATCH", `/api/engines/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/engines'] });
    }
  });

  // Delete an engine
  const deleteEngine = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/engines/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/engines'] });
    }
  });

  // Toggle engine running state
  const toggleEngineState = useMutation({
    mutationFn: async ({ id, isRunning }: { id: number, isRunning: boolean }) => {
      return apiRequest("PATCH", `/api/engines/${id}/toggle`, { isRunning });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/engines'] });
    }
  });

  // Update engine output
  const updateEngineOutput = useMutation({
    mutationFn: async ({ id, output }: { id: number, output: number }) => {
      return apiRequest("PATCH", `/api/engines/${id}/output`, { currentOutput: output });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/engines'] });
    }
  });

  // Get currently running engines
  const runningEngines = engines?.filter(engine => engine.isRunning) || [];
  
  // Get total current engine production
  const totalEngineProduction = runningEngines.reduce(
    (sum, engine) => sum + engine.currentOutput, 
    0
  );

  return {
    engines,
    runningEngines,
    totalEngineProduction,
    isLoading,
    error,
    addEngine,
    updateEngine,
    deleteEngine,
    toggleEngineState,
    updateEngineOutput
  };
}
