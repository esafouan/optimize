import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to format kWh values
export function formatEnergy(value: number): string {
  return `${value.toFixed(0)} kWh`;
}

// Helper function to format percentage values
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

// Helper function to format currency values
export function formatCurrency(value: number): string {
  return `€${value.toFixed(2)}`;
}

// Helper function to generate time labels for charts
export function generateHourLabels(startHour: number, count: number): string[] {
  const labels: string[] = [];
  for (let i = 0; i < count; i++) {
    const hour = (startHour + i) % 24;
    labels.push(`${hour}:00`);
  }
  return labels;
}

// Helper function to generate random solar production data based on hour of day
export function generateSolarProduction(hour: number): number {
  if (hour < 6 || hour > 20) {
    return 0; // No solar production at night
  }
  
  // Peak production around noon
  const peakHour = 12;
  const maxProduction = 200;
  const distanceFromPeak = Math.abs(hour - peakHour);
  const reduction = (distanceFromPeak * distanceFromPeak) / 2;
  
  return Math.max(0, maxProduction - reduction);
}

// Helper function to generate random consumption data with a base load and peak hours
export function generateConsumptionDemand(hour: number): number {
  const baseLoad = 200;
  
  // Morning peak (8-10am)
  if (hour >= 8 && hour <= 10) {
    return baseLoad + 150 + Math.random() * 50;
  }
  
  // Evening peak (17-20pm)
  if (hour >= 17 && hour <= 20) {
    return baseLoad + 200 + Math.random() * 100;
  }
  
  // Regular hours
  return baseLoad + Math.random() * 100;
}

// Generate a random ID for temporary use
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Calculate engine efficiency (output vs capacity percentage)
export function calculateEngineEfficiency(currentOutput: number, maxCapacity: number): number {
  if (maxCapacity === 0) return 0;
  return currentOutput / maxCapacity;
}

// Calculate carbon offset based on solar production
export function calculateCarbonOffset(solarProduction: number): number {
  // Assuming 0.5kg CO2 offset per kWh of solar
  return solarProduction * 0.5;
}

// Calculate fuel saved based on energy not produced by engines
export function calculateFuelSaved(
  solarProduction: number, 
  engineEfficiency: number
): number {
  // Assuming average efficiency if not provided
  const efficiency = engineEfficiency || 4.0; // kWh/liter
  return solarProduction / efficiency;
}
