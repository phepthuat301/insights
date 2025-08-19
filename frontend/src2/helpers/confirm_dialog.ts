import ConfirmDialog from '../components/ConfirmDialog.vue'
import { VNode, h, ref } from 'vue'

export const dialogs = ref<VNode[]>([])

let dialogIdCounter = 0

export function confirmDialog({
	title = 'Untitled',
	message = '',
	primaryActionLabel = 'Confirm',
	theme = 'gray',
	fields = [],
	onSuccess = () => {},
}) {
	const dialogId = ++dialogIdCounter
	
	const removeDialog = () => {
		const index = dialogs.value.findIndex((d: any) => d.props?.dialogId === dialogId)
		if (index !== -1) {
			dialogs.value.splice(index, 1)
		}
	}

	const component = h(ConfirmDialog, {
		title,
		message,
		theme,
		fields,
		onSuccess: (args: any) => {
			try {
				const result = onSuccess(args)
				if (result?.then) {
					return result.finally(removeDialog)
				}
				removeDialog()
				return result
			} catch (error) {
				removeDialog()
				throw error
			}
		},
		primaryActionLabel,
		dialogId,
		onClose: removeDialog,
	})
	
	dialogs.value.push(component)
}
