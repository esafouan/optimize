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

// Generate forecast-based instruction list for current and future hours
export function generateInstructions(
  engines: Engine[],
  currentSolar: number,
  currentDemand: number,
  forecastSolar: number[],
  forecastDemand: number[],
  currentDay: number,
  currentHour: number,
  batteryLevel = 50
): {
  currentInstructions: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    type: 'immediate' | 'scheduled';
    engineId?: number;
    action?: string;
  }>;
  forecastInstructions: Array<{
    hour: number;
    day: number;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    engineId?: number;
    action?: string;
  }>;
} {
  const currentInstructions = [];
  const forecastInstructions = [];
  
  // Calculate current production status
  const runningEngines = engines.filter(engine => engine.isRunning);
  const totalEngineProduction = runningEngines.reduce(
    (sum, engine) => sum + engine.currentOutput, 
    0
  );
  const totalProduction = totalEngineProduction + currentSolar;
  const energyBalance = totalProduction - currentDemand;
  
  // Create immediate instructions based on current state
  
  // 1. Check for immediate energy imbalance
  if (energyBalance < -20) {
    // Energy deficit - need more production
    const deficitAmount = Math.abs(energyBalance);
    
    // Find standby engines that could cover the deficit
    const stoppedEngines = engines.filter(engine => !engine.isRunning)
      .sort((a, b) => b.efficiency - a.efficiency);
    
    if (stoppedEngines.length > 0 && deficitAmount > 50) {
      // Find the most efficient engine that covers the deficit
      const suitableEngine = stoppedEngines.find(
        engine => engine.optimalThreshold <= deficitAmount && 
                 engine.maxCapacity >= deficitAmount
      ) || stoppedEngines[0];
      
      currentInstructions.push({
        title: `Start ${suitableEngine.name}`,
        description: `Energy deficit of ${deficitAmount.toFixed(0)} kWh detected. Start ${suitableEngine.name} to cover the shortfall.`,
        priority: 'high',
        type: 'immediate',
        engineId: suitableEngine.id,
        action: 'startEngine'
      });
    } else if (batteryLevel > 20) {
      // Use battery if available
      currentInstructions.push({
        title: 'Discharge battery storage',
        description: `Energy deficit of ${deficitAmount.toFixed(0)} kWh detected. Use battery storage to cover the shortfall.`,
        priority: 'medium',
        type: 'immediate',
        action: 'dischargeBattery'
      });
    }
  } else if (energyBalance > 50) {
    // Energy surplus - potential to reduce engine load
    if (runningEngines.length > 0) {
      // Find the least efficient running engine
      const leastEfficient = [...runningEngines].sort((a, b) => {
        const effA = calculateEngineEfficiency(a.currentOutput, a.maxCapacity);
        const effB = calculateEngineEfficiency(b.currentOutput, b.maxCapacity);
        return effA - effB;
      })[0];
      
      currentInstructions.push({
        title: `Shut down ${leastEfficient.name}`,
        description: `Energy surplus of ${energyBalance.toFixed(0)} kWh detected. Shut down ${leastEfficient.name} to improve efficiency.`,
        priority: 'medium',
        type: 'immediate',
        engineId: leastEfficient.id,
        action: 'shutDownEngine'
      });
    } else if (batteryLevel < 90) {
      // Charge battery with excess energy
      currentInstructions.push({
        title: 'Charge battery storage',
        description: `Energy surplus of ${energyBalance.toFixed(0)} kWh detected. Store excess energy in battery.`,
        priority: 'medium',
        type: 'immediate',
        action: 'chargeBattery'
      });
    }
  }
  
  // 2. Check for engines running outside optimal range
  runningEngines.forEach(engine => {
    const efficiency = calculateEngineEfficiency(engine.currentOutput, engine.maxCapacity);
    if (engine.currentOutput < engine.optimalThreshold * 0.8) {
      currentInstructions.push({
        title: `Optimize ${engine.name}`,
        description: `${engine.name} is running below optimal range. Increase load to ${engine.optimalThreshold.toFixed(0)} kWh or shut down.`,
        priority: engine.currentOutput < engine.optimalThreshold * 0.6 ? 'high' : 'medium',
        type: 'immediate',
        engineId: engine.id,
        action: 'optimizeEngine'
      });
    } else if (engine.currentOutput > engine.maxCapacity * 0.95) {
      currentInstructions.push({
        title: `Warning for ${engine.name}`,
        description: `${engine.name} is running near maximum capacity. Consider reducing load or distributing to other engines.`,
        priority: 'high',
        type: 'immediate',
        engineId: engine.id,
        action: 'reduceLoad'
      });
    }
  });
  
  // Add forecast-based instructions for future hours
  // We'll check the next 6 hours
  const forecastHours = Math.min(forecastSolar.length, forecastDemand.length, 6);
  
  for (let i = 0; i < forecastHours; i++) {
    const forecastHour = (currentHour + i + 1) % 24;
    const forecastDay = currentDay + Math.floor((currentHour + i + 1) / 24);
    
    const hourSolar = forecastSolar[i];
    const hourDemand = forecastDemand[i];
    const hourBalance = hourSolar - hourDemand;
    
    // Create instructions based on predicted imbalances
    if (hourBalance < -50) {
      // Significant energy deficit predicted
      forecastInstructions.push({
        hour: forecastHour,
        day: forecastDay,
        title: `Prepare for increased demand`,
        description: `Energy deficit of ${Math.abs(hourBalance).toFixed(0)} kWh predicted at ${forecastHour}:00. Prepare additional engines.`,
        priority: Math.abs(hourBalance) > 100 ? 'high' : 'medium',
        action: 'schedulePowerIncrease'
      });
    } else if (hourBalance > 100) {
      // Significant energy surplus predicted
      forecastInstructions.push({
        hour: forecastHour,
        day: forecastDay,
        title: `Prepare for reduced engine load`,
        description: `Energy surplus of ${hourBalance.toFixed(0)} kWh predicted at ${forecastHour}:00. Plan to reduce engine operations.`,
        priority: 'medium',
        action: 'schedulePowerDecrease'
      });
    }
    
    // Special case for solar peak hours
    if (hourSolar > currentSolar * 1.5 && hourSolar > 300) {
      forecastInstructions.push({
        hour: forecastHour,
        day: forecastDay,
        title: 'Solar peak predicted',
        description: `High solar production of ${hourSolar.toFixed(0)} kWh predicted at ${forecastHour}:00. Optimize engine scheduling.`,
        priority: 'medium',
        action: 'optimizeSolarUsage'
      });
    }
    
    // Special case for demand peak hours
    if (hourDemand > currentDemand * 1.3 && hourDemand > 500) {
      forecastInstructions.push({
        hour: forecastHour,
        day: forecastDay,
        title: 'Demand peak predicted',
        description: `High energy demand of ${hourDemand.toFixed(0)} kWh predicted at ${forecastHour}:00. Ensure sufficient capacity.`,
        priority: 'high',
        action: 'preparePeakDemand'
      });
    }
  }
  
  return {
    currentInstructions: currentInstructions as Array<{
      title: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
      type: 'immediate' | 'scheduled';
      engineId?: number;
      action?: string;
    }>,
    forecastInstructions: forecastInstructions as Array<{
      hour: number;
      day: number;
      title: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
      engineId?: number;
      action?: string;
    }>
  };
}
