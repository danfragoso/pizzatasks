<script>
  import { onMount } from 'svelte';
  import { api } from './api.js';
  import Modal from './Modal.svelte';

  let projects = [];
  let loading = true;
  let showNewProjectModal = false;
  let newProject = { name: '', description: '', icon: '📋' };

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
    await loadProjects();
  });

  async function loadProjects() {
    loading = true;
    projects = await api.projects();
    loading = false;
  }

  async function createProject() {
    if (!newProject.name.trim()) return;
    
    const result = await api.createProject(newProject.name, newProject.description, newProject.icon);
    if (result.id) {
      window.location.hash = `#project/${result.id}`;
    } else {
      await loadProjects();
    }
    
    showNewProjectModal = false;
    newProject = { name: '', description: '', icon: '📋' };
  }
</script>

<svelte:head>
  <title>Projects - PizzaTask</title>
</svelte:head>

<div class="page-header">
  <div>
    <h2 class="page-title">Projects</h2>
    <p class="page-description">Browse and manage your Kanban projects</p>
  </div>
  <button class="btn btn-primary" on:click={() => showNewProjectModal = true}>
    New Project
  </button>
</div>

{#if loading}
  <div class="loading">Loading projects...</div>
{:else if projects.length === 0}
  <div class="empty-state">
    <h3>No projects yet</h3>
    <p>Create your first Kanban project to get started</p>
    <button class="btn btn-primary" on:click={() => showNewProjectModal = true}>
      Create Project
    </button>
  </div>
{:else}
  <div class="projects-grid">
    {#each projects as project}
      <a href="#project/{project.id}" class="project-card">
        <div class="project-icon">{project.icon || '📋'}</div>
        <h3>{project.name}</h3>
        <p>{project.description || 'No description'}</p>
        <div class="project-meta">
          {#if project.created_at}
            Created {new Date(project.created_at).toLocaleDateString()}
          {/if}
        </div>
      </a>
    {/each}
  </div>
{/if}

<Modal bind:show={showNewProjectModal} title="Create New Project">
  <form on:submit|preventDefault={createProject}>
    <div class="form-group">
      <label for="projectIcon">Icon</label>
      <div class="icon-picker">
        {#each iconOptions as icon}
          <button 
            type="button" 
            class="icon-option" 
            class:selected={newProject.icon === icon}
            on:click={() => newProject.icon = icon}
          >
            {icon}
          </button>
        {/each}
      </div>
    </div>
    <div class="form-group">
      <label for="projectName">Project Name</label>
      <input type="text" id="projectName" bind:value={newProject.name} required>
    </div>
    <div class="form-group">
      <label for="projectDescription">Description</label>
      <textarea id="projectDescription" bind:value={newProject.description} rows="3"></textarea>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline" on:click={() => showNewProjectModal = false}>
        Cancel
      </button>
      <div style="flex:1"></div>
      <button type="submit" class="btn btn-primary">Create Project</button>
    </div>
  </form>
</Modal>

<style>
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin: 36px 0 24px;
  }

  .project-icon {
    font-size: 40px;
    margin-bottom: 10px;
    line-height: 1;
  }
</style>
