
import { YahooFinanceAPI, PriceData } from './yahooFinanceAPI';
import { SimulationParams, SimulationResult } from './types';
import { getInvestmentDates } from './dateUtils';
import { findClosestPrice } from './priceUtils';

export class SimulationEngine {
  private yahooAPI = new YahooFinanceAPI();

  private async fetchStockData(symbol: string, startDate: Date, endDate: Date): Promise<PriceData[]> {
    const period1 = Math.floor(startDate.getTime() / 1000);
    const period2 = Math.floor(endDate.getTime() / 1000);
    
    return await this.yahooAPI.fetchStockData(symbol, period1, period2);
  }

  public async runSimulation(params: SimulationParams): Promise<SimulationResult> {
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
    const investmentDates = getInvestmentDates(params.startDate, params.endDate, params.frequency);
    console.log('Investment dates:', investmentDates);
    
    // Get all trading days from benchmark data
    const benchmarkData = priceDataMap[params.benchmark];
    const portfolioData: any[] = [];
    
    let totalInvested = 0;
    const holdings: { [symbol: string]: number } = {};
    
    // Initialize holdings
    params.tickers.forEach(ticker => {
      holdings[ticker.symbol] = 0;
    });
    
    // Process each trading day
    for (const dataPoint of benchmarkData) {
      const currentDate = dataPoint.date;
      
      // Check if we should invest on this date
      const shouldInvest = investmentDates.some(investDate => 
        Math.abs(investDate.getTime() - currentDate.getTime()) < 24 * 60 * 60 * 1000
      );
      
      if (shouldInvest) {
        totalInvested += params.investmentAmount;
        
        // Buy shares for each ticker based on weight
        params.tickers.forEach(ticker => {
          const investmentForTicker = params.investmentAmount * (ticker.weight / 100);
          const priceAtDate = findClosestPrice(priceDataMap[ticker.symbol], currentDate);
          const sharesBought = investmentForTicker / priceAtDate;
          holdings[ticker.symbol] += sharesBought;
          console.log(`Bought ${sharesBought} shares of ${ticker.symbol} at $${priceAtDate}`);
        });
      }
      
      // Calculate current portfolio value
      let portfolioValue = 0;
      const tickerValues: { [symbol: string]: number } = {};
      
      params.tickers.forEach(ticker => {
        const currentPrice = findClosestPrice(priceDataMap[ticker.symbol], currentDate);
        const tickerValue = holdings[ticker.symbol] * currentPrice;
        tickerValues[ticker.symbol] = tickerValue;
        portfolioValue += tickerValue;
      });
      
      // Calculate benchmark value (if we had invested all money in benchmark)
      const startBenchmarkPrice = benchmarkData[0].close;
      const currentInvestedAmount = totalInvested;
      const benchmarkValue = currentInvestedAmount > 0 ? 
        (dataPoint.close / startBenchmarkPrice) * currentInvestedAmount : 0;
      
      const growth = portfolioValue - currentInvestedAmount;
      
      portfolioData.push({
        date: currentDate,
        portfolioValue,
        totalInvested: currentInvestedAmount,
        growth: Math.max(0, growth),
        benchmarkValue,
        ...tickerValues
      });
    }
    
    // Calculate metrics
    const finalPortfolioValue = portfolioData[portfolioData.length - 1].portfolioValue;
    const finalBenchmarkValue = portfolioData[portfolioData.length - 1].benchmarkValue;
    const finalInvested = portfolioData[portfolioData.length - 1].totalInvested;
    
    const totalReturn = finalInvested > 0 ? ((finalPortfolioValue - finalInvested) / finalInvested) * 100 : 0;
    const benchmarkReturn = finalInvested > 0 ? ((finalBenchmarkValue - finalInvested) / finalInvested) * 100 : 0;
    
    const years = (params.endDate.getTime() - params.startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    const cagr = finalInvested > 0 ? (Math.pow(finalPortfolioValue / finalInvested, 1/years) - 1) * 100 : 0;
    const benchmarkCAGR = finalInvested > 0 ? (Math.pow(finalBenchmarkValue / finalInvested, 1/years) - 1) * 100 : 0;
    
    return {
      portfolioData,
      metrics: {
        totalInvested: finalInvested,
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
