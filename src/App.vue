<template>
  <form
    class="flex flex-col rounded-lg overflow-hidden"
    border="2 solid zinc-200 dark:zinc-800"
    @submit.prevent="() => {}"
  >
    <label class="inline-grid sb-auto-height items-stretch">
      <textarea
        v-model="textContent"
        class="resize-none p-2 min-h-0 outline-none border-none rounded-t-md"
        bg="$vp-c-bg"
        :placeholder="placeholder || '输入内容'"
      />
    </label>
    <div class="m-2">
      <details v-if="imageUrls.length !== 0">
        <summary class="appearance-none m-0! cursor-pointer">
          <span> {{ imageUrls.length }} 张图片 </span>
        </summary>
        <div class="flex overflow-x-scroll space-x-4">
          <template v-for="(url, index) in imageUrls" :key="url">
            <div class="relative">
              <button
                class="absolute right-1 top-1 w-8 h-8 rounded-md inline-flex justify-center items-center duration-250"
                transition="all ease-in-out"
                bg="zinc-800 opacity-60 hover:opacity-80 active:opacity-50"
                text="zinc-100"
                @click="handleRemoveImage(index)"
              >
                <div i-octicon:trash-24 class="flex items-center justify-center w-4 h-4" />
              </button>
              <img
                :src="url"
                class="overflow-hidden object-cover rounded-md block aspect-video min-w-60 w-full max-h-40 min-h-40 h-full"
                alt="图片"
              />
            </div>
          </template>
        </div>
      </details>
    </div>
    <div
      class="flex justify-around p-2 rounded-b-md space-x-2 <sm:flex-col <sm:space-x-0 <sm:space-y-2"
      bg="zinc-50 dark:zinc-900"
    >
      <label
        :aria-label="props.attachImageButtonText || '附加图片'"
        class="w-full flex justify-center"
      >
        <input
          ref="inputFile"
          type="file"
          accept="image/*"
          multiple
          hidden
          @change="handleChange"
        />
        <button
          class="flex items-center justify-center rounded-md w-full px-2 py-2 duration-250"
          transition="all ease-in-out"
          bg="zinc-200 hover:zinc-300 active:zinc-400 dark:zinc-800 dark:hover:zinc-700 dark:active:zinc-600"
          text="zinc-700 dark:zinc-300 base"
          @click="handleSelectImage"
        >
          <div i-octicon:image-24 class="flex items-center justify-center mr-1" />
          <span text="sm">
            {{ props.attachImageButtonText || '附加图片' }}
          </span>
        </button>
      </label>
      <button
        type="submit"
        :aria-label="props.sendButtonText || '发送'"
        :class="[!textContent || sentSuccess || sentFailed ? 'cursor-not-allowed' : '']"
        class="cursor-pointer block rounded-md w-full flex justify-center px-2 py-2 duration-250"
        transition="all ease-in-out"
        text="zinc-500 disabled:zinc-600 dark:zinc-300 dark:disabled:zinc-400 base"
        bg="zinc-200 hover:zinc-300 active:zinc-400 dark:zinc-800 dark:hover:zinc-700 dark:active:zinc-600"
        :disabled="!textContent || sentSuccess || sentFailed"
        @click="handleSubmit"
      >
        <div class="flex items-center justify-center">
          <Transition
            mode="out-in"
            enter-active-class="transition-all duration-200 ease-out"
            leave-active-class="transition-all duration-200 ease-out"
            enter-from-class="transform translate-y-10px opacity-0"
            leave-to-class="transform translate-y--10px opacity-0"
            enter-to-class="opacity-100"
            leave-from-class="opacity-100"
          >
            <span v-if="sentSuccess" flex items-center space-x-1>
              <div
                i-octicon:check-circle-fill-24
                class="flex items-center justify-center mr-1 text-green-600"
              />
              <span text="sm">
                {{ props.sentSuccessButtonText || '发送成功，谢谢反馈' }}
              </span>
            </span>
            <span v-else-if="sentFailed" flex items-center space-x-1>
              <div
                i-octicon:alert-fill-24
                class="flex items-center justify-center mr-1 text-red-600"
              />
              <span text="sm">
                {{ props.sentFailedButtonText || '发送失败，请稍后再试' }}
              </span>
            </span>
            <span v-else flex items-center space-x-1>
              <div i-octicon:paper-airplane-24 class="flex items-center justify-center mr-1" />
              <span text="sm">
                {{ props.sendButtonText || '发送' }}
              </span>
            </span>
          </Transition>
        </div>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  attachImageButtonText?: string;
  sendButtonText?: string;
  sentSuccessButtonText?: string;
  sentFailedButtonText?: string;
  targetUrl?: string;
  placeholder?: string;
}>();

const inputFile = ref<HTMLInputElement>();
const sentSuccess = ref(false);
const sentFailed = ref(false);
const imageUrls = ref<string[]>([]);
const textContent = ref('');
const images = ref<File[]>([]);

/**
 * Re-render imageUrls when form.images changes
 */
watch(images, (i) => {
  imageUrls.value.forEach((url) => URL.revokeObjectURL(url));
  imageUrls.value = i.map((file) => URL.createObjectURL(file));
});

/**
 * Handle file input change
 * @param e - input change event
 */
const handleChange = (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files ?? []);
  if (images.value.length === 0) {
    images.value = files;

    return;
  }

  files.forEach((file) => {
    const found = images.value.find((f) => f.name === file.name);
    if (!found) {
      images.value.push(file);
    }
  });
};

/**
 * Open file dialog
 */
function handleSelectImage() {
  if (!inputFile.value) return;

  inputFile.value.value = '' as any;
  inputFile?.value.click();
}

/**
 * Remove image from form and imageUrls
 * @param index - index of image to remove
 */
function handleRemoveImage(index: number) {
  imageUrls.value.splice(index, 1);
  images.value.splice(index, 1);
}

/**
 * Submit form data
 */
async function handleSubmit() {
  sentSuccess.value = false;
  sentFailed.value = false;

  if (!textContent.value) {
    return;
  }

  const formData = new FormData();

  formData.append('textContent', textContent.value);
  if (images.value) {
    for (let i = 0; i < images.value.length; i += 1) {
      formData.append('images', images.value[i]);
    }
  }

  try {
    await fetch(props.targetUrl || '', {
      method: 'POST',
      body: formData,
    });

    if (textContent.value === 'failed') {
      throw new Error('Not implemented');
    }
  } catch (err) {
    sentFailed.value = true;
    console.error(err);

    return;
  }

  sentSuccess.value = true;

  setTimeout(() => {
    sentSuccess.value = false;
    sentFailed.value = false;
  }, 2000);
}
</script>
