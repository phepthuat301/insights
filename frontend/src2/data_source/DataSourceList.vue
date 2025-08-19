<script setup lang="tsx">
import { Avatar, Breadcrumbs, ListView, Dropdown, Button, FormControl } from 'frappe-ui'
import { PlusIcon, SearchIcon, MoreHorizontal } from 'lucide-vue-next'
import { computed, ref, h } from 'vue'
import CSVIcon from '../components/Icons/CSVIcon.vue'
import IndicatorIcon from '../components/Icons/IndicatorIcon.vue'
import SelectTypeDialog from '../components/SelectTypeDialog.vue'
import useUserStore from '../users/users'
import ConnectMariaDBDialog from './ConnectMariaDBDialog.vue'
import ConnectPostgreSQLDialog from './ConnectPostgreSQLDialog.vue'
import useDataSourceStore, { getDatabaseLogo } from './data_source'
import { DataSourceListItem } from './data_source.types'
import UploadCSVFileDialog from './UploadCSVFileDialog.vue'
import ConnectDuckDBDialog from './ConnectDuckDBDialog.vue'
import { confirmDialog } from '../helpers/confirm_dialog'
import { dialogs } from '../helpers/confirm_dialog'

const dataSourceStore = useDataSourceStore()
dataSourceStore.getSources()

const searchQuery = ref('')
const filteredDataSources = computed(() => {
	if (!searchQuery.value) {
		return dataSourceStore.sources
	}
	return dataSourceStore.sources.filter((data_source) =>
		data_source.title.toLowerCase().includes(searchQuery.value.toLowerCase())
	)
})

const showNewSourceDialog = ref(false)
const showNewMariaDBDialog = ref(false)
const showNewPostgreSQLDialog = ref(false)
const showNewDuckDBDialog = ref(false)
const showCSVFileUploadDialog = ref(false)

const sourceTypes = [
	{
		label: 'MariaDB',
		icon: getDatabaseLogo('MariaDB'),
		description: 'Connect to MariaDB database',
		onClick: () => {
			showNewSourceDialog.value = false
			showNewMariaDBDialog.value = true
		},
	},
	{
		label: 'PostgreSQL',
		icon: getDatabaseLogo('PostgreSQL'),
		description: 'Connect to PostgreSQL database',
		onClick: () => {
			showNewSourceDialog.value = false
			showNewPostgreSQLDialog.value = true
		},
	},
	{
		label: 'DuckDB',
		icon: getDatabaseLogo('DuckDB'),
		description: 'Connect to DuckDB database',
		onClick: () => {
			showNewSourceDialog.value = false
			showNewDuckDBDialog.value = true
		},
	},
	{
		label: 'Upload CSV',
		icon: <CSVIcon class="h-8 w-8" />,
		description: 'Upload a CSV file',
		onClick: () => {
			showNewSourceDialog.value = false
			showCSVFileUploadDialog.value = true
		},
	},
]

const userStore = useUserStore()
const listOptions = ref({
	columns: [
		{
			label: 'Title',
			key: 'title',
			prefix: (props: any) => {
				const data_source = props.row as DataSourceListItem
				return getDatabaseLogo(data_source.database_type, 'sm')
			},
		},
		{
			label: 'Status',
			key: 'status',
			prefix: (props: any) => {
				const color = props.row.status == 'Inactive' ? 'text-gray-500' : 'text-green-500'
				return <IndicatorIcon class={color} />
			},
		},
		{
			label: 'Owner',
			key: 'owner',
			getLabel(props: any) {
				const data_source = props.row as DataSourceListItem
				const user = userStore.getUser(data_source.owner)
				return user?.full_name || data_source.owner
			},
			prefix: (props: any) => {
				const data_source = props.row as DataSourceListItem
				const imageUrl = userStore.getUser(data_source.owner)?.user_image
				return <Avatar size="md" label={data_source.owner} image={imageUrl} />
			},
		},
		{ label: 'Created', key: 'created_from_now' },
		{ label: 'Modified', key: 'modified_from_now' },
		{
			label: 'Actions',
			key: 'actions',
			prefix: (props: any) => {
				const data_source = props.row as DataSourceListItem
				return h(Dropdown, {
					options: [
						{
							label: 'Delete',
							icon: 'trash',
							onClick: () => handleDeleteDataSource(data_source.name),
							disabled: dataSourceStore.deleting,
						},
					],
					disabled: dataSourceStore.deleting,
				}, {
					default: () => h(Button, {
						variant: 'ghost',
						size: 'sm',
						disabled: dataSourceStore.deleting,
					}, {
						icon: () => h(MoreHorizontal, {
							class: 'h-4 w-4 text-gray-700',
							'stroke-width': '1.5',
						}),
					}),
				})
			},
		},
	],
	rows: filteredDataSources,
	rowKey: 'name',
	options: {
		showTooltip: false,
		getRowRoute: (data_source: DataSourceListItem) => ({
			path: `/data-source/${data_source.name}`,
		}),
		emptyState: {
			title: 'No data sources.',
			description: 'No data sources to display.',
			button: {
				label: 'New Data Source',
				variant: 'solid',
				onClick: () => (showNewSourceDialog.value = true),
			},
		},
	},
})

document.title = 'Data Sources | Insights'

const handleDeleteDataSource = async (name: string) => {
	const dataSource = dataSourceStore.getSource(name)
	if (!dataSource) return
	
	// Không cho phép xóa site database
	if (dataSource.is_site_db) {
		alert('Cannot delete the site database. It is needed for Insights.')
		return
	}
	
	// Prevent multiple clicks while deleting
	if (dataSourceStore.deleting) return
	
	confirmDialog({
		title: 'Delete Data Source',
		message: `Are you sure you want to delete the data source "${dataSource.title}"? This action cannot be undone.`,
		primaryActionLabel: 'Delete',
		theme: 'red',
		onSuccess: async () => {
			try {
				await dataSourceStore.deleteDataSource(name)
				// Refresh the list after successful deletion
				await dataSourceStore.getSources()
			} catch (error) {
				console.error('Error deleting data source:', error)
				// Show error to user
				alert(`Failed to delete data source: ${error.message || error}`)
			}
		},
	})
}
</script>

<template>
	<header class="flex h-12 items-center justify-between border-b py-2.5 pl-5 pr-2">
		<Breadcrumbs :items="[{ label: 'Data Sources', route: '/data-source' }]" />
		<div class="flex items-center gap-2">
			<Button label="New Data Source" variant="solid" @click="showNewSourceDialog = true">
				<template #prefix>
					<PlusIcon class="w-4" />
				</template>
			</Button>
			<!-- Loading indicator for deletion -->
			<div v-if="dataSourceStore.deleting" class="flex items-center gap-2 text-sm text-gray-500">
				<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
				Deleting...
			</div>
		</div>
	</header>

	<div class="mb-4 flex h-full flex-col gap-3 overflow-auto px-5 py-3">
		<div class="flex gap-2 overflow-visible py-1">
			<FormControl placeholder="Search by Title" v-model="searchQuery" :debounce="300">
				<template #prefix>
					<SearchIcon class="h-4 w-4 text-gray-500" />
				</template>
			</FormControl>
		</div>
		<ListView class="h-full" v-bind="listOptions"> </ListView>
	</div>

	<SelectTypeDialog
		v-model="showNewSourceDialog"
		:types="sourceTypes"
		title="Select a data source"
	/>

	<ConnectMariaDBDialog v-model="showNewMariaDBDialog" />
	<ConnectPostgreSQLDialog v-model="showNewPostgreSQLDialog" />
	<ConnectDuckDBDialog v-model="showNewDuckDBDialog" />
	<UploadCSVFileDialog v-model="showCSVFileUploadDialog" />
	
	<!-- Render dialogs -->
	<template v-for="dialog in dialogs" :key="dialog">
		<component :is="dialog" />
	</template>
</template>
