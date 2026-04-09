<script>
  import { createEventDispatcher } from 'svelte';
  import { api } from './api.js';
  import Modal from './Modal.svelte';

  export let task;
  export let projectName = '';

  const dispatch = createEventDispatcher();

  let showEditModal = false;
  let editingTask = {};
  let columns = [];
  let users = [];
  let isDragging = false;
  let copied = false;

  function copyTask() {
    const text = `------------------\nProject: ${projectName}\nTitle: ${task.title}\nDescription: ${task.description || ''}`;
    navigator.clipboard.writeText(text).then(() => {
      copied = true;
      setTimeout(() => { copied = false; }, 1500);
    });
  }

  function handleDragStart(e) {
    isDragging = true;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id.toString());
  }

  function handleDragEnd() {
    isDragging = false;
  }

  function handleClick(e) {
    // Don't open edit modal if we just finished dragging
    if (!isDragging) {
      openEdit();
    }
  }

  async function openEdit() {
    editingTask = {
      columnId: task.column_id,
      title: task.title,
      description: task.description || '',
      assigneeId: task.assignee_id ? task.assignee_id.toString() : '',
      newAssignee: ''
    };

    // Load columns and users for the dropdown
    const projectId = task.project_id;
    const data = await api.getProject(projectId);
    columns = data.columns;
    users = await api.getUsers();

    showEditModal = true;
  }

  async function updateTask() {
    try {
      let assigneeId = null;
      
      if (editingTask.assigneeId === 'new' && editingTask.newAssignee.trim()) {
        // Create new user
        const result = await api.createUser(editingTask.newAssignee.trim());
        assigneeId = result.id;
      } else if (editingTask.assigneeId && editingTask.assigneeId !== 'new') {
        assigneeId = parseInt(editingTask.assigneeId);
      }

      await api.updateTask(task.id, {
        columnId: parseInt(editingTask.columnId),
        title: editingTask.title,
        description: editingTask.description,
        assigneeId
      });

      dispatch('updated');
      showEditModal = false;
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  }

  async function deleteTask() {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await api.deleteTask(task.id);
      dispatch('updated');
      showEditModal = false;
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  }


</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<div
  class="task-card"
  class:dragging={isDragging}
  draggable="true"
  role="button"
  tabindex="0"
  on:dragstart={handleDragStart}
  on:dragend={handleDragEnd}
  on:click={handleClick}
  on:keydown={(e) => e.key === 'Enter' && handleClick(e)}
>
  <div class="task-card-top">
    <h4 class="task-title">{task.title}</h4>
    <button
      class="copy-btn"
      class:copied
      type="button"
      draggable="false"
      on:click|stopPropagation={copyTask}
      title="Copy task"
    >
      {#if copied}
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
      {/if}
    </button>
  </div>
  {#if task.description}
    <p class="task-description">{task.description}</p>
  {/if}
  <div class="task-meta">
    {#if task.assignee_username}
      <span class="task-assignee">@{task.assignee_username}</span>
    {/if}
  </div>
</div>

<Modal bind:show={showEditModal} title="Edit Task">
  <form on:submit|preventDefault={updateTask}>
    <div class="form-group">
      <label for="editTaskColumn">Column</label>
      <select id="editTaskColumn" bind:value={editingTask.columnId} required>
        {#each columns as column}
          <option value={column.id}>{column.name}</option>
        {/each}
      </select>
    </div>
    <div class="form-group">
      <label for="editTaskTitle">Title</label>
      <input type="text" id="editTaskTitle" bind:value={editingTask.title} required>
    </div>
    <div class="form-group">
      <label for="editTaskDescription">Description</label>
      <textarea id="editTaskDescription" bind:value={editingTask.description} rows="3"></textarea>
    </div>
    <div class="form-group">
      <label for="editTaskAssignee">Assignee</label>
      <select id="editTaskAssignee" bind:value={editingTask.assigneeId}>
        <option value="">No assignee</option>
        {#each users as user}
          <option value={user.id}>@{user.username}</option>
        {/each}
        <option value="new">+ Create new user</option>
      </select>
    </div>
    {#if editingTask.assigneeId === 'new'}
      <div class="form-group">
        <label for="editNewAssignee">New User Username</label>
        <input type="text" id="editNewAssignee" bind:value={editingTask.newAssignee} placeholder="username">
      </div>
    {/if}
    <div class="modal-footer">
      <button type="button" class="btn btn-destructive" on:click={deleteTask}>Delete</button>
      <div style="flex:1"></div>
      <button type="button" class="btn btn-outline" on:click={() => showEditModal = false}>Cancel</button>
      <button type="submit" class="btn btn-primary">Save</button>
    </div>
  </form>
</Modal>
<style>
  /* no local styles needed — all in app.css */
</style>