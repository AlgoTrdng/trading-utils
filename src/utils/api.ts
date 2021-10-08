import fetch from 'node-fetch'
import { createHmac } from 'crypto'

export type FetchParams = {
  body: string
  method: 'POST' | 'GET'
  signature: string
  ts: string
}

export type AuthCredentials = {
  ts: string
  signature: string
}

export const createSignature = (data: string): AuthCredentials => {
  const ts = `${new Date().getTime()}`
  const signature = createHmac('sha256', data).update(ts).digest('hex')

  return {
    signature,
    ts,
  }
}

const fetchData = async (url: string, {
  body, method, signature, ts,
}: FetchParams) => {
  const res = await fetch(url, {
    method,
    body,
    headers: {
      'Content-Type': 'application/json',
      'x-algotrading-signature': signature,
      'x-algotrading-timestamp': ts,
    },
  })
  const data = await res.json()

  if (!res.ok || !data.success) {
    console.log(data)
  }

  return data
}

export default fetchData
