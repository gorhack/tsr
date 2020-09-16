CREATE TABLE event_task_status (
    status_id SERIAL PRIMARY KEY
,   status_name VARCHAR(30) UNIQUE NOT NULL
,   status_display_name VARCHAR(30) UNIQUE NOT NULL
,   status_short_name CHAR(1) NOT NULL
);

INSERT INTO event_task_status (status_name, status_display_name, status_short_name) VALUES ('CREATED', 'created', 'R');
INSERT INTO event_task_status (status_name, status_display_name, status_short_name) VALUES ('IN_PROGRESS', 'in progress', 'Y');
INSERT INTO event_task_status (status_name, status_display_name, status_short_name) VALUES ('AWAITING_ACTION', 'awaiting action', 'Y');
INSERT INTO event_task_status (status_name, status_display_name, status_short_name) VALUES ('BLOCKED', 'blocked', 'R');
INSERT INTO event_task_status (status_name, status_display_name, status_short_name) VALUES ('COMPLETE', 'complete', 'G');

CREATE TABLE event_task_category (
    event_task_id SERIAL PRIMARY KEY
,   event_task_name VARCHAR(255) UNIQUE NOT NULL
,   event_task_display_name VARCHAR(255) UNIQUE NOT NULL
);

INSERT INTO event_task_category (event_task_name, event_task_display_name) VALUES ('CLASS_ONE', 'Class I - Subsistence');
INSERT INTO event_task_category (event_task_name, event_task_display_name) VALUES ('CLASS_TWO', 'Class II - Supplies');
INSERT INTO event_task_category (event_task_name, event_task_display_name) VALUES ('CLASS_THREE', 'Class III - Fuels');
INSERT INTO event_task_category (event_task_name, event_task_display_name) VALUES ('CLASS_FOUR', 'Class IV - Construction');
INSERT INTO event_task_category (event_task_name, event_task_display_name) VALUES ('CLASS_FIVE', 'Class V - Ammunition');
INSERT INTO event_task_category (event_task_name, event_task_display_name) VALUES ('CLASS_SEVEN', 'Class VII - Major End Items');
INSERT INTO event_task_category (event_task_name, event_task_display_name) VALUES ('CLASS_EIGHT', 'Class VIII - Medical');
INSERT INTO event_task_category (event_task_name, event_task_display_name) VALUES ('CLASS_NINE', 'Class IX - Repair Parts');
INSERT INTO event_task_category (event_task_name, event_task_display_name) VALUES ('CLASS_TEN', 'Class X - Other Equipment');
INSERT INTO event_task_category (event_task_name, event_task_display_name) VALUES ('LAND', 'Land');
INSERT INTO event_task_category (event_task_name, event_task_display_name) VALUES ('MWR', 'MWR');

CREATE TABLE event_task (
    event_task_id INT REFERENCES event_task_category (event_task_id) ON UPDATE CASCADE ON DELETE CASCADE
,   event_id INT REFERENCES event (event_id) ON UPDATE CASCADE ON DELETE CASCADE
,   suspense_date TIMESTAMPTZ NOT NULL
,   approver_id INT REFERENCES tsr_user (id) ON UPDATE CASCADE ON DELETE NO ACTION
,   resourcer_id INT REFERENCES tsr_user (id) ON UPDATE CASCADE ON DELETE NO ACTION
,   status_id INT REFERENCES event_task_status (status_id) ON UPDATE CASCADE ON DELETE SET DEFAULT NOT NULL DEFAULT 0
,   created_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
,   created_by VARCHAR(255) NOT NULL DEFAULT ''
,   last_modified_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
,   last_modified_by VARCHAR(255) NOT NULL DEFAULT ''
,   CONSTRAINT event_task_event_pkey PRIMARY KEY (event_task_id, event_id)
);
