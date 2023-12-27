<template>
  <div class="profile-panel">
    <slot name="header"></slot>
    <div class="profile-body">
      <slot name="avatar"></slot>
      <slot name="info"></slot>
    </div>
    <slot name="footer"></slot>
  </div>
</template>
<script setup lang="ts">
</script>