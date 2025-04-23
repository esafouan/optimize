import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useConsumption } from "@/hooks/use-consumption";
import { useSimulation } from "@/hooks/use-simulation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ConsumptionSimulator() {
  const { 
    currentConsumptionDemand, 
    dailyConsumptionData, 
    weeklyConsumptionData,
    generateRandomConsumption,
    generateDayConsumption,
    generateWeekConsumption,
    importConsumptionData,
    isPending,
  } = useConsumption();
  
  const { simulationState } = useSimulation();
  const { toast } = useToast();
  const [view, setView] = useState<"day" | "week">("day");
  const [jsonData, setJsonData] = useState("");

  // Format data for charts
  const dayChartData = dailyConsumptionData?.map(data => ({
    name: `${data.hour}:00`,
    demand: data.demand,
  })) || [];

  const weekChartData = weeklyConsumptionData?.reduce((acc, data) => {
    const dayIndex = data.day - 1;
    if (!acc[dayIndex]) {
      acc[dayIndex] = {
        name: `Day ${data.day}`,
        total: 0,
        peak: 0,
        offPeak: 0,
      };
    }
    
    acc[dayIndex].total += data.demand;
    
    // Categorize by peak/off-peak hours
    if ((data.hour >= 8 && data.hour <= 10) || (data.hour >= 17 && data.hour <= 20)) {
      acc[dayIndex].peak += data.demand;
    } else {
      acc[dayIndex].offPeak += data.demand;
    }
    
    return acc;
  }, [] as any[]) || [];

  // Calculate daily totals
  const dailyTotal = dailyConsumptionData?.reduce((sum, data) => sum + data.demand, 0) || 0;
  const dailyAverage = dailyConsumptionData?.length 
    ? dailyTotal / dailyConsumptionData.length 
    : 0;

  // Handle import JSON data
  const handleImport = async () => {
    try {
      const success = await importConsumptionData(jsonData);
      if (success) {
        toast({
          title: "Import Successful",
          description: "Consumption data has been imported.",
        });
        setJsonData("");
      } else {
        toast({
          title: "Import Failed",
          description: "Invalid data format. Please check your JSON structure.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Import Error",
        description: "Failed to import data. Please check your JSON format.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Consumption Demand Simulator</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Energy Consumption</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant={view === "day" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("day")}
              >
                Day
              </Button>
              <Button
                variant={view === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("week")}
              >
                Week
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                {view === "day" ? (
                  <AreaChart data={dayChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} kWh`]} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="demand"
                      stroke="#172B4D"
                      fill="rgba(23, 43, 77, 0.2)"
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={weekChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} kWh`]} />
                    <Legend />
                    <Bar dataKey="peak" stackId="a" fill="#FF5630" name="Peak Hours" />
                    <Bar dataKey="offPeak" stackId="a" fill="#0052CC" name="Off-Peak Hours" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Current Demand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-4">
              <div className="text-4xl font-bold text-neutral">
                {currentConsumptionDemand} kWh
              </div>
              <div className="text-sm text-neutral-light mt-2">
                {simulationState?.currentHour ? `Hour ${simulationState.currentHour}:00` : ""}
              </div>
            </div>

            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-light">Day Total</p>
                  <p className="font-medium">{dailyTotal.toFixed(0)} kWh</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-light">Hour Average</p>
                  <p className="font-medium">{dailyAverage.toFixed(0)} kWh</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              className="w-full" 
              onClick={generateRandomConsumption}
              disabled={isPending}
            >
              Generate Current Hour
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={generateDayConsumption}
              disabled={isPending}
            >
              Generate Full Day
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={generateWeekConsumption}
              disabled={isPending}
            >
              Generate Week Data
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import Consumption Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="jsonData">Paste JSON Data</Label>
              <Textarea
                id="jsonData"
                placeholder='[{"day": 1, "hour": 12, "demand": 350}, ...]'
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                className="font-mono"
                rows={6}
              />
            </div>
            <Button 
              onClick={handleImport}
              disabled={!jsonData.trim() || isPending}
            >
              Import Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
