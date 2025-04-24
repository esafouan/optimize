import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInstructions } from "@/hooks/use-instructions";
import { ArrowDownCircle, ArrowUpCircle, AlertCircle, Clock, Zap, Droplet, Leaf, DollarSign } from "lucide-react";
import { formatEnergy, formatCurrency } from "@/lib/utils";
import { calculateFuelConsumption, calculateCarbonEmissions, calculateFuelCost } from "@/lib/fuel-calculation";

export default function InstructionPanel() {
  const { 
    currentInstructions, 
    forecastInstructions,
    solarData,
    consumptionData,
    enginesData,
    isLoading 
  } = useInstructions();

  // Calculate engine output
  const engineOutput = enginesData?.reduce((total, engine) => {
    return total + (engine.isRunning ? engine.currentOutput : 0);
  }, 0) || 0;

  // Calculate energy balance
  const totalProduction = (solarData?.output || 0) + engineOutput;
  const energyBalance = totalProduction - (consumptionData?.demand || 0);
  const isDeficit = energyBalance < 0;

  // Calculate fuel consumption and costs
  const fuelConsumption = enginesData ? calculateFuelConsumption(enginesData) : 0;
  const carbonEmissions = calculateCarbonEmissions(fuelConsumption);
  const fuelCost = calculateFuelCost(fuelConsumption);

  // Render priority badge with color
  const renderPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    const colors = {
      high: "bg-red-100 text-red-800 hover:bg-red-100",
      medium: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      low: "bg-green-100 text-green-800 hover:bg-green-100",
    };
    
    return (
      <Badge className={colors[priority]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="col-span-full lg:col-span-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>Energy Optimization Instructions</div>
          {isDeficit ? (
            <Badge variant="destructive" className="ml-2">Energy Deficit</Badge>
          ) : (
            <Badge variant="outline" className="bg-green-100 text-green-800 ml-2">Energy Surplus</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col items-center p-3 bg-primary/10 rounded-md">
            <span className="text-sm text-muted-foreground">Solar</span>
            <span className="text-xl font-bold">{formatEnergy(solarData?.output || 0)}</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-primary/10 rounded-md">
            <span className="text-sm text-muted-foreground">Demand</span>
            <span className="text-xl font-bold">{formatEnergy(consumptionData?.demand || 0)}</span>
          </div>
          <div className={`flex flex-col items-center p-3 rounded-md ${isDeficit ? 'bg-red-100' : 'bg-green-100'}`}>
            <span className="text-sm text-muted-foreground">Balance</span>
            <span className="text-xl font-bold">
              {isDeficit ? '-' : '+'} {formatEnergy(Math.abs(energyBalance))}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4 border-t pt-4">
          <div className="flex flex-col items-center p-3 bg-blue-50 rounded-md">
            <div className="flex items-center gap-1">
              <Droplet className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Fuel Use</span>
            </div>
            <span className="text-lg font-bold">{fuelConsumption.toFixed(1)} L/hr</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-amber-50 rounded-md">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-muted-foreground">Cost</span>
            </div>
            <span className="text-lg font-bold">{formatCurrency(fuelCost)}/hr</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-green-50 rounded-md">
            <div className="flex items-center gap-1">
              <Leaf className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">CO₂</span>
            </div>
            <span className="text-lg font-bold">{carbonEmissions.toFixed(1)} kg/hr</span>
          </div>
        </div>
        
        {currentInstructions.length === 0 ? (
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertTitle>No immediate actions needed</AlertTitle>
            <AlertDescription>
              The system is operating efficiently. No optimization actions are required at this time.
            </AlertDescription>
          </Alert>
        ) : (
          currentInstructions.map((instruction, index) => (
            <Alert 
              key={index} 
              variant={instruction.priority === 'high' ? 'destructive' : 'default'}
              className="relative"
            >
              <div className="absolute right-4 top-4">
                {renderPriorityBadge(instruction.priority)}
              </div>
              <div className="flex gap-3">
                {instruction.action?.includes('start') || instruction.action?.includes('increase') ? (
                  <ArrowUpCircle className="h-5 w-5 text-green-600" />
                ) : instruction.action?.includes('shut') || instruction.action?.includes('decrease') ? (
                  <ArrowDownCircle className="h-5 w-5 text-amber-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                )}
                <div>
                  <AlertTitle>{instruction.title}</AlertTitle>
                  <AlertDescription>{instruction.description}</AlertDescription>
                </div>
              </div>
            </Alert>
          ))
        )}

        {forecastInstructions.length > 0 && (
          <>
            <h3 className="text-lg font-semibold mt-6 pt-3 border-t">Upcoming Actions</h3>
            
            {forecastInstructions.map((instruction, index) => (
              <Alert key={`forecast-${index}`} className="relative border border-blue-100">
                <div className="absolute right-4 top-4">
                  <Badge className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-50">
                    <Clock className="h-3 w-3" />
                    {instruction.hour}:00
                  </Badge>
                </div>
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <AlertTitle>{instruction.title}</AlertTitle>
                    <AlertDescription>{instruction.description}</AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}