import frappe
from frappe import _

@frappe.whitelist()
def save_user_with_default_password(doc, action):
    """Custom save method that sets default password for new users"""
    try:
        print("save_user_with_default_password")
        # Parse the document
        if isinstance(doc, str):
            doc = frappe.parse_json(doc)
        
        # Check if this is a new user
        is_new = doc.get("__islocal") or not frappe.db.exists("User", doc.get("name"))
        
        # Disable welcome email to avoid email configuration issues
        if is_new:
            doc["send_welcome_email"] = 0
        
        # Save the user first
        user_doc = frappe.get_doc(doc)
        user_doc.save()
        
        # If it's a new user, set default password
        if is_new:
            default_password = "Welcome123!"
            frappe.set_password(user_doc.name, default_password)
            
            # Log the default password
            frappe.logger().info(f"Default password set for new user {user_doc.name}: {default_password}")
            
            frappe.msgprint(_("User created successfully with default password: {0}").format(default_password))
        
        return user_doc.name
        
    except Exception as e:
        frappe.logger().error(f"Error saving user with default password: {str(e)}")
        frappe.throw(f"Failed to save user: {str(e)}")
