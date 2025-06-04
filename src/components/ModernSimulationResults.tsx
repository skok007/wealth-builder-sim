
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModernPortfolioChart } from "@/components/ModernPortfolioChart";
import { ModernGrowthChart } from "@/components/ModernGrowthChart";
import { ModernMetricsDisplay } from "@/components/ModernMetricsDisplay";
import { Skeleton } from "@/components/ui/skeleton";
import { SimulationResult } from "@/lib/types";
import { BarChart3, TrendingUp, Calculator, DollarSign } from "lucide-react";

interface ModernSimulationResultsProps {
  data: SimulationResult | null;
  isLoading: boolean;
}

export const ModernSimulationResults = ({ data, isLoading }: ModernSimulationResultsProps) => {
  const [showReal, setShowReal] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <div className="grid md:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Ready to Simulate</h3>
            <p className="text-muted-foreground">
              Configure your portfolio settings to see the wealth simulation
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Value Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={!showReal ? "default" : "outline"}
            onClick={() => setShowReal(false)}
            size="sm"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Nominal
          </Button>
          <Button
            variant={showReal ? "default" : "outline"}
            onClick={() => setShowReal(true)}
            size="sm"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Real (Inflation-Adjusted)
          </Button>
        </div>
      </div>

      {/* Portfolio Composition Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Portfolio Composition Over Time
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Stacked areas show each ticker's value, dashed line shows cumulative investment
          </p>
        </CardHeader>
        <CardContent>
          <ModernPortfolioChart data={data} showReal={showReal} />
        </CardContent>
      </Card>

      {/* Total Portfolio Growth */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Total Portfolio Growth
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Portfolio value vs cumulative investment over time
          </p>
        </CardHeader>
        <CardContent>
          <ModernGrowthChart data={data} showReal={showReal} />
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ModernMetricsDisplay data={data} showReal={showReal} />
        </CardContent>
      </Card>
    </div>
  );
};
