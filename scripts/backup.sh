#!/bin/bash
# Committee Management System - MySQL backup script (Linux/hosting)
#
# Usage: bash backup.sh
# Add to crontab for daily automation, e.g.:
#   0 2 * * * /path/to/CMS/scripts/backup.sh >> /path/to/CMS/backups/backup.log 2>&1
#
# Reads DB credentials from server/.env. Keeps the last 14 daily backups.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../server/.env"
BACKUP_DIR="$SCRIPT_DIR/../backups"

mkdir -p "$BACKUP_DIR"

# Load DB_* variables out of server/.env without touching anything else.
export $(grep -E '^(DB_HOST|DB_PORT|DB_NAME|DB_USER|DB_PASSWORD)=' "$ENV_FILE" | xargs)

TIMESTAMP=$(date +"%Y-%m-%d_%H%M")
OUT_FILE="$BACKUP_DIR/${DB_NAME}-${TIMESTAMP}.sql"

echo "Backing up '$DB_NAME' to $OUT_FILE ..."

MYSQL_PWD="$DB_PASSWORD" mysqldump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --user="$DB_USER" \
  "$DB_NAME" > "$OUT_FILE"

echo "Backup complete: $OUT_FILE"

# Delete backups older than 14 days.
find "$BACKUP_DIR" -name "*.sql" -mtime +14 -delete

echo "Old backups (14+ days) cleaned up."
