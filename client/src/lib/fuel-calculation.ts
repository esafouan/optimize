import { Engine } from "@shared/schema";

// Calculate fuel consumption based on engine output and efficiency
export function calculateFuelConsumption(engines: Engine[]): number {
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

// Calculate hourly fuel consumption
export function calculateHourlyFuelConsumption(engines: Engine[]): number {
  return calculateFuelConsumption(engines);
}

// Calculate daily fuel consumption (estimated)
export function calculateDailyFuelConsumption(engines: Engine[]): number {
  return calculateFuelConsumption(engines) * 24;
}

// Calculate weekly fuel consumption (estimated)
export function calculateWeeklyFuelConsumption(engines: Engine[]): number {
  return calculateFuelConsumption(engines) * 24 * 7;
}