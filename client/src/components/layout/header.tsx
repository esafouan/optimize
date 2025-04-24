import { Button } from "@/components/ui/button";
import { useSimulation } from "@/hooks/use-simulation";
import { format } from "date-fns";
import { Play, Calendar, Clock } from "lucide-react";

export default function Header() {
  const { 
    simulationState, 
    advanceOneHour, 
    isAutoAdvancing, 
    toggleAutoAdvance,
    isPending
  } = useSimulation();

  // Calculate a date based on simulation day (assuming starting from today)
  const simulationDate = new Date();
  if (simulationState) {
    simulationDate.setDate(simulationDate.getDate() + simulationState.currentDay - 1);
  }
  
  const formattedDate = format(simulationDate, "MMMM d, yyyy");
  const formattedHour = simulationState ? `${simulationState.currentHour}:00` : "--:--";

  return (
    <header className="bg-white border-b border-border-color">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-neutral">Energy Optimization Dashboard</h2>
          {/* <div className="bg-bg-light rounded-md p-1 text-sm">
            <span className="text-neutral-light mr-1">Simulation:</span>
            <span className="font-medium text-neutral">
              Day {simulationState?.currentDay || "..."} / 7
            </span>
          </div> */}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Button variant="outline" size="sm" className="flex items-center bg-bg-light hover:bg-border-color text-neutral">
              <Calendar className="h-4 w-4 mr-1" />
              {formattedDate}
            </Button>
          </div>
          
          <div className="relative">
            <Button variant="outline" size="sm" className="flex items-center bg-bg-light hover:bg-border-color text-neutral">
              <Clock className="h-4 w-4 mr-1" />
              {formattedHour}
            </Button>
          </div>
          
          {/* <Button 
            size="sm"
            className="flex items-center"
            onClick={isAutoAdvancing ? toggleAutoAdvance : advanceOneHour}
            disabled={isPending}
          >
            <Play className="h-4 w-4 mr-1" />
            {isAutoAdvancing ? "Pause Simulation" : "Run Simulation"}
          </Button> */}
        </div>
      </div>
    </header>
  );
}
