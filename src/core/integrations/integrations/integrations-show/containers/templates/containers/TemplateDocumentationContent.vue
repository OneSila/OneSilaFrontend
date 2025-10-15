<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Card } from '../../../../../../../shared/components/atoms/card';
import { Button } from '../../../../../../../shared/components/atoms/button';
import { Toast } from '../../../../../../../shared/modules/toast';

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
const exampleKeys = ['images', 'properties', 'full'];

const joinLines = (lines: readonly string[]): string => lines.join('\n');

const copyButtonClass =
  'absolute right-4 top-4 inline-flex items-center rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs font-medium text-white transition hover:bg-gray-700';

const syntaxExamples: Record<string, string> = {
  variables: "<h1>{{ title|default:'Coming soon' }}</h1>",
  filters: '<p>{{ content|truncatewords:80|safe }}</p>',
  conditions: joinLines([
    '{% if discount_price %}',
    '  <p class="sale-banner">Now {{ discount_price }} {{ currency }} (was {{ price }} {{ currency }})</p>',
    '{% endif %}',
  ]),
  loops: joinLines([
    '<ul class="feature-list">',
    '{% for prop in product_properties %}',
    '  <li><strong>{{ prop.name }}:</strong> {{ prop.value }}</li>',
    '{% endfor %}',
    '</ul>',
  ]),
  includes: "{% include 'snippets/channel-footer.html' %}",
};

const exampleCode: Record<string, string> = {
  images: joinLines([
    '{% if images.items %}',
    '<section class="channel-gallery">',
    '  {% for image in images.items %}',
    '    <figure class="channel-gallery__item{% if image.is_main %} channel-gallery__item--highlight{% endif %}">',
    '      <img',
    '        src="{{ image.url }}"',
    '        alt="{{ image.title|default:title }}"',
    '        loading="lazy"',
    '      />',
    '    </figure>',
    '  {% endfor %}',
    '</section>',
    '{% endif %}',
  ]),
  properties: joinLines([
    '{% if product_properties_map %}',
    '<dl class="channel-specs">',
    '  {% if product_properties_map.material %}',
    '    <div class="channel-specs__row">',
    '      <dt>Material</dt>',
    '      <dd>{{ product_properties_map.material.value }}</dd>',
    '    </div>',
    '  {% endif %}',
    '  {% if product_properties_map.color %}',
    '    <div class="channel-specs__row">',
    '      <dt>Color</dt>',
    '      <dd>{{ product_properties_map.color.value }}</dd>',
    '    </div>',
    '  {% endif %}',
    '  {% for prop in product_properties %}',
    "    {% if prop.internal_name not in ['material', 'color'] %}",
    '      <div class="channel-specs__row">',
    '        <dt>{{ prop.name }}</dt>',
    '        <dd>{{ prop.value }}</dd>',
    '      </div>',
    '    {% endif %}',
    '  {% endfor %}',
    '</dl>',
    '{% endif %}',
  ]),
  full: joinLines([
    '<article class="channel-template">',
    '  <header class="channel-template__header">',
    '    {% if brand %}',
    '      <p class="channel-template__brand">{{ brand }}</p>',
    '    {% endif %}',
    '    <h1>{{ title }}</h1>',
    '  </header>',
    '',
    '  <section class="channel-template__pricing">',
    '    {% if discount_price %}',
    '      <span class="channel-template__price--current">{{ discount_price }} {{ currency }}</span>',
    '      <span class="channel-template__price--compare">{{ price }} {{ currency }}</span>',
    '    {% else %}',
    '      <span class="channel-template__price">{{ price }} {{ currency }}</span>',
    '    {% endif %}',
    '  </section>',
    '',
    '  {% if images.main %}',
    '    <img class="channel-template__hero" src="{{ images.main }}" alt="{{ title }}" loading="lazy" />',
    '  {% endif %}',
    '',
    '  <section class="channel-template__content">',
    '    {{ content|safe }}',
    '  </section>',
    '',
    '  {% if product_properties %}',
    '    <section class="channel-template__features">',
    '      <h2>Highlights</h2>',
    '      <ul>',
    '        {% for prop in product_properties %}',
    '          <li><strong>{{ prop.name }}:</strong> {{ prop.value }}</li>',
    '        {% endfor %}',
    '      </ul>',
    '    </section>',
    '  {% endif %}',
    '</article>',
  ]),
};

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
      example: syntaxExamples[key] ?? '',
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

const exampleItems = computed(() =>
  exampleKeys
    .map((key) => ({
      key,
      title: t(`integrations.show.template.documentation.examples.${key}.title`),
      description: t(`integrations.show.template.documentation.examples.${key}.description`),
      code: exampleCode[key] ?? '',
    }))
    .filter((item) => item.title && item.code),
);

const copySnippet = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value);
    Toast.success(t('shared.alert.toast.clipboardSuccess'));
  } catch (error) {
    console.error('Failed to copy snippet', error);
    Toast.error(t('shared.alert.toast.clipboardFail'));
  }
};
</script>

<template>
  <Card class="w-full max-w-5xl overflow-y-auto max-h-[80vh]">
    <div class="space-y-6 p-6 text-gray-800">
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
          <li v-for="item in contextItems" :key="item.key" class="rounded-lg border border-gray-200 bg-gray-50 p-4">
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
            <div v-if="item.example" class="relative mt-3">
              <Button
                :aria-label="t('shared.actions.copy')"
                :custom-class="copyButtonClass"
                @click="copySnippet(item.example)"
              >
                {{ t('shared.actions.copy') }}
              </Button>
              <pre class="overflow-x-auto rounded bg-gray-900 p-4 text-sm text-gray-100">
                <code class="block whitespace-pre" v-text="item.example"></code>
              </pre>
            </div>
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

      <section v-if="exampleItems.length" class="space-y-4">
        <h3 class="text-xl font-semibold">
          {{ t('integrations.show.template.documentation.examples.title') }}
        </h3>
        <article
          v-for="item in exampleItems"
          :key="item.key"
          class="rounded-lg border border-gray-200 p-4"
        >
          <h4 class="text-lg font-semibold text-gray-900">
            {{ item.title }}
          </h4>
          <p class="mt-2 text-sm leading-6">
            {{ item.description }}
          </p>
          <div class="relative mt-3">
            <Button
              :aria-label="t('shared.actions.copy')"
              :custom-class="copyButtonClass"
              @click="copySnippet(item.code)"
            >
              {{ t('shared.actions.copy') }}
            </Button>
            <pre class="overflow-x-auto rounded bg-gray-900 p-4 text-sm text-gray-100">
              <code class="block whitespace-pre" v-text="item.code"></code>
            </pre>
          </div>
        </article>
      </section>
    </div>
  </Card>
</template>
