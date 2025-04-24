import { 
  users, type User, type InsertUser,
  engines, type Engine, type InsertEngine, type UpdateEngine,
  solarProduction, type SolarProduction, type InsertSolarProduction,
  energyConsumption, type EnergyConsumption, type InsertEnergyConsumption,
  energyStorage, type EnergyStorage, type InsertEnergyStorage,
  simulationState, type SimulationState, type UpdateSimulationState,
  optimizationSuggestions, type OptimizationSuggestion, type InsertOptimizationSuggestion,
  economicImpact, type EconomicImpact, type InsertEconomicImpact
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Engine operations
  getAllEngines(): Promise<Engine[]>;
  getEngine(id: number): Promise<Engine | undefined>;
  createEngine(engine: InsertEngine): Promise<Engine>;
  updateEngine(id: number, updates: Partial<UpdateEngine>): Promise<Engine | undefined>;
  deleteEngine(id: number): Promise<boolean>;

  // Solar production operations
  getSolarProduction(day: number | null, hour: number | null, id?: number): Promise<SolarProduction | undefined>;
  getDailySolarProduction(day: number): Promise<SolarProduction[]>;
  getWeeklySolarProduction(): Promise<SolarProduction[]>;
  createSolarProduction(data: InsertSolarProduction): Promise<SolarProduction>;
  updateSolarProduction(id: number, updates: Partial<InsertSolarProduction>): Promise<SolarProduction | undefined>;

  // Consumption operations
  getConsumption(day: number | null, hour: number | null, id?: number): Promise<EnergyConsumption | undefined>;
  getDailyConsumption(day: number): Promise<EnergyConsumption[]>;
  getWeeklyConsumption(): Promise<EnergyConsumption[]>;
  createConsumption(data: InsertEnergyConsumption): Promise<EnergyConsumption>;
  updateConsumption(id: number, updates: Partial<InsertEnergyConsumption>): Promise<EnergyConsumption | undefined>;

  // Energy storage operations
  getEnergyStorage(): Promise<EnergyStorage | undefined>;
  createEnergyStorage(data: InsertEnergyStorage): Promise<EnergyStorage>;
  updateEnergyStorage(id: number, updates: Partial<InsertEnergyStorage>): Promise<EnergyStorage | undefined>;

  // Simulation state operations
  getSimulationState(): Promise<SimulationState | undefined>;
  createSimulationState(data: Omit<UpdateSimulationState, 'id'>): Promise<SimulationState>;
  updateSimulationState(id: number, updates: Partial<UpdateSimulationState>): Promise<SimulationState>;

  // Optimization suggestion operations
  getOptimizationSuggestions(): Promise<OptimizationSuggestion[]>;
  getOptimizationSuggestion(id: number): Promise<OptimizationSuggestion | undefined>;
  createOptimizationSuggestion(data: Omit<InsertOptimizationSuggestion, 'applied'>): Promise<OptimizationSuggestion>;
  updateOptimizationSuggestion(id: number, updates: Partial<OptimizationSuggestion>): Promise<OptimizationSuggestion | undefined>;
  clearOptimizationSuggestions(): Promise<void>;

  // Economic impact operations
  getEconomicImpact(): Promise<EconomicImpact | undefined>;
  getEconomicImpactByDay(day: number): Promise<EconomicImpact | undefined>;
  createEconomicImpact(data: InsertEconomicImpact): Promise<EconomicImpact>;
  updateEconomicImpact(id: number, updates: Partial<EconomicImpact>): Promise<EconomicImpact | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private engines: Map<number, Engine>;
  private solarProductions: Map<number, SolarProduction>;
  private energyConsumptions: Map<number, EnergyConsumption>;
  private energyStorages: Map<number, EnergyStorage>;
  private simulationStates: Map<number, SimulationState>;
  private optimizationSugs: Map<number, OptimizationSuggestion>;
  private economicImpacts: Map<number, EconomicImpact>;

  private userCurrentId: number;
  private engineCurrentId: number;
  private solarProductionCurrentId: number;
  private energyConsumptionCurrentId: number;
  private energyStorageCurrentId: number;
  private simulationStateCurrentId: number;
  private optimizationSugCurrentId: number;
  private economicImpactCurrentId: number;

  constructor() {
    this.users = new Map();
    this.engines = new Map();
    this.solarProductions = new Map();
    this.energyConsumptions = new Map();
    this.energyStorages = new Map();
    this.simulationStates = new Map();
    this.optimizationSugs = new Map();
    this.economicImpacts = new Map();

    this.userCurrentId = 1;
    this.engineCurrentId = 1;
    this.solarProductionCurrentId = 1;
    this.energyConsumptionCurrentId = 1;
    this.energyStorageCurrentId = 1;
    this.simulationStateCurrentId = 1;
    this.optimizationSugCurrentId = 1;
    this.economicImpactCurrentId = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Create sample engines with initial settings
    const engine1 = await this.createEngine({
      name: "Engine Alpha",
      maxCapacity: 500,
      efficiency: 4.2,
      optimalThreshold: 150,
    });
    
    const engine2 = await this.createEngine({
      name: "Engine Beta",
      maxCapacity: 350,
      efficiency: 3.8,
      optimalThreshold: 100,
    });
    
    const engine3 = await this.createEngine({
      name: "Engine Gamma",
      maxCapacity: 650,
      efficiency: 5.1,
      optimalThreshold: 200,
    });

    // Initialize simulation state
    await this.createSimulationState({
      currentDay: 1,
      currentHour: 8,
      isRunning: false,
      engineStates: {},
    });

    // Create energy storage
    await this.createEnergyStorage({
      maxCapacity: 600,
      currentCharge: 450,
      chargeEfficiency: 0.9,
      dischargeEfficiency: 0.95,
    });

    // Create pre-defined solar production data
    await this.initializeSolarProductionData();
    
    // Create pre-defined consumption data
    await this.initializeConsumptionData();

    // After initializing consumption data, get the current demand and match engine production
    const currentDay = 1;
    const currentHour = 8;
    
    // Get current consumption demand
    const consumption = await this.getConsumption(currentDay, currentHour);
    
    // Get current solar production
    const solarProduction = await this.getSolarProduction(currentDay, currentHour);
    
    if (consumption && solarProduction) {
      const totalDemand = consumption.demand;
      const solarOutput = solarProduction.output;
      
      // Calculate remaining demand after solar production
      const remainingDemand = Math.max(0, totalDemand - solarOutput);
      
      if (remainingDemand > 0) {
        // Calculate how to distribute the remaining demand across the three engines
        // We'll distribute proportionally to their max capacity
        const totalCapacity = engine1.maxCapacity + engine2.maxCapacity + engine3.maxCapacity;
        
        // Calculate each engine's share of the remaining demand
        const engine1Output = Math.min(Math.round((engine1.maxCapacity / totalCapacity) * remainingDemand), engine1.maxCapacity);
        const engine2Output = Math.min(Math.round((engine2.maxCapacity / totalCapacity) * remainingDemand), engine2.maxCapacity);
        
        // The third engine will handle any remainder to ensure exact match with demand
        const adjustedRemainingDemand = remainingDemand - engine1Output - engine2Output;
        const engine3Output = Math.min(adjustedRemainingDemand, engine3.maxCapacity);
        
        // Update the engines with their calculated outputs
        await this.updateEngine(engine1.id, { currentOutput: engine1Output });
        await this.updateEngine(engine2.id, { currentOutput: engine2Output });
        await this.updateEngine(engine3.id, { currentOutput: engine3Output });
        
        console.log(`Initialized engines to match demand: Total demand ${totalDemand}kW, Solar ${solarOutput}kW, Engines: ${engine1Output}kW + ${engine2Output}kW + ${engine3Output}kW = ${engine1Output + engine2Output + engine3Output}kW`);
      } else {
        // If solar production exceeds demand, set minimal output for engines
        // We'll keep them running at 10% capacity for quick response to demand changes
        await this.updateEngine(engine1.id, { currentOutput: Math.round(engine1.maxCapacity * 0.1) });
        await this.updateEngine(engine2.id, { currentOutput: Math.round(engine2.maxCapacity * 0.1) });
        await this.updateEngine(engine3.id, { currentOutput: Math.round(engine3.maxCapacity * 0.1) });
        
        console.log(`Solar production (${solarOutput}kW) exceeds demand (${totalDemand}kW). Engines set to minimal output.`);
      }
    }
  }

  // Initialize pre-defined solar production data
  private async initializeSolarProductionData() {
    // Day 1 solar production data (24 hours)
    const solarOutputsByHour = [
      0, 0, 0, 0, 0, 10, 45, 120, 
      280, 410, 520, 590, 620, 580, 
      510, 390, 240, 90, 20, 0, 0, 0, 0, 0
    ];

    // Create solar production for days 1-7
    for (let day = 1; day <= 7; day++) {
      // Add some randomness for each day while maintaining the pattern
      const dailyMultiplier = 0.8 + Math.random() * 0.4; // 0.8 to 1.2

      for (let hour = 0; hour < 24; hour++) {
        const baseOutput = solarOutputsByHour[hour];
        // Apply daily variation + small hourly randomness
        const output = Math.round(baseOutput * dailyMultiplier * (0.9 + Math.random() * 0.2));
        
        await this.createSolarProduction({
          day,
          hour,
          output,
          weather: this.getWeatherCondition(output, baseOutput)
        });
      }
    }
  }

  // Get a weather condition based on solar output compared to expected
  private getWeatherCondition(actual: number, expected: number): string {
    if (expected === 0) return "Night";
    
    const ratio = actual / expected;
    if (ratio > 0.9) return "Sunny";
    if (ratio > 0.7) return "Partly Cloudy";
    if (ratio > 0.4) return "Cloudy";
    return "Overcast";
  }

  // Initialize pre-defined consumption data
  private async initializeConsumptionData() {
    // Base consumption pattern by hour - industrial facility with working hours
    const consumptionByHour = [
      120, 110, 100, 90, 95, 150, 280, 450,
      600, 680, 720, 750, 720, 700, 
      680, 650, 550, 420, 350, 300, 250, 180, 150, 130
    ];

    // Create consumption data for days 1-7
    for (let day = 1; day <= 7; day++) {
      // Weekend pattern has reduced consumption
      const isWeekend = day % 7 === 0 || day % 7 === 6;
      const dayMultiplier = isWeekend ? 0.6 : 1.0;

      for (let hour = 0; hour < 24; hour++) {
        // Apply daily pattern + small randomness
        const demand = Math.round(
          consumptionByHour[hour] * dayMultiplier * (0.95 + Math.random() * 0.1)
        );
        
        await this.createConsumption({
          day,
          hour,
          demand,
          source: this.getConsumptionSource(hour)
        });
      }
    }
  }

  // Get the main consumption source based on the hour
  private getConsumptionSource(hour: number): string {
    if (hour >= 8 && hour <= 17) return "Production Line";
    if (hour >= 6 && hour < 8) return "Startup Procedures";
    if (hour > 17 && hour <= 20) return "Maintenance";
    return "Base Facilities";
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Engine operations
  async getAllEngines(): Promise<Engine[]> {
    return Array.from(this.engines.values());
  }

  async getEngine(id: number): Promise<Engine | undefined> {
    return this.engines.get(id);
  }

  async createEngine(insertEngine: InsertEngine): Promise<Engine> {
    const id = this.engineCurrentId++;
    const engine: Engine = {
      ...insertEngine,
      id,
      isRunning: true,
      currentOutput: 0,
      createdAt: new Date(),
    };
    this.engines.set(id, engine);
    return engine;
  }

  async updateEngine(id: number, updates: Partial<UpdateEngine>): Promise<Engine | undefined> {
    const engine = this.engines.get(id);
    if (!engine) return undefined;

    const updatedEngine: Engine = {
      ...engine,
      ...updates,
    };
    this.engines.set(id, updatedEngine);
    return updatedEngine;
  }

  async deleteEngine(id: number): Promise<boolean> {
    return this.engines.delete(id);
  }

  // Solar production operations
  async getSolarProduction(day: number | null, hour: number | null, id?: number): Promise<SolarProduction | undefined> {
    if (id !== undefined) {
      return this.solarProductions.get(id);
    }
    
    if (day !== null && hour !== null) {
      return Array.from(this.solarProductions.values()).find(
        (prod) => prod.day === day && prod.hour === hour
      );
    }
    
    return undefined;
  }

  async getDailySolarProduction(day: number): Promise<SolarProduction[]> {
    return Array.from(this.solarProductions.values()).filter(
      (prod) => prod.day === day
    ).sort((a, b) => a.hour - b.hour);
  }

  async getWeeklySolarProduction(): Promise<SolarProduction[]> {
    return Array.from(this.solarProductions.values())
      .sort((a, b) => a.day === b.day ? a.hour - b.hour : a.day - b.day);
  }

  async createSolarProduction(data: InsertSolarProduction): Promise<SolarProduction> {
    const id = this.solarProductionCurrentId++;
    const production: SolarProduction = {
      ...data,
      id,
      createdAt: new Date(),
    };
    this.solarProductions.set(id, production);
    return production;
  }

  async updateSolarProduction(id: number, updates: Partial<InsertSolarProduction>): Promise<SolarProduction | undefined> {
    const production = this.solarProductions.get(id);
    if (!production) return undefined;

    const updatedProduction: SolarProduction = {
      ...production,
      ...updates,
    };
    this.solarProductions.set(id, updatedProduction);
    return updatedProduction;
  }

  // Consumption operations
  async getConsumption(day: number | null, hour: number | null, id?: number): Promise<EnergyConsumption | undefined> {
    if (id !== undefined) {
      return this.energyConsumptions.get(id);
    }
    
    if (day !== null && hour !== null) {
      return Array.from(this.energyConsumptions.values()).find(
        (consumption) => consumption.day === day && consumption.hour === hour
      );
    }
    
    return undefined;
  }

  async getDailyConsumption(day: number): Promise<EnergyConsumption[]> {
    return Array.from(this.energyConsumptions.values()).filter(
      (consumption) => consumption.day === day
    ).sort((a, b) => a.hour - b.hour);
  }

  async getWeeklyConsumption(): Promise<EnergyConsumption[]> {
    return Array.from(this.energyConsumptions.values())
      .sort((a, b) => a.day === b.day ? a.hour - b.hour : a.day - b.day);
  }

  async createConsumption(data: InsertEnergyConsumption): Promise<EnergyConsumption> {
    const id = this.energyConsumptionCurrentId++;
    const consumption: EnergyConsumption = {
      ...data,
      id,
      createdAt: new Date(),
    };
    this.energyConsumptions.set(id, consumption);
    return consumption;
  }

  async updateConsumption(id: number, updates: Partial<InsertEnergyConsumption>): Promise<EnergyConsumption | undefined> {
    const consumption = this.energyConsumptions.get(id);
    if (!consumption) return undefined;

    const updatedConsumption: EnergyConsumption = {
      ...consumption,
      ...updates,
    };
    this.energyConsumptions.set(id, updatedConsumption);
    return updatedConsumption;
  }

  // Energy storage operations
  async getEnergyStorage(): Promise<EnergyStorage | undefined> {
    return Array.from(this.energyStorages.values())[0];
  }

  async createEnergyStorage(data: InsertEnergyStorage): Promise<EnergyStorage> {
    const id = this.energyStorageCurrentId++;
    const storage: EnergyStorage = {
      ...data,
      id,
      updatedAt: new Date(),
    };
    this.energyStorages.set(id, storage);
    return storage;
  }

  async updateEnergyStorage(id: number, updates: Partial<InsertEnergyStorage>): Promise<EnergyStorage | undefined> {
    const storage = this.energyStorages.get(id);
    if (!storage) return undefined;

    const updatedStorage: EnergyStorage = {
      ...storage,
      ...updates,
      updatedAt: new Date(),
    };
    this.energyStorages.set(id, updatedStorage);
    return updatedStorage;
  }

  // Simulation state operations
  async getSimulationState(): Promise<SimulationState | undefined> {
    return Array.from(this.simulationStates.values())[0];
  }

  async createSimulationState(data: Omit<UpdateSimulationState, 'id'>): Promise<SimulationState> {
    const id = this.simulationStateCurrentId++;
    const state: SimulationState = {
      ...data,
      id,
      updatedAt: new Date(),
    };
    this.simulationStates.set(id, state);
    return state;
  }

  async updateSimulationState(id: number, updates: Partial<UpdateSimulationState>): Promise<SimulationState> {
    const state = this.simulationStates.get(id);
    if (!state) {
      // Create a new state if it doesn't exist
      return this.createSimulationState({
        currentDay: updates.currentDay || 1,
        currentHour: updates.currentHour || 8,
        isRunning: updates.isRunning || false,
        engineStates: updates.engineStates || {},
      });
    }

    const updatedState: SimulationState = {
      ...state,
      ...updates,
      updatedAt: new Date(),
    };
    this.simulationStates.set(id, updatedState);
    return updatedState;
  }

  // Optimization suggestion operations
  async getOptimizationSuggestions(): Promise<OptimizationSuggestion[]> {
    return Array.from(this.optimizationSugs.values())
      .filter(sug => !sug.applied)
      .sort((a, b) => (b.potentialSavings || 0) - (a.potentialSavings || 0));
  }

  async getOptimizationSuggestion(id: number): Promise<OptimizationSuggestion | undefined> {
    return this.optimizationSugs.get(id);
  }

  async createOptimizationSuggestion(data: Omit<InsertOptimizationSuggestion, 'applied'>): Promise<OptimizationSuggestion> {
    const id = this.optimizationSugCurrentId++;
    const suggestion: OptimizationSuggestion = {
      ...data,
      id,
      applied: false,
      createdAt: new Date(),
    };
    this.optimizationSugs.set(id, suggestion);
    return suggestion;
  }

  async updateOptimizationSuggestion(id: number, updates: Partial<OptimizationSuggestion>): Promise<OptimizationSuggestion | undefined> {
    const suggestion = this.optimizationSugs.get(id);
    if (!suggestion) return undefined;

    const updatedSuggestion: OptimizationSuggestion = {
      ...suggestion,
      ...updates,
    };
    this.optimizationSugs.set(id, updatedSuggestion);
    return updatedSuggestion;
  }

  async clearOptimizationSuggestions(): Promise<void> {
    // Delete all non-applied suggestions
    for (const [id, suggestion] of this.optimizationSugs.entries()) {
      if (!suggestion.applied) {
        this.optimizationSugs.delete(id);
      }
    }
  }

  // Economic impact operations
  async getEconomicImpact(): Promise<EconomicImpact | undefined> {
    // Return the impact for the current day, or the most recent one
    const simulationState = await this.getSimulationState();
    if (!simulationState) return undefined;

    return this.getEconomicImpactByDay(simulationState.currentDay);
  }

  async getEconomicImpactByDay(day: number): Promise<EconomicImpact | undefined> {
    return Array.from(this.economicImpacts.values()).find(
      (impact) => impact.day === day
    );
  }

  async createEconomicImpact(data: InsertEconomicImpact): Promise<EconomicImpact> {
    const id = this.economicImpactCurrentId++;
    const impact: EconomicImpact = {
      ...data,
      id,
      createdAt: new Date(),
    };
    this.economicImpacts.set(id, impact);
    return impact;
  }

  async updateEconomicImpact(id: number, updates: Partial<EconomicImpact>): Promise<EconomicImpact | undefined> {
    const impact = this.economicImpacts.get(id);
    if (!impact) return undefined;

    const updatedImpact: EconomicImpact = {
      ...impact,
      ...updates,
    };
    this.economicImpacts.set(id, updatedImpact);
    return updatedImpact;
  }
}

export const storage = new MemStorage();
