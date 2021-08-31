import Binance, { StreamNames } from 'binance-api-nodejs';
/**
 * Candlestick data passed as payload
 */
export declare type CandlestickData = {
    o: number;
    h: number;
    l: number;
    c: number;
    baseVolume: number;
    quoteVolume: number;
    openTime: number;
    closeTime: number;
};
/**
 * onTick, onNewCandle payload
 */
export declare type CallbackPayload<S> = {
    state: S;
    market: string;
    timeframe: string;
    currentCandlestickData: CandlestickData;
    prevCandlestickData: CandlestickData;
};
/**
 * onTick, onNewCandle callback
 */
export declare type UpdateCallback<S> = (payload: CallbackPayload<S>) => void;
/**
 * onInit callback payload
 */
export declare type OnInitPayload<S> = {
    state: S;
    market: string;
    timeframe: string;
};
/**
 * onInit callback
 */
export declare type OnInitCallback<S> = (payload: OnInitPayload<S>) => void;
/**
 * Bot callbacks
 */
export declare type Callbacks<S> = {
    onTick?: UpdateCallback<S>;
    onNewCandle?: UpdateCallback<S>;
    onInit?: OnInitCallback<S>;
};
/**
 * Previous candlestick data for each stream
 */
export declare type MarketsData = {
    [stream: string]: CandlestickData;
};
/**
 * Individual states for each market
 */
export declare type States<S> = {
    [market: string]: S;
};
declare class Bot<S extends {}> {
    watchedMarkets: StreamNames[];
    binance: Binance;
    private callbacks;
    private candlesticksData;
    private states;
    private defaultState;
    constructor(watchedMarkets: StreamNames[], state: S);
    /**
     * Subscribe to markets
     */
    watchMarkets(callbacks?: Callbacks<S>): Promise<void>;
    onInit(onInitCb: OnInitCallback<S>): void;
    onTick(onTickCb: UpdateCallback<S>): void;
    onNewCandle(onNewcandleCb: UpdateCallback<S>): void;
}
export default Bot;
