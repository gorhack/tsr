ALTER TABLE event_task_status
    ADD COLUMN sort_order INT NOT NULL DEFAULT 0;

UPDATE event_task_status SET sort_order = 2 WHERE status_name = 'CREATED';
UPDATE event_task_status SET sort_order = 4 WHERE status_name = 'IN_PROGRESS';
UPDATE event_task_status SET sort_order = 3 WHERE status_name = 'AWAITING_ACTION';
UPDATE event_task_status SET sort_order = 1 WHERE status_name = 'BLOCKED';
UPDATE event_task_status SET sort_order = 5 WHERE status_name = 'COMPLETE';

ALTER TABLE event_task_status
    ADD CONSTRAINT sort_order_uq UNIQUE (sort_order);