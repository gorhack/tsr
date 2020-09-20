ALTER TABLE event_task_category
    RENAME COLUMN event_task_id TO event_task_category_id;

ALTER TABLE event_task
    DROP CONSTRAINT event_task_event_pkey;

ALTER TABLE event_task
    RENAME event_task_id TO event_task_category_id;

ALTER TABLE event_task
    ADD COLUMN event_task_id SERIAL PRIMARY KEY;

ALTER TABLE event_task
    ADD CONSTRAINT event_task_event_uq UNIQUE (event_task_category_id, event_id);