import pg from 'pg';
import { DomainEvent, DomainEventStore } from '../../domain/domain-event-store';
import { Bookmark } from '../../event-store/bookmark';
import { PersistedEvent } from '../../event-store/events';

export class PgEventStore implements DomainEventStore {
    constructor(private readonly pool: pg.Pool) {}

    async loadStream<E extends DomainEvent>(id: string, type: E['streamType']): Promise<PersistedEvent<E>[]> {
        const { rows: events } = await this.pool.query<PersistedEvent<DomainEvent>>(
            `
                SELECT
                    id,
                    inserting_txid as "insertingTxid",
                    stream_id AS "streamId",
                    version,
                    stream_type AS "streamType",
                    event_type AS "eventType",
                    payload,
                    timestamp
                FROM order_context.events
                WHERE
                    stream_id=$1 AND
                    stream_type=$2
                ORDER BY version ASC;
            `,
            [id, type]
        );

        // We can use `as PersistedEvent<E>[]` here as we know that the query is filtering based on `stream_type`
        return events as PersistedEvent<E>[];
    }

    async loadEvents(from: Bookmark, batchSize: number): Promise<PersistedEvent<DomainEvent>[]> {
        const { id, insertingTxid } = from;

        const { rows: events } = await this.pool.query<PersistedEvent<DomainEvent>>(
            `
                SELECT
                    id,
                    inserting_txid as "insertingTxid",
                    stream_id AS "streamId",
                    version,
                    stream_type AS "streamType",
                    event_type AS "eventType",
                    payload,
                    timestamp
                FROM order_context.events
                WHERE
                    (inserting_txid, id) > ($1, $2) AND
                    inserting_txid < txid_current()
                ORDER BY inserting_txid, id ASC
                LIMIT $3;
            `,
            [insertingTxid, id, batchSize]
        );

        return events;
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
