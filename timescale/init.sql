CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

CREATE TABLE devices (
    id integer PRIMARY KEY,
    name text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    country text NOT NULL
);

CREATE SEQUENCE seq_devices START 1;

insert into devices values (nextval('seq_devices'), 'Chicago North 125', 'Chicago', 'IL', 'USA');
insert into devices values (nextval('seq_devices'), 'Chicago North 242', 'Chicago', 'IL', 'USA');
insert into devices values (nextval('seq_devices'), 'Tampa South 124', 'Tampa', 'FL', 'USA');
insert into devices values (nextval('seq_devices'), 'Tampa South 232', 'Tampa', 'FL', 'USA');
insert into devices values (nextval('seq_devices'), 'NY Central 133', 'New York', 'NY', 'USA');
insert into devices values (nextval('seq_devices'), 'NY Central 221', 'New York', 'NY', 'USA');
insert into devices values (nextval('seq_devices'), 'NY Beach 213', 'New York', 'NY', 'USA');
insert into devices values (nextval('seq_devices'), 'NY South 432', 'New York', 'NY', 'USA');
insert into devices values (nextval('seq_devices'), 'Sweden 192', 'Stockholm', 'Stockholm', 'Sweden');
insert into devices values (nextval('seq_devices'), 'Sweden 299', 'Stockholm', 'Stockholm', 'Sweden');
insert into devices values (nextval('seq_devices'), 'RU 198 BU', 'Moscow', 'Moscow', 'Russia');
insert into devices values (nextval('seq_devices'), 'RU 12 BU', 'Moscow', 'Moscow', 'Russia');
insert into devices values (nextval('seq_devices'), 'JPY 398', 'Tokyo', 'Tokyo', 'Japan');
insert into devices values (nextval('seq_devices'), 'JPY 176', 'Tokyo', 'Tokyo', 'Japan');
insert into devices values (nextval('seq_devices'), 'Asia 287', 'Singapore', 'Singapore', 'Singapore');
insert into devices values (nextval('seq_devices'), 'Asia 987', 'Singapore', 'Singapore', 'Singapore');

CREATE TABLE comments (
    id integer PRIMARY KEY,
    device_id integer NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    user_id integer NOT NULL,
    created_date timestamp DEFAULT NOW(),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

CREATE SEQUENCE seq_comments START 1;

insert into comments values (nextval('seq_comments'), 1, 'Comment 1', 'Some description here', 1);
insert into comments values (nextval('seq_comments'), 1, 'Comment 2', 'Very long description here', 1);
insert into comments values (nextval('seq_comments'), 2, 'Comment 3', 'Very Very long description here', 1);
