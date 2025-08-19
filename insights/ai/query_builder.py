import frappe
import json
from typing import Optional, Dict, Any


class AIQueryBuilder:
    def __init__(self):
        self.settings = self._get_ai_settings()
    
    def _get_ai_settings(self):
        """Get AI settings from database"""
        try:
            from insights.insights.doctype.insights_ai_settings.insights_ai_settings import InsightsAISettings
            return InsightsAISettings.get_settings()
        except:
            return None
    
    def natural_to_sql(self, natural_query: str, data_source: str) -> Dict[str, Any]:
        """Convert natural language to SQL using AI"""
        if not self.settings or not self.settings.enable_ai_features:
            return {"error": "AI features are not enabled"}
        
        try:
            # Get available tables and columns
            tables_info = self._get_tables_info(data_source)
            
            # Create prompt for AI
            prompt = self._create_prompt(natural_query, tables_info)
            
            # Call AI service
            response = self._call_ai_service(prompt)
            
            return {
                "sql": response,
                "natural_query": natural_query,
                "data_source": data_source
            }
            
        except Exception as e:
            frappe.log_error(f"AI Query Builder Error: {str(e)}")
            return {"error": f"Failed to generate SQL: {str(e)}"}
    
    def _get_tables_info(self, data_source: str) -> str:
        """Get information about available tables and columns"""
        try:
            # Get data source
            ds = frappe.get_doc("Insights Data Source v3", data_source)
            
            # Get tables
            tables = frappe.get_all(
                "Insights Table",
                filters={"data_source": data_source},
                fields=["name", "table", "label"]
            )
            
            tables_info = []
            for table in tables:
                # Get columns for each table
                columns = frappe.get_all(
                    "Insights Table Column",
                    filters={"parent": table.name},
                    fields=["column", "label", "type"]
                )
                
                table_info = f"Table: {table.label} ({table.table})\n"
                table_info += "Columns:\n"
                for col in columns:
                    table_info += f"  - {col.label} ({col.column}): {col.type}\n"
                
                tables_info.append(table_info)
            
            return "\n".join(tables_info)
            
        except Exception as e:
            frappe.log_error(f"Error getting tables info: {str(e)}")
            return "Tables information not available"
    
    def _create_prompt(self, natural_query: str, tables_info: str) -> str:
        """Create prompt for AI service"""
        return f"""
You are an expert SQL query generator. Convert the following natural language query to SQL.

Available tables and columns:
{tables_info}

Natural language query: "{natural_query}"

Generate a valid SQL query that answers this question. Return only the SQL query, no explanations.

SQL Query:
"""
    
    def _call_ai_service(self, prompt: str) -> str:
        """Call AI service (OpenAI, Anthropic, etc.)"""
        if not self.settings.api_key:
            return "SELECT 1"  # Fallback query
        
        try:
            if self.settings.ai_provider == "OpenAI":
                return self._call_openai(prompt)
            elif self.settings.ai_provider == "Anthropic":
                return self._call_anthropic(prompt)
            else:
                return self._call_local_llm(prompt)
        except Exception as e:
            frappe.log_error(f"AI Service Error: {str(e)}")
            return "SELECT 1"  # Fallback query
    
    def _call_openai(self, prompt: str) -> str:
        """Call OpenAI API"""
        try:
            import openai
            
            openai.api_key = self.settings.api_key
            
            response = openai.ChatCompletion.create(
                model=self.settings.model_name or "gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert SQL query generator. Return only valid SQL queries."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=self.settings.max_tokens or 1000,
                temperature=self.settings.temperature or 0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except ImportError:
            frappe.throw("OpenAI library not installed. Run: pip install openai")
        except Exception as e:
            frappe.log_error(f"OpenAI API Error: {str(e)}")
            return "SELECT 1"
    
    def _call_anthropic(self, prompt: str) -> str:
        """Call Anthropic API"""
        try:
            import anthropic
            
            client = anthropic.Anthropic(api_key=self.settings.api_key)
            
            response = client.messages.create(
                model=self.settings.model_name or "claude-3-sonnet-20240229",
                max_tokens=self.settings.max_tokens or 1000,
                temperature=self.settings.temperature or 0.7,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            return response.content[0].text.strip()
            
        except ImportError:
            frappe.throw("Anthropic library not installed. Run: pip install anthropic")
        except Exception as e:
            frappe.log_error(f"Anthropic API Error: {str(e)}")
            return "SELECT 1"
    
    def _call_local_llm(self, prompt: str) -> str:
        """Call local LLM (placeholder for future implementation)"""
        # This is a placeholder for local LLM integration
        # You can implement Ollama, llama.cpp, or other local models here
        return "SELECT 1"  # Fallback for now 