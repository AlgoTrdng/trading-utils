import Binance, { StreamNames } from 'binance-api-nodejs';
declare type CandlestickData = {
    o: number;
    h: number;
    l: number;
    c: number;
    baseVolume: number;
    quoteVolume: number;
    openTime: number;
    closeTime: number;
};
declare type CallbackPayload<S> = {
    state: S;
    market: string;
    timeframe: string;
    currentCandlestickData: CandlestickData;
    prevCandlestickData: CandlestickData;
};
declare type UpdateCallback<S> = (payload: CallbackPayload<S>) => void;
/**
 * Bot callbacks
 */
declare type Callbacks<S> = {
    onTick?: UpdateCallback<S>;
    onNewCandle?: UpdateCallback<S>;
};
/**
 * Previous candlestick data for each stream
 */
declare type MarketsData = {
    [stream: string]: CandlestickData;
};
/**
 * Individual states for each market
 */
export declare type States<S> = {
    [market: string]: S;
};
declare class Bot<S> {
    watchedMarkets: StreamNames[];
    binance: Binance;
    callbacks: Callbacks<S>;
    candlesticksData: MarketsData;
    states: States<S>;
    defaultState: S;
    constructor(watchedMarkets: StreamNames[], state: S);
    /**
     * Subscribe to markets
     */
    watchMarkets(callbacks?: Callbacks<S>): void;
    onTick(onTickCb: UpdateCallback<S>): void;
    onNewCandle(onNewcandleCb: UpdateCallback<S>): void;
}
export default Bot;
