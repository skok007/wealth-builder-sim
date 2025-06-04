
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, LineChart, ReferenceLine } from 'recharts';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { SimulationResult, ChartTimeRange } from '@/lib/types';

interface ModernPortfolioChartProps {
  data: SimulationResult;
  showReal: boolean;
}

export const ModernPortfolioChart = ({ data, showReal }: ModernPortfolioChartProps) => {
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

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042'];

  // Find the transition point between historical and forecast data
  const transitionIndex = data.portfolioData.findIndex(point => point.isHistorical === false);
  const transitionDate = transitionIndex > 0 ? data.portfolioData[transitionIndex - 1].date : null;

  // Process data for stacked areas
  const chartData = filteredData.map(point => {
    const result: any = {
      year: point.year,
      date: point.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      fullDate: point.date,
      cumulativeInvestment: showReal ? point.realCumulativeInvestment : point.cumulativeInvestment,
      isHistorical: point.isHistorical !== false,
    };

    // Add ticker values for stacking
    data.tickers.forEach((ticker, index) => {
      const tickerKey = ticker.symbol;
      result[tickerKey] = showReal ? point.realTickerValues[tickerKey] : point.tickerValues[tickerKey];
    });

    return result;
  });

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

      {/* Portfolio Composition Chart */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              {data.tickers.map((ticker, index) => (
                <linearGradient key={ticker.symbol} id={`gradient-${ticker.symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.3}/>
                </linearGradient>
              ))}
            </defs>
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
            
            {/* Stacked areas for each ticker */}
            {data.tickers.map((ticker, index) => (
              <Area
                key={ticker.symbol}
                type="monotone"
                dataKey={ticker.symbol}
                stackId="1"
                stroke={colors[index % colors.length]}
                fill={`url(#gradient-${ticker.symbol})`}
                name={ticker.symbol}
              />
            ))}
            
            {/* Cumulative investment line */}
            <Line
              type="monotone"
              dataKey="cumulativeInvestment"
              stroke="#ff0000"
              strokeDasharray="5 5"
              strokeWidth={2}
              name="Cumulative Investment"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
