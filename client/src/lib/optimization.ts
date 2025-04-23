import { Engine } from "@shared/schema";
import { calculateEngineEfficiency } from "./utils";

// Generate optimization suggestions based on current system state
export function generateOptimizationSuggestions(
  engines: Engine[],
  solarProduction: number,
  demand: number,
  storageLevel = 0, // percentage 0-1
  batteryCapacity = 0
): { 
  suggestion: string; 
  details: string; 
  engineId?: number; 
  suggestedAction: string;
  potentialSavings?: number;
}[] {
  const suggestions: { 
    suggestion: string; 
    details: string; 
    engineId?: number; 
    suggestedAction: string;
    potentialSavings?: number;
  }[] = [];
  
  const runningEngines = engines.filter(engine => engine.isRunning);
  const totalEngineProduction = runningEngines.reduce(
    (sum, engine) => sum + engine.currentOutput, 
    0
  );
  const totalProduction = totalEngineProduction + solarProduction;
  
  // Check for overproduction
  const overproduction = totalProduction - demand;
  if (overproduction > 20) {
    // Find the least efficient running engine
    const leastEfficientEngine = [...runningEngines].sort((a, b) => {
      const effA = calculateEngineEfficiency(a.currentOutput, a.maxCapacity);
      const effB = calculateEngineEfficiency(b.currentOutput, b.maxCapacity);
      return effA - effB;
    })[0];
    
    if (leastEfficientEngine) {
      const estimatedFuelSaving = leastEfficientEngine.currentOutput / leastEfficientEngine.efficiency;
      const estimatedCostSaving = estimatedFuelSaving * 1.5; // Assuming €1.5 per liter
      
      suggestions.push({
        suggestion: "Reduce overproduction",
        details: `System is producing ${overproduction.toFixed(0)} kWh more than needed. Consider shutting down ${leastEfficientEngine.name}.`,
        engineId: leastEfficientEngine.id,
        suggestedAction: "shutDown",
        potentialSavings: estimatedCostSaving
      });
    }
  }
  
  // Check for engines running below optimal threshold
  runningEngines.forEach(engine => {
    if (engine.currentOutput < engine.optimalThreshold) {
      const percentBelow = ((engine.optimalThreshold - engine.currentOutput) / engine.optimalThreshold) * 100;
      
      if (percentBelow > 10) { // Only suggest if significantly below threshold
        suggestions.push({
          suggestion: `${engine.name} below optimal threshold`,
          details: `Running at ${engine.currentOutput.toFixed(0)} kWh (optimal: ${engine.optimalThreshold.toFixed(0)} kWh). Increase load or shut down for better efficiency.`,
          engineId: engine.id,
          suggestedAction: "optimizeOrShutdown"
        });
      }
    }
  });
  
  // Check if there are unstarted engines with good efficiency that could replace multiple
  // less efficient running engines
  const standbyEngines = engines.filter(engine => !engine.isRunning);
  
  standbyEngines.forEach(standbyEngine => {
    // Find running engines with worse efficiency
    const lessEfficientRunning = runningEngines.filter(
      engine => engine.efficiency < standbyEngine.efficiency
    );
    
    if (lessEfficientRunning.length >= 2) {
      const totalInefficient = lessEfficientRunning.reduce(
        (sum, engine) => sum + engine.currentOutput, 
        0
      );
      
      if (totalInefficient <= standbyEngine.maxCapacity && totalInefficient >= standbyEngine.optimalThreshold) {
        suggestions.push({
          suggestion: `Start more efficient engine ${standbyEngine.name}`,
          details: `Replace ${lessEfficientRunning.length} less efficient engines with ${standbyEngine.name} for better fuel economy.`,
          engineId: standbyEngine.id,
          suggestedAction: "startEngine"
        });
      }
    }
  });
  
  // Check for battery storage utilization
  if (batteryCapacity > 0) {
    // Suggest storing excess solar energy
    if (solarProduction > demand * 0.5 && storageLevel < 0.9) {
      suggestions.push({
        suggestion: "Store excess solar energy",
        details: "High solar production detected. Store excess energy in battery for later use.",
        suggestedAction: "chargeStorage"
      });
    }
    
    // Suggest using battery during low solar periods
    if (solarProduction < demand * 0.2 && storageLevel > 0.3) {
      suggestions.push({
        suggestion: "Use battery storage",
        details: "Low solar production. Discharge battery to reduce engine load.",
        suggestedAction: "useStorage"
      });
    }
  }
  
  // Check for upcoming weather forecast (simplified)
  // In a real system, this would use weather API data
  if (Math.random() > 0.7) {
    suggestions.push({
      suggestion: "Possible solar output increase",
      details: "Weather forecast predicts clear skies tomorrow. Reduce scheduled engine usage from 8:00-16:00.",
      suggestedAction: "planForWeather"
    });
  }
  
  return suggestions;
}

// Calculate economic impact of optimization
export function calculateEconomicImpact(
  solarProduction: number,
  averageEngineEfficiency: number,
  fuelPricePerLiter = 1.5
): { 
  fuelSaved: number; 
  costReduction: number; 
  carbonOffset: number; 
} {
  // Calculate fuel saved by using solar instead of engines
  const fuelSaved = solarProduction / averageEngineEfficiency;
  
  // Calculate cost reduction
  const costReduction = fuelSaved * fuelPricePerLiter;
  
  // Calculate carbon offset (2.7kg CO2 per liter of diesel)
  const carbonOffset = fuelSaved * 2.7;
  
  return {
    fuelSaved,
    costReduction,
    carbonOffset
  };
}
