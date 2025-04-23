import { pgTable, text, serial, integer, boolean, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (keeping basic user schema from template)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Engine schema
export const engines = pgTable("engines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  maxCapacity: real("max_capacity").notNull(), // kWh/h
  efficiency: real("efficiency").notNull(), // kWh/litre
  optimalThreshold: real("optimal_threshold").notNull(), // min kWh
  isRunning: boolean("is_running").notNull().default(false),
  currentOutput: real("current_output").notNull().default(0), // current kWh output
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEngineSchema = createInsertSchema(engines).omit({
  id: true,
  isRunning: true,
  currentOutput: true,
  createdAt: true,
});

export const updateEngineSchema = createInsertSchema(engines).omit({
  id: true,
  createdAt: true,
});

export type InsertEngine = z.infer<typeof insertEngineSchema>;
export type UpdateEngine = z.infer<typeof updateEngineSchema>;
export type Engine = typeof engines.$inferSelect;

// Solar production schema
export const solarProduction = pgTable("solar_production", {
  id: serial("id").primaryKey(),
  day: integer("day").notNull(), // 1-7
  hour: integer("hour").notNull(), // 0-23
  output: real("output").notNull(), // kWh
  weather: text("weather"), // Weather condition
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSolarProductionSchema = createInsertSchema(solarProduction).omit({
  id: true,
  createdAt: true,
});

export type InsertSolarProduction = z.infer<typeof insertSolarProductionSchema>;
export type SolarProduction = typeof solarProduction.$inferSelect;

// Energy consumption schema
export const energyConsumption = pgTable("energy_consumption", {
  id: serial("id").primaryKey(),
  day: integer("day").notNull(), // 1-7
  hour: integer("hour").notNull(), // 0-23
  demand: real("demand").notNull(), // kWh
  source: text("source"), // Source of consumption
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEnergyConsumptionSchema = createInsertSchema(energyConsumption).omit({
  id: true,
  createdAt: true,
});

export type InsertEnergyConsumption = z.infer<typeof insertEnergyConsumptionSchema>;
export type EnergyConsumption = typeof energyConsumption.$inferSelect;

// Energy storage schema
export const energyStorage = pgTable("energy_storage", {
  id: serial("id").primaryKey(),
  maxCapacity: real("max_capacity").notNull(), // kWh
  currentCharge: real("current_charge").notNull(), // kWh
  chargeEfficiency: real("charge_efficiency").notNull(), // 0-1 percentage
  dischargeEfficiency: real("discharge_efficiency").notNull(), // 0-1 percentage
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEnergyStorageSchema = createInsertSchema(energyStorage).omit({
  id: true,
  updatedAt: true,
});

export type InsertEnergyStorage = z.infer<typeof insertEnergyStorageSchema>;
export type EnergyStorage = typeof energyStorage.$inferSelect;

// Simulation state schema
export const simulationState = pgTable("simulation_state", {
  id: serial("id").primaryKey(),
  currentDay: integer("current_day").notNull().default(1), // 1-7
  currentHour: integer("current_hour").notNull().default(8), // 0-23
  isRunning: boolean("is_running").notNull().default(false),
  engineStates: jsonb("engine_states").notNull().default({}), // JSON of engine states
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const updateSimulationStateSchema = createInsertSchema(simulationState).omit({
  id: true,
});

export type UpdateSimulationState = z.infer<typeof updateSimulationStateSchema>;
export type SimulationState = typeof simulationState.$inferSelect;

// Optimization suggestions schema
export const optimizationSuggestions = pgTable("optimization_suggestions", {
  id: serial("id").primaryKey(),
  day: integer("day").notNull(),
  hour: integer("hour").notNull(),
  suggestion: text("suggestion").notNull(),
  details: text("details").notNull(),
  engineId: integer("engine_id"),
  suggestedAction: text("suggested_action").notNull(),
  potentialSavings: real("potential_savings"),
  applied: boolean("applied").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOptimizationSuggestionSchema = createInsertSchema(optimizationSuggestions).omit({
  id: true,
  applied: true,
  createdAt: true,
});

export type InsertOptimizationSuggestion = z.infer<typeof insertOptimizationSuggestionSchema>;
export type OptimizationSuggestion = typeof optimizationSuggestions.$inferSelect;

// Economic impact schema
export const economicImpact = pgTable("economic_impact", {
  id: serial("id").primaryKey(),
  day: integer("day").notNull(),
  fuelSaved: real("fuel_saved").notNull(), // liters
  costReduction: real("cost_reduction").notNull(), // currency
  carbonOffset: real("carbon_offset").notNull(), // kg CO2
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEconomicImpactSchema = createInsertSchema(economicImpact).omit({
  id: true,
  createdAt: true,
});

export type InsertEconomicImpact = z.infer<typeof insertEconomicImpactSchema>;
export type EconomicImpact = typeof economicImpact.$inferSelect;
