
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
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

  // Find the transition point between historical and forecast data
  const transitionIndex = data.portfolioData.findIndex(point => point.isHistorical === false);
  const transitionDate = transitionIndex > 0 ? data.portfolioData[transitionIndex - 1].date : null;

  const chartData = filteredData.map(point => ({
    year: point.year,
    date: point.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    fullDate: point.date,
    portfolioValue: showReal ? point.realPortfolioValue : point.totalPortfolioValue,
    cumulativeInvestment: showReal ? point.realCumulativeInvestment : point.cumulativeInvestment,
    isHistorical: point.isHistorical !== false,
  }));

  return (
    <div className="space-y-4">
      {/* Time Range Slider */}
      <div className="space-y-2">
        <Label>
          Time Range: {data.portfolioData[timeRange.start]?.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {data.portfolioData[timeRange.end]?.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </Label>
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
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              formatter={(value: number, name: string) => [formatCurrency(value), name]}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  const dataPoint = payload[0].payload;
                  const dateStr = dataPoint.fullDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric' 
                  });
                  const type = dataPoint.isHistorical ? 'Historical' : 'Forecast';
                  return `${dateStr} (${type})`;
                }
                return label;
              }}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend />
            
            {/* Reference line for historical/forecast transition */}
            {transitionDate && (
              <ReferenceLine 
                x={transitionDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} 
                stroke="#ff6b6b" 
                strokeDasharray="8 8"
                strokeWidth={2}
                label={{ value: "Historical → Forecast", position: "top" }}
              />
            )}
            
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
