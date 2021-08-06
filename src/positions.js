const fetch = require('node-fetch')
const { createHmac } = require('crypto')

const fetchData = require('./lib/api')

const getOpenedPositions = (positions) => {
  const opened = positions.filter(({ state }) => state === 'open')

  return opened
}

class Positions {
  constructor(API_SECRET, positionsUrl, signalProviderId, futures = false) {
    this.positionsUrl = `${positionsUrl}/api/v1/positions`
    this.signalProviderId = signalProviderId
    this.API_SECRET = API_SECRET

    this.futures = futures

    this._opened = {}
  }

  get opened() {
    return (market) => this._opened[market]
  }

  async init() {
    const res = await fetch(`${this.positionsUrl}?signalProviderId=${this.signalProviderId}`)
    const data = await res.json()

    if (!res.ok) {
      throw data
    }

    const { data: _data } = data

    const opened = getOpenedPositions(_data)

    opened.forEach(({ _id, market, side }) => {
      this._opened[market] = {
        _id,
        side,
      }
    })
  }

  async enter(side, market, entryPrice) {
    const params = new URLSearchParams({
      signalProviderId: this.signalProviderId,
      futures: this.futures,
    })

    const body = JSON.stringify({
      side,
      market,
      entryPrice,
    })

    const { signature, ts } = this.createSignature()

    const position = await fetchData(`${this.positionsUrl}/open?${params}`, {
      body,
      signature,
      ts,
      method: 'POST',
    })

    if (position?.data?._id) {
      this._opened[market] = {
        _id: position.data._id,
        side: position.data.side,
      }
      return position.data
    }

    return undefined
  }

  async close(market, closePrice) {
    const positionId = this._opened[market]

    const params = new URLSearchParams({
      signalProviderId: this.signalProviderId,
      futures: this.futures,
      positionId,
    })

    const body = JSON.stringify({
      closePrice,
    })

    const { signature, ts } = this.createSignature()

    const position = await fetchData(`${this.positionsUrl}/close?${params}`, {
      body,
      signature,
      ts,
      method: 'POST',
    })

    if (position?.data?._id) {
      this._opened[market]._id = undefined
      return position.data
    }

    return undefined
  }

  createSignature() {
    const ts = `${new Date().getTime()}`
    const signature = createHmac('sha256', this.API_SECRET).update(ts).digest('hex')

    return {
      signature,
      ts,
    }
  }
}

module.exports = Positions
