<template>
  <form class="flex flex-col border-1 border-dashed rounded-md" @submit.prevent="handleSubmit">
    <textarea
      name="suggestionText"
      class="resize-none p-2 min-h-0 outline-none border-none"
      :placeholder="placeholder"
    />
    <hr class="border-t-1 border-b-none w-full border-dotted" />
    <div class="flex justify-around px-2 pb-2">
      <label class="cursor-pointer i-mdi:paperclip block text-2xl">
        <input
          type="file"
          name="suggestionImage"
          accept="image/*"
          multiple
          hidden
          @change="handleChange"
        />
      </label>
      <button
        type="submit"
        :aria-label="sendText || '发送'"
        class="i-mdi:send-variant-outline hover:i-mdi:send-variant block text-2xl"
      />
    </div>
    <details v-if="imageURLs.length !== 0">
      <img
        v-for="url in imageURLs"
        :key="url"
        :src="url"
        height="128"
        width="128"
        class="object-contain block"
      />
    </details>
  </form>
</template>

<script setup lang="ts">
// eslint-disable-next-line import/no-unresolved
import 'uno.css';
import { ref, watch } from 'vue';

const props = defineProps<{ sendText: string; targetURL: string; placeholder: string }>();

const files = ref<FileList | null>(null);

const imageURLs = ref<string[]>([]);

watch(files, () => {
  imageURLs.value = [];
  if (!files.value) return;
  for (let i = 0; i < files.value.length; i += 1) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imageURLs.value.push(e.target!.result as string);
    };
    reader.readAsDataURL(files.value[i]);
  }
});

const handleChange = (e: Event) => {
  files.value = (e.target as HTMLInputElement).files;
};

const handleSubmit = (e: Event) => {
  const form = new FormData(e.target as HTMLFormElement);
  fetch(props.targetURL, {
    method: 'POST',
    body: form,
  });
};
</script>
