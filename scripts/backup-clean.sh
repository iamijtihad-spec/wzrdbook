#!/bin/bash

# Configuration
SOURCE_DIR=$(pwd)
DEST_DIR="../grit-dashboard-clean"

echo "🛡️  INITIATING CLEAN BACKUP"
echo "SOURCE: $SOURCE_DIR"
echo "DEST:   $DEST_DIR"

# Create Dest
mkdir -p "$DEST_DIR"

# Rsync with Exclusions
# We copy ONLY the code and assets needed to build.
rsync -av --progress "$SOURCE_DIR/" "$DEST_DIR/" \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude '.DS_Store' \
    --exclude 'tmp' \
    --exclude 'music_uploads' \
    --exclude 'electron/dist' \
    --exclude 'electron/build' \
    --exclude 'README.md' 

# Copy .env.local explicitly if needed (rsync handles hidden files, but good to verify)
# Note: rsync -a includes hidden files.

echo "✅ BACKUP COMPLETE."
echo "---------------------------------------------------"
echo "TO RESTORE/RUN:"
echo "1. cd $DEST_DIR"
echo "2. npm install"
echo "3. npm run dev"
echo "---------------------------------------------------"
