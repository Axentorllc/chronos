<template>
  <div class="day-view-container h-full flex flex-col bg-gray-50">
    <!-- Header -->
    <div class="day-view-header bg-white border-b sticky top-0 z-30">
      <div class="px-4 lg:px-6 py-4">
        <!-- Header Top Row -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-4">
            <h1 class="text-xl lg:text-2xl font-semibold text-gray-900">
              {{ formatDayTitle() }}
            </h1>
            <div class="flex items-center space-x-3 text-sm text-gray-600">
              <Badge variant="subtle" theme="blue">
                <template #prefix>
                  <FeatherIcon name="calendar" class="w-3.5 h-3.5" />
                </template>
                {{ visibleBlocks.length }} events
              </Badge>
              <Badge variant="subtle" theme="gray">
                <template #prefix>
                  <FeatherIcon name="users" class="w-3.5 h-3.5" />
                </template>
                {{ filteredRows.length }} resources
              </Badge>
            </div>
          </div>
          
          <div class="flex items-center space-x-3">
            <!-- Time Range -->
            <Badge variant="outline" theme="blue" size="md">
              {{ timeRange }}
            </Badge>
            
            <!-- Time Granularity Selector -->
            <div class="flex" role="group" aria-label="Time granularity options">
              <Button
                v-for="(option, index) in timeGranularityOptions"
                :key="option.value"
                :variant="timeGranularity === option.value ? 'solid' : 'ghost'"
                :theme="timeGranularity === option.value ? 'blue' : 'gray'"
                size="sm"
                @click="timeGranularity = option.value"
                :class="[
                  index === 0 ? 'rounded-r-none' : index === timeGranularityOptions.length - 1 ? 'rounded-l-none' : 'rounded-none',
                  index !== 0 ? 'border-l-0' : ''
                ]"
                :aria-pressed="timeGranularity === option.value"
                :aria-label="`Set time granularity to ${option.label}`"
              >
                {{ option.label }}
              </Button>
            </div>
            
            <!-- Navigation -->
            <Button
              variant="ghost"
              theme="blue"
              size="sm"
              @click="goToToday"
            >
              <template #prefix>
                <FeatherIcon name="calendar" class="w-4 h-4" />
              </template>
              Today
            </Button>
          </div>
        </div>
        
        <!-- Resource Filter -->
        <div class="flex items-center space-x-4">
          <div class="flex-1 max-w-md">
            <FormControl
              type="autocomplete"
              :options="resourceSearchOptions"
              v-model="resourceSearch"
              placeholder="Search resources..."
              :multiple="true"
              aria-label="Filter resources"
            />
          </div>
          <Badge variant="subtle" theme="gray" size="sm">
            {{ filteredRows.length }} of {{ totalRows }} resources
          </Badge>
        </div>
      </div>
    </div>

    <!-- Day View Content -->
    <div class="day-view-content flex-1 flex overflow-hidden">
      <!-- Time Column -->
      <div class="time-column w-16 sm:w-20 lg:w-24 bg-white border-r flex-shrink-0 flex flex-col">
        <!-- Time Header -->
        <div class="h-16 lg:h-20 border-b bg-gray-50 flex items-center justify-center flex-shrink-0">
          <FeatherIcon name="clock" class="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />
        </div>
        
        <!-- Time Slots - Synchronized with main grid -->
        <div 
          ref="timeColumn"
          class="time-slots flex-1 overflow-hidden"
          :style="{ transform: `translateY(-${scrollTop}px)` }"
        >
          <div :style="{ height: totalGridHeight + 'px' }">
            <div
              v-for="timeSlot in timeSlots"
              :key="timeSlot.hour"
              :class="[
                'time-slot border-b border-gray-100 flex items-start justify-end pr-2 lg:pr-3 py-2 lg:py-3',
                getTimeSlotHeight(),
                'cursor-pointer hover:bg-gray-50 transition-colors group',
                timeSlot.isCurrentHour ? 'bg-blue-50 border-blue-200' : ''
              ]"
              :style="{ height: getHourHeight() + 'px' }"
            >
              <span :class="[
                'text-xs lg:text-sm font-medium transition-colors',
                timeSlot.isCurrentHour ? 'text-blue-600 font-semibold' : 'text-gray-600 group-hover:text-gray-800'
              ]">
                {{ timeSlot.label }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Resources and Timeline Grid -->
      <div class="timeline-content flex-1 flex flex-col overflow-hidden">
        <!-- Resource Headers - Synchronized with main grid -->
        <div class="resource-headers h-16 lg:h-20 bg-white border-b overflow-hidden flex-shrink-0">
          <div 
            ref="resourceHeaders"
            class="flex"
            :style="{ 
              minWidth: gridMinWidth + 'px',
              transform: `translateX(-${scrollLeft}px)`
            }"
          >
            <div
              v-for="resource in filteredRows"
              :key="resource.id"
              class="resource-header border-r bg-white flex-shrink-0 hover:bg-gray-50 transition-all duration-200 cursor-pointer group"
              :style="{ width: responsiveResourceWidth + 'px' }"
              :tabindex="0"
              role="button"
              :aria-label="`Select resource ${getResourceTitle(resource)}`"
              @click="selectResource(resource)"
              @keydown.enter="selectResource(resource)"
              @keydown.space.prevent="selectResource(resource)"
            >
              <div class="p-3 lg:p-4 h-full flex items-center">
                <Avatar
                  :label="getResourceTitle(resource)"
                  :image="resource.image"
                  :size="isMobile ? 'sm' : 'md'"
                  class="mr-3 flex-shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-sm text-gray-900 truncate">
                    {{ getResourceTitle(resource) }}
                  </div>
                  <div v-if="!isMobile && getResourceSubtitle(resource)" class="text-xs text-gray-500 truncate mt-0.5">
                    {{ getResourceSubtitle(resource) }}
                  </div>
                </div>
                <!-- Event count indicator -->
                <Badge 
                  v-if="getBlocksForResource(resource.id).length > 0"
                  variant="solid" 
                  theme="blue" 
                  size="sm"
                  class="ml-2"
                >
                  {{ getBlocksForResource(resource.id).length }}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline Grid -->
        <div 
          ref="timelineGrid"
          class="timeline-grid flex-1 overflow-auto relative"
          @scroll="handleGridScroll"
        >
          <div 
            class="grid-container relative"
            :style="{ 
              height: totalGridHeight + 'px',
              minWidth: gridMinWidth + 'px'
            }"
          >
            <!-- Grid Background -->
            <div class="grid-background absolute inset-0">
              <!-- Horizontal Lines -->
              <div
                v-for="timeSlot in timeSlots"
                :key="`h-${timeSlot.hour}`"
                :class="[
                  'absolute left-0 right-0 border-t',
                  timeSlot.isCurrentHour ? 'border-blue-200' : 'border-gray-100'
                ]"
                :style="{ top: getTimePosition(timeSlot.hour) + 'px' }"
              ></div>
              
              <!-- Vertical Lines -->
              <div
                v-for="(resource, index) in filteredRows"
                :key="`v-${resource.id}`"
                class="absolute top-0 bottom-0 border-l border-gray-200"
                :style="{ left: (index * responsiveResourceWidth) + 'px' }"
              ></div>
            </div>

            <!-- Current Time Indicator -->
            <div
              v-if="isToday && currentTimePosition > 0"
              class="current-time-indicator absolute left-0 right-0 z-20 pointer-events-none"
              :style="{ top: currentTimePosition + 'px' }"
            >
              <div class="h-0.5 bg-red-500 relative">
                <div class="absolute -left-2 -top-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
                <div class="absolute -right-2 -top-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
            </div>

            <!-- Resource Columns -->
            <div
              v-for="(resource, colIndex) in filteredRows"
              :key="resource.id"
              class="resource-column absolute top-0 bottom-0 hover:bg-blue-50 transition-colors group"
              :style="{ 
                left: (colIndex * responsiveResourceWidth) + 'px',
                width: responsiveResourceWidth + 'px'
              }"
              @drop="handleDrop($event, resource.id)"
              @dragover.prevent="handleDragOver($event, resource.id)"
              @dragenter.prevent
              @dragleave="handleDragLeave($event)"
              @click="handleResourceColumnClick($event, resource.id)"
            >
              <!-- Drop Zone Overlay -->
              <div
                v-if="dragOverResource === resource.id"
                class="absolute inset-0 bg-blue-100 border-2 border-dashed border-blue-400 flex items-center justify-center z-30 rounded-lg m-1"
              >
                <Badge variant="solid" theme="blue" size="md">
                  <template #prefix>
                    <FeatherIcon name="arrow-down" class="w-4 h-4" />
                  </template>
                  <span class="hidden sm:inline">Drop here</span>
                </Badge>
              </div>
              
              <!-- Click to add indicator -->
              <div
                v-if="!draggedBlock && selectedResource === resource.id"
                class="absolute inset-0 bg-green-50 border border-green-300 rounded-lg m-1 flex items-center justify-center z-20"
              >
                <Badge variant="solid" theme="green" size="md">
                  <template #prefix>
                    <FeatherIcon name="plus" class="w-4 h-4" />
                  </template>
                  <span class="hidden sm:inline">Click to add</span>
                </Badge>
              </div>

              <!-- Hover guide lines -->
              <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div 
                  v-for="guide in hourGuides" 
                  :key="guide.hour"
                  class="absolute left-0 right-0 border-t border-blue-200 border-dashed"
                  :style="{ top: guide.position + 'px' }"
                ></div>
              </div>

              <!-- Event Blocks -->
              <DynamicTimelineBlock
                v-for="block in getBlocksForResource(resource.id)"
                :key="block.id"
                :block="block"
                :config="config"
                :selected="selectedBlock?.id === block.id"
                :dayView="true"
                :style="getBlockStyle(block)"
                class="absolute z-10 mx-1 transition-all duration-200 hover:shadow-md"
                @click="handleBlockClick"
                @dragstart="handleBlockDragStart"
                @dragend="handleBlockDragEnd"
                @resize="handleBlockResize"
                @contextmenu="handleBlockContextMenu"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { Button, FeatherIcon, Avatar, Badge, FormControl } from "frappe-ui";
import DynamicTimelineBlock from "./DynamicTimelineBlock.vue";

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
  currentDate: {
    type: Date,
    required: true,
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
  "dateNavigate",
  "goToToday",
]);

// Reactive state
const timeGranularity = ref(60); // minutes
const startHour = ref(7); // 7 AM
const endHour = ref(19); // 7 PM 
const resourceColumnWidth = ref(260);
const selectedBlock = ref(null);
const draggedBlock = ref(null);
const dragOverResource = ref(null);
const resourceSearch = ref([]);
const selectedResource = ref(null);
const windowWidth = ref(window.innerWidth);

// Scroll synchronization state
const scrollTop = ref(0);
const scrollLeft = ref(0);

// Template refs
const timelineGrid = ref(null);
const timeColumn = ref(null);
const resourceHeaders = ref(null);

// Configuration
const timeGranularityOptions = [
  { label: "15min", value: 15 },
  { label: "30min", value: 30 },
  { label: "1hour", value: 60 },
];

// Enhanced datetime parsing
const parseDateTime = (dateTimeInput) => {
  if (!dateTimeInput) return null;
  
  try {
    if (typeof dateTimeInput === 'string') {
      const trimmed = dateTimeInput.trim();
      
      // Handle DD-MM-YYYY HH:mm:ss format
      if (trimmed.match(/^\d{1,2}-\d{1,2}-\d{4} \d{1,2}:\d{1,2}:\d{1,2}$/)) {
        const [datePart, timePart] = trimmed.split(' ');
        const [day, month, year] = datePart.split('-');
        return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}`);
      }
      
      // Handle other formats
      if (trimmed.includes(' ')) {
        return new Date(trimmed.replace(' ', 'T'));
      }
      
      return new Date(trimmed);
    }
    
    return new Date(dateTimeInput);
  } catch (error) {
    console.warn('Failed to parse datetime:', dateTimeInput, error);
    return null;
  }
};

// Computed properties
const totalRows = computed(() => props.rows.length);

const filteredRows = computed(() => {
  if (!resourceSearch.value?.length) {
    return props.rows;
  }
  
  const searchIds = resourceSearch.value.map(item => item.value);
  return props.rows.filter(row => searchIds.includes(row.id));
});

const resourceSearchOptions = computed(() => {
  return props.rows.map(row => ({
    value: row.id,
    label: `${getResourceTitle(row)} ${getResourceSubtitle(row) ? `(${getResourceSubtitle(row)})` : ''}`,
  }));
});

const timeSlots = computed(() => {
  const slots = [];
  const now = new Date();
  const currentHour = now.getHours();
  
  for (let hour = startHour.value; hour <= endHour.value; hour++) {
    slots.push({
      hour,
      label: formatHour(hour),
      isCurrentHour: isToday.value && hour === currentHour,
    });
  }
  return slots;
});

const hourGuides = computed(() => {
  const guides = [];
  for (let hour = startHour.value; hour <= endHour.value; hour++) {
    guides.push({
      hour,
      position: getTimePosition(hour),
    });
  }
  return guides;
});

const timeRange = computed(() => {
  return `${formatHour(startHour.value)} - ${formatHour(endHour.value)}`;
});

const isToday = computed(() => {
  const today = new Date();
  return props.currentDate.toDateString() === today.toDateString();
});

const currentTimePosition = computed(() => {
  if (!isToday.value) return 0;
  
  const now = new Date();
  const currentHour = now.getHours() + (now.getMinutes() / 60);
  
  if (currentHour < startHour.value || currentHour > endHour.value) return 0;
  
  return (currentHour - startHour.value) * getHourHeight();
});

const visibleBlocks = computed(() => {
  if (!Array.isArray(props.blocks)) return [];
  
  const dayStart = new Date(props.currentDate);
  dayStart.setHours(0, 0, 0, 0);
  
  const dayEnd = new Date(props.currentDate);
  dayEnd.setHours(23, 59, 59, 999);
  
  return props.blocks.filter(block => {
    const startDate = parseDateTime(
      block[props.config?.block_to_date_field] || 
      block.start_date || 
      block.date
    );
    
    if (!startDate) return false;
    
    const endDate = parseDateTime(
      block[props.config?.date_range_end_field] || 
      block.end_date
    );
    
    if (endDate && endDate > startDate) {
      return startDate <= dayEnd && endDate >= dayStart;
    }
    
    return startDate >= dayStart && startDate <= dayEnd;
  });
});

// Responsive design computed properties
const isMobile = computed(() => windowWidth.value < 768);
const isTablet = computed(() => windowWidth.value >= 768 && windowWidth.value < 1024);

const responsiveResourceWidth = computed(() => {
  if (isMobile.value) {
    return Math.max(180, (windowWidth.value - 80) / Math.min(filteredRows.value.length, 2));
  } else if (isTablet.value) {
    return Math.max(220, (windowWidth.value - 96) / Math.min(filteredRows.value.length, 3));
  }
  return resourceColumnWidth.value;
});

const gridMinWidth = computed(() => {
  return filteredRows.value.length * responsiveResourceWidth.value;
});

const totalGridHeight = computed(() => {
  return timeSlots.value.length * getHourHeight();
});

// Helper functions
const formatDayTitle = () => {
  return props.currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric", 
    month: "long",
    day: "numeric",
  });
};

const formatHour = (hour) => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour} ${period}`;
};

const getHourHeight = () => {
  const heightMap = {
    15: 80,
    30: 64,
    60: 48,
  };
  return heightMap[timeGranularity.value] || 48;
};

const getTimeSlotHeight = () => {
  const heightMap = {
    15: 'h-20',
    30: 'h-16',
    60: 'h-12',
  };
  return heightMap[timeGranularity.value] || 'h-12';
};

const getTimePosition = (hour) => {
  return (hour - startHour.value) * getHourHeight();
};

const getResourceTitle = (resource) => {
  return resource.label || resource.name || resource.id;
};

const getResourceSubtitle = (resource) => {
  return resource.department || resource.designation || resource.description || "";
};

const getBlocksForResource = (resourceId) => {
  return visibleBlocks.value.filter(block => block.row_id === resourceId);
};

const getBlockStyle = (block) => {
  const startDateTime = parseDateTime(
    block[props.config?.block_to_date_field] || 
    block.start_date || 
    block.date
  );
  
  if (!startDateTime) return { display: 'none' };
  
  const endDateTime = parseDateTime(
    block[props.config?.date_range_end_field] || 
    block.end_date
  );
  
  const hourHeight = getHourHeight();
  const startHours = startDateTime.getHours() + (startDateTime.getMinutes() / 60);
  const top = Math.max(0, (startHours - startHour.value) * hourHeight);
  
  let height = hourHeight * 0.8; // Frappe UI compatible height
  
  if (endDateTime && endDateTime > startDateTime) {
    const durationHours = (endDateTime - startDateTime) / (1000 * 60 * 60);
    height = Math.max(32, durationHours * hourHeight);
  }
  
  return {
    top: `${top}px`,
    height: `${height}px`,
    width: `calc(100% - 8px)`,
    left: '4px',
    minHeight: '32px',
  };
};

// Event handlers
const goToToday = () => {
  emit("goToToday");
};

// Scroll synchronization handler
const handleGridScroll = (event) => {
  const target = event.target;
  scrollTop.value = target.scrollTop;
  scrollLeft.value = target.scrollLeft;
};

const handleBlockClick = (block, event) => {
  selectedBlock.value = selectedBlock.value?.id === block.id ? null : block;
  emit("blockClick", block, event);
  
  // Redirect to document in desk (similar to week view)
  const doctype = props.config.block_doctype.toLowerCase().replace(/ /g, '-');
  const url = `/app/${doctype}/${block.name}`;
  window.open(url, '_blank');
};

const handleBlockDragStart = (block) => {
  draggedBlock.value = block;
};

const handleBlockDragEnd = () => {
  draggedBlock.value = null;
  dragOverResource.value = null;
};

const handleDragOver = (event, resourceId) => {
  event.preventDefault();
  dragOverResource.value = resourceId;
};

const handleDragLeave = (event) => {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    dragOverResource.value = null;
  }
};

const handleDrop = (event, resourceId) => {
  event.preventDefault();
  dragOverResource.value = null;
  
  if (!draggedBlock.value) return;
  
  // Calculate drop time with snapping
  const rect = event.currentTarget.getBoundingClientRect();
  const y = event.clientY - rect.top;
  const hourHeight = getHourHeight();
  const snapInterval = timeGranularity.value / 60; // Convert to hours
  
  const droppedHour = Math.floor(y / hourHeight) + startHour.value;
  const minutesFraction = ((y % hourHeight) / hourHeight);
  const snappedMinutes = Math.round(minutesFraction / snapInterval) * timeGranularity.value;
  
  // Create new datetime
  const newDateTime = new Date(props.currentDate);
  newDateTime.setHours(droppedHour, snappedMinutes, 0, 0);
  
  // Format datetime as timezone-naive string (YYYY-MM-DD HH:MM:SS)
  const year = newDateTime.getFullYear();
  const month = String(newDateTime.getMonth() + 1).padStart(2, '0');
  const day = String(newDateTime.getDate()).padStart(2, '0');
  const hours = String(newDateTime.getHours()).padStart(2, '0');
  const minutes = String(newDateTime.getMinutes()).padStart(2, '0');
  const seconds = String(newDateTime.getSeconds()).padStart(2, '0');
  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  
  emit("blockMove", {
    blockId: draggedBlock.value.id,
    newRowId: resourceId,
    newDateTime: formattedDateTime,
    originalBlock: draggedBlock.value
  });
  
  draggedBlock.value = null;
};

const handleBlockResize = (resizeData) => {
  emit("blockResize", resizeData);
};

const handleBlockContextMenu = (block, event) => {
  event.preventDefault();
};

const selectResource = (resource) => {
  selectedResource.value = selectedResource.value?.id === resource.id ? null : resource;
};

const handleResourceColumnClick = (event, resourceId) => {
  if (draggedBlock.value) return;
  
  // Calculate the time with better snapping
  const rect = event.currentTarget.getBoundingClientRect();
  const y = event.clientY - rect.top;
  const hourHeight = getHourHeight();
  const snapInterval = timeGranularity.value; // in minutes
  
  const clickedHour = Math.floor(y / hourHeight) + startHour.value;
  const minutesFraction = ((y % hourHeight) / hourHeight) * 60;
  const snappedMinutes = Math.round(minutesFraction / snapInterval) * snapInterval;
  
  // Create new datetime
  const clickDateTime = new Date(props.currentDate);
  clickDateTime.setHours(clickedHour, snappedMinutes, 0, 0);
  
  // Format datetime as timezone-naive string (YYYY-MM-DD HH:MM:SS)
  const year = clickDateTime.getFullYear();
  const month = String(clickDateTime.getMonth() + 1).padStart(2, '0');
  const day = String(clickDateTime.getDate()).padStart(2, '0');
  const hours = String(clickDateTime.getHours()).padStart(2, '0');
  const minutes = String(clickDateTime.getMinutes()).padStart(2, '0');
  const seconds = String(clickDateTime.getSeconds()).padStart(2, '0');
  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  
  // Emit add block event - use rowId to match grid view naming
  emit('addBlock', {
    rowId: resourceId,
    dateTime: formattedDateTime,
    date: clickDateTime.toISOString().split('T')[0]
  });
  
  selectedResource.value = null;
};

// Window resize handler
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

// Initialize
onMounted(() => {
  window.addEventListener('resize', handleResize);
});

// Cleanup
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
/* Frappe UI Compatible Styles */
.day-view-container {
  font-family: inherit;
}

/* Scroll synchronization - ensure time column and headers don't scroll independently */
.time-slots {
  overflow: hidden;
}

.resource-headers {
  overflow: hidden;
}

/* Ensure smooth scrolling synchronization */
.timeline-grid {
  scroll-behavior: smooth;
}

/* Fix for potential layout shift during scroll */
.time-column,
.resource-headers {
  will-change: transform;
}

/* Enhanced hover effects using Frappe UI patterns */
.resource-column {
  position: relative;
}

.resource-column::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--blue-500);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.resource-column:hover::before {
  opacity: 1;
}

.resource-header {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.resource-header:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.time-slot {
  transition: all 0.2s ease;
}

.time-slot:hover {
  transform: translateX(2px);
}

/* Current time indicator animation */
.current-time-indicator {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* Better focus states following Frappe UI patterns */
.resource-header:focus,
.resource-column:focus,
.time-slot:focus {
  outline: 2px solid var(--blue-500);
  outline-offset: 2px;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .day-view-container {
    font-size: 14px;
  }
  
  .resource-header {
    padding: 0.75rem;
  }
  
  .time-slot {
    min-height: 48px;
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .resource-column:hover,
  .time-slot:hover,
  .resource-header:hover {
    transform: none;
  }
  
  .resource-column:active {
    background-color: var(--blue-50);
  }
  
  .time-slot {
    min-height: 44px; /* Better touch targets */
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Loading state */
.timeline-grid.loading {
  opacity: 0.6;
  pointer-events: none;
}
</style>