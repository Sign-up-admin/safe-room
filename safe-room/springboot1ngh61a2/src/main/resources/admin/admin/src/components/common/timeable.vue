<template>
  <div>
    <div class="panel">
      <el-table
        :data="timetable"
        :span-method="objectSpanMethod"
        border
        :header-cell-style="{ background: '#d9e5fd', color: 'black', fontWeight: 1000 }"
        :cell-style="tableCellStyle"
      >
        <el-table-column prop="sjd" label="Time Period" width="80" align="center"> </el-table-column>
        <el-table-column prop="jc" label="Session" width="120" align="center">
          <template #default="scope">
            <SafeHtml :html="scope.row.jc" />
          </template>
        </el-table-column>
        <el-table-column prop="mon" label="Monday" align="center">
          <template #default="scope">
            <h4>{{ scope.row.mon.title }}</h4>
            <SafeHtml :html="scope.row.mon.content" />
          </template>
        </el-table-column>
        <el-table-column prop="tue" label="Tuesday" align="center">
          <template #default="scope">
            <h4>{{ scope.row.tue.title }}</h4>
            <SafeHtml :html="scope.row.tue.content" />
          </template>
        </el-table-column>
        <el-table-column prop="wed" label="Wednesday" align="center">
          <template #default="scope">
            <h4>{{ scope.row.wed.title }}</h4>
            <SafeHtml :html="scope.row.wed.content" />
          </template>
        </el-table-column>
        <el-table-column prop="thu" label="Thursday" align="center">
          <template #default="scope">
            <h4>{{ scope.row.thu.title }}</h4>
            <SafeHtml :html="scope.row.thu.content" />
          </template>
        </el-table-column>
        <el-table-column prop="fri" label="Friday" align="center">
          <template #default="scope">
            <h4>{{ scope.row.fri.title }}</h4>
            <SafeHtml :html="scope.row.fri.content" />
          </template>
        </el-table-column>
        <el-table-column prop="sat" label="Saturday" align="center">
          <template #default="scope">
            <h4>{{ scope.row.sat.title }}</h4>
            <SafeHtml :html="scope.row.sat.content" />
          </template>
        </el-table-column>
        <el-table-column prop="sun" label="Sunday" align="center">
          <template #default="scope">
            <h4>{{ scope.row.sun.title }}</h4>
            <SafeHtml :html="scope.row.sun.content" />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts" name="Timeable">
import { computed, nextTick, ref, watch } from 'vue'
import SafeHtml from './SafeHtml.vue'
import type { TableColumnCtx } from 'element-plus'

interface TimeSlot {
	sjd: string
	sectionnum: string
	starttime: string
	endtime: string
}

interface EventItem {
	week: number
	start: number
	end: number
	title?: string
	content?: string
}

interface TimetableRow {
	sjd: string
	jc: string
	jc1: number
	mon: EventItem | {}
	tue: EventItem | {}
	wed: EventItem | {}
	thu: EventItem | {}
	fri: EventItem | {}
	sat: EventItem | {}
	sun: EventItem | {}
}

interface Props {
	afternoonLength?: string | number
	morningLength?: string | number
	length?: string | number
	events?: EventItem[]
	time?: TimeSlot[]
}

const props = withDefaults(defineProps<Props>(), {
	afternoonLength: 4,
	morningLength: 4,
	length: 12,
	events: () => [],
	time: () => []
})

const timetable = ref<TimetableRow[]>([])
const hoverOrderArr = ref<any[]>([])
const weeks = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const allPalette = ['#f05261', '#48a8e4', '#ffd061', '#52db9a', '#70d3e6', '#52db9a', '#3f51b5',
	'#f3d147', '#4adbc3', '#673ab7', '#f3db49', '#76bfcd', '#b495e1', '#ff9800', '#8bc34a'
]

const afternoonLengthNum = computed(() => Number(props.afternoonLength))
const morningLengthNum = computed(() => Number(props.morningLength))
const lengthNum = computed(() => Number(props.length))

function getRandomInt(min: number, max: number) {
	min = Math.ceil(min)
	max = Math.floor(max)
	return Math.floor(Math.random() * (max - min + 1)) + min
}

function tableCellStyle({ row, column }: { row: TimetableRow, column: TableColumnCtx<TimetableRow> }) {
	const prop = column.property as keyof TimetableRow
	if (prop !== 'jc' && prop !== 'sjd' && prop) {
		const cellValue = row[prop]
		if (cellValue && typeof cellValue === 'object' && 'title' in cellValue && (cellValue as EventItem).title !== undefined) {
			return `background-color:${allPalette[getRandomInt(0, allPalette.length - 1)]};color: #fff; border-radius:10px`
		}
	}
	return {}
}

function makeTimetable() {
	timetable.value = []
	for (let i = 0; i < props.time.length; i++) {
		const one: TimetableRow = {
			sjd: props.time[i].sjd,
			jc: Number(props.time[i].sectionnum) + '<br><div style="font-size: 12px">(' + props.time[i]
				.starttime + '-' + props.time[i].endtime + ')</div>',
			jc1: i + 1,
			mon: {},
			tue: {},
			wed: {},
			thu: {},
			fri: {},
			sat: {},
			sun: {}
		}
		timetable.value.push(one)
	}
	mergeData()
	nextTick()
}

function dateState(date = new Date()) {
	// Get current hour
	const hours = date.getHours()
	if (hours <= 12) {
		return 'Morning'
	} else if (hours > 12 && hours <= 18) {
		return 'Afternoon'
	} else {
		return 'Evening'
	}
}

function mergeData() {
	// Merge data
	if (props.events.length > 0 && timetable.value.length > 0) {
		for (let i = 0; i < props.events.length; i++) {
			// Get day of week
			const week = weeks[props.events[i].week - 1] as keyof TimetableRow
			if (week && props.events[i].start > 0 && props.events[i].start <= timetable.value.length) {
				(timetable.value[props.events[i].start - 1][week] as EventItem) = props.events[i]
			}
		}
	}
}

function objectSpanMethod({
	row,
	column,
	rowIndex,
	columnIndex
}: {
	row: TimetableRow
	column: TableColumnCtx<TimetableRow>
	rowIndex: number
	columnIndex: number
}) {
	if (columnIndex === 0) {
		if (rowIndex < morningLengthNum.value) {
			if (rowIndex === 0) {
				return {
					rowspan: morningLengthNum.value,
					colspan: 1
				}
			} else {
				return {
					rowspan: 0,
					colspan: 0
				}
			}
		} else if (rowIndex > morningLengthNum.value - 1 && rowIndex < (morningLengthNum.value + afternoonLengthNum.value)) {
			if (rowIndex === morningLengthNum.value) {
				return {
					rowspan: afternoonLengthNum.value,
					colspan: 1
				}
			} else {
				return {
					rowspan: 0,
					colspan: 0
				}
			}
		} else {
			if (rowIndex === (morningLengthNum.value + afternoonLengthNum.value)) {
				return {
					rowspan: lengthNum.value - morningLengthNum.value - afternoonLengthNum.value,
					colspan: 1
				}
			} else {
				return {
					rowspan: 0,
					colspan: 0
				}
			}
		}
	}
	if (columnIndex >= 2) {
		const weekProp = weeks[columnIndex - 2] as keyof TimetableRow
		if (weekProp) {
			const cellValue = row[weekProp]
			if (cellValue && typeof cellValue === 'object' && 'title' in cellValue && (cellValue as EventItem).title !== undefined && row.jc1 === (cellValue as EventItem).start) {
				return {
					rowspan: (cellValue as EventItem).end - (cellValue as EventItem).start + 1,
					colspan: 1
				}
			} else if (timetable.value.some(r => {
				const weekData = r[weekProp]
				return weekData && typeof weekData === 'object' && 'start' in weekData && 'end' in weekData && (weekData as EventItem).start <= row.jc1 && (weekData as EventItem).end >= row.jc1
		})) {
			return {
				rowspan: 0,
				colspan: 1
			}
		}
	}
	return {
		rowspan: 1,
		colspan: 1
	}
}

watch(() => props.events, () => {
	mergeData()
}, { deep: true })

watch(() => props.time, () => {
	makeTimetable()
}, { deep: true })

makeTimetable()
</script>
