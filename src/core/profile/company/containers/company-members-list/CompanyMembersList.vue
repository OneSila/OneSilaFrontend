<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { FilteredMember } from '../../meCompanyData';
import { CompanyInviteMember } from '../company-invite-member';
import { Icon } from "../../../../../shared/components/atoms/icon";
import { Button } from "../../../../../shared/components/atoms/button";
import { Modal } from "../../../../../shared/components/atoms/modal";
import Vue3Datatable from "@bhplugin/vue3-datatable";
import { disableMemberMutation, enableMemberMutation } from "../../../../../shared/api/mutations/members.js";
import "@bhplugin/vue3-datatable/dist/style.css";
import { injectAuth, isCompanyOwner } from '../../../../../shared/modules/auth';

const auth = injectAuth();
const { t } = useI18n();
const props =defineProps<{
  members: any[],
  language: string
}>();

const emit = defineEmits(['refreshRequested']);

const search = ref('');
const filteredMembers = ref<FilteredMember[]>([]);
const showInviteModal = ref(false);

const columns = [
  { title: 'Name', field: 'fullName' },
  { title: 'Email', field: 'email' },
  { title: 'Invitation Accepted', field: 'acceptedInvitation' },
  { title: 'Active', field: 'active' },
];

if (isCompanyOwner(auth)) {
  columns.push({ title: 'Actions', field: 'actions' });
}

const updateFilteredMembers = () => {
  filteredMembers.value = props.members.map(member => ({
    id: member.id,
    isActive: member.isActive,
    fullName: `${member.firstName} ${member.lastName}`,
    email: member.email,
    invitationAccepted: member.invitationAccepted,
    isOwner: member.isMultiTenantCompanyOwner,
  })).filter(member =>
    member.fullName.toLowerCase().includes(search.value.toLowerCase()) ||
    member.email.toLowerCase().includes(search.value.toLowerCase())
  );
};

updateFilteredMembers();

watch(() => props.members, updateFilteredMembers, { deep: true });
watch(search, updateFilteredMembers);

const onInviteSubmitted = () => {
  showInviteModal.value = false;
  emit('refreshRequested');
};
const onMemberActionCompleted = (response) => {
  emit('refreshRequested');
  // @TODO: Add Toast success
};

const onMemberActionError = (error) => {
  // @TODO: Replace with Toast
  alert(error);
};

const inviteMember = () => {
  showInviteModal.value = true;
};

</script>


<template>
  <div class="pb-0 mt-6">
    <div class="flex md:items-center md:flex-row flex-col mb-5 gap-5">
    <h5 class="font-semibold text-lg dark:text-white-light">{{ t('companyProfile.labels.members') }}</h5>
      <div class="ltr:ml-auto rtl:mr-auto flex items-center gap-2">
        <input v-model="search" type="text" class="form-input" :placeholder="t('shared.button.search') + '...'" />
        <Button v-if="isCompanyOwner(auth)" :customClass="'ltr:ml-auto rtl:mr-auto btn btn-primary p-2 rounded-full'" @click="inviteMember">
          <Icon name="plus" />
        </Button>
      </div>
    </div>

    <Modal v-model="showInviteModal" @closed="showInviteModal = false">
        <CompanyInviteMember :language="language" @invite-submitted="onInviteSubmitted" @cancel-clicked="showInviteModal = false" />
    </Modal>

    <div class="datatable">
      <vue3-datatable
        :rows="filteredMembers"
        :columns="columns"
        :totalRows="filteredMembers.length"
        :search="search"
        skin="bh-table-hover">
        <template #fullName="row">
          <div class="flex items-center">
            <Icon name="crown" class="text-yellow-300 mr-2" v-if="row.value.isOwner" />
            <span>{{ row.value.fullName }}</span>
          </div>
        </template>
        <template #acceptedInvitation="row">
          <Icon v-if="row.value.invitationAccepted" name="check-circle" class="text-green-500" />
          <Icon v-else name="times-circle" class="text-red-500" />
        </template>
        <template #active="row">
          <Icon v-if="row.value.isActive" name="check-circle" class="text-green-500" />
          <Icon v-else name="times-circle" class="text-red-500" />
        </template>
        <template #actions="row" v-if="isCompanyOwner(auth)">
          <div v-if="isCompanyOwner(auth) && row.value.invitationAccepted && !row.value.isOwner">
            <ApolloMutation
              v-if="row.value.isActive"
              :mutation="disableMemberMutation"
              :variables="{ id: row.value.id }"
              @done="onMemberActionCompleted"
              @error="onMemberActionError">
              <template #default="{ mutate, loading }">
                <button type="button" :disabled="loading" @click="mutate">
                  <Icon name="trash-alt" class="text-red-500" />
                </button>
              </template>
            </ApolloMutation>
            <ApolloMutation
              v-else
              :mutation="enableMemberMutation"
              :variables="{ id: row.value.id }"
              @done="onMemberActionCompleted"
              @error="onMemberActionError">
              <template #default="{ mutate, loading }">
                <button type="button" :disabled="loading" @click="mutate">
                  <Icon name="undo-alt" class="text-green-500" />
                </button>
              </template>
            </ApolloMutation>
          </div>
        </template>
      </vue3-datatable>
    </div>
  </div>
</template>




