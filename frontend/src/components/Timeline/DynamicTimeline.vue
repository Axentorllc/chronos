<template>
	<div class="dynamic-timeline min-h-screen bg-gray-50">
		<!-- Modern Enhanced Header -->
		<div class="timeline-header bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
			<div class="max-w-full mx-auto px-6 py-4">
				<div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
					<!-- Left Section -->
					<div class="flex items-center gap-6">
						<Button
							variant="ghost"
							@click="$emit('backToSelector')"
							class="flex items-center gap-2 text-gray-600 hover:text-gray-900"
						>
							<FeatherIcon name="arrow-left" class="w-4 h-4" />
							<span class="hidden sm:inline">Back</span>
						</Button>

						<div class="flex items-center gap-4">
							<div class="flex items-center gap-3">
								<div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
									<FeatherIcon name="calendar" class="w-4 h-4 text-white" />
								</div>
								<div>
									<h1 class="text-xl font-bold text-gray-900">
										{{ config?.configuration_name || "Dynamic Planner" }}
									</h1>
									<div class="flex items-center gap-2 text-sm text-gray-500">
										<span class="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
											{{ config?.row_doctype }}
										</span>
										<FeatherIcon name="arrow-right" class="w-3 h-3" />
										<span class="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium">
											{{ config?.block_doctype }}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Right Section -->
					<div class="flex items-center gap-3">
						<!-- Date Navigation -->
						<div class="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
							<Button variant="ghost" size="sm" @click="navigateDate(-1)" class="h-8 w-8 p-0">
								<FeatherIcon name="chevron-left" class="w-4 h-4" />
							</Button>

							<div class="px-4 py-1.5 text-center font-semibold text-gray-900 min-w-[200px]">
								{{ formatDateRange() }}
							</div>

							<Button variant="ghost" size="sm" @click="navigateDate(1)" class="h-8 w-8 p-0">
								<FeatherIcon name="chevron-right" class="w-4 h-4" />
							</Button>
						</div>

						<Button 
							variant="outline" 
							size="sm" 
							@click="goToToday"
							class="text-blue-600 border-blue-200 hover:bg-blue-50"
						>
							<FeatherIcon name="calendar" class="w-4 h-4 mr-1" />
							<span class="hidden sm:inline">Today</span>
						</Button>

						<!-- View Mode Toggle -->
						<div class="flex bg-gray-100 rounded-lg p-1">
							<button
								v-for="mode in viewModes"
								:key="mode.value"
								@click="currentViewMode = mode.value"
								:class="[
									'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2',
									currentViewMode === mode.value
										? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
										: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
								]"
							>
								<FeatherIcon :name="mode.icon" class="w-4 h-4" />
								<span class="hidden sm:inline">{{ mode.label }}</span>
							</button>
						</div>

						<!-- Action Buttons -->
						<div class="flex items-center gap-2">
							<Button
								variant="ghost"
								size="sm"
								@click="toggleUnassignedPanel"
								:class="[
									'relative',
									showUnassignedPanel ? 'bg-amber-50 text-amber-700' : 'text-gray-600'
								]"
							>
								<FeatherIcon name="inbox" class="w-4 h-4" />
								<span v-if="unassignedBlocks.length > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
									{{ unassignedBlocks.length }}
								</span>
							</Button>

							<Button
								variant="ghost"
								size="sm"
								@click="refreshData"
								:disabled="loading"
								class="text-gray-600 hover:text-gray-900"
							>
								<FeatherIcon
									name="refresh-cw"
									:class="['w-4 h-4', loading ? 'animate-spin' : '']"
								/>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>

			<!-- Enhanced Stats Bar -->
			<div class="mx-6 mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
				<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div class="flex flex-wrap items-center gap-6">
						<div class="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
							<div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
								<FeatherIcon name="users" class="w-5 h-5 text-white" />
							</div>
							<div>
								<div class="text-2xl font-bold text-blue-600">
									{{ rows.length }}
								</div>
								<div class="text-sm text-blue-700 font-medium">
									{{ config?.row_doctype || "Resources" }}
								</div>
							</div>
						</div>

						<div class="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
							<div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
								<FeatherIcon name="calendar" class="w-5 h-5 text-white" />
							</div>
							<div>
								<div class="text-2xl font-bold text-green-600">
									{{ blocks.length }}
								</div>
								<div class="text-sm text-green-700 font-medium">
									{{ config?.block_doctype || "Events" }}
								</div>
							</div>
						</div>

						<div v-if="unassignedBlocks.length > 0" class="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
							<div class="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
								<FeatherIcon name="inbox" class="w-5 h-5 text-white" />
							</div>
							<div>
								<div class="text-2xl font-bold text-amber-600">
									{{ unassignedBlocks.length }}
								</div>
								<div class="text-sm text-amber-700 font-medium">
									Unassigned
								</div>
							</div>
						</div>
					</div>

					<div class="flex items-center gap-3 text-sm text-gray-500">
						<div class="flex items-center gap-1">
							<FeatherIcon name="eye" class="w-4 h-4" />
							<span>{{ currentViewMode }} view</span>
						</div>
						<div class="w-1 h-1 bg-gray-400 rounded-full"></div>
						<div class="flex items-center gap-1">
							<FeatherIcon name="clock" class="w-4 h-4" />
							<span>Last updated just now</span>
						</div>
					</div>
				</div>
			</div>

		<!-- Enhanced Loading State -->
		<div v-if="loading" class="flex items-center justify-center py-20">
			<div class="bg-white rounded-xl p-8 shadow-lg border max-w-md w-full mx-6">
				<div class="text-center">
					<div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
						<div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">
						Loading Timeline Data
					</h3>
					<p class="text-gray-600 mb-4">
						Please wait while we fetch your {{ config?.configuration_name || 'timeline' }} data...
					</p>
					<div class="flex items-center justify-center gap-2">
						<div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
						<div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
						<div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
					</div>
				</div>
			</div>
		</div>

		<!-- Error State -->
		<div v-else-if="error" class="mx-6">
			<div class="bg-red-50 border border-red-200 rounded-lg p-6">
				<div class="flex items-start gap-4">
					<div class="flex-shrink-0">
						<div
							class="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center"
						>
							<FeatherIcon name="alert-triangle" class="w-5 h-5 text-white" />
						</div>
					</div>
					<div class="flex-1">
						<h3 class="text-lg font-semibold text-red-900 mb-2">
							Unable to Load Timeline Data
						</h3>
						<p class="text-red-700 mb-4">{{ error }}</p>
						<Button variant="outline" size="sm" @click="refreshData">
							<FeatherIcon name="refresh-cw" class="w-4 h-4 mr-2" />
							Try Again
						</Button>
					</div>
				</div>
			</div>
		</div>

		<!-- Timeline Views -->
		<div v-else class="timeline-view mx-6 mb-6">
			<div class="bg-white rounded-lg border overflow-hidden shadow">
				<!-- Day View -->
				<DynamicTimelineDayView
					v-if="currentViewMode === 'day'"
					:config="config"
					:rows="rows"
					:blocks="blocks"
					:currentDate="currentDate"
					:loading="loading"
					@blockMove="handleBlockMove"
					@blockClick="handleBlockClick"
					@addBlock="handleAddBlock"
					@blockResize="handleBlockResize"
					@goToToday="goToToday"
					class="enhanced-day-view"
				/>
				
				<!-- Standard Grid View (Week/Month/etc.) -->
				<DynamicTimelineGrid
					v-else
					:config="config"
					:rows="rows"
					:blocks="blocks"
					:dateColumns="dateColumns"
					:loading="loading"
					:showUnassignedPanel="showUnassignedPanel"
					@blockMove="handleBlockMove"
					@blockClick="handleBlockClick"
					@addBlock="handleAddBlock"
					@blockResize="handleBlockResize"
					@assignTask="handleAssignTask"
					@toggleUnassignedPanel="toggleUnassignedPanel"
					class="enhanced-grid"
				/>
			</div>
		</div>


		<!-- Add Block Button -->
		<div class="fixed bottom-6 right-6 z-40">
			<Button
				variant="solid"
				size="lg"
				@click="showAddBlockDialog = true"
				class="rounded-full shadow-lg"
			>
				<FeatherIcon name="plus" class="w-5 h-5" />
			</Button>
		</div>

		<!-- Dynamic Add Block Dialog -->
		<Dialog
			v-model="showAddBlockDialog"
			:options="{
				title: `Add New ${config?.block_doctype || 'Block'}`,
				size: 'large',
			}"
		>
			<template #body-content>
				<div v-if="config" class="space-y-4">
					<!-- Loading state for metadata -->
					<div v-if="loading" class="text-center py-4">
						<div class="text-sm text-gray-600">Loading form configuration...</div>
					</div>
					
					<!-- Dynamic form based on block doctype -->
					<div v-else class="space-y-4">
						<div class="grid grid-cols-2 gap-4">
							<FormControl
								:label="getFieldLabel(config.block_label_field)"
								v-model="newBlockForm.title"
								:placeholder="`Enter ${config.block_label_field || 'title'}`"
							/>
							<FormControl
								type="autocomplete"
								:label="getFieldLabel(config.field_mappings?.row_to_block_field || config.row_to_block_field)"
								v-model="newBlockForm.row_assignment"
								:options="rowOptions"
								:placeholder="`Select ${config.row_doctype || 'row'}`"
								required
							/>
						</div>
						<div class="grid grid-cols-2 gap-4" v-if="config.block_priority_field">
							<FormControl
								type="select"
								:label="getFieldLabel(config.block_priority_field)"
								v-model="newBlockForm.priority"
								:options="['Low', 'Medium', 'High']"
							/>
						</div>
						<FormControl
							v-if="config.block_description_field"
							type="textarea"
							:label="getFieldLabel(config.block_description_field)"
							v-model="newBlockForm.description"
							placeholder="Enter description"
						/>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-1">
									{{ getFieldLabel(config.block_to_date_field) }}
									<span class="text-red-500">*</span>
								</label>
								<Input
									v-if="getFieldType(config.block_to_date_field) === 'date'"
									type="date"
									:value="newBlockForm.start_date"
									:placeholder="`Select ${getFieldLabel(config.block_to_date_field)}`"
									@input="(v) => newBlockForm.start_date = v"
								/>
								<DateTimePicker
									v-else
									:value="newBlockForm.start_date"
									:placeholder="`Select ${getFieldLabel(config.block_to_date_field)}`"
									@update:modelValue="(v) => newBlockForm.start_date = v"
								/>
							</div>
							<div v-if="config.date_range_end_field">
								<label class="block text-sm font-medium text-gray-700 mb-1">
									{{ getFieldLabel(config.date_range_end_field) }}
								</label>
								<Input
									v-if="getFieldType(config.date_range_end_field) === 'date'"
									type="date"
									:value="newBlockForm.end_date"
									:placeholder="`Select ${getFieldLabel(config.date_range_end_field)}`"
									@input="(v) => newBlockForm.end_date = v"
								/>
								<DateTimePicker
									v-else
									:value="newBlockForm.end_date"
									:placeholder="`Select ${getFieldLabel(config.date_range_end_field)}`"
									@update:modelValue="(v) => newBlockForm.end_date = v"
								/>
							</div>
						</div>
						<FormControl
							v-if="config.block_duration_field"
							type="number"
							:label="getFieldLabel(config.block_duration_field)"
							v-model="newBlockForm.duration"
							placeholder="Enter duration"
						/>
						<FormControl
							v-if="config.block_status_field"
							type="select"
							:label="getFieldLabel(config.block_status_field)"
							v-model="newBlockForm.status"
							:options="['Open', 'In Progress', 'Completed', 'Cancelled']"
						/>
					</div>
				</div>
			</template>
			<template #actions>
				<Button variant="outline" @click="showAddBlockDialog = false">
					Cancel
				</Button>
				<Button variant="solid" @click="handleCreateBlock">
					Create {{ config?.block_doctype || 'Block' }}
				</Button>
			</template>
		</Dialog>

		<!-- Unassigned Blocks Dialog -->
		<Dialog
			v-model="showUnassignedDialog"
			:options="{
				title: `Unassigned ${config?.block_doctype || 'Blocks'}`,
				size: 'large',
			}"
		>
			<template #body-content>
				<div v-if="unassignedBlocks.length === 0" class="text-center py-8">
					<FeatherIcon name="check-circle" class="w-12 h-12 text-green-500 mx-auto mb-4" />
					<h3 class="text-lg font-medium text-gray-900 mb-2">All blocks are assigned!</h3>
					<p class="text-gray-600">There are no unassigned {{ config?.block_doctype?.toLowerCase() || 'blocks' }} at the moment.</p>
				</div>
				
				<div v-else class="space-y-3">
					<p class="text-sm text-gray-600 mb-4">
						{{ unassignedBlocks.length }} unassigned {{ config?.block_doctype?.toLowerCase() || 'blocks' }}. 
						Click on a block to assign it to a {{ config?.row_doctype?.toLowerCase() || 'row' }}.
					</p>
					
					<div 
						v-for="block in unassignedBlocks" 
						:key="block.id"
						class="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
						@click="handleBlockClick(block.id)"
					>
						<div class="flex items-center justify-between">
							<div>
								<h4 class="font-medium text-gray-900">{{ block.label || block.name }}</h4>
								<div class="flex items-center gap-4 mt-1 text-sm text-gray-500">
									<div v-if="block.date" class="flex items-center gap-1">
										<FeatherIcon name="calendar" class="w-3 h-3" />
										<span>{{ new Date(block.date).toLocaleDateString() }}</span>
									</div>
									<div v-if="block.status" class="flex items-center gap-1">
										<FeatherIcon name="info" class="w-3 h-3" />
										<span>{{ block.status }}</span>
									</div>
								</div>
							</div>
							<FeatherIcon name="external-link" class="w-4 h-4 text-gray-400" />
						</div>
					</div>
				</div>
			</template>
			<template #actions>
				<Button variant="outline" @click="showUnassignedDialog = false">
					Close
				</Button>
			</template>
		</Dialog>
	</div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { Button, FeatherIcon, Dialog, FormControl, DateTimePicker, Input } from "frappe-ui";
import { call } from "frappe-ui";
import DynamicTimelineGrid from "./DynamicTimelineGrid.vue";
import DynamicTimelineDayView from "./DynamicTimelineDayView.vue";
import { toast } from "../../composables/useToast";

const props = defineProps({
	configuration: {
		type: Object,
		required: true,
	},
});

const emit = defineEmits(["backToSelector"]);

// Reactive state
const config = ref(null);
const fieldMetadata = ref({});
const rows = ref([]);
const blocks = ref([]);
const loading = ref(false);
const error = ref(null);
const showAddBlockDialog = ref(false);
const addBlockData = ref(null);
const showUnassignedPanel = ref(true);
const showUnassignedDialog = ref(false);

// View state
const currentViewMode = ref("day");
const currentDate = ref(new Date());
const newBlockForm = ref({
	title: "",
	description: "",
	priority: "Medium",
	start_date: "",
	end_date: "",
	duration: 1,
	status: "Open",
	row_assignment: "",
});

// Constants
const viewModes = [
	{ label: "Day", value: "day", icon: "clock" },
	{ label: "Week", value: "week", icon: "calendar" },
	{ label: "Month", value: "month", icon: "calendar" },
	{ label: "2 Weeks", value: "biweek", icon: "calendar" },
];

// Computed properties

const dateColumns = computed(() => {
	const columns = [];
	const today = new Date();
	let startDate, daysToShow;

	switch (currentViewMode.value) {
		case "week":
			startDate = getWeekStart(currentDate.value);
			daysToShow = 7;
			break;
		case "biweek":
			startDate = getWeekStart(currentDate.value);
			daysToShow = 14;
			break;
		case "month":
			startDate = new Date(
				currentDate.value.getFullYear(),
				currentDate.value.getMonth(),
				1,
			);
			daysToShow = getDaysInMonth(currentDate.value);
			break;
		default:
			startDate = getWeekStart(currentDate.value);
			daysToShow = 7;
	}

	for (let i = 0; i < daysToShow; i++) {
		const date = new Date(startDate);
		date.setDate(startDate.getDate() + i);

		const isToday = date.toDateString() === today.toDateString();
		const isWeekend = date.getDay() === 0 || date.getDay() === 6;

		columns.push({
			key: date.toISOString().split("T")[0],
			date: date,
			label: date.getDate().toString(),
			sublabel: date.toLocaleDateString("en-US", { weekday: "short" }),
			isToday,
			isWeekend,
		});
	}

	return columns;
});

const unassignedBlocks = computed(() => {
	return blocks.value.filter((block) => !block.row_id);
});

const rowOptions = computed(() => {
	return rows.value.map(row => ({
		label: row.label || row.name,
		value: row.id
	}));
});

// Methods
const loadTimelineData = async () => {
	if (!props.configuration) return;

	loading.value = true;
	error.value = null;

	try {
		const startDate = dateColumns.value[0]?.date.toISOString().split("T")[0];
		const endDate = dateColumns.value[dateColumns.value.length - 1]?.date
			.toISOString()
			.split("T")[0];

		const [timelineResponse, metadataResponse] = await Promise.all([
			call("chronos.api.timeline_data.get_timeline_data", {
				configuration_name: props.configuration.name,
				start_date: startDate,
				end_date: endDate,
				filters: {},
			}),
			call("chronos.api.timeline_data.get_configuration_field_metadata", {
				configuration_name: props.configuration.name
			})
		]);

		if (timelineResponse.success) {
			config.value = timelineResponse.config;
			rows.value = timelineResponse.rows || [];
			blocks.value = timelineResponse.blocks || [];
		} else {
			error.value = timelineResponse.error || "Failed to load timeline data";
		}

		if (metadataResponse.success) {
			fieldMetadata.value = metadataResponse.field_metadata || {};
		}
	} catch (err) {
		error.value = err.message || "Failed to load timeline data";
		config.value = null;
		rows.value = [];
		blocks.value = [];
	} finally {
		loading.value = false;
	}
};

const refreshData = () => {
	loadTimelineData();
};

const navigateDate = (direction) => {
	const newDate = new Date(currentDate.value);
	let daysToMove;

	switch (currentViewMode.value) {
		case "day":
			daysToMove = 1;
			break;
		case "week":
			daysToMove = 7;
			break;
		case "biweek":
			daysToMove = 14;
			break;
		case "month":
			newDate.setMonth(newDate.getMonth() + direction);
			currentDate.value = newDate;
			return;
		default:
			daysToMove = 7;
	}

	newDate.setDate(newDate.getDate() + direction * daysToMove);
	currentDate.value = newDate;
};

const goToToday = () => {
	currentDate.value = new Date();
};

const formatDateRange = () => {
	if (!dateColumns.value.length) return "";

	switch (currentViewMode.value) {
		case "week":
		case "biweek":
			const start = dateColumns.value[0].date;
			const end = dateColumns.value[dateColumns.value.length - 1].date;
			return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
		case "month":
			return currentDate.value.toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
			});
		default:
			return "";
	}
};

const getWeekStart = (date) => {
	const d = new Date(date);
	const day = d.getDay();
	const diff = d.getDate() - day + (day === 0 ? -6 : 1);
	return new Date(d.setDate(diff));
};

const getDaysInMonth = (date) => {
	return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const handleBlockMove = async (data) => {
	try {
		let moveDate = data.newDate;
		if (data.newDateTime) {
			moveDate = new Date(data.newDateTime).toISOString().split('T')[0];
		}
		
		const response = await call("chronos.api.timeline_data.update_block_assignment", {
			block_doctype: config.value.block_doctype,
			block_name: data.blockId,
			new_row_assignment: data.newRowId,
			new_date: moveDate,
			new_datetime: data.newDateTime,
			config_name: config.value.name,
		});

		if (response.success) {
			await loadTimelineData();
			toast.success("Block moved successfully");
		} else {
			throw new Error(response.error || "Failed to move block");
		}
	} catch (err) {
		toast.error("Failed to move block: " + err.message);
	}
};

const handleBlockClick = (blockId) => {
	const block = blocks.value.find((b) => b.id === blockId);
	if (block) {
		const doctype = config.value.block_doctype.toLowerCase().replace(/ /g, '-');
		const url = `/app/${doctype}/${block.name}`;
		window.open(url, '_blank');
	}
};

const handleAddBlock = async (data) => {
	addBlockData.value = data;
	
	// Ensure metadata is loaded before showing the dialog
	if (!fieldMetadata.value || Object.keys(fieldMetadata.value).length === 0) {
		try {
			const metadataResponse = await call("chronos.api.timeline_data.get_configuration_field_metadata", {
				configuration_name: props.configuration.name
			});
			if (metadataResponse.success) {
				fieldMetadata.value = metadataResponse.field_metadata || {};
			}
		} catch (err) {
			console.error('Error loading field metadata:', err);
		}
	}
	
	showAddBlockDialog.value = true;
	
	// Pre-populate form with the selected date and row
	if (data && data.date) {
		// For date fields, use the string format directly
		// For datetime fields, the DateTimePicker will handle the conversion
		newBlockForm.value.start_date = data.date;
		if (!config.value?.date_range_end_field) {
			newBlockForm.value.end_date = data.date;
		}
	}
	
	// Pre-populate row assignment if provided
	if (data && data.rowId) {
		newBlockForm.value.row_assignment = data.rowId;
	}
};


const handleBlockResize = async (data) => {
	try {
		const response = await call("chronos.api.timeline_data.update_block_date_range", {
			block_doctype: config.value.block_doctype,
			block_name: data.blockId,
			new_duration: data.newDuration,
			new_start_date: data.newStartDate,
			new_end_date: data.newEndDate,
			config_name: config.value.name,
			direction: data.direction
		});

		if (response.success) {
			await loadTimelineData();
			toast.success("Block duration updated successfully");
		} else {
			throw new Error(response.error || "Failed to update block duration");
		}
	} catch (err) {
		toast.error("Failed to update block duration: " + err.message);
	}
};


const handleCreateBlock = async () => {
	try {

		if (!newBlockForm.value.start_date) {
			toast.error("Please select a start date");
			return;
		}

		if (!newBlockForm.value.row_assignment && !addBlockData.value?.rowId) {
			toast.error(`Please select a ${config.value.row_doctype || 'row'}`);
			return;
		}

		// Format dates properly for the API
		const formatDateForAPI = (dateValue, fieldType) => {
			if (!dateValue) return null;
			
			// If it's already a string, use it as is
			if (typeof dateValue === 'string') {
				return dateValue;
			}
			
			// If it's a Date object, format appropriately
			if (dateValue instanceof Date) {
				if (fieldType === 'datetime') {
					return dateValue.toISOString().slice(0, 19).replace('T', ' ');
				} else {
					return dateValue.toISOString().slice(0, 10);
				}
			}
			
			return dateValue;
		};

		// Build dynamic block data based on configuration
		const rowAssignmentValue = newBlockForm.value.row_assignment || addBlockData.value?.rowId;
		const rowToBlockField = config.value.field_mappings?.row_to_block_field || config.value.row_to_block_field || 'workstation';
		const blockToDateField = config.value.block_to_date_field || 'operation_start';
		
		const blockData = {
			doctype: config.value.block_doctype,
			[rowToBlockField]: rowAssignmentValue,
			[blockToDateField]: formatDateForAPI(
				newBlockForm.value.start_date, 
				getFieldType(blockToDateField)
			),
		};
		
		// Add title only if provided
		if (newBlockForm.value.title && newBlockForm.value.title.trim()) {
			blockData[config.value.block_label_field] = newBlockForm.value.title.trim();
		}

		// Add optional fields if they exist in config
		if (config.value.block_description_field && newBlockForm.value.description) {
			blockData[config.value.block_description_field] = newBlockForm.value.description;
		}

		if (config.value.block_priority_field && newBlockForm.value.priority) {
			blockData[config.value.block_priority_field] = newBlockForm.value.priority;
		}

		if (config.value.block_status_field && newBlockForm.value.status) {
			blockData[config.value.block_status_field] = newBlockForm.value.status;
		}

		if (config.value.block_duration_field && newBlockForm.value.duration) {
			blockData[config.value.block_duration_field] = newBlockForm.value.duration;
		}

		if (config.value.date_range_end_field && newBlockForm.value.end_date) {
			blockData[config.value.date_range_end_field] = formatDateForAPI(
				newBlockForm.value.end_date, 
				getFieldType(config.value.date_range_end_field)
			);
		}

		if (config.value.date_range_start_field && newBlockForm.value.start_date) {
			blockData[config.value.date_range_start_field] = formatDateForAPI(
				newBlockForm.value.start_date, 
				getFieldType(config.value.date_range_start_field)
			);
		}

		const response = await call("chronos.api.timeline_data.create_dynamic_block", {
			block_data: blockData,
			configuration_name: config.value.name
		});

		if (!response.success) {
			throw new Error(response.error || 'Failed to create block');
		}

		// Reset form
		newBlockForm.value = {
			title: "",
			description: "",
			priority: "Medium",
			start_date: "",
			end_date: "",
			duration: 1,
			status: "Open",
			row_assignment: "",
		};

		showAddBlockDialog.value = false;
		addBlockData.value = null;

		// Refresh data
		await refreshData();

		toast.success(`${config.value.block_doctype} created successfully`);
	} catch (error) {
		console.error('Error creating block:', error);
		toast.error(`Failed to create ${config.value.block_doctype}: ${error.message}`);
	}
};


const toggleUnassignedPanel = () => {
	showUnassignedDialog.value = true;
};

const getFieldLabel = (fieldName) => {
	if (!fieldName) return "";
	// Use metadata label if available, otherwise format field name
	if (fieldMetadata.value[fieldName] && fieldMetadata.value[fieldName].label) {
		return fieldMetadata.value[fieldName].label;
	}
	return fieldName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const getFieldType = (fieldName) => {
	if (!fieldName) return "text";
	
	// Use metadata to determine field type
	if (fieldMetadata.value[fieldName]) {
		const fieldType = fieldMetadata.value[fieldName].fieldtype;
		if (fieldType === "Date") return "date";
		if (fieldType === "Datetime") return "datetime";
		if (fieldType === "Time") return "time";
		return "text";
	}
	
	// Default fallback for date fields
	if (fieldName && (fieldName.includes('date') || fieldName.includes('Date'))) {
		return "date";
	}
	
	return "text";
};

// Watch for configuration changes
watch(
	() => props.configuration,
	() => {
		if (props.configuration) {
			loadTimelineData();
		}
	},
	{ immediate: true },
);

// Watch for date/view changes
watch([currentDate, currentViewMode], () => {
	loadTimelineData();
});

// Initialize
onMounted(() => {
	if (props.configuration) {
		loadTimelineData();
	}
});
</script>

<style scoped>
.dynamic-timeline {
	width: 100%;
	min-height: 100vh;
}

.timeline-grid {
	min-height: 600px;
}

.enhanced-grid {
	animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}
</style>