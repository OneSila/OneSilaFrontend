<script setup lang="ts">
import { onBeforeUnmount, onMounted, Ref, ref, watchEffect } from 'vue'
import Quill from 'quill'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'

const props = defineProps<{
  placeholder?: string;
  height?: string;
  modelValue?: any;
  transparent?: boolean;
  disabled?: boolean;
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', text: string): void
}>()

const id = ref(Math.round(Math.random() * 9999))
const root: any = ref(null)

const quill: Ref<Quill | null> = ref(null)

const init = () => {
  quill.value = new Quill(`.html-editor-${id.value}`, {
    theme: 'snow',
    placeholder: props.placeholder,
    modules: {
      toolbar: [
        [{ 'header': [2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }]
      ]
    }
  })

  console.log(props.modelValue)

  quill.value.root.innerHTML = props.modelValue

  quill.value.on('editor-change', () => {
    const body = quill.value.root.innerHTML

    console.log(body, props.modelValue)

    const regex = /(<([^>]+)>)/ig
    const hasText = !!body.replace(regex, '').trim().length

    const text = !hasText ? '' : body

    emit('update:modelValue', text)
  })
}

onMounted(() => {
  init()
})

onBeforeUnmount(() => {
  root.value?.querySelector('.ql-toolbar')?.remove()
  root.value?.querySelector('.ql-editor')?.remove()
})
</script>

<template>
  <div ref="root" class="html-editor bg-white">
    <div :class="{
      [`html-editor-${id}`]: true,
      [`h-${height}`]: height,
    }"></div>
  </div>
</template>
