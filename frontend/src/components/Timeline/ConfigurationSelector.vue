<template>
  <div class="configuration-selector">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Choose Timeline View
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        Select a timeline configuration to visualize your data in different ways
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3">
        <div
          class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
        ></div>
        <span class="text-gray-600 dark:text-gray-400"
          >Loading configurations...</span
        >
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
    >
      <div class="flex items-center gap-2">
        <FeatherIcon name="alert-circle" class="w-5 h-5 text-red-500" />
        <span class="text-red-700 dark:text-red-400 font-medium"
          >Error loading configurations</span
        >
      </div>
      <p class="text-red-600 dark:text-red-300 text-sm mt-1">{{ error }}</p>
      <Button
        variant="outline"
        theme="red"
        size="sm"
        class="mt-3"
        @click="loadConfigurations"
      >
        <FeatherIcon name="refresh-cw" class="w-4 h-4 mr-2" />
        Retry
      </Button>
    </div>

    <!-- Empty State -->
    <div v-else-if="configurations.length === 0" class="text-center py-12">
      <div
        class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <FeatherIcon name="calendar" class="w-8 h-8 text-gray-400" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No Timeline Configurations
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        Create a timeline configuration to get started
      </p>
      <!-- <Button
        variant="solid"
        theme="blue"
        @click="createSampleConfiguration"
        :loading="creatingSample"
      >
        <FeatherIcon name="plus" class="w-4 h-4 mr-2" />
        Create Sample Configuration
      </Button> -->
    </div>

    <!-- Configuration Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="config in configurations"
        :key="config.name"
        class="configuration-card group cursor-pointer bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
        @click="selectConfiguration(config)"
      >
        <!-- Card Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center"
            >
              <FeatherIcon name="grid" class="w-5 h-5 text-white" />
            </div>
            <div>
              <h3
                class="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
              >
                {{ config.configuration_name }}
              </h3>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ config.row_doctype }} → {{ config.block_doctype }}
                </span>
              </div>
            </div>
          </div>

          <!-- Arrow Icon -->
          <FeatherIcon
            name="arrow-right"
            class="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200"
          />
        </div>

        <!-- Description -->
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {{
            config.description ||
            `Timeline view showing ${config.block_doctype} blocks organized by ${config.row_doctype}`
          }}
        </p>

        <!-- Configuration Details -->
        <div class="space-y-2">
          <div
            class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"
          >
            <FeatherIcon name="layers" class="w-3 h-3" />
            <span>Rows: {{ config.row_doctype }}</span>
          </div>
          <div
            class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"
          >
            <FeatherIcon name="square" class="w-3 h-3" />
            <span>Blocks: {{ config.block_doctype }}</span>
          </div>
        </div>

        <!-- Hover Effect -->
        <div
          class="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        ></div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div
      class="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-center gap-3">
        <Button
          variant="outline"
          theme="gray"
          @click="loadConfigurations"
          :loading="loading"
        >
          <FeatherIcon name="refresh-cw" class="w-4 h-4 mr-2" />
          Refresh
        </Button>

        <!-- <Button
          variant="outline"
          theme="blue"
          @click="createSampleConfiguration"
          :loading="creatingSample"
        >
          <FeatherIcon name="plus" class="w-4 h-4 mr-2" />
          Create Sample
        </Button> -->
      </div>

      <div class="text-sm text-gray-500 dark:text-gray-400">
        {{ configurations.length }} configuration{{
          configurations.length !== 1 ? "s" : ""
        }}
        available
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Button, FeatherIcon } from "frappe-ui";
import { call } from "frappe-ui";
import { toast } from "../../composables/useToast";

const emit = defineEmits(["configurationSelected"]);

// Reactive state
const configurations = ref([]);
const loading = ref(false);
const error = ref(null);
const creatingSample = ref(false);

// Methods
const loadConfigurations = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await call("chronos.api.timeline_data.get_timeline_configurations");
    configurations.value = response || [];
  } catch (err) {
    error.value = err.message || "Failed to load configurations";
    console.error("Error loading configurations:", err);
  } finally {
    loading.value = false;
  }
};

const selectConfiguration = (config) => {
  emit("configurationSelected", config);
};

const createSampleConfiguration = async () => {
  creatingSample.value = true;
  try {
    const response = await call("chronos.chronos.doctype.timeline_configuration.timeline_configuration.setup_sample_configurations");
    if (response.success) {
      toast.success("Sample configurations created successfully");
      await loadConfigurations();
    } else {
      toast.error(response.error || "Failed to create sample configurations");
    }
  } catch (err) {
    toast.error(err.message || "Failed to create sample configurations");
    console.error("Error creating sample configurations:", err);
  } finally {
    creatingSample.value = false;
  }
};


// Initialize
onMounted(() => {
  loadConfigurations();
});
</script>

<style scoped>
.configuration-selector {
  max-width: 72rem;
  margin: 0 auto;
  padding: 1.5rem;
}

.configuration-card {
  position: relative;
  overflow: hidden;
}

.configuration-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.05), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.configuration-card:hover::before {
  transform: translateX(100%);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Animation for loading state */
@keyframes pulse-subtle {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-pulse-subtle {
  animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .configuration-selector {
    padding: 1rem;
  }

  .configuration-card {
    padding: 1rem;
  }
}
</style>