<script setup lang="ts">
import type { FunctionDirective } from 'vue'
import { computed, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    attachImageButtonText?: string
    sendButtonText?: string
    sendingButtonText?: string
    sentSuccessButtonText?: string
    sentFailedButtonText?: string
    targetUrl?: string
    textContentPlaceholder?: string
    contactContentPlaceholder?: string
  }>(),
  {
    attachImageButtonText: '附加图片',
    sendButtonText: '发送',
    sendingButtonText: '发送中...',
    sentSuccessButtonText: '发送成功，谢谢反馈',
    sentFailedButtonText: '发送失败，请稍后再试',
    textContentPlaceholder: '留下您的建议内容，以便我们进行改进',
    contactContentPlaceholder: '（可选）留下您的联系方式，方便我们直接与您联系',
    targetUrl: '',
  },
)

const inputFile = ref<HTMLInputElement>()
const textContent = ref('')
const contactContent = ref('')
const images = ref<File[]>([])
const imageUrls = ref<string[]>([])

const sending = ref(false)
const message = ref('')
const sentFailed = ref(false)
const sentSuccess = computed(() => message.value.startsWith('#TN'))
const disableInput = computed(() => sending.value || sentSuccess.value)
const vAutoHeight: FunctionDirective<HTMLTextAreaElement> = (el) => {
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

watch(
  images,
  (newImages) => {
    imageUrls.value.forEach(url => URL.revokeObjectURL(url))
    imageUrls.value = newImages.map(file => URL.createObjectURL(file))
  },
  {
    deep: true,
  },
)

watch(sentSuccess, () => {})

/**
 * Handle file input change
 * @param e - input change event
 */
function handleChange(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])

  if (images.value.length === 0) {
    images.value = files

    return
  }

  files.forEach((file) => {
    const found = images.value.find(f => f.name === file.name)
    if (!found)
      images.value.push(file)
  })
}

/**
 * Open file dialog
 */
function handleSelectImage() {
  if (!inputFile.value)
    return

  inputFile.value.value = ''
  inputFile?.value.click()
}

/**
 * Remove image from form and imageUrls
 * @param index - index of image to remove
 */
function handleRemoveImage(index: number) {
  imageUrls.value.splice(index, 1)
  images.value.splice(index, 1)
}

/**
 * Submit form data
 */
async function handleSubmit() {
  sentFailed.value = false

  if (!textContent.value || sentSuccess.value)
    return

  const formData = new FormData()

  formData.append('textContent', textContent.value)
  formData.append('referrer', window.location.href)
  if (contactContent.value)
    formData.append('contactContent', contactContent.value)
  if (images.value) {
    for (let i = 0; i < images.value.length; i += 1)
      formData.append('images', images.value[i])
  }

  try {
    sending.value = true

    const { message: responseMessage } = await fetch(props.targetUrl || '', {
      method: 'POST',
      body: formData,
      referrerPolicy: 'unsafe-url',
    }).then(res => res.json())

    message.value = responseMessage

    sending.value = false
  }
  catch (err) {
    sending.value = false
    sentFailed.value = true
    console.error(err)

    setTimeout(() => {
      sentFailed.value = false
    }, 2000)

    return
  }

  setTimeout(() => {
    sentFailed.value = false
  }, 2000)
}
</script>

<template>
  <form
    class="flex flex-col overflow-hidden rounded-lg"
    border="2 solid zinc-200 dark:zinc-800"
    @submit.prevent="() => {}"
  >
    <label class="inline-grid m-1 items-stretch">
      <textarea
        v-model="textContent"
        v-auto-height
        class="min-h-0 resize-none rounded-t-md border-none p-2 outline-none"
        bg="$vp-c-bg"
        text="inherit base disabled:zinc"
        cursor="disabled:not-allowed"
        :placeholder="textContentPlaceholder"
        :disabled="disableInput"
      />
    </label>
    <details v-if="imageUrls.length !== 0" class="m-2">
      <summary class="cursor-pointer appearance-none m-0!">
        <span> 当前选中了 {{ imageUrls.length }} 张图片 </span>
      </summary>
      <div class="flex overflow-x-auto space-x-4">
        <template v-for="(url, index) in imageUrls" :key="url">
          <div class="relative">
            <button
              class="absolute right-1 top-1 h-8 w-8 inline-flex items-center justify-center rounded-md border-none duration-250"
              transition="all ease-in-out"
              bg="zinc-800 opacity-60 hover:opacity-80 active:opacity-50"
              text="zinc-100"
              :disabled="disableInput"
              @click="handleRemoveImage(index)"
            >
              <div i-octicon:trash-24 class="h-4 w-4 flex items-center justify-center" />
            </button>
            <img
              :src="url"
              class="block aspect-video h-full max-h-40 min-h-40 min-w-60 w-full overflow-hidden rounded-md object-cover"
              alt="图片"
            >
          </div>
        </template>
      </div>
    </details>
    <label>
      <input
        v-model="contactContent"
        class="min-h-0 w-full resize-none border-none p-2 text-inherit outline-none"
        bg="zinc-100 dark:zinc-900"
        cursor="disabled:not-allowed"
        text="sm"
        :placeholder="contactContentPlaceholder"
        :disabled="disableInput"
      >

    </label>
    <div
      class="flex justify-around gap-2 rounded-b-md p-2 !<sm:flex-col"
      bg="zinc-50 dark:zinc-900"
    >
      <label
        :aria-label="props.attachImageButtonText" class="w-full flex justify-center"
      >
        <input
          ref="inputFile"
          type="file"
          accept="image/*"
          multiple
          hidden
          :disabled="disableInput"
          @change="handleChange"
        >
        <button
          class="w-full flex items-center justify-center rounded-md border-none px-2 py-2 duration-250"
          transition="all ease-in-out"
          bg="zinc-200 hover:zinc-300 active:zinc-400 dark:zinc-800 dark:hover:zinc-700 dark:active:zinc-600"
          text="zinc-700 dark:zinc-300 base"
          cursor="disabled:not-allowed"
          :disabled="disableInput"
          @click="handleSelectImage"
        >
          <div i-octicon:image-24 class="mr-1 flex items-center justify-center" />
          <span text="sm">
            {{ props.attachImageButtonText }}
          </span>
        </button>
      </label>
      <button
        type="submit"
        :aria-label="props.sendButtonText"
        :class="[
          !textContent || sending || sentSuccess || sentFailed ? 'cursor-not-allowed' : '',
          sending || sentSuccess || sentFailed
            ? 'text-zinc-700 disabled:text-zinc-700 dark:text-zinc-300 dark:disabled:text-zinc-300'
            : 'text-zinc-700 disabled:text-zinc-400 dark:text-zinc-300 dark:disabled:text-zinc-600',
        ]"
        class="block w-full flex cursor-pointer justify-center rounded-md border-none px-2 py-2 duration-250"
        transition="all ease-in-out"
        bg="zinc-200 hover:zinc-300 active:zinc-400 dark:zinc-800 dark:hover:zinc-700 dark:active:zinc-600"
        text="base"
        :disabled="!textContent || disableInput || sentFailed"
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
                class="mr-1 flex items-center justify-center text-green-600"
              />
              <span text="sm">
                {{ props.sentSuccessButtonText }}
              </span>
            </span>
            <span v-else-if="sentFailed" flex items-center space-x-1>
              <div
                i-octicon:alert-fill-24
                class="mr-1 flex items-center justify-center text-red-600"
              />
              <span text="sm">
                {{ props.sentFailedButtonText }}
              </span>
            </span>
            <span v-else flex items-center space-x-1>
              <template v-if="!sending">
                <div i-octicon:paper-airplane-24 class="mr-1 flex items-center justify-center" />
                <span text="sm">
                  {{ props.sendButtonText }}
                </span>
              </template>
              <template v-else>
                <div i-svg-spinners:180-ring-with-bg class="mr-1 flex items-center justify-center" />
                <span text="sm">
                  {{ props.sendingButtonText }}
                </span>
              </template>
            </span>
          </Transition>
        </div>
      </button>
    </div>
  </form>
</template>

<style>
/*
@unocss-placeholder
*/
</style>
