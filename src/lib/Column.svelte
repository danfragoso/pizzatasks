<script>
  import { createEventDispatcher } from 'svelte';
  import { api } from './api.js';
  import TaskCard from './TaskCard.svelte';
  import Modal from './Modal.svelte';

  export let column;
  export let tasks;

  const dispatch = createEventDispatcher();

  let showEditModal = false;
  let editingColumn = { name: '' };
  let isDragOver = false;

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    isDragOver = true;
  }

  function handleDragLeave() {
    isDragOver = false;
  }

  async function handleDrop(e) {
    e.preventDefault();
    isDragOver = false;
    
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    try {
      await api.updateTask(parseInt(taskId), {
        columnId: column.id
      });
      dispatch('taskUpdated');
    } catch (error) {
      console.error('Error moving task:', error);
      alert('Failed to move task');
    }
  }

  function openEdit() {
    editingColumn = { name: column.name };
    showEditModal = true;
  }

  async function updateColumn() {
    try {
      await api.updateColumn(column.id, editingColumn.name, column.position);
      dispatch('updated');
      showEditModal = false;
    } catch (error) {
      console.error('Error updating column:', error);
      alert('Failed to update column');
    }
  }

  async function deleteColumn() {
    if (!confirm(`Delete column "${column.name}"? This will delete all tasks in this column.`)) return;

    try {
      await api.deleteColumn(column.id);
      dispatch('updated');
      showEditModal = false;
    } catch (error) {
      console.error('Error deleting column:', error);
      alert('Failed to delete column');
    }
  }

  function onTaskUpdated() {
    dispatch('taskUpdated');
  }
</script>

<div class="column">
  <div class="column-header">
    <h3 class="column-title">{column.name}</h3>
    <div style="display:flex;align-items:center;gap:6px">
      <span class="task-count">{tasks.length}</span>
      <button class="btn btn-ghost btn-sm" type="button" on:click={openEdit} title="Edit column" style="min-height:24px;padding:0 6px;font-size:14px;color:var(--muted-foreground)">···</button>
    </div>
  </div>
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div 
    class="tasks"
    role="list"
    class:drag-over={isDragOver}
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
  >
    {#each tasks as task}
      <TaskCard {task} on:updated={onTaskUpdated} />
    {/each}
  </div>
</div>

<Modal bind:show={showEditModal} title="Edit Column">
  <form on:submit|preventDefault={updateColumn}>
    <div class="form-group">
      <label for="editColumnName">Column Name</label>
      <input type="text" id="editColumnName" bind:value={editingColumn.name} required>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-destructive" on:click={deleteColumn}>Delete</button>
      <div style="flex:1"></div>
      <button type="button" class="btn btn-outline" on:click={() => showEditModal = false}>Cancel</button>
      <button type="submit" class="btn btn-primary">Save</button>
    </div>
  </form>
</Modal>
