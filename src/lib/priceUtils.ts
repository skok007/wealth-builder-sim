
import { PriceData } from './yahooFinanceAPI';

export const findClosestPrice = (prices: PriceData[], targetDate: Date): number => {
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
};
