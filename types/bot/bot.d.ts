import Binance, { CandlesticksResponse, StreamNames } from 'binance-api-nodejs';
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
export declare type OnMarketInitPayload<S> = {
    state: S;
    market: string;
};
/**
 * onMarketInit callback
 */
export declare type OnMarketInitCallback<S> = (payload: OnMarketInitPayload<S>) => void;
/**
 * onInit callback
 */
export declare type OnInitCallback = () => void;
/**
 * Bot callbacks
 */
export declare type Callbacks<S> = {
    onTick?: UpdateCallback<S>;
    onNewCandle?: UpdateCallback<S>;
    onMarketInit?: OnMarketInitCallback<S>;
    onInit?: OnInitCallback;
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
    backtest(candlesticks: {
        [market: string]: CandlesticksResponse[];
    }): Promise<void>;
    onMarketInit(onMarketInitCb: OnMarketInitCallback<S>): void;
    onTick(onTickCb: UpdateCallback<S>): void;
    onNewCandle(onNewcandleCb: UpdateCallback<S>): void;
    onInit(onInitCb: OnInitCallback): void;
}
export default Bot;
