import { ENVTypes, Strategy } from '../types/types';
export declare type StatusManagerParams = {
    strategy: Strategy;
    developmentUrl?: string;
    ENV: ENVTypes;
    API_SECRET: string;
    updatePeriod?: number;
};
export declare type Status = 0 | 1 | 2 | 3;
declare class StatusManager {
    strategy: Strategy;
    apiUrl: string;
    API_SECRET: string;
    status: Status;
    lastUpdated: number;
    started: boolean;
    UPDATE_PERIOD: number;
    constructor({ strategy, developmentUrl, ENV, API_SECRET, updatePeriod, }: StatusManagerParams);
    private sendUpdates;
    private sendUpdate;
    updateLocally(status: Status): void;
}
export default StatusManager;
