import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Factory, SunIcon, RefreshCw } from "lucide-react";
import { useConsumption } from "@/hooks/use-consumption";
import { useSolar } from "@/hooks/use-solar";
import { useQuery } from "@tanstack/react-query";
import { EnergyConsumption, SolarProduction } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

export default function ConsumptionController() {
  const { updateConsumption } = useConsumption();
  const { updateSolarProduction } = useSolar();
  
  // Get current consumption and solar data
  const { data: currentConsumption } = useQuery<EnergyConsumption>({
    queryKey: ["/api/consumption/current"],
  });
  
  const { data: currentSolar } = useQuery<SolarProduction>({
    queryKey: ["/api/solar/current"],
  });
  
  // Local state for demand and solar
  const [demand, setDemand] = useState<number>(currentConsumption?.demand || 500);
  const [solarOutput, setSolarOutput] = useState<number>(currentSolar?.output || 200);
  
  const handleUpdateDemand = async () => {
    if (!currentConsumption) return;
    
    updateConsumption.mutate({
      id: currentConsumption.id,
      demand
    });
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["/api/consumption/current"] });
    queryClient.invalidateQueries({ queryKey: ["/api/instructions"] });
  };
  
  const handleUpdateSolar = () => {
    if (!currentSolar) return;
    
    updateSolarProduction.mutate({
      id: currentSolar.id,
      output: solarOutput
    });
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["/api/solar/current"] });
    queryClient.invalidateQueries({ queryKey: ["/api/instructions"] });
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <Factory className="mr-2 h-5 w-5" />
            Energy Demand
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Current Demand</span>
              <span className="text-sm font-medium">{demand} kWh</span>
            </div>
            <Slider
              value={[demand]}
              min={100}
              max={1000}
              step={10}
              onValueChange={(values) => setDemand(values[0])}
            />
            <div className="flex justify-between text-xs text-neutral-light">
              <span>100 kWh</span>
              <span>1000 kWh</span>
            </div>
          </div>
          <Button 
            onClick={handleUpdateDemand} 
            className="w-full"
            disabled={demand === currentConsumption?.demand}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Update Demand
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <SunIcon className="mr-2 h-5 w-5" />
            Solar Production
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Current Output</span>
              <span className="text-sm font-medium">{solarOutput} kWh</span>
            </div>
            <Slider
              value={[solarOutput]}
              min={0}
              max={500}
              step={10}
              onValueChange={(values) => setSolarOutput(values[0])}
            />
            <div className="flex justify-between text-xs text-neutral-light">
              <span>0 kWh</span>
              <span>500 kWh</span>
            </div>
          </div>
          <Button 
            onClick={handleUpdateSolar} 
            className="w-full"
            disabled={solarOutput === currentSolar?.output}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Update Solar Output
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}