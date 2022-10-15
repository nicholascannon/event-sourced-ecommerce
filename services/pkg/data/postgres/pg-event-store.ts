import pg from 'pg';
import { DomainEvent, DomainEventStore } from '../../domain/domain-event-store';

export class PgEventStore implements DomainEventStore {
    constructor(private readonly pool: pg.Pool) {}

    async loadStream<E extends DomainEvent>(id: string, type: E['streamType']): Promise<E[]> {
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

        // We can use `as E[]` here as we know that the query is filtering based on `stream_type`
        return events as E[];
    }

    async save({ streamId, version, streamType, eventType, payload }: DomainEvent) {
        // TODO: check if we throw due to unqiue constraint on version - possibly retry
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
