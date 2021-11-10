import { createApiUrls } from '../constants'
import { ENVTypes, Strategy } from '../types/types'
import fetchData, { createSignature } from '../utils/api'

export type StatusManagerParams = {
  strategy: Strategy
  developmentUrl?: string
  ENV: ENVTypes
  API_SECRET: string
  updatePeriod?: number
}

// DEFAULT 2 hours
const UPDATE_PERIOD = 1000 * 60 * 60 * 2

export type Status = 0 | 1 | 2 | 3

class StatusManager {
  strategy: Strategy

  apiUrl: string

  API_SECRET: string

  status: Status = 0

  lastUpdated = new Date().getTime()

  started = false

  UPDATE_PERIOD = UPDATE_PERIOD

  constructor({
    strategy, developmentUrl, ENV, API_SECRET, updatePeriod,
  }: StatusManagerParams) {
    this.strategy = strategy
    this.API_SECRET = API_SECRET

    if (updatePeriod) {
      this.UPDATE_PERIOD = updatePeriod
    }

    const API_URLS = createApiUrls(developmentUrl)
    this.apiUrl = API_URLS[ENV]

    this.sendUpdates()
  }

  private async sendUpdates() {
    this.updateLocally(3)

    await this.sendUpdate()

    setInterval(async () => {
      await this.sendUpdate()
    }, this.UPDATE_PERIOD)
  }

  private async sendUpdate() {
    if (this.lastUpdated + this.UPDATE_PERIOD < new Date().getTime()) {
      this.status = 1
    }

    const credentials = createSignature(this.API_SECRET)
    await fetchData(`${this.apiUrl}/status/${this.strategy}`, {
      ...credentials,
      method: 'POST',
      body: JSON.stringify({
        status: this.status,
      }),
    })
  }

  updateLocally(status: Status) {
    if (this.status === 1 || this.status === 2) {
      return
    }

    this.status = status
    this.lastUpdated = new Date().getTime()
  }
}

export default StatusManager
