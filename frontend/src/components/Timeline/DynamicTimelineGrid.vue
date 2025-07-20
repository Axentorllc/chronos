<template>
	<div
		class="rounded-lg border overflow-auto max-h-[45rem]"
		:class="loading && 'animate-pulse pointer-events-none'"
	>
		<table class="border-separate border-spacing-0">
			<thead>
				<tr class="sticky top-0 bg-white z-10">
					<!-- Resource Search -->
					<th class="p-2 border-b">
						<Autocomplete
							:options="resourceSearchOptions"
							v-model="resourceSearch"
							:placeholder="`Search ${config?.row_doctype || 'Resources'}`"
							:multiple="true"
						/>
					</th>

					<!-- Date Columns -->
					<th
						v-for="(column, idx) in dateColumns"
						:key="column.key"
						class="font-medium border-b"
						:class="{ 'border-l': idx }"
					>
						{{ column.sublabel }} {{ column.label }}
					</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(row, rowIdx) in filteredRows" :key="row.id">
					<!-- Resource Column -->
					<td
						v-if="
							!resourceSearch?.length ||
							resourceSearch?.some((item) => item.value === row.id)
						"
						class="px-2 py-7 z-[5]"
						:class="{ 'border-t': rowIdx }"
					>
						<div class="flex" :class="!getRowSubtitle(row) && 'items-center'">
							<Avatar
								:label="getRowTitle(row)"
								:image="row.image"
								size="2xl"
							/>
							<div class="flex flex-col ml-2 my-0.5 truncate">
								<div class="truncate text-base font-medium">
									{{ getRowTitle(row) }}
								</div>
								<div class="mt-auto text-xs text-gray-500 truncate">
									{{ getRowSubtitle(row) }}
								</div>
							</div>
						</div>
					</td>

					<!-- Timeline Cells -->
					<template
						v-if="
							!resourceSearch?.length ||
							resourceSearch?.some((item) => item.value === row.id)
						"
					>
						<td
							v-for="(column, colIdx) in dateColumns"
							:key="colIdx"
						class="p-1.5"
						:class="{
							'border-l': colIdx,
							'border-t': rowIdx,
							'align-top': getBlocksForCell(row.id, column.key).length > 0,
							'bg-gray-50':
								dragOverCell.row === row.id && dragOverCell.date === column.key,
						}"
						@mouseenter="handleCellHover(row.id, column.key, true)"
						@mouseleave="handleCellHover(row.id, column.key, false)"
						@dragover.prevent="handleDragOver($event, row.id, column.key)"
						@dragenter="handleDragEnter($event, row.id, column.key)"
						@drop="handleDrop($event, row.id, column.key)"
					>
						<!-- Blocks -->
						<div class="flex flex-col space-y-1.5">
							<div
								v-for="block in getBlocksForCell(row.id, column.key)"
								:key="block.id"
								@mouseenter="hoveredBlock = block.id"
								@mouseleave="hoveredBlock = null"
								:draggable="true"
								@dragstart="handleBlockDragStart(block, $event)"
								@dragend="handleBlockDragEnd"
								class="rounded border-2 p-2 cursor-pointer"
								:class="[
									getBlockClasses(block),
									{
										'scale-105': hoveredBlock === block.id && dragOverCell.row,
										'opacity-0': hoveredBlock === block.id && dragOverCell.row,
									},
								]"
								:style="getBlockStyle(block)"
								@click="handleBlockClick(block)"
							>
								<div class="truncate mb-1.5 pointer-events-none text-base font-medium">
									{{ getBlockTitle(block) }}
								</div>
								<div class="text-xs text-gray-500 pointer-events-none space-y-1.5">
									<div v-if="getBlockDuration(block)" class="flex items-center space-x-1">
										<FeatherIcon
											name="clock"
											class="stroke-gray-400"
											style="height: 0.82rem; width: 0.82rem"
										/>
										<span>{{ getBlockDuration(block) }}</span>
									</div>
									<div v-if="getBlockLocation(block)" class="flex items-center space-x-1">
										<FeatherIcon
											name="map-pin"
											class="stroke-gray-400"
											style="height: 0.82rem; width: 0.82rem"
										/>
										<span>{{ getBlockLocation(block) }}</span>
									</div>
								</div>
							</div>

							<!-- Add Block Button -->
							<Button
								variant="outline"
								icon="plus"
								class="border-2 active:bg-white w-full hidden"
								:class="
									hoveredCell.row === row.id &&
									hoveredCell.date === column.key &&
									!dragOverCell.row
										? 'visible'
										: 'invisible'
								"
								@click="handleAddBlock(row.id, column.key)"
							/>
						</div>
					</td>
				</template>
			</tr>
			</tbody>
		</table>
	</div>
</template>

<script setup>
import { ref, computed } from "vue";
import { Avatar, Autocomplete, FeatherIcon, Button } from "frappe-ui";
import colors from "tailwindcss/colors";

const props = defineProps({
	config: {
		type: Object,
		required: true,
	},
	rows: {
		type: Array,
		default: () => [],
	},
	blocks: {
		type: Array,
		default: () => [],
	},
	dateColumns: {
		type: Array,
		default: () => [],
	},
	loading: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits([
	"blockMove",
	"blockClick",
	"addBlock",
	"blockResize",
]);

// Reactive state
const resourceSearch = ref([]);
const hoveredCell = ref({ row: "", date: "" });
const dragOverCell = ref({ row: "", date: "" });
const hoveredBlock = ref(null);
const draggedBlock = ref(null);

// Computed properties
const filteredRows = computed(() => {
	if (!Array.isArray(props.rows)) return [];
	return props.rows;
});

const resourceSearchOptions = computed(() => {
	return props.rows.map((row) => ({
		value: row.id,
		label: `${row.id}: ${getRowTitle(row)}`,
	}));
});

// Methods
const getRowTitle = (row) => {
	return row.label || row.name || row.id;
};

const getRowSubtitle = (row) => {
	return row.department || row.description || "";
};

const getBlocksForCell = (rowId, date) => {
	if (!Array.isArray(props.blocks)) return [];
	return props.blocks.filter((block) => {
		if (block.row_id !== rowId) return false;
		
		const blockDate = block.date || block[props.config?.block_to_date_field];
		if (!blockDate) return false;
		
		// Handle date ranges
		if (props.config?.date_range_end_field) {
			const startDate = block.start_date || blockDate;
			const endDate = block.end_date || block[props.config.date_range_end_field];
			
			if (startDate && endDate) {
				const blockStartStr = formatDateForComparison(startDate);
				const blockEndStr = formatDateForComparison(endDate);
				return date >= blockStartStr && date <= blockEndStr;
			}
		}
		
		// Handle single dates
		const blockDateStr = formatDateForComparison(blockDate);
		return blockDateStr === date;
	});
};

const formatDateForComparison = (dateInput) => {
	if (!dateInput) return null;
	
	let dateObj;
	if (typeof dateInput === 'string') {
		if (dateInput.includes(' ')) {
			const datePart = dateInput.split(' ')[0];
			dateObj = new Date(datePart + 'T00:00:00');
		} else if (dateInput.includes('T')) {
			dateObj = new Date(dateInput.split('T')[0] + 'T00:00:00');
		} else {
			dateObj = new Date(dateInput + 'T00:00:00');
		}
	} else if (dateInput instanceof Date) {
		dateObj = dateInput;
	} else {
		return null;
	}
	
	const year = dateObj.getFullYear();
	const month = String(dateObj.getMonth() + 1).padStart(2, '0');
	const day = String(dateObj.getDate()).padStart(2, '0');
	
	return `${year}-${month}-${day}`;
};

const getBlockTitle = (block) => {
	return block.title || block.subject || block.name || block.id;
};

const getBlockDuration = (block) => {
	if (block.duration) {
		return `${block.duration}h`;
	}
	if (block.start_time && block.end_time) {
		return `${block.start_time} - ${block.end_time}`;
	}
	return null;
};

const getBlockLocation = (block) => {
	return block.location || block.shift_location || null;
};

const getBlockClasses = (block) => {
	const classes = [];
	
	if (block.status === 'Inactive') {
		classes.push('border-dashed');
	}
	
	return classes;
};

const getBlockStyle = (block) => {
	const priority = block.priority || 'Medium';
	const status = block.status || 'Active';
	
	let colorName = 'blue';
	switch (priority) {
		case 'High':
			colorName = 'red';
			break;
		case 'Medium':
			colorName = 'blue';
			break;
		case 'Low':
			colorName = 'green';
			break;
	}
	
	return {
		borderColor: colors[colorName][200],
		backgroundColor: status === 'Active' ? colors[colorName][50] : 'white',
	};
};

const handleCellHover = (rowId, date, isEntering) => {
	if (isEntering) {
		hoveredCell.value = { row: rowId, date };
	} else {
		hoveredCell.value = { row: "", date: "" };
	}
};

const handleDragOver = (event, rowId, date) => {
	event.preventDefault();
	event.dataTransfer.dropEffect = "move";
	dragOverCell.value = { row: rowId, date };
};

const handleDragEnter = (event, rowId, date) => {
	event.preventDefault();
	dragOverCell.value = { row: rowId, date };
};

const handleDrop = (event, rowId, date) => {
	event.preventDefault();
	dragOverCell.value = { row: "", date: "" };
	
	if (draggedBlock.value) {
		const blockId = draggedBlock.value.id;
		const currentRowId = draggedBlock.value.row_id;
		let currentDate = draggedBlock.value.date || draggedBlock.value[props.config?.block_to_date_field];
		
		if (currentDate) {
			if (typeof currentDate === 'string') {
				if (currentDate.includes(' ')) {
					currentDate = currentDate.split(' ')[0];
				} else if (currentDate.includes('T')) {
					currentDate = currentDate.split('T')[0];
				}
			} else if (currentDate instanceof Date) {
				currentDate = currentDate.toISOString().split('T')[0];
			}
		}
		
		if (currentRowId === rowId && currentDate === date) {
			draggedBlock.value = null;
			return;
		}
		
		emit("blockMove", {
			blockId,
			newRowId: rowId,
			newDate: date,
			oldRowId: currentRowId,
			oldDate: currentDate,
		});
		
		draggedBlock.value = null;
	}
};

const handleBlockDragStart = (block, event) => {
	draggedBlock.value = block;
	if (event.dataTransfer) {
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('application/json', JSON.stringify(block));
	}
};

const handleBlockDragEnd = () => {
	draggedBlock.value = null;
	dragOverCell.value = { row: "", date: "" };
};

const handleAddBlock = (rowId, date) => {
	emit('addBlock', { rowId, date, config: props.config });
};

const handleBlockClick = (block) => {
	const doctype = props.config.block_doctype.toLowerCase().replace(/ /g, '-');
	const url = `/app/${doctype}/${block.name}`;
	window.open(url, '_blank');
};
</script>

<style scoped>
th,
td {
	max-width: 9rem;
	min-width: 9rem;
	font-size: 0.875rem;
}

th:first-child,
td:first-child {
	position: sticky;
	left: 0;
	max-width: 16rem;
	min-width: 16rem;
	background: white;
	border-right: 1px solid rgb(229 231 235);
}

.blocked-cell {
	text-align: center;
	padding: 0.5rem;
	font-size: 0.875rem;
	color: rgb(107 114 128);
}
</style>