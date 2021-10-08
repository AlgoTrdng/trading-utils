import { ENVTypes, Strategy } from '../types/types';
export declare type StatusManagerParams = {
    strategy: Strategy;
    developmentUrl?: string;
    ENV: ENVTypes;
    API_SECRET: string;
};
export declare type Status = 0 | 1 | 2 | 3;
declare class StatusManager {
    strategy: Strategy;
    apiUrl: string;
    API_SECRET: string;
    status: Status;
    lastUpdated: number;
    constructor({ strategy, developmentUrl, ENV, API_SECRET, }: StatusManagerParams);
    sendUpdates(): void;
    private sendUpdate;
    updateLocally(status: Status): void;
}
export default StatusManager;
