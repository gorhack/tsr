CREATE TABLE organization (
    organization_id SERIAL PRIMARY KEY,
    organization_name VARCHAR(30) UNIQUE NOT NULL,
    organization_display_name VARCHAR(30) UNIQUE NOT NULL,
    sort_order INT UNIQUE NOT NULL
);

INSERT INTO organization (organization_name, organization_display_name, sort_order) VALUES ('2_75', '2/75', 1);
INSERT INTO organization (organization_name, organization_display_name, sort_order) VALUES ('A_2_75', 'A Co, 2/75', 2);
INSERT INTO organization (organization_name, organization_display_name, sort_order) VALUES ('B_2_75', 'B Co, 2/75', 3);
INSERT INTO organization (organization_name, organization_display_name, sort_order) VALUES ('C_2_75', 'C Co, 2/75', 4);
INSERT INTO organization (organization_name, organization_display_name, sort_order) VALUES ('D_2_75', 'D Co, 2/75', 5);
INSERT INTO organization (organization_name, organization_display_name, sort_order) VALUES ('E_2_75', 'E Co, 2/75', 6);

ALTER TABLE event DROP COLUMN organization;
ALTER TABLE event ADD COLUMN organization INT REFERENCES organization (organization_id) DEFAULT 1;