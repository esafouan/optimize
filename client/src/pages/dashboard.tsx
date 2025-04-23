import { Zap, Factory, SunIcon, Battery } from "lucide-react";
import StatusCard from "@/components/dashboard/status-card";
import EnergyCharts from "@/components/dashboard/energy-charts";
import EngineManagement from "@/components/dashboard/engine-management";
import OptimizationPanel from "@/components/dashboard/optimization-panel";
import { useEngines } from "@/hooks/use-engines";
import { useSolar } from "@/hooks/use-solar";
import { useConsumption } from "@/hooks/use-consumption";
import { useOptimization } from "@/hooks/use-optimization";

export default function Dashboard() {
  const { totalEngineProduction, runningEngines } = useEngines();
  const { currentSolarProduction } = useSolar();
  const { currentConsumptionDemand } = useConsumption();
  const { isOverproducing } = useOptimization();

  // Calculate solar contribution percentage
  const solarPercentage = currentConsumptionDemand 
    ? Math.round((currentSolarProduction / currentConsumptionDemand) * 100) 
    : 0;

  return (
    <div>
      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Current Demand Card */}
        <StatusCard
          title="Current Demand"
          value={`${currentConsumptionDemand} kWh`}
          change={{
            value: "12%",
            isPositive: false,
          }}
          subtitle="vs. previous hour"
          icon={<Zap className="h-5 w-5 text-neutral" />}
        />

        {/* Solar Production Card */}
        <StatusCard
          title="Solar Production"
          value={`${currentSolarProduction} kWh`}
          change={{
            value: "8%",
            isPositive: true,
          }}
          subtitle={`${solarPercentage}% of current demand`}
          icon={<SunIcon className="h-5 w-5 text-neutral" />}
        />

        {/* Engine Production Card */}
        <StatusCard
          title="Engine Production"
          value={`${totalEngineProduction} kWh`}
          change={{
            value: "5%",
            isPositive: isOverproducing ? false : true,
          }}
          subtitle={`${runningEngines.length} engines running`}
          icon={<Factory className="h-5 w-5 text-neutral" />}
        />

        {/* Battery Storage Card */}
        <StatusCard
          title="Battery Storage"
          value="75%"
          change={{
            value: "Stable",
            isPositive: true,
          }}
          subtitle="450 kWh available"
          icon={<Battery className="h-5 w-5 text-neutral" />}
        />
      </div>

      {/* Charts Section */}
      <EnergyCharts />

      {/* Engine Management & Optimization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <EngineManagement />
        <OptimizationPanel />
      </div>
    </div>
  );
}
