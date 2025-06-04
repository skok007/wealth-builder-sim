
export interface SimulationParams {
  tickers: { symbol: string; weight: number; expectedReturn: number }[];
  initialInvestment: number;
  recurringInvestment: number;
  contributionFrequency: 'monthly' | 'yearly';
  simulationYears: number;
  inflationRate: number;
  benchmark: string;
}

export interface SimulationDataPoint {
  year: number;
  date: Date;
  totalPortfolioValue: number;
  realPortfolioValue: number;
  cumulativeInvestment: number;
  realCumulativeInvestment: number;
  tickerValues: { [symbol: string]: number };
  realTickerValues: { [symbol: string]: number };
  inflationFactor: number;
}

export interface SimulationMetrics {
  totalInvested: number;
  finalValue: number;
  realFinalValue: number;
  totalReturn: number;
  realTotalReturn: number;
  cagr: number;
  realCAGR: number;
  inflationImpact: number;
}

export interface SimulationResult {
  portfolioData: SimulationDataPoint[];
  metrics: SimulationMetrics;
  tickers: { symbol: string; weight: number; expectedReturn: number }[];
  settings: {
    initialInvestment: number;
    recurringInvestment: number;
    contributionFrequency: string;
    simulationYears: number;
    inflationRate: number;
  };
}

export interface ChartTimeRange {
  start: number;
  end: number;
}
