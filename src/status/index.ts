import { createApiUrls } from '../constants'
import { ENVTypes, Strategy } from '../types/types'
import fetchData, { createSignature } from '../utils/api'

export type StatusManagerParams = {
  strategy: Strategy
  developmentUrl?: string
  ENV: ENVTypes
  API_SECRET: string
}

const UPDATE_PERIOD = 1000 * 60 * 30

export type Status = 0 | 1 | 2 | 3

class StatusManager {
  strategy: Strategy

  apiUrl: string

  API_SECRET: string

  status: Status = 0

  lastUpdated = new Date().getTime()

  constructor({
    strategy, developmentUrl, ENV, API_SECRET,
  }: StatusManagerParams) {
    this.strategy = strategy
    this.API_SECRET = API_SECRET

    const API_URLS = createApiUrls(developmentUrl)
    this.apiUrl = API_URLS[ENV]

    this.sendUpdates()
  }

  sendUpdates() {
    setInterval(async () => {
      await this.sendUpdate()
    }, UPDATE_PERIOD)
  }

  private async sendUpdate() {
    if (this.lastUpdated + UPDATE_PERIOD < new Date().getTime()) {
      this.status = 1
    }

    const credentials = createSignature(this.API_SECRET)
    await fetchData(this.apiUrl, {
      ...credentials,
      method: 'POST',
      body: JSON.stringify({
        status: this.status,
        strategy: this.strategy,
      }),
    })
  }

  updateLocally(status: Status) {
    this.status = status
  }
}

export default StatusManager
