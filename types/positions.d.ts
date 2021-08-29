import { SignalProviders } from './types/types';
declare type Position = {
    _id: string;
    side: 'long' | 'short';
    market: string;
    entryPrice: number;
    entryTime: Date;
    state: 'open' | 'closed';
    closePrice?: number;
    closeTime?: Date;
    pnl?: number;
};
declare type secrets = {
    SIGNALS_SECRET: string;
    API_SECRET: string;
};
declare type OpenedPositions = {
    [market: string]: Position | undefined;
};
declare class Positions {
    API_SECRET: string;
    SIGNALS_SECRET: string;
    positionsUrl: string;
    strategy: string;
    signalProviders: SignalProviders;
    futures: boolean;
    _opened: OpenedPositions;
    constructor({ SIGNALS_SECRET, API_SECRET }: secrets, positionsUrl: string, strategy: string, signalProviders: SignalProviders, futures?: boolean);
    get opened(): (market: string) => Position | undefined;
    init(): Promise<void>;
    enter(side: 'long' | 'short', baseAsset: string, quoteAsset: string, entryPrice: number): Promise<any>;
    close(baseAsset: string, quoteAsset: string, closePrice: number): Promise<any>;
    createSignature(key: string): {
        signature: string;
        ts: string;
    };
}
export default Positions;
