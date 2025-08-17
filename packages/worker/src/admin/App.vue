<script setup lang="ts">
import { PiniaColadaDevtools } from '@pinia/colada-devtools'
import { RouterLink, RouterView } from 'vue-router'
import UserInfo from './components/UserInfo'
</script>

<template>
  <header>
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
