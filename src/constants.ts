// eslint-disable-next-line import/prefer-default-export
export const createApiUrls = (devUrl?: string) => ({
  production: 'https://algo-trading-api.herokuapp.com/api/v1',
  backtest: 'https://algo-trading-api-backtest.herokuapp.com/api/v1',
  test: devUrl || 'http://localhost:5050/api/v1',
})
