export interface Engine {
    id: number;
    name: string;
    capacity: number;
    currentOutput: number;
    isRunning: boolean;
    efficiency: number;
    optimalThreshold: number;
    fuelConsumption: number;
  }
  
  export interface SolarProduction {
    id: number;
    day: number;
    hour: number;
    output: number;
  }
  
  export interface EnergyConsumption {
    id: number;
    day: number;
    hour: number;
    demand: number;
    source: string;
  }
  
  export interface EnergyStorage {
    id: number;
    capacity: number;
    currentCharge: number;
    chargeRate: number;
    dischargeRate: number;
    efficiency: number;
  }
  
  export interface OptimizationSuggestion {
    id: number;
    timestamp: number;
    type: string;
    description: string;
    potentialSavings: number;
    priority: 'low' | 'medium' | 'high';
  }