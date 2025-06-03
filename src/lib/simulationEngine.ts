
interface SimulationParams {
  tickers: { symbol: string; weight: number }[];
  investmentAmount: number;
  frequency: string;
  benchmark: string;
  startDate: Date;
  endDate: Date;
}

interface PriceData {
  date: Date;
  close: number;
}

export class SimulationEngine {
  private async fetchStockData(symbol: string, startDate: Date, endDate: Date): Promise<PriceData[]> {
    // In a real app, this would fetch from Yahoo Finance API
    // For demo purposes, we'll generate realistic simulated data
    return this.generateSimulatedPriceData(symbol, startDate, endDate);
  }

  private generateSimulatedPriceData(symbol: string, startDate: Date, endDate: Date): PriceData[] {
    const data: PriceData[] = [];
    const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Base price and volatility based on symbol
    const basePrice = this.getBasePrice(symbol);
    const volatility = this.getVolatility(symbol);
    const annualReturn = this.getExpectedReturn(symbol);
    
    let currentPrice = basePrice;
    const dailyReturn = Math.pow(1 + annualReturn, 1/252) - 1; // Convert annual to daily
    
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      
      // Skip weekends for more realistic trading days
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Generate price movement with trend + noise
      const randomShock = (Math.random() - 0.5) * volatility * 2;
      const priceChange = dailyReturn + randomShock;
      currentPrice *= (1 + priceChange);
      
      data.push({
        date,
        close: Math.max(currentPrice, 0.01) // Prevent negative prices
      });
    }
    
    return data;
  }

  private getBasePrice(symbol: string): number {
    const prices: { [key: string]: number } = {
      'AAPL': 150,
      'MSFT': 300,
      'GOOGL': 2500,
      'AMZN': 3000,
      'TSLA': 800,
      'NVDA': 400,
      'SPY': 400,
      'VTI': 200,
      'QQQ': 350
    };
    return prices[symbol] || 100;
  }

  private getVolatility(symbol: string): number {
    const volatilities: { [key: string]: number } = {
      'AAPL': 0.02,
      'MSFT': 0.018,
      'GOOGL': 0.025,
      'AMZN': 0.03,
      'TSLA': 0.05,
      'NVDA': 0.04,
      'SPY': 0.015,
      'VTI': 0.014,
      'QQQ': 0.022
    };
    return volatilities[symbol] || 0.02;
  }

  private getExpectedReturn(symbol: string): number {
    const returns: { [key: string]: number } = {
      'AAPL': 0.12,
      'MSFT': 0.11,
      'GOOGL': 0.10,
      'AMZN': 0.13,
      'TSLA': 0.15,
      'NVDA': 0.20,
      'SPY': 0.10,
      'VTI': 0.09,
      'QQQ': 0.12
    };
    return returns[symbol] || 0.08;
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
    
    // Fetch price data for all tickers including benchmark
    const allSymbols = [...params.tickers.map(t => t.symbol), params.benchmark];
    const priceDataMap: { [symbol: string]: PriceData[] } = {};
    
    for (const symbol of allSymbols) {
      priceDataMap[symbol] = await this.fetchStockData(symbol, params.startDate, params.endDate);
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
      
      params.tickers.forEach(ticker => {
        const currentPrice = this.findClosestPrice(priceDataMap[ticker.symbol], benchmarkPoint.date);
        const tickerValue = holdings[ticker.symbol] * currentPrice;
        tickerValues[ticker.symbol] = tickerValue;
        portfolioValue += tickerValue;
      });
      
      const benchmarkValue = (benchmarkPoint.close / startBenchmarkPrice) * totalInvested;
      
      portfolioData.push({
        date: benchmarkPoint.date,
        portfolioValue,
        benchmarkValue,
        totalInvested: totalInvested * (benchmarkPoint.date <= investmentDates[investmentDates.length - 1] ? 
          investmentDates.filter(d => d <= benchmarkPoint.date).length / investmentDates.length : 1),
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
