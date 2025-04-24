import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEngines } from "@/hooks/use-engines";
import { useSimulation } from "@/hooks/use-simulation";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your energy system assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { engines, runningEngines, totalEngineProduction } = useEngines();
  const { simulationState } = useSimulation();

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Process the message and generate a response
    setTimeout(() => {
      const response = generateResponse(input);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsLoading(false);
    }, 500);
  };

  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // Information about running engines
    if (lowerQuery.includes("how many") && lowerQuery.includes("engine") && lowerQuery.includes("running")) {
      const count = runningEngines?.length || 0;
      return `There are currently ${count} engines running out of ${engines?.length || 0} total engines.`;
    }
    
    // Information about total production
    if ((lowerQuery.includes("total") || lowerQuery.includes("how much")) && 
        (lowerQuery.includes("production") || lowerQuery.includes("output") || lowerQuery.includes("generating"))) {
      return `The total current engine production is ${totalEngineProduction} kW.`;
    }
    
    // Information about simulation state
    if (lowerQuery.includes("simulation") || lowerQuery.includes("day") || lowerQuery.includes("hour")) {
      if (simulationState) {
        return `The simulation is currently on Day ${simulationState.currentDay} at ${simulationState.currentHour}:00 hours.`;
      } else {
        return "The simulation hasn't started yet.";
      }
    }
    
    // Information about specific engines
    if (lowerQuery.includes("engine") && (lowerQuery.includes("detail") || lowerQuery.includes("info") || lowerQuery.includes("status"))) {
      if (!engines || engines.length === 0) {
        return "There are no engines in the system yet.";
      }
      
      let response = "Here's information about the engines:\n\n";
      engines.forEach((engine, index) => {
        response += `Engine ${engine.id}: ${engine.name}\n`;
        response += `- Status: ${engine.isRunning ? "Running" : "Stopped"}\n`;
        response += `- Current Output: ${engine.currentOutput} kW\n`;
        response += `- Max Output: ${engine.maxOutput} kW\n`;
        if (index < engines.length - 1) response += "\n";
      });
      
      return response;
    }
    
    // Information about predictions
    if (lowerQuery.includes("predict") || lowerQuery.includes("forecast") || lowerQuery.includes("next hour")) {
      return "Based on our predictions for the next hour, we expect the engine outputs to change by 30-70% depending on upcoming energy demands and solar production.";
    }
    
    // Default response
    return "I'm here to help with information about your engine management system. You can ask about running engines, total production, simulation state, engine details, or predictions.";
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={toggleChat}
        size="sm"
        variant="outline"
        className="fixed bottom-4 right-4 rounded-full h-12 w-12 p-0 bg-primary text-white hover:bg-primary/90 shadow-lg"
      >
        <MessageSquare className="h-5 w-5" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 w-80 md:w-96 shadow-lg border border-border-color overflow-hidden z-50">
          <div className="flex items-center justify-between p-3 bg-primary text-white">
            <h3 className="font-medium">Energy System Assistant</h3>
            <Button
              onClick={toggleChat}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:bg-primary/90"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <ScrollArea className="h-80 p-3">
            <div className="flex flex-col space-y-3">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-white"
                        : "bg-bg-light text-neutral"
                    }`}
                  >
                    <p className="whitespace-pre-line text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-bg-light text-neutral">
                    <p className="text-sm">Thinking...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <form onSubmit={handleSendMessage} className="border-t border-border-color p-3">
            <div className="flex items-center space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!input.trim() || isLoading}
                className="bg-primary text-white hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      )}
    </>
  );
}