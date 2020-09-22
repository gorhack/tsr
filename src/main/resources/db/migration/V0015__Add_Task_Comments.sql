CREATE TABLE event_task_comment
(
    comment_id         SERIAL PRIMARY KEY,
    event_task_id      INT REFERENCES event_task (event_task_id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
    annotation         TEXT                                                                          NOT NULL,
    created_date       TIMESTAMPTZ                                                                   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by         VARCHAR(255)                                                                  NOT NULL DEFAULT '',
    last_modified_date TIMESTAMPTZ                                                                   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_by   VARCHAR(255)                                                                  NOT NULL DEFAULT ''
);