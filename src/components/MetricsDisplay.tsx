
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Target, Zap, BarChart3 } from "lucide-react";

interface MetricsDisplayProps {
  data: any;
}

export const MetricsDisplay = ({ data }: MetricsDisplayProps) => {
  if (!data?.metrics) return null;

  const { metrics, settings, benchmark } = data;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const metrics_cards = [
    {
      title: "Total Invested",
      value: formatCurrency(metrics.totalInvested),
      icon: DollarSign,
      description: `${settings.investmentAmount} every ${settings.frequency} for ${settings.period}`
    },
    {
      title: "Final Portfolio Value",
      value: formatCurrency(metrics.finalValue),
      icon: TrendingUp,
      description: `${formatCurrency(metrics.finalValue - metrics.totalInvested)} profit`
    },
    {
      title: "Total Return",
      value: formatPercentage(metrics.totalReturn),
      icon: metrics.totalReturn >= 0 ? TrendingUp : TrendingDown,
      description: "Overall portfolio performance",
      color: metrics.totalReturn >= 0 ? "text-green-600" : "text-red-600"
    },
    {
      title: "CAGR",
      value: formatPercentage(metrics.cagr),
      icon: BarChart3,
      description: "Compound Annual Growth Rate",
      color: metrics.cagr >= 0 ? "text-green-600" : "text-red-600"
    },
    {
      title: `${benchmark} Benchmark Return`,
      value: formatPercentage(metrics.benchmarkReturn),
      icon: Target,
      description: "Market comparison",
      color: metrics.benchmarkReturn >= 0 ? "text-green-600" : "text-red-600"
    },
    {
      title: "Outperformance",
      value: formatPercentage(metrics.outperformance),
      icon: metrics.outperformance >= 0 ? Zap : TrendingDown,
      description: `vs ${benchmark} benchmark`,
      color: metrics.outperformance >= 0 ? "text-green-600" : "text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics_cards.map((metric, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metric.color || ''}`}>
              {metric.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
