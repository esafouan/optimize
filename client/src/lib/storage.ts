import { Engine, SolarProduction, EnergyConsumption, EnergyStorage, OptimizationSuggestion } from './types';
import { mockEngines, mockStorage, generateSolarData, generateConsumptionData, generateSuggestions } from './mockData';

const STORAGE_KEYS = {
  ENGINES: 'optimize_engines',
  SOLAR: 'optimize_solar',
  CONSUMPTION: 'optimize_consumption',
  STORAGE: 'optimize_storage',
  SUGGESTIONS: 'optimize_suggestions'
};

// Initialize storage with mock data
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.ENGINES)) {
    localStorage.setItem(STORAGE_KEYS.ENGINES, JSON.stringify(mockEngines));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STORAGE)) {
    localStorage.setItem(STORAGE_KEYS.STORAGE, JSON.stringify(mockStorage));
  }
};

// Engine operations
export const getEngines = (): Engine[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ENGINES);
  return data ? JSON.parse(data) : [];
};

export const getEngine = (id: number): Engine | undefined => {
  const engines = getEngines();
  return engines.find(e => e.id === id);
};

export const updateEngine = (id: number, updates: Partial<Engine>): Engine | undefined => {
  const engines = getEngines();
  const index = engines.findIndex(e => e.id === id);
  if (index === -1) return undefined;
  
  engines[index] = { ...engines[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.ENGINES, JSON.stringify(engines));
  
  return engines[index];
};

export const addEngine = (engine: Omit<Engine, 'id'>): Engine => {
  const engines = getEngines();
  const newEngine = {
    ...engine,
    id: engines.length > 0 ? Math.max(...engines.map(e => e.id)) + 1 : 1
  };
  
  engines.push(newEngine);
  localStorage.setItem(STORAGE_KEYS.ENGINES, JSON.stringify(engines));
  
  return newEngine;
};

export const deleteEngine = (id: number): boolean => {
  const engines = getEngines();
  const filtered = engines.filter(e => e.id !== id);
  if (filtered.length === engines.length) return false;
  
  localStorage.setItem(STORAGE_KEYS.ENGINES, JSON.stringify(filtered));
  return true;
};

// Solar production operations
export const getSolarData = (day: number): SolarProduction[] => {
  const key = `${STORAGE_KEYS.SOLAR}_${day}`;
  const data = localStorage.getItem(key);
  
  if (!data) {
    const newData = generateSolarData(day);
    localStorage.setItem(key, JSON.stringify(newData));
    return newData;
  }
  
  return JSON.parse(data);
};

// Consumption operations
export const getConsumptionData = (day: number): EnergyConsumption[] => {
  const key = `${STORAGE_KEYS.CONSUMPTION}_${day}`;
  const data = localStorage.getItem(key);
  
  if (!data) {
    const newData = generateConsumptionData(day);
    localStorage.setItem(key, JSON.stringify(newData));
    return newData;
  }
  
  return JSON.parse(data);
};

// Storage operations
export const getEnergyStorage = (): EnergyStorage => {
  const data = localStorage.getItem(STORAGE_KEYS.STORAGE);
  return data ? JSON.parse(data) : mockStorage;
};

export const updateEnergyStorage = (updates: Partial<EnergyStorage>): EnergyStorage => {
  const storage = getEnergyStorage();
  const updated = { ...storage, ...updates };
  localStorage.setItem(STORAGE_KEYS.STORAGE, JSON.stringify(updated));
  return updated;
};

// Optimization suggestions
export const getSuggestions = (): OptimizationSuggestion[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SUGGESTIONS);
  if (!data) {
    const suggestions = generateSuggestions();
    localStorage.setItem(STORAGE_KEYS.SUGGESTIONS, JSON.stringify(suggestions));
    return suggestions;
  }
  return JSON.parse(data);
};