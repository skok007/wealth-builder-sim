
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

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
            </linearGradient>
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
          <Area
            type="monotone"
            dataKey="portfolioValue"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#portfolioGradient)"
            name="Portfolio Value"
          />
          <Area
            type="monotone"
            dataKey="benchmarkValue"
            stroke="#82ca9d"
            fillOpacity={1}
            fill="url(#benchmarkGradient)"
            name={`${data.benchmark} Benchmark`}
          />
          <Line
            type="monotone"
            dataKey="totalInvested"
            stroke="#ff7300"
            strokeDasharray="5 5"
            strokeWidth={2}
            name="Total Invested"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
