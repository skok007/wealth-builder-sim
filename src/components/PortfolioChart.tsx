
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format } from 'date-fns';

interface PortfolioChartProps {
  data: any;
}

export const PortfolioChart = ({ data }: PortfolioChartProps) => {
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

  // Get unique tickers for stacked areas
  const tickers = data.tickers.map((t: any) => t.symbol);
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {tickers.map((ticker: string, index: number) => (
              <linearGradient key={ticker} id={`gradient-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.3}/>
              </linearGradient>
            ))}
          </defs>
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
          
          {/* Stacked areas for each ticker */}
          {tickers.map((ticker: string, index: number) => (
            <Area
              key={ticker}
              type="monotone"
              dataKey={ticker}
              stackId="1"
              stroke={colors[index % colors.length]}
              fill={`url(#gradient-${ticker})`}
              name={ticker}
            />
          ))}
          
          {/* Benchmark as a line */}
          <Line
            type="monotone"
            dataKey="benchmarkValue"
            stroke="#ff0000"
            strokeDasharray="5 5"
            strokeWidth={2}
            name={`${data.benchmark} Benchmark`}
            dot={false}
          />
          
          {/* Total invested as a reference line */}
          <Line
            type="monotone"
            dataKey="totalInvested"
            stroke="#888888"
            strokeDasharray="2 2"
            strokeWidth={1}
            name="Total Invested"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
