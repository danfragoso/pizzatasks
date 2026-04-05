<script>
  export let show = false;
  export let title = '';

  function handleKeydown(e) {
    if (e.key === 'Escape') show = false;
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) show = false;
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
  <div class="modal" on:click={handleBackdropClick} role="dialog" aria-modal="true" aria-label={title}>
    <div class="modal-content">
      <div class="modal-header">
        <h3>{title}</h3>
        <button class="close-btn" type="button" on:click={() => show = false} aria-label="Close">&times;</button>
      </div>
      <div class="modal-body">
        <slot />
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-body {
    padding: 20px;
  }
</style>
