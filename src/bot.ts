import Binance, { StreamNames } from 'binance-api-nodejs'

type CandlestickData = {
  o: number
  h: number
  l: number
  c: number
  baseVolume: number
  quoteVolume: number
  openTime: number
  closeTime: number
}

type CallbackPayload<S> = {
  state: S
  market: string
  timeframe: string
  currentCandlestickData: CandlestickData
  prevCandlestickData: CandlestickData
}

// eslint-disable-next-line no-unused-vars
type UpdateCallback<S> = (payload: CallbackPayload<S>) => void

/**
 * Bot callbacks
 */
type Callbacks<S> = {
  // eslint-disable-next-line no-unused-vars
  onTick?: UpdateCallback<S>
  // eslint-disable-next-line no-unused-vars
  onNewCandle?: UpdateCallback<S>
}

/**
 * Previous candlestick data for each stream
 */
type MarketsData = {
  [stream: string]: CandlestickData
}

/**
 * Individual states for each market
 */
export type States<S> = {
  [market: string]: S
}

class Bot<S> {
  watchedMarkets: StreamNames[]

  binance: Binance

  callbacks: Callbacks<S> = {}

  candlesticksData: MarketsData = {}

  states: States<S>

  defaultState: S

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
  watchMarkets(callbacks?: Callbacks<S>) {
    if (callbacks) {
      const { onTick, onNewCandle } = callbacks

      this.callbacks.onTick = onTick
      this.callbacks.onNewCandle = onNewCandle
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

  onTick(onTickCb: UpdateCallback<S>) {
    this.callbacks.onTick = onTickCb
  }

  onNewCandle(onNewcandleCb: UpdateCallback<S>) {
    this.callbacks.onNewCandle = onNewcandleCb
  }
}

export default Bot
