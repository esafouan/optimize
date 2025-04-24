import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useEngines } from "@/hooks/use-engines";
import { Engine } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import EngineForm from "./engine-form";
import { PlusIcon, Edit, Trash2, Power, Zap, Gauge, ArrowRight, List, BarChart as BarChartIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useLocation } from "wouter";

export default function EngineList() {
  const { engines, runningEngines, totalEngineProduction, toggleEngineState, updateEngineOutput, deleteEngine } = useEngines();
  const [, setLocation] = useLocation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<Engine | null>(null);

  const handleEdit = (engine: Engine) => {
    setSelectedEngine(engine);
    setIsEditDialogOpen(true);
  };

  const handleViewDetails = (engine: Engine) => {
    setSelectedEngine(engine);
    setIsDetailsDialogOpen(true);
  };

  const handleToggle = async (id: number, isRunning: boolean) => {
    await toggleEngineState.mutateAsync({ id, isRunning: !isRunning });
  };

  const handleOutputChange = async (id: number, output: number) => {
    await updateEngineOutput.mutateAsync({ id, output });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this engine?")) {
      await deleteEngine.mutateAsync(id);
    }
  };

  const chartData = runningEngines?.map(engine => ({
    name: engine.name,
    output: engine.currentOutput,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Engine Overview</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Engine
        </Button>
      </div>

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
  
      {/* Production Chart */}
      {runningEngines && runningEngines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Engine Production</CardTitle>
            <CardDescription>Current output by engine (kWh)</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* View All Engines Button */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation("/engines")}>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <List className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-lg">Engine Management</h3>
              <p className="text-sm text-center text-muted-foreground">
                View and manage all engines with detailed information and controls
              </p>
              <Button variant="outline" className="mt-2">
                View All Engines
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Engine Performance Card */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation("/reports")}>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <BarChartIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-lg">Engine Performance</h3>
              <p className="text-sm text-center text-muted-foreground">
                View detailed performance metrics and efficiency reports for all engines
              </p>
              <Button variant="outline" className="mt-2">
                View Performance
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Engine Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Engine</DialogTitle>
          </DialogHeader>
          <EngineForm onClose={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Engine Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Engine</DialogTitle>
          </DialogHeader>
          {selectedEngine && (
            <EngineForm 
              engine={selectedEngine} 
              onClose={() => setIsEditDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Engine Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedEngine?.name}</DialogTitle>
          </DialogHeader>
          {selectedEngine && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-neutral-light" />
                  <div>
                    <p className="text-sm text-neutral-light">Max Capacity</p>
                    <p className="font-medium">{selectedEngine.maxCapacity} kWh/h</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-neutral-light" />
                  <div>
                    <p className="text-sm text-neutral-light">Efficiency</p>
                    <p className="font-medium">{selectedEngine.efficiency.toFixed(1)} kWh/L</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5 text-neutral-light" />
                  <div>
                    <p className="text-sm text-neutral-light">Optimal Threshold</p>
                    <p className="font-medium">{selectedEngine.optimalThreshold} kWh</p>
                  </div>
                </div>
              </div>

              {selectedEngine.isRunning && (
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">Current Output</p>
                    <p className="text-sm font-medium">{selectedEngine.currentOutput} kWh</p>
                  </div>
                  <Slider
                    value={[selectedEngine.currentOutput]}
                    min={0}
                    max={selectedEngine.maxCapacity}
                    step={5}
                    onValueChange={(value) => handleOutputChange(selectedEngine.id, value[0])}
                  />
                  <div className="flex justify-between text-xs text-neutral-light">
                    <span>0 kWh</span>
                    <span>{selectedEngine.maxCapacity} kWh</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
