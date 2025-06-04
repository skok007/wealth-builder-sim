
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimulationResult } from '@/lib/types';
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";

interface ModernMetricsDisplayProps {
  data: SimulationResult;
  showReal: boolean;
}

export const ModernMetricsDisplay = ({ data, showReal }: ModernMetricsDisplayProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const metrics = data.metrics;
  const isPositive = (value: number) => value > 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.totalInvested)}</div>
          <p className="text-xs text-muted-foreground">
            Cumulative contributions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Final Value</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(showReal ? metrics.realFinalValue : metrics.finalValue)}
          </div>
          <p className="text-xs text-muted-foreground">
            {showReal ? 'Real purchasing power' : 'Nominal value'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Return</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isPositive(showReal ? metrics.realTotalReturn : metrics.totalReturn) ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercent(showReal ? metrics.realTotalReturn : metrics.totalReturn)}
          </div>
          <p className="text-xs text-muted-foreground">
            {showReal ? 'Inflation-adjusted' : 'Nominal return'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Annual Growth (CAGR)</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isPositive(showReal ? metrics.realCAGR : metrics.cagr) ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercent(showReal ? metrics.realCAGR : metrics.cagr)}
          </div>
          <p className="text-xs text-muted-foreground">
            Compound annual growth
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inflation Impact</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            -{formatPercent(metrics.inflationImpact)}
          </div>
          <p className="text-xs text-muted-foreground">
            Purchasing power loss: {formatCurrency(metrics.finalValue - metrics.realFinalValue)}
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Portfolio Allocation</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {data.tickers.map((ticker, index) => (
              <div key={ticker.symbol} className="flex justify-between text-sm">
                <span>{ticker.symbol}</span>
                <span>{ticker.weight}% @ {ticker.expectedReturn}% return</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
