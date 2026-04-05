#!/bin/bash

# Load environment variables
source .env

echo "Initializing PizzaTask Database Schema..."

# Create users table
echo "Creating users table..."
curl -X POST "$BASE_URL/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"sql": "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"}'

echo ""

# Create projects table
echo "Creating projects table..."
curl -X POST "$BASE_URL/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"sql": "CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"}'

echo ""

# Create columns table (for custom columns per project)
echo "Creating columns table..."
curl -X POST "$BASE_URL/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"sql": "CREATE TABLE IF NOT EXISTS columns (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, name TEXT NOT NULL, position INTEGER NOT NULL)"}'

echo ""

# Create tasks table
echo "Creating tasks table..."
curl -X POST "$BASE_URL/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"sql": "CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, column_id INTEGER NOT NULL, title TEXT NOT NULL, description TEXT, assignee_id INTEGER, due_date TEXT, position INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"}'

echo ""
echo "Database schema initialized successfully!"
