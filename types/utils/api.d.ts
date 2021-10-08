export declare type FetchParams = {
    body: string;
    method: 'POST' | 'GET';
    signature: string;
    ts: string;
};
export declare type AuthCredentials = {
    ts: string;
    signature: string;
};
export declare const createSignature: (data: string) => AuthCredentials;
declare const fetchData: (url: string, { body, method, signature, ts, }: FetchParams) => Promise<any>;
export default fetchData;
