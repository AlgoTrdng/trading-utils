import { ENVTypes, SignalProviders, Strategy } from '../types/types';
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
declare type ConfigParams = {
    API_SECRET: string;
    STRATEGY: Strategy;
    ENV: ENVTypes;
    SIGNAL_PROVIDERS: SignalProviders;
    FUTURES: boolean;
    developmentUrl?: string;
};
declare type SendSignalParams = {
    side: 'long' | 'short';
    baseAsset: string;
    quoteAsset: string;
    positionId: string;
};
declare class Positions {
    config: ConfigParams;
    API_URL: string;
    private openedPositions;
    constructor(config: ConfigParams);
    get opened(): (market?: string | undefined) => Position | (Position | undefined)[] | undefined;
    init(): Promise<void>;
    enterPosition(side: 'long' | 'short', baseAsset: string, quoteAsset: string, entryPrice: number): Promise<Position | undefined>;
    sendEnterSignal(params: SendSignalParams): Promise<void>;
    enterPositionAndSendSignal(side: 'long' | 'short', baseAsset: string, quoteAsset: string, entryPrice: number): Promise<Position | undefined>;
    exitPosition(baseAsset: string, quoteAsset: string, closePrice: number): Promise<Position | undefined>;
    sendExitSignal(params: SendSignalParams): Promise<void>;
    exitPositionAndSendSignal(baseAsset: string, quoteAsset: string, closePrice: number): Promise<Position | undefined>;
}
export default Positions;
