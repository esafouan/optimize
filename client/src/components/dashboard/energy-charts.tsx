import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useEngines } from "@/hooks/use-engines";
import { useSolar } from "@/hooks/use-solar";
import { useConsumption } from "@/hooks/use-consumption";
import { formatEnergy } from "@/lib/utils";

export default function EnergyCharts() {
  const [timeRange, setTimeRange] = useState<"day" | "week">("day");
  const { engines, runningEngines, totalEngineProduction } = useEngines();
  const { dailySolarData, currentSolarProduction } = useSolar();
  const { dailyConsumptionData, currentConsumptionDemand } = useConsumption();

  // Format data for consumption and production chart
  const energyData = dailyConsumptionData?.map((consumption) => {
    const hour = consumption.hour;
    const solarForHour = dailySolarData?.find(s => s.hour === hour)?.output || 0;
    
    // For this demo, we'll assume engines provide the rest of the demand
    const engineForHour = Math.max(0, consumption.demand - solarForHour);
    
    return {
      name: `${hour}:00`,
      Demand: consumption.demand,
      Solar: solarForHour,
      Engines: engineForHour,
    };
  }) || [];

  // Format data for energy source distribution pie chart
  const energyMixData = [
    {
      name: "Solar",
      value: currentSolarProduction,
      color: "#0052CC", // primary
    },
  ];

  // Add running engines to the pie chart data
  runningEngines.forEach((engine, index) => {
    energyMixData.push({
      name: engine.name,
      value: engine.currentOutput,
      color: index === 0 ? "#FFAB00" : "#FF5630", // warning, danger
    });
  });

  // Calculate total energy production for percentage calculation
  const totalEnergyProduction = currentSolarProduction + totalEngineProduction;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Energy Production & Consumption Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-neutral font-medium">
            Energy Production & Consumption
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant={timeRange === "day" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("day")}
              className="text-xs"
            >
              Day
            </Button>
            <Button
              variant={timeRange === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("week")}
              className="text-xs"
            >
              Week
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={energyData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} kWh`]} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="Demand"
                  stroke="#172B4D"
                  fill="rgba(23, 43, 77, 0.1)"
                  stackId="1"
                />
                <Area
                  type="monotone"
                  dataKey="Solar"
                  stroke="#36B37E"
                  fill="rgba(54, 179, 126, 0.1)"
                  stackId="2"
                />
                <Area
                  type="monotone"
                  dataKey="Engines"
                  stroke="#FF5630"
                  fill="rgba(255, 86, 48, 0.1)"
                  stackId="2"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Energy Mix Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-neutral font-medium">
            Energy Source Distribution
          </CardTitle>
          <div className="text-xs text-neutral-light">Current Hour</div>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={energyMixData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {energyMixData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} kWh`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            {energyMixData.map((source, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: source.color }}
                ></div>
                <span className="text-xs text-neutral">
                  {source.name} (
                  {totalEnergyProduction
                    ? `${Math.round((source.value / totalEnergyProduction) * 100)}%`
                    : "0%"}
                  )
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
