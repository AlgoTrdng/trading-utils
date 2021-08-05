const fetch = require('node-fetch')

const fetchData = async (url, {
  body, method, signature, ts,
}) => {
  const res = await fetch(url, {
    method,
    body,
    headers: {
      'Content-Type': 'application/json',
      'x-algotrading-api-secret': signature,
      'x-algotrading-timestamp': ts,
    },
  })
  const data = await res.json()

  if (!res.ok) {
    throw data
  }

  return data
}

module.exports = fetchData
