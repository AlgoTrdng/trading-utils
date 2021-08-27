const fetch = require('./api')

const SIGNALS_API_URL = 'https://algo-trading-signals.vercel.app'

/**
 * @typedef {object} signalParams
 * @property {string[]} signalProviders
 * @property {string} strategy
 * @property {string} baseAsset
 * @property {string} quoteAsset
 * @property {'long' | 'short'} side
 * @property {string} positionId
 * @property {boolean} futures
 */

/**
 * @param {'open' | 'close'} type
 * @param {signalParams} params
 * @param {{ signature: string; ts: string }}
 */
const sendSignal = async (type, params, { signature, ts }) => {
  const url = `${SIGNALS_API_URL}/api/v1/signal-${type}`

  await fetch(url, {
    method: 'POST',
    body: JSON.stringify(params),
    signature,
    ts,
  })
}

module.exports = sendSignal
