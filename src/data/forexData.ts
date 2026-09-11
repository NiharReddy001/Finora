export interface ForexQuote {
  symbol: string;
  price: string;
  change: string;
  percent: string;
  trend: 'up' | 'down';
}

export const FOREX_QUOTES: ForexQuote[] = [
  { symbol: 'EUR/USD', price: '1.0842', change: '+0.0019', percent: '+0.18%', trend: 'up' },
  { symbol: 'GBP/USD', price: '1.2934', change: '+0.0031', percent: '+0.24%', trend: 'up' },
  { symbol: 'USD/JPY', price: '147.62', change: '-0.46', percent: '-0.31%', trend: 'down' },
  { symbol: 'USD/CHF', price: '0.8815', change: '-0.0013', percent: '-0.15%', trend: 'down' },
  { symbol: 'AUD/USD', price: '0.6587', change: '+0.0006', percent: '+0.09%', trend: 'up' },
  { symbol: 'USD/CAD', price: '1.3540', change: '-0.0011', percent: '-0.08%', trend: 'down' },
  { symbol: 'NZD/USD', price: '0.5982', change: '+0.0019', percent: '+0.32%', trend: 'up' },
  { symbol: 'EUR/GBP', price: '0.8382', change: '-0.0005', percent: '-0.06%', trend: 'down' },
];
