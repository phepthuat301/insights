# Copyright (c) 2025, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from insights.ai.query_builder import AIQueryBuilder


@frappe.whitelist()
def generate_sql(natural_query: str, data_source: str):
    """Generate SQL from natural language query"""
    try:
        ai_builder = AIQueryBuilder()
        result = ai_builder.natural_to_sql(natural_query, data_source)
        
        if "error" in result:
            return {"success": False, "error": result["error"]}
        
        return {
            "success": True,
            "sql": result["sql"],
            "natural_query": result["natural_query"],
            "data_source": result["data_source"]
        }
        
    except Exception as e:
        frappe.log_error(f"AI Generate SQL Error: {str(e)}")
        return {"success": False, "error": str(e)}


@frappe.whitelist()
def get_ai_settings():
    """Get AI settings"""
    try:
        from insights.insights.doctype.insights_ai_settings.insights_ai_settings import InsightsAISettings
        settings = InsightsAISettings.get_settings()
        
        return {
            "success": True,
            "settings": {
                "ai_provider": settings.ai_provider,
                "model_name": settings.model_name,
                "enable_ai_features": settings.enable_ai_features,
                "max_tokens": settings.max_tokens,
                "temperature": settings.temperature,
                "has_api_key": bool(settings.api_key)
            }
        }
        
    except Exception as e:
        frappe.log_error(f"Get AI Settings Error: {str(e)}")
        return {"success": False, "error": str(e)}


@frappe.whitelist()
def test_ai_connection():
    """Test AI connection with a simple query"""
    try:
        ai_builder = AIQueryBuilder()
        
        # Test with a simple query
        result = ai_builder.natural_to_sql(
            "Show me the first 5 records", 
            "test_data_source"
        )
        
        if "error" in result:
            return {"success": False, "error": result["error"]}
        
        return {
            "success": True,
            "message": "AI connection successful",
            "test_sql": result["sql"]
        }
        
    except Exception as e:
        frappe.log_error(f"Test AI Connection Error: {str(e)}")
        return {"success": False, "error": str(e)}


@frappe.whitelist()
def get_available_data_sources():
    """Get list of available data sources for AI"""
    try:
        data_sources = frappe.get_all(
            "Insights Data Source v3",
            fields=["name", "title", "database_type"]
        )
        
        return {
            "success": True,
            "data_sources": data_sources
        }
        
    except Exception as e:
        frappe.log_error(f"Get Data Sources Error: {str(e)}")
        return {"success": False, "error": str(e)} 