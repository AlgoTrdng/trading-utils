const fetch = require('node-fetch')
const { createHmac } = require('crypto')

const fetchData = require('./lib/api')

const getOpenedPositions = (positions) => {
  const opened = positions.filter(({ state }) => state === 'open')

  return opened
}

class Position {
  constructor(API_SECRET, positionsUrl, signalProviderId, futures = false) {
    this.positionsUrl = `${positionsUrl}/api/v1/positions`
    this.signalProviderId = signalProviderId
    this.API_SECRET = API_SECRET

    this.futures = futures

    this.positionId = {}
  }

  async init() {
    const res = await fetch(`${this.positionsUrl}?signalProviderId=${this.signalProviderId}`)
    const data = await res.json()

    if (!res.ok) {
      throw data
    }

    const { data: _data } = data

    const opened = getOpenedPositions(_data)

    opened.forEach(({ _id, market }) => {
      this.positionId[market] = _id
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
      this.positionId[market] = position.data._id
      return position
    }

    return undefined
  }

  async close(market, closePrice) {
    const positionId = this.positionId[market]

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
      this.positionId[market] = undefined
      return position
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

module.exports = Position
