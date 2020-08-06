CREATE TABLE tsr_user (
    id serial PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) DEFAULT NULL,
    role VARCHAR(100) NOT NULL
);