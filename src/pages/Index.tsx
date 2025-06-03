
import { useState } from "react";
import { PortfolioSetup } from "@/components/PortfolioSetup";
import { SimulationResults } from "@/components/SimulationResults";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TrendingUp } from "lucide-react";

const Index = () => {
  const [simulationData, setSimulationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSimulationComplete = (data: any) => {
    setSimulationData(data);
    setIsLoading(false);
  };

  const handleSimulationStart = () => {
    setIsLoading(true);
    setSimulationData(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Wealth Builder Simulator</h1>
              <p className="text-sm text-muted-foreground">Learn investing through simulation</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content - Fixed Grid Layout */}
      <div className="container mx-auto p-4 h-[calc(100vh-120px)]">
        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6 h-full">
          {/* Left Sidebar - Portfolio Setup */}
          <div className="overflow-y-auto">
            <PortfolioSetup
              onSimulationStart={handleSimulationStart}
              onSimulationComplete={handleSimulationComplete}
              isLoading={isLoading}
            />
          </div>

          {/* Right Main Area - Charts and Results */}
          <div className="overflow-y-auto">
            <SimulationResults 
              data={simulationData}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
