
export interface SimulationParams {
  tickers: { symbol: string; weight: number }[];
  investmentAmount: number;
  frequency: string;
  benchmark: string;
  startDate: Date;
  endDate: Date;
}

export interface SimulationMetrics {
  totalInvested: number;
  finalValue: number;
  totalReturn: number;
  cagr: number;
  benchmarkReturn: number;
  benchmarkCAGR: number;
  outperformance: number;
}

export interface SimulationResult {
  portfolioData: any[];
  metrics: SimulationMetrics;
  tickers: { symbol: string; weight: number }[];
  benchmark: string;
  settings: {
    investmentAmount: number;
    frequency: string;
    period: string;
  };
}
