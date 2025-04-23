import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useEngines } from "@/hooks/use-engines";
import { Engine } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EngineForm from "./engine-form";
import { PlusIcon, Edit, Trash2, Power } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

export default function EngineList() {
  const { engines, toggleEngineState, updateEngineOutput, deleteEngine } = useEngines();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<Engine | null>(null);

  const handleEdit = (engine: Engine) => {
    setSelectedEngine(engine);
    setIsEditDialogOpen(true);
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {engines?.map((engine) => (
          <Card key={engine.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">{engine.name}</CardTitle>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={engine.isRunning ? "text-green-600" : "text-gray-400"}
                  onClick={() => handleToggle(engine.id, engine.isRunning)}
                >
                  <Power className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(engine)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500"
                  onClick={() => handleDelete(engine.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-light">Max Capacity</p>
                    <p className="font-medium">{engine.maxCapacity} kWh/h</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-light">Efficiency</p>
                    <p className="font-medium">{engine.efficiency.toFixed(1)} kWh/L</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-light">Optimal Threshold</p>
                    <p className="font-medium">{engine.optimalThreshold} kWh</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-light">Status</p>
                    <Badge 
                      variant="outline"
                      className={engine.isRunning ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {engine.isRunning ? "Running" : "Standby"}
                    </Badge>
                  </div>
                </div>

                {engine.isRunning && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-sm text-neutral-light">Current Output</p>
                      <p className="text-sm font-medium">{engine.currentOutput} kWh</p>
                    </div>
                    <Slider
                      value={[engine.currentOutput]}
                      min={0}
                      max={engine.maxCapacity}
                      step={5}
                      onValueChange={(value) => handleOutputChange(engine.id, value[0])}
                    />
                    <div className="flex justify-between text-xs text-neutral-light">
                      <span>0 kWh</span>
                      <span>{engine.maxCapacity} kWh</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

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
    </div>
  );
}
