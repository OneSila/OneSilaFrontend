<template>
  <div class="mb-10 md:mb-[60px]">
    <ul class="flex justify-center gap-3.5 text-white">
      <li>
        <SocialMediaLogin platform="google" />
      </li>
      <li>
        <SocialMediaLogin platform="office365" />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import SocialMediaLogin from "../../molecules/social-media-login/SocialMediaLogin.vue";

</script>