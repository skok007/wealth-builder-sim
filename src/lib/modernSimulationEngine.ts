import { SimulationParams, SimulationResult, SimulationDataPoint } from './types';
import { AlphaVantageAPI, HistoricalPrice } from './alphaVantageAPI';
import { InflationAPI, InflationData } from './inflationAPI';

export class ModernSimulationEngine {
  private alphaVantage = new AlphaVantageAPI();
  private inflationAPI = new InflationAPI();

  public async runSimulation(params: SimulationParams, useRealInflation: boolean = false): Promise<SimulationResult> {
    console.log('Running historical market simulation with real data and forecast:', params);
    
    // Calculate periods: 2/3 historical, 1/3 forecast
    const historicalYears = Math.floor(params.simulationYears * (2/3));
    const forecastYears = params.simulationYears - historicalYears;
    
    console.log(`Historical period: ${historicalYears} years, Forecast period: ${forecastYears} years`);
    
    // Calculate date ranges
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - historicalYears);
    const forecastEndDate = new Date();
    forecastEndDate.setFullYear(forecastEndDate.getFullYear() + forecastYears);
    
    console.log(`Historical: ${startDate.toDateString()} to ${endDate.toDateString()}`);
    console.log(`Forecast: ${endDate.toDateString()} to ${forecastEndDate.toDateString()}`);
    
    // Fetch real historical market data for all tickers
    const tickerHistoricalData = await this.fetchHistoricalMarketData(params.tickers, historicalYears);
    
    // Fetch real inflation data if requested
    let inflationData: InflationData[] = [];
    if (useRealInflation) {
      inflationData = await this.inflationAPI.fetchHistoricalInflation(historicalYears + 1);
    }
    
    const portfolioData: SimulationDataPoint[] = [];
    const monthsInSimulation = params.simulationYears * 12;
    const historicalMonths = historicalYears * 12;
    
    let cumulativeInvestment = params.initialInvestment;
    
    // Initialize ticker holdings in shares based on initial prices
    const tickerShares: { [symbol: string]: number } = {};
    params.tickers.forEach(ticker => {
      const initialPrice = tickerHistoricalData[ticker.symbol]?.[0]?.close || 100;
      const initialInvestment = params.initialInvestment * (ticker.weight / 100);
      tickerShares[ticker.symbol] = initialInvestment / initialPrice;
    });
    
    // Generate data points
    for (let month = 0; month <= monthsInSimulation; month++) {
      const isHistorical = month <= historicalMonths;
      const currentDate = new Date(startDate);
      
      if (isHistorical) {
        currentDate.setMonth(currentDate.getMonth() + month);
      } else {
        // Forecast period starts from endDate
        const forecastMonth = month - historicalMonths;
        currentDate.setTime(endDate.getTime());
        currentDate.setMonth(currentDate.getMonth() + forecastMonth);
      }
      
      // Add recurring investment
      if (month > 0) {
        if (params.contributionFrequency === 'monthly' || 
            (params.contributionFrequency === 'yearly' && month % 12 === 0)) {
          cumulativeInvestment += params.recurringInvestment;
          
          // Buy more shares with new investment
          params.tickers.forEach(ticker => {
            let currentPrice;
            if (isHistorical) {
              currentPrice = this.getPriceAtDate(tickerHistoricalData[ticker.symbol], currentDate);
            } else {
              // For forecast, use expected returns to project prices
              const lastHistoricalPrice = this.getPriceAtDate(tickerHistoricalData[ticker.symbol], endDate);
              const forecastMonths = month - historicalMonths;
              const monthlyReturn = ticker.expectedReturn / 100 / 12;
              currentPrice = lastHistoricalPrice * Math.pow(1 + monthlyReturn, forecastMonths);
            }
            
            const newInvestment = params.recurringInvestment * (ticker.weight / 100);
            const additionalShares = newInvestment / currentPrice;
            tickerShares[ticker.symbol] += additionalShares;
          });
        }
      }
      
      // Calculate portfolio value
      let portfolioValue = 0;
      const tickerValues: { [symbol: string]: number } = {};
      const realTickerValues: { [symbol: string]: number } = {};
      
      params.tickers.forEach(ticker => {
        let currentPrice;
        if (isHistorical) {
          currentPrice = this.getPriceAtDate(tickerHistoricalData[ticker.symbol], currentDate);
        } else {
          // For forecast, project prices using expected returns
          const lastHistoricalPrice = this.getPriceAtDate(tickerHistoricalData[ticker.symbol], endDate);
          const forecastMonths = month - historicalMonths;
          const monthlyReturn = ticker.expectedReturn / 100 / 12;
          currentPrice = lastHistoricalPrice * Math.pow(1 + monthlyReturn, forecastMonths);
        }
        
        const tickerValue = tickerShares[ticker.symbol] * currentPrice;
        tickerValues[ticker.symbol] = tickerValue;
        portfolioValue += tickerValue;
      });
      
      // Calculate inflation adjustment
      let inflationFactor = 1;
      let realPortfolioValue = portfolioValue;
      let realCumulativeInvestment = cumulativeInvestment;
      
      if (useRealInflation && inflationData.length > 0 && isHistorical) {
        const periodStartDate = new Date(startDate);
        const avgInflation = this.inflationAPI.getInflationForPeriod(inflationData, periodStartDate, currentDate);
        const yearsPassed = month / 12;
        inflationFactor = Math.pow(1 + avgInflation / 100, yearsPassed);
      } else {
        const yearsPassed = month / 12;
        inflationFactor = Math.pow(1 + params.inflationRate / 100, yearsPassed);
      }
      
      realPortfolioValue = portfolioValue / inflationFactor;
      realCumulativeInvestment = cumulativeInvestment / inflationFactor;
      
      // Calculate real ticker values
      params.tickers.forEach(ticker => {
        realTickerValues[ticker.symbol] = tickerValues[ticker.symbol] / inflationFactor;
      });
      
      portfolioData.push({
        year: month / 12,
        date: new Date(currentDate),
        totalPortfolioValue: portfolioValue,
        realPortfolioValue,
        cumulativeInvestment,
        realCumulativeInvestment,
        tickerValues,
        realTickerValues,
        inflationFactor,
        isHistorical
      });
    }
    
    // Calculate metrics
    const finalData = portfolioData[portfolioData.length - 1];
    const totalReturn = ((finalData.totalPortfolioValue - finalData.cumulativeInvestment) / finalData.cumulativeInvestment) * 100;
    const realTotalReturn = ((finalData.realPortfolioValue - finalData.realCumulativeInvestment) / finalData.realCumulativeInvestment) * 100;
    
    const cagr = (Math.pow(finalData.totalPortfolioValue / params.initialInvestment, 1 / params.simulationYears) - 1) * 100;
    const realCAGR = (Math.pow(finalData.realPortfolioValue / params.initialInvestment, 1 / params.simulationYears) - 1) * 100;
    
    const inflationImpact = ((finalData.totalPortfolioValue - finalData.realPortfolioValue) / finalData.totalPortfolioValue) * 100;
    
    return {
      portfolioData,
      metrics: {
        totalInvested: finalData.cumulativeInvestment,
        finalValue: finalData.totalPortfolioValue,
        realFinalValue: finalData.realPortfolioValue,
        totalReturn,
        realTotalReturn,
        cagr,
        realCAGR,
        inflationImpact
      },
      tickers: params.tickers,
      settings: {
        initialInvestment: params.initialInvestment,
        recurringInvestment: params.recurringInvestment,
        contributionFrequency: params.contributionFrequency,
        simulationYears: params.simulationYears,
        inflationRate: params.inflationRate
      }
    };
  }

  private async fetchHistoricalMarketData(
    tickers: { symbol: string; weight: number; expectedReturn: number }[], 
    years: number
  ): Promise<{ [symbol: string]: HistoricalPrice[] }> {
    const results: { [symbol: string]: HistoricalPrice[] } = {};
    
    console.log('Fetching historical market data for tickers:', tickers.map(t => t.symbol));
    
    // Fetch data for each ticker in parallel
    const promises = tickers.map(async (ticker) => {
      try {
        console.log(`Fetching ${years} years of data for ${ticker.symbol}...`);
        const historicalData = await this.alphaVantage.fetchHistoricalData(ticker.symbol, years);
        results[ticker.symbol] = historicalData;
        console.log(`${ticker.symbol}: Retrieved ${historicalData.length} data points`);
      } catch (error) {
        console.error(`Failed to fetch historical data for ${ticker.symbol}:`, error);
        // Create fallback data
        results[ticker.symbol] = [];
      }
    });
    
    await Promise.all(promises);
    
    console.log('Historical market data fetch complete');
    return results;
  }

  private getPriceAtDate(prices: HistoricalPrice[], targetDate: Date): number {
    if (!prices || prices.length === 0) {
      return 100; // Fallback price
    }

    // Find the closest price to the target date
    const targetTime = targetDate.getTime();
    let closest = prices[0];
    let closestDiff = Math.abs(new Date(closest.date).getTime() - targetTime);

    for (const price of prices) {
      const diff = Math.abs(new Date(price.date).getTime() - targetTime);
      if (diff < closestDiff) {
        closest = price;
        closestDiff = diff;
      }
    }

    return closest.close;
  }
}
