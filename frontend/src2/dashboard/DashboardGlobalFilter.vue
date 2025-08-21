<script setup lang="ts">
import { computed, inject, reactive, ref, watch, onMounted, onUnmounted } from 'vue'
import { call } from 'frappe-ui'
import { FilterOperator, FilterValue } from '../types/query.types'
import { Dashboard } from './dashboard'

interface DashboardFilter {
	column: {
		query: string
		column: string
		label: string
		type: string
	} | null
	operator: {
		value: string
		label: string
	} | null
	value: {
		value: any
		label: string
	} | null
}

const dashboard = inject<Dashboard>('dashboard')!
const emit = defineEmits<{
	'filter-applied': [filters: any[]]
	'filter-reset': []
}>()

// Global dashboard filters state
const dashboardFilters = ref<DashboardFilter[]>([])
const isOpen = ref(false)

// Available columns for filtering (from all queries in the dashboard)
const availableColumns = ref<Array<{
	query: string
	column: string
	label: string
	type: string
}>>([])

// Load available columns from dashboard charts
const loadAvailableColumns = async () => {
	if (!dashboard.doc.items) return
	
	console.log('Loading columns for dashboard:', dashboard.doc.name)
	const chartItems = dashboard.doc.items.filter(item => item.type === 'chart')
	console.log('Chart items found:', chartItems)
	
	const columns: typeof availableColumns.value = []
	
	for (const item of chartItems) {
		try {
			// Get the chart document
			const chartDoc = await call('frappe.client.get_doc', {
				doctype: 'Insights Chart v3',
				name: item.chart
			})
			
			const queryName = chartDoc.query || chartDoc.data_query
			if (!queryName) continue
			
			console.log('Loading query:', queryName)
			
			// Get the query document
			const queryDoc = await call('frappe.client.get_doc', {
				doctype: 'Insights Query v3',
				name: queryName
			})
			
			// Parse operations to extract dimensions and measures
			const operations = JSON.parse(queryDoc.operations || '[]')
			const summarizeOp = operations.find((op: any) => op.type === 'summarize')
			
			if (summarizeOp) {
				// Add dimensions
				if (summarizeOp.dimensions) {
					summarizeOp.dimensions.forEach((dim: any) => {
						// Check if column already exists to avoid duplicates
						const exists = columns.find(col => 
							col.query === queryName && col.column === dim.column_name
						)
						if (!exists) {
							columns.push({
								query: queryName,
								column: dim.column_name,
								label: dim.label || dim.column_name,
								type: dim.data_type || 'String'
							})
						}
					})
				}
				
				// Add measures (optional, for filtering on aggregated values)
				if (summarizeOp.measures) {
					summarizeOp.measures.forEach((measure: any) => {
						const exists = columns.find(col => 
							col.query === queryName && col.column === measure.column_name
						)
						if (!exists) {
							columns.push({
								query: queryName,
								column: measure.column_name,
								label: measure.column_name,
								type: measure.data_type || 'Number'
							})
						}
					})
				}
			}
		} catch (error) {
			console.warn('Failed to load columns for chart:', item.chart, error)
		}
	}
	
	availableColumns.value = columns
	console.log('Available columns loaded:', availableColumns.value)
}

// Load columns when dashboard is ready
watch(() => dashboard.doc.items, loadAvailableColumns, { immediate: true })

const addFilter = () => {
	// Auto-select Time column for all filters
	const timeColumn = {
		query: 'i3k6clg0vd', // You can update this to match your actual query name
		column: 'Time',
		column_name: 'Time',
		label: 'Time',
		type: 'Date'
	}
	
	dashboardFilters.value.push({
		column: timeColumn,
		operator: { value: 'between', label: 'between' }, // Auto-select between operator
		value: null
	})
}

const removeFilter = (index: number) => {
	dashboardFilters.value.splice(index, 1)
	applyFilters()
}

const applyFilters = () => {
	const validFilters = dashboardFilters.value.filter(filter => 
		filter.column && filter.operator && filter.value
	)
	
	if (validFilters.length === 0) {
		emit('filter-reset')
		return
	}
	
	// Convert filters to the format expected by the API
	const apiFilters = validFilters.map(filter => ({
		column: {
			query: filter.column?.query,
			column_name: filter.column?.column,
			type: filter.column?.type
		},
		operator: {
			value: filter.operator?.value,
			label: filter.operator?.label
		},
		value: {
			value: filter.value?.value,
			label: filter.value?.label
		}
	}))
	
	console.log('Applying filters:', apiFilters)
	
	emit('filter-applied', apiFilters)
}

const resetFilters = () => {
	dashboardFilters.value = []
	emit('filter-reset')
}

// Operator options based on column type
const getOperatorOptions = (columnType: string) => {
	const commonOps = [
		{ label: 'equals', value: '=' },
		{ label: 'not equals', value: '!=' }
	]
	
	if (columnType === 'String') {
		return [
			...commonOps,
			{ label: 'contains', value: 'like' },
			{ label: 'in', value: 'in' },
			{ label: 'not in', value: 'not_in' }
		]
	} else if (['Date', 'Datetime'].includes(columnType)) {
		return [
			...commonOps,
			{ label: 'greater than', value: '>' },
			{ label: 'less than', value: '<' },
			{ label: 'between', value: 'between' }
		]
	} else if (['Number', 'Decimal', 'Integer'].includes(columnType)) {
		return [
			...commonOps,
			{ label: 'greater than', value: '>' },
			{ label: 'less than', value: '<' },
			{ label: 'greater than or equal', value: '>=' },
			{ label: 'less than or equal', value: '<=' }
		]
	}
	
	return commonOps
}

// Get distinct values for a column
const getColumnValues = async (column: any, searchTerm = '') => {
	if (!column) return []
	
	try {
		return await call('insights.api.dashboards.get_dashboard_filter_options', {
			dashboard_name: dashboard.doc.name,
			query_name: column.query,
			column_name: column.column,
			search_term: searchTerm
		})
	} catch (error) {
		console.error('Failed to get column values:', error)
		return []
	}
}

const hasFilters = computed(() => dashboardFilters.value.length > 0)
const activeFiltersCount = computed(() => 
	dashboardFilters.value.filter(f => f.column && f.operator && f.value).length
)

// Click outside to close filter panel
const filterContainer = ref<HTMLElement>()

const handleClickOutside = (event: MouseEvent) => {
	if (filterContainer.value && !filterContainer.value.contains(event.target as Node)) {
		isOpen.value = false
	}
}

onMounted(() => {
	document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
	document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
	<div class="dashboard-global-filter" ref="filterContainer">
		<!-- Filter Toggle Button -->
		<Button
			@click="isOpen = !isOpen"
			variant="outline"
			:label="`Filters${activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}`"
		>
			<template #prefix>
				<FeatherIcon name="filter" class="h-4 w-4" />
			</template>
		</Button>

		<!-- Filter Panel -->
		<div v-if="isOpen" class="absolute top-full right-0 z-50 mt-2 w-[600px] max-w-[90vw] border rounded-lg bg-white p-4 shadow-lg">
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-sm font-medium text-gray-900">Dashboard Filters</h3>
				<div class="flex items-center gap-2">
					<Button
						@click="addFilter"
						variant="ghost"
						size="sm"
						label="Add Filter"
					>
						<template #prefix>
							<FeatherIcon name="plus" class="h-4 w-4" />
						</template>
					</Button>
					<Button
						@click="isOpen = false"
						variant="ghost"
						size="sm"
						icon="x"
					/>
				</div>
			</div>

			<!-- Filter List -->
			<div v-if="hasFilters" class="space-y-3">
				<div
					v-for="(filter, index) in dashboardFilters"
					:key="index"
					class="flex items-center gap-2 p-3 border rounded bg-gray-50"
				>
					<!-- Column Selection (Hardcoded to Time) -->
					<div class="flex-1">
						<div class="px-3 py-2 border rounded bg-gray-100 text-gray-700 text-sm">
							<div class="flex items-center gap-2">
								<FeatherIcon name="calendar" class="h-4 w-4" />
								<span>Time (Date Filter)</span>
							</div>
						</div>
						<div class="text-xs text-gray-500 mt-1">
							Fixed to Time column
						</div>
					</div>

					<!-- Operator Selection (Fixed to Between) -->
					<div class="flex-1">
						<div class="px-3 py-2 border rounded bg-gray-100 text-gray-700 text-sm">
							<div class="flex items-center gap-2">
								<FeatherIcon name="calendar" class="h-4 w-4" />
								<span>between</span>
							</div>
						</div>
						<div class="text-xs text-gray-500 mt-1">
							Date range filter
						</div>
					</div>

					<!-- Date Range Input (Always Between for Time) -->
					<div class="flex-2">
						<div class="flex items-center gap-2">
							<FormControl
								:model-value="filter.value?.startDate || ''"
								@update:model-value="(val) => {
									const endDate = filter.value?.endDate || ''
									const dateRange = val && endDate ? [val, endDate] : [val, val]
									filter.value = { 
										value: dateRange,
										startDate: val,
										endDate: endDate,
										label: val && endDate ? `${val} to ${endDate}` : val
									}
									if (val && endDate) applyFilters()
								}"
								type="date"
								placeholder="Start date"
								class="flex-1"
							/>
							<span class="text-gray-500 text-sm font-medium">to</span>
							<FormControl
								:model-value="filter.value?.endDate || ''"
								@update:model-value="(val) => {
									const startDate = filter.value?.startDate || ''
									const dateRange = startDate && val ? [startDate, val] : [startDate, val]
									filter.value = { 
										value: dateRange,
										startDate: startDate,
										endDate: val,
										label: startDate && val ? `${startDate} to ${val}` : val
									}
									if (startDate && val) applyFilters()
								}"
								type="date"
								placeholder="End date"
								class="flex-1"
							/>
						</div>
						<div class="text-xs text-gray-500 mt-1">
							Select date range to filter all charts
						</div>
					</div>

					<!-- Remove Button -->
					<Button
						@click="removeFilter(index)"
						variant="ghost"
						size="sm"
						icon="trash-2"
						class="text-red-600 hover:text-red-700"
					/>
				</div>
			</div>

			<!-- Empty State -->
			<div v-else class="text-center py-8 text-gray-500">
				<FeatherIcon name="filter" class="h-8 w-8 mx-auto mb-2 opacity-50" />
				<p class="text-sm">No filters added yet</p>
				<p class="text-xs">Click "Add Filter" to filter all charts in this dashboard</p>
			</div>

			<!-- Action Buttons -->
			<div v-if="hasFilters" class="flex justify-between items-center mt-4 pt-3 border-t">
				<Button
					@click="resetFilters"
					variant="ghost"
					size="sm"
					label="Clear All"
				/>
				<Button
					@click="applyFilters"
					variant="solid"
					size="sm"
					label="Apply Filters"
				/>
			</div>
		</div>
	</div>
</template>

<style scoped>
.dashboard-global-filter {
	@apply relative;
}

/* Ensure the filter panel appears above other content */
.dashboard-global-filter .absolute {
	box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>
