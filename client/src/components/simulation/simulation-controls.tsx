import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useSimulation } from "@/hooks/use-simulation";
import { useEngines } from "@/hooks/use-engines";
import { useSolar } from "@/hooks/use-solar";
import { useConsumption } from "@/hooks/use-consumption";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  PlayCircle,
  PauseCircle,
  StepForward,
  CalendarDays,
  RefreshCcw,
  Info,
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function SimulationControls() {
  const {
    simulationState,
    advanceOneHour,
    advanceOneDay,
    resetSimulation,
    isAutoAdvancing,
    toggleAutoAdvance,
    isPending: simulationPending
  } = useSimulation();

  const { engines, totalEngineProduction } = useEngines();
  const { currentSolarProduction } = useSolar();
  const { currentConsumptionDemand } = useConsumption();

  // Calculate energy balance
  const totalProduction = totalEngineProduction + currentSolarProduction;
  const energyBalance = totalProduction - currentConsumptionDemand;
  const productionRatio = currentConsumptionDemand > 0 
    ? totalProduction / currentConsumptionDemand 
    : 0;

  // Calculate fuel consumption and cost
  const fuelConsumption = engines
    ?.filter(engine => engine.isRunning)
    .reduce((total, engine) => {
      return total + (engine.currentOutput / engine.efficiency);
    }, 0) || 0;

  const fuelCost = fuelConsumption * 1.5; // Assuming €1.5 per liter

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Simulation Controls</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Time Controls</span>
              <div className="bg-bg-light rounded-md p-1 text-sm">
                <span className="text-neutral-light mr-1">Current:</span>
                <span className="font-medium text-neutral">
                  Day {simulationState?.currentDay || "..."} / Hour {simulationState?.currentHour || "..."}:00
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={isAutoAdvancing}
                    onCheckedChange={toggleAutoAdvance}
                    id="auto-mode"
                  />
                  <Label htmlFor="auto-mode">Auto Advance Mode</Label>
                </div>
                <div className="text-sm text-neutral-light">
                  {isAutoAdvancing ? "Running" : "Paused"}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  className="flex-1"
                  variant={isAutoAdvancing ? "outline" : "default"}
                  onClick={toggleAutoAdvance}
                  disabled={simulationPending}
                >
                  {isAutoAdvancing ? (
                    <>
                      <PauseCircle className="mr-2 h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Start
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={advanceOneHour}
                  disabled={isAutoAdvancing || simulationPending}
                >
                  <StepForward className="mr-2 h-4 w-4" />
                  Next Hour
                </Button>
                <Button
                  variant="outline"
                  onClick={advanceOneDay}
                  disabled={isAutoAdvancing || simulationPending}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Next Day
                </Button>
              </div>

              <Button
                variant="destructive"
                onClick={resetSimulation}
                disabled={simulationPending}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Reset Simulation
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Energy Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Total Production</TableCell>
                  <TableCell className="text-right">{totalProduction} kWh</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Current Demand</TableCell>
                  <TableCell className="text-right">{currentConsumptionDemand} kWh</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Energy Balance</TableCell>
                  <TableCell 
                    className={`text-right font-medium ${
                      energyBalance >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {energyBalance >= 0 ? "+" : ""}{energyBalance} kWh
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      Supply/Demand Ratio
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-1 text-neutral-light" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ratio of total production to demand (ideally 1.0-1.1)</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell 
                    className={`text-right font-medium ${
                      productionRatio > 0.95 && productionRatio < 1.2 
                        ? "text-green-600" 
                        : productionRatio < 0.95 
                          ? "text-red-600"
                          : "text-amber-600"
                    }`}
                  >
                    {productionRatio.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Hourly Fuel Consumption</TableCell>
                  <TableCell className="text-right">{fuelConsumption.toFixed(1)} L</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Hourly Fuel Cost</TableCell>
                  <TableCell className="text-right">€{fuelCost.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Engine Output Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          {engines?.filter(e => e.isRunning).length ? (
            <div className="space-y-6">
              {engines
                .filter(engine => engine.isRunning)
                .map(engine => (
                  <div key={engine.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>{engine.name}</Label>
                      <div className="text-sm">
                        <span className="font-medium">{engine.currentOutput} kWh</span>
                        <span className="text-neutral-light ml-1">
                          ({Math.round((engine.currentOutput / engine.maxCapacity) * 100)}%)
                        </span>
                      </div>
                    </div>
                    <Slider
                      disabled
                      value={[engine.currentOutput]}
                      max={engine.maxCapacity}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-neutral-light">
                      <span>0 kWh</span>
                      <span>
                        <span className="text-accent font-medium">{engine.optimalThreshold} kWh</span> (Optimal)
                      </span>
                      <span>{engine.maxCapacity} kWh</span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="py-8 text-center text-neutral-light">
              No engines are currently running.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
