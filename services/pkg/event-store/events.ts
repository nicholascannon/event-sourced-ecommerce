export interface BaseEvent {
    streamId: string;
    version: number;
    streamType: string;
    eventType: string;
}
