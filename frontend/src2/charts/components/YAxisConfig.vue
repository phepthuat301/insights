<script setup lang="ts">
import ColorInput from '@/components/Controls/ColorInput.vue'
import { debounce } from 'frappe-ui'
import { watchEffect, computed } from 'vue'
import Checkbox from '../../components/Checkbox.vue'
import DraggableList from '../../components/DraggableList.vue'
import InlineFormControlLabel from '../../components/InlineFormControlLabel.vue'
import { copy } from '../../helpers'
import { AxisChartConfig } from '../../types/chart.types'
import { ColumnOption, MeasureOption } from '../../types/query.types'
import CollapsibleSection from './CollapsibleSection.vue'
import MeasurePicker from './MeasurePicker.vue'
import { XIcon } from 'lucide-vue-next'

const props = defineProps<{ columnOptions: ColumnOption[]; simple?: boolean }>()
const y_axis = defineModel<AxisChartConfig['y_axis']>({
	required: true,
	default: () => ({
		series: [],
	}),
})

const emptySeries = { measure: {} as MeasureOption }
watchEffect(() => {
	if (!y_axis.value?.series?.length) {
		y_axis.value = { series: [copy(emptySeries)] }
	}
})

function addSeries() {
	y_axis.value.series.push(copy(emptySeries))
}

const updateColor = debounce((color: string, idx: number) => {
	if (!y_axis.value.series[idx].color) {
		y_axis.value.series[idx].color = []
	}
	y_axis.value.series[idx].color = color ? [color] : []
}, 500)

// In simple mode, show all columns to allow quick selection
const simpleColumns = computed(() => props.columnOptions)

function onSimpleSelect(item: any, val: string) {
	const opt = props.columnOptions.find((o) => o.value === val)
	if (opt && (opt.data_type === 'Integer' || opt.data_type === 'Decimal')) {
		item.measure = {
			column_name: val,
			data_type: 'Decimal',
			measure_name: `avg_of_${val}`,
			aggregation: 'avg',
		}
		return
	}
	// auto-parse string with percent or numeric text to decimal
	item.measure = {
		expression: { type: 'expression', expression: `to_decimal(replace([${val}], '%', ''))` },
		measure_name: `avg_of_${val}`,
		data_type: 'Decimal',
	}
}
</script>

<template>
	<CollapsibleSection title="Y Axis">
		<div class="flex flex-col gap-3 pt-1">
			<div>
				<p class="mb-1.5 text-xs text-gray-600">Series</p>
				<div v-if="props.simple">
					<DraggableList v-model:items="y_axis.series" group="series">
						<template #item="{ item, index }">
							<div class="flex w-full flex-col gap-1.5">
								<div class="flex items-center gap-2">
									<FormControl type="select" class="flex-1" placeholder="Select a column"
										:options="simpleColumns"
										v-model="(item.measure as any).column_name"
										@update:modelValue="(val:string)=> onSimpleSelect(item, val)"
									/>
									<Button @click="y_axis.series.splice(index,1)"><template #icon><XIcon class="h-4 w-4 text-gray-700" stroke-width="1.5"/></template></Button>
								</div>
								<div class="flex gap-2">
									<FormControl type="select" class="flex-1" label="Type" :options="['Line','Bar']" v-model="item.type" />
									<FormControl type="select" class="flex-1" label="Align" :options="['Left','Right']" v-model="item.align" />
								</div>
							</div>
						</template>
					</DraggableList>
					<button class="mt-1.5 text-left text-xs text-gray-600 hover:underline" @click="addSeries">+ Add series</button>
				</div>

				<div v-else>
					<DraggableList v-model:items="y_axis.series" group="series">
						<template #item="{ item, index }">
							<MeasurePicker
								:model-value="item.measure"
								:column-options="props.columnOptions"
								@update:model-value="Object.assign(item.measure, $event || {})"
								@remove="y_axis.series.splice(index, 1)"
							>
								<template #config-fields>
									<InlineFormControlLabel label="Type">
										<FormControl
											type="select"
											v-model="item.type"
											:options="['Line', 'Bar']"
										/>
									</InlineFormControlLabel>
									<InlineFormControlLabel label="Align">
										<FormControl
											type="select"
											v-model="item.align"
											:options="['Left', 'Right']"
										/>
									</InlineFormControlLabel>
									<InlineFormControlLabel label="Color">
										<ColorInput
											:model-value="item.color?.[0]"
											@update:model-value="updateColor($event, index)"
											placement="left-start"
										/>
									</InlineFormControlLabel>
									<Toggle
										label="Show Data Labels"
										v-model="item.show_data_labels"
									/>

									<slot name="series-settings" :series="item" :idx="index" />
								</template>
							</MeasurePicker>
						</template>
					</DraggableList>
					<button
						class="mt-1.5 text-left text-xs text-gray-600 hover:underline"
						@click="addSeries"
					>
						+ Add series
					</button>
				</div>
			</div>

			<slot name="y-axis-settings" :y_axis="y_axis" />
			<Toggle label="Show Data Labels" v-model="y_axis.show_data_labels" />
			<Toggle label="Show Axis Label" v-model="y_axis.show_axis_label" />
			<Toggle label="Show Scrollbar" v-model="y_axis.show_scrollbar" />
			<FormControl
				v-if="y_axis.show_axis_label"
				v-model="y_axis.axis_label"
				label="Axis Label"
			/>

			<InlineFormControlLabel label="Y-Min" class="w-1/2">
				<FormControl type="number" v-model="y_axis.min" placeholder="Min" />
			</InlineFormControlLabel>
			<InlineFormControlLabel label="Y-Max" class="w-1/2">
				<FormControl type="number" v-model="y_axis.max" placeholder="Max" />
			</InlineFormControlLabel>
		</div>
	</CollapsibleSection>
</template>
