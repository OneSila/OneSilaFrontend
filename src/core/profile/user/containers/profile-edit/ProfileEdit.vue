<script lang="ts" setup>
import { MeData } from '../../meData';
import { ProfileEditForm } from "./containers/profile-edit-form";
import { PasswordChangeForm } from "./containers/password-change-form";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue';
import { Icon } from "../../../../../shared/components/atoms/icon";

import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps<{ meData: MeData }>();

const emit = defineEmits(['updateComplete', 'unsavedChanges']);

const handleUnsavedChanges = (newVal) => {
  emit('unsavedChanges', newVal);
};

const handleUpdateComplete = () => {
  emit('updateComplete');
};

</script>


<template>
            <TabGroup>
                <TabList class="flex font-semibold border-b border-[#ebedf2] dark:border-[#191e3a] mb-5 whitespace-nowrap overflow-y-auto">
                    <Tab as="template" v-slot="{ selected }">
                        <a
                            href="javascript:;"
                            class="flex gap-2 p-4 border-b border-transparent hover:border-primary hover:text-primary !outline-none"
                            :class="{ '!border-primary text-primary': selected }"
                        >
                            <Icon name="id-card" />
                            {{ t('profile.tabs.general') }}
                        </a>
                    </Tab>
                    <Tab as="template" v-slot="{ selected }">
                        <a
                            href="javascript:;"
                            class="flex gap-2 p-4 border-b border-transparent hover:border-primary hover:text-primary !outline-none"
                            :class="{ '!border-primary text-primary': selected }"
                        >
                            <Icon name="cog" />
                            {{ t('profile.tabs.security') }}
                        </a>
                    </Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <ProfileEditForm :me-data="meData" @unsaved-changes="handleUnsavedChanges" @update-complete="handleUpdateComplete" />
                    </TabPanel>
                    <TabPanel>
                        <PasswordChangeForm @unsaved-changes="handleUnsavedChanges" @update-complete="handleUpdateComplete" />
                    </TabPanel>
                </TabPanels>
            </TabGroup>
</template>