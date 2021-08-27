const fetch = require('node-fetch')
const { createHmac } = require('crypto')

const fetchData = require('./lib/api')
const sendSignal = require('./lib/send-signal')

const getOpenedPositions = (positions) => {
  const opened = positions.filter(({ state }) => state === 'open')

  return opened
}

class Positions {
  /**
   * @param {{ SIGNALS_SECRET: string; API_SECRET: string }} secrets
   * @param {string} positionsUrl
   * @param {string} strategy
   * @param {string[]} signalProviders
   * @param {boolean} futures
   */
  constructor({ SIGNALS_SECRET, API_SECRET }, positionsUrl, strategy, signalProviders, futures = false) {
    this.API_SECRET = API_SECRET
    this.SIGNALS_SECRET = SIGNALS_SECRET
    this.positionsUrl = `${positionsUrl}/api/v1/positions`

    this.strategy = strategy
    this.signalProviders = signalProviders
    this.futures = futures

    this._opened = {}
  }

  get opened() {
    return (market) => this._opened[market]
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

  /**
   * @param {'long' | 'short'} side
   * @param {string} baseAsset
   * @param {string} quoteAsset
   * @param {number} entryPrice
   */
  async enter(side, baseAsset, quoteAsset, entryPrice) {
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

  /**
   * @param {string} baseAsset
   * @param {string} quoteAsset
   * @param {number} closePrice
   */
  async close(baseAsset, quoteAsset, closePrice) {
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

  /**
   * @param {string} key
   * @param {any} data
   * @returns {{ signature: string; ts: string }}
   */
  // eslint-disable-next-line class-methods-use-this
  createSignature(key) {
    const ts = `${new Date().getTime()}`
    const signature = createHmac('sha256', key).update(ts).digest('hex')

    return {
      signature,
      ts,
    }
  }
}

module.exports = Positions
