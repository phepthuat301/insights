<template>
  <div class="ai-query-builder">
    <div class="ai-header">
      <div class="ai-icon">🤖</div>
      <h3>AI Query Builder</h3>
      <button 
        v-if="!isExpanded" 
        @click="isExpanded = true"
        class="expand-btn"
      >
        <span>Try AI</span>
      </button>
    </div>

    <div v-if="isExpanded" class="ai-content">
      <!-- Uses the chart's selected query; no data source selector -->

      <!-- Natural Language Input -->
      <div class="form-group">
        <label>Describe what you want to see:</label>
        <textarea 
          v-model="naturalQuery" 
          placeholder="e.g., Show me sales by month for 2024, or Display top 10 products by revenue"
          class="form-control"
          rows="3"
        />
      </div>

      <!-- Generate Button -->
      <div class="form-group">
        <button 
          @click="generateQuery" 
          :disabled="!canGenerate"
          class="generate-btn"
        >
          <span v-if="isGenerating">Generating...</span>
          <span v-else>Generate SQL</span>
        </button>
      </div>

      <!-- Generated SQL -->
      <div v-if="generatedSQL" class="generated-sql">
        <h4>Generated SQL:</h4>
        <div class="sql-container">
          <pre>{{ generatedSQL }}</pre>
          <button @click="copySQL" class="copy-btn">Copy</button>
        </div>
        
        <div class="sql-actions">
          <button @click="applyToChart" class="apply-btn">
            Apply to Chart
          </button>
          <button @click="createNewQuery" class="new-query-btn">
            Create New Query
          </button>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="error-message">
        <span>❌ {{ error }}</span>
      </div>

      <!-- AI Settings Link -->
      <div class="ai-settings-link">
        <a href="#" @click="openAISettings">
          Configure AI Settings
        </a>
      </div>

      <!-- Close Button -->
      <button @click="isExpanded = false" class="close-btn">
        ✕
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { call } from 'frappe-ui'

const props = defineProps({
  chart: Object,
  workbook: Object
})

const emit = defineEmits(['query-generated', 'sql-applied'])

// Reactive data
const isExpanded = ref(false)
const naturalQuery = ref('')
const generatedSQL = ref('')
const error = ref('')
const isGenerating = ref(false)
const resolvedDataSource = ref('')

// Computed
const canGenerate = computed(() => {
  return Boolean(props.chart?.doc?.query) && naturalQuery.value.trim() && !isGenerating.value
})

function getSelectedQueryName() {
  return props.chart?.doc?.query || ''
}

async function generateQuery() {
  if (!canGenerate.value) return

  isGenerating.value = true
  error.value = ''
  generatedSQL.value = ''

  try {
    const result = await call('insights.ai.generate_sql_from_query', {
      natural_query: naturalQuery.value,
      query_name: getSelectedQueryName()
    })

    if (result.success) {
      generatedSQL.value = result.sql
      resolvedDataSource.value = result.data_source || ''
      emit('query-generated', {
        sql: result.sql,
        natural_query: result.natural_query,
        data_source: result.data_source,
        query_name: getSelectedQueryName()
      })
    } else {
      error.value = result.error || 'Failed to generate SQL'
    }
  } catch (err) {
    error.value = 'Failed to connect to AI service'
    console.error('AI Query Generation Error:', err)
  } finally {
    isGenerating.value = false
  }
}

function copySQL() {
  if (generatedSQL.value) {
    navigator.clipboard.writeText(generatedSQL.value)
  }
}

function applyToChart() {
  if (generatedSQL.value && props.chart) {
    emit('sql-applied', {
      sql: generatedSQL.value,
      data_source: resolvedDataSource.value,
      chart: props.chart,
    })
  }
}

function createNewQuery() {
  if (generatedSQL.value) {
    window.location.href = `/insights/query/new?sql=${encodeURIComponent(generatedSQL.value)}`
  }
}

function openAISettings() {
  window.open('/app/insights-ai-settings', '_blank')
}
</script>

<style scoped>
.ai-query-builder {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  margin: 1rem 0;
}

.ai-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 0.5rem;
}

.ai-icon {
  font-size: 1.5rem;
}

.ai-header h3 {
  margin: 0;
  flex: 1;
  font-size: 1rem;
  font-weight: 600;
}

.expand-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.expand-btn:hover {
  background: #2563eb;
}

.ai-content {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  position: relative;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.generate-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  width: 100%;
}

.generate-btn:hover:not(:disabled) {
  background: #059669;
}

.generate-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.generated-sql {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.generated-sql h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
}

.sql-container {
  position: relative;
  background: #1f2937;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.sql-container pre {
  color: #f3f4f6;
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
}

.copy-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #374151;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
}

.copy-btn:hover {
  background: #4b5563;
}

.sql-actions {
  display: flex;
  gap: 0.5rem;
}

.apply-btn, .new-query-btn {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 0.875rem;
}

.apply-btn {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.apply-btn:hover {
  background: #2563eb;
}

.new-query-btn:hover {
  background: #f9fafb;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  color: #dc2626;
  font-size: 0.875rem;
}

.ai-settings-link {
  margin-top: 1rem;
  text-align: center;
}

.ai-settings-link a {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.875rem;
}

.ai-settings-link a:hover {
  text-decoration: underline;
}

.close-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #6b7280;
}

.close-btn:hover {
  color: #374151;
}
</style> 