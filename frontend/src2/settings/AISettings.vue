<template>
  <div class="ai-settings-page">
    <div class="page-header">
      <h1>AI Settings</h1>
      <p>Configure AI features for natural language query generation</p>
    </div>

    <div class="settings-form">
      <div class="form-section">
        <h3>AI Provider Configuration</h3>
        
        <div class="form-group">
          <label>AI Provider</label>
          <select v-model="settings.ai_provider" class="form-control">
            <option value="OpenAI">OpenAI</option>
            <option value="Anthropic">Anthropic</option>
            <option value="Local LLM">Local LLM</option>
          </select>
        </div>

        <div class="form-group">
          <label>API Key</label>
          <input 
            v-model="settings.api_key" 
            type="password" 
            class="form-control"
            placeholder="Enter your API key"
          />
          <small class="help-text">
            Your API key is encrypted and stored securely
          </small>
        </div>

        <div class="form-group">
          <label>Model Name</label>
          <input 
            v-model="settings.model_name" 
            type="text" 
            class="form-control"
            :placeholder="getModelPlaceholder()"
          />
        </div>
      </div>

      <div class="form-section">
        <h3>AI Parameters</h3>
        
        <div class="form-group">
          <label>Max Tokens</label>
          <input 
            v-model.number="settings.max_tokens" 
            type="number" 
            class="form-control"
            min="100"
            max="4000"
          />
          <small class="help-text">
            Maximum number of tokens in the response (100-4000)
          </small>
        </div>

        <div class="form-group">
          <label>Temperature</label>
          <input 
            v-model.number="settings.temperature" 
            type="number" 
            class="form-control"
            min="0"
            max="2"
            step="0.1"
          />
          <small class="help-text">
            Controls randomness (0 = deterministic, 2 = very random)
          </small>
        </div>
      </div>

      <div class="form-section">
        <h3>Feature Toggle</h3>
        
        <div class="form-group">
          <label class="checkbox-label">
            <input 
              v-model="settings.enable_ai_features" 
              type="checkbox"
            />
            Enable AI Features
          </label>
          <small class="help-text">
            Enable natural language to SQL conversion
          </small>
        </div>
      </div>

      <div class="form-actions">
        <button @click="saveSettings" :disabled="isSaving" class="save-btn">
          <span v-if="isSaving">Saving...</span>
          <span v-else>Save Settings</span>
        </button>
        
        <button @click="testConnection" :disabled="isTesting" class="test-btn">
          <span v-if="isTesting">Testing...</span>
          <span v-else>Test Connection</span>
        </button>
      </div>

      <!-- Test Results -->
      <div v-if="testResult" class="test-result">
        <div :class="['result-message', testResult.success ? 'success' : 'error']">
          <span v-if="testResult.success">✅</span>
          <span v-else>❌</span>
          {{ testResult.message }}
        </div>
        <div v-if="testResult.test_sql" class="test-sql">
          <h4>Test SQL Generated:</h4>
          <pre>{{ testResult.test_sql }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { call } from 'frappe-ui'

const settings = ref({
  ai_provider: 'OpenAI',
  api_key: '',
  model_name: 'gpt-3.5-turbo',
  enable_ai_features: false,
  max_tokens: 1000,
  temperature: 0.7
})

const isSaving = ref(false)
const isTesting = ref(false)
const testResult = ref(null)

function getModelPlaceholder() {
  switch (settings.value.ai_provider) {
    case 'OpenAI':
      return 'gpt-3.5-turbo, gpt-4, etc.'
    case 'Anthropic':
      return 'claude-3-sonnet-20240229, claude-3-opus-20240229, etc.'
    case 'Local LLM':
      return 'llama2, mistral, etc.'
    default:
      return 'Enter model name'
  }
}

async function loadSettings() {
  try {
    const result = await call('insights.ai.get_ai_settings')
    if (result.success) {
      settings.value = {
        ...settings.value,
        ...result.settings
      }
    }
  } catch (err) {
    console.error('Failed to load AI settings:', err)
  }
}

async function saveSettings() {
  isSaving.value = true
  try {
    // Save settings to database
    await call('frappe.client.set_value', {
      doctype: 'Insights AI Settings',
      name: 'Insights AI Settings', // Assuming single settings record
      fieldname: settings.value
    })
    
    // Show success message
    console.log('Settings saved successfully')
  } catch (err) {
    console.error('Failed to save settings:', err)
  } finally {
    isSaving.value = false
  }
}

async function testConnection() {
  isTesting.value = true
  testResult.value = null
  
  try {
    const result = await call('insights.ai.test_ai_connection')
    testResult.value = result
  } catch (err) {
    testResult.value = {
      success: false,
      message: 'Failed to test connection: ' + err.message
    }
  } finally {
    isTesting.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.ai-settings-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #6b7280;
  font-size: 1rem;
}

.settings-form {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f3f4f6;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.form-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.help-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #f3f4f6;
}

.save-btn, .test-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-btn {
  background: #3b82f6;
  color: white;
  flex: 1;
}

.save-btn:hover:not(:disabled) {
  background: #2563eb;
}

.test-btn {
  background: #10b981;
  color: white;
  flex: 1;
}

.test-btn:hover:not(:disabled) {
  background: #059669;
}

.save-btn:disabled, .test-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.test-result {
  margin-top: 2rem;
  padding: 1rem;
  border-radius: 6px;
}

.result-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.result-message.success {
  color: #059669;
  background: #f0fdf4;
  padding: 0.75rem;
  border: 1px solid #bbf7d0;
  border-radius: 4px;
}

.result-message.error {
  color: #dc2626;
  background: #fef2f2;
  padding: 0.75rem;
  border: 1px solid #fecaca;
  border-radius: 4px;
}

.test-sql {
  background: #1f2937;
  border-radius: 4px;
  padding: 1rem;
}

.test-sql h4 {
  color: #f3f4f6;
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
}

.test-sql pre {
  color: #f3f4f6;
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
}
</style> 