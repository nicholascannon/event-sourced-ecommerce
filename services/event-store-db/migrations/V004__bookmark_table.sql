CREATE TABLE order_context.bookmarks (
    name TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
);

GRANT SELECT, INSERT, UPDATE ON order_context.bookmarks TO order_process_manager;
