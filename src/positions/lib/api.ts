import fetch from 'node-fetch'

type fetchParams = {
  body: string
  method: 'POST' | 'GET'
  signature: string
  ts: string
}

const fetchData = async (url: string, {
  body, method, signature, ts,
}: fetchParams) => {
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
