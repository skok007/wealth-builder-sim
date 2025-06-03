
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface TickerPerformanceChartProps {
  data: any;
}

export const TickerPerformanceChart = ({ data }: TickerPerformanceChartProps) => {
  if (!data?.portfolioData) return null;

  const chartData = data.portfolioData.map((point: any) => ({
    ...point,
    date: format(new Date(point.date), 'MMM yyyy'),
    formattedDate: new Date(point.date).toLocaleDateString()
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Get unique tickers for individual lines
  const tickers = data.tickers.map((t: any) => t.symbol);
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={formatCurrency}
          />
          <Tooltip
            formatter={(value: number, name: string) => [formatCurrency(value), name]}
            labelFormatter={(label) => `Date: ${label}`}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Legend />
          
          {/* Individual ticker lines */}
          {tickers.map((ticker: string, index: number) => (
            <Line
              key={ticker}
              type="monotone"
              dataKey={ticker}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              name={ticker}
              dot={false}
            />
          ))}
          
          {/* Benchmark line */}
          <Line
            type="monotone"
            dataKey="benchmarkValue"
            stroke="#ff0000"
            strokeDasharray="5 5"
            strokeWidth={2}
            name={`${data.benchmark} Benchmark`}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
