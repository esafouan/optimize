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
  getSolarProduction(day: number, hour: number): Promise<SolarProduction | undefined>;
  getDailySolarProduction(day: number): Promise<SolarProduction[]>;
  getWeeklySolarProduction(): Promise<SolarProduction[]>;
  createSolarProduction(data: InsertSolarProduction): Promise<SolarProduction>;
  updateSolarProduction(id: number, updates: Partial<InsertSolarProduction>): Promise<SolarProduction | undefined>;

  // Consumption operations
  getConsumption(day: number, hour: number): Promise<EnergyConsumption | undefined>;
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

  private initializeSampleData() {
    // Create sample engines
    this.createEngine({
      name: "Engine Alpha",
      maxCapacity: 500,
      efficiency: 4.2,
      optimalThreshold: 150,
    });
    
    this.createEngine({
      name: "Engine Beta",
      maxCapacity: 350,
      efficiency: 3.8,
      optimalThreshold: 100,
    });
    
    this.createEngine({
      name: "Engine Gamma",
      maxCapacity: 650,
      efficiency: 5.1,
      optimalThreshold: 200,
    });

    // Initialize simulation state
    this.createSimulationState({
      currentDay: 1,
      currentHour: 8,
      isRunning: false,
      engineStates: {},
    });

    // Create energy storage
    this.createEnergyStorage({
      maxCapacity: 600,
      currentCharge: 450,
      chargeEfficiency: 0.9,
      dischargeEfficiency: 0.95,
    });
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
      isRunning: false,
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
  async getSolarProduction(day: number, hour: number): Promise<SolarProduction | undefined> {
    return Array.from(this.solarProductions.values()).find(
      (prod) => prod.day === day && prod.hour === hour
    );
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
  async getConsumption(day: number, hour: number): Promise<EnergyConsumption | undefined> {
    return Array.from(this.energyConsumptions.values()).find(
      (consumption) => consumption.day === day && consumption.hour === hour
    );
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
