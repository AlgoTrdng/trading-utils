import Binance, { StreamNames } from 'binance-api-nodejs'

/**
 * Candlestick data passed as payload
 */
export type CandlestickData = {
  o: number
  h: number
  l: number
  c: number
  baseVolume: number
  quoteVolume: number
  openTime: number
  closeTime: number
}

/**
 * onTick, onNewCandle payload
 */
export type CallbackPayload<S> = {
  state: S
  market: string
  timeframe: string
  currentCandlestickData: CandlestickData
  prevCandlestickData: CandlestickData
}

/**
 * onTick, onNewCandle callback
 */
// eslint-disable-next-line no-unused-vars
export type UpdateCallback<S> = (payload: CallbackPayload<S>) => void

/**
 * onInit callback payload
 */
export type OnInitPayload<S> = {
  state: S
  market: string
  timeframe: string
}

/**
 * onInit callback
 */
// eslint-disable-next-line no-unused-vars
export type OnInitCallback<S> = (payload: OnInitPayload<S>) => void

/**
 * Bot callbacks
 */
export type Callbacks<S> = {
  onTick?: UpdateCallback<S>
  onNewCandle?: UpdateCallback<S>
  // eslint-disable-next-line no-unused-vars
  onInit?: OnInitCallback<S>
}

/**
 * Previous candlestick data for each stream
 */
export type MarketsData = {
  [stream: string]: CandlestickData
}

/**
 * Individual states for each market
 */
export type States<S> = {
  [market: string]: S
}

class Bot<S extends {}> {
  watchedMarkets: StreamNames[]

  binance: Binance

  private callbacks: Callbacks<S> = {}

  private candlesticksData: MarketsData = {}

  private states: States<S>

  private defaultState: S

  constructor(watchedMarkets: StreamNames[], state: S) {
    this.defaultState = state
    this.watchedMarkets = watchedMarkets
    this.states = watchedMarkets.reduce<States<S>>((_states, [market]) => {
      // eslint-disable-next-line no-param-reassign
      _states[market] = _states[market] || { ...state }
      return _states
    }, {})

    this.binance = new Binance()
  }

  /**
   * Subscribe to markets
   */
  async watchMarkets(callbacks?: Callbacks<S>) {
    if (callbacks) {
      const { onTick, onNewCandle, onInit } = callbacks

      if (typeof onInit === 'function') {
        this.callbacks.onInit = onInit
      }

      if (typeof onTick === 'function') {
        this.callbacks.onTick = onTick
      }

      if (typeof onNewCandle === 'function') {
        this.callbacks.onNewCandle = onNewCandle
      }
    }

    if (typeof this.callbacks.onInit === 'function') {
      const { onInit } = this.callbacks

      for (let i = 0; i < this.watchedMarkets.length; i += 1) {
        const [market, timeframe] = this.watchedMarkets[i]
        const state = this.states[market]

        // eslint-disable-next-line no-await-in-loop
        await onInit({ market, timeframe, state })
      }
    }

    this.binance.spotWebsockets.candlesticks(this.watchedMarkets, ({ stream, data }) => {
      const {
        k: {
          s, i, o: oStr, h: hStr, l: lStr, c: cStr, v: baseVolumeStr, q: quoteVolumeStr, T, t,
        },
      } = data

      const currentCandlestickData: CandlestickData = {
        o: +oStr,
        h: +hStr,
        l: +lStr,
        c: +cStr,
        baseVolume: +baseVolumeStr,
        quoteVolume: +quoteVolumeStr,
        openTime: t,
        closeTime: T,
      }

      const prevCandlestickData = this.candlesticksData[stream]
      const state = this.states[s] || this.defaultState

      const payload: CallbackPayload<S> = {
        state,
        market: s,
        timeframe: i,
        currentCandlestickData,
        prevCandlestickData,
      }

      if (prevCandlestickData && typeof this.callbacks.onTick === 'function') {
        this.callbacks.onTick(payload)
      }

      if (
        prevCandlestickData
        && prevCandlestickData.closeTime !== currentCandlestickData.closeTime
        && typeof this.callbacks.onNewCandle === 'function'
      ) {
        this.callbacks.onNewCandle(payload)
      }

      this.candlesticksData[stream] = currentCandlestickData
    })
  }

  onInit(onInitCb: OnInitCallback<S>) {
    this.callbacks.onInit = onInitCb
  }

  onTick(onTickCb: UpdateCallback<S>) {
    this.callbacks.onTick = onTickCb
  }

  onNewCandle(onNewcandleCb: UpdateCallback<S>) {
    this.callbacks.onNewCandle = onNewcandleCb
  }
}

export default Bot
