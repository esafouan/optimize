import { Engine } from "@shared/schema";

// Simulation helper functions for energy management

// Calculate total energy production from engines and solar
export function calculateTotalProduction(
  engines: Engine[], 
  solarProduction: number
): number {
  const engineProduction = engines
    .filter(engine => engine.isRunning)
    .reduce((total, engine) => total + engine.currentOutput, 0);
  
  return engineProduction + solarProduction;
}

// Calculate energy balance (production - consumption)
export function calculateEnergyBalance(
  totalProduction: number,
  consumption: number
): number {
  return totalProduction - consumption;
}

// Allocate engine output based on demand and solar availability
export function allocateEngineOutput(
  engines: Engine[],
  demand: number,
  solarProduction: number
): { id: number, output: number }[] {
  const runningEngines = [...engines].filter(engine => engine.isRunning);
  if (runningEngines.length === 0) return [];
  
  // Sort engines by efficiency (most efficient first)
  runningEngines.sort((a, b) => b.efficiency - a.efficiency);
  
  const remainingDemand = Math.max(0, demand - solarProduction);
  const allocations: { id: number, output: number }[] = [];
  
  let unallocatedDemand = remainingDemand;
  
  // First pass: allocate to engines at their optimal threshold if possible
  for (const engine of runningEngines) {
    if (unallocatedDemand >= engine.optimalThreshold) {
      allocations.push({
        id: engine.id,
        output: engine.optimalThreshold
      });
      unallocatedDemand -= engine.optimalThreshold;
    } else if (unallocatedDemand > 0) {
      // Allocate remaining demand to this engine
      allocations.push({
        id: engine.id,
        output: unallocatedDemand
      });
      unallocatedDemand = 0;
    } else {
      // No more demand to allocate
      allocations.push({
        id: engine.id,
        output: 0
      });
    }
  }
  
  // Second pass: distribute any remaining demand among engines that can take more
  if (unallocatedDemand > 0) {
    for (let i = 0; i < allocations.length && unallocatedDemand > 0; i++) {
      const engine = runningEngines[i];
      const currentAllocation = allocations[i].output;
      
      if (currentAllocation < engine.maxCapacity) {
        const additionalCapacity = engine.maxCapacity - currentAllocation;
        const additionalAllocation = Math.min(additionalCapacity, unallocatedDemand);
        
        allocations[i].output += additionalAllocation;
        unallocatedDemand -= additionalAllocation;
      }
    }
  }
  
  return allocations;
}

// Calculate fuel consumption based on engine output and efficiency
export function calculateFuelConsumption(
  engines: Engine[]
): number {
  return engines
    .filter(engine => engine.isRunning)
    .reduce((total, engine) => {
      // Convert kWh to liters based on efficiency (kWh/L)
      return total + (engine.currentOutput / engine.efficiency);
    }, 0);
}

// Calculate carbon emissions from engines
export function calculateCarbonEmissions(fuelConsumption: number): number {
  // Assuming 2.7kg CO2 per liter of diesel
  return fuelConsumption * 2.7;
}

// Calculate cost of fuel
export function calculateFuelCost(fuelConsumption: number, pricePerLiter = 1.5): number {
  return fuelConsumption * pricePerLiter;
}
