import { SignalProviders } from '../../types/types'
import fetch from '../../utils/api'

export type SignalParams = {
  signalProviders: SignalProviders
  strategy: string
  baseAsset: string
  quoteAsset: string
  side: 'long' | 'short'
  positionId: string
  futures: boolean
}

const sendSignal = async (
  url: string, type: 'open' | 'close', params: SignalParams, { signature, ts }: { signature: string; ts: string },
) => {
  await fetch(`${url}/signal/${type}`, {
    method: 'POST',
    body: JSON.stringify(params),
    signature,
    ts,
  })
}

export default sendSignal
