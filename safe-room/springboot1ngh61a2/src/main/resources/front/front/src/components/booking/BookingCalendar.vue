<template>
  <section
    v-loading="loading"
    class="booking-calendar"
    :class="{ 'booking-calendar--loading': loading }"
    data-testid="booking-time-selection"
  >
    <div class="booking-calendar__legend">
      <span><i class="legend-dot legend-dot--available" />可预约</span>
      <span><i class="legend-dot legend-dot--low" />名额紧张</span>
      <span><i class="legend-dot legend-dot--conflict" />时间冲突</span>
    </div>
    <div class="booking-calendar__grid" data-testid="booking-time-calendar">
      <article v-for="day in days" :key="day.iso" class="booking-calendar__card">
        <header>
          <p>{{ day.label }}</p>
          <span>{{ day.weekday }}</span>
        </header>
        <div class="booking-calendar__slots">
          <el-tooltip
            v-for="slot in day.slots"
            :key="`${day.iso}-${slot.time}`"
            :content="resolveTooltip(day, slot)"
            effect="dark"
            placement="top"
          >
            <button
              type="button"
              class="calendar-slot"
              :class="[`calendar-slot--${slot.status}`, { 'calendar-slot--selected': isActiveSlot(day, slot) }]"
              :data-testid="`time-slot-${slot.time.replace(':', '-')}`"
              :disabled="slot.status === 'conflict' || slot.status === 'disabled'"
              @click="$emit('select', { day, slot })"
            >
              <div>
                <span>{{ slot.time }}</span>
                <small>{{ slot.period }}</small>
              </div>
              <span class="calendar-slot__meta"> {{ slot.remaining }} 名额 </span>
            </button>
          </el-tooltip>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
interface CalendarSlot {
  time: string
  period: string
  status: 'available' | 'low' | 'conflict' | 'disabled'
  statusLabel: string
  remaining: number
  conflictReasons?: string[]
}

interface CalendarDay {
  label: string
  weekday: string
  iso: string
  date: string
  slots: CalendarSlot[]
}

const props = withDefaults(
  defineProps<{
    days: CalendarDay[]
    selectedSlotKey?: string
    loading?: boolean
  }>(),
  {
    days: () => [],
    loading: false,
  },
)

defineEmits<{
  (e: 'select', payload: { day: CalendarDay; slot: CalendarSlot }): void
}>()

function isActiveSlot(day: CalendarDay, slot: CalendarSlot) {
  return props.selectedSlotKey === `${day.iso}-${slot.time}`
}

function resolveTooltip(day: CalendarDay, slot: CalendarSlot) {
  if (slot.status === 'conflict') {
    return (slot.conflictReasons ?? ['与已有预约时间重复']).join(' / ')
  }
  if (slot.status === 'low') {
    return `${day.label} ${slot.time} 名额紧张`
  }
  return `${day.label} ${slot.time}`
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.booking-calendar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.booking-calendar__legend {
  display: flex;
  gap: 18px;
  color: $color-text-secondary;
  font-size: 0.85rem;

  span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;

  &--available {
    background: rgba(253, 216, 53, 0.8);
  }

  &--low {
    background: #ff9800;
  }

  &--conflict {
    background: #ff6b6b;
  }
}

.booking-calendar__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.booking-calendar__card {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 14px;

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    p {
      margin: 0;
      font-weight: 600;
    }

    span {
      color: $color-text-secondary;
    }
  }
}

.booking-calendar__slots {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.calendar-slot {
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.01);
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: $transition-base;
  color: $color-text-primary;
  width: 100%;

  small {
    display: block;
    font-size: 0.75rem;
    color: $color-text-secondary;
  }

  &__meta {
    font-size: 0.8rem;
    letter-spacing: 0.1em;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &--available {
    border-color: rgba(253, 216, 53, 0.4);
  }

  &--low {
    border-color: #ff9800;
    box-shadow: 0 0 12px rgba(255, 152, 0, 0.25);
  }

  &--conflict {
    border-color: rgba(255, 0, 0, 0.45);
    color: #ff8080;
  }

  &--disabled {
    opacity: 0.5;
  }

  &--selected {
    border-color: $color-yellow;
    box-shadow: $shadow-glow;
  }
}

@media (max-width: 768px) {
  .booking-calendar__grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
  }

  .booking-calendar__card {
    padding: 12px;
  }
}

@media (max-width: 640px) {
  .booking-calendar__legend {
    flex-wrap: wrap;
    gap: 12px;
    font-size: 0.8rem;
  }

  .booking-calendar__grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .booking-calendar__card {
    padding: 10px;
  }

  .calendar-slot {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
}
</style>
