import fetch from 'node-fetch'

import fetchData, { createSignature } from '../utils/api'
import sendSignal from './lib/send-signal'
import { ENVTypes, SignalProviders, Strategy } from '../types/types'
import { createApiUrls } from '../constants'

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

type OpenedPositions = {
  [market: string]: Position | undefined
}

type ConfigParams = {
  API_SECRET: string
  STRATEGY: Strategy
  ENV: ENVTypes
  SIGNAL_PROVIDERS: SignalProviders
  FUTURES: boolean
  developmentUrl?: string
}

type SendSignalParams = {
  side: 'long' | 'short'
  baseAsset: string
  quoteAsset: string
  positionId: string
}

const getOpenedPositions = (positions: Position[]) => {
  const opened = positions.filter(({ state }) => state === 'open')

  return opened
}

class Positions {
  config: ConfigParams

  API_URL: string

  private openedPositions: OpenedPositions = {}

  constructor(config: ConfigParams) {
    this.config = config

    const ENV_API_URL = createApiUrls(config.developmentUrl)
    this.API_URL = ENV_API_URL[config.ENV]
  }

  get opened() {
    return (market?: string) => {
      if (!market) return Object.values(this.openedPositions)

      return this.openedPositions[market]
    }
  }

  async init() {
    const API_URL = `${this.API_URL}/positions?signalProviderId=${this.config.STRATEGY}`

    const res = await fetch(API_URL)
    const data = await res.json()

    if (!res.ok) {
      throw data
    }

    const { data: positions } = data
    const openedPositions = getOpenedPositions(positions)

    openedPositions.forEach((position) => {
      this.openedPositions[position.market] = position
    })
  }

  async enterPosition(side: 'long' | 'short', baseAsset: string, quoteAsset: string, entryPrice: number) {
    const market = `${baseAsset}${quoteAsset}`

    const body = JSON.stringify({
      signalProviderId: this.config.STRATEGY,
      side,
      market,
      entryPrice,
    })

    const { signature, ts } = createSignature(this.config.API_SECRET)

    console.log(signature, this.config, this.config.API_SECRET)

    const API_URL = `${this.API_URL}/positions/open`
    const position = await fetchData(API_URL, {
      method: 'POST',
      body,
      signature,
      ts,
    })

    if (position?.data?._id) {
      const { market: _market } = position.data as Position

      this.openedPositions[_market] = position.data
      return position.data as Position
    }

    console.log('Error entering position')
    return undefined
  }

  async sendEnterSignal(params: SendSignalParams) {
    const {
      baseAsset, quoteAsset, side, positionId,
    } = params

    const { FUTURES, STRATEGY, SIGNAL_PROVIDERS } = this.config

    const body = {
      signalProviders: SIGNAL_PROVIDERS,
      strategy: STRATEGY,
      futures: FUTURES,
      baseAsset,
      quoteAsset,
      side,
      positionId,
    }

    await sendSignal(this.API_URL, 'open', body, createSignature(this.config.API_SECRET))
  }

  async enterPositionAndSendSignal(side: 'long' | 'short', baseAsset: string, quoteAsset: string, entryPrice: number) {
    const position = await this.enterPosition(side, baseAsset, quoteAsset, entryPrice)

    if (position) {
      await this.sendEnterSignal({
        positionId: position._id,
        side,
        baseAsset,
        quoteAsset,
      })

      return position
    }

    return undefined
  }

  async exitPosition(baseAsset: string, quoteAsset: string, closePrice: number) {
    const market = `${baseAsset}${quoteAsset}`
    const position = this.openedPositions[market]

    if (!position) {
      return undefined
    }

    const { _id } = position
    const body = JSON.stringify({
      signalProviderId: this.config.STRATEGY,
      positionId: _id,
      closePrice,
    })

    const API_URL = `${this.API_URL}/positions/close`
    const closedPosition = await fetchData(API_URL, { body, method: 'POST', ...createSignature(this.config.API_SECRET) })

    if (closedPosition?.data?._id) {
      this.openedPositions[market] = undefined
      return closedPosition.data as Position
    }

    console.log('Error closing position')
    return undefined
  }

  async sendExitSignal(params: SendSignalParams) {
    const {
      baseAsset, quoteAsset, side, positionId,
    } = params

    const { FUTURES, STRATEGY, SIGNAL_PROVIDERS } = this.config
    const body = {
      signalProviders: SIGNAL_PROVIDERS,
      strategy: STRATEGY,
      futures: FUTURES,
      baseAsset,
      quoteAsset,
      side,
      positionId,
    }

    await sendSignal(this.API_URL, 'close', body, createSignature(this.config.API_SECRET))
  }

  async exitPositionAndSendSignal(baseAsset: string, quoteAsset: string, closePrice: number) {
    const closedPosition = await this.exitPosition(baseAsset, quoteAsset, closePrice)

    if (!closedPosition) {
      return undefined
    }

    const { side, _id } = closedPosition

    await this.sendExitSignal({
      positionId: _id,
      baseAsset,
      quoteAsset,
      side,
    })

    return closedPosition
  }
}

export default Positions
