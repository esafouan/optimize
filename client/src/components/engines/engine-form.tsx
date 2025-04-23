import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEngines } from "@/hooks/use-engines";
import { Engine, insertEngineSchema } from "@shared/schema";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";

interface EngineFormProps {
  engine?: Engine;
  onClose: () => void;
}

// Extend the schema with validations
const formSchema = insertEngineSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  maxCapacity: z.coerce.number()
    .positive("Max capacity must be positive")
    .min(10, "Max capacity must be at least 10 kWh/h"),
  efficiency: z.coerce.number()
    .positive("Efficiency must be positive")
    .min(1, "Efficiency must be at least 1 kWh/litre"),
  optimalThreshold: z.coerce.number()
    .positive("Optimal threshold must be positive"),
});

export default function EngineForm({ engine, onClose }: EngineFormProps) {
  const { addEngine, updateEngine } = useEngines();
  const [isRunning, setIsRunning] = useState(engine?.isRunning || false);
  const [currentOutput, setCurrentOutput] = useState(engine?.currentOutput || 0);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: engine?.name || "",
      maxCapacity: engine?.maxCapacity || 500,
      efficiency: engine?.efficiency || 4.0,
      optimalThreshold: engine?.optimalThreshold || 150,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (engine) {
        // Update existing engine
        await updateEngine.mutateAsync({
          id: engine.id,
          data: {
            ...data,
            isRunning,
            currentOutput: isRunning ? currentOutput : 0,
          },
        });
      } else {
        // Add new engine
        await addEngine.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      console.error("Error saving engine:", error);
    }
  };

  // Calculate the max allowed for optimal threshold based on max capacity
  const maxCapacity = form.watch("maxCapacity");
  const maxOptimalThreshold = maxCapacity || 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Engine Name</FormLabel>
              <FormControl>
                <Input placeholder="Engine Alpha" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxCapacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Capacity (kWh/h)</FormLabel>
              <FormControl>
                <Input type="number" min={10} step={10} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="efficiency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Efficiency (kWh/litre)</FormLabel>
              <FormControl>
                <Input type="number" min={1} step={0.1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="optimalThreshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Optimal Threshold (kWh)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={10} 
                  max={maxOptimalThreshold}
                  step={10} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {engine && (
          <>
            <div className="space-y-2">
              <FormLabel>Engine Status</FormLabel>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={isRunning} 
                  onCheckedChange={setIsRunning} 
                  id="engine-status" 
                />
                <label htmlFor="engine-status" className="text-sm">
                  {isRunning ? "Running" : "Standby"}
                </label>
              </div>
            </div>

            {isRunning && (
              <div className="space-y-2">
                <FormLabel>Current Output: {currentOutput} kWh</FormLabel>
                <Slider
                  value={[currentOutput]}
                  min={0}
                  max={maxCapacity}
                  step={5}
                  onValueChange={(value) => setCurrentOutput(value[0])}
                />
                <div className="flex justify-between text-xs text-neutral-light">
                  <span>0 kWh</span>
                  <span>{maxCapacity} kWh</span>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {engine ? "Update Engine" : "Add Engine"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
