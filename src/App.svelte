<script>
  import { onMount } from 'svelte';
  import Nav from './lib/Nav.svelte';
  import ProjectsPage from './lib/ProjectsPage.svelte';
  import ProjectBoard from './lib/ProjectBoard.svelte';

  let currentPage = 'projects';
  let currentProjectId = null;

  onMount(() => {
    // Simple routing based on URL hash
    function route() {
      const hash = window.location.hash.slice(1);
      if (hash.startsWith('project/')) {
        currentPage = 'project';
        currentProjectId = hash.split('/')[1];
      } else {
        currentPage = 'projects';
        currentProjectId = null;
      }
    }

    route();
    window.addEventListener('hashchange', route);
    return () => window.removeEventListener('hashchange', route);
  });
</script>

<Nav />

<main class="container">
  {#if currentPage === 'projects'}
    <ProjectsPage />
  {:else if currentPage === 'project'}
    <ProjectBoard projectId={currentProjectId} />
  {/if}
</main>
