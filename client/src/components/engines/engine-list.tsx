import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useEngines } from "@/hooks/use-engines";
import { Engine } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EngineForm from "./engine-form";
import { PlusIcon, Edit, Trash2, Power, Zap, Info, Gauge, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

export default function EngineList() {
  const { engines, toggleEngineState, updateEngineOutput, deleteEngine } = useEngines();
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Engine Management</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Engine
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {engines?.map((engine) => (
          <Card 
            key={engine.id} 
            className={`cursor-pointer hover:shadow-md transition-shadow ${
              engine.isRunning ? "border-green-200" : ""
            }`}
            onClick={() => handleViewDetails(engine)}
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
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Engine Card */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow border-dashed"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center h-full">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <PlusIcon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mt-3">Add Engine</h3>
          </CardContent>
        </Card>

        {engines?.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center h-40">
              <p className="text-neutral-light mb-4">No engines added yet</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Engine
              </Button>
            </CardContent>
          </Card>
        )}
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
                <div className="flex items-center gap-2">
                  <Power className="h-5 w-5 text-neutral-light" />
                  <div>
                    <p className="text-sm text-neutral-light">Status</p>
                    <Badge 
                      variant="outline"
                      className={selectedEngine.isRunning ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {selectedEngine.isRunning ? "Running" : "Standby"}
                    </Badge>
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

              <div className="flex justify-between pt-4 border-t">
                <Button 
                  variant={selectedEngine.isRunning ? "destructive" : "default"}
                  onClick={() => {
                    handleToggle(selectedEngine.id, selectedEngine.isRunning);
                    setIsDetailsDialogOpen(false);
                  }}
                >
                  <Power className="h-4 w-4 mr-2" />
                  {selectedEngine.isRunning ? "Shut Down" : "Start Engine"}
                </Button>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsDetailsDialogOpen(false);
                      handleEdit(selectedEngine);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-red-500"
                    onClick={() => {
                      setIsDetailsDialogOpen(false);
                      handleDelete(selectedEngine.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
