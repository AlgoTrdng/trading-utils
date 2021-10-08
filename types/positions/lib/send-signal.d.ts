import { SignalProviders } from '../../types/types';
export declare type SignalParams = {
    signalProviders: SignalProviders;
    strategy: string;
    baseAsset: string;
    quoteAsset: string;
    side: 'long' | 'short';
    positionId: string;
    futures: boolean;
};
declare const sendSignal: (url: string, type: 'open' | 'close', params: SignalParams, { signature, ts }: {
    signature: string;
    ts: string;
}, onError?: (() => void) | undefined) => Promise<void>;
export default sendSignal;
