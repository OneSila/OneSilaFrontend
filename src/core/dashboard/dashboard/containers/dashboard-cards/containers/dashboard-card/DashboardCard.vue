<script setup lang="ts">
import { defineProps, computed, ref, watchEffect, watch, onMounted, onUnmounted } from 'vue';
import { Icon } from "../../../../../../../shared/components/atoms/icon";
import { Link } from "../../../../../../../shared/components/atoms/link";
import { useI18n } from 'vue-i18n';
import { Url } from "../../../../../../../shared/utils/constants";

const props = defineProps<{
  color: string;
  counter: number | string;
  title: string;
  description: string;
  hideOnComplete?: boolean;
  url?: Url | string;
  externalLink?: boolean;
  loading?: boolean;
  icon?: string;
  showLoader?: boolean;
}>();

const { t } = useI18n();

const isCompleted = computed(() => {
  return !props.loading && Number(props.counter) === 0;
});

const showCard = computed(() => {
  return !(props.hideOnComplete && isCompleted.value);
});

const cardColorClass = computed(() => {
  if (isCompleted.value) {
    return 'bg-green-300 border-2 border-green-500';
  }
  return {
    red: 'bg-red-300 border-2 border-red-500',
    orange: 'bg-orange-300 border-2 border-orange-500',
    yellow: 'bg-yellow-200 border-2 border-yellow-500',
  }[props.color] || 'bg-gray-300 border-2 border-gray-500';
});


const textColorClass = computed(() => {
  if (isCompleted.value) {
    return 'text-green-300';
  }
  return {
    red: 'text-red-300',
    orange: 'text-orange-300',
    yellow: 'text-yellow-300',
  }[props.color] || 'text-gray-300';
});

const cardBackColorClass = computed(() => {
  if (isCompleted.value) {
    return 'bg-green-200';
  }
  return {
    red: 'bg-red-200',
    orange: 'bg-orange-200',
    yellow: 'bg-yellow-200',
  }[props.color] || 'bg-gray-200';
});

const iconName = computed(() => {

  let icon = 'exclamation-circle'
  if (props.icon) {
    icon =  props.icon;
  }
  return isCompleted.value ? 'check-circle' : icon;
});

const showLoaderIndicator = computed(() => Boolean(props.showLoader && props.loading));
const displayCounter = ref(props.counter);
const showCompletionAnimation = ref(false);

watchEffect((onCleanup) => {
  if (props.showLoader) {
    displayCounter.value = props.counter;
    return;
  }

  if (!props.loading) {
    displayCounter.value = props.counter;
    return;
  }

  const interval = setInterval(() => {
    displayCounter.value = Math.floor(Math.random() * 100);
  }, 50);

  onCleanup(() => {
    clearInterval(interval);
  });
});

watch(() => props.loading, (loading, previous) => {
  if (!props.showLoader) {
    return;
  }

  if (!loading && previous && isCompleted.value) {
    showCompletionAnimation.value = true;
    setTimeout(() => {
      showCompletionAnimation.value = false;
    }, 1200);
  } else if (loading) {
    showCompletionAnimation.value = false;
  }
});

const isMobile = ref(false);

const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  checkIsMobile();
  window.addEventListener('resize', checkIsMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile);
});
</script>

<template>
  <div v-if="showCard" class="flex-item">
    <div
      class="flex-item-inner"
      :class="{ 'no-flip': isMobile || isCompleted }"
    >
      <div class="card">
        <!-- For Desktop -->
        <template v-if="!isMobile">
          <!-- Card Front -->
          <div class="card-front" :class="cardColorClass">
            <Icon :name="iconName" class="h-10 w-10 text-white mx-auto" />
            <h5 class="font-semibold text-lg text-white my-1">{{ title }}</h5>
            <div class="mt-2 flex h-12 items-center justify-center">
              <transition name="fade">
                <div
                  v-if="showLoaderIndicator"
                  class="flex h-10 w-10 items-center justify-center"
                >
                  <span class="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                </div>
                <div
                  v-else-if="showCompletionAnimation"
                  class="flex h-10 w-10 items-center justify-center"
                >
                  <Icon name="check-circle" class="h-8 w-8 text-green-100" />
                </div>
                <span
                  v-else-if="!isCompleted"
                  class="inline-block px-3 py-1 rounded-md bg-white text-2xl font-bold"
                  :class="textColorClass"
                >
                  {{ displayCounter }}
                </span>
                <span v-else class="inline-block px-3 py-1 rounded-md bg-white text-2xl font-bold text-transparent">0</span>
              </transition>
            </div>
          </div>

          <!-- Card Back -->
          <div v-if="!isCompleted" class="card-back" :class="cardBackColorClass">
            <div class="flex flex-col h-full">
              <!-- Top Content -->
              <div>
                <Link v-if="url" :path="url" :external="externalLink">
                  <p class="text-gray-800 font-semibold text-lg">{{ title }}</p>
                </Link>
                <p class="text-gray-600 mt-2">{{ description }}</p>
              </div>
              <!-- Spacer -->
              <div class="mt-auto mb-4">
                <Link
                  v-if="url"
                  :path="url"
                  class="text-gray-700 inline-flex items-center"
                  :external="externalLink"
                >
                  {{ t('shared.button.details') }}
                  <Icon name="circle-arrow-right" class="ml-1" />
                </Link>
              </div>
            </div>
          </div>

        </template>
        <!-- For Mobile -->
        <template v-else>
          <div class="card-mobile" :class="cardColorClass">
            <div class="p-4">
              <Icon :name="iconName" class="h-12 w-12 text-white mx-auto" />
              <Link v-if="url" :path="url" :external="externalLink">
                <h4 class="text-white text-center text-xl font-semibold mt-4">{{ title }}</h4>
              </Link>
              <div class="text-white text-center text-2xl font-bold mt-2">
                <transition name="fade">
                  <div
                    v-if="showLoaderIndicator"
                    class="mx-auto flex h-10 w-10 items-center justify-center"
                  >
                    <span class="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  </div>
                  <div
                    v-else-if="showCompletionAnimation"
                    class="mx-auto flex h-10 w-10 items-center justify-center"
                  >
                    <Icon name="check-circle" class="h-8 w-8 text-green-100" />
                  </div>
                  <span
                    v-else-if="!isCompleted"
                    class="inline-block px-3 py-1 rounded-md bg-white text-2xl font-bold"
                    :class="textColorClass"
                  >
                    {{ displayCounter }}
                  </span>
                  <span v-else class="inline-block px-3 py-1 rounded-md bg-white text-2xl font-bold text-transparent">0</span>
                </transition>
              </div>
              <p class="text-white mt-4">{{ description }}</p>
              <div class="mt-4">
                <Link v-if="url" :path="url" class="text-gray-700 inline-block" :external="externalLink">
                  {{ t('shared.button.details') }}
                  <Icon name="circle-arrow-right" />
                </Link>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flex-item {
  color: #fff;
  padding: 0;
  position: relative;
  width: 100%;
  height: 210px;
}

.flex-item-inner {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  perspective: 1000px;
}

.card {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.flex-item-inner:not(.no-flip):hover .card {
  transform: rotateY(180deg);
  cursor: pointer;
}

.card-front,
.card-back {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 8px;
  padding: 15px;
  box-sizing: border-box;
}

.card-front {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.card-back {
  transform: rotateY(180deg);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .flex-item {
    width: 100%;
    height: auto;
    margin: 10px 0;
  }
  .flex-item-inner {
    height: auto;
    perspective: none;
  }
  .card {
    transform: none !important;
  }
  .card-front,
  .card-back {
    position: relative;
    width: 100%;
    height: auto;
    backface-visibility: visible;
    transform: none;
  }
  .card-back {
    display: block !important;
  }
  .flex-item-inner.no-flip:hover .card {
    transform: none;
  }
}

.card-mobile {
  border-radius: 8px;
}
</style>
