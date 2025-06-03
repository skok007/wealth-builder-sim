
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TickerInput } from "@/components/TickerInput";
import { SimulationEngine } from "@/lib/simulationEngine";
import { Plus, Play, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PortfolioSetupProps {
  onSimulationStart: () => void;
  onSimulationComplete: (data: any) => void;
  isLoading: boolean;
}

export const PortfolioSetup = ({ onSimulationStart, onSimulationComplete, isLoading }: PortfolioSetupProps) => {
  const [investmentAmount, setInvestmentAmount] = useState("100");
  const [frequency, setFrequency] = useState("monthly");
  const [benchmark, setBenchmark] = useState("SPY");
  const [tickers, setTickers] = useState([
    { symbol: "AAPL", weight: 30 },
    { symbol: "MSFT", weight: 30 },
    { symbol: "GOOGL", weight: 20 },
    { symbol: "AMZN", weight: 20 }
  ]);
  
  const { toast } = useToast();

  const totalWeight = tickers.reduce((sum, ticker) => sum + ticker.weight, 0);

  const addTicker = () => {
    setTickers([...tickers, { symbol: "", weight: 0 }]);
  };

  const removeTicker = (index: number) => {
    setTickers(tickers.filter((_, i) => i !== index));
  };

  const updateTicker = (index: number, updates: Partial<{ symbol: string; weight: number }>) => {
    setTickers(tickers.map((ticker, i) => 
      i === index ? { ...ticker, ...updates } : ticker
    ));
  };

  const runSimulation = async () => {
    // Validation
    if (totalWeight !== 100) {
      toast({
        title: "Invalid Portfolio Weights",
        description: "Portfolio weights must sum to exactly 100%",
        variant: "destructive"
      });
      return;
    }

    const invalidTickers = tickers.filter(t => !t.symbol.trim());
    if (invalidTickers.length > 0) {
      toast({
        title: "Invalid Tickers",
        description: "All tickers must have valid symbols",
        variant: "destructive"
      });
      return;
    }

    onSimulationStart();

    try {
      const engine = new SimulationEngine();
      const results = await engine.runSimulation({
        tickers: tickers.filter(t => t.symbol.trim()),
        investmentAmount: parseFloat(investmentAmount),
        frequency,
        benchmark,
        startDate: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000), // 5 years ago
        endDate: new Date()
      });

      onSimulationComplete(results);
      
      toast({
        title: "Simulation Complete",
        description: "Your investment simulation has been generated successfully!"
      });
    } catch (error) {
      console.error("Simulation failed:", error);
      toast({
        title: "Simulation Failed",
        description: "There was an error running your simulation. Please try again.",
        variant: "destructive"
      });
      onSimulationComplete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Investment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Investment Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="amount">Investment Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(e.target.value)}
              placeholder="100"
              min="1"
            />
          </div>
          
          <div>
            <Label htmlFor="frequency">Investment Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="benchmark">Benchmark (for comparison)</Label>
            <Input
              id="benchmark"
              value={benchmark}
              onChange={(e) => setBenchmark(e.target.value.toUpperCase())}
              placeholder="SPY"
            />
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Composition */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Composition</CardTitle>
          <div className={`text-sm ${totalWeight === 100 ? 'text-green-600' : 'text-destructive'}`}>
            Total Weight: {totalWeight}%
            {totalWeight !== 100 && (
              <div className="flex items-center gap-1 mt-1">
                <AlertCircle className="h-4 w-4" />
                Must equal 100%
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {tickers.map((ticker, index) => (
            <TickerInput
              key={index}
              ticker={ticker}
              onUpdate={(updates) => updateTicker(index, updates)}
              onRemove={() => removeTicker(index)}
              canRemove={tickers.length > 1}
            />
          ))}
          
          <Button
            variant="outline"
            onClick={addTicker}
            className="w-full"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Ticker
          </Button>
        </CardContent>
      </Card>

      {/* Run Simulation */}
      <Button
        onClick={runSimulation}
        disabled={isLoading || totalWeight !== 100}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          "Running Simulation..."
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            Run Simulation
          </>
        )}
      </Button>
    </div>
  );
};
