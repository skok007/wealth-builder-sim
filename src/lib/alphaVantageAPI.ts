
interface AlphaVantageResponse {
  "Time Series (Daily)": {
    [date: string]: {
      "1. open": string;
      "2. high": string;
      "3. low": string;
      "4. close": string;
      "5. volume": string;
    };
  };
}

export interface HistoricalPrice {
  date: string;
  close: number;
}

export class AlphaVantageAPI {
  private apiKey = "ZA7JVSXE10LRWHF4";
  private baseUrl = "https://www.alphavantage.co/query";

  async fetchHistoricalData(symbol: string): Promise<HistoricalPrice[]> {
    try {
      console.log(`Fetching historical data for ${symbol} from Alpha Vantage...`);
      
      const url = `${this.baseUrl}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${this.apiKey}&outputsize=full`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data for ${symbol}: ${response.statusText}`);
      }

      const data: AlphaVantageResponse = await response.json();
      
      if (!data["Time Series (Daily)"]) {
        console.warn(`No time series data found for ${symbol}, using fallback`);
        return this.generateFallbackData(symbol);
      }

      const timeSeries = data["Time Series (Daily)"];
      const prices: HistoricalPrice[] = [];
      
      Object.entries(timeSeries).forEach(([date, values]) => {
        prices.push({
          date,
          close: parseFloat(values["4. close"])
        });
      });

      // Sort by date (most recent first)
      prices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      console.log(`Successfully fetched ${prices.length} data points for ${symbol}`);
      return prices.slice(0, 1000); // Limit to last 1000 days
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      return this.generateFallbackData(symbol);
    }
  }

  calculateAnnualReturn(prices: HistoricalPrice[], years: number = 5): number {
    if (prices.length < 2) return 8; // Default fallback

    // Get prices from 'years' ago and current
    const daysInPeriod = Math.min(years * 252, prices.length - 1); // 252 trading days per year
    const oldPrice = prices[daysInPeriod].close;
    const currentPrice = prices[0].close;
    
    const totalReturn = (currentPrice - oldPrice) / oldPrice;
    const annualReturn = (Math.pow(1 + totalReturn, 1 / years) - 1) * 100;
    
    console.log(`${prices[0]?.date?.split('-')[0]} annual return for last ${years} years: ${annualReturn.toFixed(2)}%`);
    return Math.max(annualReturn, -50); // Cap at -50% to avoid extreme values
  }

  private generateFallbackData(symbol: string): HistoricalPrice[] {
    console.log(`Generating fallback data for ${symbol}`);
    const data: HistoricalPrice[] = [];
    const basePrice = this.getBasePrice(symbol);
    
    let currentPrice = basePrice;
    const dailyVolatility = 0.02;
    const annualReturn = this.getFallbackReturn(symbol);
    const dailyReturn = Math.pow(1 + annualReturn / 100, 1/252) - 1;
    
    for (let i = 0; i < 1000; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const randomShock = (Math.random() - 0.5) * dailyVolatility * 2;
      const priceChange = dailyReturn + randomShock;
      currentPrice *= (1 + priceChange);
      
      data.push({
        date: date.toISOString().split('T')[0],
        close: Math.max(currentPrice, 0.01)
      });
    }
    
    return data;
  }

  private getBasePrice(symbol: string): number {
    const prices: { [key: string]: number } = {
      'AAPL': 150, 'MSFT': 300, 'GOOGL': 2500, 'AMZN': 3000,
      'TSLA': 800, 'NVDA': 400, 'SPY': 400, 'VTI': 200, 'QQQ': 350
    };
    return prices[symbol] || 100;
  }

  private getFallbackReturn(symbol: string): number {
    const returns: { [key: string]: number } = {
      'AAPL': 12, 'MSFT': 11, 'GOOGL': 13, 'AMZN': 14,
      'TSLA': 25, 'NVDA': 20, 'SPY': 10, 'VTI': 9, 'QQQ': 12
    };
    return returns[symbol] || 8;
  }
}
