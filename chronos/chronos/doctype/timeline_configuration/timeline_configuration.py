# Copyright (c) 2025, ONFUSE AG and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class TimelineConfiguration(Document):
	def validate(self):
		"""Validate the timeline configuration"""
		self.validate_doctypes()
		self.validate_field_mappings()
	
	def validate_doctypes(self):
		"""Validate that the specified DocTypes exist"""
		if not frappe.db.exists("DocType", self.row_doctype):
			frappe.throw(f"Row DocType '{self.row_doctype}' does not exist")
		
		if not frappe.db.exists("DocType", self.block_doctype):
			frappe.throw(f"Block DocType '{self.block_doctype}' does not exist")
	
	def validate_field_mappings(self):
		"""Validate that the specified fields exist in their respective DocTypes"""
		# Validate row doctype fields
		row_meta = frappe.get_meta(self.row_doctype)
		if not row_meta.get_field(self.row_label_field):
			frappe.throw(f"Field '{self.row_label_field}' does not exist in DocType '{self.row_doctype}'")
		
		# Validate block doctype fields
		block_meta = frappe.get_meta(self.block_doctype)
		
		required_block_fields = [
			self.row_to_block_field,
			self.block_to_date_field,
			self.block_label_field
		]
		
		for field in required_block_fields:
			if not block_meta.get_field(field):
				frappe.throw(f"Field '{field}' does not exist in DocType '{self.block_doctype}'")
		
		# Validate optional fields if specified
		optional_fields = [
			self.block_color_field,
			self.date_range_start_field,
			self.date_range_end_field,
			self.block_duration_field,
			self.block_status_field,
			self.block_priority_field
		]
		
		for field in optional_fields:
			if field and not block_meta.get_field(field):
				frappe.throw(f"Optional field '{field}' does not exist in DocType '{self.block_doctype}'")
	
	def get_configuration_metadata(self):
		"""Get metadata about the configuration including field types"""
		row_meta = frappe.get_meta(self.row_doctype)
		block_meta = frappe.get_meta(self.block_doctype)
		
		return {
			"name": self.name,
			"configuration_name": self.configuration_name,
			"description": self.description,
			"is_active": self.is_active,
			"row_doctype": self.row_doctype,
			"block_doctype": self.block_doctype,
			"field_mappings": {
				"row_to_block_field": self.row_to_block_field,
				"block_to_date_field": self.block_to_date_field,
				"row_label_field": self.row_label_field,
				"block_label_field": self.block_label_field,
				"block_color_field": self.block_color_field,
				"date_range_start_field": self.date_range_start_field,
				"date_range_end_field": self.date_range_end_field,
				"block_duration_field": self.block_duration_field,
				"block_status_field": self.block_status_field,
				"block_priority_field": self.block_priority_field
			},
			"row_meta": {
				"fields": [{"name": f.fieldname, "type": f.fieldtype, "label": f.label} 
						  for f in row_meta.fields if f.fieldname not in ["name", "owner", "creation", "modified", "modified_by", "docstatus"]]
			},
			"block_meta": {
				"fields": [{"name": f.fieldname, "type": f.fieldtype, "label": f.label} 
						  for f in block_meta.fields if f.fieldname not in ["name", "owner", "creation", "modified", "modified_by", "docstatus"]]
			}
		}

@frappe.whitelist()
def get_available_configurations():
	"""Get all active timeline configurations"""
	configurations = frappe.get_all(
		"Timeline Configuration",
		filters={"is_active": 1},
		fields=["name", "configuration_name", "description", "row_doctype", "block_doctype"],
		order_by="configuration_name"
	)
	
	return configurations

@frappe.whitelist()
def get_configuration_metadata(configuration_name):
	"""Get detailed metadata for a specific configuration"""
	try:
		config = frappe.get_doc("Timeline Configuration", configuration_name)
		return config.get_configuration_metadata()
	except frappe.DoesNotExistError:
		frappe.throw(f"Timeline Configuration '{configuration_name}' does not exist")

@frappe.whitelist()
def get_doctype_fields(doctype):
	"""Get fields for a specific DocType (helper for configuration setup)"""
	if not frappe.db.exists("DocType", doctype):
		frappe.throw(f"DocType '{doctype}' does not exist")
	
	meta = frappe.get_meta(doctype)
	fields = []
	
	for field in meta.fields:
		if field.fieldname not in ["name", "owner", "creation", "modified", "modified_by", "docstatus"]:
			fields.append({
				"name": field.fieldname,
				"type": field.fieldtype,
				"label": field.label or field.fieldname,
				"options": field.options
			})
	
	return fields

@frappe.whitelist()
def validate_configuration_fields(row_doctype, block_doctype, field_mappings):
	"""Validate field mappings before saving configuration"""
	try:
		# Check if DocTypes exist
		if not frappe.db.exists("DocType", row_doctype):
			return {"valid": False, "error": f"Row DocType '{row_doctype}' does not exist"}
		
		if not frappe.db.exists("DocType", block_doctype):
			return {"valid": False, "error": f"Block DocType '{block_doctype}' does not exist"}
		
		# Get DocType metadata
		row_meta = frappe.get_meta(row_doctype)
		block_meta = frappe.get_meta(block_doctype)
		
		# Validate required fields
		if field_mappings.get("row_label_field") and not row_meta.get_field(field_mappings["row_label_field"]):
			return {"valid": False, "error": f"Field '{field_mappings['row_label_field']}' does not exist in '{row_doctype}'"}
		
		required_block_fields = ["row_to_block_field", "block_to_date_field", "block_label_field"]
		for field_key in required_block_fields:
			field_name = field_mappings.get(field_key)
			if field_name and not block_meta.get_field(field_name):
				return {"valid": False, "error": f"Field '{field_name}' does not exist in '{block_doctype}'"}
		
		# Validate optional fields
		optional_fields = ["block_color_field", "date_range_start_field", "date_range_end_field", 
						  "block_duration_field", "block_status_field", "block_priority_field"]
		for field_key in optional_fields:
			field_name = field_mappings.get(field_key)
			if field_name and not block_meta.get_field(field_name):
				return {"valid": False, "error": f"Optional field '{field_name}' does not exist in '{block_doctype}'"}
		
		return {"valid": True, "message": "Configuration is valid"}
		
	except Exception as e:
		return {"valid": False, "error": str(e)}

@frappe.whitelist()
def setup_sample_configurations():
	"""Create sample timeline configurations for testing"""
	from .setup_sample_configurations import setup_job_card_system
	
	try:
		setup_job_card_system()
		return {"success": True, "message": "Sample configurations created successfully"}
	except Exception as e:
		return {"success": False, "error": str(e)}