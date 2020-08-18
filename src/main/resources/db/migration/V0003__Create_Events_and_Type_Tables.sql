CREATE TABLE event_type (
    event_type_id SERIAL PRIMARY KEY,
    event_name VARCHAR(30) UNIQUE NOT NULL,
    display_name VARCHAR(30) UNIQUE NOT NULL,
    sort_order INT UNIQUE NOT NULL
);

INSERT INTO event_type (event_name, display_name, sort_order) VALUES ('FLAT_RANGE', 'flat range', 1);
INSERT INTO event_type (event_name, display_name, sort_order) VALUES ('MANEUVER_LFX', 'maneuver live fire exercise', 2);
INSERT INTO event_type (event_name, display_name, sort_order) VALUES ('MANEUVER', 'maneuver range', 3);
INSERT INTO event_type (event_name, display_name, sort_order) VALUES ('UNCATEGORIZED', 'other', 4);

CREATE TABLE event (
	event_id SERIAL PRIMARY KEY,
	event_name VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    event_type_id INT REFERENCES event_type (event_type_id),
    start_date timestamp NOT NULL,
    end_date timestamp NOT NULL,
    created_date timestamp NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    last_modified_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_by VARCHAR(255) NOT NULL
);