CREATE TABLE resourcer (
    user_id INT REFERENCES tsr_user (id) ON UPDATE CASCADE ON DELETE CASCADE,
    organization_id INT REFERENCES organization (organization_id) ON UPDATE CASCADE ON DELETE CASCADE,
    event_task_catergory_id INT REFERENCES event_task_category (event_task_category_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT resourcer_pkey PRIMARY KEY (user_id, organization_id, event_task_catergory_id)
);

ALTER TABLE event_task
    DROP COLUMN resourcer_id;