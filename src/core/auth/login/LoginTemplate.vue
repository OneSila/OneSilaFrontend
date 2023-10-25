<template>
  <div>
    <slot name="background-image"/>

    <div
        class="relative flex min-h-screen items-center justify-center bg-[url(/src/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">

      <slot name="foreground-images"/>

      <div
          class="relative flex w-full max-w-[1502px] flex-col justify-between overflow-hidden rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 lg:min-h-[758px] lg:flex-row lg:gap-10 xl:gap-0"
      >
        <div
            class="relative hidden w-full items-center justify-center bg-[linear-gradient(225deg,rgba(239,18,98,1)_0%,rgba(67,97,238,1)_100%)] p-5 lg:inline-flex lg:max-w-[835px] xl:-ms-28 ltr:xl:skew-x-[14deg] rtl:xl:skew-x-[-14deg]"
        >
          <div
              class="absolute inset-y-0 w-8 from-primary/10 via-transparent to-transparent ltr:-right-10 ltr:bg-gradient-to-r rtl:-left-10 rtl:bg-gradient-to-l xl:w-16 ltr:xl:-right-20 rtl:xl:-left-20"
          >

          </div>

          <div class="ltr:xl:-skew-x-[14deg] rtl:xl:skew-x-[14deg]">
            <slot name="left-section"/>
          </div>
        </div>
        <div class="relative flex w-full flex-col items-center justify-center gap-6 px-4 pb-16 pt-6 sm:px-6 lg:max-w-[667px]">
          <div class="flex w-full max-w-[440px] items-center gap-2 lg:absolute lg:end-6 lg:top-6 lg:max-w-full">
            <slot name="right-section-header"/>
          </div>
          <div class="w-full max-w-[440px] lg:mt-16">
            <slot name="right-section-content"/>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
