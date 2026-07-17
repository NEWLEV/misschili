-- Prisma Migrate needs to create/drop a temporary "shadow database" to
-- compute diffs for `prisma migrate dev`. The default MARIADB_USER grant is
-- scoped to MARIADB_DATABASE only, which makes every `migrate dev` fail with
-- P3014. This runs once on first container init (mariadb only executes
-- /docker-entrypoint-initdb.d/ on an empty data volume).
GRANT ALL PRIVILEGES ON `prisma_migrate_shadow_db%`.* TO 'misschili'@'%';
FLUSH PRIVILEGES;
