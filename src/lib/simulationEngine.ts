
import { YahooFinanceAPI, PriceData } from './yahooFinanceAPI';

interface SimulationParams {
  tickers: { symbol: string; weight: number }[];
  investmentAmount: number;
  frequency: string;
  benchmark: string;
  startDate: Date;
  endDate: Date;
}

export class SimulationEngine {
  private yahooAPI = new YahooFinanceAPI();

  private async fetchStockData(symbol: string, startDate: Date, endDate: Date): Promise<PriceData[]> {
    const period1 = Math.floor(startDate.getTime() / 1000);
    const period2 = Math.floor(endDate.getTime() / 1000);
    
    return await this.yahooAPI.fetchStockData(symbol, period1, period2);
  }

  private getInvestmentDates(startDate: Date, endDate: Date, frequency: string): Date[] {
    const dates: Date[] = [];
    let current = new Date(startDate);
    
    while (current <= endDate) {
      dates.push(new Date(current));
      
      switch (frequency) {
        case 'daily':
          current.setDate(current.getDate() + 1);
          break;
        case 'weekly':
          current.setDate(current.getDate() + 7);
          break;
        case 'monthly':
          current.setMonth(current.getMonth() + 1);
          break;
        case 'yearly':
          current.setFullYear(current.getFullYear() + 1);
          break;
      }
    }
    
    return dates;
  }

  private findClosestPrice(prices: PriceData[], targetDate: Date): number {
    const target = targetDate.getTime();
    let closest = prices[0];
    let minDiff = Math.abs(prices[0].date.getTime() - target);
    
    for (const price of prices) {
      const diff = Math.abs(price.date.getTime() - target);
      if (diff < minDiff) {
        minDiff = diff;
        closest = price;
      }
    }
    
    return closest.close;
  }

  public async runSimulation(params: SimulationParams) {
    console.log('Running simulation with params:', params);
    
    // Fetch real price data for all tickers including benchmark
    const allSymbols = [...params.tickers.map(t => t.symbol), params.benchmark];
    const priceDataMap: { [symbol: string]: PriceData[] } = {};
    
    try {
      for (const symbol of allSymbols) {
        priceDataMap[symbol] = await this.fetchStockData(symbol, params.startDate, params.endDate);
      }
    } catch (error) {
      console.error('Error fetching price data:', error);
      throw error;
    }
    
    // Get investment dates
    const investmentDates = this.getInvestmentDates(params.startDate, params.endDate, params.frequency);
    
    // Calculate portfolio value over time
    const portfolioData: any[] = [];
    let totalInvested = 0;
    const holdings: { [symbol: string]: number } = {};
    
    // Initialize holdings
    params.tickers.forEach(ticker => {
      holdings[ticker.symbol] = 0;
    });
    
    // Process each investment date
    for (const investDate of investmentDates) {
      totalInvested += params.investmentAmount;
      
      // Buy shares for each ticker based on weight
      params.tickers.forEach(ticker => {
        const investmentForTicker = params.investmentAmount * (ticker.weight / 100);
        const priceAtDate = this.findClosestPrice(priceDataMap[ticker.symbol], investDate);
        const sharesBought = investmentForTicker / priceAtDate;
        holdings[ticker.symbol] += sharesBought;
      });
    }
    
    // Calculate portfolio value for each day
    const benchmarkData = priceDataMap[params.benchmark];
    const startBenchmarkPrice = benchmarkData[0].close;
    
    benchmarkData.forEach(benchmarkPoint => {
      let portfolioValue = 0;
      const tickerValues: { [symbol: string]: number } = {};
      
      // Calculate cumulative values for stacked areas
      let cumulativeValue = 0;
      params.tickers.forEach(ticker => {
        const currentPrice = this.findClosestPrice(priceDataMap[ticker.symbol], benchmarkPoint.date);
        const tickerValue = holdings[ticker.symbol] * currentPrice;
        cumulativeValue += tickerValue;
        tickerValues[ticker.symbol] = cumulativeValue; // Cumulative for stacking
        portfolioValue += tickerValue;
      });
      
      const benchmarkValue = (benchmarkPoint.close / startBenchmarkPrice) * totalInvested;
      
      const currentInvested = totalInvested * (benchmarkPoint.date <= investmentDates[investmentDates.length - 1] ? 
        investmentDates.filter(d => d <= benchmarkPoint.date).length / investmentDates.length : 1);
      
      portfolioData.push({
        date: benchmarkPoint.date,
        portfolioValue,
        benchmarkValue,
        totalInvested: currentInvested,
        ...tickerValues
      });
    });
    
    // Calculate metrics
    const finalPortfolioValue = portfolioData[portfolioData.length - 1].portfolioValue;
    const finalBenchmarkValue = portfolioData[portfolioData.length - 1].benchmarkValue;
    const totalReturn = ((finalPortfolioValue - totalInvested) / totalInvested) * 100;
    const benchmarkReturn = ((finalBenchmarkValue - totalInvested) / totalInvested) * 100;
    
    const years = (params.endDate.getTime() - params.startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    const cagr = (Math.pow(finalPortfolioValue / totalInvested, 1/years) - 1) * 100;
    const benchmarkCAGR = (Math.pow(finalBenchmarkValue / totalInvested, 1/years) - 1) * 100;
    
    return {
      portfolioData,
      metrics: {
        totalInvested,
        finalValue: finalPortfolioValue,
        totalReturn,
        cagr,
        benchmarkReturn,
        benchmarkCAGR,
        outperformance: totalReturn - benchmarkReturn
      },
      tickers: params.tickers,
      benchmark: params.benchmark,
      settings: {
        investmentAmount: params.investmentAmount,
        frequency: params.frequency,
        period: `${Math.round(years * 10) / 10} years`
      }
    };
  }
}
