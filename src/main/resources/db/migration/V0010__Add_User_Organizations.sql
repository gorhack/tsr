CREATE TABLE tsr_user_organization (
    tsr_user_id INT REFERENCES tsr_user (id) ON UPDATE CASCADE ON DELETE CASCADE,
    organization_id INT REFERENCES organization (organization_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT user_organization_pkey PRIMARY KEY (tsr_user_id, organization_id)
);