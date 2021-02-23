-- Changes create organization character size from varchar(30) -> varchar(255)
ALTER TABLE organization ALTER COLUMN organization_name TYPE varchar(255);
ALTER TABLE organization ALTER COLUMN organization_display_name TYPE varchar(255);
