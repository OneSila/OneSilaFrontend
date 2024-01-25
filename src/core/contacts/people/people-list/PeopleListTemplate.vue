<template>
  <div>
    <div class="flex items-center justify-between flex-wrap gap-4">
      <slot name="breadcrumbs"></slot>
      <div class="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
          <slot name="buttons"></slot>
      </div>
  </div>
    <slot name="content"></slot>
  </div>
</template>
