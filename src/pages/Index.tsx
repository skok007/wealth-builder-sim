
import { useState, useEffect } from "react";
import { ModernPortfolioSetup } from "@/components/ModernPortfolioSetup";
import { ModernSimulationResults } from "@/components/ModernSimulationResults";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ModernSimulationEngine } from "@/lib/modernSimulationEngine";
import { SimulationParams, SimulationResult } from "@/lib/types";
import { TrendingUp } from "lucide-react";

const Index = () => {
  const [simulationData, setSimulationData] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<SimulationParams | null>(null);
  const [useRealInflation, setUseRealInflation] = useState(false);

  const engine = new ModernSimulationEngine();

  useEffect(() => {
    if (config) {
      setIsLoading(true);
      // Run async simulation with real historical data
      engine.runSimulation(config, useRealInflation)
        .then(results => {
          setSimulationData(results);
        })
        .catch(error => {
          console.error("Historical simulation failed:", error);
          setSimulationData(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [config, useRealInflation]);

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
              <h1 className="text-2xl font-bold">Historical Wealth Simulator</h1>
              <p className="text-sm text-muted-foreground">Real historical market data & inflation analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="real-inflation"
                checked={useRealInflation}
                onCheckedChange={setUseRealInflation}
              />
              <Label htmlFor="real-inflation" className="text-sm">
                Use Real US Inflation
              </Label>
            </div>
            <ThemeToggle />
          </div>
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
