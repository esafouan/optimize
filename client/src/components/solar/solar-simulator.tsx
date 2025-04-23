import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useSolar } from "@/hooks/use-solar";
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
} from "recharts";
import { SunIcon, CloudRainIcon, CloudIcon, CloudSunIcon } from "lucide-react";
import { generateHourLabels } from "@/lib/utils";

export default function SolarSimulator() {
  const { 
    currentSolarProduction, 
    dailySolarData, 
    weeklySolarData,
    generateRandomSolarProduction,
    generateDayProduction,
    generateWeekProduction,
    isPending,
  } = useSolar();
  
  const { simulationState } = useSimulation();
  const [view, setView] = useState<"day" | "week">("day");

  // Format data for charts
  const dayChartData = dailySolarData?.map(data => ({
    name: `${data.hour}:00`,
    solar: data.output,
  })) || [];

  const weekChartData = weeklySolarData?.reduce((acc, data) => {
    const dayIndex = data.day - 1;
    if (!acc[dayIndex]) {
      acc[dayIndex] = {
        name: `Day ${data.day}`,
        total: 0,
        morning: 0,
        midday: 0,
        evening: 0,
      };
    }
    
    acc[dayIndex].total += data.output;
    
    // Categorize by time of day
    if (data.hour >= 6 && data.hour < 12) {
      acc[dayIndex].morning += data.output;
    } else if (data.hour >= 12 && data.hour < 18) {
      acc[dayIndex].midday += data.output;
    } else if (data.hour >= 18 && data.hour < 22) {
      acc[dayIndex].evening += data.output;
    }
    
    return acc;
  }, [] as any[]) || [];

  // Calculate daily totals
  const dailyTotal = dailySolarData?.reduce((sum, data) => sum + data.output, 0) || 0;
  const weeklyTotal = weeklySolarData?.reduce((sum, data) => sum + data.output, 0) || 0;

  // Get weather icon based on solar production
  const getWeatherIcon = () => {
    if (!currentSolarProduction) return <CloudRainIcon className="h-8 w-8 text-neutral" />;
    
    const hour = simulationState?.currentHour || 12;
    const expectedMax = 200; // Maximum expected at noon
    
    // Night time
    if (hour < 6 || hour > 20) {
      return <CloudIcon className="h-8 w-8 text-neutral" />;
    }
    
    const percentOfExpected = currentSolarProduction / expectedMax;
    
    if (percentOfExpected > 0.7) {
      return <SunIcon className="h-8 w-8 text-yellow-500" />;
    } else if (percentOfExpected > 0.3) {
      return <CloudSunIcon className="h-8 w-8 text-neutral" />;
    } else {
      return <CloudIcon className="h-8 w-8 text-neutral" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Solar Production Simulator</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Solar Production</CardTitle>
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
                      dataKey="solar"
                      stroke="#36B37E"
                      fill="rgba(54, 179, 126, 0.2)"
                    />
                  </AreaChart>
                ) : (
                  <LineChart data={weekChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} kWh`]} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#0052CC"
                      activeDot={{ r: 8 }}
                    />
                    <Line type="monotone" dataKey="morning" stroke="#36B37E" />
                    <Line type="monotone" dataKey="midday" stroke="#FFAB00" />
                    <Line type="monotone" dataKey="evening" stroke="#FF5630" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Current Production</span>
              {getWeatherIcon()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-4">
              <div className="text-4xl font-bold text-primary">
                {currentSolarProduction} kWh
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
                  <p className="text-sm text-neutral-light">Week Total</p>
                  <p className="font-medium">{weeklyTotal.toFixed(0)} kWh</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              className="w-full" 
              onClick={generateRandomSolarProduction}
              disabled={isPending}
            >
              Generate Current Hour
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={generateDayProduction}
              disabled={isPending}
            >
              Generate Full Day
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={generateWeekProduction}
              disabled={isPending}
            >
              Generate Week Data
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
