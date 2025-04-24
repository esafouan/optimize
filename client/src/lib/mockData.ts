import { Engine, SolarProduction, EnergyConsumption, EnergyStorage, OptimizationSuggestion } from './types';

// Mock Engines Data
export const mockEngines: Engine[] = [
  {
    id: 1,
    name: "Engine 1",
    capacity: 1000,
    currentOutput: 0,
    isRunning: false,
    efficiency: 2.5,
    optimalThreshold: 800,
    fuelConsumption: 0
  },
  {
    id: 2,
    name: "Engine 2",
    capacity: 1500,
    currentOutput: 0,
    isRunning: false,
    efficiency: 3.0,
    optimalThreshold: 1200,
    fuelConsumption: 0
  },
  {
    id: 3,
    name: "Engine 3",
    capacity: 2000,
    currentOutput: 0,
    isRunning: false,
    efficiency: 3.5,
    optimalThreshold: 1600,
    fuelConsumption: 0
  }
];

// Mock Storage System
export const mockStorage: EnergyStorage = {
  id: 1,
  capacity: 5000,
  currentCharge: 2500,
  chargeRate: 500,
  dischargeRate: 500,
  efficiency: 0.95
};

// Generate solar production data
export const generateSolarData = (day: number): SolarProduction[] => {
  const data: SolarProduction[] = [];
  for (let hour = 0; hour < 24; hour++) {
    // Solar production follows a bell curve pattern
    const baseProduction = hour >= 6 && hour <= 18 
      ? Math.sin((hour - 6) * Math.PI / 12) * 1000 
      : 0;
    
    data.push({
      id: day * 24 + hour,
      day,
      hour,
      output: Math.max(0, baseProduction * (0.8 + Math.random() * 0.4))
    });
  }
  return data;
};

// Generate consumption data
export const generateConsumptionData = (day: number): EnergyConsumption[] => {
  const data: EnergyConsumption[] = [];
  const baseLoad = 500;
  const peakLoad = 2000;

  for (let hour = 0; hour < 24; hour++) {
    // Higher consumption during work hours
    const isWorkHour = hour >= 8 && hour <= 17;
    const baseDemand = isWorkHour ? peakLoad : baseLoad;
    const variation = baseDemand * 0.2;

    data.push({
      id: day * 24 + hour,
      day,
      hour,
      demand: baseDemand + (Math.random() * variation - variation/2),
      source: isWorkHour ? "Production Line" : "Base Facilities"
    });
  }
  return data;
};

// Generate optimization suggestions
export const generateSuggestions = (): OptimizationSuggestion[] => [
  {
    id: 1,
    timestamp: Date.now(),
    type: "Engine Efficiency",
    description: "Engine 2 is running below optimal threshold. Consider increasing load or shutting down.",
    potentialSavings: 150,
    priority: 'high'
  },
  {
    id: 2,
    timestamp: Date.now(),
    type: "Load Distribution",
    description: "Redistribute load from Engine 1 to Engine 3 for better efficiency.",
    potentialSavings: 80,
    priority: 'medium'
  }
];