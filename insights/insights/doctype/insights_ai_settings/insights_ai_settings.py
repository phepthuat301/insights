# Copyright (c) 2025, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class InsightsAISettings(Document):
    # begin: auto-generated types
    # This code is auto-generated. Do not modify anything in this block.

    from typing import TYPE_CHECKING

    if TYPE_CHECKING:
        from frappe.types import DF

        ai_provider: DF.Literal["OpenAI", "Anthropic", "Local LLM"]
        api_key: DF.Password | None
        enable_ai_features: DF.Check
        max_tokens: DF.Int
        model_name: DF.Data | None
        temperature: DF.Float
    # end: auto-generated types

    def validate(self):
        if self.enable_ai_features and not self.api_key:
            frappe.throw("API Key is required when AI features are enabled")

    @staticmethod
    def get_settings():
        """Get AI settings, create default if not exists"""
        settings = frappe.get_all("Insights AI Settings", limit=1)
        if settings:
            return frappe.get_doc("Insights AI Settings", settings[0].name)
        else:
            # Create default settings
            doc = frappe.new_doc("Insights AI Settings")
            doc.insert()
            return doc 