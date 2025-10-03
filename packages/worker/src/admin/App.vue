<script setup lang="ts">
import { PiniaColadaDevtools } from '@pinia/colada-devtools'
import { RouterLink, RouterView } from 'vue-router'
import UserInfo from './components/UserInfo'

const styles = defineStyleX({
  redTriangle: {
    width: '15rem',
    height: 'fit-content',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -1,
  },
  yellowSquare: {
    width: '10rem',
    height: 'fit-content',
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: -1,
  },
})
</script>

<template>
  <header>
    <svg v-stylex="styles.redTriangle" width="399" height="331" viewBox="0 0 399 331" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M399 0L0 330.5L0.5 0H399Z" fill="#E52C0D" />
    </svg>
    <svg v-stylex="styles.yellowSquare" width="240" height="216" viewBox="0 0 240 216" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="216" fill="#FDC70C" />
    </svg>

    <div class="wrapper">
      <nav>
        <RouterLink to="/">
          Home
        </RouterLink>
        <RouterLink to="/about">
          About
        </RouterLink>
        <UserInfo />
      </nav>
    </div>
  </header>

  <RouterView v-slot="{ Component }">
    <template v-if="Component">
      <Transition mode="out-in">
        <Suspense>
          <!-- 主要内容 -->
          <component :is="Component" />
          <!-- 加载中状态 -->
          <template #fallback>
            正在加载...
          </template>
        </Suspense>
      </Transition>
    </template>
  </RouterView>
  <PiniaColadaDevtools />
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: all 0.2s ease-out;
}

.v-enter-from,
.v-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>

<style>
@import 'https://fonts.project-trans.org/ChillDINGothic/result.css';
</style>
