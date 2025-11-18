<template>
  <div class="login-page">
    <!-- 背景层 -->
    <div class="login-background">
      <div class="absolute size-full bg-none bg-background-150"></div>
      <div
        class="absolute size-full bg-gradient-authentication-light dark:bg-gradient-authentication-dark"
        style="opacity: 1"
      ></div>
    </div>

    <!-- 关闭按钮 -->
    <div class="dismiss-button-wrapper">
      <button
        type="button"
        class="dismiss-button"
        title="关闭"
        @click="handleClose"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          class="dismiss-icon"
        >
          <path
            d="M4.39705 4.55379L4.46967 4.46967C4.73594 4.2034 5.1526 4.1792 5.44621 4.39705L5.53033 4.46967L12 10.939L18.4697 4.46967C18.7626 4.17678 19.2374 4.17678 19.5303 4.46967C19.8232 4.76256 19.8232 5.23744 19.5303 5.53033L13.061 12L19.5303 18.4697C19.7966 18.7359 19.8208 19.1526 19.6029 19.4462L19.5303 19.5303C19.2641 19.7966 18.8474 19.8208 18.5538 19.6029L18.4697 19.5303L12 13.061L5.53033 19.5303C5.23744 19.8232 4.76256 19.8232 4.46967 19.5303C4.17678 19.2374 4.17678 18.7626 4.46967 18.4697L10.939 12L4.46967 5.53033C4.2034 5.26406 4.1792 4.8474 4.39705 4.55379L4.46967 4.46967L4.39705 4.55379Z"
          ></path>
        </svg>
      </button>
    </div>

    <!-- 主要内容区域 -->
    <div class="login-content">
      <div class="login-container">
        <h1 class="login-title">
          {{ displayedText
          }}<span class="cursor" :class="{ blink: isTyping }">|</span>
        </h1>
        <p class="login-subtitle">创建账户或登录以保存所有对话记录并生成图像</p>

        <div class="login-buttons">
          <button
            type="button"
            class="social-button password-button"
            title="使用账号密码登录"
            @click="router.push('/password-login')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              class="social-icon"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            使用账号密码登录
          </button>

          <button
            type="button"
            class="social-button microsoft-button"
            title="使用微软账号登录"
            @click="handleSocialLogin('microsoft')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 25 24"
              class="social-icon"
            >
              <path fill="#F25022" d="M12.05 3H3.5v8.55h8.55V3Z"></path>
              <path fill="#7FBA00" d="M21.5 3h-8.55v8.55h8.55V3Z"></path>
              <path fill="#00A4EF" d="M12.05 12.45H3.5V21h8.55v-8.55Z"></path>
              <path fill="#FFB900" d="M21.5 12.45h-8.55V21h8.55v-8.55Z"></path>
            </svg>
            使用微软账号登录
          </button>

          <button
            type="button"
            class="social-button apple-button"
            title="使用Apple账号登录"
            @click="handleSocialLogin('apple')"
          >
            <svg
              viewBox="0 0 32 32"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              class="social-icon"
            >
              <path
                d="M16.289 7.53846C17.3723 7.53846 18.7302 6.8061 19.5389 5.82962C20.2712 4.94469 20.8053 3.70884 20.8053 2.47298C20.8053 2.30515 20.79 2.13732 20.7595 2C19.5541 2.04577 18.1047 2.80865 17.235 3.8309C16.5484 4.60903 15.9229 5.82963 15.9229 7.08074C15.9229 7.26383 15.9534 7.44692 15.9686 7.50795C16.0449 7.5232 16.167 7.53846 16.289 7.53846ZM12.4747 26C13.9547 26 14.6107 25.0083 16.4569 25.0083C18.3335 25.0083 18.7455 25.9695 20.3933 25.9695C22.0106 25.9695 23.0939 24.4743 24.1161 23.0095C25.2604 21.3312 25.7334 19.6834 25.7639 19.6071C25.6571 19.5766 22.5599 18.3102 22.5599 14.7552C22.5599 11.6732 25.0011 10.2848 25.1384 10.178C23.5211 7.85887 21.0646 7.79784 20.3933 7.79784C18.5777 7.79784 17.0977 8.89638 16.167 8.89638C15.16 8.89638 13.8326 7.85887 12.2611 7.85887C9.27061 7.85887 6.23438 10.3306 6.23438 14.9994C6.23438 17.8983 7.36343 20.965 8.75186 22.9485C9.94194 24.6268 10.9794 26 12.4747 26Z"
              ></path>
            </svg>
            使用Apple账号登录
          </button>

          <button
            type="button"
            class="social-button google-button"
            title="使用Google账号登录"
            @click="handleSocialLogin('google')"
          >
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="social-icon"
            >
              <path
                d="M29.546 13.667H16.6074V19.1073H24.0425C23.6865 20.781 22.7411 22.2039 21.3419 23.1773V26.6204H25.6809C28.2662 24.1829 29.754 20.5792 29.754 16.3183C29.754 15.4014 29.6798 14.5178 29.546 13.667Z"
                fill="#4285F4"
              ></path>
              <path
                d="M25.6811 26.6202L24.1728 25.4233L21.3422 23.1771C20.0963 24.0439 18.4918 24.5553 16.6077 24.5553C13.0066 24.5553 9.94929 22.0813 8.84297 18.7412H4.37549V22.2862C6.62805 26.8602 11.2579 29.9995 16.6077 29.9995C20.3024 29.9995 23.4137 28.7583 25.6811 26.6202Z"
                fill="#34A853"
              ></path>
              <path
                d="M8.84338 18.7412C8.55701 17.8759 8.39918 16.9539 8.39918 16C8.39918 15.0465 8.55701 14.1245 8.84338 13.2592V9.71387H4.37549C3.44448 11.6046 2.91699 13.7387 2.91699 16C2.91699 18.2617 3.44448 20.3958 4.37549 22.2865L8.84338 18.7412Z"
                fill="#FBBC05"
              ></path>
              <path
                d="M21.9211 9.56791L25.7683 5.64882C23.3952 3.38751 20.301 2 16.6078 2C11.258 2 6.62807 5.13939 4.37549 9.71335L8.843 13.2583C9.94932 9.91789 13.0066 7.44426 16.6078 7.44426C18.6489 7.44426 20.4778 8.1629 21.9211 9.56791Z"
                fill="#EA4335"
              ></path>
            </svg>
            使用Google账号登录
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

const router = useRouter();

const displayedText = ref("");
const isTyping = ref(true);

const fullText = "时刻准备着";

// 打字机效果
const typeWriter = () => {
  let index = 0;
  isTyping.value = true;

  const type = () => {
    if (index < fullText.length) {
      displayedText.value += fullText.charAt(index);
      index++;
      setTimeout(type, 150); // 每个字符间隔150ms
    } else {
      isTyping.value = false;
    }
  };

  type();
};

onMounted(() => {
  typeWriter();
});

const handleClose = () => {
  router.push("/");
};

const handleSocialLogin = (provider: string) => {
  ElMessage.info(`${provider}登录功能开发中`);
};
</script>

<style>
@import "@/styles/copilot-reference.css";
</style>

<style scoped lang="scss">
@import "@/styles/variables";

.login-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-background {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.dismiss-button-wrapper {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.dismiss-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.7);
  border: none;
  color: #111827;
  fill: #111827;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  outline: 2px solid transparent;
  outline-offset: 1px;

  &:hover {
    background: rgba(255, 255, 255, 1);
  }

  &:active {
    background: rgba(255, 255, 255, 0.6);
    color: #4b5563;
    fill: #4b5563;
  }

  &:focus-visible {
    outline: 2px solid #111827;
    z-index: 1;
  }
}

.dismiss-icon {
  width: 1.5rem;
  height: 1.5rem;
  fill: currentColor;
}

.login-content {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 10;
}

.login-container {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  max-width: 23.375rem;
  margin: 0 auto;
}

.login-title {
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 600;
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  line-height: 1.2;
  color: #111827;

  @media (min-width: 640px) {
    font-size: 2.25rem;
  }
}

.cursor {
  display: inline-block;
  margin-left: 2px;
  animation: blink 1s infinite;
}

.cursor.blink {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

.login-subtitle {
  margin-bottom: 1.5rem;
  text-align: center;
  color: #374151;
  font-size: 1rem;
  line-height: 1.5;

  @media (min-width: 640px) {
    margin-bottom: 3.5rem;
  }
}

.login-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  min-width: 21.5625rem;

  @media (min-width: 640px) {
    min-width: 23.375rem;
  }
}

.social-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 3.5rem;
  padding: 1rem 1.25rem;
  gap: 0.75rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.7);
  border: none;
  color: #111827;
  fill: #111827;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  width: 100%;
  min-width: 21.5625rem;
  padding-top: 1.25rem;
  padding-bottom: 1.25rem;
  outline: 2px solid transparent;
  outline-offset: 1px;

  @media (min-width: 640px) {
    min-width: 23.375rem;
  }

  &:hover {
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  &:active {
    background: rgba(255, 255, 255, 0.6);
    color: #4b5563;
    fill: #4b5563;
  }

  &:focus-visible {
    outline: 2px solid #111827;
    z-index: 1;
  }
}

.social-icon {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
}

.microsoft-button .social-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.apple-button .social-icon {
  color: #000;
}

@media (prefers-color-scheme: dark) {
  .apple-button .social-icon {
    color: #fff;
  }

  .background-gradient {
    background: linear-gradient(
      135deg,
      rgba(30, 41, 59, 1) 0%,
      rgba(51, 65, 85, 1) 100%
    );
  }

  .login-title {
    color: #f9fafb;
  }

  .login-subtitle {
    color: #d1d5db;
  }

  .dismiss-button {
    background: rgba(55, 65, 81, 0.3);
    color: #f9fafb;
    fill: #f9fafb;

    &:hover {
      background: rgba(55, 65, 81, 0.4);
    }

    &:active {
      background: rgba(55, 65, 81, 0.2);
      color: #9ca3af;
      fill: #9ca3af;
    }
  }

  .social-button {
    background: rgba(55, 65, 81, 0.3);
    color: #f9fafb;
    fill: #f9fafb;

    &:hover {
      background: rgba(55, 65, 81, 0.4);
    }

    &:active {
      background: rgba(55, 65, 81, 0.2);
      color: #9ca3af;
      fill: #9ca3af;
    }
  }
}
</style>
