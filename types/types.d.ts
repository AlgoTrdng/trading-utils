export = TradingUtils;

declare namespace TradingUtils {
  export namespace Position {
    export type Side = 'long' | 'short'

    export type Position = {
      _id: string;
      side: Side;
      entryPrice: number;
      entryTime: Date;
      state: 'open' | 'closed';
      closePrice?: number;
      closeTime?: Date;
      pnl?: number;
    }

    export type OpenedPosition = {
      _id?: string;
      side: Side;
    }
  }

  export class Position {
    constructor(API_SECRET: string, positionsUrl: string, signalProviderId: string, futures: boolean)
  
    opened: (market: string) => Position.OpenedPosition | undefined

    init(): void
  
    enter(side: Position.Side, market: string, entryPrice: number): Position.Position | undefined
        
    close(market: string, closePrice: number): Position.Position | undefined
  }
}