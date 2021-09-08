export declare type SignalParams = {
    signalProviders: ['zignaly'?, 'compendium'?];
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
}) => Promise<void>;
export default sendSignal;
