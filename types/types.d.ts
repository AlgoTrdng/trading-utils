export = TradingUtils;

declare namespace TradingUtils {
  export namespace Positions {
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

  export class Positions {
    constructor(API_SECRET: string, positionsUrl: string, signalProviderId: string, futures: boolean)
  
    opened: (market: string) => Positions.OpenedPosition | undefined

    init(): void
  
    enter(side: Positions.Side, market: string, entryPrice: number): Promise<Positions.Position> | undefined
        
    close(market: string, closePrice: number): Promise<Positions.Position> | undefined
  }
}