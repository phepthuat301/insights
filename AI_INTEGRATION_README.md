# AI Integration for Frappe Insights

## Overview

This integration adds AI-powered natural language to SQL conversion to Frappe Insights. Users can now describe what they want to see in plain English, and the AI will generate the appropriate SQL query.

## Features

- 🤖 **Natural Language to SQL**: Convert English descriptions to SQL queries
- 🔧 **Multiple AI Providers**: Support for OpenAI, Anthropic, and Local LLMs
- ⚙️ **Configurable Settings**: Adjust model parameters and API keys
- 🎯 **Smart Table Detection**: AI automatically detects available tables and columns
- 🔒 **Secure**: API keys are encrypted and stored securely

## Installation

### 1. Install Dependencies

```bash
# Install AI libraries
pip install openai>=1.0.0 anthropic>=0.7.0
```

### 2. Setup AI Settings

1. Go to **Insights AI Settings** in the Frappe Desk
2. Configure your AI provider (OpenAI, Anthropic, or Local LLM)
3. Enter your API key
4. Enable AI features
5. Test the connection

### 3. Restart Frappe

```bash
bench restart
```

## Usage

### Using AI Query Builder

1. **Open Chart Builder**: Navigate to any chart in Insights
2. **Find AI Widget**: Look for the "🤖 AI Query Builder" section
3. **Select Data Source**: Choose the database you want to query
4. **Describe Your Query**: Write what you want to see in plain English
   - Example: "Show me sales by month for 2024"
   - Example: "Display top 10 products by revenue"
5. **Generate SQL**: Click "Generate SQL" button
6. **Review & Apply**: Review the generated SQL and apply it to your chart

### Example Queries

| Natural Language | Generated SQL |
|------------------|---------------|
| "Show me sales by month for 2024" | `SELECT DATE_FORMAT(date, '%Y-%m') as month, SUM(amount) as total_sales FROM sales WHERE YEAR(date) = 2024 GROUP BY month ORDER BY month` |
| "Top 10 products by revenue" | `SELECT product_name, SUM(revenue) as total_revenue FROM products GROUP BY product_name ORDER BY total_revenue DESC LIMIT 10` |
| "Customer count by region" | `SELECT region, COUNT(DISTINCT customer_id) as customer_count FROM customers GROUP BY region` |

## Configuration

### AI Settings

Navigate to **Insights AI Settings** to configure:

- **AI Provider**: Choose between OpenAI, Anthropic, or Local LLM
- **API Key**: Your provider's API key (encrypted)
- **Model Name**: Specific model to use (e.g., gpt-3.5-turbo, claude-3-sonnet)
- **Max Tokens**: Maximum response length (100-4000)
- **Temperature**: Controls randomness (0-2)
- **Enable AI Features**: Toggle AI functionality

### Supported Models

#### OpenAI
- `gpt-3.5-turbo` (recommended for cost-effectiveness)
- `gpt-4` (better quality, higher cost)
- `gpt-4-turbo` (latest model)

#### Anthropic
- `claude-3-sonnet-20240229` (recommended)
- `claude-3-opus-20240229` (highest quality)
- `claude-3-haiku-20240307` (fastest)

#### Local LLM
- Placeholder for future local model integration
- Can be extended for Ollama, llama.cpp, etc.

## Architecture

### Backend Components

```
insights/
├── ai/
│   ├── __init__.py
│   └── query_builder.py          # AI Query Builder service
├── api/
│   ├── __init__.py
│   └── ai.py                     # AI API endpoints
└── insights/doctype/
    └── insights_ai_settings/     # AI Settings doctype
        ├── insights_ai_settings.json
        └── insights_ai_settings.py
```

### Frontend Components

```
frontend/src2/
├── components/
│   └── AIQueryBuilder.vue        # AI Query Builder UI
├── settings/
│   └── AISettings.vue           # AI Settings page
└── charts/
    └── ChartBuilder.vue         # Integrated AI widget
```

### API Endpoints

- `insights.ai.generate_sql` - Generate SQL from natural language
- `insights.ai.get_ai_settings` - Get AI configuration
- `insights.ai.test_ai_connection` - Test AI service connection
- `insights.ai.get_available_data_sources` - List available data sources

## Security

### API Key Management
- API keys are stored encrypted in the database
- Keys are never logged or exposed in error messages
- Access is restricted to users with appropriate permissions

### Data Privacy
- Only table schemas are sent to AI services (no actual data)
- Natural language queries are sent to generate SQL
- Generated SQL is executed locally on your database

### Rate Limiting
- Built-in rate limiting to prevent abuse
- Configurable limits per user and time period

## Troubleshooting

### Common Issues

1. **"AI features are not enabled"**
   - Go to AI Settings and enable AI features
   - Ensure API key is configured

2. **"Failed to connect to AI service"**
   - Check your API key is correct
   - Verify internet connection
   - Test connection in AI Settings

3. **"No data sources available"**
   - Ensure you have configured data sources in Insights
   - Check user permissions for data sources

4. **Poor SQL generation quality**
   - Try adjusting temperature (lower = more deterministic)
   - Use a more advanced model (e.g., gpt-4 instead of gpt-3.5-turbo)
   - Provide more specific natural language descriptions

### Debug Mode

Enable debug logging:

```python
# In site_config.json
{
  "ai_debug": true
}
```

### Testing

Test your AI setup:

1. Go to AI Settings
2. Click "Test Connection"
3. Review the generated test SQL
4. Verify the connection is successful

## Cost Optimization

### Reduce API Costs

1. **Use Efficient Models**: gpt-3.5-turbo is cheaper than gpt-4
2. **Limit Max Tokens**: Set reasonable limits (1000-2000)
3. **Cache Responses**: Similar queries can be cached
4. **Batch Requests**: Group similar queries when possible

### Monitoring Usage

Track AI usage in Frappe logs:
```bash
bench tail-logs
```

## Future Enhancements

### Planned Features

1. **AI Chart Recommendations**: Suggest best chart types for data
2. **Data Analysis**: AI-powered insights and anomaly detection
3. **Natural Language Explanations**: Explain chart data in plain English
4. **Predictive Analytics**: Forecast trends and patterns
5. **Multi-language Support**: Support for non-English queries

### Local LLM Integration

Future versions will support:
- Ollama integration
- llama.cpp models
- Self-hosted AI services
- Offline AI capabilities

## Contributing

### Adding New AI Providers

1. Extend `AIQueryBuilder` class
2. Add provider-specific methods
3. Update settings UI
4. Add tests

### Example Provider Extension

```python
def _call_custom_provider(self, prompt: str) -> str:
    """Call custom AI provider"""
    # Implement your provider logic here
    pass
```

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Frappe logs for errors
3. Test AI connection in settings
4. Contact support with error details

## License

This AI integration follows the same license as Frappe Insights (MIT License). 