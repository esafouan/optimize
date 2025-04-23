import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertTriangle,
  Clock,
  Lightbulb,
  RefreshCw,
  Settings,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatEnergy } from "@/lib/utils";
import { Engine } from "@shared/schema";

type Instruction = {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  type: "immediate" | "scheduled";
  engineId?: number;
  action?: string;
};

type ForecastInstruction = {
  hour: number;
  day: number;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  engineId?: number;
  action?: string;
};

interface InstructionData {
  currentInstructions: Instruction[];
  forecastInstructions: ForecastInstruction[];
}

export default function InstructionPanel() {
  // Get instructions
  const {
    data: instructions,
    isLoading,
    error,
    refetch,
  } = useQuery<InstructionData>({
    queryKey: ["/api/instructions"],
    refetchInterval: 60000, // Refetch every minute
  });

  // Get engines
  const { data: engines } = useQuery<Engine[]>({
    queryKey: ["/api/engines"],
  });

  const handleApplyInstruction = async (
    instruction: Instruction,
    engineId?: number
  ) => {
    if (!engineId || !instruction.action) return;

    try {
      if (instruction.action === "startEngine") {
        await apiRequest(`/api/engines/${engineId}/toggle`, "PATCH", {
          isRunning: true
        });
      } else if (instruction.action === "shutDownEngine") {
        await apiRequest(`/api/engines/${engineId}/toggle`, "PATCH", {
          isRunning: false
        });
      } else if (instruction.action === "optimizeEngine") {
        const engine = engines?.find((e) => e.id === engineId);
        if (engine) {
          await apiRequest(`/api/engines/${engineId}/output`, "PATCH", {
            currentOutput: engine.optimalThreshold
          });
        }
      }

      // Refetch data after applying instruction
      setTimeout(() => {
        refetch();
      }, 500);
    } catch (error) {
      console.error("Failed to apply instruction:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="destructive" className="mr-2">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Urgent
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="default" className="mr-2 bg-yellow-500">
            <Clock className="h-3 w-3 mr-1" />
            Important
          </Badge>
        );
      case "low":
        return (
          <Badge variant="outline" className="mr-2 border-green-500 text-green-500">
            <Lightbulb className="h-3 w-3 mr-1" />
            Suggestion
          </Badge>
        );
      default:
        return null;
    }
  };

  const getActionIcon = (action?: string) => {
    switch (action) {
      case "startEngine":
        return <Zap className="h-4 w-4 mr-1" />;
      case "shutDownEngine":
        return <Settings className="h-4 w-4 mr-1" />;
      case "optimizeEngine":
        return <RefreshCw className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card className="col-span-full lg:col-span-4">
        <CardHeader>
          <CardTitle>Loading Instructions...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-full lg:col-span-4">
        <CardHeader>
          <CardTitle>Error Loading Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center flex-col">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <p>Failed to load optimization instructions.</p>
            <Button onClick={() => refetch()} className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full lg:col-span-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Optimization Instructions</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            className="h-8"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          Real-time instructions for optimal energy usage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">Current Actions</TabsTrigger>
            <TabsTrigger value="forecast">Future Forecast</TabsTrigger>
          </TabsList>
          <TabsContent value="current">
            {instructions?.currentInstructions.length === 0 ? (
              <div className="h-64 flex items-center justify-center flex-col text-center">
                <Lightbulb className="h-12 w-12 text-yellow-500 mb-4" />
                <p className="text-muted-foreground">
                  No immediate actions needed. The system is running optimally.
                </p>
              </div>
            ) : (
              <div className="space-y-4 mt-2 max-h-[400px] overflow-y-auto pr-2">
                {instructions?.currentInstructions.map((instruction, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div
                      className={`h-1 w-full ${
                        instruction.priority === "high"
                          ? "bg-red-500"
                          : instruction.priority === "medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    />
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          {getPriorityBadge(instruction.priority)}
                        </div>
                        {instruction.engineId && instruction.action && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleApplyInstruction(
                                instruction,
                                instruction.engineId
                              )
                            }
                            className="h-8"
                          >
                            {getActionIcon(instruction.action)}
                            Apply
                          </Button>
                        )}
                      </div>
                      <h4 className="font-medium text-lg mb-1">{instruction.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {instruction.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="forecast">
            {instructions?.forecastInstructions.length === 0 ? (
              <div className="h-64 flex items-center justify-center flex-col text-center">
                <Clock className="h-12 w-12 text-blue-500 mb-4" />
                <p className="text-muted-foreground">
                  No future predictions available at this time.
                </p>
              </div>
            ) : (
              <div className="space-y-4 mt-2 max-h-[400px] overflow-y-auto pr-2">
                {instructions?.forecastInstructions.map((instruction, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div
                      className={`h-1 w-full ${
                        instruction.priority === "high"
                          ? "bg-red-500"
                          : instruction.priority === "medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    />
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          {getPriorityBadge(instruction.priority)}
                          <Badge variant="outline" className="ml-1">
                            Day {instruction.day}, {instruction.hour}:00
                          </Badge>
                        </div>
                      </div>
                      <h4 className="font-medium text-lg mb-1">{instruction.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {instruction.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}