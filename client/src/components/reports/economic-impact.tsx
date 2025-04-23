import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOptimization } from "@/hooks/use-optimization";
import { useEngines } from "@/hooks/use-engines";
import { useSolar } from "@/hooks/use-solar";
import { useSimulation } from "@/hooks/use-simulation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { calculateEconomicImpact } from "@/lib/optimization";
import { calculateFuelSaved, calculateCarbonOffset } from "@/lib/utils";

export default function EconomicImpact() {
  const { economicImpact } = useOptimization();
  const { engines } = useEngines();
  const { dailySolarData, weeklySolarData } = useSolar();
  const { simulationState } = useSimulation();
  const [timeRange, setTimeRange] = useState<"day" | "week">("week");

  // Calculate average engine efficiency
  const avgEngineEfficiency = engines?.length
    ? engines.reduce((sum, engine) => sum + engine.efficiency, 0) / engines.length
    : 4.0; // Default value if no engines

  // Calculate economic impact if not available from API
  const calculatedImpact = economicImpact || {
    fuelSaved: 0,
    costReduction: 0,
    carbonOffset: 0,
  };

  // Format data for fuel savings chart
  const fuelSavingsData = [...Array(7)].map((_, i) => {
    const dayData = weeklySolarData?.filter(data => data.day === i + 1) || [];
    const daySolarProduction = dayData.reduce((sum, data) => sum + data.output, 0);
    const impact = calculateEconomicImpact(daySolarProduction, avgEngineEfficiency);
    
    return {
      name: `Day ${i + 1}`,
      fuelSaved: impact.fuelSaved,
      costReduction: impact.costReduction,
      carbonOffset: impact.carbonOffset,
    };
  });

  // Format data for daily comparison (solar vs engine)
  const energySourceData = dailySolarData?.map(data => {
    const hour = data.hour;
    const solar = data.output;
    
    // Simplified calculation - assume engines make up the difference
    const engineProduction = 300; // Mock value for visualization
    
    return {
      name: `${hour}:00`,
      solar,
      engines: engineProduction,
    };
  }) || [];

  // Format data for carbon offset pie chart
  const carbonData = [
    {
      name: "Carbon Offset (Solar)",
      value: calculatedImpact.carbonOffset,
      color: "#36B37E",
    },
    {
      name: "Carbon Emissions (Engines)",
      value: calculatedImpact.carbonOffset * 2, // For visualization purposes
      color: "#FF5630",
    },
  ];

  // Calculate total savings
  const totalFuelSaved = fuelSavingsData.reduce((sum, day) => sum + day.fuelSaved, 0);
  const totalCostReduction = fuelSavingsData.reduce((sum, day) => sum + day.costReduction, 0);
  const totalCarbonOffset = fuelSavingsData.reduce((sum, day) => sum + day.carbonOffset, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Environmental & Economic Impact</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Fuel Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="text-4xl font-bold text-green-600">{totalFuelSaved.toFixed(0)} L</div>
              <div className="text-sm text-neutral-light mt-2">Total fuel saved</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Cost Reduction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="text-4xl font-bold text-primary">€{totalCostReduction.toFixed(2)}</div>
              <div className="text-sm text-neutral-light mt-2">Total cost reduction</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Carbon Offset</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="text-4xl font-bold text-accent">{totalCarbonOffset.toFixed(0)} kg</div>
              <div className="text-sm text-neutral-light mt-2">Total CO2 emissions prevented</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fuel Savings by Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fuelSavingsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#0052CC" />
                  <YAxis yAxisId="right" orientation="right" stroke="#36B37E" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="costReduction" name="Cost Saved (€)" fill="#0052CC" />
                  <Bar yAxisId="right" dataKey="fuelSaved" name="Fuel Saved (L)" fill="#36B37E" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Carbon Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={carbonData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {carbonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value.toFixed(1)} kg CO2`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Optimization Impact Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p>
              By optimizing the energy production mix between solar and engine generators, 
              the station has achieved significant economic and environmental benefits:
            </p>
            
            <ul>
              <li>
                <strong>Fuel Efficiency:</strong> Saved approximately {totalFuelSaved.toFixed(0)} liters of fuel
                by prioritizing solar energy and running engines at optimal thresholds.
              </li>
              <li>
                <strong>Cost Reduction:</strong> Reduced operational costs by €{totalCostReduction.toFixed(2)},
                primarily through fuel savings and efficient engine management.
              </li>
              <li>
                <strong>Environmental Impact:</strong> Prevented approximately {totalCarbonOffset.toFixed(0)} kg
                of CO2 emissions through the use of renewable solar energy.
              </li>
              <li>
                <strong>Optimization Rate:</strong> Engines running within optimal threshold parameters
                {engines?.filter(e => e.isRunning && e.currentOutput >= e.optimalThreshold).length} out of
                {engines?.filter(e => e.isRunning).length} running engines.
              </li>
            </ul>
            
            <p>
              Projected annual savings at current optimization levels: approximately
              €{(totalCostReduction * 52 / 7).toFixed(2)} and {(totalCarbonOffset * 52 / 7).toFixed(0)} kg CO2.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
