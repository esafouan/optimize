import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertEngineSchema, 
  updateEngineSchema, 
  insertSolarProductionSchema, 
  insertEnergyConsumptionSchema,
  updateSimulationStateSchema,
  insertOptimizationSuggestionSchema,
  insertEconomicImpactSchema
} from "@shared/schema";
import { generateOptimizationSuggestions, calculateEconomicImpact } from "../client/src/lib/optimization";
import { calculateEngineEfficiency } from "../client/src/lib/utils";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  const apiPrefix = "/api";

  /**
   * ENGINES API
   */
  // Get all engines
  app.get(`${apiPrefix}/engines`, async (req, res) => {
    try {
      const engines = await storage.getAllEngines();
      res.json(engines);
    } catch (error) {
      res.status(500).json({ message: "Failed to get engines" });
    }
  });

  // Get engine by ID
  app.get(`${apiPrefix}/engines/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const engine = await storage.getEngine(id);
      if (!engine) {
        return res.status(404).json({ message: "Engine not found" });
      }
      res.json(engine);
    } catch (error) {
      res.status(500).json({ message: "Failed to get engine" });
    }
  });

  // Create new engine
  app.post(`${apiPrefix}/engines`, async (req, res) => {
    try {
      const engineData = insertEngineSchema.parse(req.body);
      const engine = await storage.createEngine(engineData);
      res.status(201).json(engine);
    } catch (error) {
      res.status(400).json({ message: "Invalid engine data", error });
    }
  });

  // Update engine
  app.patch(`${apiPrefix}/engines/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const engineData = updateEngineSchema.parse(req.body);
      const engine = await storage.updateEngine(id, engineData);
      if (!engine) {
        return res.status(404).json({ message: "Engine not found" });
      }
      res.json(engine);
    } catch (error) {
      res.status(400).json({ message: "Invalid engine data", error });
    }
  });

  // Toggle engine state
  app.patch(`${apiPrefix}/engines/:id/toggle`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isRunning } = req.body;
      const engine = await storage.updateEngine(id, { isRunning });
      if (!engine) {
        return res.status(404).json({ message: "Engine not found" });
      }
      res.json(engine);
    } catch (error) {
      res.status(400).json({ message: "Invalid engine data", error });
    }
  });

  // Update engine output
  app.patch(`${apiPrefix}/engines/:id/output`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { currentOutput } = req.body;
      const engine = await storage.updateEngine(id, { currentOutput });
      if (!engine) {
        return res.status(404).json({ message: "Engine not found" });
      }
      res.json(engine);
    } catch (error) {
      res.status(400).json({ message: "Invalid engine data", error });
    }
  });

  // Delete engine
  app.delete(`${apiPrefix}/engines/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEngine(id);
      if (!success) {
        return res.status(404).json({ message: "Engine not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete engine" });
    }
  });

  /**
   * SOLAR API
   */
  // Get current solar production
  app.get(`${apiPrefix}/solar/current`, async (req, res) => {
    try {
      // Use fixed day/hour values
      const currentDay = 1;
      const currentHour = 8;
      
      const solarProduction = await storage.getSolarProduction(currentDay, currentHour);
      
      if (!solarProduction) {
        return res.json({ output: 0 });
      }
      
      res.json(solarProduction);
    } catch (error) {
      res.status(500).json({ message: "Failed to get current solar production" });
    }
  });

  // Get daily solar production
  app.get(`${apiPrefix}/solar/day/:day?`, async (req, res) => {
    try {
      let day = req.params.day ? parseInt(req.params.day) : 1; // Default to day 1
      
      const dailySolar = await storage.getDailySolarProduction(day);
      res.json(dailySolar);
    } catch (error) {
      res.status(500).json({ message: "Failed to get daily solar production" });
    }
  });

  // Get weekly solar production
  app.get(`${apiPrefix}/solar/week`, async (req, res) => {
    try {
      const weeklySolar = await storage.getWeeklySolarProduction();
      res.json(weeklySolar);
    } catch (error) {
      res.status(500).json({ message: "Failed to get weekly solar production" });
    }
  });

  // Create or update solar production
  app.post(`${apiPrefix}/solar`, async (req, res) => {
    try {
      const solarData = insertSolarProductionSchema.parse(req.body);
      const existingData = await storage.getSolarProduction(solarData.day, solarData.hour);
      
      if (existingData) {
        const updatedData = await storage.updateSolarProduction(existingData.id, solarData);
        return res.json(updatedData);
      }
      
      const newData = await storage.createSolarProduction(solarData);
      res.status(201).json(newData);
    } catch (error) {
      res.status(400).json({ message: "Invalid solar production data", error });
    }
  });
  
  // Update solar production by ID
  app.patch(`${apiPrefix}/solar/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { output } = req.body;
      
      if (output === undefined) {
        return res.status(400).json({ message: "Output value is required" });
      }
      
      const existingData = await storage.getSolarProduction(null, null, id);
      
      if (!existingData) {
        return res.status(404).json({ message: "Solar production data not found" });
      }
      
      const updatedData = await storage.updateSolarProduction(id, { output });
      
      // After updating solar production, generate new optimization suggestions
      await generateOptimizationSuggestionsForCurrentState();
      await calculateEconomicImpactForCurrentState();
      
      return res.json(updatedData);
    } catch (error) {
      res.status(500).json({ message: "Failed to update solar production data", error });
    }
  });

  /**
   * CONSUMPTION API
   */
  // Get current consumption
  app.get(`${apiPrefix}/consumption/current`, async (req, res) => {
    try {
      // Use fixed day/hour values
      const currentDay = 1;
      const currentHour = 8;
      
      const consumption = await storage.getConsumption(currentDay, currentHour);
      
      if (!consumption) {
        return res.json({ demand: 0 });
      }
      
      res.json(consumption);
    } catch (error) {
      res.status(500).json({ message: "Failed to get current consumption" });
    }
  });

  // Get daily consumption
  app.get(`${apiPrefix}/consumption/day/:day?`, async (req, res) => {
    try {
      let day = req.params.day ? parseInt(req.params.day) : 1; // Default to day 1
      
      const dailyConsumption = await storage.getDailyConsumption(day);
      res.json(dailyConsumption);
    } catch (error) {
      res.status(500).json({ message: "Failed to get daily consumption" });
    }
  });

  // Get weekly consumption
  app.get(`${apiPrefix}/consumption/week`, async (req, res) => {
    try {
      const weeklyConsumption = await storage.getWeeklyConsumption();
      res.json(weeklyConsumption);
    } catch (error) {
      res.status(500).json({ message: "Failed to get weekly consumption" });
    }
  });

  // Create or update consumption
  app.post(`${apiPrefix}/consumption`, async (req, res) => {
    try {
      const consumptionData = insertEnergyConsumptionSchema.parse(req.body);
      const existingData = await storage.getConsumption(consumptionData.day, consumptionData.hour);
      
      if (existingData) {
        const updatedData = await storage.updateConsumption(existingData.id, consumptionData);
        return res.json(updatedData);
      }
      
      const newData = await storage.createConsumption(consumptionData);
      res.status(201).json(newData);
    } catch (error) {
      res.status(400).json({ message: "Invalid consumption data", error });
    }
  });
  
  // Update consumption by ID
  app.patch(`${apiPrefix}/consumption/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { demand } = req.body;
      
      if (demand === undefined) {
        return res.status(400).json({ message: "Demand value is required" });
      }
      
      const existingData = await storage.getConsumption(null, null, id);
      
      if (!existingData) {
        return res.status(404).json({ message: "Consumption data not found" });
      }
      
      const updatedData = await storage.updateConsumption(id, { demand });
      
      // After updating consumption, generate new optimization suggestions
      await generateOptimizationSuggestionsForCurrentState();
      await calculateEconomicImpactForCurrentState();
      
      return res.json(updatedData);
    } catch (error) {
      res.status(500).json({ message: "Failed to update consumption data", error });
    }
  });

  /**
   * REAL-TIME DATA REFRESH API
   */
  // Refresh optimization data
  app.post(`${apiPrefix}/refresh`, async (req, res) => {
    try {
      // Generate optimization suggestions and economic impact
      await generateOptimizationSuggestionsForCurrentState();
      await calculateEconomicImpactForCurrentState();
      
      res.json({ 
        success: true, 
        message: "Data refreshed successfully",
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to refresh data" });
    }
  });

  /**
   * OPTIMIZATION API
   */
  // Get optimization suggestions
  app.get(`${apiPrefix}/optimization/suggestions`, async (req, res) => {
    try {
      const suggestions = await storage.getOptimizationSuggestions();
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get optimization suggestions" });
    }
  });

  // Apply optimization suggestion
  app.post(`${apiPrefix}/optimization/suggestions/:id/apply`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const suggestion = await storage.getOptimizationSuggestion(id);
      
      if (!suggestion) {
        return res.status(404).json({ message: "Suggestion not found" });
      }
      
      // Mark suggestion as applied
      await storage.updateOptimizationSuggestion(id, { applied: true });
      
      // Apply the suggestion based on suggestedAction
      if (suggestion.engineId) {
        const engine = await storage.getEngine(suggestion.engineId);
        
        if (engine) {
          if (suggestion.suggestedAction === "shutDown") {
            await storage.updateEngine(engine.id, { isRunning: false, currentOutput: 0 });
          } else if (suggestion.suggestedAction === "startEngine") {
            await storage.updateEngine(engine.id, { isRunning: true, currentOutput: engine.optimalThreshold });
          } else if (suggestion.suggestedAction === "optimizeOrShutdown") {
            // If we can optimize, set to optimal threshold, otherwise shut down
            if (engine.optimalThreshold <= engine.maxCapacity) {
              await storage.updateEngine(engine.id, { currentOutput: engine.optimalThreshold });
            } else {
              await storage.updateEngine(engine.id, { isRunning: false, currentOutput: 0 });
            }
          }
        }
      }
      
      res.json({ success: true, message: "Suggestion applied" });
    } catch (error) {
      res.status(500).json({ message: "Failed to apply optimization suggestion" });
    }
  });

  // Generate new optimization suggestions
  app.post(`${apiPrefix}/optimization/generate`, async (req, res) => {
    try {
      await generateOptimizationSuggestionsForCurrentState();
      const suggestions = await storage.getOptimizationSuggestions();
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate optimization suggestions" });
    }
  });

  // Get economic impact
  app.get(`${apiPrefix}/optimization/impact`, async (req, res) => {
    try {
      const impact = await storage.getEconomicImpact();
      if (!impact) {
        await calculateEconomicImpactForCurrentState();
        const newImpact = await storage.getEconomicImpact();
        return res.json(newImpact || { fuelSaved: 0, costReduction: 0, carbonOffset: 0 });
      }
      res.json(impact);
    } catch (error) {
      res.status(500).json({ message: "Failed to get economic impact" });
    }
  });
  
  /**
   * INSTRUCTIONS API
   */
  // Get optimization instructions for current and future hours
  app.get(`${apiPrefix}/instructions`, async (req, res) => {
    try {
      // Get the current day and hour - fixed values for real-time usage
      const currentDay = 1;
      const currentHour = 8;
      
      // Get engines
      const engines = await storage.getAllEngines();
      
      // Get current solar production and demand
      const currentSolar = await storage.getSolarProduction(currentDay, currentHour);
      const currentDemand = await storage.getConsumption(currentDay, currentHour);
      
      // Get energy storage status
      const energyStorage = await storage.getEnergyStorage();
      const batteryLevel = energyStorage 
        ? (energyStorage.currentCharge / energyStorage.maxCapacity) * 100
        : 50;
      
      // Get future solar and demand data (next 6 hours)
      const forecastSolar = [];
      const forecastDemand = [];
      
      // Collect forecast data for the next 6 hours
      for (let i = 1; i <= 6; i++) {
        const forecastHour = (currentHour + i) % 24;
        const forecastDay = currentDay + Math.floor((currentHour + i) / 24);
        
        // Get solar forecast
        const solarForecast = await storage.getSolarProduction(forecastDay, forecastHour);
        forecastSolar.push(solarForecast?.output || 0);
        
        // Get demand forecast
        const demandForecast = await storage.getConsumption(forecastDay, forecastHour);
        forecastDemand.push(demandForecast?.demand || 0);
      }
      
      // Generate instructions using the utility function
      const { generateInstructions } = await import("../client/src/lib/optimization");
      const instructions = generateInstructions(
        engines,
        currentSolar?.output || 0,
        currentDemand?.demand || 0,
        forecastSolar,
        forecastDemand,
        currentDay,
        currentHour,
        batteryLevel
      );
      
      res.json(instructions);
    } catch (error) {
      console.error("Failed to generate instructions:", error);
      res.status(500).json({ message: "Failed to generate instructions" });
    }
  });

  // Helper function to generate optimization suggestions based on current state
  async function generateOptimizationSuggestionsForCurrentState() {
    try {
      // Use fixed day/hour values
      const currentDay = 1;
      const currentHour = 8;
      
      const engines = await storage.getAllEngines();
      const solarProduction = await storage.getSolarProduction(currentDay, currentHour);
      const consumption = await storage.getConsumption(currentDay, currentHour);
      
      // Generate suggestions
      const suggestions = generateOptimizationSuggestions(
        engines,
        solarProduction?.output || 0,
        consumption?.demand || 0
      );
      
      // Clear existing suggestions
      await storage.clearOptimizationSuggestions();
      
      // Create new suggestions
      for (const suggestion of suggestions) {
        const suggestionData = {
          day: currentDay,
          hour: currentHour,
          suggestion: suggestion.suggestion,
          details: suggestion.details,
          engineId: suggestion.engineId,
          suggestedAction: suggestion.suggestedAction,
          potentialSavings: suggestion.potentialSavings,
        };
        
        await storage.createOptimizationSuggestion(suggestionData);
      }
    } catch (error) {
      console.error("Failed to generate optimization suggestions:", error);
    }
  }

  // Helper function to calculate economic impact based on current state
  async function calculateEconomicImpactForCurrentState() {
    try {
      // Use fixed day value
      const currentDay = 1;
      
      const engines = await storage.getAllEngines();
      const dailySolar = await storage.getDailySolarProduction(currentDay);
      
      // Calculate average engine efficiency
      const avgEngineEfficiency = engines.length
        ? engines.reduce((sum, engine) => sum + engine.efficiency, 0) / engines.length
        : 4.0;
      
      // Calculate total solar production for the day
      const totalSolarProduction = dailySolar.reduce((sum, data) => sum + data.output, 0);
      
      // Calculate economic impact
      const impact = calculateEconomicImpact(totalSolarProduction, avgEngineEfficiency);
      
      // Get existing impact record or create new one
      const existingImpact = await storage.getEconomicImpactByDay(currentDay);
      
      if (existingImpact) {
        await storage.updateEconomicImpact(existingImpact.id, impact);
      } else {
        await storage.createEconomicImpact({
          ...impact,
          day: currentDay,
        });
      }
    } catch (error) {
      console.error("Failed to calculate economic impact:", error);
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
