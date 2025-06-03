
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortfolioChart } from "@/components/PortfolioChart";
import { MetricsDisplay } from "@/components/MetricsDisplay";
import { ExportButton } from "@/components/ExportButton";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp, Calculator } from "lucide-react";

interface SimulationResultsProps {
  data: any;
  isLoading: boolean;
}

export const SimulationResults = ({ data, isLoading }: SimulationResultsProps) => {
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
        <div className="grid md:grid-cols-2 gap-4">
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
              Configure your portfolio and run a simulation to see results
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Export Button */}
      <div className="flex justify-end">
        <ExportButton data={data} />
      </div>

      {/* Portfolio Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Portfolio Performance Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PortfolioChart data={data} />
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Key Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MetricsDisplay data={data} />
        </CardContent>
      </Card>
    </div>
  );
};
