
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TickerConfig {
  symbol: string;
  weight: number;
  expectedReturn: number;
}

interface ModernPortfolioSetupProps {
  onConfigChange: (config: any) => void;
}

export const ModernPortfolioSetup = ({ onConfigChange }: ModernPortfolioSetupProps) => {
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [recurringInvestment, setRecurringInvestment] = useState(500);
  const [contributionFrequency, setContributionFrequency] = useState<'monthly' | 'yearly'>('monthly');
  const [simulationYears, setSimulationYears] = useState(20);
  const [inflationRate, setInflationRate] = useState(3);
  const [tickers, setTickers] = useState<TickerConfig[]>([
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

  const updateTicker = (index: number, updates: Partial<TickerConfig>) => {
    const newTickers = tickers.map((ticker, i) => 
      i === index ? { ...ticker, ...updates } : ticker
    );
    setTickers(newTickers);
    setTimeout(updateConfig, 0);
  };

  const InfoTooltip = ({ content }: { content: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Info className="h-4 w-4 text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="space-y-6">
      {/* Investment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Investment Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Initial Investment</Label>
              <InfoTooltip content="The amount you're starting with today" />
            </div>
            <div className="flex items-center gap-4">
              <Slider
                value={[initialInvestment]}
                onValueChange={(value) => {
                  setInitialInvestment(value[0]);
                  setTimeout(updateConfig, 0);
                }}
                max={100000}
                min={100}
                step={100}
                className="flex-1"
              />
              <Input
                type="number"
                value={initialInvestment}
                onChange={(e) => {
                  setInitialInvestment(Number(e.target.value));
                  setTimeout(updateConfig, 0);
                }}
                className="w-24"
              />
            </div>
            <p className="text-sm text-muted-foreground">${initialInvestment.toLocaleString()}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Recurring Investment</Label>
              <InfoTooltip content="Amount you'll invest regularly" />
            </div>
            <div className="flex items-center gap-4">
              <Slider
                value={[recurringInvestment]}
                onValueChange={(value) => {
                  setRecurringInvestment(value[0]);
                  setTimeout(updateConfig, 0);
                }}
                max={5000}
                min={0}
                step={50}
                className="flex-1"
              />
              <Input
                type="number"
                value={recurringInvestment}
                onChange={(e) => {
                  setRecurringInvestment(Number(e.target.value));
                  setTimeout(updateConfig, 0);
                }}
                className="w-24"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={contributionFrequency} onValueChange={(value: 'monthly' | 'yearly') => {
                setContributionFrequency(value);
                setTimeout(updateConfig, 0);
              }}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                ${recurringInvestment.toLocaleString()} {contributionFrequency}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Simulation Length</Label>
              <InfoTooltip content="How many years to simulate into the future" />
            </div>
            <div className="flex items-center gap-4">
              <Slider
                value={[simulationYears]}
                onValueChange={(value) => {
                  setSimulationYears(value[0]);
                  setTimeout(updateConfig, 0);
                }}
                max={50}
                min={1}
                step={1}
                className="flex-1"
              />
              <span className="w-16 text-center">{simulationYears} years</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Annual Inflation Rate</Label>
              <InfoTooltip content="Expected yearly inflation to calculate real purchasing power" />
            </div>
            <div className="flex items-center gap-4">
              <Slider
                value={[inflationRate]}
                onValueChange={(value) => {
                  setInflationRate(value[0]);
                  setTimeout(updateConfig, 0);
                }}
                max={10}
                min={0}
                step={0.1}
                className="flex-1"
              />
              <span className="w-16 text-center">{inflationRate}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Composition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Portfolio Composition</CardTitle>
          <div className={`text-sm ${totalWeight === 100 ? 'text-green-600' : 'text-destructive'}`}>
            Total Weight: {totalWeight}%
            {totalWeight !== 100 && ' (Must equal 100%)'}
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
              <div className="col-span-3 space-y-1">
                <Slider
                  value={[ticker.weight]}
                  onValueChange={(value) => updateTicker(index, { weight: value[0] })}
                  max={100}
                  min={0}
                  step={5}
                />
                <p className="text-xs text-center">{ticker.weight}%</p>
              </div>
              <div className="col-span-3 space-y-1">
                <Slider
                  value={[ticker.expectedReturn]}
                  onValueChange={(value) => updateTicker(index, { expectedReturn: value[0] })}
                  max={20}
                  min={0}
                  step={0.5}
                />
                <p className="text-xs text-center">{ticker.expectedReturn}% return</p>
              </div>
              <div className="col-span-2">
                {tickers.length > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeTicker(index)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
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
    </div>
  );
};
