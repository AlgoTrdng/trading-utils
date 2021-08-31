import fetch from 'node-fetch'
import { createHmac } from 'crypto'

import fetchData from './lib/api'
import sendSignal from './lib/send-signal'
import { SignalProviders } from './types/types'

type Position = {
  _id: string
  side: 'long' | 'short'
  market: string
  entryPrice: number
  entryTime: Date
  state: 'open' | 'closed'
  closePrice?: number
  closeTime?: Date
  pnl?: number
}

const getOpenedPositions = (positions: Position[]) => {
  const opened = positions.filter(({ state }) => state === 'open')

  return opened
}

type secrets = {
  SIGNALS_SECRET: string
  API_SECRET: string
}

type OpenedPositions = {
  [market: string]: Position | undefined
}

class Positions {
  API_SECRET: string

  SIGNALS_SECRET: string

  positionsUrl: string

  strategy: string

  signalProviders: SignalProviders

  futures: boolean

  private _opened: OpenedPositions = {}

  constructor({ SIGNALS_SECRET, API_SECRET }: secrets, positionsUrl: string, strategy: string, signalProviders: SignalProviders, futures = false) {
    this.API_SECRET = API_SECRET
    this.SIGNALS_SECRET = SIGNALS_SECRET
    this.positionsUrl = `${positionsUrl}/api/v1/positions`

    this.strategy = strategy
    this.signalProviders = signalProviders
    this.futures = futures
  }

  get opened() {
    return (market: string): Position | undefined => this._opened[market]
  }

  async init() {
    const res = await fetch(`${this.positionsUrl}?signalProviderId=${this.strategy}`)
    const data = await res.json()

    if (!res.ok) {
      throw data
    }

    const { data: _data } = data

    const opened = getOpenedPositions(_data)

    opened.forEach((position) => {
      this._opened[position.market] = position
    })
  }

  async enter(side: 'long' | 'short', baseAsset: string, quoteAsset: string, entryPrice: number) {
    const market = `${baseAsset}${quoteAsset}`

    const body = JSON.stringify({
      signalProviderId: this.strategy,
      side,
      market,
      entryPrice,
    })

    const apiAuth = this.createSignature(this.API_SECRET)

    const position = await fetchData(`${this.positionsUrl}/open`, {
      body,
      signature: apiAuth.signature,
      ts: apiAuth.ts,
      method: 'POST',
    })

    if (position?.data?._id) {
      const { _id } = position.data

      const signalsAuth = this.createSignature(this.SIGNALS_SECRET)

      await sendSignal('open', {
        signalProviders: this.signalProviders,
        strategy: this.strategy,
        positionId: _id,
        futures: this.futures,
        baseAsset,
        quoteAsset,
        side,
      }, { signature: signalsAuth.signature, ts: signalsAuth.ts })

      this._opened[market] = position.data
      return position.data
    }

    return undefined
  }

  async close(baseAsset: string, quoteAsset: string, closePrice: number) {
    const market = `${baseAsset}${quoteAsset}`
    const openedPosition = this._opened[market]

    if (!openedPosition) {
      return undefined
    }

    const { _id: positionId, side } = openedPosition

    const body = JSON.stringify({
      signalProviderId: this.strategy,
      positionId,
      closePrice,
    })

    const apiAuth = this.createSignature(this.API_SECRET)

    const position = await fetchData(`${this.positionsUrl}/close`, {
      body,
      signature: apiAuth.signature,
      ts: apiAuth.ts,
      method: 'POST',
    })

    if (position?.data?._id) {
      const signalsAuth = this.createSignature(this.SIGNALS_SECRET)

      await sendSignal('close', {
        signalProviders: this.signalProviders,
        strategy: this.strategy,
        futures: this.futures,
        positionId,
        baseAsset,
        quoteAsset,
        side,
      }, { signature: signalsAuth.signature, ts: signalsAuth.ts })

      this._opened[market] = undefined
      return position.data
    }

    return undefined
  }

  // eslint-disable-next-line class-methods-use-this
  createSignature(key: string) {
    const ts = `${new Date().getTime()}`
    const signature = createHmac('sha256', key).update(ts).digest('hex')

    return {
      signature,
      ts,
    }
  }
}

export default Positions
