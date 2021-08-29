declare type fetchParams = {
    body: string;
    method: 'POST' | 'GET';
    signature: string;
    ts: string;
};
declare const fetchData: (url: string, { body, method, signature, ts, }: fetchParams) => Promise<any>;
export default fetchData;
