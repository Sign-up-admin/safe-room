<template>
  <ElDialog
    v-model="dialogVisible"
    :title="null"
    width="580px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    class="cookie-consent-dialog"
    align-center
  >
    <div class="cookie-container">
      <!-- Header with Icon -->
      <div class="cookie-header">
        <div class="cookie-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
              fill="currentColor"
              opacity="0.3"
            />
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 13h2v2h-2v-2zm0-8h2v6h-2V7zm4.5 2.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S14 6.17 14 7s.67 1.5 1.5 1.5zm-7 5c.83 0 1.5-.67 1.5-1.5S9.33 11.5 8.5 11.5 7 12.17 7 13s.67 1.5 1.5 1.5zm7 2c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5z"
              fill="currentColor"
            />
          </svg>
        </div>
        <h2 class="cookie-title">Cookie 使用提示</h2>
        <p class="cookie-subtitle">我们重视您的隐私</p>
      </div>

      <!-- Content -->
      <div class="cookie-content">
        <p class="cookie-description">
          我们使用 Cookie 来提升您的浏览体验、分析网站流量并个性化内容。继续使用本网站即表示您同意我们使用 Cookie。
        </p>

        <div v-if="showCustom" class="cookie-types">
          <div class="cookie-type-item">
            <div class="cookie-type-header">
              <ElCheckbox v-model="cookieSettings.necessary" disabled>
                <span class="cookie-type-name">必要 Cookie</span>
              </ElCheckbox>
            </div>
            <p class="cookie-desc">这些 Cookie 是网站运行所必需的，无法关闭。</p>
          </div>
          <div class="cookie-type-item">
            <div class="cookie-type-header">
              <ElCheckbox v-model="cookieSettings.analytics">
                <span class="cookie-type-name">分析 Cookie</span>
              </ElCheckbox>
            </div>
            <p class="cookie-desc">帮助我们了解访客如何使用网站。</p>
          </div>
          <div class="cookie-type-item">
            <div class="cookie-type-header">
              <ElCheckbox v-model="cookieSettings.marketing">
                <span class="cookie-type-name">营销 Cookie</span>
              </ElCheckbox>
            </div>
            <p class="cookie-desc">用于跟踪访客并显示相关广告。</p>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="cookie-footer">
        <button v-if="!showCustom" class="custom-settings-btn" @click="showCustom = true">自定义设置</button>
        <button v-if="showCustom" class="back-btn" @click="showCustom = false">返回</button>
        <div class="footer-actions">
          <button class="reject-btn" @click="handleReject">拒绝</button>
          <button class="accept-btn" @click="handleAccept">接受</button>
        </div>
      </div>
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { ElDialog, ElButton, ElCheckbox } from 'element-plus'

defineOptions({
  name: 'CookieConsent'
})

const STORAGE_KEY = 'cookie_consent'
const STORAGE_SETTINGS_KEY = 'cookie_settings'

const dialogVisible = ref(false)
const showCustom = ref(false)
const hasChecked = ref(false) // 防止重复检查的标志
const cookieSettings = ref({
  necessary: true, // 必要 Cookie 始终启用
  analytics: false,
  marketing: false,
})

onBeforeMount(() => {
  // 只在首次挂载时检查，防止重复检查
  if (!hasChecked.value) {
    checkCookieConsent()
    hasChecked.value = true
  }
})

function checkCookieConsent() {
  // 如果已经检查过，直接返回
  if (hasChecked.value && dialogVisible.value === false) {
    return
  }

  const consent = localStorage.getItem(STORAGE_KEY)

  // 如果已经有consent记录，不显示弹窗，只加载设置
  if (consent) {
    const savedSettings = localStorage.getItem(STORAGE_SETTINGS_KEY)
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        cookieSettings.value = { ...cookieSettings.value, ...settings }
      } catch (e) {
        console.error('Failed to parse cookie settings', e)
      }
    }
    // 确保弹窗不显示
    dialogVisible.value = false
    return
  }

  // 只有在没有consent记录时才显示弹窗
  // 延迟显示，避免影响页面加载
  setTimeout(() => {
    // 再次检查，防止在延迟期间用户已经操作
    const currentConsent = localStorage.getItem(STORAGE_KEY)
    if (!currentConsent) {
      dialogVisible.value = true
    }
  }, 1000)
}

function handleAccept() {
  // 保存用户选择
  localStorage.setItem(STORAGE_KEY, 'accepted')
  localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(cookieSettings.value))

  // 应用 Cookie 设置
  applyCookieSettings()

  dialogVisible.value = false
}

function handleReject() {
  // 只接受必要 Cookie
  cookieSettings.value.analytics = false
  cookieSettings.value.marketing = false

  localStorage.setItem(STORAGE_KEY, 'rejected')
  localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(cookieSettings.value))

  // 应用 Cookie 设置
  applyCookieSettings()

  dialogVisible.value = false
}

function applyCookieSettings() {
  // 这里可以根据设置启用或禁用相应的 Cookie
  // 例如：Google Analytics、广告追踪等

  if (cookieSettings.value.analytics) {
    // 启用分析 Cookie
    console.log('Analytics cookies enabled')
  }

  if (cookieSettings.value.marketing) {
    // 启用营销 Cookie
    console.log('Marketing cookies enabled')
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

:deep(.cookie-consent-dialog) {
  .el-dialog {
    background: $color-panel-strong;
    border: 1px solid $color-border;
    border-radius: $card-radius;
    box-shadow:
      $shadow-soft,
      0 0 40px rgba(253, 216, 53, 0.15);
    overflow: hidden;
  }

  .el-dialog__header {
    display: none;
  }

  .el-dialog__body {
    padding: 0;
  }

  .el-dialog__footer {
    display: none;
  }
}

.cookie-container {
  @include glass-card($color-panel-strong, $card-radius);
  background: $color-panel-strong;
  overflow: hidden;
}

.cookie-header {
  padding: 32px 32px 24px;
  text-align: center;
  background: linear-gradient(135deg, rgba(253, 216, 53, 0.08), rgba(253, 216, 53, 0.02));
  border-bottom: 1px solid $color-divider;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, transparent, $color-yellow, transparent);
  }
}

.cookie-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, rgba(253, 216, 53, 0.2), rgba(253, 216, 53, 0.1));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(253, 216, 53, 0.3);
  box-shadow: 0 0 24px rgba(253, 216, 53, 0.2);

  svg {
    width: 32px;
    height: 32px;
    color: $color-yellow;
  }
}

.cookie-title {
  margin: 0 0 8px;
  color: $color-text-primary;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.cookie-subtitle {
  margin: 0;
  color: $color-text-secondary;
  font-size: 0.9rem;
  letter-spacing: 0.1em;
}

.cookie-content {
  padding: 28px 32px;
}

.cookie-description {
  margin: 0 0 24px;
  color: $color-text-secondary;
  line-height: 1.7;
  font-size: 0.95rem;
  text-align: center;
}

.cookie-types {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 24px;
}

.cookie-type-item {
  padding: 16px 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  transition: all $transition-base;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(253, 216, 53, 0.2);
    transform: translateX(4px);
  }
}

.cookie-type-header {
  margin-bottom: 8px;

  :deep(.el-checkbox) {
    .el-checkbox__label {
      color: $color-text-primary;
      font-weight: 500;
      font-size: 0.95rem;
    }

    .el-checkbox__input.is-checked .el-checkbox__inner {
      background-color: $color-yellow;
      border-color: $color-yellow;
    }

    .el-checkbox__inner {
      border-color: rgba(255, 255, 255, 0.3);
      background-color: transparent;
    }

    .el-checkbox__inner:hover {
      border-color: $color-yellow;
    }
  }
}

.cookie-type-name {
  font-weight: 500;
  letter-spacing: 0.05em;
}

.cookie-desc {
  margin: 0 0 0 28px;
  font-size: 0.85rem;
  color: $color-text-muted;
  line-height: 1.6;
}

.cookie-footer {
  padding: 20px 32px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  border-top: 1px solid $color-divider;
  background: rgba(0, 0, 0, 0.2);
}

.custom-settings-btn,
.back-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: $color-text-secondary;
  padding: 10px 20px;
  border-radius: 999px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all $transition-base;
  font-weight: 500;
  letter-spacing: 0.05em;

  &:hover {
    border-color: $color-yellow;
    color: $color-yellow;
    background: rgba(253, 216, 53, 0.05);
    transform: translateY(-2px);
  }
}

.footer-actions {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

.reject-btn {
  @include yellow-button(true, 44px);
  min-width: 100px;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  cursor: pointer;

  &:hover {
    background: rgba(253, 216, 53, 0.1);
    border-color: $color-yellow;
    color: $color-yellow;
  }
}

.accept-btn {
  @include yellow-button(false, 44px);
  min-width: 100px;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  cursor: pointer;
  border: none;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 40px rgba(253, 216, 53, 0.45);
  }

  &:active {
    transform: translateY(-1px);
  }
}

@media (max-width: 640px) {
  :deep(.cookie-consent-dialog) {
    .el-dialog {
      width: 90% !important;
      margin: 5vh auto;
    }
  }

  .cookie-header {
    padding: 24px 24px 20px;

    .cookie-icon {
      width: 56px;
      height: 56px;
      margin-bottom: 12px;

      svg {
        width: 28px;
        height: 28px;
      }
    }

    .cookie-title {
      font-size: 1.3rem;
    }
  }

  .cookie-content {
    padding: 24px;
  }

  .cookie-footer {
    flex-direction: column;
    align-items: stretch;
    padding: 20px 24px 24px;
    gap: 12px;
  }

  .custom-settings-btn,
  .back-btn {
    width: 100%;
    order: 3;
  }

  .footer-actions {
    width: 100%;
    margin-left: 0;
    order: 1;

    .reject-btn,
    .accept-btn {
      flex: 1;
    }
  }
}
</style>
