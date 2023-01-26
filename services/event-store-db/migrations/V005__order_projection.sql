CREATE TABLE order_context.order_projection (
    id UUID PRIMARY KEY NOT NULL,
    projection JSON NOT NULL
);

GRANT SELECT ON order_context.order_projection TO order_reader;

GRANT SELECT, INSERT, UPDATE ON order_context.order_projection TO order_writer;
-- GRANT USAGE, SELECT ON SEQUENCE order_projection_id_seq TO order_writer;
