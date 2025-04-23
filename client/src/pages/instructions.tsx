import InstructionPanel from "@/components/instructions/instruction-panel";
import ConsumptionController from "@/components/consumption/consumption-controller";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Battery, Cpu, Sun, LucideIcon, Activity } from "lucide-react";
import { SolarProduction, EnergyConsumption, Engine } from "@shared/schema";
import { formatEnergy, formatPercentage } from "@/lib/utils";

interface StatusItemProps {
  title: string;
  value: string;
  icon: LucideIcon;
  className?: string;
}

function StatusItem({ title, value, icon: Icon, className }: StatusItemProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4 flex items-center">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Instructions() {
  // Get current state
  const { data: solar } = useQuery<SolarProduction>({
    queryKey: ["/api/solar/current"],
  });

  const { data: consumption } = useQuery<EnergyConsumption>({
    queryKey: ["/api/consumption/current"],
  });

  const { data: engines } = useQuery<Engine[]>({
    queryKey: ["/api/engines"],
  });

  // Calculate engine output
  const engineOutput = engines?.reduce((total, engine) => {
    return total + (engine.isRunning ? engine.currentOutput : 0);
  }, 0) || 0;

  // Calculate energy balance
  const totalProduction = (solar?.output || 0) + engineOutput;
  const energyBalance = totalProduction - (consumption?.demand || 0);
  const isDeficit = energyBalance < 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Energy Management Instructions</h1>
      <p className="text-muted-foreground">
        Real-time recommendations and forecasts to optimize energy usage
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatusItem 
          title="Solar Production" 
          value={formatEnergy(solar?.output || 0)}
          icon={Sun}
        />
        <StatusItem 
          title="Engine Production" 
          value={formatEnergy(engineOutput)}
          icon={Cpu}
        />
        <StatusItem 
          title="Energy Balance" 
          value={`${isDeficit ? '-' : '+'} ${formatEnergy(Math.abs(energyBalance))}`}
          icon={Activity}
          className={isDeficit ? "border-red-200" : "border-green-200"}
        />
      </div>

      {/* Energy Control Panel */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Energy Control Panel</CardTitle>
          <CardDescription>
            Adjust demand and solar production to see optimization recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConsumptionController />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <InstructionPanel />
        
        <Card className="col-span-full lg:col-span-8">
          <CardHeader>
            <CardTitle>Why This Matters</CardTitle>
            <CardDescription>
              The impact of following optimization recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-primary/10 p-4">
              <h4 className="font-medium mb-2">Energy Efficiency</h4>
              <p className="text-sm text-muted-foreground">
                Following these recommendations helps maximize the use of renewable solar energy and ensures engines run at their optimal efficiency points, reducing fuel consumption and overall operational costs.
              </p>
            </div>
            
            <div className="rounded-md bg-primary/10 p-4">
              <h4 className="font-medium mb-2">Economic Benefits</h4>
              <p className="text-sm text-muted-foreground">
                By optimizing engine operation, you can save up to 15-20% on fuel costs. Running engines below their optimal threshold decreases efficiency, while our suggestions help maintain peak performance.
              </p>
            </div>
            
            <div className="rounded-md bg-primary/10 p-4">
              <h4 className="font-medium mb-2">Proactive Management</h4>
              <p className="text-sm text-muted-foreground">
                The forecast tab provides advanced warning of upcoming energy demand or production changes. This allows for proactive adjustments to engine scheduling, improving overall system resilience.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}