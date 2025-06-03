
export const getInvestmentDates = (startDate: Date, endDate: Date, frequency: string): Date[] => {
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
};
