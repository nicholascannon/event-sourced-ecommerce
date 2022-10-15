import pg from 'pg';
import { DomainEvent } from '../domain/domain-events';
import { EventStore } from '../event-store/generic-event-store';

export class PgEventStore implements EventStore<DomainEvent> {
    constructor(private readonly pool: pg.Pool) {}

    async loadStream(id: string, type: DomainEvent['streamType']): Promise<DomainEvent[]> {
        const { rows: events } = await this.pool.query<DomainEvent>(
            `
                SELECT
                    stream_id AS "streamId",
                    version,
                    stream_type AS "streamType",
                    event_type AS "eventType",
                    payload
                FROM order_context.events
                WHERE
                    stream_id=$1 AND
                    stream_type=$2
                ORDER BY version ASC;
            `,
            [id, type]
        );

        return events;
    }
    async save({ streamId, version, streamType, eventType, payload }: DomainEvent) {
        await this.pool.query(
            `
                INSERT INTO order_context.events (
                    stream_id,
                    version,
                    stream_type,
                    event_type,
                    payload
                ) VALUES ($1, $2, $3, $4, $5);
            `,
            [streamId, version, streamType, eventType, JSON.stringify(payload)]
        );
    }
}
