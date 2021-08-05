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
  }

  export class Position {
    constructor(API_SECRET: string, positionsUrl: string, signalProviderId: string, futures: boolean)
  
    init(): void
  
    enter(side: Position.Side, market: string, entryPrice: number): Position.Position
        
    close(market: string, closePrice: number): Position.Position
  }
}