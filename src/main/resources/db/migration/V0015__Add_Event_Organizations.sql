CREATE TABLE event_organization (
    event_id INT REFERENCES event (event_id) ON UPDATE CASCADE ON DELETE CASCADE,
    organization_id INT REFERENCES organization (organization_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT event_organization_pkey PRIMARY KEY (event_id, organization_id)
);

ALTER TABLE event
    DROP COLUMN organization;