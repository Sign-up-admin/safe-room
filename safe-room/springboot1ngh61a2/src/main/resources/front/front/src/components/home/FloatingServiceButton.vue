<template>
  <div class="floating-button">
    <button class="floating-button__trigger" @click="togglePanel">
      <span class="floating-button__ring" />
      <span class="floating-button__icon">✦</span>
    </button>

    <div v-if="panelVisible" class="floating-button__panel">
      <p class="floating-button__panel-title">AI 客服 · 内测中</p>
      <p class="floating-button__panel-text">系统已上线内测，敬请期待正式开放。</p>
      <button class="floating-button__panel-cta" @click="togglePanel">知道了</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const panelVisible = ref(false)

const togglePanel = () => {
  panelVisible.value = !panelVisible.value
}
</script>

<style scoped lang="scss">
.floating-button {
  position: fixed;
  right: 3vw;
  bottom: 4vh;
  z-index: 1200;

  &__trigger {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: none;
    background: radial-gradient(circle, rgba(253, 216, 53, 0.4), rgba(10, 10, 10, 0.8));
    box-shadow: 0 12px 32px rgba(253, 216, 53, 0.3);
    color: #fefefe;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  &__ring {
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    border: 2px solid rgba(253, 216, 53, 0.4);
    animation: breathe 2.4s ease-in-out infinite;
  }

  &__icon {
    position: relative;
    font-size: 1.4rem;
  }

  &__panel {
    position: absolute;
    right: 80px;
    bottom: 0;
    width: 240px;
    background: rgba(10, 10, 10, 0.95);
    border-radius: 20px;
    padding: 20px;
    border: 1px solid rgba(253, 216, 53, 0.25);
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
  }

  &__panel-title {
    color: #fdd835;
    margin: 0 0 8px;
  }

  &__panel-text {
    margin: 0;
    color: rgba(255, 255, 255, 0.78);
  }

  &__panel-cta {
    margin-top: 18px;
    width: 100%;
    height: 40px;
    border-radius: 999px;
    border: none;
    background: linear-gradient(120deg, #fdd835, #f6c300);
    color: #0a0a0a;
    font-weight: 600;
    cursor: pointer;
  }
}

@keyframes breathe {
  0% {
    transform: scale(1);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 0.4;
  }
}

@media (max-width: 640px) {
  .floating-button {
    right: 16px;
    bottom: 20px;

    &__panel {
      right: 0;
      bottom: 80px;
    }
  }
}
</style>
