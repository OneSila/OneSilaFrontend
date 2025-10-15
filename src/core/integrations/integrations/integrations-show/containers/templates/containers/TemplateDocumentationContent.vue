<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const contextKeys = [
  'content',
  'title',
  'sku',
  'price',
  'discount_price',
  'currency',
  'brand',
  'language',
  'images',
  'product_properties',
  'product_properties_map',
];

const syntaxKeys = ['variables', 'filters', 'conditions', 'loops', 'includes'];
const tipKeys = ['preview', 'escaping', 'defaults', 'formatting'];

const introParagraphs = computed(() =>
  [
    t('integrations.show.template.documentation.intro.p1'),
    t('integrations.show.template.documentation.intro.p2'),
    t('integrations.show.template.documentation.intro.p3'),
    t('integrations.show.template.documentation.intro.p4'),
  ].filter((paragraph) => paragraph),
);

const contextItems = computed(() =>
  contextKeys
    .map((key) => ({
      key,
      label: t(`integrations.show.template.documentation.sections.context.items.${key}.label`),
      description: t(`integrations.show.template.documentation.sections.context.items.${key}.description`),
    }))
    .filter((item) => item.label),
);

const syntaxItems = computed(() =>
  syntaxKeys
    .map((key) => ({
      key,
      title: t(`integrations.show.template.documentation.sections.syntax.items.${key}.title`),
      description: t(`integrations.show.template.documentation.sections.syntax.items.${key}.description`),
      example: t(`integrations.show.template.documentation.sections.syntax.items.${key}.example`),
    }))
    .filter((item) => item.title),
);

const tipItems = computed(() =>
  tipKeys
    .map((key) => ({
      key,
      text: t(`integrations.show.template.documentation.sections.tips.items.${key}`),
    }))
    .filter((item) => item.text),
);
</script>

<template>
  <div class="w-full max-w-4xl p-6 overflow-y-auto max-h-[80vh] space-y-6 text-gray-800">
    <header class="space-y-3">
      <h2 class="text-2xl font-semibold text-gray-900">
        {{ t('integrations.show.template.documentation.title') }}
      </h2>
      <p v-for="paragraph in introParagraphs" :key="paragraph" class="text-sm">
        {{ paragraph }}
      </p>
      <p class="text-sm" v-if="t('integrations.show.template.documentation.reference.label')">
        <a
          :href="t('integrations.show.template.documentation.reference.url')"
          class="text-primary font-medium underline"
          rel="noreferrer"
          target="_blank"
        >
          {{ t('integrations.show.template.documentation.reference.label') }}
        </a>
      </p>
    </header>

    <section v-if="contextItems.length" class="space-y-4">
      <div>
        <h3 class="text-xl font-semibold">
          {{ t('integrations.show.template.documentation.sections.context.title') }}
        </h3>
        <p class="text-sm text-gray-600">
          {{ t('integrations.show.template.documentation.sections.context.description') }}
        </p>
      </div>
      <ul class="space-y-3">
        <li v-for="item in contextItems" :key="item.key" class="rounded-lg border border-gray-200 p-4 bg-gray-50">
          <p class="font-mono text-sm font-semibold text-primary">{{ item.label }}</p>
          <p class="mt-2 text-sm leading-6">{{ item.description }}</p>
        </li>
      </ul>
    </section>

    <section v-if="syntaxItems.length" class="space-y-4">
      <div>
        <h3 class="text-xl font-semibold">
          {{ t('integrations.show.template.documentation.sections.syntax.title') }}
        </h3>
        <p class="text-sm text-gray-600">
          {{ t('integrations.show.template.documentation.sections.syntax.description') }}
        </p>
      </div>
      <div class="space-y-4">
        <article v-for="item in syntaxItems" :key="item.key" class="rounded-lg border border-gray-200 p-4">
          <h4 class="text-lg font-semibold text-gray-900">{{ item.title }}</h4>
          <p class="mt-2 text-sm leading-6">{{ item.description }}</p>
          <pre v-if="item.example" class="mt-3 overflow-x-auto rounded bg-gray-900 p-4 text-sm text-gray-100">
            <code v-pre>{{ item.example }}</code>
          </pre>
        </article>
      </div>
    </section>

    <section class="space-y-3">
      <h3 class="text-xl font-semibold">
        {{ t('integrations.show.template.documentation.sections.tips.title') }}
      </h3>
      <ul class="list-disc space-y-2 pl-6 text-sm leading-6 text-gray-700">
        <li v-for="item in tipItems" :key="item.key">{{ item.text }}</li>
      </ul>
    </section>

    <section class="space-y-4">
      <h3 class="text-xl font-semibold">
        {{ t('integrations.show.template.documentation.examples.title') }}
      </h3>

      <article class="rounded-lg border border-gray-200 p-4">
        <h4 class="text-lg font-semibold text-gray-900">
          {{ t('integrations.show.template.documentation.examples.images.title') }}
        </h4>
        <p class="mt-2 text-sm leading-6">
          {{ t('integrations.show.template.documentation.examples.images.description') }}
        </p>
        <pre class="mt-3 overflow-x-auto rounded bg-gray-900 p-4 text-sm text-gray-100">
          <code v-pre>{{ t('integrations.show.template.documentation.examples.images.code') }}</code>
        </pre>
      </article>

      <article class="rounded-lg border border-gray-200 p-4">
        <h4 class="text-lg font-semibold text-gray-900">
          {{ t('integrations.show.template.documentation.examples.properties.title') }}
        </h4>
        <p class="mt-2 text-sm leading-6">
          {{ t('integrations.show.template.documentation.examples.properties.description') }}
        </p>
        <pre class="mt-3 overflow-x-auto rounded bg-gray-900 p-4 text-sm text-gray-100">
          <code v-pre>{{ t('integrations.show.template.documentation.examples.properties.code') }}</code>
        </pre>
      </article>

      <article class="rounded-lg border border-gray-200 p-4">
        <h4 class="text-lg font-semibold text-gray-900">
          {{ t('integrations.show.template.documentation.examples.full.title') }}
        </h4>
        <p class="mt-2 text-sm leading-6">
          {{ t('integrations.show.template.documentation.examples.full.description') }}
        </p>
        <pre class="mt-3 overflow-x-auto rounded bg-gray-900 p-4 text-sm text-gray-100">
          <code v-pre>{{ t('integrations.show.template.documentation.examples.full.code') }}</code>
        </pre>
      </article>
    </section>
  </div>
</template>
