<script>
  import { onMount } from 'svelte';
  import { api } from './api.js';
  import Modal from './Modal.svelte';
  import TaskCard from './TaskCard.svelte';
  import Column from './Column.svelte';

  export let projectId;

  let project = null;
  let columns = [];
  let tasks = [];
  let users = [];
  let loading = true;

  // Modals
  let showNewTaskModal = false;
  let showEditProjectModal = false;
  let showNewColumnModal = false;

  // Forms
  let newTask = { columnId: '', title: '', description: '', assigneeId: '', newAssignee: '' };
  let editingProject = { name: '', description: '', icon: '📋' };
  let newColumn = { name: '' };

  const iconOptions = [
    '📋', '📝', '✅', '🎯', '🚀', '💡', '⭐', '🔥', '💼', '🏆', '📊', '🎨', '🔧', '📱', '💻', '🏠',
    '📚', '🎓', '🎮', '🎬', '🎵', '🎤', '🎸', '🎹', '🎺', '🎻', '🎭', '🖼️', '🎪', '🎡', '🎢', '🎠',
    '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🏑', '🥅', '⛳', '🏹',
    '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤸',
    '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅',
    '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞',
    '☀️', '🌙', '⭐', '✨', '⚡', '🔥', '💧', '❄️', '☁️', '🌈', '🌊', '🌍', '🌎', '🌏', '🌋', '🏔️',
    '⛰️', '🏕️', '🏖️', '🏜️', '🏝️', '🏞️', '🌅', '🌄', '🌠', '🌌', '🌃', '🌆', '🌇', '🌁', '🌉', '♨️',
    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵',
    '🚲', '🛴', '🛹', '🚏', '🛣️', '🛤️', '⛽', '🚨', '🚥', '🚦', '🛑', '🚧', '⚓', '⛵', '🛶', '🚤',
    '💎', '💰', '💵', '💴', '💶', '💷', '💳', '🔑', '🔓', '🔒', '🔐', '🔗', '⚙️', '🔨', '🔧', '⚒️'
  ];

  onMount(async () => {
    await loadProject();
  });

  async function loadProject() {
    loading = true;
    try {
      const data = await api.getProject(projectId);
      project = data.project;
      columns = data.columns;
      tasks = data.tasks;
      
      if (project) {
        editingProject = { name: project.name, description: project.description || '', icon: project.icon || '📋' };
      }
    } catch (error) {
      console.error('Error loading project:', error);
    }
    loading = false;
  }

  async function refreshProject() {
    // Silent refresh without showing loading state
    try {
      const data = await api.getProject(projectId);
      project = data.project;
      columns = data.columns;
      tasks = data.tasks;
      
      if (project) {
        editingProject = { name: project.name, description: project.description || '', icon: project.icon || '📋' };
      }
    } catch (error) {
      console.error('Error refreshing project:', error);
    }
  }

  async function createTask() {
    if (!newTask.title.trim() || !newTask.columnId) return;

    try {
      let assigneeId = null;
      
      if (newTask.assigneeId === 'new' && newTask.newAssignee.trim()) {
        // Create new user
        const result = await api.createUser(newTask.newAssignee.trim());
        assigneeId = result.id;
      } else if (newTask.assigneeId && newTask.assigneeId !== 'new') {
        assigneeId = parseInt(newTask.assigneeId);
      }

      const result = await api.createTask(projectId, {
        columnId: parseInt(newTask.columnId),
        title: newTask.title,
        description: newTask.description,
        assigneeId,
        position: 0
      });

      // Add tags to task
      await loadProject();
      showNewTaskModal = false;
      newTask = { columnId: '', title: '', description: '', assigneeId: '', newAssignee: '' };
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  }

  async function updateProject() {
    try {
      await api.updateProject(projectId, editingProject.name, editingProject.description, editingProject.icon);
      await loadProject();
      showEditProjectModal = false;
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project');
    }
  }

  async function deleteProject() {
    if (!confirm('Are you sure you want to delete this project? This will delete all tasks and columns.')) return;

    try {
      await api.deleteProject(projectId);
      window.location.hash = '#';
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  }

  async function createColumn() {
    if (!newColumn.name.trim()) return;

    try {
      await api.createColumn(projectId, newColumn.name, columns.length);
      await loadProject();
      showNewColumnModal = false;
      newColumn = { name: '' };
    } catch (error) {
      console.error('Error creating column:', error);
      alert('Failed to create column');
    }
  }

  async function onTaskUpdated() {
    await refreshProject();
  }

  async function onColumnUpdated() {
    await refreshProject();
  }

  async function openNewTaskModal() {
    if (columns.length > 0) {
      newTask.columnId = columns[0].id.toString();
    }
    users = await api.getUsers();
    showNewTaskModal = true;
  }

</script>

<svelte:head>
  <title>{project ? project.name : 'Loading...'} - PizzaTask</title>
</svelte:head>

<style>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    flex-wrap: wrap;
  }

  .project-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
    flex-wrap: wrap;
  }

  .project-icon-header {
    font-size: 1.1em;
    margin-right: 6px;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: 500;
    color: var(--muted-foreground);
    text-decoration: none;
    margin-bottom: 6px;
    transition: color 150ms;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-family: inherit;
  }

  .back-link:hover { color: var(--foreground); }
</style>

<div class="header">
  <div>
    <button type="button" class="back-link" on:click={() => window.location.hash = ''}>← All Projects</button>
    <h2 class="page-title">
      <span class="project-icon-header">{project ? (project.icon || '📋') : '📋'}</span>{project ? project.name : 'Loading...'}
    </h2>
    <p class="page-description">{project ? project.description || '' : ''}</p>
  </div>
  <div class="project-actions">
    <button class="btn btn-primary" on:click={openNewTaskModal}>New Task</button>
    <button class="btn btn-outline" on:click={() => showNewColumnModal = true}>New Column</button>
    <button class="btn btn-outline" on:click={() => showEditProjectModal = true}>Edit</button>
  </div>
</div>

{#if loading}
  <div class="loading">Loading board...</div>
{:else if !project}
  <div class="empty-state">
    <h3>Project not found</h3>
    <a href="." class="btn btn-primary">Back to Projects</a>
  </div>
{:else}
  <div class="board">
    {#each columns as column}
      <Column {column} tasks={tasks.filter(t => t.column_id === column.id)} on:updated={onColumnUpdated} on:taskUpdated={onTaskUpdated} />
    {/each}
  </div>
{/if}

<!-- New Task Modal -->
<Modal bind:show={showNewTaskModal} title="Create New Task">
  <form on:submit|preventDefault={createTask}>
    <div class="form-group">
      <label for="taskColumn">Column</label>
      <select id="taskColumn" bind:value={newTask.columnId} required>
        {#each columns as column}
          <option value={column.id}>{column.name}</option>
        {/each}
      </select>
    </div>
    <div class="form-group">
      <label for="taskTitle">Title</label>
      <input type="text" id="taskTitle" bind:value={newTask.title} required>
    </div>
    <div class="form-group">
      <label for="taskDescription">Description</label>
      <textarea id="taskDescription" bind:value={newTask.description} rows="3"></textarea>
    </div>
    <div class="form-group">
      <label for="taskAssignee">Assignee</label>
      <select id="taskAssignee" bind:value={newTask.assigneeId}>
        <option value="">No assignee</option>
        {#each users as user}
          <option value={user.id}>@{user.username}</option>
        {/each}
        <option value="new">+ Create new user</option>
      </select>
    </div>
    {#if newTask.assigneeId === 'new'}
      <div class="form-group">
        <label for="newAssignee">New User Username</label>
        <input type="text" id="newAssignee" bind:value={newTask.newAssignee} placeholder="username">
      </div>
    {/if}
    <div class="modal-footer">
      <div style="flex:1"></div>
      <button type="button" class="btn btn-outline" on:click={() => showNewTaskModal = false}>Cancel</button>
      <button type="submit" class="btn btn-primary">Create Task</button>
    </div>
  </form>
</Modal>

<!-- Edit Project Modal -->
<Modal bind:show={showEditProjectModal} title="Edit Project">
  <form on:submit|preventDefault={updateProject}>
    <div class="form-group">
      <label for="editProjectIcon">Icon</label>
      <div class="icon-picker">
        {#each iconOptions as icon}
          <button 
            type="button" 
            class="icon-option" 
            class:selected={editingProject.icon === icon}
            on:click={() => editingProject.icon = icon}
          >
            {icon}
          </button>
        {/each}
      </div>
    </div>
    <div class="form-group">
      <label for="editProjectName">Project Name</label>
      <input type="text" id="editProjectName" bind:value={editingProject.name} required>
    </div>
    <div class="form-group">
      <label for="editProjectDescription">Description</label>
      <textarea id="editProjectDescription" bind:value={editingProject.description} rows="3"></textarea>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-destructive" on:click={deleteProject}>Delete Project</button>
      <div style="flex:1"></div>
      <button type="button" class="btn btn-outline" on:click={() => showEditProjectModal = false}>Cancel</button>
      <button type="submit" class="btn btn-primary">Save Changes</button>
    </div>
  </form>
</Modal>

<!-- New Column Modal -->
<Modal bind:show={showNewColumnModal} title="New Column">
  <form on:submit|preventDefault={createColumn}>
    <div class="form-group">
      <label for="newColumnName">Column Name</label>
      <input type="text" id="newColumnName" bind:value={newColumn.name} required>
    </div>
    <div class="modal-footer">
      <div style="flex:1"></div>
      <button type="button" class="btn btn-outline" on:click={() => showNewColumnModal = false}>Cancel</button>
      <button type="submit" class="btn btn-primary">Create Column</button>
    </div>
  </form>
</Modal>
