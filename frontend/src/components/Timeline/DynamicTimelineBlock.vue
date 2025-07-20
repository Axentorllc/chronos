<template>
  <div
    :class="[
      'timeline-block relative border cursor-pointer select-none transition-all duration-200 group',
      blockClasses,
      spanningClasses,
      compactClasses,
      {
        'hover:shadow-md hover:scale-105 hover:z-10': !unassigned && !spanning && !compact,
        'hover:shadow-sm hover:scale-102 hover:z-10': !unassigned && compact,
        'opacity-75 border-dashed': unassigned,
        'ring-2 ring-blue-500 ring-opacity-50': selected,
        'transform scale-95 opacity-60': dragging,
        'rounded-lg': cellPosition === 'single',
        'rounded-l-lg rounded-r-none': cellPosition === 'start',
        'rounded-none': cellPosition === 'middle',
        'rounded-r-lg rounded-l-none': cellPosition === 'end',
      },
    ]"
    :style="blockStyle"
    :draggable="!resizing"
    @click="handleClick"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @contextmenu="handleContextMenu"
    @mouseenter="showControls = true"
    @mouseleave="handleMouseLeave"
  >
    <!-- Resize Handle (Left) - Only show on start cell -->
    <div
      v-if="resizable && hasDateRange && !unassigned && isStartCell"
      class="resize-handle resize-left absolute left-0 top-0 bottom-0 w-2 cursor-w-resize opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity z-10"
      :draggable="false"
      @mousedown="startResize('left', $event)"
      @dragstart.prevent.stop
    >
      <div
        class="w-full h-full bg-blue-500 hover:bg-blue-600 shadow-sm"
        :class="{
          'rounded-l-lg': cellPosition === 'single' || cellPosition === 'start'
        }"
        :draggable="false"
        @dragstart.prevent.stop
      ></div>
    </div>

    <!-- Main Block Content -->
    <div :class="[
      'block-content min-h-full flex',
      compact ? 'p-2 flex-row items-center gap-2' : 'p-3 flex-col'
    ]">
      <!-- Header Row -->
      <div :class="[
        'flex items-start justify-between',
        compact ? 'mb-0' : 'mb-2'
      ]">
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <!-- Status Indicator -->
          <div
            :class="[
              'rounded-full flex-shrink-0',
              compact ? 'w-1.5 h-1.5' : 'w-2 h-2',
              statusColor
            ]"
          ></div>

          <!-- Block Title -->
          <div class="flex-1 min-w-0">
            <div
              :class="[
                'font-semibold text-gray-900 dark:text-white truncate',
                compact ? 'text-xs' : 'text-sm'
              ]"
            >
              {{ blockTitle }}
            </div>
            <div
              v-if="blockSubtitle && !compact"
              class="text-xs text-gray-500 dark:text-gray-400 truncate"
            >
              {{ blockSubtitle }}
            </div>
          </div>
        </div>

        <!-- Priority/Actions -->
        <div class="flex items-center gap-1 flex-shrink-0">
          <!-- Priority Badge -->
          <div
            v-if="blockPriority && !compact"
            :class="[
              'px-1.5 py-0.5 rounded text-xs font-medium',
              priorityBadgeClass,
            ]"
          >
            {{ blockPriority }}
          </div>
          
          <!-- Compact Priority Indicator -->
          <div
            v-if="blockPriority && compact"
            :class="[
              'w-2 h-2 rounded-full',
              getPriorityIndicatorColor()
            ]"
            :title="blockPriority"
          ></div>

          <!-- Quick Actions (show on hover) -->
          <div
            v-if="showControls && !unassigned && !compact"
            class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Button
              variant="ghost"
              theme="gray"
              size="sm"
              @click.stop="handleEdit"
              class="w-6 h-6 p-0"
            >
              <FeatherIcon name="edit" class="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              theme="red"
              size="sm"
              @click.stop="handleDelete"
              class="w-6 h-6 p-0"
            >
              <FeatherIcon name="trash-2" class="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <div v-if="!compact" class="flex-1 space-y-2">
        <!-- Description -->
        <div
          v-if="blockDescription"
          class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2"
        >
          {{ blockDescription }}
        </div>

        <!-- Metadata Row -->
        <div class="flex items-center justify-between text-xs">
          <!-- Time Display for Day View -->
          <div
            v-if="dayView && (block.start_date || block[config?.block_to_date_field])"
            class="flex items-center gap-1 text-gray-500 dark:text-gray-400"
          >
            <FeatherIcon name="clock" class="w-3 h-3" />
            <span>{{ formatTimeRange() }}</span>
          </div>
          
          <!-- Duration/Time for other views -->
          <div
            v-else-if="blockDuration && !dayView"
            class="flex items-center gap-1 text-gray-500 dark:text-gray-400"
          >
            <FeatherIcon name="clock" class="w-3 h-3" />
            <span>{{ formatDuration(blockDuration) }}</span>
          </div>

          <!-- Progress Bar -->
          <div
            v-if="blockProgress !== null"
            class="flex items-center gap-2 flex-1 min-w-0 ml-2"
          >
            <div
              class="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden"
            >
              <div
                :class="['h-full transition-all duration-300', progressColor]"
                :style="{ width: `${blockProgress}%` }"
              ></div>
            </div>
            <span class="text-gray-500 dark:text-gray-400 text-xs min-w-max"
              >{{ blockProgress }}%</span
            >
          </div>
        </div>

        <!-- Date Range (for spanning blocks) - Only show on start cell -->
        <div
          v-if="hasDateRange && (block.start_date || block.end_date) && isStartCell"
          class="text-xs text-gray-500 dark:text-gray-400"
        >
          <div class="flex items-center gap-1">
            <FeatherIcon name="calendar" class="w-3 h-3" />
            <span>{{ formatDateRange() }}</span>
          </div>
        </div>

        <!-- Assignment Info -->
        <div
          v-if="assignmentInfo"
          class="text-xs text-gray-500 dark:text-gray-400"
        >
          <div class="flex items-center gap-1">
            <FeatherIcon name="user" class="w-3 h-3" />
            <span>{{ assignmentInfo }}</span>
          </div>
        </div>
      </div>
      
      <!-- Compact Content -->
      <div v-else class="flex items-center gap-2 flex-1 min-w-0">
        <!-- Duration indicator for compact mode -->
        <div
          v-if="blockDuration"
          class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap"
        >
          {{ formatDuration(blockDuration) }}
        </div>
        
        <!-- Progress indicator for compact mode -->
        <div
          v-if="blockProgress !== null"
          class="flex-1 min-w-0"
        >
          <div
            class="h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden"
          >
            <div
              :class="['h-full transition-all duration-300', progressColor]"
              :style="{ width: `${blockProgress}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Footer with Tags/Labels -->
      <div
        v-if="blockTags.length > 0"
        class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="flex flex-wrap gap-1">
          <span
            v-for="tag in blockTags.slice(0, 3)"
            :key="tag"
            class="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
          >
            {{ tag }}
          </span>
          <span
            v-if="blockTags.length > 3"
            class="px-1.5 py-0.5 text-xs text-gray-400 dark:text-gray-500"
          >
            +{{ blockTags.length - 3 }}
          </span>
        </div>
      </div>
    </div>

    <!-- Resize Handle (Right) - Only show on end cell -->
    <div
      v-if="resizable && hasDateRange && !unassigned && isEndCell"
      class="resize-handle resize-right absolute right-0 top-0 bottom-0 w-2 cursor-e-resize opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity z-10"
      :draggable="false"
      @mousedown="startResize('right', $event)"
      @dragstart.prevent.stop
    >
      <div
        class="w-full h-full bg-blue-500 hover:bg-blue-600 shadow-sm"
        :class="{
          'rounded-r-lg': cellPosition === 'single' || cellPosition === 'end'
        }"
        :draggable="false"
        @dragstart.prevent.stop
      ></div>
    </div>

    <!-- Drag Handle (for mobile/touch) -->
    <div
      v-if="!unassigned"
      class="drag-handle absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
    >
      <FeatherIcon name="move" class="w-3 h-3 text-gray-400" />
    </div>

    <!-- Unassigned Badge -->
    <div
      v-if="unassigned"
      class="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"
    ></div>

    <!-- Loading Overlay -->
    <div
      v-if="updating"
      class="absolute inset-0 bg-white/80 dark:bg-gray-800/80 rounded-lg flex items-center justify-center"
    >
      <div
        class="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { Button, FeatherIcon } from "frappe-ui";

const props = defineProps({
  block: {
    type: Object,
    required: true,
  },
  config: {
    type: Object,
    required: true,
  },
  unassigned: {
    type: Boolean,
    default: false,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  dragging: {
    type: Boolean,
    default: false,
  },
  resizable: {
    type: Boolean,
    default: false,
  },
  updating: {
    type: Boolean,
    default: false,
  },
  isStartCell: {
    type: Boolean,
    default: true,
  },
  isEndCell: {
    type: Boolean,
    default: true,
  },
  cellPosition: {
    type: String,
    default: 'single', // 'single', 'start', 'middle', 'end'
  },
  spanWidth: {
    type: Number,
    default: 1,
  },
  spanning: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
  index: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 1,
  },
  dayView: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "click",
  "dragstart",
  "dragend",
  "resize",
  "edit",
  "delete",
  "contextmenu",
]);

// Local state
const showControls = ref(false);
const resizing = ref(false);
const resizeDirection = ref(null);
const originalDuration = ref(null);
const dragging = ref(false);

// Computed properties for block data
const blockTitle = computed(() => {
  return props.block.label || props.block.name || props.block.id;
});

const blockSubtitle = computed(() => {
  return (
    props.block.subtitle || props.block.description?.substring(0, 50) || ""
  );
});

const blockDescription = computed(() => {
  if (!props.config?.block_description_field)
    return props.block.description || "";
  return (
    props.block[props.config.block_description_field] ||
    props.block.description ||
    ""
  );
});

const blockStatus = computed(() => {
  if (!props.config?.block_status_field) return props.block.status || "default";
  return (
    props.block[props.config.block_status_field] ||
    props.block.status ||
    "default"
  );
});

const blockPriority = computed(() => {
  if (!props.config?.block_priority_field) return props.block.priority || null;
  return (
    props.block[props.config.block_priority_field] ||
    props.block.priority ||
    null
  );
});

const blockProgress = computed(() => {
  if (!props.config?.block_progress_field) return props.block.progress || null;
  const progress =
    props.block[props.config.block_progress_field] || props.block.progress;
  return progress !== null && progress !== undefined ? Number(progress) : null;
});

const blockDuration = computed(() => {
  if (!props.config?.block_duration_field) return props.block.duration || null;
  return (
    props.block[props.config.block_duration_field] ||
    props.block.duration ||
    null
  );
});

const hasDateRange = computed(() => {
  // Use config-based field names with fallbacks
  const startField = props.config?.block_to_date_field || props.config?.date_range_start_field || 'start_date';
  const endField = props.config?.date_range_end_field || 'end_date';
  
  const startValue = getDateTimeFieldValue(props.block, startField) || props.block.start_date;
  const endValue = getDateTimeFieldValue(props.block, endField) || props.block.end_date;
  
  // Has date range if we have both start and end values
  return Boolean(startValue && endValue && startValue !== endValue);
});

const assignmentInfo = computed(() => {
  if (props.unassigned) return "Unassigned";
  return props.block.assigned_to || props.block.assignee || null;
});

const blockTags = computed(() => {
  const tags = [];

  // Add status as tag
  if (blockStatus.value && blockStatus.value !== "default") {
    tags.push(blockStatus.value);
  }

  // Add department/category
  if (props.block.department) tags.push(props.block.department);
  if (props.block.category) tags.push(props.block.category);
  if (props.block.project) tags.push(props.block.project);

  return tags;
});

// Styling computed properties
const statusColor = computed(() => {
  const status = blockStatus.value.toLowerCase();

  const statusColors = {
    completed: "bg-green-500",
    done: "bg-green-500",
    in_progress: "bg-blue-500",
    working: "bg-blue-500",
    pending: "bg-amber-500",
    waiting: "bg-amber-500",
    cancelled: "bg-red-500",
    rejected: "bg-red-500",
    draft: "bg-gray-400",
    open: "bg-indigo-500",
    new: "bg-cyan-500",
  };

  return statusColors[status] || "bg-gray-300";
});

const priorityBadgeClass = computed(() => {
  const priority = blockPriority.value?.toLowerCase();

  const priorityClasses = {
    high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    urgent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    medium:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  };

  return (
    priorityClasses[priority] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
  );
});

const progressColor = computed(() => {
  const progress = blockProgress.value;
  if (progress === null) return "bg-gray-300";

  if (progress >= 80) return "bg-green-500";
  if (progress >= 50) return "bg-blue-500";
  if (progress >= 25) return "bg-amber-500";
  return "bg-red-500";
});

const blockClasses = computed(() => {
  const classes = ["group"];

  // Status-based styling
  const status = blockStatus.value.toLowerCase();
  if (status === "completed" || status === "done") {
    classes.push(
      "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700",
    );
  } else if (status === "in_progress" || status === "working") {
    classes.push(
      "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700",
    );
  } else if (status === "pending" || status === "waiting") {
    classes.push(
      "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700",
    );
  } else if (status === "cancelled" || status === "rejected") {
    classes.push(
      "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700",
    );
  } else {
    classes.push(
      "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700",
    );
  }

  // Priority accent
  const priority = blockPriority.value?.toLowerCase();
  if (priority === "high" || priority === "urgent") {
    classes.push("border-l-4 border-l-red-500");
  } else if (priority === "medium") {
    classes.push("border-l-4 border-l-amber-500");
  } else if (priority === "low") {
    classes.push("border-l-4 border-l-green-500");
  }

  return classes;
});

const spanningClasses = computed(() => {
  const classes = [];
  
  if (props.spanning && hasDateRange.value) {
    classes.push('timeline-block-spanning');
    
    // Add position-specific classes
    if (props.cellPosition === 'start') {
      classes.push('spanning-start');
    } else if (props.cellPosition === 'middle') {
      classes.push('spanning-middle');
    } else if (props.cellPosition === 'end') {
      classes.push('spanning-end');
    }
  }
  
  return classes;
});

const compactClasses = computed(() => {
  const classes = [];
  
  if (props.compact) {
    classes.push('timeline-block-compact');
    
    // Add stacking z-index for overlapping effect
    if (props.total > 1) {
      classes.push('stacked-block');
    }
  }
  
  return classes;
});

const blockStyle = computed(() => {
  const style = {};

  // Set minimum height based on content and mode
  if (props.compact) {
    style.minHeight = "32px";
    style.maxHeight = "40px";
  } else {
    style.minHeight = "80px";
  }

  // Spanning blocks (date ranges)
  if (hasDateRange.value) {
    style.minWidth = props.compact ? "80px" : "120px";
    
    // For spanning blocks, make them fill the full width of cells
    if (props.spanning && props.spanWidth > 1) {
      // Calculate width based on span (assuming standard cell width)
      const cellWidth = 160; // This should match the CSS cell width
      const borderWidth = 2; // Account for borders
      style.width = `${(props.spanWidth * cellWidth) - borderWidth}px`;
      style.position = 'absolute';
      style.left = '0';
      style.right = 'auto';
      style.zIndex = '5';
    }
  }
  
  // Stacking for multiple blocks
  if (props.compact && props.total > 1) {
    style.zIndex = `${10 + props.index}`;
    if (props.index > 0) {
      style.marginTop = `-${Math.min(props.index * 4, 12)}px`;
    }
  }

  return style;
});

// Methods
const formatDuration = (duration) => {
  if (typeof duration === "number") {
    if (duration >= 1) {
      return duration === 1 ? "1 hour" : `${duration} hours`;
    } else {
      const minutes = Math.round(duration * 60);
      return minutes === 1 ? "1 minute" : `${minutes} minutes`;
    }
  }
  return duration;
};

// Enhanced datetime parsing with proper format detection
const parseDateTime = (dateTimeInput, preserveTime = true) => {
  if (!dateTimeInput) return null;
  
  let dateObj;
  
  if (typeof dateTimeInput === 'string') {
    const trimmed = dateTimeInput.trim();
    
    // Handle datetime with space separator
    if (trimmed.includes(' ') && !trimmed.includes('T')) {
      const [datePart, timePart] = trimmed.split(' ');
      
      // Detect date format and convert to ISO
      let isoDatePart;
      
      // Check if it's DD-MM-YYYY or DD/MM/YYYY format
      if (datePart.includes('-') && datePart.split('-').length === 3) {
        const parts = datePart.split('-');
        if (parts[0].length <= 2 && parts[2].length === 4) {
          // DD-MM-YYYY format - convert to YYYY-MM-DD
          const [day, month, year] = parts;
          isoDatePart = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else {
          // Assume YYYY-MM-DD format
          isoDatePart = datePart;
        }
      } else if (datePart.includes('/') && datePart.split('/').length === 3) {
        const parts = datePart.split('/');
        if (parts[0].length <= 2 && parts[2].length === 4) {
          // DD/MM/YYYY format - convert to YYYY-MM-DD
          const [day, month, year] = parts;
          isoDatePart = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else {
          // Assume MM/DD/YYYY format - convert to YYYY-MM-DD
          const [month, day, year] = parts;
          isoDatePart = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      } else {
        isoDatePart = datePart;
      }
      
      // Create ISO datetime string
      const isoString = preserveTime ? `${isoDatePart}T${timePart}` : `${isoDatePart}T00:00:00`;
      dateObj = new Date(isoString);
    }
    // Handle ISO format: "2025-07-09T14:30:00"
    else if (trimmed.includes('T')) {
      if (preserveTime) {
        dateObj = new Date(trimmed);
      } else {
        const datePart = trimmed.split('T')[0];
        dateObj = new Date(datePart + 'T00:00:00');
      }
    }
    // Handle date-only formats
    else {
      let isoDatePart;
      
      // Check for DD-MM-YYYY format
      if (trimmed.includes('-') && trimmed.split('-').length === 3) {
        const parts = trimmed.split('-');
        if (parts[0].length <= 2 && parts[2].length === 4) {
          // DD-MM-YYYY format - convert to YYYY-MM-DD
          const [day, month, year] = parts;
          isoDatePart = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else {
          // Assume YYYY-MM-DD format
          isoDatePart = trimmed;
        }
      } else {
        isoDatePart = trimmed;
      }
      
      dateObj = new Date(isoDatePart + 'T00:00:00');
    }
  } 
  else if (dateTimeInput instanceof Date) {
    dateObj = new Date(dateTimeInput);
    if (!preserveTime) {
      dateObj.setHours(0, 0, 0, 0);
    }
  } 
  else {
    return null;
  }
  
  // Validate the parsed date
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date parsed:', dateTimeInput, '- trying manual parsing');
    
    // Fallback: try manual parsing for DD-MM-YYYY HH:mm:ss format
    if (typeof dateTimeInput === 'string' && dateTimeInput.includes(' ')) {
      try {
        const [datePart, timePart] = dateTimeInput.split(' ');
        const [day, month, year] = datePart.split(/[-\/]/).map(Number);
        const [hours, minutes, seconds] = timePart.split(':').map(Number);
        
        // Create date with explicit components (month is 0-indexed)
        dateObj = new Date(year, month - 1, day, hours || 0, minutes || 0, seconds || 0);
        
        if (!isNaN(dateObj.getTime())) {
          return dateObj;
        }
      } catch (e) {
        console.warn('Manual parsing also failed:', e.message);
      }
    }
    
    return null;
  }
  
  return dateObj;
};

// Helper to get datetime field values with fallbacks
const getDateTimeFieldValue = (block, fieldName) => {
  if (!block || !fieldName) return null;
  return block[fieldName] || null;
};

const formatDateRange = () => {
  // Use config-based field names with fallbacks
  const startField = props.config?.block_to_date_field || 'start_date';
  const endField = props.config?.date_range_end_field || 'end_date';
  
  const startValue = getDateTimeFieldValue(props.block, startField) || props.block.start_date;
  const endValue = getDateTimeFieldValue(props.block, endField) || props.block.end_date;
  
  if (!startValue || !endValue) return "";

  const start = parseDateTime(startValue, false); // Date-only for range display
  const end = parseDateTime(endValue, false);
  
  if (!start || !end) return "";

  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
};

const formatTimeRange = () => {
  // Use config-based field names with fallbacks
  const startField = props.config?.block_to_date_field || 'start_date';
  const endField = props.config?.date_range_end_field || 'end_date';
  
  const startValue = getDateTimeFieldValue(props.block, startField) || props.block.start_date || props.block.date;
  const endValue = getDateTimeFieldValue(props.block, endField) || props.block.end_date;
  
  const startDateTime = parseDateTime(startValue, true); // Preserve time
  const endDateTime = parseDateTime(endValue, true);
  
  if (!startDateTime) return "";
  
  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Show time range if we have both start and end times
  if (endDateTime && endDateTime > startDateTime) {
    // Check if it's the same day to show time range or date-time range
    if (startDateTime.toDateString() === endDateTime.toDateString()) {
      return `${formatTime(startDateTime)} - ${formatTime(endDateTime)}`;
    } else {
      // Different days - show abbreviated format
      return `${formatTime(startDateTime)} (${Math.ceil((endDateTime - startDateTime) / (1000 * 60 * 60 * 24))}d)`;
    }
  } else {
    // Single time point
    return formatTime(startDateTime);
  }
};

const getPriorityIndicatorColor = () => {
  const priority = blockPriority.value?.toLowerCase();
  
  const priorityColors = {
    high: 'bg-red-500',
    urgent: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-green-500',
  };
  
  return priorityColors[priority] || 'bg-gray-400';
};

// Event handlers
const handleClick = (event) => {
  event.stopPropagation();
  emit("click", props.block, event);
};

const handleMouseLeave = () => {
  showControls.value = false;
  // Don't reset resizing state here as it might be in progress
};

const handleDragStart = (event) => {
  if (resizing.value) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return;
  }

  dragging.value = true;
  event.dataTransfer.effectAllowed = "move";
  
  // Set both formats for compatibility
  event.dataTransfer.setData("text/plain", props.block.id);
  event.dataTransfer.setData("application/json", JSON.stringify(props.block));
  
  emit("dragstart", props.block, event);
};

const handleDragEnd = (event) => {
  dragging.value = false;
  emit("dragend", props.block, event);
};

const handleContextMenu = (event) => {
  event.preventDefault();
  emit("contextmenu", props.block, event);
};

const handleEdit = () => {
  emit("edit", props.block);
};

const handleDelete = () => {
  emit("delete", props.block);
};

// Resize functionality
const startResize = (direction, event) => {
  if (!props.resizable || props.unassigned) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  resizing.value = true;
  resizeDirection.value = direction;
  originalDuration.value = blockDuration.value || 1;

  const startX = event.clientX;
  const cellWidth = 160; // Standard cell width
  
  // For date range blocks, calculate duration in days
  let startDuration = originalDuration.value;
  if (hasDateRange.value) {
    const startDate = props.block[props.config?.block_to_date_field] || props.block.date;
    const endDate = props.block[props.config?.date_range_end_field];
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      startDuration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1; // Duration in days
    }
  }

  const handleMouseMove = (e) => {
    const deltaX = e.clientX - startX;
    
    let newDuration = startDuration;
    if (hasDateRange.value) {
      // For date range blocks, use day-based resizing
      const dayChange = Math.round(deltaX / cellWidth);
      if (direction === "right") {
        newDuration = Math.max(1, startDuration + dayChange);
      } else {
        newDuration = Math.max(1, startDuration - dayChange);
      }
    } else {
      // For single date blocks, use hour-based resizing
      const hourChange = Math.round(deltaX / 40);
      if (direction === "right") {
        newDuration = Math.max(0.5, startDuration + hourChange);
      } else {
        newDuration = Math.max(0.5, startDuration - hourChange);
      }
    }

    // Enhanced resize event with more detailed data
    const resizeData = {
      block: props.block,
      newDuration,
      direction
    };
    
    // Calculate new dates for date range blocks
    if (hasDateRange.value) {
      const startField = props.config?.block_to_date_field;
      const endField = props.config?.date_range_end_field;
      
      if (startField && endField) {
        const currentStart = props.block[startField] || props.block.date;
        const currentEnd = props.block[endField];
        
        if (direction === 'right' && currentStart) {
          // Extending to the right - calculate new end date
          const startDate = new Date(currentStart);
          const newEndDate = new Date(startDate);
          newEndDate.setDate(startDate.getDate() + Math.floor(newDuration) - 1);
          resizeData.newEndDate = newEndDate.toISOString().split('T')[0];
        } else if (direction === 'left' && currentEnd) {
          // Extending to the left - calculate new start date
          const endDate = new Date(currentEnd);
          const newStartDate = new Date(endDate);
          newStartDate.setDate(endDate.getDate() - Math.floor(newDuration) + 1);
          resizeData.newStartDate = newStartDate.toISOString().split('T')[0];
        }
      }
    }
    
    emit("resize", resizeData);
  };

  const handleMouseUp = () => {
    resizing.value = false;
    resizeDirection.value = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    
    // Re-enable dragging after resize is complete
    setTimeout(() => {
      dragging.value = false;
    }, 50);
  };

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
};

// Computed properties for new props
const spanWidth = computed(() => {
  return props.spanWidth || 1;
});

const spanning = computed(() => {
  return props.spanning;
});

// Watchers
watch(
  () => props.selected,
  (selected) => {
    if (selected) {
      showControls.value = true;
    }
  },
);
</script>

<style scoped>
.timeline-block {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.timeline-block:hover {
  transform: translateY(-1px);
  box-shadow:
    0 4px 12px -2px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.resize-handle {
  transition: all 0.2s ease;
}

.resize-handle:hover {
  width: 4px;
}

.resize-handle:active {
  width: 6px;
}

.timeline-block:active {
  transform: translateY(0);
}

.resize-handle {
  z-index: 10;
}

.resize-handle:hover {
  background: linear-gradient(
    to bottom,
    rgba(59, 130, 246, 0.1),
    rgba(59, 130, 246, 0.2)
  );
}

.resize-handle:active {
  background: linear-gradient(
    to bottom,
    rgba(59, 130, 246, 0.2),
    rgba(59, 130, 246, 0.3)
  );
}

.block-content {
  position: relative;
  z-index: 1;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Dragging state */
.timeline-block.dragging {
  transform: rotate(2deg) scale(1.05);
  z-index: 1000;
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.2),
    0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

/* Selection highlight */
.timeline-block.selected {
  box-shadow:
    0 0 0 2px rgba(59, 130, 246, 0.5),
    0 4px 12px -2px rgba(0, 0, 0, 0.1);
}

/* Unassigned state */
.timeline-block.unassigned {
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 2px,
    rgba(245, 158, 11, 0.1) 2px,
    rgba(245, 158, 11, 0.1) 4px
  );
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .timeline-block {
    min-height: 60px;
  }

  .block-content {
    @apply p-2;
  }

  .resize-handle {
    @apply w-2;
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .timeline-block:hover {
    box-shadow:
      0 4px 12px -2px rgba(0, 0, 0, 0.3),
      0 2px 4px -1px rgba(0, 0, 0, 0.2);
  }
}

/* Focus states for accessibility */
.timeline-block:focus {
  outline: 2px solid rgba(59, 130, 246, 0.6);
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .timeline-block {
    border-width: 2px;
  }
}

/* Animation for updates */
@keyframes pulse-update {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

.timeline-block.updating {
  animation: pulse-update 1s ease-in-out infinite;
}

/* Enhanced Spanning block styles */
.timeline-block-spanning {
  background: linear-gradient(
    90deg,
    rgba(59, 130, 246, 0.1) 0%,
    rgba(59, 130, 246, 0.05) 50%,
    rgba(59, 130, 246, 0.1) 100%
  );
  border: 2px solid rgba(59, 130, 246, 0.3);
  position: relative;
  overflow: visible;
}

/* Spanning position styles */
.spanning-start {
  border-right: 1px solid rgba(59, 130, 246, 0.2);
}

.spanning-middle {
  border-left: 1px solid rgba(59, 130, 246, 0.2);
  border-right: 1px solid rgba(59, 130, 246, 0.2);
}

.spanning-end {
  border-left: 1px solid rgba(59, 130, 246, 0.2);
}

/* Connection indicator for spanning blocks */
.timeline-block-spanning::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    rgba(59, 130, 246, 0.6),
    rgba(59, 130, 246, 0.3),
    rgba(59, 130, 246, 0.6)
  );
  transform: translateY(-50%);
  border-radius: 1px;
  z-index: 1;
}

/* Hide connection on start and end for cleaner look */
.spanning-start::before {
  left: 50%;
}

.spanning-end::before {
  right: 50%;
}

.timeline-block-spanning:hover {
  background: linear-gradient(
    90deg,
    rgba(59, 130, 246, 0.15) 0%,
    rgba(59, 130, 246, 0.08) 50%,
    rgba(59, 130, 246, 0.15) 100%
  );
  border-color: rgba(59, 130, 246, 0.5);
  transform: none; /* Disable scale transform for spanning blocks */
}

/* Enhanced resize handles for spanning blocks */
.timeline-block-spanning .resize-handle {
  opacity: 0.7;
  background: rgba(59, 130, 246, 0.3);
}

.timeline-block-spanning .resize-handle:hover {
  opacity: 1;
  background: rgba(59, 130, 246, 0.5);
  width: 6px;
}

/* Content adjustments for spanning blocks */
.timeline-block-spanning .block-content {
  position: relative;
  z-index: 2;
}

/* Middle blocks - simplified content */
.spanning-middle .block-content {
  opacity: 0.6;
  padding: 1rem 0.5rem;
}

.spanning-middle .block-content > *:not(:first-child) {
  display: none;
}

/* Dark mode adjustments for spanning blocks */
@media (prefers-color-scheme: dark) {
  .timeline-block-spanning {
    background: linear-gradient(
      90deg,
      rgba(59, 130, 246, 0.2) 0%,
      rgba(59, 130, 246, 0.1) 50%,
      rgba(59, 130, 246, 0.2) 100%
    );
    border-color: rgba(59, 130, 246, 0.4);
  }
  
  .timeline-block-spanning:hover {
    background: linear-gradient(
      90deg,
      rgba(59, 130, 246, 0.25) 0%,
      rgba(59, 130, 246, 0.12) 50%,
      rgba(59, 130, 246, 0.25) 100%
    );
  }
  
  .spanning-start,
  .spanning-middle,
  .spanning-end {
    border-color: rgba(59, 130, 246, 0.3);
  }
}

/* Compact block styles */
.timeline-block-compact {
  min-height: 32px;
  max-height: 40px;
  transition: all 0.2s ease;
}

.timeline-block-compact .block-content {
  padding: 0.5rem;
}

.timeline-block-compact:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.1);
}

/* Stacked blocks */
.stacked-block {
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stacked-block:not(:first-child) {
  border-top: 1px solid rgba(255, 255, 255, 0.8);
}

/* Multiple blocks indicator */
.multiple-blocks {
  position: relative;
}

.multiple-blocks::before {
  content: '';
  position: absolute;
  top: -2px;
  left: 2px;
  right: -2px;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent);
  border-radius: 1px;
  opacity: 0.6;
}

/* Compact mode adjustments */
.timeline-block-compact .resize-handle {
  display: none; /* Hide resize handles in compact mode */
}

.timeline-block-compact .drag-handle {
  top: 2px;
  right: 2px;
}

/* Enhanced transitions for stacking */
.block-enter-active,
.block-leave-active {
  transition: all 0.3s ease;
}

.block-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(10px);
}

.block-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(-10px);
}

.block-move {
  transition: transform 0.3s ease;
}

/* Cell expansion animations */
.cell-expanded {
  max-height: 300px;
  overflow-y: auto;
}

.cell-compact {
  max-height: 120px;
  overflow: hidden;
}

/* Scroll styling for expanded cells */
.cell-expanded::-webkit-scrollbar {
  width: 4px;
}

.cell-expanded::-webkit-scrollbar-track {
  background: transparent;
}

.cell-expanded::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 2px;
}

.cell-expanded::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.8);
}

/* Dark mode adjustments for compact blocks */
@media (prefers-color-scheme: dark) {
  .timeline-block-compact:hover {
    box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.3);
  }
  
  .stacked-block:not(:first-child) {
    border-top-color: rgba(55, 65, 81, 0.8);
  }
  
  .multiple-blocks::before {
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.4), transparent);
  }
}
</style>
