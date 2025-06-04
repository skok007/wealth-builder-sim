
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { SimulationResult, ChartTimeRange } from '@/lib/types';

interface ModernGrowthChartProps {
  data: SimulationResult;
  showReal: boolean;
}

export const ModernGrowthChart = ({ data, showReal }: ModernGrowthChartProps) => {
  const [timeRange, setTimeRange] = useState<ChartTimeRange>({ start: 0, end: data.portfolioData.length - 1 });

  if (!data?.portfolioData?.length) return null;

  const filteredData = data.portfolioData.slice(timeRange.start, timeRange.end + 1);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const chartData = filteredData.map(point => ({
    year: point.year,
    date: point.date.toLocaleDateString(),
    portfolioValue: showReal ? point.realPortfolioValue : point.totalPortfolioValue,
    cumulativeInvestment: showReal ? point.realCumulativeInvestment : point.cumulativeInvestment,
  }));

  return (
    <div className="space-y-4">
      {/* Time Range Slider */}
      <div className="space-y-2">
        <Label>Time Range: {data.portfolioData[timeRange.start]?.year.toFixed(1)} - {data.portfolioData[timeRange.end]?.year.toFixed(1)} years</Label>
        <Slider
          value={[timeRange.start, timeRange.end]}
          onValueChange={(value) => setTimeRange({ start: value[0], end: value[1] })}
          max={data.portfolioData.length - 1}
          min={0}
          step={1}
          className="w-full"
        />
      </div>

      {/* Growth Chart */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="year" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value.toFixed(0)}y`}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              formatter={(value: number, name: string) => [formatCurrency(value), name]}
              labelFormatter={(label) => `Year ${Number(label).toFixed(1)}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend />
            
            {/* Portfolio value line */}
            <Line
              type="monotone"
              dataKey="portfolioValue"
              stroke="#22c55e"
              strokeWidth={3}
              name={`Portfolio Value (${showReal ? 'Real' : 'Nominal'})`}
              dot={false}
            />
            
            {/* Cumulative investment line */}
            <Line
              type="monotone"
              dataKey="cumulativeInvestment"
              stroke="#64748b"
              strokeDasharray="5 5"
              strokeWidth={2}
              name="Cumulative Investment"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
