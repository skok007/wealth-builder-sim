
import { useState, useEffect } from "react";
import { ModernPortfolioSetup } from "@/components/ModernPortfolioSetup";
import { ModernSimulationResults } from "@/components/ModernSimulationResults";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ModernSimulationEngine } from "@/lib/modernSimulationEngine";
import { SimulationParams, SimulationResult } from "@/lib/types";
import { TrendingUp } from "lucide-react";

const Index = () => {
  const [simulationData, setSimulationData] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<SimulationParams | null>(null);

  const engine = new ModernSimulationEngine();

  useEffect(() => {
    if (config) {
      setIsLoading(true);
      // Run async simulation
      engine.runSimulation(config)
        .then(results => {
          setSimulationData(results);
        })
        .catch(error => {
          console.error("Simulation failed:", error);
          setSimulationData(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [config]);

  const handleConfigChange = (newConfig: SimulationParams) => {
    setConfig(newConfig);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Professional Wealth Simulator</h1>
              <p className="text-sm text-muted-foreground">Investment simulation with real market data & inflation adjustment</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content - Fixed Grid Layout */}
      <div className="container mx-auto p-4 h-[calc(100vh-120px)]">
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 h-full w-full">
          {/* Left Sidebar - Portfolio Setup */}
          <div className="overflow-y-auto">
            <ModernPortfolioSetup onConfigChange={handleConfigChange} />
          </div>

          {/* Right Main Area - Charts and Results */}
          <div className="overflow-y-auto">
            <ModernSimulationResults 
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
