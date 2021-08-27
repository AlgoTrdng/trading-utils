export = TradingUtils;

declare namespace TradingUtils {
  export namespace Positions {
    export type Side = 'long' | 'short'

    export type secrets = {
      SIGNALS_SECRET: string
      API_SECRET: string
    }

    export type Position = {
      _id: string
      side: Side
      entryPrice: number
      entryTime: Date
      state: 'open' | 'closed'
      closePrice?: number
      closeTime?: Date
      pnl?: number
    }
  }

  export class Positions {
    constructor(secrets: Positions.secrets, positionsUrl: string, strategy: string, signalProviders: ['zignaly'?, 'compendium'?], futures = false)
  
    opened: (market: string) => Positions.Position | undefined

    init(): Promise<void>
  
    enter(side: Positions.Side, baseAsset: string, quoteAsset: string, entryPrice: number): Promise<Positions.Position> | undefined
        
    close(baseAsset: string, quoteAsset: string, closePrice: number): Promise<Positions.Position> | undefined
  }
}