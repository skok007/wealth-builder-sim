
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TickerInput } from "./TickerInput";
import { Plus } from "lucide-react";

interface PortfolioSetupProps {
  onConfigChange: (config: any) => void;
}

export const PortfolioSetup = ({ onConfigChange }: PortfolioSetupProps) => {
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [recurringInvestment, setRecurringInvestment] = useState(500);
  const [contributionFrequency, setContributionFrequency] = useState<'monthly' | 'yearly'>('monthly');
  const [simulationYears, setSimulationYears] = useState(20);
  const [inflationRate, setInflationRate] = useState(3);
  const [tickers, setTickers] = useState([
    { symbol: "AAPL", weight: 30, expectedReturn: 10 },
    { symbol: "MSFT", weight: 30, expectedReturn: 9 },
    { symbol: "GOOGL", weight: 25, expectedReturn: 11 },
    { symbol: "AMZN", weight: 15, expectedReturn: 12 }
  ]);

  const totalWeight = tickers.reduce((sum, ticker) => sum + ticker.weight, 0);

  const updateConfig = () => {
    if (totalWeight === 100) {
      onConfigChange({
        tickers,
        initialInvestment,
        recurringInvestment,
        contributionFrequency,
        simulationYears,
        inflationRate,
        benchmark: 'SPY'
      });
    }
  };

  // Call updateConfig whenever any value changes
  useState(() => {
    updateConfig();
  });

  const addTicker = () => {
    setTickers([...tickers, { symbol: "", weight: 0, expectedReturn: 8 }]);
  };

  const removeTicker = (index: number) => {
    const newTickers = tickers.filter((_, i) => i !== index);
    setTickers(newTickers);
    setTimeout(updateConfig, 0);
  };

  const updateTicker = (index: number, updates: Partial<{ symbol: string; weight: number; expectedReturn: number }>) => {
    const newTickers = tickers.map((ticker, i) => 
      i === index ? { ...ticker, ...updates } : ticker
    );
    setTickers(newTickers);
    setTimeout(updateConfig, 0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Initial Investment: ${initialInvestment.toLocaleString()}</Label>
            <Slider
              value={[initialInvestment]}
              onValueChange={(value) => {
                setInitialInvestment(value[0]);
                setTimeout(updateConfig, 0);
              }}
              max={100000}
              min={100}
              step={100}
            />
          </div>

          <div className="space-y-2">
            <Label>Recurring Investment: ${recurringInvestment.toLocaleString()}</Label>
            <Slider
              value={[recurringInvestment]}
              onValueChange={(value) => {
                setRecurringInvestment(value[0]);
                setTimeout(updateConfig, 0);
              }}
              max={5000}
              min={0}
              step={50}
            />
            <Select value={contributionFrequency} onValueChange={(value: 'monthly' | 'yearly') => {
              setContributionFrequency(value);
              setTimeout(updateConfig, 0);
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Simulation Years: {simulationYears}</Label>
            <Slider
              value={[simulationYears]}
              onValueChange={(value) => {
                setSimulationYears(value[0]);
                setTimeout(updateConfig, 0);
              }}
              max={50}
              min={1}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Inflation Rate: {inflationRate}%</Label>
            <Slider
              value={[inflationRate]}
              onValueChange={(value) => {
                setInflationRate(value[0]);
                setTimeout(updateConfig, 0);
              }}
              max={10}
              min={0}
              step={0.1}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Composition</CardTitle>
          <div className={`text-sm ${totalWeight === 100 ? 'text-green-600' : 'text-red-600'}`}>
            Total Weight: {totalWeight}% {totalWeight !== 100 && '(Must equal 100%)'}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {tickers.map((ticker, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <Input
                placeholder="AAPL"
                value={ticker.symbol}
                onChange={(e) => updateTicker(index, { symbol: e.target.value.toUpperCase() })}
                className="col-span-3"
              />
              <div className="col-span-3">
                <Input
                  type="number"
                  placeholder="30"
                  value={ticker.weight || ""}
                  onChange={(e) => updateTicker(index, { weight: parseFloat(e.target.value) || 0 })}
                  className="w-full"
                />
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  placeholder="10"
                  value={ticker.expectedReturn || ""}
                  onChange={(e) => updateTicker(index, { expectedReturn: parseFloat(e.target.value) || 0 })}
                  className="w-full"
                />
              </div>
              <div className="col-span-3">
                {tickers.length > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => removeTicker(index)}
                    className="w-full"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          <Button onClick={addTicker} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Ticker
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
