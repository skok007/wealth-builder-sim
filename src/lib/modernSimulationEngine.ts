
import { SimulationParams, SimulationResult, SimulationDataPoint } from './types';

export class ModernSimulationEngine {
  public runSimulation(params: SimulationParams): SimulationResult {
    console.log('Running modern simulation with params:', params);
    
    const portfolioData: SimulationDataPoint[] = [];
    const monthsInSimulation = params.simulationYears * 12;
    
    let cumulativeInvestment = params.initialInvestment;
    let portfolioValue = params.initialInvestment;
    
    // Initialize ticker holdings in dollars
    const tickerHoldings: { [symbol: string]: number } = {};
    params.tickers.forEach(ticker => {
      tickerHoldings[ticker.symbol] = params.initialInvestment * (ticker.weight / 100);
    });
    
    for (let month = 0; month <= monthsInSimulation; month++) {
      const year = month / 12;
      const date = new Date();
      date.setFullYear(date.getFullYear() + year);
      
      // Add recurring investment
      if (month > 0) {
        if (params.contributionFrequency === 'monthly' || 
            (params.contributionFrequency === 'yearly' && month % 12 === 0)) {
          cumulativeInvestment += params.recurringInvestment;
          
          // Distribute new investment according to weights
          params.tickers.forEach(ticker => {
            const newInvestment = params.recurringInvestment * (ticker.weight / 100);
            tickerHoldings[ticker.symbol] += newInvestment;
          });
        }
      }
      
      // Calculate portfolio growth
      portfolioValue = 0;
      const tickerValues: { [symbol: string]: number } = {};
      const realTickerValues: { [symbol: string]: number } = {};
      
      params.tickers.forEach(ticker => {
        // Apply compounding growth to this ticker's holdings
        const monthlyReturn = ticker.expectedReturn / 100 / 12;
        if (month > 0) {
          tickerHoldings[ticker.symbol] *= (1 + monthlyReturn);
        }
        
        const tickerValue = tickerHoldings[ticker.symbol];
        tickerValues[ticker.symbol] = tickerValue;
        portfolioValue += tickerValue;
      });
      
      // Calculate inflation factor
      const inflationFactor = Math.pow(1 + params.inflationRate / 100, year);
      const realPortfolioValue = portfolioValue / inflationFactor;
      const realCumulativeInvestment = cumulativeInvestment / inflationFactor;
      
      // Calculate real ticker values
      params.tickers.forEach(ticker => {
        realTickerValues[ticker.symbol] = tickerValues[ticker.symbol] / inflationFactor;
      });
      
      portfolioData.push({
        year,
        date,
        totalPortfolioValue: portfolioValue,
        realPortfolioValue,
        cumulativeInvestment,
        realCumulativeInvestment,
        tickerValues,
        realTickerValues,
        inflationFactor
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
}
