<template>
  <div v-if="replies && replies.length > 0" class="discussion-replies">
    <div class="replies-header">
      <span class="replies-count">{{ replies.length }} 条回复</span>
      <button
        class="toggle-replies-btn"
        :aria-expanded="isExpanded"
        :aria-label="isExpanded ? '收起回复' : '展开回复'"
        @click="toggleExpanded"
      >
        {{ isExpanded ? '收起' : '展开' }}
        <svg
          class="toggle-icon"
          :class="[{ 'toggle-icon--expanded': isExpanded }]"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <div v-show="isExpanded" class="replies-list">
      <div
        v-for="reply in replies"
        :key="reply.id"
        class="reply-item"
        :class="{ 'reply-item--nested': reply.parentId }"
      >
        <!-- 主回复 -->
        <div class="reply-main">
          <div class="reply-avatar">
            <img
              :src="resolveAvatar(reply.userAvatar)"
              :alt="`${reply.userNickname}的头像`"
              @error="handleAvatarError"
            />
            <div v-if="reply.userLevel" class="user-level">{{ reply.userLevel }}</div>
          </div>

          <div class="reply-content">
            <div class="reply-header">
              <div class="reply-user-info">
                <strong class="reply-username">{{ reply.userNickname }}</strong>
                <span v-if="reply.isOfficial" class="official-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                  </svg>
                  官方回复
                </span>
                <span v-if="reply.parentUserNickname" class="reply-to"> 回复 @{{ reply.parentUserNickname }} </span>
              </div>
              <div class="reply-actions">
                <button
                  class="action-btn like-btn"
                  :class="{ 'like-btn--liked': reply.isLiked }"
                  :aria-label="reply.isLiked ? '取消点赞' : '点赞'"
                  @click="toggleReplyLike(reply)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  {{ reply.likeCount || 0 }}
                </button>
                <button
                  class="action-btn reply-btn"
                  :aria-label="'回复 ' + reply.userNickname"
                  @click="showReplyInputHandler(reply)"
                >
                  回复
                </button>
                <button
                  v-if="canReport(reply)"
                  class="action-btn report-btn"
                  :aria-label="'举报 ' + reply.userNickname + '的回复'"
                  @click="reportReplyHandler(reply)"
                >
                  举报
                </button>
              </div>
            </div>

            <div class="reply-text" v-html="formatReplyContent(reply.content)"></div>

            <div class="reply-meta">
              <span class="reply-time">{{ formatTimeAgo(reply.createTime) }}</span>
              <span v-if="reply.attachments && reply.attachments.length" class="attachment-count">
                📎 {{ reply.attachments.length }}
              </span>
            </div>
          </div>
        </div>

        <!-- 回复输入框 -->
        <div v-if="reply.showReplyInput" class="reply-input-section">
          <div class="reply-input-group">
            <textarea
              ref="replyTextarea"
              v-model="reply.replyContent"
              :placeholder="`回复 @${reply.userNickname}...`"
              class="reply-textarea"
              rows="3"
              maxlength="500"
              @keydown.ctrl.enter="submitNestedReply(reply, props.discussionId)"
            ></textarea>
            <div class="reply-input-actions">
              <div class="character-count">{{ (reply.replyContent || '').length }}/500</div>
              <div class="input-buttons">
                <TechButton size="sm" variant="outline" @click="cancelReplyHandler(reply)">取消</TechButton>
                <TechButton size="sm" @click="submitNestedReplyHandler(reply)">回复</TechButton>
              </div>
            </div>
          </div>
        </div>

        <!-- 嵌套回复 -->
        <DiscussionReplies
          v-if="reply.children && reply.children.length > 0"
          :replies="reply.children"
          :discussion-id="discussionId"
          :parent-reply="reply"
          @reply-submitted="handleNestedReplySubmitted"
          @reply-liked="handleReplyLiked"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { TechButton } from '@/components/common'
import { useDiscussionInteraction } from '@/composables/useDiscussionInteraction'
import defaultAvatar from '@/assets/touxiang.png'
import config from '@/config/config'

// Props
interface Props {
  replies: any[]
  discussionId: number
  parentReply?: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  replySubmitted: [reply: any]
  replyLiked: [replyId: number, isLiked: boolean]
}>()

// 状态
const isExpanded = ref(true)
const replyTextarea = ref<HTMLTextAreaElement>()

// 使用组合式API
const {
  handleReplyLike,
  showReplyInput,
  cancelReply,
  submitNestedReply,
  reportReply,
  formatReplyContent,
  formatTimeAgo,
  canReport,
  isCurrentUser,
} = useDiscussionInteraction()

// 计算属性
const resolveAvatar = (avatar?: string) => {
  if (!avatar) return defaultAvatar
  if (/^https?:\/\//i.test(avatar)) return avatar
  const normalizedBase = config.baseUrl.replace(/\/$/, '')
  const normalizedPath = avatar.startsWith('/') ? avatar : `/${avatar}`
  return `${normalizedBase}${normalizedPath}`
}

// 方法
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = defaultAvatar
}

const toggleReplyLike = async (reply: any) => {
  await handleReplyLike(reply)
  emit('replyLiked', reply.id, reply.isLiked)
}

const showReplyInputHandler = async (reply: any) => {
  showReplyInput(reply)

  await nextTick()
  if (replyTextarea.value) {
    replyTextarea.value.focus()
  }
}

const cancelReplyHandler = (reply: any) => {
  cancelReply(reply)
}

const submitNestedReplyHandler = async (reply: any) => {
  await submitNestedReply(reply, props.discussionId)
  emit('replySubmitted', reply)
}

const reportReplyHandler = (reply: any) => {
  reportReply(reply)
}

const handleNestedReplySubmitted = (reply: any) => {
  emit('replySubmitted', reply)
}

const handleReplyLiked = (replyId: number, isLiked: boolean) => {
  emit('replyLiked', replyId, isLiked)
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.discussion-replies {
  margin-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 16px;
}

.replies-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.replies-count {
  font-size: 0.9rem;
  color: $color-text-secondary;
  font-weight: 500;
}

.toggle-replies-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: $color-text-secondary;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .toggle-icon {
    transition: transform 0.3s ease;

    &--expanded {
      transform: rotate(180deg);
    }
  }
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reply-item {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &--nested {
    margin-left: 48px;
    padding-left: 16px;
    border-left: 2px solid rgba(255, 255, 255, 0.1);

    @media (max-width: 768px) {
      margin-left: 24px;
      padding-left: 8px;
    }
  }
}

.reply-main {
  display: flex;
  gap: 12px;
}

.reply-avatar {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.user-level {
  position: absolute;
  bottom: -2px;
  right: -2px;
  padding: 1px 4px;
  border-radius: 6px;
  background: $color-yellow;
  color: rgba(0, 0, 0, 0.8);
  font-size: 0.6rem;
  font-weight: 600;
}

.reply-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.reply-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.reply-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.reply-username {
  color: $color-text-primary;
  font-weight: 600;
  font-size: 0.9rem;
}

.official-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 10px;
  background: rgba(253, 216, 53, 0.2);
  color: $color-yellow;
  font-size: 0.7rem;
  font-weight: 600;
}

.reply-to {
  color: $color-text-secondary;
  font-size: 0.8rem;

  &::before {
    content: '·';
    margin: 0 4px;
  }
}

.reply-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.action-btn {
  padding: 4px 8px;
  background: transparent;
  border: none;
  color: $color-text-secondary;
  font-size: 0.8rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: $color-text-primary;
  }

  &.like-btn {
    display: flex;
    align-items: center;
    gap: 4px;

    &--liked {
      color: #ff6b6b;

      svg {
        fill: currentColor;
      }
    }
  }

  &.report-btn {
    color: #ff9800;

    &:hover {
      background: rgba(255, 152, 0, 0.1);
    }
  }
}

.reply-text {
  color: $color-text-primary;
  line-height: 1.5;
  word-wrap: break-word;

  :deep(.mention) {
    color: #4a90e2;
    font-weight: 500;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
}

.reply-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.8rem;
  color: $color-text-secondary;
}

.reply-time {
  &::after {
    content: '·';
    margin: 0 6px;
  }
}

// 回复输入框
.reply-input-section {
  margin-top: 8px;
  margin-left: 44px;

  @media (max-width: 768px) {
    margin-left: 24px;
  }
}

.reply-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}

.reply-textarea {
  width: 100%;
  min-height: 60px;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: $color-text-primary;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: rgba(253, 216, 53, 0.5);
    box-shadow: 0 0 0 2px rgba(253, 216, 53, 0.1);
  }

  &::placeholder {
    color: $color-text-secondary;
  }
}

.reply-input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.character-count {
  font-size: 0.8rem;
  color: $color-text-secondary;
}

.input-buttons {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .reply-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .reply-actions {
    align-self: flex-end;
  }

  .action-btn {
    padding: 4px 6px;
    font-size: 0.75rem;
  }

  .reply-input-section {
    margin-left: 0;
  }

  .reply-item--nested {
    margin-left: 16px;
    padding-left: 8px;
  }
}

@media (max-width: 480px) {
  .reply-main {
    gap: 8px;
  }

  .reply-avatar {
    width: 28px;
    height: 28px;
  }

  .reply-username {
    font-size: 0.85rem;
  }

  .action-btn {
    padding: 3px 6px;
    font-size: 0.7rem;
  }
}
</style>
