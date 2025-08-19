<script setup lang="tsx">
import { watchDebounced } from '@vueuse/core'
import { Breadcrumbs, ListView, FormControl, Button, Dropdown } from 'frappe-ui'
import { MoreHorizontal, RefreshCcw, SearchIcon, Trash2 } from 'lucide-vue-next'
import { h, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import useDataSourceStore from './data_source'
import useTableStore, { DataSourceTable } from './tables'
import { confirmDialog } from '../helpers/confirm_dialog'

const props = defineProps<{ name: string }>()
const router = useRouter()

const dataSource = useDataSourceStore().getSource(props.name)
const tableStore = useTableStore()

const searchQuery = ref('')
const filteredTables = ref<DataSourceTable[]>()
watchDebounced(searchQuery, () => updateTablesList(), { debounce: 300, immediate: true })

function updateTablesList() {
	tableStore.getTables(props.name, searchQuery.value).then((tables) => {
		filteredTables.value = tables
	})
}

const listOptions = ref({
	columns: [
		{
			label: 'Table Name',
			key: 'table_name',
		},
	],
	rows: filteredTables,
	rowKey: 'table_name',
	options: {
		showTooltip: false,
		getRowRoute: (table: DataSourceTable) => ({
			path: `/data-source/${props.name}/${table.table_name}`,
		}),
		emptyState: {
			title: 'No Tables Found',
			description: 'No tables found for the selected data source.',
			button: {
				label: 'Refresh',
				iconLeft: 'refresh-ccw',
				variant: 'outline',
				loading: tableStore.updatingDataSourceTables,
				onClick: () =>
					tableStore.updateDataSourceTables(props.name).then(() => updateTablesList()),
			},
		},
	},
})

const dataSourceStore = useDataSourceStore()
watchEffect(() => {
	const ds = dataSourceStore.getSource(props.name)
	document.title = `Tables | ${props.name || ds?.title}`
})

const handleDeleteDataSource = async () => {
	const dataSource = dataSourceStore.getSource(props.name)
	if (!dataSource) return
	
	// Không cho phép xóa site database
	if (dataSource.is_site_db) {
		alert('Cannot delete the site database. It is needed for Insights.')
		return
	}
	
	confirmDialog({
		title: 'Delete Data Source',
		message: `Are you sure you want to delete the data source "${dataSource.title}"? This action cannot be undone.`,
		primaryActionLabel: 'Delete',
		theme: 'red',
		onSuccess: async () => {
			try {
				await dataSourceStore.deleteDataSource(props.name)
				// Navigate to data source list after deletion
				router.push('/data-source')
			} catch (error) {
				console.error('Error deleting data source:', error)
			}
		},
	})
}
</script>

<template>
	<header class="flex h-12 items-center justify-between border-b py-2.5 pl-5 pr-2">
		<Breadcrumbs
			:items="[
				{ label: 'Data Sources', route: '/data-source' },
				{ label: dataSource?.title || props.name, route: `/data-source/${props.name}` },
			]"
		/>
		<div class="flex items-center gap-2"></div>
	</header>

	<div class="mb-4 flex h-full flex-col gap-3 overflow-auto px-5 py-3">
		<div class="flex gap-2 overflow-visible py-1">
			<FormControl placeholder="Search by Title" v-model="searchQuery" :debounce="300">
				<template #prefix>
					<SearchIcon class="h-4 w-4 text-gray-500" />
				</template>
			</FormControl>
			<Dropdown
				:options="[
					{
						label: 'Update Tables',
						onClick: () =>
							tableStore
								.updateDataSourceTables(props.name)
								.then(() => updateTablesList()),
						icon: () =>
							h(RefreshCcw, {
								class: 'h-4 w-4 text-gray-700',
								'stroke-width': '1.5',
							}),
					},
					dataSource?.is_frappe_db
						? {
								label: 'Update Table Links',
								onClick: () => tableStore.updateTableLinks(props.name),
								icon: () =>
									h(RefreshCcw, {
										class: 'h-4 w-4 text-gray-700',
										'stroke-width': '1.5',
									}),
						  }
						: null,
					{
						label: 'Delete Data Source',
						onClick: handleDeleteDataSource,
						icon: () =>
							h(Trash2, {
								class: 'h-4 w-4 text-red-600',
								'stroke-width': '1.5',
							}),
					},
				].filter(Boolean)"
			>
				<Button>
					<template #icon>
						<MoreHorizontal class="h-4 w-4 text-gray-700" stroke-width="1.5" />
					</template>
				</Button>
			</Dropdown>
		</div>
		<ListView class="h-full" v-bind="listOptions"> </ListView>
	</div>
</template>
