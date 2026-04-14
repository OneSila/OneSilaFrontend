<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from '../../../../../shared/components/atoms/button';

const props = defineProps<{
  apiKey: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { t } = useI18n();

const activeInfoTab = ref<'claude' | 'exportFeed'>('claude');
const activeClaudeRequirementTab = ref<'mac' | 'windows'>('mac');
const infoTabs = computed<{ name: 'claude' | 'exportFeed'; label: string }[]>(() => [
  { name: 'claude', label: t('companyProfile.mcpApiKey.info.tabs.claude') },
  { name: 'exportFeed', label: t('companyProfile.mcpApiKey.info.tabs.exportFeed') },
]);
const claudeRequirementTabs = computed<{ name: 'mac' | 'windows'; label: string }[]>(() => [
  { name: 'mac', label: t('companyProfile.mcpApiKey.info.claude.requirements.tabs.mac') },
  { name: 'windows', label: t('companyProfile.mcpApiKey.info.claude.requirements.tabs.windows') },
]);
const codeBlockClass = 'mt-3 max-h-80 overflow-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs leading-5 text-slate-100 dark:border-slate-700';
const appOrigin = computed(() => (typeof window !== 'undefined' ? window.location.origin : 'https://hostname'));
const exportFeedUrl = 'https://hostname/path/to/feed/feed_key';
const bearerToken = computed(() => `Bearer ${props.apiKey}`);
const mcpServerConfig = computed(() => ({
  command: 'npx',
  args: [
    'mcp-remote',
    `${appOrigin.value}/mcp/`,
    '--header',
    'Authorization:${MCP_AUTH_TOKEN}',
  ],
  env: {
    MCP_AUTH_TOKEN: bearerToken.value,
  },
}));
const claudeServerSnippet = computed(() => JSON.stringify(mcpServerConfig.value, null, 2)
  .split('\n')
  .map((line, index) => (index === 0 ? `"onesila": ${line}` : line))
  .join('\n'));
const claudeFullConfigSnippet = computed(() => JSON.stringify({
  mcpServers: {
    onesila: mcpServerConfig.value,
  },
  preferences: {
    coworkScheduledTasksEnabled: true,
    ccdScheduledTasksEnabled: true,
    sidebarMode: 'chat',
    coworkWebSearchEnabled: true,
  },
}, null, 2));
const macArchitectureSnippet = `uname -m`;
const nodeVersionSnippet = `node --version
npm --version
npx --version`;
const macRequirementSteps = computed(() => [
  t('companyProfile.mcpApiKey.info.claude.requirements.mac.steps.openTerminal'),
  t('companyProfile.mcpApiKey.info.claude.requirements.mac.steps.runArchitectureCommand'),
  t('companyProfile.mcpApiKey.info.claude.requirements.mac.steps.chooseArchitecture'),
  t('companyProfile.mcpApiKey.info.claude.requirements.mac.steps.downloadInstaller'),
  t('companyProfile.mcpApiKey.info.claude.requirements.mac.steps.runInstaller'),
  t('companyProfile.mcpApiKey.info.claude.requirements.mac.steps.verifyAgain'),
]);
const windowsRequirementSteps = computed(() => [
  t('companyProfile.mcpApiKey.info.claude.requirements.windows.steps.openCommandPrompt'),
  t('companyProfile.mcpApiKey.info.claude.requirements.windows.steps.openSettings'),
  t('companyProfile.mcpApiKey.info.claude.requirements.windows.steps.openAbout'),
  t('companyProfile.mcpApiKey.info.claude.requirements.windows.steps.chooseInstaller'),
  t('companyProfile.mcpApiKey.info.claude.requirements.windows.steps.downloadInstaller'),
  t('companyProfile.mcpApiKey.info.claude.requirements.windows.steps.runInstaller'),
  t('companyProfile.mcpApiKey.info.claude.requirements.windows.steps.verifyAgain'),
]);
const curlExportFeedSnippet = computed(() => `curl \\
  -H "Authorization: ${bearerToken.value}" \\
  "${exportFeedUrl}"`);
const pythonExportFeedSnippet = computed(() => `import requests

feed_url = "${exportFeedUrl}"
api_token = "${props.apiKey}"

response = requests.get(
    feed_url,
    headers={"Authorization": f"Bearer {api_token}"},
    timeout=30,
)
response.raise_for_status()

data = response.json()
print(data)`);
const phpExportFeedSnippet = computed(() => `<?php

$feedUrl = '${exportFeedUrl}';
$apiToken = '${props.apiKey}';

$ch = curl_init($feedUrl);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $apiToken,
    ],
]);

$response = curl_exec($ch);
$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($response === false || $statusCode >= 400) {
    throw new RuntimeException(curl_error($ch) ?: 'Export feed request failed.');
}

curl_close($ch);

$data = json_decode($response, true);
print_r($data);`);

const close = () => emit('close');
</script>

<template>
  <div class="w-[min(62rem,calc(100vw-2rem))] rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900 sm:p-8">
    <div class="min-w-0">
      <p class="text-sm font-semibold uppercase text-primary">
        {{ t('companyProfile.mcpApiKey.info.eyebrow') }}
      </p>
      <h2 class="mt-2 text-2xl font-semibold text-slate-900 dark:text-white-light">
        {{ t('companyProfile.mcpApiKey.info.title') }}
      </h2>
      <p class="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-300">
        {{ t('companyProfile.mcpApiKey.info.description') }}
      </p>
    </div>

    <div class="mt-6 border-b border-slate-200 dark:border-slate-700">
      <div class="flex gap-2 overflow-x-auto">
        <button
          v-for="tab in infoTabs"
          :key="tab.name"
          type="button"
          class="border-b-2 px-4 py-3 text-sm font-semibold transition"
          :class="activeInfoTab === tab.name ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white-light'"
          @click="activeInfoTab = tab.name"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="mt-6 max-h-[65vh] overflow-y-auto pr-1">
      <div v-if="activeInfoTab === 'claude'" class="space-y-5">
        <section class="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/40">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white-light">
            {{ t('companyProfile.mcpApiKey.info.claude.requirements.title') }}
          </h3>
          <p class="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-300">
            {{ t('companyProfile.mcpApiKey.info.claude.requirements.description') }}
          </p>
          <h4 class="mt-5 text-sm font-semibold text-slate-900 dark:text-white-light">
            {{ t('companyProfile.mcpApiKey.info.claude.requirements.checkFirstTitle') }}
          </h4>
          <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">
            {{ t('companyProfile.mcpApiKey.info.claude.requirements.checkFirstDescription') }}
          </p>
          <pre :class="codeBlockClass"><code>{{ nodeVersionSnippet }}</code></pre>
          <p class="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-300">
            {{ t('companyProfile.mcpApiKey.info.claude.requirements.skipIfVersions') }}
          </p>

          <div class="mt-5 border-b border-slate-200 dark:border-slate-700">
            <div class="flex gap-2 overflow-x-auto">
              <button
                v-for="tab in claudeRequirementTabs"
                :key="tab.name"
                type="button"
                class="border-b-2 px-4 py-3 text-sm font-semibold transition"
                :class="activeClaudeRequirementTab === tab.name ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white-light'"
                @click="activeClaudeRequirementTab = tab.name"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>

          <div v-if="activeClaudeRequirementTab === 'mac'" class="mt-5">
            <h4 class="text-base font-semibold text-slate-900 dark:text-white-light">
              {{ t('companyProfile.mcpApiKey.info.claude.requirements.mac.title') }}
            </h4>
            <ol class="mt-3 list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-500 dark:text-slate-300">
              <li
                v-for="(step, index) in macRequirementSteps"
                :key="index"
              >
                {{ step }}
              </li>
            </ol>
            <pre :class="codeBlockClass"><code>{{ macArchitectureSnippet }}</code></pre>
            <ul class="mt-4 space-y-2 text-sm leading-6 text-slate-500 dark:text-slate-300">
              <li>{{ t('companyProfile.mcpApiKey.info.claude.requirements.mac.appleSilicon') }}</li>
              <li>{{ t('companyProfile.mcpApiKey.info.claude.requirements.mac.intel') }}</li>
            </ul>
            <p class="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-300">
              {{ t('companyProfile.mcpApiKey.info.claude.requirements.nodeDownloadLabel') }}
              <a
                class="font-semibold text-primary underline-offset-4 hover:underline"
                href="https://nodejs.org/en/download"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://nodejs.org/en/download
              </a>
            </p>
            <pre :class="codeBlockClass"><code>{{ nodeVersionSnippet }}</code></pre>
          </div>

          <div v-else class="mt-5">
            <h4 class="text-base font-semibold text-slate-900 dark:text-white-light">
              {{ t('companyProfile.mcpApiKey.info.claude.requirements.windows.title') }}
            </h4>
            <ol class="mt-3 list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-500 dark:text-slate-300">
              <li
                v-for="(step, index) in windowsRequirementSteps"
                :key="index"
              >
                {{ step }}
              </li>
            </ol>
            <p class="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-300">
              {{ t('companyProfile.mcpApiKey.info.claude.requirements.nodeDownloadLabel') }}
              <a
                class="font-semibold text-primary underline-offset-4 hover:underline"
                href="https://nodejs.org/en/download"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://nodejs.org/en/download
              </a>
            </p>
            <pre :class="codeBlockClass"><code>{{ nodeVersionSnippet }}</code></pre>
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/40">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white-light">
            {{ t('companyProfile.mcpApiKey.info.claude.title') }}
          </h3>
          <p class="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-300">
            {{ t('companyProfile.mcpApiKey.info.claude.instructions') }}
          </p>
          <pre :class="codeBlockClass"><code>{{ claudeServerSnippet }}</code></pre>
        </section>

        <section class="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <h3 class="text-lg font-semibold">
            {{ t('companyProfile.mcpApiKey.info.claude.fullExampleTitle') }}
          </h3>
          <p class="mt-3 text-sm leading-6">
            {{ t('companyProfile.mcpApiKey.info.claude.fullExampleDisclaimer') }}
          </p>
          <pre :class="codeBlockClass"><code>{{ claudeFullConfigSnippet }}</code></pre>
        </section>
      </div>

      <div v-else class="space-y-5">
        <section class="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/40">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white-light">
            {{ t('companyProfile.mcpApiKey.info.exportFeed.title') }}
          </h3>
          <p class="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-300">
            {{ t('companyProfile.mcpApiKey.info.exportFeed.description') }}
          </p>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/40">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white-light">
            {{ t('companyProfile.mcpApiKey.info.exportFeed.curlTitle') }}
          </h3>
          <pre :class="codeBlockClass"><code>{{ curlExportFeedSnippet }}</code></pre>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/40">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white-light">
            {{ t('companyProfile.mcpApiKey.info.exportFeed.pythonTitle') }}
          </h3>
          <pre :class="codeBlockClass"><code>{{ pythonExportFeedSnippet }}</code></pre>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/40">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white-light">
            {{ t('companyProfile.mcpApiKey.info.exportFeed.phpTitle') }}
          </h3>
          <pre :class="codeBlockClass"><code>{{ phpExportFeedSnippet }}</code></pre>
        </section>
      </div>
    </div>

    <div class="mt-8 flex justify-end">
      <Button class="btn btn-outline-dark" @click="close">
        {{ t('shared.button.cancel') }}
      </Button>
    </div>
  </div>
</template>
