CREATE TABLE order_context.events (
    id BIGSERIAL NOT NULL,
    inserting_txid BIGINT NOT NULL DEFAULT txid_current(),

    stream_id VARCHAR(50) NOT NULL,
    stream_type VARCHAR(50) NOT NULL,
    version INT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    payload JSON NOT NULL,

    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (stream_type, stream_id, version),
    CONSTRAINT non_negative_version CHECK (version > 0)
);

-- Allow PMs to tail all events on the event store efficiently
CREATE INDEX events_txid_id_index ON events(inserting_txid, id);

-- No UPDATE or DELETE on event store!
GRANT SELECT, INSERT ON order_context.events TO order_writer;
GRANT USAGE, SELECT ON SEQUENCE events_id_seq TO order_writer;
GRANT SELECT ON order_context.events TO order_reader;
GRANT SELECT ON SEQUENCE events_id_seq TO order_reader;
