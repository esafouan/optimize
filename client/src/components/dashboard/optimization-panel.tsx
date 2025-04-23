import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, SunIcon, Badge, CheckCircle } from "lucide-react";
import { useOptimization } from "@/hooks/use-optimization";
import { cn } from "@/lib/utils";

export default function OptimizationPanel() {
  const { 
    suggestions, 
    applySuggestion, 
    economicImpact,
    isPending,
    generateSuggestions
  } = useOptimization();

  // Handle applying an optimization suggestion
  const handleApplySuggestion = async (id: number) => {
    await applySuggestion.mutateAsync(id);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-neutral font-medium">Optimization Suggestions</CardTitle>
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-medium text-accent px-2 py-1 bg-green-50 rounded-md"
            onClick={() => generateSuggestions.mutate()}
            disabled={isPending}
          >
            <CheckCircle className="h-3 w-3 inline mr-1" />
            Update
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions?.length === 0 && (
            <div className="p-6 text-center text-neutral-light">
              No optimization suggestions at this time.
            </div>
          )}

          {suggestions?.map((suggestion) => (
            <div key={suggestion.id} className="p-3 border border-border-color rounded-lg">
              <div className="flex items-center text-sm font-medium text-neutral mb-2">
                {suggestion.suggestedAction.includes("shutdown") ? (
                  <AlertTriangle className="h-5 w-5 text-warning mr-2" />
                ) : suggestion.suggestedAction.includes("weather") ? (
                  <SunIcon className="h-5 w-5 text-primary mr-2" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-accent mr-2" />
                )}
                {suggestion.suggestion}
              </div>
              <p className="text-xs text-neutral-light mb-3">
                {suggestion.details}
              </p>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="px-2 py-1 text-xs font-medium"
                  disabled={isPending}
                >
                  Ignore
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  className="px-2 py-1 text-xs font-medium"
                  onClick={() => handleApplySuggestion(suggestion.id)}
                  disabled={isPending}
                >
                  {suggestion.suggestedAction.includes("schedule") ? "Schedule" : "Apply"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t border-border-color pt-4 flex flex-col items-stretch">
        <h4 className="text-sm font-medium text-neutral mb-2">Cost Savings Estimate</h4>
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-light">Today:</span>
          <span className="font-medium text-accent">€{economicImpact?.costReduction?.toFixed(2) || "0.00"}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-light">This week:</span>
          <span className="font-medium text-accent">
            €{economicImpact?.costReduction ? (economicImpact.costReduction * 7).toFixed(2) : "0.00"}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-light">Projected monthly:</span>
          <span className="font-medium text-accent">
            €{economicImpact?.costReduction ? (economicImpact.costReduction * 30).toFixed(2) : "0.00"}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
