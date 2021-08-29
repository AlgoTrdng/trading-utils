import fetch from './api'

const SIGNALS_API_URL = 'https://algo-trading-signals.vercel.app'

export type SignalParams = {
  signalProviders: ['zignaly'?, 'compendium'?]
  strategy: string
  baseAsset: string
  quoteAsset: string
  side: 'long' | 'short'
  positionId: string
  futures: boolean
}

const sendSignal = async (type: 'open' | 'close', params: SignalParams, { signature, ts }: { signature: string; ts: string }) => {
  const url = `${SIGNALS_API_URL}/api/v1/signal-${type}`

  await fetch(url, {
    method: 'POST',
    body: JSON.stringify(params),
    signature,
    ts,
  })
}

export default sendSignal
