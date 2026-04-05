#!/bin/bash

# Load environment variables
source .env

echo "Migrating PizzaTask Database Schema..."

# Add icon column to projects table
echo "Adding icon column to projects..."
curl -X POST "$VITE_BASE_URL/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VITE_API_KEY" \
  -d '{"sql": "ALTER TABLE projects ADD COLUMN icon TEXT DEFAULT '\''📋'\''"}' 2>/dev/null || echo "Column may already exist"

echo ""

# Create tags table
echo "Creating tags table..."
curl -X POST "$VITE_BASE_URL/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VITE_API_KEY" \
  -d '{"sql": "CREATE TABLE IF NOT EXISTS tags (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, color TEXT NOT NULL)"}'

echo ""

# Create task_tags junction table
echo "Creating task_tags table..."
curl -X POST "$VITE_BASE_URL/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VITE_API_KEY" \
  -d '{"sql": "CREATE TABLE IF NOT EXISTS task_tags (task_id INTEGER NOT NULL, tag_id INTEGER NOT NULL, PRIMARY KEY (task_id, tag_id))"}'

echo ""
echo "Database migration completed!"
