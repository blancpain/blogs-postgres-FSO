CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  author text,
  url text NOT NULL,
  title text NOT NULL,
  likes int NOT NULL DEFAULT 0
);

INSERT INTO blogs (author, url, title, likes) values ('John Doe', 'www.sqlIsCool.com', 'Sql Rocks!', 50);
INSERT INTO blogs (author, url, title, likes) values ('Jane Doe', 'www.postgresIsCool.com', 'Postgres Rocks!', 60);
INSERT INTO blogs (author, url, title) values ('Random Guy', 'www.example.com', 'Postgres!');
