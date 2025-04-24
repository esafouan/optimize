import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useEngines } from "@/hooks/use-engines";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, List, BarChart as BarChartIcon, Zap, Edit, Power, Trash2, Gauge } from "lucide-react";
import { useLocation } from "wouter";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Engine } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import EngineForm from "@/components/engines/engine-form";

export default function Engines() {
  const { engines, runningEngines, totalEngineProduction } = useEngines();
  const [, setLocation] = useLocation();
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const chartData = runningEngines?.map(engine => ({
    name: engine.name,
    output: engine.currentOutput,
  })) || [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Engine Management</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <List className="h-4 w-4 mr-2" />
          Add Engine
        </Button>
      </div>

      {!showDetailedView ? (
        <>
          {/* Overview Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Engines Card */}
            <Card>
              <CardHeader>
                <CardTitle>Total Engines</CardTitle>
                <CardDescription>All registered engines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{engines?.length || 0}</div>
              </CardContent>
            </Card>

            {/* Running Engines Card */}
            <Card>
              <CardHeader>
                <CardTitle>Running Engines</CardTitle>
                <CardDescription>Currently active engines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{runningEngines?.length || 0}</div>
              </CardContent>
            </Card>

            {/* Total Production Card */}
            <Card>
              <CardHeader>
                <CardTitle>Total Production</CardTitle>
                <CardDescription>Current power output</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalEngineProduction} kW</div>
              </CardContent>
            </Card>
          </div>

          {/* Running Engines Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Running Engines Production</CardTitle>
              <CardDescription>Current output by engine (kWh)</CardDescription>
            </CardHeader>
            <CardContent>
              {runningEngines && runningEngines.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="output" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-60">
                  <p className="text-muted-foreground mb-4">No engines currently running</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* View Detailed Engines Button */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <List className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-lg">Detailed Engine Management</h3>
                <p className="text-sm text-center text-muted-foreground">
                  View and manage all engines with detailed information and controls
                </p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setShowDetailedView(true)}
                >
                  View Engine Details
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Back to Overview Button */}
          <Button 
            variant="outline" 
            className="mb-4"
            onClick={() => setShowDetailedView(false)}
          >
            ← Back to Overview
          </Button>

          {/* Engine Cards */}
          <div className="space-y-6">
            {/* Running Engines Section */}
            <Card>
              <CardHeader>
                <CardTitle>Running Engines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {runningEngines?.map((engine) => (
                    <EngineCard 
                      key={engine.id}
                      engine={engine}
                    />
                  ))}
                  {runningEngines?.length === 0 && (
                    <Card className="col-span-full">
                      <CardContent className="flex flex-col items-center justify-center h-40">
                        <p className="text-muted-foreground mb-4">No engines currently running</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* All Engines Section */}
            <Card>
              <CardHeader>
                <CardTitle>All Engines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {engines?.map((engine) => (
                    <EngineCard 
                      key={engine.id}
                      engine={engine}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Add Engine Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Engine</DialogTitle>
          </DialogHeader>
          <EngineForm onClose={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Engine Card Component
function EngineCard({ engine }: { engine: Engine }) {
  const { toggleEngineState, updateEngineOutput, deleteEngine } = useEngines();
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleEngineState.mutateAsync({ id: engine.id, isRunning: !engine.isRunning });
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this engine?")) {
      await deleteEngine.mutateAsync(engine.id);
    }
  };

  return (
    <>
      <Card 
        className={`cursor-pointer hover:shadow-md transition-shadow ${
          engine.isRunning ? "border-green-200" : ""
        }`}
        onClick={() => setIsDetailsDialogOpen(true)}
      >
        <CardContent className="p-4">
          <div className="flex flex-col items-center space-y-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              engine.isRunning ? "bg-green-100" : "bg-gray-100"
            }`}>
              <Zap className={`h-6 w-6 ${
                engine.isRunning ? "text-green-600" : "text-gray-400"
              }`} />
            </div>
            <h3 className="font-medium text-center">{engine.name}</h3>
            <Badge 
              variant="outline"
              className={engine.isRunning ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
            >
              {engine.isRunning ? "Running" : "Standby"}
            </Badge>
            {engine.isRunning && (
              <p className="text-sm text-center">{engine.currentOutput} kWh</p>
            )}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
             
              <Button 
                size="sm" 
                variant="outline" 
                className="text-red-500"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engine Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{engine.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-neutral-light" />
                <div>
                  <p className="text-sm text-neutral-light">Max Capacity</p>
                  <p className="font-medium">{engine.maxCapacity} kWh/h</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-neutral-light" />
                <div>
                  <p className="text-sm text-neutral-light">Efficiency</p>
                  <p className="font-medium">{engine.efficiency.toFixed(1)} kWh/L</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-neutral-light" />
                <div>
                  <p className="text-sm text-neutral-light">Optimal Threshold</p>
                  <p className="font-medium">{engine.optimalThreshold} kWh</p>
                </div>
              </div>
            </div>

            {engine.isRunning && (
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">Current Output</p>
                  <p className="text-sm font-medium">{engine.currentOutput} kWh</p>
                </div>
                <Slider
                  value={[engine.currentOutput]}
                  min={0}
                  max={engine.maxCapacity}
                  step={5}
                  onValueChange={(value) => updateEngineOutput.mutateAsync({ id: engine.id, output: value[0] })}
                />
                <div className="flex justify-between text-xs text-neutral-light">
                  <span>0 kWh</span>
                  <span>{engine.maxCapacity} kWh</span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Engine Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Engine</DialogTitle>
          </DialogHeader>
          <EngineForm 
            engine={engine} 
            onClose={() => setIsEditDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}