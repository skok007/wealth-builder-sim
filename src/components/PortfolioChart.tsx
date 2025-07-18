
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, LineChart } from 'recharts';
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
            <linearGradient id="investedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#64748b" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#64748b" stopOpacity={0.3}/>
            </linearGradient>
            <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.3}/>
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
          
          {/* Invested capital area */}
          <Area
            type="monotone"
            dataKey="totalInvested"
            stackId="1"
            stroke="#64748b"
            fill="url(#investedGradient)"
            name="Invested Capital"
          />
          
          {/* Growth area on top */}
          <Area
            type="monotone"
            dataKey="growth"
            stackId="1"
            stroke="#22c55e"
            fill="url(#growthGradient)"
            name="Growth"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
