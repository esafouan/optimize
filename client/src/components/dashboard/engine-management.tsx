import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, Edit, Trash2 } from "lucide-react";
import { useEngines } from "@/hooks/use-engines";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EngineForm from "@/components/engines/engine-form";
import { Engine } from "@shared/schema";
import { calculateEngineEfficiency } from "@/lib/utils";

export default function EngineManagement() {
  const { engines, deleteEngine, toggleEngineState } = useEngines();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<Engine | null>(null);

  const handleEdit = (engine: Engine) => {
    setSelectedEngine(engine);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this engine?")) {
      await deleteEngine.mutateAsync(id);
    }
  };

  const handleToggle = async (id: number, isRunning: boolean) => {
    await toggleEngineState.mutateAsync({ id, isRunning: !isRunning });
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-neutral font-medium">Engine Management</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-secondary text-sm font-medium"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Engine
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-color">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-light uppercase tracking-wider">
                  Engine
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-light uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-light uppercase tracking-wider">
                  Current Output
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-light uppercase tracking-wider">
                  Efficiency
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-light uppercase tracking-wider">
                  Optimal Threshold
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-light uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-border-color">
              {engines?.map((engine, index) => (
                <tr key={engine.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white ${
                          index === 0 
                            ? "bg-warning" 
                            : index === 1 
                              ? "bg-danger" 
                              : "bg-neutral-light"
                        }`}
                      >
                        E{index + 1}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-neutral">{engine.name}</div>
                        <div className="text-xs text-neutral-light">
                          {engine.maxCapacity} kWh/h max
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge 
                      variant="outline"
                      className={engine.isRunning ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {engine.isRunning ? "Running" : "Standby"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-neutral">{engine.currentOutput} kWh</div>
                    <div className="text-xs text-neutral-light">
                      {engine.maxCapacity 
                        ? `${Math.round((engine.currentOutput / engine.maxCapacity) * 100)}% capacity` 
                        : "0% capacity"}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-neutral">{engine.efficiency.toFixed(1)} kWh/L</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-neutral">{engine.optimalThreshold} kWh</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-primary hover:text-secondary mr-2"
                      onClick={() => handleEdit(engine)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-danger hover:text-red-700"
                      onClick={() => handleDelete(engine.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {engines?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-neutral-light">
                    No engines added yet. Click "Add Engine" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

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
    </Card>
  );
}
