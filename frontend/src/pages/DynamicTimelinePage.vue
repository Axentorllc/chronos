<template>
  <div class="dynamic-timeline-page">
    <!-- Page Header -->
    <div class="border-b bg-white sticky top-0 z-30">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <!-- Left Section -->
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <FeatherIcon name="calendar" class="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 class="text-xl font-semibold text-gray-900">
                  Dynamic Timeline
                </h1>
                <p class="text-sm text-gray-600">
                  Flexible timeline views for any DocType combination
                </p>
              </div>
            </div>
          </div>

          <!-- Right Section -->
          <div class="flex items-center gap-3">
            <!-- Help Button -->
            <Button variant="ghost" theme="gray" size="sm" @click="showHelp = true">
              <FeatherIcon name="help-circle" class="w-4 h-4 mr-2" />
              Help
            </Button>

            <!-- Settings Button -->
            <!-- <Button variant="ghost" theme="gray" size="sm" @click="showSettings = true">
              <FeatherIcon name="settings" class="w-4 h-4" />
            </Button> -->
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="p-6">
      <!-- Configuration Selection View -->
      <div v-if="currentView === 'selector'" class="configuration-view">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            Choose Timeline Configuration
          </h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            Select a timeline configuration to view your data in a dynamic, interactive timeline. 
            Each configuration defines how different DocTypes are mapped to timeline rows, blocks, and dates.
          </p>
        </div>

        <ConfigurationSelector 
          @configurationSelected="handleConfigurationSelected"
          @error="handleError"
        />
      </div>

      <!-- Dynamic Timeline View -->
      <div v-else-if="currentView === 'timeline'" class="timeline-view">
        <DynamicTimeline 
          :configuration="selectedConfiguration"
          @backToSelector="handleBackToSelector"
        />
      </div>

      <!-- Loading State -->
      <div v-else-if="currentView === 'loading'" class="loading-view flex items-center justify-center py-20">
        <div class="bg-white rounded-xl p-8 shadow-sm border">
          <div class="flex flex-col items-center gap-4">
            <div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div class="text-center">
              <h3 class="text-lg font-semibold text-gray-900 mb-1">
                Loading Timeline
              </h3>
              <p class="text-sm text-gray-600">
                Preparing your dynamic timeline view...
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="currentView === 'error'" class="error-view">
        <div class="max-w-md mx-auto">
          <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <FeatherIcon name="alert-circle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 class="text-lg font-semibold text-red-900 mb-2">
              Something went wrong
            </h3>
            <p class="text-red-700 text-sm mb-4">
              {{ errorMessage }}
            </p>
            <div class="flex items-center justify-center gap-3">
              <Button variant="solid" theme="red" size="sm" @click="handleRetry">
                <FeatherIcon name="refresh-cw" class="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button variant="outline" theme="gray" size="sm" @click="handleBackToSelector">
                Back to Configurations
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Help Dialog -->
    <Dialog
      v-model="showHelp"
      :options="{
        title: 'Dynamic Timeline Help',
        size: 'large',
      }"
    >
      <template #body-content>
        <div class="space-y-6">
          <div>
            <h3 class="text-md font-semibold text-gray-900 mb-2">
              What is Dynamic Timeline?
            </h3>
            <p class="text-sm text-gray-600">
              Dynamic Timeline allows you to create flexible timeline views using any combination of DocTypes. 
              You can map different DocTypes to timeline rows, blocks, and dates to visualize your data in new ways.
            </p>
          </div>

          <div>
            <h3 class="text-md font-semibold text-gray-900 mb-2">
              How to Use
            </h3>
            <ol class="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Select a timeline configuration from the available options</li>
              <li>The timeline will load with your configured DocType mapping</li>
              <li>Drag and drop blocks between rows and dates to reassign them</li>
              <li>Click on blocks to open them in the desk document</li>
              <li>Use the date navigation to move through different time periods</li>
            </ol>
          </div>

          <div>
            <h3 class="text-md font-semibold text-gray-900 mb-2">
              Example Configurations
            </h3>
            <div class="space-y-3">
              <div class="bg-blue-50 rounded-lg p-3">
                <div class="font-medium text-blue-900 text-sm">
                  Workstation Planning
                </div>
                <div class="text-xs text-blue-700 mt-1">
                  Workstations (rows) → Work Orders (blocks) → Dates (columns)
                </div>
              </div>
              <div class="bg-green-50 rounded-lg p-3">
                <div class="font-medium text-green-900 text-sm">
                  Resource Scheduling
                </div>
                <div class="text-xs text-green-700 mt-1">
                  Resources (rows) → Bookings (blocks) → Dates (columns)
                </div>
              </div>
              <div class="bg-purple-50 rounded-lg p-3">
                <div class="font-medium text-purple-900 text-sm">
                  Team Planning
                </div>
                <div class="text-xs text-purple-700 mt-1">
                  Users (rows) → Tasks (blocks) → Dates (columns)
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Dialog>

    <!-- Settings Dialog -->
    <Dialog
      v-model="showSettings"
      :options="{
        title: 'Settings',
        size: 'small',
      }"
    >
      <template #body-content>
        <div class="space-y-4">
          <FormControl
            type="select"
            label="Default View Mode"
            v-model="defaultViewMode"
            :options="[
              { label: 'Week View', value: 'week' },
              { label: 'Month View', value: 'month' },
              { label: '2 Week View', value: 'biweek' }
            ]"
          />
          
          <FormControl
            type="checkbox"
            label="Auto-refresh timeline data"
            v-model="autoRefresh"
          />
          
          <FormControl
            type="checkbox"
            label="Show weekend columns"
            v-model="showWeekends"
          />
        </div>
      </template>
      <template #actions>
        <Button variant="outline" @click="showSettings = false">
          Cancel
        </Button>
        <Button variant="solid" theme="blue" @click="saveSettings">
          Save Settings
        </Button>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Button, FeatherIcon, Dialog, FormControl } from 'frappe-ui'
import ConfigurationSelector from '../components/Timeline/ConfigurationSelector.vue'
import DynamicTimeline from '../components/Timeline/DynamicTimeline.vue'

// Reactive state
const currentView = ref('selector') // 'selector', 'timeline', 'loading', 'error'
const selectedConfiguration = ref(null)
const errorMessage = ref('')
const showHelp = ref(false)
const showSettings = ref(false)

// Settings data
const defaultViewMode = ref('week')
const autoRefresh = ref(false)
const showWeekends = ref(true)

// Methods
const handleConfigurationSelected = (configuration) => {
  selectedConfiguration.value = configuration
  currentView.value = 'loading'
  
  // Simulate loading delay
  setTimeout(() => {
    currentView.value = 'timeline'
  }, 1000)
}

const handleBackToSelector = () => {
  currentView.value = 'selector'
  selectedConfiguration.value = null
  errorMessage.value = ''
}

const handleError = (error) => {
  errorMessage.value = error
  currentView.value = 'error'
}

const handleRetry = () => {
  if (selectedConfiguration.value) {
    currentView.value = 'loading'
    setTimeout(() => {
      currentView.value = 'timeline'
    }, 1000)
  } else {
    handleBackToSelector()
  }
}

const saveSettings = () => {
  try {
    // Save settings to localStorage
    localStorage.setItem('dynamicTimelineSettings', JSON.stringify({
      defaultViewMode: defaultViewMode.value,
      autoRefresh: autoRefresh.value,
      showWeekends: showWeekends.value
    }))
    
    showSettings.value = false
  } catch (error) {
    console.error('Error saving settings:', error)
    // Still close dialog even if save fails
    showSettings.value = false
  }
}

// Initialize
onMounted(() => {
  // Load settings from localStorage
  const savedSettings = localStorage.getItem('dynamicTimelineSettings')
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings)
      defaultViewMode.value = settings.defaultViewMode || 'week'
      autoRefresh.value = settings.autoRefresh || false
      showWeekends.value = settings.showWeekends !== undefined ? settings.showWeekends : true
    } catch (error) {
      console.error('Error loading settings:', error)
      // Reset to defaults if loading fails
      defaultViewMode.value = 'week'
      autoRefresh.value = false
      showWeekends.value = true
    }
  }
  
  // Check if there's a configuration in URL params
  const urlParams = new URLSearchParams(window.location.search)
  const configName = urlParams.get('config')
  
  if (configName) {
    // TODO: Load specific configuration from URL
    // This would be implemented to directly load and select a configuration
  }
})
</script>

<style scoped>
.dynamic-timeline-page {
  min-height: 100vh;
  background: #f8f9fa;
}

/* Smooth transitions */
.configuration-view,
.timeline-view,
.loading-view,
.error-view {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}
</style>