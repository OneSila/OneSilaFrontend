<template>
  <div class="flex min-h-screen items-center justify-center bg-[#f4f6fb] px-4 py-10 dark:bg-[#070c1a] sm:px-10">
    <div
      class="flex w-full max-w-[1380px] flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0b1120] lg:min-h-[580px] lg:flex-row lg:items-stretch"
    >
      <div
        class="relative hidden w-full items-center justify-center bg-[linear-gradient(120deg,rgba(68,64,234,1)_0%,rgba(48,45,180,1)_100%)] p-6 lg:inline-flex lg:max-w-[760px] xl:-ml-20 ltr:xl:skew-x-[12deg] rtl:xl:skew-x-[-12deg]"
      >
        <div
          class="absolute inset-y-0 w-8 from-white/10 via-transparent to-transparent ltr:-right-8 ltr:bg-gradient-to-r rtl:-left-8 rtl:bg-gradient-to-l xl:w-16 ltr:xl:-right-16 rtl:xl:-left-16"
        ></div>
        <div class="w-full ltr:xl:-skew-x-[12deg] rtl:xl:skew-x-[12deg]">
          <slot name="left-section" />
        </div>
      </div>
      <div class="relative flex w-full flex-col items-center justify-center px-6 py-12 sm:px-10 lg:max-w-[620px]">
        <div class="flex w-full max-w-[440px] items-center justify-end gap-2 lg:absolute lg:right-10 lg:top-10 lg:max-w-full">
          <slot name="right-section-header" />
        </div>
        <div class="w-full max-w-[440px] lg:mt-16">
          <slot name="right-section-content" />
          <div class="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
</script>
