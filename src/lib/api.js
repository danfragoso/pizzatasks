// API utilities and stores - Direct PizzaBase connection
import { writable } from 'svelte/store';

const BASE_URL = import.meta.env.DEV
  ? '/pizzabase'
  : 'https://database.pizzaria.foundation/tasks/production';
const API_KEY = 'pz_live_MBahTdDbYPRGcub4GIEkMdV_VHpvpczhWm6Dt7g5tw4=';

export const theme = writable(localStorage.getItem('pizzatask-theme') || 'light');

theme.subscribe(value => {
  localStorage.setItem('pizzatask-theme', value);
  document.documentElement.setAttribute('data-theme', value);
});

export function toggleTheme() {
  theme.update(t => t === 'light' ? 'dark' : 'light');
}

// Helper to ensure IDs are integers for SQLite
function toInt(val) {
  if (val === null || val === undefined || val === '') return null;
  const num = parseInt(val, 10);
  return isNaN(num) ? null : num;
}

// Direct PizzaBase query function
async function query(sql, params = []) {
  try {
    const res = await fetch(`${BASE_URL}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ sql, params }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      console.error('PizzaBase query failed:', {
        status: res.status,
        statusText: res.statusText,
        error: data.error || data,
        sql,
        params
      });
      throw new Error(data.error || `Query failed: ${res.statusText}`);
    }
    
    // Convert array rows to objects using column names
    if (data.rows && data.columns) {
      data.rows = data.rows.map(row => {
        const obj = {};
        data.columns.forEach((col, i) => {
          obj[col.name] = row[i];
        });
        return obj;
      });
    }
    
    return data;
  } catch (error) {
    console.error('PizzaBase query error:', error);
    throw error;
  }
}

// API functions
export const api = {
  async projects() {
    const result = await query("SELECT * FROM projects ORDER BY created_at DESC");
    return result.rows || [];
  },

  async getProject(id) {
    id = toInt(id);
    const projectResult = await query("SELECT * FROM projects WHERE id = ?", [id]);
    const project = projectResult.rows?.[0] || null;

    const columnsResult = await query(
      "SELECT * FROM columns WHERE project_id = ? ORDER BY position",
      [id]
    );
    const columns = columnsResult.rows || [];

    const tasksResult = await query(
      `SELECT t.id, t.project_id, t.column_id, t.title, t.description, t.assignee_id, t.due_date, t.position, t.created_at,
              u.username as assignee_username, c.name as column_name
       FROM tasks t
       LEFT JOIN users u ON t.assignee_id = u.id
       LEFT JOIN columns c ON t.column_id = c.id
       WHERE t.project_id = ?
       ORDER BY t.position`,
      [id]
    );
    const tasks = tasksResult.rows || [];


    return { project, columns, tasks };
  },

  async createProject(name, description, icon = '📋') {
    await query(
      "INSERT INTO projects (name, description, icon) VALUES (?, ?, ?)",
      [name, description, icon]
    );
    
    const idResult = await query("SELECT MAX(id) as id FROM projects");
    const projectId = idResult.rows?.[0]?.id;
    
    if (!projectId) throw new Error("Failed to get project ID");
    
    // Create default columns
    await query(
      "INSERT INTO columns (project_id, name, position) VALUES (?, ?, ?)",
      [projectId, 'todo', 0]
    );
    await query(
      "INSERT INTO columns (project_id, name, position) VALUES (?, ?, ?)",
      [projectId, 'doing', 1]
    );
    await query(
      "INSERT INTO columns (project_id, name, position) VALUES (?, ?, ?)",
      [projectId, 'done', 2]
    );
    
    return { id: projectId };
  },

  async updateProject(id, name, description, icon) {
    return await query(
      "UPDATE projects SET name = ?, description = ?, icon = ? WHERE id = ?",
      [name, description, icon, toInt(id)]
    );
  },

  async deleteProject(id) {
    id = toInt(id);
    await query("DELETE FROM tasks WHERE project_id = ?", [id]);
    await query("DELETE FROM columns WHERE project_id = ?", [id]);
    await query("DELETE FROM projects WHERE id = ?", [id]);
  },

  async getUsers() {
    const result = await query("SELECT * FROM users ORDER BY username");
    return result.rows || [];
  },

  async createUser(username) {
    await query("INSERT INTO users (username) VALUES (?)", [username]);
    const idResult = await query("SELECT MAX(id) as id FROM users");
    return { id: idResult.rows?.[0]?.id };
  },

  async createTask(projectId, data) {
    await query(
      "INSERT INTO tasks (project_id, column_id, title, description, assignee_id, due_date, position) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [toInt(projectId), toInt(data.columnId), data.title, data.description, toInt(data.assigneeId), data.dueDate, toInt(data.position)]
    );
    const idResult = await query("SELECT MAX(id) as id FROM tasks");
    return { id: idResult.rows?.[0]?.id };
  },

  async updateTask(id, data) {
    const fields = [];
    const values = [];
    
    if (data.title !== undefined) {
      fields.push("title = ?");
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push("description = ?");
      values.push(data.description);
    }
    if (data.columnId !== undefined) {
      fields.push("column_id = ?");
      values.push(toInt(data.columnId));
    }
    if (data.assigneeId !== undefined) {
      fields.push("assignee_id = ?");
      values.push(toInt(data.assigneeId));
    }
    if (data.dueDate !== undefined) {
      fields.push("due_date = ?");
      // Ensure null is passed for empty/null dates, not empty string
      values.push(data.dueDate === '' ? null : data.dueDate);
    }
    if (data.position !== undefined) {
      fields.push("position = ?");
      values.push(toInt(data.position));
    }
    
    values.push(toInt(id));
    
    return await query(
      `UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
  },

  async deleteTask(id) {
    await query("DELETE FROM tasks WHERE id = ?", [toInt(id)]);
  },

  async createColumn(projectId, name, position) {
    await query(
      "INSERT INTO columns (project_id, name, position) VALUES (?, ?, ?)",
      [toInt(projectId), name, toInt(position)]
    );
    const idResult = await query("SELECT MAX(id) as id FROM columns");
    return { id: idResult.rows?.[0]?.id };
  },

  async updateColumn(id, name, position) {
    return await query(
      "UPDATE columns SET name = ?, position = ? WHERE id = ?",
      [name, toInt(position), toInt(id)]
    );
  },

  async deleteColumn(id) {
    id = toInt(id);
    await query("DELETE FROM tasks WHERE column_id = ?", [id]);
    await query("DELETE FROM columns WHERE id = ?", [id]);
  },

  // Tags
  async getTags() {
    const result = await query("SELECT * FROM tags ORDER BY name");
    return result.rows || [];
  },

  async createTag(name, color) {
    await query("INSERT INTO tags (name, color) VALUES (?, ?)", [name, color]);
    const idResult = await query("SELECT MAX(id) as id FROM tags");
    return { id: idResult.rows?.[0]?.id };
  },

  async addTagToTask(taskId, tagId) {
    await query("INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)", [toInt(taskId), toInt(tagId)]);
  },

  async removeTagFromTask(taskId, tagId) {
    await query("DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?", [toInt(taskId), toInt(tagId)]);
  },

  async setTaskTags(taskId, tagIds) {
    await query("DELETE FROM task_tags WHERE task_id = ?", [toInt(taskId)]);
    const uniqueTagIds = [...new Set(tagIds)];
    for (const tagId of uniqueTagIds) {
      await query("INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)", [toInt(taskId), toInt(tagId)]);
    }
  }
};
