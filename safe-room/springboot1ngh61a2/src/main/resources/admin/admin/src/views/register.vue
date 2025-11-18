<template>
  <div class="auth-page">
    <!-- 渐变背景 -->
    <div class="auth-background"></div>

    <!-- 关闭按钮 -->
    <button class="close-button" @click="handleClose" title="关闭">
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        class="close-icon"
      >
        <path
          d="M4.39705 4.55379L4.46967 4.46967C4.73594 4.2034 5.1526 4.1792 5.44621 4.39705L5.53033 4.46967L12 10.939L18.4697 4.46967C18.7626 4.17678 19.2374 4.17678 19.5303 4.46967C19.8232 4.76256 19.8232 5.23744 19.5303 5.53033L13.061 12L19.5303 18.4697C19.7966 18.7359 19.8208 19.1526 19.6029 19.4462L19.5303 19.5303C19.2641 19.7966 18.8474 19.8208 18.5538 19.6029L18.4697 19.5303L12 13.061L5.53033 19.5303C5.23744 19.8232 4.76256 19.8232 4.46967 19.5303C4.17678 19.2374 4.17678 18.7626 4.46967 18.4697L10.939 12L4.46967 5.53033C4.2034 5.26406 4.1792 4.8474 4.39705 4.55379L4.46967 4.46967L4.39705 4.55379Z"
        />
      </svg>
    </button>

    <!-- 主要内容区域 -->
    <div class="auth-container">
      <div class="auth-content">
        <!-- 标题区域 -->
        <div class="form-header">
          <h1 class="form-title">创建后台账号</h1>
          <p class="form-subtitle">选择角色并填写必要信息</p>
        </div>

        <!-- 注册表单 -->
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          class="register-form"
          label-width="140px"
        >
          <!-- 角色选择 -->
          <el-form-item label="注册角色" prop="role" required>
            <el-select
              v-model="form.role"
              placeholder="请选择注册角色"
              size="large"
              class="modern-select"
              @change="handleRoleChange"
            >
              <el-option
                v-for="option in roleOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>

          <!-- 动态表单字段 -->
          <template v-if="form.role === 'yonghu'">
            <el-form-item label="用户账号" prop="yonghuzhanghao" required>
              <el-input
                v-model="form.yonghuzhanghao"
                placeholder="请输入用户账号"
                size="large"
                class="modern-input"
              />
            </el-form-item>

            <el-form-item label="密码" prop="mima" required>
              <el-input
                v-model="form.mima"
                type="password"
                placeholder="请输入密码"
                size="large"
                class="modern-input"
                show-password
              />
            </el-form-item>

            <el-form-item label="确认密码" prop="mima2" required>
              <el-input
                v-model="form.mima2"
                type="password"
                placeholder="请再次输入密码"
                size="large"
                class="modern-input"
                show-password
              />
            </el-form-item>

            <el-form-item label="姓名" prop="yonghuxingming" required>
              <el-input
                v-model="form.yonghuxingming"
                placeholder="请输入姓名"
                size="large"
                class="modern-input"
              />
            </el-form-item>

            <el-form-item label="手机号" prop="shoujihaoma">
              <el-input
                v-model="form.shoujihaoma"
                placeholder="请输入手机号（可选）"
                size="large"
                class="modern-input"
              />
            </el-form-item>
          </template>

          <template v-else-if="form.role === 'jianshenjiaolian'">
            <el-form-item label="教练工号" prop="jiaoliangonghao" required>
              <el-input
                v-model="form.jiaoliangonghao"
                placeholder="请输入教练工号"
                size="large"
                class="modern-input"
              />
            </el-form-item>

            <el-form-item label="密码" prop="mima" required>
              <el-input
                v-model="form.mima"
                type="password"
                placeholder="请输入密码"
                size="large"
                class="modern-input"
                show-password
              />
            </el-form-item>

            <el-form-item label="确认密码" prop="mima2" required>
              <el-input
                v-model="form.mima2"
                type="password"
                placeholder="请再次输入密码"
                size="large"
                class="modern-input"
                show-password
              />
            </el-form-item>

            <el-form-item label="教练姓名" prop="jiaolianxingming" required>
              <el-input
                v-model="form.jiaolianxingming"
                placeholder="请输入教练姓名"
                size="large"
                class="modern-input"
              />
            </el-form-item>

            <el-form-item label="联系电话" prop="lianxidianhua">
              <el-input
                v-model="form.lianxidianhua"
                placeholder="请输入联系电话（可选）"
                size="large"
                class="modern-input"
              />
            </el-form-item>
          </template>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="register-button"
              :loading="loading"
              @click="handleSubmit"
            >
              {{ loading ? "注册中..." : "提交注册" }}
            </el-button>
          </el-form-item>

          <el-form-item>
            <div class="login-link">
              已有账户？
              <router-link to="/login" class="link">立即登录</router-link>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { ROLE_OPTIONS } from "@/utils/constants";
import type { RegisterFormData, UserRole } from "@/types/user";

const router = useRouter();

const formRef = ref<FormInstance>();
const loading = ref(false);
const roleOptions = ROLE_OPTIONS;

const form = reactive<RegisterFormData & Record<string, any>>({
  role: "yonghu" as UserRole,
  username: "",
  password: "",
  password2: "",
  name: "",
  phone: "",
  // 会员用户字段
  yonghuzhanghao: "",
  mima: "",
  mima2: "",
  yonghuxingming: "",
  shoujihaoma: "",
  // 健身教练字段
  jiaoliangonghao: "",
  jiaolianxingming: "",
  lianxidianhua: "",
});

// 密码确认验证
const validatePasswordConfirm = (
  _rule: any,
  value: any,
  callback: Function,
) => {
  if (!value) {
    callback(new Error("请再次输入密码"));
  } else if (value !== form.mima) {
    callback(new Error("两次密码输入不一致"));
  } else {
    callback();
  }
};

const rules = computed<FormRules>(() => {
  const baseRules: FormRules = {
    role: [{ required: true, message: "请选择注册角色", trigger: "change" }],
    mima: [
      { required: true, message: "请输入密码", trigger: "blur" },
      { min: 6, message: "密码长度至少6位", trigger: "blur" },
    ],
    mima2: [
      { required: true, message: "请再次输入密码", trigger: "blur" },
      { validator: validatePasswordConfirm, trigger: "blur" },
    ],
  };

  if (form.role === "yonghu") {
    return {
      ...baseRules,
      yonghuzhanghao: [
        { required: true, message: "请输入用户账号", trigger: "blur" },
      ],
      yonghuxingming: [
        { required: true, message: "请输入姓名", trigger: "blur" },
      ],
    };
  } else if (form.role === "jianshenjiaolian") {
    return {
      ...baseRules,
      jiaoliangonghao: [
        { required: true, message: "请输入教练工号", trigger: "blur" },
      ],
      jiaolianxingming: [
        { required: true, message: "请输入教练姓名", trigger: "blur" },
      ],
    };
  }

  return baseRules;
});

const handleRoleChange = () => {
  // 切换角色时清空表单
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    loading.value = true;
    try {
      // 准备提交数据
      const submitData: Record<string, any> = {
        mima: form.mima,
      };

      if (form.role === "yonghu") {
        submitData.yonghuzhanghao = form.yonghuzhanghao;
        submitData.yonghuxingming = form.yonghuxingming;
        if (form.shoujihaoma) {
          submitData.shoujihaoma = form.shoujihaoma;
        }
      } else if (form.role === "jianshenjiaolian") {
        submitData.jiaoliangonghao = form.jiaoliangonghao;
        submitData.jiaolianxingming = form.jiaolianxingming;
        if (form.lianxidianhua) {
          submitData.lianxidianhua = form.lianxidianhua;
        }
      }

      // TODO: 调用注册API
      // await request.post(`/${form.role}/register`, submitData)

      // 临时模拟注册成功
      ElMessage.success("注册成功，请登录");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      ElMessage.error(error.message || "注册失败，请重试");
    } finally {
      loading.value = false;
    }
  });
};

const handleClose = () => {
  router.push("/login");
};
</script>

<style scoped lang="scss">
@import "@/styles/mixins";

.auth-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.auth-background {
  position: absolute;
  inset: 0;
  background: var(--gradient-bg-auth);
  z-index: 0;
}

.close-button {
  position: absolute;
  top: var(--space-6);
  right: var(--space-6);
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  @include glassmorphism(0.7, 8px);
  color: var(--color-text-primary);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all var(--duration-200) var(--ease-in-out);
  box-shadow: var(--shadow-sm);

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: scale(1.05);
    box-shadow: var(--shadow-md);
  }

  .close-icon {
    width: 24px;
    height: 24px;
  }
}

.auth-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 640px;
  padding: var(--space-4);
}

.auth-content {
  @include card();
  width: 100%;
}

.form-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.form-title {
  font-size: var(--font-size-display-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
  font-family: var(--font-family-display);
}

.form-subtitle {
  font-size: var(--font-size-body-md);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}

.register-form {
  :deep(.el-form-item__label) {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }

  :deep(.el-form-item__label::before) {
    content: "*";
    color: var(--color-danger-500);
    margin-right: 4px;
  }

  :deep(
    .el-form-item__label:has(+ .el-form-item__content .modern-select)
  )::before {
    content: "";
  }
}

.modern-select {
  width: 100%;

  :deep(.el-input__wrapper) {
    @include glassmorphism(0.5, 8px);
    border-radius: var(--radius-input);
    box-shadow: var(--shadow-sm);
    transition: all var(--duration-200) var(--ease-in-out);

    &:hover {
      background: rgba(255, 255, 255, 0.7);
      box-shadow: var(--shadow-md);
    }

    &.is-focus {
      background: rgba(255, 255, 255, 1);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }
}

.modern-input {
  :deep(.el-input__wrapper) {
    @include glassmorphism(0.5, 8px);
    border-radius: var(--radius-input);
    box-shadow: var(--shadow-sm);
    transition: all var(--duration-200) var(--ease-in-out);

    &:hover {
      background: rgba(255, 255, 255, 0.7);
      box-shadow: var(--shadow-md);
    }

    &.is-focus {
      background: rgba(255, 255, 255, 1);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }
}

.register-button {
  width: 100%;
  height: 56px;
  font-size: var(--font-size-body-lg);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-xl);
  background: var(--gradient-primary);
  color: var(--color-text-inverse);
  border: none;
  box-shadow: var(--shadow-primary-sm);
  transition: all var(--duration-200) var(--ease-in-out);

  &:hover {
    box-shadow: var(--shadow-primary-sm);
    transform: translateY(-2px);
  }
}

.login-link {
  text-align: center;
  font-size: var(--font-size-body-sm);
  color: var(--color-text-secondary);
  width: 100%;

  .link {
    color: var(--color-primary-500);
    font-weight: var(--font-weight-medium);
    margin-left: var(--space-1);
    text-decoration: none;
    transition: color var(--duration-200) var(--ease-in-out);

    &:hover {
      color: var(--color-primary-600);
      text-decoration: underline;
    }
  }
}

@include respond-to(sm) {
  .auth-container {
    padding: var(--space-6);
  }
}
</style>
