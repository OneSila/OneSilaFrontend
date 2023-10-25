<script setup lang="ts">
import LanguagesQuery from '../../../shared/api/queries/LanguagesQuery.vue'

import { EditProfileForm } from './containers/edit-profile-form'

import ProfileTemplate from './ProfileTemplate.vue'
</script>

<template>
  <LanguagesQuery>
    <template v-slot="{ languages }">
      <ProfileTemplate class="profile-controller">
        <template v-slot:form>
          <EditProfileForm :languages="languages" />
        </template>
      </ProfileTemplate>
    </template>
  </LanguagesQuery>
</template>
