#!/bin/bash
set -e

echo "Creating databases..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE zitadel;
    CREATE DATABASE sent_platform;
    CREATE DATABASE tenant_template;
    CREATE DATABASE tenant_dev_test;
EOSQL

echo "Databases created successfully."
