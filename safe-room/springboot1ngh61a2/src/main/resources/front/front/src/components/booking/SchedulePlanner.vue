<template>
  <section class="schedule-planner">
    <header class="schedule-planner__header">
      <div>
        <p class="section-eyebrow">TIME PLANNER</p>
        <h3>{{ title }}</h3>
      </div>
      <span>{{ subtitle }}</span>
    </header>

    <BookingCalendar
      :days="days"
      :selected-slot-key="selectedSlotKey"
      :loading="loading"
      @select="$emit('select', $event)"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BookingCalendar from './BookingCalendar.vue'

const props = withDefaults(
  defineProps<{
    days: Array<any>
    selectedSlotKey?: string
    loading?: boolean
    coachName?: string
  }>(),
  {
    days: () => [],
    loading: false,
  },
)

defineEmits<{
  (e: 'select', payload: any): void
}>()

const title = computed(() => `${props.coachName ?? '私教'}档期`)
const subtitle = computed(() => (props.loading ? '同步档期中...' : '可预约 14 天档期 · 自动冲突检测'))
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.schedule-planner__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  h3 {
    margin: 4px 0 0;
  }

  span {
    color: $color-text-secondary;
    font-size: 0.9rem;
  }
}
</style>
