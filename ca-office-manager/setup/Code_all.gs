// ======== Config.gs ========
/**
 * Config.gs - constants, database schema, roles, permissions, enums.
 * CA Office Work Management System (Google Apps Script + Sheets + Drive + Gmail)
 */
var APP = { NAME: 'CA Office Work Management System', VERSION: '1.0.0', SCHEMA_VERSION: 1, TZ: 'Asia/Kolkata', TZ_OFFSET: '+05:30' };

var ROLES = {
  ADMIN: 'Firm Administrator', MANAGING_PARTNER: 'Managing Partner', PARTNER: 'Partner',
  SENIOR: 'Senior Employee / Reviewer', CLERK: 'Articled Clerk', ACCOUNTS: 'Accounts / Office Administrator'
};

var TASK_STATUSES = ['Draft', 'Assigned', 'Acknowledged', 'Not Started', 'In Progress', 'Waiting for Client Documents', 'Blocked',
  'Submitted for Review', 'Under Review', 'Correction Required', 'Resubmitted', 'Approved', 'Completed', 'On Hold', 'Cancelled'];
var OPEN_STATUSES = ['Draft', 'Assigned', 'Acknowledged', 'Not Started', 'In Progress', 'Waiting for Client Documents', 'Blocked',
  'Submitted for Review', 'Under Review', 'Correction Required', 'Resubmitted', 'On Hold'];
var PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
var TIME_CATEGORIES = ['TASK', 'BREAK', 'MEETING', 'TRAINING', 'CLIENT_VISIT', 'ADMIN', 'DOC_COLLECTION', 'OTHER'];
var PIPELINE = ['Lead', 'Contacted', 'Proposal Sent', 'Awaiting Confirmation', 'Engagement Accepted', 'Onboarding Pending', 'Active Client', 'Temporarily Inactive', 'Closed'];
var FILE_STATUSES = ['Received', 'In Office', 'Assigned to Employee', 'Sent to Partner', 'Sent to Client', 'Sent to External Office', 'In Transit', 'Returned', 'Archived', 'Lost or Exception Reported'];
var FILE_OUT_STATUSES = ['Sent to Client', 'Sent to External Office', 'In Transit'];
var RECURRENCE = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUAL'];
var ENTITY_TYPES = ['Individual', 'Proprietorship', 'Partnership Firm', 'LLP', 'Private Limited', 'Public Limited', 'OPC', 'HUF', 'Trust / Society', 'AOP / BOI', 'Other'];
var COMPLIANCE_CATEGORIES = ['GST', 'TDS and TCS', 'Income Tax Returns', 'Tax Audit', 'Advance Tax', 'MCA and ROC', 'PF and ESI', 'Professional Tax', 'Payroll', 'Accounting and Bookkeeping', 'Financial Statements', 'Audit Assignments', 'Other'];
var LEAVE_TYPES = ['Casual', 'Sick', 'Earned', 'Study', 'Exam', 'Loss of Pay', 'Other'];
var PAYMENT_MODES = ['Bank Transfer', 'UPI', 'Cheque', 'Cash', 'Card', 'Other'];

/* ---------------- Permission catalogue ---------------- */
var PERMS = {
  'user.manage': 'Create, edit and deactivate users and permissions',
  'settings.manage': 'Firm profile, settings, services, templates, integration register',
  'client.view': 'View authorised clients',
  'client.edit': 'Create and edit clients',
  'client.sensitive': 'See full PAN / GSTIN / TAN identifiers',
  'client.import': 'Import and export clients (CSV)',
  'task.view': 'View authorised tasks',
  'task.create': 'Create tasks',
  'task.assign': 'Assign and reassign tasks',
  'task.bulk': 'Bulk create / reassign / change due dates',
  'task.work': 'Work on assigned tasks (acknowledge, status, submit)',
  'task.review': 'Review submitted work as senior reviewer',
  'task.approve': 'Give final partner approval',
  'task.manage_recurring': 'Maintain recurring rules and templates',
  'instruction.write': 'Write or revise task instructions',
  'time.log': 'Record own time',
  'time.view_team': 'View time logs of authorised staff',
  'time.correct': 'Correct time logs (with reason)',
  'report.team': 'Reports for authorised clients and staff',
  'report.firm': 'Firm-wide reports and dashboards',
  'fees.view': 'View fee agreements, invoices, receipts',
  'fees.edit': 'Create invoices and fee agreements',
  'receipt.edit': 'Record receipts and allocations',
  'followup.edit': 'Maintain fee follow-up register',
  'files.view': 'View physical file register',
  'files.edit': 'Maintain physical file movements',
  'docs.view': 'View and download authorised documents',
  'docs.upload': 'Upload documents',
  'email.draft': 'Draft client emails',
  'email.approve': 'Approve queued client emails',
  'email.send': 'Send approved client emails',
  'attendance.view_team': 'View attendance of authorised staff',
  'leave.approve': 'Approve or reject leave',
  'compliance.view': 'View compliance calendar and records',
  'compliance.manage': 'Maintain compliance calendar',
  'announce.post': 'Post internal announcements',
  'audit.view': 'View audit logs',
  'backup.manage': 'Run backups, exports and trigger installation'
};

var ALL_PERMS = Object.keys(PERMS);

var DEFAULT_ROLE_PERMS = {
  ADMIN: ALL_PERMS.slice(),
  MANAGING_PARTNER: ['client.view', 'client.edit', 'client.sensitive', 'client.import', 'task.view', 'task.create', 'task.assign', 'task.bulk', 'task.review', 'task.approve',
    'task.manage_recurring', 'instruction.write', 'time.log', 'time.view_team', 'time.correct', 'report.team', 'report.firm', 'fees.view', 'fees.edit', 'receipt.edit', 'followup.edit', 'files.view', 'files.edit',
    'docs.view', 'docs.upload', 'email.draft', 'email.approve', 'email.send', 'attendance.view_team', 'leave.approve', 'compliance.view', 'compliance.manage', 'announce.post'],
  PARTNER: ['client.view', 'client.edit', 'client.sensitive', 'task.view', 'task.create', 'task.assign', 'task.bulk', 'task.review', 'task.approve', 'task.manage_recurring', 'instruction.write',
    'time.log', 'time.view_team', 'time.correct', 'report.team', 'fees.view', 'followup.edit', 'files.view', 'files.edit', 'docs.view', 'docs.upload', 'email.draft', 'email.approve', 'email.send',
    'attendance.view_team', 'leave.approve', 'compliance.view', 'compliance.manage', 'announce.post'],
  SENIOR: ['client.view', 'task.view', 'task.create', 'task.assign', 'task.work', 'task.review', 'instruction.write', 'time.log', 'time.view_team', 'report.team',
    'files.view', 'docs.view', 'docs.upload', 'email.draft', 'compliance.view'],
  CLERK: ['client.view', 'task.view', 'task.work', 'time.log', 'docs.view', 'docs.upload', 'compliance.view', 'files.view'],
  ACCOUNTS: ['client.view', 'fees.view', 'fees.edit', 'receipt.edit', 'followup.edit', 'files.view', 'files.edit', 'docs.view', 'docs.upload', 'email.draft', 'compliance.view', 'time.log']
};

/* ---------------- Schema ---------------- */
// Column spec: 'name' = text, 'name:n' = number. Audit columns are appended automatically.
var AUDIT_COLS = ['created_at', 'created_by', 'updated_at', 'updated_by', 'is_active'];
var SCHEMA = {};
function t_(name, pfx, pk, cols, opt) {
  opt = opt || {};
  var cc = [], num = {};
  cols.forEach(function (c) { var p = c.split(':'); cc.push(p[0]); if (p[1] === 'n') num[p[0]] = true; });
  if (pk.indexOf(':n') > -1) pk = pk.split(':')[0];
  SCHEMA[name] = { name: name, pfx: pfx, pk: pk, cols: cc, num: num, req: opt.req || [], fk: opt.fk || {}, enums: opt.enums || {}, uniq: opt.uniq || [], noPkGen: !!opt.noPkGen, sensitive: opt.sensitive || [] };
}

t_('Settings', 'S', 'key', ['value', 'description'], { noPkGen: true, req: ['key'] });
t_('Messages', 'MG', 'message_id', ['thread_id', 'parent_id', 'sender_id', 'subject', 'body', 'priority', 'sent_at'], { req: ['sender_id', 'body'], enums: { priority: ['Normal', 'Urgent'] }, fk: { sender_id: 'Users' } });
t_('MessageRecipients', 'MR', 'id', ['message_id', 'thread_id', 'user_id', 'read_at'], { req: ['message_id', 'user_id'], fk: { message_id: 'Messages', user_id: 'Users' } });
t_('Users', 'U', 'user_id', ['full_name', 'email', 'role', 'employee_code', 'partner_id', 'reporting_manager_id', 'joining_date', 'employment_status', 'department', 'contact_number', 'client_access', 'deactivated_on'],
  { req: ['full_name', 'email', 'role'], enums: { role: Object.keys(ROLES), client_access: ['ASSIGNED', 'ALL'] }, uniq: [['email']], fk: { partner_id: 'Users', reporting_manager_id: 'Users' } });
t_('Credentials', 'C', 'user_id', ['salt', 'hash', 'rounds:n', 'activation_hash', 'activation_expires', 'failed_count:n', 'locked_until', 'must_change', 'last_login', 'last_password_change'], { noPkGen: true, fk: { user_id: 'Users' } });
t_('Roles', 'R', 'role', ['label', 'description'], { noPkGen: true });
t_('Permissions', 'P', 'perm', ['description'], { noPkGen: true });
t_('RolePermissions', 'RP', 'id', ['role', 'perm', 'effect'], { req: ['role', 'perm'], enums: { effect: ['GRANT', 'DENY'] } });
t_('UserPermissions', 'UP', 'id', ['user_id', 'perm', 'effect', 'reason'], { req: ['user_id', 'perm', 'effect'], enums: { effect: ['GRANT', 'DENY'] }, fk: { user_id: 'Users' } });
t_('UserClientAccess', 'UC', 'id', ['user_id', 'client_id', 'access_level'], { req: ['user_id', 'client_id'], fk: { user_id: 'Users', client_id: 'Clients' } });
t_('Partners', 'PT', 'user_id', ['display_name', 'membership_no', 'specialization', 'can_approve'], { noPkGen: true, fk: { user_id: 'Users' } });
t_('Employees', 'EM', 'user_id', ['designation', 'articleship_start', 'articleship_end', 'work_hours_per_day:n', 'cost_per_hour:n'], { noPkGen: true, fk: { user_id: 'Users' } });
t_('Clients', 'CL', 'client_id', ['client_code', 'name', 'entity_type', 'pan', 'gstin', 'tan', 'cin_llpin', 'address', 'state', 'contact_person', 'email', 'mobile',
  'partner_id', 'senior_id', 'clerk_id', 'fy', 'engagement_start', 'engagement_end', 'agreed_fee:n', 'billing_frequency', 'folder_id', 'status', 'pipeline_stage', 'proposal_date', 'renewal_date', 'internal_remarks'],
  { req: ['name', 'entity_type'], enums: { pipeline_stage: PIPELINE, entity_type: ENTITY_TYPES }, fk: { partner_id: 'Users', senior_id: 'Users', clerk_id: 'Users' }, sensitive: ['pan', 'gstin', 'tan', 'cin_llpin', 'mobile'] });
t_('ClientContacts', 'CC', 'contact_id', ['client_id', 'name', 'designation', 'email', 'mobile', 'is_primary'], { req: ['client_id', 'name'], fk: { client_id: 'Clients' } });
t_('ClientServices', 'CS', 'id', ['client_id', 'service_id', 'fy', 'fee:n', 'frequency', 'status'], { req: ['client_id', 'service_id'], fk: { client_id: 'Clients', service_id: 'ServiceCategories' } });
t_('ServiceCategories', 'SV', 'service_id', ['code', 'name', 'category', 'description', 'default_est_hours:n'], { req: ['name'], uniq: [['name']] });
t_('TaskTemplates', 'TT', 'template_id', ['name', 'service_id', 'title_pattern', 'description', 'instructions', 'est_hours:n', 'priority', 'requires_senior_review', 'requires_partner_approval', 'checklist', 'default_due_offset_days:n'],
  { req: ['name'], fk: { service_id: 'ServiceCategories' } });
t_('RecurringTaskRules', 'RR', 'rule_id', ['name', 'template_id', 'client_id', 'frequency', 'due_offset_days:n', 'start_date', 'end_date', 'partner_id', 'senior_id', 'clerk_id', 'last_period_key', 'status'],
  { req: ['template_id', 'client_id', 'frequency', 'start_date'], enums: { frequency: RECURRENCE }, fk: { template_id: 'TaskTemplates', client_id: 'Clients', partner_id: 'Users', senior_id: 'Users', clerk_id: 'Users' } });
t_('Tasks', 'TK', 'task_id', ['task_no', 'client_id', 'fy', 'ay', 'service_id', 'title', 'description', 'instructions', 'partner_id', 'senior_id', 'priority', 'status', 'assigned_date', 'start_date', 'due_date',
  'est_hours:n', 'template_id', 'rule_id', 'period_key', 'billing_ref', 'invoice_id', 'in_retainer', 'out_of_scope', 'requires_senior_review', 'requires_partner_approval', 'review_stage', 'submission_no:n', 'completed_date', 'hold_reason', 'parent_task_id'],
  { req: ['client_id', 'title', 'due_date'], enums: { status: TASK_STATUSES, priority: PRIORITIES }, fk: { client_id: 'Clients', service_id: 'ServiceCategories', partner_id: 'Users', senior_id: 'Users', template_id: 'TaskTemplates', rule_id: 'RecurringTaskRules', parent_task_id: 'Tasks' } });
t_('TaskAssignments', 'TA', 'assignment_id', ['task_id', 'user_id', 'role_in_task', 'assigned_by', 'assigned_at', 'ack_at', 'released_at', 'reason'],
  { req: ['task_id', 'user_id'], enums: { role_in_task: ['PRIMARY', 'TEAM'] }, fk: { task_id: 'Tasks', user_id: 'Users' } });
t_('TaskDependencies', 'TD', 'id', ['task_id', 'depends_on_task_id'], { req: ['task_id', 'depends_on_task_id'], fk: { task_id: 'Tasks', depends_on_task_id: 'Tasks' } });
t_('TaskChecklistItems', 'TC', 'item_id', ['task_id', 'seq:n', 'text', 'mandatory', 'done', 'done_by', 'done_at'], { req: ['task_id', 'text'], fk: { task_id: 'Tasks' } });
t_('TaskInstructions', 'TI', 'instruction_id', ['task_id', 'version:n', 'author_id', 'text', 'previous_text', 'reason', 'urgent', 'expected_deliverable', 'attachment_refs'], { req: ['task_id', 'text'], fk: { task_id: 'Tasks' } });
t_('TaskComments', 'TM', 'comment_id', ['task_id', 'parent_id', 'author_id', 'text', 'kind', 'mentions', 'attachment_refs', 'is_internal'], { req: ['task_id', 'text'], enums: { kind: ['COMMENT', 'NOTE', 'QUESTION', 'REPLY', 'REVIEW'] }, fk: { task_id: 'Tasks' } });
t_('TaskReviews', 'TV', 'review_id', ['task_id', 'submission_no:n', 'stage', 'reviewer_id', 'outcome', 'remarks', 'reviewed_at'],
  { req: ['task_id', 'outcome'], enums: { outcome: ['Approved', 'Correction Required', 'Rejected', 'More Information Required', 'On Hold'], stage: ['SENIOR', 'PARTNER'] }, fk: { task_id: 'Tasks' } });
t_('TaskHistory', 'TH', 'history_id', ['task_id', 'event', 'from_status', 'to_status', 'actor_id', 'detail', 'at'], { req: ['task_id', 'event'], fk: { task_id: 'Tasks' } });
t_('TimeLogs', 'TL', 'log_id', ['user_id', 'task_id', 'client_id', 'log_date', 'start_ts', 'end_ts', 'minutes:n', 'category', 'description', 'source', 'state', 'session_id', 'corrected'],
  { req: ['user_id', 'category'], enums: { category: TIME_CATEGORIES, state: ['RUNNING', 'STOPPED'] }, fk: { user_id: 'Users', task_id: 'Tasks' } });
t_('TimeCorrections', 'TX', 'correction_id', ['log_id', 'requested_by', 'old_start', 'old_end', 'old_minutes:n', 'new_start', 'new_end', 'new_minutes:n', 'reason', 'status', 'decided_by', 'decided_at', 'decision_remarks'],
  { req: ['log_id', 'reason'], enums: { status: ['Pending', 'Approved', 'Rejected', 'Applied'] }, fk: { log_id: 'TimeLogs' } });
t_('Attendance', 'AT', 'att_id', ['user_id', 'att_date', 'check_in', 'check_out', 'break_minutes:n', 'hours:n', 'status', 'remarks', 'approval_status'], { req: ['user_id', 'att_date'], fk: { user_id: 'Users' } });
t_('LeaveRequests', 'LV', 'leave_id', ['user_id', 'leave_type', 'from_date', 'to_date', 'days:n', 'reason', 'approver_id', 'status', 'decided_at', 'decision_remarks'],
  { req: ['user_id', 'leave_type', 'from_date', 'to_date'], enums: { status: ['Pending', 'Approved', 'Rejected', 'Cancelled'] }, fk: { user_id: 'Users' } });
t_('ComplianceCalendar', 'CD', 'calendar_id', ['category', 'name', 'form_ref', 'period_label', 'fy', 'due_date', 'adjust_days:n', 'status', 'source_note', 'verified_by', 'verified_on'],
  { req: ['category', 'name', 'due_date'], enums: { status: ['UNVERIFIED', 'VERIFIED'] } });
t_('ComplianceRecords', 'CR', 'record_id', ['calendar_id', 'client_id', 'task_id', 'status', 'responsible_user', 'ack_no', 'filed_date', 'evidence_doc_id', 'docs_missing', 'remarks'],
  { req: ['calendar_id', 'client_id'], enums: { status: ['Pending', 'Docs Awaited', 'In Progress', 'Filed', 'Not Applicable'] }, fk: { calendar_id: 'ComplianceCalendar', client_id: 'Clients' } });
t_('FeeAgreements', 'FA', 'agreement_id', ['client_id', 'partner_id', 'service_id', 'agreed_fee:n', 'billing_frequency', 'effective_date', 'renewal_date', 'tax_treatment', 'payment_terms', 'remarks', 'status'],
  { req: ['client_id', 'agreed_fee'], fk: { client_id: 'Clients', partner_id: 'Users', service_id: 'ServiceCategories' } });
t_('Invoices', 'IV', 'invoice_id', ['client_id', 'invoice_type', 'invoice_no', 'invoice_date', 'due_date', 'service_desc', 'taxable_value:n', 'tax_type', 'tax_rate_pct:n', 'tax_amount:n', 'total:n', 'task_id', 'status', 'partner_id', 'cancel_reason', 'doc_ref', 'fy'],
  { req: ['client_id', 'invoice_type', 'taxable_value'], enums: { invoice_type: ['TAX', 'PROFORMA'], status: ['DRAFT', 'ISSUED', 'CANCELLED'], tax_type: ['CGST_SGST', 'IGST', 'NONE'] }, fk: { client_id: 'Clients', task_id: 'Tasks', partner_id: 'Users' } });
t_('InvoiceItems', 'II', 'item_id', ['invoice_id', 'description', 'sac', 'qty:n', 'rate:n', 'amount:n', 'task_id'], { req: ['invoice_id', 'description'], fk: { invoice_id: 'Invoices', task_id: 'Tasks' } });
t_('Receipts', 'RC', 'receipt_id', ['client_id', 'receipt_no', 'receipt_date', 'amount:n', 'mode', 'txn_ref', 'bank_ref', 'status', 'cancel_reason', 'remarks'],
  { req: ['client_id', 'receipt_date', 'amount'], enums: { status: ['ACTIVE', 'CANCELLED'] }, fk: { client_id: 'Clients' } });
t_('ReceiptAllocations', 'RA', 'allocation_id', ['receipt_id', 'invoice_id', 'amount:n', 'status', 'reversed_reason'],
  { req: ['receipt_id', 'invoice_id', 'amount'], enums: { status: ['ACTIVE', 'REVERSED'] }, fk: { receipt_id: 'Receipts', invoice_id: 'Invoices' } });
t_('Adjustments', 'AJ', 'adjustment_id', ['client_id', 'invoice_id', 'adj_type', 'adj_date', 'amount:n', 'reason', 'status'],
  { req: ['client_id', 'invoice_id', 'adj_type', 'amount', 'reason'], enums: { adj_type: ['CREDIT_NOTE', 'WRITE_OFF', 'DEBIT_ADJUSTMENT'], status: ['ACTIVE', 'CANCELLED'] }, fk: { client_id: 'Clients', invoice_id: 'Invoices' } });
t_('FeeFollowUps', 'FF', 'followup_id', ['client_id', 'invoice_id', 'outstanding:n', 'followup_date', 'method', 'contact_person', 'summary', 'promised_date', 'promised_amount:n', 'next_followup_date', 'assigned_to', 'partner_id', 'status'],
  { req: ['client_id', 'followup_date'], enums: { status: ['Open', 'Promised', 'Paid', 'Closed'] }, fk: { client_id: 'Clients', invoice_id: 'Invoices', assigned_to: 'Users', partner_id: 'Users' } });
t_('PhysicalFiles', 'PF', 'file_id', ['file_ref_no', 'client_id', 'fy', 'description', 'file_type', 'received_date', 'received_from', 'current_custodian_id', 'current_custodian_name', 'current_location', 'status', 'expected_return_date', 'dispatch_date', 'remarks'],
  { req: ['client_id', 'description'], enums: { status: FILE_STATUSES }, fk: { client_id: 'Clients', current_custodian_id: 'Users' } });
t_('FileMovements', 'FM', 'movement_id', ['file_id', 'seq:n', 'from_name', 'from_user_id', 'to_name', 'to_user_id', 'from_location', 'to_location', 'purpose', 'dispatch_date', 'expected_return_date', 'status_after', 'ack_by', 'ack_at', 'return_date', 'remarks'],
  { req: ['file_id'], fk: { file_id: 'PhysicalFiles', from_user_id: 'Users', to_user_id: 'Users' } });
t_('Documents', 'DC', 'doc_id', ['client_id', 'task_id', 'fy', 'category', 'description', 'file_name', 'drive_file_id', 'drive_folder_id', 'mime', 'size:n', 'uploaded_by', 'upload_date', 'version_ref', 'confidentiality', 'access_class'],
  { req: ['client_id', 'description'], enums: { confidentiality: ['Normal', 'Confidential', 'Restricted'] }, fk: { client_id: 'Clients', task_id: 'Tasks' } });
t_('ChecklistTemplates', 'CT', 'template_id', ['name', 'service_id', 'items'], { req: ['name', 'items'], fk: { service_id: 'ServiceCategories' } });
t_('DocumentRequests', 'DR', 'request_id', ['client_id', 'task_id', 'title', 'requested_by', 'requested_date', 'due_date', 'contact_id', 'status', 'template_id'],
  { req: ['client_id', 'title'], enums: { status: ['Open', 'Partially Received', 'Complete', 'Cancelled'] }, fk: { client_id: 'Clients', task_id: 'Tasks', contact_id: 'ClientContacts' } });
t_('DocumentRequestItems', 'DI', 'item_id', ['request_id', 'name', 'required', 'requested_date', 'received_date', 'verification_status', 'status', 'doc_id', 'remarks'],
  { req: ['request_id', 'name'], enums: { status: ['Requested', 'Received', 'Incomplete', 'Not Applicable'], verification_status: ['Pending', 'Verified', 'Issue'] }, fk: { request_id: 'DocumentRequests', doc_id: 'Documents' } });
t_('EmailTemplates', 'ET', 'code', ['name', 'subject', 'body', 'approval_level'], { noPkGen: true, req: ['code', 'name', 'subject', 'body'], enums: { approval_level: ['NONE', 'SENIOR', 'PARTNER'] } });
t_('EmailQueue', 'EQ', 'queue_id', ['client_id', 'task_id', 'template_code', 'to_email', 'cc_email', 'subject', 'body', 'status', 'approval_level', 'drafted_by', 'approved_by', 'approved_at', 'sent_at', 'attempts:n', 'last_error', 'dedupe_key', 'attachment_refs'],
  { req: ['to_email', 'subject', 'body'], enums: { status: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENDING', 'SENT', 'FAILED', 'REJECTED'] }, fk: { client_id: 'Clients', task_id: 'Tasks' } });
t_('EmailLogs', 'EL', 'log_id', ['queue_id', 'client_id', 'task_id', 'to_email', 'subject', 'status', 'error', 'sent_by', 'sent_at'], { req: ['queue_id'] });
t_('Notifications', 'NT', 'notification_id', ['user_id', 'type', 'title', 'message', 'ref_type', 'ref_id', 'is_read', 'read_at', 'dedupe_key'], { req: ['user_id', 'title'], fk: { user_id: 'Users' } });
t_('InternalAnnouncements', 'AN', 'announcement_id', ['title', 'message', 'audience_role', 'posted_by', 'posted_at', 'expires_on'], { req: ['title', 'message'] });
t_('ClientOnboarding', 'CO', 'id', ['client_id', 'stage', 'entered_at', 'by_user', 'notes'], { req: ['client_id', 'stage'], fk: { client_id: 'Clients' } });
t_('AuditLogs', 'AL', 'audit_id', ['ts', 'user_id', 'user_role', 'action', 'module', 'record_type', 'record_id', 'previous_value', 'new_value', 'reason', 'status'], { req: ['action'] });
t_('IntegrationRegister', 'IR', 'integration', ['provider', 'purpose', 'status', 'auth_requirements', 'expected_cost', 'data_permissions', 'security_implications', 'rate_limits', 'setup_instructions', 'fallback_process'], { noPkGen: true });
t_('BackupLogs', 'BL', 'backup_id', ['started_at', 'finished_at', 'kind', 'status', 'target', 'detail', 'run_by'], {});

var SHEET_ORDER = Object.keys(SCHEMA);

/** Default settings (key, value, description). Statutory dates / rates are NOT hard-coded. */
var DEFAULT_SETTINGS = [
  ['firm_name', 'Demo CA Firm', 'Name shown in the header and on reports'],
  ['firm_address', '', 'Firm address'],
  ['firm_email', '', 'Firm email (reply-to for client emails)'],
  ['firm_gstin', '', 'Firm GSTIN used on tax invoices (validate before real use)'],
  ['firm_state', '', 'Firm state (to decide CGST+SGST vs IGST)'],
  ['firm_city', '', 'Firm city'],
  ['firm_pincode', '', 'Firm pincode (6 digits)'],
  ['firm_pan', '', 'Firm PAN'],
  ['firm_frn', '', 'ICAI firm registration number (optional)'],
  ['firm_contact', '', 'Contact person for Techmin and clients'],
  ['firm_phone', '', 'Firm mobile number (10 digits)'],
  ['registry_id', '', 'Firm id issued by Techmin when the firm registered (set automatically)'],
  ['registry_key', '', 'Secret key for the Techmin account (set automatically; never shown)'],
  ['work_hours_per_day', '8', 'Scheduled working hours per day'],
  ['work_days', '1,2,3,4,5,6', 'Working weekdays (0=Sun..6=Sat). Default Mon-Sat'],
  ['holidays', '', 'Comma-separated holiday dates yyyy-mm-dd'],
  ['ageing_buckets', '30,60,90', 'Ageing bucket upper bounds in days'],
  ['ageing_basis', 'INVOICE_DATE', 'INVOICE_DATE or DUE_DATE'],
  ['default_tax_rate_pct', '18', 'Default tax rate on invoices - maintained by admin, verify before use'],
  ['invoice_prefix_TAX', 'INV', 'Tax invoice number prefix'],
  ['invoice_prefix_PROFORMA', 'PRO', 'Proforma invoice number prefix'],
  ['receipt_prefix', 'RCT', 'Receipt number prefix'],
  ['deadline_reminder_days', '3', 'Notify assignee this many days before due date'],
  ['review_escalation_days', '2', 'Escalate to partner when review pending this long'],
  ['file_return_grace_days', '0', 'Grace days before a file is reported overdue'],
  ['email_default_approval', 'PARTNER', 'Default approval level for client emails: NONE, SENIOR or PARTNER'],
  ['email_domain_allow', '', 'Optional comma-separated allowed recipient domains (blank = any)'],
  ['max_download_mb', '20', 'Largest document that can be opened through the app'],
  ['session_hours', '6', 'Login session length in hours (max 6 for the script cache)'],
  ['backup_retention', '10', 'Number of database backups to retain'],
  ['root_folder_id', '', 'Google Drive root folder id (set by setupApplication)'],
  ['backup_folder_id', '', 'Google Drive backup folder id'],
  ['open_registration', 'Y', 'Y lets visitors register themselves and receive an activation key by email; N closes registration'],
  ['registration_approval', 'Y', 'Y: self-registered users wait for administrator approval before they can sign in'],
  ['registration_default_role', 'CLERK', 'Role given to self-registered users: CLERK, SENIOR or ACCOUNTS'],
  ['mail_from', '', 'Optional send-as address for system emails (must be a Gmail alias of the account that owns this workspace); blank = the account own address'],
  ['mail_from_name', '', 'Display name on system emails; blank = firm name'],
  ['app_url', 'https://tools.complypro.co.in/ca-office-manager/', 'Web address of the page staff open (used in activation emails; the workspace address is added automatically)'],
  ['demo_mode', 'N', 'Y when fictional demo data is loaded'],
  ['schema_version', String(APP.SCHEMA_VERSION), 'Database schema version']
];

var DEFAULT_SERVICES = [
  ['GST-RET', 'GST Returns', 'GST', 'Monthly / quarterly GST returns', 3], ['TDS-RET', 'TDS Returns', 'TDS and TCS', 'Quarterly TDS statements', 4],
  ['ITR', 'Income Tax Return', 'Income Tax Returns', 'Return of income', 6], ['TAX-AUD', 'Tax Audit', 'Tax Audit', 'Tax audit and report', 30],
  ['ROC', 'ROC Compliance', 'MCA and ROC', 'Annual filings with ROC', 8], ['PFESI', 'PF and ESI Returns', 'PF and ESI', 'Monthly PF / ESI', 2],
  ['PROF-TAX', 'Professional Tax', 'Professional Tax', 'Professional tax returns', 1], ['PAYROLL', 'Payroll Processing', 'Payroll', 'Monthly payroll', 5],
  ['BOOKS', 'Accounting and Bookkeeping', 'Accounting and Bookkeeping', 'Maintenance of books', 10], ['FS', 'Financial Statements', 'Financial Statements', 'Preparation of financial statements', 12],
  ['AUDIT', 'Statutory Audit', 'Audit Assignments', 'Statutory audit', 40]
];

var DEFAULT_CHECKLISTS = [
  ['GST monthly records', 'GST-RET', 'Sales invoices|R;Purchase invoices|R;Credit / debit notes|O;Bank statement|R;E-way bill data|O'],
  ['TDS return information', 'TDS-RET', 'Deductee list with PAN|R;Challan details|R;Salary / contractor payment register|R'],
  ['Income tax return documents', 'ITR', 'Form 16 / income proofs|R;Bank statements|R;Investment proofs|O;Capital gain statements|O;AIS / 26AS access|O'],
  ['Payroll data', 'PAYROLL', 'Attendance and leave|R;New joiners / leavers|R;Salary revisions|O;Loan / advance recoveries|O'],
  ['Statutory audit evidence', 'AUDIT', 'Trial balance|R;Bank statements and reconciliations|R;Fixed asset register|R;Debtors and creditors confirmations|R;Stock statement|O']
];

var DEFAULT_EMAIL_TEMPLATES = [
  ['REQ_PURCHASE', 'Request for purchase invoices', 'Purchase invoices required for {{period}} - {{client_name}}', 'Dear {{contact_person}},\n\nPlease share the purchase invoices for {{period}} so that we can complete {{service}} before the due date ({{due_date}}).\n\nRegards,\n{{sender_name}}\n{{firm_name}}', 'PARTNER'],
  ['REQ_SALES', 'Request for sales invoices', 'Sales invoices required for {{period}} - {{client_name}}', 'Dear {{contact_person}},\n\nPlease share the sales invoices for {{period}}.\n\nRegards,\n{{sender_name}}\n{{firm_name}}', 'PARTNER'],
  ['REQ_BANK', 'Request for bank statements', 'Bank statements required - {{client_name}}', 'Dear {{contact_person}},\n\nPlease share the bank statements for {{period}}.\n\nRegards,\n{{sender_name}}\n{{firm_name}}', 'PARTNER'],
  ['REQ_PAYROLL', 'Request for payroll information', 'Payroll information for {{period}} - {{client_name}}', 'Dear {{contact_person}},\n\nPlease share attendance, joiners, leavers and any salary changes for {{period}}.\n\nRegards,\n{{sender_name}}\n{{firm_name}}', 'PARTNER'],
  ['MISSING_DOCS', 'Missing document reminder', 'Reminder: documents pending - {{client_name}}', 'Dear {{contact_person}},\n\nThe following documents are still pending:\n{{missing_list}}\n\nKindly share them at the earliest.\n\nRegards,\n{{sender_name}}\n{{firm_name}}', 'PARTNER'],
  ['REQ_GST', 'GST work information request', 'GST information required - {{client_name}}', 'Dear {{contact_person}},\n\nPlease share the information required for GST work for {{period}}.\n\nRegards,\n{{sender_name}}\n{{firm_name}}', 'PARTNER'],
  ['REQ_TDS', 'TDS information request', 'TDS information required - {{client_name}}', 'Dear {{contact_person}},\n\nPlease share the TDS details for {{period}}.\n\nRegards,\n{{sender_name}}\n{{firm_name}}', 'PARTNER'],
  ['REQ_ITR', 'Income tax return document request', 'Documents required for income tax return - {{client_name}}', 'Dear {{contact_person}},\n\nPlease share the documents required for the income tax return for {{fy}}.\n\nRegards,\n{{sender_name}}\n{{firm_name}}', 'PARTNER'],
  ['REQ_AUDIT', 'Audit document request', 'Audit documents required - {{client_name}}', 'Dear {{contact_person}},\n\nPlease share the documents required for the audit for {{fy}}.\n\nRegards,\n{{sender_name}}\n{{firm_name}}', 'PARTNER'],
  ['FEE_REMINDER', 'Professional fee reminder', 'Fee reminder - invoice {{invoice_no}}', 'Dear {{contact_person}},\n\nOur invoice {{invoice_no}} dated {{invoice_date}} for Rs. {{amount}} shows a balance of Rs. {{outstanding}}. Kindly arrange payment.\n\nRegards,\n{{sender_name}}\n{{firm_name}}', 'PARTNER'],
  ['DOC_RECEIPT', 'Confirmation of receipt of documents', 'Documents received - {{client_name}}', 'Dear {{contact_person}},\n\nWe confirm receipt of the documents you shared.\n\nRegards,\n{{sender_name}}\n{{firm_name}}', 'NONE'],
  ['WORK_DONE', 'Work completion communication', 'Work completed - {{client_name}}', 'Dear {{contact_person}},\n\nWe have completed {{service}} for {{period}}.\n\nRegards,\n{{sender_name}}\n{{firm_name}}', 'PARTNER'],
  ['GENERAL', 'General client correspondence', '{{subject}}', 'Dear {{contact_person}},\n\n{{message}}\n\nRegards,\n{{sender_name}}\n{{firm_name}}', 'PARTNER']
];

var DEFAULT_INTEGRATIONS = [
  ['Google Drive services through Apps Script', 'Google', 'Document storage', 'Core platform service', 'Google account authorisation', 'Free within Google quotas', 'Drive scope', 'Files private to owner account', 'Apps Script / Drive quotas', 'Run setupApplication and authorise', 'Manual upload to Drive folder'],
  ['Gmail services through Apps Script', 'Google', 'Client email', 'Core platform service', 'Google account authorisation', 'Free within Gmail daily quota', 'Gmail send scope', 'Sends as the script owner', 'Consumer ~100/day, Workspace ~1500/day (verify)', 'Authorise on first run', 'Draft and send manually'],
  ['Google Sheets services through Apps Script', 'Google', 'Database', 'Core platform service', 'Google account authorisation', 'Free', 'Spreadsheet scope', 'Sheet owner can read all data', '10M cells per spreadsheet', 'Created by setupApplication', 'CSV exports'],
  ['Dropbox', '', 'Not used', 'Not used', '', '', '', '', '', '', 'Use Google Drive'],
  ['GST portal APIs', '', 'Return status / data pull', 'Pending', '', '', '', '', '', '', 'Manual entry and CSV import'],
  ['Income Tax portal APIs', '', 'Filing status', 'Pending', '', '', '', '', '', '', 'Manual entry'],
  ['MCA APIs', '', 'Company master data', 'Pending', '', '', '', '', '', '', 'Manual entry'],
  ['Tally integration', '', 'Accounting data exchange', 'Pending', '', '', '', '', '', '', 'CSV import / export'],
  ['Payment gateway', '', 'Online fee collection', 'Pending', '', '', '', '', '', '', 'Record receipts manually'],
  ['WhatsApp Business API', '', 'Client messaging', 'Pending', '', '', '', '', '', '', 'Gmail'],
  ['SMS gateway', '', 'Alerts', 'Pending', '', '', '', '', '', '', 'In-app notifications and Gmail'],
  ['E-signature provider', '', 'Engagement letters', 'Pending', '', '', '', '', '', '', 'Print, sign and upload'],
  ['Paid AI services', '', 'Drafting / extraction', 'Pending', '', '', '', '', '', '', 'Templates'],
  ['External attendance systems', '', 'Biometric / GPS attendance', 'Pending', '', '', '', '', '', '', 'Manual check-in / check-out']
];


// ======== Util.gs ========
/** Util.gs - dates, ids, money, validation, text helpers. All business dates are IST. */
var Util = (function () {
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function now() { return Utilities.formatDate(new Date(), APP.TZ, "yyyy-MM-dd'T'HH:mm:ss"); }
  function today() { return Utilities.formatDate(new Date(), APP.TZ, 'yyyy-MM-dd'); }
  function parseTs(s) { return new Date(String(s).length <= 10 ? s + 'T00:00:00' + APP.TZ_OFFSET : s + APP.TZ_OFFSET); }
  function minutesBetween(a, b) { return Math.max(0, Math.round((parseTs(b) - parseTs(a)) / 60000)); }
  function addDays(d, n) { var x = new Date(String(d) + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.getUTCFullYear() + '-' + pad(x.getUTCMonth() + 1) + '-' + pad(x.getUTCDate()); }
  function diffDays(a, b) { return Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 86400000); }
  function dow(d) { return new Date(d + 'T12:00:00Z').getUTCDay(); }
  function isDate(s) { return /^\d{4}-\d{2}-\d{2}$/.test(String(s)) && !isNaN(new Date(s + 'T12:00:00Z')) && new Date(s + 'T12:00:00Z').toISOString().slice(0, 10) === s; }
  function monthEnd(y, m) { return y + '-' + pad(m) + '-' + pad(new Date(Date.UTC(y, m, 0)).getUTCDate()); }
  function fyOf(d) { var y = +d.slice(0, 4), m = +d.slice(5, 7); var s = m >= 4 ? y : y - 1; return s + '-' + pad((s + 1) % 100); }
  function fyStartYear(fy) { return parseInt(String(fy).slice(0, 4), 10); }
  function r2(x) { return Math.round((Number(x) + Number.EPSILON) * 100) / 100; }
  function paise(x) { return Math.round(Number(x || 0) * 100); }
  function fromPaise(p) { return p / 100; }
  function uid(pfx) { return pfx + '-' + Date.now().toString(36).toUpperCase() + Utilities.getUuid().replace(/-/g, '').slice(0, 5).toUpperCase(); }
  function csvCell(v) {
    var s = v === null || v === undefined ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // formula-injection guard
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function toCsv(cols, rows) {
    var out = [cols.map(csvCell).join(',')];
    rows.forEach(function (r) { out.push(cols.map(function (c) { return csvCell(r[c]); }).join(',')); });
    return out.join('\r\n');
  }
  function parseCsv(text) {
    var rows = [], row = [], cur = '', q = false, i, c;
    text = String(text || '').replace(/^﻿/, '');
    for (i = 0; i < text.length; i++) {
      c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"') q = true;
      else if (c === ',') { row.push(cur); cur = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); cur = ''; if (row.length > 1 || row[0] !== '') rows.push(row); row = []; }
      else cur += c;
    }
    if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
    return rows;
  }
  function clean(v, max) {
    if (v === null || v === undefined) return '';
    var s = String(v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
    s = s.trim();
    if (s.length > (max || 2000)) throw new AppError('VALIDATION', 'Text is too long (limit ' + (max || 2000) + ' characters).');
    return s;
  }
  function esc(s) { return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function sha256Hex(s) { return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8).map(function (b) { var h = (b < 0 ? b + 256 : b).toString(16); return h.length < 2 ? '0' + h : h; }).join(''); }
  function randHex(n) { var s = ''; while (s.length < n) s += Utilities.getUuid().replace(/-/g, ''); return s.slice(0, n); }
  function indexBy(arr, key) { var o = {}; arr.forEach(function (x) { o[x[key]] = x; }); return o; }
  function sum(arr, f) { var t = 0; arr.forEach(function (x) { t += Number(f ? f(x) : x) || 0; }); return t; }
  function groupBy(arr, f) { var o = {}; arr.forEach(function (x) { var k = f(x); (o[k] = o[k] || []).push(x); }); return o; }
  function inList(v, list) { return list.indexOf(v) > -1; }
  function splitIds(s) { return String(s || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean); }
  return { pad: pad, now: now, today: today, parseTs: parseTs, minutesBetween: minutesBetween, addDays: addDays, diffDays: diffDays, dow: dow, isDate: isDate, monthEnd: monthEnd, fyOf: fyOf, fyStartYear: fyStartYear,
    r2: r2, paise: paise, fromPaise: fromPaise, uid: uid, csvCell: csvCell, toCsv: toCsv, parseCsv: parseCsv, clean: clean, esc: esc, sha256Hex: sha256Hex, randHex: randHex, indexBy: indexBy, sum: sum, groupBy: groupBy, inList: inList, splitIds: splitIds };
})();

/** Error type whose message is safe to show to users. */
function AppError(code, message, details) { this.name = 'AppError'; this.code = code; this.message = message; this.details = details || null; this.stack = (new Error()).stack; }
AppError.prototype = Object.create(Error.prototype);
AppError.prototype.constructor = AppError;

var V = {
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]$/, GSTIN: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, TAN: /^[A-Z]{4}[0-9]{5}[A-Z]$/,
  EMAIL: /^[A-Za-z0-9._%+\-']+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/, MOBILE: /^[6-9][0-9]{9}$/,
  req: function (cond, msg) { if (!cond) throw new AppError('VALIDATION', msg); },
  date: function (s, label) { if (!Util.isDate(s)) throw new AppError('VALIDATION', (label || 'Date') + ' must be a valid date (yyyy-mm-dd).'); return s; },
  optDate: function (s, label) { if (s === '' || s === null || s === undefined) return ''; return V.date(s, label); },
  num: function (n, label, min, max) { var x = Number(n); if (!isFinite(x)) throw new AppError('VALIDATION', (label || 'Value') + ' must be a number.'); if (min !== undefined && x < min) throw new AppError('VALIDATION', (label || 'Value') + ' must be at least ' + min + '.'); if (max !== undefined && x > max) throw new AppError('VALIDATION', (label || 'Value') + ' must be at most ' + max + '.'); return x; },
  oneOf: function (v, list, label) { if (list.indexOf(v) < 0) throw new AppError('VALIDATION', (label || 'Value') + ' must be one of: ' + list.join(', ') + '.'); return v; },
  email: function (s, label) { s = Util.clean(s, 200); if (!V.EMAIL.test(s)) throw new AppError('VALIDATION', (label || 'Email') + ' is not a valid email address.'); return s.toLowerCase(); }
};


// ======== Database.gs ========
/**
 * Database.gs - Google Sheets data layer.
 * - One tab per entity, row number is never an identifier.
 * - Per-execution read cache, batched writes, LockService via DB.tx().
 * - Dates are stored as yyyy-mm-dd text, timestamps as yyyy-mm-ddTHH:mm:ss (IST) text; sheets are formatted as plain text.
 */
var DB = (function () {
  var ssObj = null, cache = {}, txDepth = 0, lockObj = null, memSeq = null, sheetCache = {}, pending = [];

  function ss() {
    if (!ssObj) {
      var id = PropertiesService.getScriptProperties().getProperty('DB_ID');
      if (!id) throw new AppError('SETUP', 'The database is not set up. Run setupApplication() once from the script editor.');
      ssObj = SpreadsheetApp.openById(id);
    }
    return ssObj;
  }
  function reset() { ssObj = null; cache = {}; sheetCache = {}; pending = []; }
  function def(name) { var d = SCHEMA[name]; if (!d) throw new Error('Unknown table ' + name); return d; }
  function headers(name) { var d = def(name); return [d.pk].concat(d.cols, AUDIT_COLS); }
  function sheet(name) { if (sheetCache[name]) return sheetCache[name]; var s = ss().getSheetByName(name); if (!s) throw new AppError('SETUP', 'Missing tab ' + name + '. Run setupApplication().'); sheetCache[name] = s; return s; }
  /** Row writes are queued and written together at the end of the transaction: neighbouring rows of one tab go out in a single call (much faster on Google Sheets). */
  function queue(name, row, arr) { pending.push({ n: name, r: row, a: arr }); }
  function flushWrites() {
    if (!pending.length) return;
    var list = pending, by = {}; pending = [];
    list.forEach(function (w) { (by[w.n] = by[w.n] || {})[w.r] = w.a; });
    Object.keys(by).forEach(function (n) {
      var rows = Object.keys(by[n]).map(Number).sort(function (a, b) { return a - b; }), i = 0;
      while (i < rows.length) { var j = i; while (j + 1 < rows.length && rows[j + 1] === rows[j] + 1) j++; var block = []; for (var k = i; k <= j; k++) block.push(by[n][rows[k]]); sheet(n).getRange(rows[i], 1, block.length, block[0].length).setValues(block); i = j + 1; }
    });
  }

  function norm(d, h, v) {
    if (v instanceof Date) return Utilities.formatDate(v, APP.TZ, "yyyy-MM-dd'T'HH:mm:ss");
    if (d.num[h]) { var n = Number(v); return isFinite(n) ? n : 0; }
    return v === null || v === undefined ? '' : String(v);
  }
  function load(name) {
    if (cache[name]) return cache[name];
    var d = def(name), h = headers(name), s = sheet(name), last = s.getLastRow(), rows = [], idx = {};
    if (last > 1) {
      var vals = s.getRange(2, 1, last - 1, h.length).getValues();
      for (var i = 0; i < vals.length; i++) {
        if (vals[i][0] === '' || vals[i][0] === null) continue;
        var o = {};
        for (var j = 0; j < h.length; j++) o[h[j]] = norm(d, h[j], vals[i][j]);
        o.__row = i + 2;
        rows.push(o); idx[o[d.pk]] = rows.length - 1;
      }
    }
    cache[name] = { rows: rows, idx: idx, h: h, nextRow: last + 1 };
    return cache[name];
  }
  function strip(o) { if (!o) return o; var c = {}; for (var k in o) if (k !== '__row') c[k] = o[k]; return c; }

  function all(name, includeInactive) {
    var r = load(name).rows;
    if (includeInactive) return r.map(strip);
    return r.filter(function (x) { return x.is_active !== 'N'; }).map(strip);
  }
  function get(name, id) { var c = load(name); var i = c.idx[id]; return i === undefined ? null : strip(c.rows[i]); }
  function where(name, pred) { return all(name).filter(pred); }
  function findOne(name, pred) { var r = all(name); for (var i = 0; i < r.length; i++) if (pred(r[i])) return r[i]; return null; }

  function tx(fn) {
    if (txDepth === 0) {
      lockObj = LockService.getScriptLock();
      if (!lockObj.tryLock(25000)) throw new AppError('BUSY', 'The system is busy with another update. Please try again in a few seconds.');
      cache = {};
    }
    txDepth++;
    try { return fn(); }
    finally {
      txDepth--;
      if (txDepth === 0) { var werr = null; try { flushWrites(); } catch (e0) { werr = e0; } try { SpreadsheetApp.flush(); } catch (e) {} cache = {}; try { lockObj.releaseLock(); } catch (e2) {} if (werr) throw werr; }
    }
  }
  function needTx() { if (txDepth === 0) throw new Error('Internal: write outside DB.tx()'); }

  function validate(name, o, isNew, existing) {
    var d = def(name), merged = {};
    for (var k in (existing || {})) merged[k] = existing[k];
    for (var k2 in o) merged[k2] = o[k2];
    d.req.forEach(function (c) { if (c !== d.pk && (merged[c] === '' || merged[c] === undefined || merged[c] === null)) throw new AppError('VALIDATION', 'Field "' + c.replace(/_/g, ' ') + '" is required.'); });
    Object.keys(d.enums).forEach(function (c) { if (merged[c] !== '' && merged[c] !== undefined && merged[c] !== null && d.enums[c].indexOf(merged[c]) < 0) throw new AppError('VALIDATION', 'Invalid value "' + merged[c] + '" for ' + c.replace(/_/g, ' ') + '.'); });
    Object.keys(d.fk).forEach(function (c) {
      if (o[c] !== undefined && o[c] !== '' && o[c] !== null) { if (!get(d.fk[c], o[c])) throw new AppError('VALIDATION', 'Reference not found: ' + c.replace(/_/g, ' ') + ' (' + o[c] + ').'); }
    });
    d.uniq.forEach(function (cols) {
      var key = cols.map(function (c) { return String(merged[c] || '').toLowerCase(); }).join('|');
      if (key.replace(/\|/g, '') === '') return;
      var dup = all(name, true).filter(function (r) { return r.is_active !== 'N' && cols.map(function (c) { return String(r[c] || '').toLowerCase(); }).join('|') === key && (isNew || r[d.pk] !== merged[d.pk]); })[0];
      if (dup) throw new AppError('DUPLICATE', 'A record with the same ' + cols.join(' + ').replace(/_/g, ' ') + ' already exists.');
    });
    Object.keys(d.num).forEach(function (c) { if (merged[c] !== undefined && merged[c] !== '' && !isFinite(Number(merged[c]))) throw new AppError('VALIDATION', c.replace(/_/g, ' ') + ' must be a number.'); });
  }

  function nextSeq(key) {
    needTx();
    var row = get('Settings', key), n = row ? (parseInt(row.value, 10) || 0) + 1 : 1;
    if (row) update('Settings', key, { value: String(n) }, 'system'); else insert('Settings', { key: key, value: String(n), description: 'sequence' }, 'system');
    return n;
  }

  function insert(name, obj, userId) {
    needTx();
    var d = def(name), c = load(name), o = {}, ts = Util.now();
    d.cols.forEach(function (col) { var v = obj[col]; o[col] = v === undefined || v === null ? (d.num[col] ? 0 : '') : (d.num[col] ? Number(v) : (typeof v === 'string' ? v : String(v))); });
    o[d.pk] = obj[d.pk] || (d.noPkGen ? '' : Util.uid(d.pfx));
    if (o[d.pk] === '') throw new AppError('VALIDATION', 'A key is required for ' + name + '.');
    if (c.idx[o[d.pk]] !== undefined) throw new AppError('DUPLICATE', 'Record ' + o[d.pk] + ' already exists in ' + name + '.');
    validate(name, o, true, null);
    o.created_at = ts; o.created_by = userId || ''; o.updated_at = ts; o.updated_by = userId || ''; o.is_active = 'Y';
    var arr = c.h.map(function (h) { return o[h] === undefined ? '' : o[h]; });
    queue(name, c.nextRow, arr);
    o.__row = c.nextRow; c.nextRow++;
    c.rows.push(o); c.idx[o[d.pk]] = c.rows.length - 1;
    return strip(o);
  }

  function insertMany(name, list, userId) { return list.map(function (x) { return insert(name, x, userId); }); }

  function update(name, id, patch, userId) {
    needTx();
    var d = def(name), c = load(name), i = c.idx[id];
    if (i === undefined) throw new AppError('NOT_FOUND', name + ' record not found.');
    var cur = c.rows[i], p = {};
    Object.keys(patch).forEach(function (k) {
      if (k === d.pk || AUDIT_COLS.indexOf(k) > -1 && k !== 'is_active') return;
      if (d.cols.indexOf(k) < 0 && k !== 'is_active') return;
      p[k] = d.num[k] ? Number(patch[k]) : (patch[k] === null || patch[k] === undefined ? '' : String(patch[k]));
    });
    validate(name, p, false, cur);
    for (var k2 in p) cur[k2] = p[k2];
    cur.updated_at = Util.now(); cur.updated_by = userId || '';
    var arr = c.h.map(function (h) { return cur[h] === undefined ? '' : cur[h]; });
    queue(name, cur.__row, arr);
    return strip(cur);
  }

  function deactivate(name, id, userId) { return update(name, id, { is_active: 'N' }, userId); }

  function count(name) { return all(name).length; }

  /** Create all tabs with headers (idempotent). */
  function ensureSchema(spreadsheet) {
    var created = [], target = spreadsheet || ss();
    SHEET_ORDER.forEach(function (n) {
      var s = target.getSheetByName(n), h = headers(n);
      if (!s) { s = target.insertSheet(n); created.push(n); }
      if (s.getLastRow() === 0 || s.getRange(1, 1, 1, 1).getValue() === '') {
        s.getRange(1, 1, 1, h.length).setValues([h]);
        s.getRange(1, 1, 1, h.length).setFontWeight('bold').setBackground('#12345A').setFontColor('#FFFFFF');
        s.setFrozenRows(1);
        s.getRange(1, 1, 500, h.length).setNumberFormat('@');
      }
    });
    var def1 = target.getSheetByName('Sheet1'); if (def1 && target.getSheets().length > 1) { try { target.deleteSheet(def1); } catch (e) {} }
    return created;
  }
  function setSpreadsheet(s) { ssObj = s; cache = {}; }
  function spreadsheet() { return ss(); }
  return { all: all, get: get, where: where, findOne: findOne, insert: insert, insertMany: insertMany, update: update, deactivate: deactivate, tx: tx, nextSeq: nextSeq,
    ensureSchema: ensureSchema, flushWrites: flushWrites, reset: reset, headers: headers, count: count, setSpreadsheet: setSpreadsheet, spreadsheet: spreadsheet, def: def, strip: strip };
})();

/** Settings helper */
var Settings = {
  get: function (k, dflt) { var r = DB.get('Settings', k); return r && r.value !== '' ? r.value : (dflt === undefined ? '' : dflt); },
  num: function (k, dflt) { var n = parseFloat(Settings.get(k, dflt)); return isFinite(n) ? n : dflt; },
  set: function (k, v, userId) { var r = DB.get('Settings', k); if (r) return DB.update('Settings', k, { value: String(v) }, userId); return DB.insert('Settings', { key: k, value: String(v), description: '' }, userId); }
};


// ======== Auth.gs ========
/**
 * Auth.gs - authentication.
 *
 * DESIGN DECISION (see docs/ARCHITECTURE.md):
 * Session.getActiveUser().getEmail() returns a usable address only for Google Workspace users in the same domain as the owner
 * (or when the app runs as the accessing user). For consumer Gmail accounts, with "Execute as me", it is typically blank, and
 * running as the accessing user would force the database spreadsheet to be shared with every user, which defeats server-side
 * record permissions. Therefore the app uses its own login: email + password. Passwords are stored only as salted, iterated
 * SHA-256 hashes in the Credentials tab (never in plain text); accounts are activated with an admin-issued one-time code;
 * sessions are random tokens held in CacheService (sliding expiry, hard cap 12 hours); repeated failures lock the account.
 */
var Auth = (function () {
  var ROUNDS = 1200, MAX_FAILS = 5, LOCK_MIN = 15, ABS_HOURS = 12;

  function hashPwd(pwd, salt) {
    var h = Util.sha256Hex(salt + pwd);
    for (var i = 0; i < ROUNDS; i++) h = Util.sha256Hex(h + salt + pwd);
    return h;
  }
  function checkPolicy(pwd, email) {
    pwd = String(pwd || '');
    var local = String(email || '').split('@')[0].toLowerCase();
    if (pwd.length < 10) throw new AppError('VALIDATION', 'Password must be at least 10 characters.');
    if (!/[a-z]/.test(pwd) || !/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) throw new AppError('VALIDATION', 'Password must contain upper case, lower case and a digit.');
    if (local.length > 3 && pwd.toLowerCase().indexOf(local) > -1) throw new AppError('VALIDATION', 'Password must not contain your email name.');
  }
  function eqConst(a, b) { a = String(a); b = String(b); if (a.length !== b.length) return false; var r = 0; for (var i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }
  function cacheKey(token) { return 'sess:' + Util.sha256Hex(token); }
  function userByEmail(email) { email = String(email || '').trim().toLowerCase(); var r = DB.all('Users', true); for (var i = 0; i < r.length; i++) if (String(r[i].email).toLowerCase() === email) return r[i]; return null; }

  /** Admin issues (or re-issues) a one-time activation code. Returns the code ONCE; only a hash is stored. */
  function issueActivation(userId, byUser) {
    var code = Util.randHex(10).toUpperCase(), salt = Util.randHex(24);
    var cred = DB.get('Credentials', userId);
    var patch = { activation_hash: Util.sha256Hex(code + salt), salt: salt, activation_expires: Util.addDays(Util.today(), 3), must_change: 'Y', hash: '', failed_count: 0, locked_until: '' };
    if (cred) DB.update('Credentials', userId, patch, byUser); else { patch.user_id = userId; patch.rounds = ROUNDS; DB.insert('Credentials', patch, byUser); }
    return code;
  }
  function activate(email, code, newPwd) {
    var u = userByEmail(email), generic = new AppError('AUTH', 'Activation failed. Check the email and code, or ask the administrator for a new code.');
    if (!u || u.is_active === 'N') throw generic;
    var c = DB.get('Credentials', u.user_id);
    if (!c || !c.activation_hash || c.activation_expires < Util.today()) throw generic;
    if (!eqConst(Util.sha256Hex(String(code || '').trim().toUpperCase() + c.salt), c.activation_hash)) { DB.update('Credentials', u.user_id, { failed_count: c.failed_count + 1 }, 'system'); Audit.log({ user_id: u.user_id, role: u.role }, 'ACTIVATE_FAIL', 'Auth', 'User', u.user_id, '', '', '', 'FAILED'); throw generic; }
    checkPolicy(newPwd, u.email);
    var salt = Util.randHex(24);
    DB.update('Credentials', u.user_id, { salt: salt, hash: hashPwd(newPwd, salt), rounds: ROUNDS, activation_hash: '', activation_expires: '', must_change: 'N', failed_count: 0, locked_until: '', last_password_change: Util.now() }, u.user_id);
    Audit.log({ user_id: u.user_id, role: u.role }, 'ACTIVATE', 'Auth', 'User', u.user_id, '', '', '', 'OK');
    return true;
  }
  function login(email, pwd) {
    var u = userByEmail(email), bad = new AppError('AUTH', 'Invalid email or password.');
    if (!u) { Audit.log({ user_id: '', role: '' }, 'LOGIN_FAIL', 'Auth', 'User', String(email).slice(0, 60), '', '', 'unknown user', 'FAILED'); throw bad; }
    var c = DB.get('Credentials', u.user_id);
    if (u.is_active === 'N') throw new AppError('AUTH', 'This account is deactivated. Please contact the administrator.');
    if (!c || !c.hash) throw bad;
    if (c.locked_until && c.locked_until > Util.now()) throw new AppError('AUTH', 'Too many failed attempts. Try again after ' + LOCK_MIN + ' minutes.');
    if (!eqConst(hashPwd(String(pwd || ''), c.salt), c.hash)) {
      var f = c.failed_count + 1, p = { failed_count: f };
      if (f >= MAX_FAILS) { p.locked_until = Utilities.formatDate(new Date(Date.now() + LOCK_MIN * 60000), APP.TZ, "yyyy-MM-dd'T'HH:mm:ss"); p.failed_count = 0; }
      DB.update('Credentials', u.user_id, p, 'system');
      Audit.log({ user_id: u.user_id, role: u.role }, 'LOGIN_FAIL', 'Auth', 'User', u.user_id, '', '', f >= MAX_FAILS ? 'locked' : '', 'FAILED');
      throw bad;
    }
    if (u.employment_status === 'Pending Approval') throw new AppError('PENDING', 'Your registration is waiting for administrator approval. You will be able to sign in once it is approved.');
    DB.update('Credentials', u.user_id, { failed_count: 0, locked_until: '', last_login: Util.now() }, u.user_id);
    var token = Util.randHex(48), hrs = Math.min(Settings.num('session_hours', 6), 6);
    CacheService.getScriptCache().put(cacheKey(token), JSON.stringify({ uid: u.user_id, iat: Date.now() }), Math.floor(hrs * 3600));
    Audit.log({ user_id: u.user_id, role: u.role }, 'LOGIN', 'Auth', 'User', u.user_id, '', '', '', 'OK');
    return token;
  }
  /** Validates a session token and returns the live user record. Throws AUTH if invalid/expired/deactivated. */
  function authenticate(token) {
    if (!token || typeof token !== 'string' || token.length < 40) throw new AppError('AUTH', 'Please sign in.');
    var cache = CacheService.getScriptCache(), raw = cache.get(cacheKey(token));
    if (!raw) throw new AppError('AUTH', 'Your session has expired. Please sign in again.');
    var s = JSON.parse(raw);
    if (Date.now() - s.iat > ABS_HOURS * 3600000) { cache.remove(cacheKey(token)); throw new AppError('AUTH', 'Your session has expired. Please sign in again.'); }
    var u = DB.get('Users', s.uid);
    if (!u || u.is_active === 'N') { cache.remove(cacheKey(token)); throw new AppError('AUTH', 'This account is not active.'); }
    if (u.employment_status === 'Pending Approval') { cache.remove(cacheKey(token)); throw new AppError('AUTH', 'Your registration is waiting for administrator approval.'); }
    cache.put(cacheKey(token), raw, Math.floor(Math.min(Settings.num('session_hours', 6), 6) * 3600)); // sliding
    return u;
  }
  function logout(token) { if (token) CacheService.getScriptCache().remove(cacheKey(token)); }
  function changePassword(user, oldPwd, newPwd) {
    var c = DB.get('Credentials', user.user_id);
    if (!c || !eqConst(hashPwd(String(oldPwd || ''), c.salt), c.hash)) throw new AppError('AUTH', 'Current password is incorrect.');
    checkPolicy(newPwd, user.email);
    var salt = Util.randHex(24);
    DB.update('Credentials', user.user_id, { salt: salt, hash: hashPwd(newPwd, salt), rounds: ROUNDS, last_password_change: Util.now(), must_change: 'N' }, user.user_id);
    Audit.log(user, 'PASSWORD_CHANGE', 'Auth', 'User', user.user_id, '', '', '', 'OK');
    return true;
  }
  return { issueActivation: issueActivation, activate: activate, login: login, authenticate: authenticate, logout: logout, changePassword: changePassword, checkPolicy: checkPolicy, userByEmail: userByEmail };
})();


// ======== Audit.gs ========
/** Audit.gs - audit trail. NOTE: a Google Sheet log is NOT tamper-proof; anyone with edit access to the spreadsheet can alter it. */
var Audit = (function () {
  var MASK = ['pan', 'gstin', 'tan', 'mobile', 'hash', 'salt', 'activation_hash'];
  function summarise(o) {
    if (o === undefined || o === null || o === '') return '';
    if (typeof o === 'string') return o.slice(0, 500);
    var c = {};
    Object.keys(o).forEach(function (k) { if (k === '__row') return; c[k] = MASK.indexOf(k) > -1 ? '***' : o[k]; });
    var s = JSON.stringify(c); return s.length > 900 ? s.slice(0, 900) + '...' : s;
  }
  function diff(oldO, newO) {
    var p = {}, n = {};
    Object.keys(newO || {}).forEach(function (k) { if (['updated_at', 'updated_by', '__row'].indexOf(k) > -1) return; if (String((oldO || {})[k]) !== String(newO[k])) { p[k] = (oldO || {})[k]; n[k] = newO[k]; } });
    return { prev: p, next: n };
  }
  /** Must be called inside DB.tx(). */
  function log(user, action, module, recType, recId, prev, next, reason, status) {
    try {
      DB.insert('AuditLogs', { ts: Util.now(), user_id: (user && (user.user_id || user.id)) || '', user_role: (user && user.role) || '', action: action, module: module || '', record_type: recType || '', record_id: recId || '',
        previous_value: summarise(prev), new_value: summarise(next), reason: reason || '', status: status || 'OK' }, (user && user.user_id) || 'system');
    } catch (e) { /* never block the business operation because of audit write problems, but surface in logs */ console.error('Audit write failed: ' + e); }
  }
  function logSeparately(user, action, module, reason, status) { try { DB.tx(function () { log(user, action, module, '', '', '', '', reason, status); }); } catch (e) { console.error('Audit failed: ' + e); } }
  return { log: log, diff: diff, summarise: summarise, logSeparately: logSeparately };
})();


// ======== Permissions.gs ========
/** Permissions.gs - effective permissions and record-level scope. Every sensitive server operation calls these. */
var Perm = (function () {
  var permCache = {}, scopeCache = {};

  function reset() { permCache = {}; scopeCache = {}; }
  function roleDefaults(role) {
    var rows = DB.where('RolePermissions', function (r) { return r.role === role; });
    if (!rows.length) return (DEFAULT_ROLE_PERMS[role] || []).slice();
    return rows.filter(function (r) { return r.effect !== 'DENY'; }).map(function (r) { return r.perm; });
  }
  function effective(user) {
    if (permCache[user.user_id]) return permCache[user.user_id];
    var set = {};
    roleDefaults(user.role).forEach(function (p) { set[p] = true; });
    DB.where('UserPermissions', function (r) { return r.user_id === user.user_id; }).forEach(function (r) { if (r.effect === 'GRANT') set[r.perm] = true; else delete set[r.perm]; });
    permCache[user.user_id] = set; return set;
  }
  function has(user, perm) { return !!effective(user)[perm]; }
  function require_(user, perm) {
    if (!has(user, perm)) { Audit.logSeparately(user, 'DENIED', 'Permissions', 'Missing permission ' + perm, 'DENIED'); throw new AppError('FORBIDDEN', 'You do not have permission to do this.'); }
  }
  function isTop(user) { return user.role === 'ADMIN' || user.role === 'MANAGING_PARTNER'; }

  function activeAssignments(userId) { return DB.where('TaskAssignments', function (a) { return a.user_id === userId && !a.released_at; }); }

  /** Returns null for unrestricted, otherwise an object set of client ids the user may see. */
  function clientScope(user) {
    if (scopeCache[user.user_id] !== undefined) return scopeCache[user.user_id];
    var res;
    if (isTop(user) || user.role === 'ACCOUNTS' || user.client_access === 'ALL') res = null;
    else {
      res = {};
      var uid = user.user_id;
      DB.where('Clients', function (c) { return c.partner_id === uid || c.senior_id === uid || c.clerk_id === uid; }).forEach(function (c) { res[c.client_id] = true; });
      DB.where('UserClientAccess', function (a) { return a.user_id === uid; }).forEach(function (a) { res[a.client_id] = true; });
      var taskIds = {}; activeAssignments(uid).forEach(function (a) { taskIds[a.task_id] = true; });
      DB.where('Tasks', function (t) { return taskIds[t.task_id] || t.partner_id === uid || t.senior_id === uid; }).forEach(function (t) { res[t.client_id] = true; });
    }
    scopeCache[user.user_id] = res; return res;
  }
  function canSeeClient(user, clientId) { var s = clientScope(user); return s === null ? true : !!s[clientId]; }
  function assertClient(user, clientId) {
    if (!has(user, 'client.view') && !has(user, 'fees.view') && !has(user, 'task.view')) throw new AppError('FORBIDDEN', 'You do not have permission to do this.');
    if (!canSeeClient(user, clientId)) { Audit.logSeparately(user, 'DENIED', 'Clients', 'Client ' + clientId, 'DENIED'); throw new AppError('FORBIDDEN', 'You are not authorised to access this client.'); }
  }
  function participants(taskId) { return DB.where('TaskAssignments', function (a) { return a.task_id === taskId && !a.released_at; }).map(function (a) { return a.user_id; }); }
  function isAssignee(user, taskId) { return participants(taskId).indexOf(user.user_id) > -1; }
  function canSeeTask(user, t) {
    if (!has(user, 'task.view') && !has(user, 'task.work')) return false;
    if (isTop(user)) return true;
    if (t.partner_id === user.user_id || t.senior_id === user.user_id || isAssignee(user, t.task_id)) return true;
    if (user.role === 'PARTNER') return canSeeClient(user, t.client_id);
    return false;
  }
  function assertTask(user, t) {
    if (!t) throw new AppError('NOT_FOUND', 'Task not found.');
    if (!canSeeTask(user, t)) { Audit.logSeparately(user, 'DENIED', 'Tasks', 'Task ' + t.task_id, 'DENIED'); throw new AppError('FORBIDDEN', 'You are not authorised to access this task.'); }
  }
  /** Staff whose work the user may see (self always). */
  function visibleUserIds(user) {
    if (isTop(user)) return null;
    var ids = {}; ids[user.user_id] = true;
    if (user.role === 'PARTNER' || user.role === 'SENIOR') {
      DB.where('Users', function (u) { return u.partner_id === user.user_id || u.reporting_manager_id === user.user_id; }).forEach(function (u) { ids[u.user_id] = true; });
      var scope = clientScope(user);
      DB.where('Tasks', function (t) { return t.partner_id === user.user_id || t.senior_id === user.user_id || (scope && scope[t.client_id] && user.role === 'PARTNER'); }).forEach(function (t) { participants(t.task_id).forEach(function (p) { ids[p] = true; }); });
    }
    return ids;
  }
  function canSeeUser(user, uid) { var v = visibleUserIds(user); return v === null ? true : !!v[uid]; }
  function maskClient(user, c) {
    if (!c) return c; var o = {}; for (var k in c) o[k] = c[k];
    if (!has(user, 'client.sensitive')) { DB.def('Clients').sensitive.forEach(function (f) { if (o[f]) o[f] = String(o[f]).length > 4 ? '******' + String(o[f]).slice(-3) : '****'; }); }
    return o;
  }
  return { reset: reset, has: has, require: require_, effective: effective, clientScope: clientScope, canSeeClient: canSeeClient, assertClient: assertClient, canSeeTask: canSeeTask, assertTask: assertTask,
    isAssignee: isAssignee, participants: participants, visibleUserIds: visibleUserIds, canSeeUser: canSeeUser, maskClient: maskClient, isTop: isTop, activeAssignments: activeAssignments };
})();


// ======== Notifications.gs ========
/** Notifications.gs - in-app notification centre and scheduled reminders. */
var Notify = (function () {
  /** Must be called inside DB.tx(). dedupeKey prevents duplicate reminders. */
  function send(userIds, type, title, message, refType, refId, dedupeKey) {
    var seen = {}, n = 0;
    (userIds || []).forEach(function (uid) {
      if (!uid || seen[uid]) return; seen[uid] = true;
      var u = DB.get('Users', uid); if (!u || u.is_active === 'N') return;
      var key = dedupeKey ? dedupeKey + '|' + uid : '';
      if (key && DB.findOne('Notifications', function (x) { return x.dedupe_key === key; })) return;
      DB.insert('Notifications', { user_id: uid, type: type, title: title, message: String(message || '').slice(0, 500), ref_type: refType || '', ref_id: refId || '', is_read: 'N', dedupe_key: key }, 'system');
      n++;
    });
    return n;
  }
  function list(user, p) {
    p = p || {};
    var r = DB.where('Notifications', function (n) { return n.user_id === user.user_id && (!p.unread || n.is_read !== 'Y'); }).sort(function (a, b) { return a.created_at < b.created_at ? 1 : -1; });
    var unread = DB.where('Notifications', function (n) { return n.user_id === user.user_id && n.is_read !== 'Y'; }).length;
    var ann = DB.where('InternalAnnouncements', function (a) { return (!a.expires_on || a.expires_on >= Util.today()) && (!a.audience_role || a.audience_role === user.role); }).sort(function (a, b) { return a.posted_at < b.posted_at ? 1 : -1; }).slice(0, 10);
    return { items: r.slice(0, p.limit || 100), unread: unread, announcements: ann };
  }
  function markRead(user, ids) {
    var all = ids === 'ALL';
    DB.where('Notifications', function (n) { return n.user_id === user.user_id && n.is_read !== 'Y' && (all || (ids || []).indexOf(n.notification_id) > -1); })
      .forEach(function (n) { DB.update('Notifications', n.notification_id, { is_read: 'Y', read_at: Util.now() }, user.user_id); });
    return true;
  }
  function postAnnouncement(user, d) {
    Perm.require(user, 'announce.post');
    var a = DB.insert('InternalAnnouncements', { title: Util.clean(d.title, 150), message: Util.clean(d.message, 2000), audience_role: d.audience_role || '', posted_by: user.user_id, posted_at: Util.now(), expires_on: V.optDate(d.expires_on, 'Expiry date') }, user.user_id);
    var targets = DB.where('Users', function (u) { return !a.audience_role || u.role === a.audience_role; }).map(function (u) { return u.user_id; });
    Notify.send(targets, 'ANNOUNCEMENT', a.title, a.message, 'Announcement', a.announcement_id);
    Audit.log(user, 'ANNOUNCE', 'Notifications', 'InternalAnnouncements', a.announcement_id, '', a.title, '', 'OK');
    return a;
  }
  return { send: send, list: list, markRead: markRead, postAnnouncement: postAnnouncement };
})();


// ======== Messages.gs ========
/**
 * Messages.gs - two-way internal messages between people in the firm (partners to staff and back).
 * - Every message has named recipients; each recipient's reading is recorded (read_at) and shown to the sender.
 * - Sending and reading are written to the audit log (who, whom, when, subject). The message text is NOT copied into the audit log
 *   and administrators cannot read other people's messages; only senders and recipients can open a thread.
 * - Records are never deleted.
 */
var Msg = (function () {
  var PRIORITIES = ['Normal', 'Urgent'];

  function activeUsers() { return DB.all('Users').filter(function (u) { return u.employment_status !== 'Left'; }); }
  function nameOf(users, id) { return (users[id] || {}).full_name || id; }

  /** Everyone who sent or received anything in the thread. */
  function threadMembers(threadId) {
    var seen = {}, out = [];
    DB.where('Messages', function (m) { return m.thread_id === threadId; }).forEach(function (m) { if (!seen[m.sender_id]) { seen[m.sender_id] = 1; out.push(m.sender_id); } });
    DB.where('MessageRecipients', function (r) { return r.thread_id === threadId; }).forEach(function (r) { if (!seen[r.user_id]) { seen[r.user_id] = 1; out.push(r.user_id); } });
    return out;
  }

  function send(user, d) {
    d = d || {};
    var body = Util.clean(d.body, 4000); V.req(body, 'Please write a message.');
    var prio = d.priority ? V.oneOf(d.priority, PRIORITIES, 'Priority') : 'Normal';
    var users = Util.indexBy(activeUsers(), 'user_id'), to = [], thread, parent = null, subject;
    function add(id) { if (id && id !== user.user_id && users[id] && to.indexOf(id) < 0) to.push(id); }
    if (d.reply_to) {
      parent = DB.get('Messages', d.reply_to); V.req(parent, 'The message you are replying to was not found.');
      V.req(threadMembers(parent.thread_id).indexOf(user.user_id) > -1, 'You are not part of this conversation.');
      thread = parent.thread_id; subject = DB.get('Messages', thread).subject;
      (Array.isArray(d.to) && d.to.length ? d.to : threadMembers(thread)).forEach(add);
    } else {
      subject = Util.clean(d.subject, 150); V.req(subject, 'Please enter a subject.');
      (Array.isArray(d.to) ? d.to : []).forEach(add);
      if (d.group) {
        V.req(d.group === 'ALL' || ROLES[d.group], 'Unknown group.');
        Object.keys(users).forEach(function (id) { if (d.group === 'ALL' || users[id].role === d.group) add(id); });
      }
    }
    V.req(to.length > 0, 'Choose at least one person to send this to.'); V.req(to.length <= 60, 'A message can go to at most 60 people.');
    var id = Util.uid('MG'); thread = thread || id;
    DB.insert('Messages', { message_id: id, thread_id: thread, parent_id: parent ? parent.message_id : '', sender_id: user.user_id, subject: subject, body: body, priority: prio, sent_at: Util.now() }, user.user_id);
    to.forEach(function (uid) { DB.insert('MessageRecipients', { message_id: id, thread_id: thread, user_id: uid, read_at: '' }, user.user_id); });
    Notify.send(to, 'MESSAGE', (prio === 'Urgent' ? 'URGENT message from ' : 'Message from ') + user.full_name, subject, 'Message', thread);
    Audit.log(user, 'MESSAGE_SEND', 'Messages', 'Message', id, '', { thread: thread, subject: subject, priority: prio, to: to.map(function (x) { return nameOf(users, x); }).join(', '), reply: !!parent }, '', 'OK');
    return { message_id: id, thread_id: thread, recipients: to.length };
  }

  /** Conversations I take part in, newest first, with my unread count. */
  function inbox(user, p) {
    p = p || {}; var users = Util.indexBy(DB.all('Users', true), 'user_id'), threads = {};
    var msgs = DB.all('Messages'), recs = DB.all('MessageRecipients');
    var myThreads = {};
    msgs.forEach(function (m) { if (m.sender_id === user.user_id) myThreads[m.thread_id] = 1; });
    recs.forEach(function (r) { if (r.user_id === user.user_id) myThreads[r.thread_id] = 1; });
    msgs.forEach(function (m) {
      if (!myThreads[m.thread_id]) return;
      var t = threads[m.thread_id] = threads[m.thread_id] || { thread_id: m.thread_id, subject: '', count: 0, last_at: '', last_from: '', last_snippet: '', unread: 0, urgent: false, members: {} };
      t.count++; t.members[m.sender_id] = 1; if (m.parent_id === '') t.subject = m.subject; if (m.priority === 'Urgent') t.urgent = true;
      if (m.sent_at >= t.last_at) { t.last_at = m.sent_at; t.last_from = nameOf(users, m.sender_id); t.last_snippet = String(m.body).replace(/\s+/g, ' ').slice(0, 90); }
    });
    recs.forEach(function (r) { var t = threads[r.thread_id]; if (!t) return; t.members[r.user_id] = 1; if (r.user_id === user.user_id && !r.read_at) t.unread++; });
    var out = Object.keys(threads).map(function (k) { var t = threads[k]; t.members = Object.keys(t.members).filter(function (x) { return x !== user.user_id; }).map(function (x) { return nameOf(users, x); }); return t; });
    if (p.box === 'unread') out = out.filter(function (t) { return t.unread > 0; });
    out.sort(function (a, b) { return a.last_at < b.last_at ? 1 : -1; });
    return { threads: out.slice(0, 200), unread: out.reduce(function (n, t) { return n + t.unread; }, 0) };
  }

  /** Open a conversation: marks every message addressed to me as read (once) and records it in the audit log. */
  function thread(user, threadId) {
    var members = threadMembers(threadId); V.req(members.length && members.indexOf(user.user_id) > -1, 'Conversation not found.');
    var users = Util.indexBy(DB.all('Users', true), 'user_id'), now = Util.now();
    var msgs = DB.where('Messages', function (m) { return m.thread_id === threadId; }).sort(function (a, b) { return a.sent_at < b.sent_at ? -1 : (a.sent_at > b.sent_at ? 1 : (a.message_id < b.message_id ? -1 : 1)); });
    var recs = DB.where('MessageRecipients', function (r) { return r.thread_id === threadId; }), newlyRead = 0;
    recs.forEach(function (r) {
      if (r.user_id === user.user_id && !r.read_at) {
        DB.update('MessageRecipients', r.id, { read_at: now }, user.user_id); r.read_at = now; newlyRead++;
        var m = msgs.filter(function (x) { return x.message_id === r.message_id; })[0];
        Audit.log(user, 'MESSAGE_READ', 'Messages', 'Message', r.message_id, '', { subject: m ? m.subject : '', from: m ? nameOf(users, m.sender_id) : '', read_at: now }, '', 'OK');
      }
    });
    DB.where('Notifications', function (n) { return n.user_id === user.user_id && n.type === 'MESSAGE' && n.ref_id === threadId && n.is_read !== 'Y'; }).forEach(function (n) { DB.update('Notifications', n.notification_id, { is_read: 'Y' }, user.user_id); });
    return {
      thread_id: threadId, subject: (msgs[0] || {}).subject || '', newly_read: newlyRead,
      messages: msgs.map(function (m) {
        return { message_id: m.message_id, from_id: m.sender_id, from: nameOf(users, m.sender_id), mine: m.sender_id === user.user_id, sent_at: m.sent_at, body: m.body, priority: m.priority,
          to: recs.filter(function (r) { return r.message_id === m.message_id; }).map(function (r) { return { user_id: r.user_id, name: nameOf(users, r.user_id), read_at: r.read_at }; }) };
      }),
      members: members.filter(function (x) { return x !== user.user_id; }).map(function (x) { return { user_id: x, name: nameOf(users, x) }; })
    };
  }

  function unreadCount(user) { return DB.where('MessageRecipients', function (r) { return r.user_id === user.user_id && !r.read_at; }).length; }

  return { send: send, inbox: inbox, thread: thread, unreadCount: unreadCount };
})();


// ======== Clients.gs ========
/** Clients.gs - client master, contacts, services, onboarding pipeline, CSV import/export. */
var Clients = (function () {
  var EDITABLE = ['name', 'entity_type', 'pan', 'gstin', 'tan', 'cin_llpin', 'address', 'state', 'contact_person', 'email', 'mobile', 'partner_id', 'senior_id', 'clerk_id', 'fy', 'engagement_start', 'engagement_end',
    'agreed_fee', 'billing_frequency', 'status', 'pipeline_stage', 'proposal_date', 'renewal_date', 'internal_remarks'];

  function sanitize(d, isNew, existing) {
    var o = {};
    EDITABLE.forEach(function (k) { if (d[k] !== undefined) o[k] = k === 'agreed_fee' ? V.num(d[k] || 0, 'Agreed fee', 0) : Util.clean(d[k], k === 'internal_remarks' || k === 'address' ? 2000 : 200); });
    ['pan', 'gstin', 'tan', 'cin_llpin'].forEach(function (k) { if (o[k] !== undefined) o[k] = o[k].toUpperCase(); });
    if (o.pan) V.req(V.PAN.test(o.pan), 'PAN format is invalid (expected AAAAA9999A).');
    if (o.gstin) V.req(V.GSTIN.test(o.gstin), 'GSTIN format is invalid.');
    if (o.pan && o.gstin) V.req(o.gstin.slice(2, 12) === o.pan, 'PAN does not match the PAN embedded in the GSTIN.');
    if (o.entity_type) V.oneOf(o.entity_type, ENTITY_TYPES, 'Entity type');
    if (o.pipeline_stage) V.oneOf(o.pipeline_stage, PIPELINE, 'Pipeline stage');
    if (o.tan) V.req(V.TAN.test(o.tan), 'TAN format is invalid (expected AAAA99999A).');
    if (o.email) o.email = V.email(o.email, 'Client email');
    if (o.mobile) V.req(V.MOBILE.test(o.mobile), 'Mobile number must be a 10-digit Indian mobile number.');
    ['engagement_start', 'engagement_end', 'proposal_date', 'renewal_date'].forEach(function (k) { if (o[k]) V.date(o[k], k.replace(/_/g, ' ')); });
    if (o.engagement_start && o.engagement_end) V.req(o.engagement_end >= o.engagement_start, 'Engagement end date cannot be before the start date.');
    ['partner_id', 'senior_id', 'clerk_id'].forEach(function (k) {
      if (o[k]) { var u = DB.get('Users', o[k]); V.req(u && u.is_active !== 'N', 'Selected ' + k.replace('_id', '') + ' is not an active user.'); }
    });
    if (o.partner_id) { var pu = DB.get('Users', o.partner_id); V.req(['PARTNER', 'MANAGING_PARTNER', 'ADMIN'].indexOf(pu.role) > -1, 'Partner in charge must be a partner.'); }
    return o;
  }
  function checkDup(o, selfId) {
    var all = DB.all('Clients');
    if (o.pan) { var d = all.filter(function (c) { return c.pan && c.pan === o.pan && c.client_id !== selfId; })[0]; if (d) throw new AppError('DUPLICATE', 'A client with this PAN already exists (' + d.name + ').'); }
    if (o.gstin) { var g = all.filter(function (c) { return c.gstin && c.gstin === o.gstin && c.client_id !== selfId; })[0]; if (g) throw new AppError('DUPLICATE', 'A client with this GSTIN already exists (' + g.name + ').'); }
    if (o.name) { var n = all.filter(function (c) { return c.name.toLowerCase() === o.name.toLowerCase() && c.entity_type === o.entity_type && c.client_id !== selfId; })[0]; if (n) throw new AppError('DUPLICATE', 'A client with the same name and entity type already exists.'); }
  }
  function save(user, d) {
    Perm.require(user, 'client.edit');
    var isNew = !d.client_id, existing = null, o;
    if (!isNew) {
      existing = DB.get('Clients', d.client_id); V.req(existing, 'Client not found.');
      Perm.assertClient(user, d.client_id);
      if (!Perm.has(user, 'client.sensitive')) ['pan', 'gstin', 'tan', 'cin_llpin', 'mobile'].forEach(function (f) { if (d[f] !== undefined && d[f] !== '' && String(d[f]).indexOf('*') > -1) delete d[f]; else if (d[f] !== undefined) throw new AppError('FORBIDDEN', 'You may not change sensitive identifiers.'); });
    }
    o = sanitize(d, isNew, existing);
    var probe = {}; for (var k in (existing || {})) probe[k] = existing[k]; for (var k2 in o) probe[k2] = o[k2];
    checkDup(probe, d.client_id);
    if (isNew) {
      if (user.role === 'PARTNER' && !o.partner_id) o.partner_id = user.user_id;
      if (user.role === 'PARTNER') V.req(o.partner_id === user.user_id, 'A partner can only create clients assigned to themselves.');
      o.client_code = 'C' + String(DB.nextSeq('seq_client')).padStart(4, '0');
      o.status = o.status || 'Active'; o.pipeline_stage = o.pipeline_stage || 'Active Client'; o.fy = o.fy || Util.fyOf(Util.today());
      var c = DB.insert('Clients', o, user.user_id);
      DB.insert('ClientOnboarding', { client_id: c.client_id, stage: c.pipeline_stage, entered_at: Util.now(), by_user: user.user_id, notes: 'Created' }, user.user_id);
      try { var f = Docs.ensureClientFolder(c); if (f) c = DB.update('Clients', c.client_id, { folder_id: f }, user.user_id); } catch (e) { console.error('Drive folder not created: ' + e); }
      Audit.log(user, 'CREATE', 'Clients', 'Client', c.client_id, '', c.name, '', 'OK');
      return Perm.maskClient(user, c);
    }
    var upd = DB.update('Clients', d.client_id, o, user.user_id);
    var df = Audit.diff(existing, upd);
    if (o.pipeline_stage && o.pipeline_stage !== existing.pipeline_stage) DB.insert('ClientOnboarding', { client_id: d.client_id, stage: o.pipeline_stage, entered_at: Util.now(), by_user: user.user_id, notes: '' }, user.user_id);
    Audit.log(user, 'UPDATE', 'Clients', 'Client', d.client_id, df.prev, df.next, '', 'OK');
    return Perm.maskClient(user, upd);
  }
  function list(user, p) {
    Perm.require(user, 'client.view'); p = p || {};
    var sc = Perm.clientScope(user), q = String(p.q || '').toLowerCase();
    var rows = DB.all('Clients').filter(function (c) {
      if (sc !== null && !sc[c.client_id]) return false;
      if (p.status && c.status !== p.status) return false;
      if (p.stage && c.pipeline_stage !== p.stage) return false;
      if (p.partner_id && c.partner_id !== p.partner_id) return false;
      if (q && (c.name + ' ' + c.client_code + ' ' + c.pan + ' ' + c.gstin).toLowerCase().indexOf(q) < 0) return false;
      return true;
    }).sort(function (a, b) { return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1; });
    var users = Util.indexBy(DB.all('Users'), 'user_id');
    var page = Math.max(1, parseInt(p.page || 1, 10)), size = Math.min(200, parseInt(p.pageSize || 50, 10)), total = rows.length;
    rows = rows.slice((page - 1) * size, page * size).map(function (c) { var m = Perm.maskClient(user, c); m.partner_name = (users[c.partner_id] || {}).full_name || ''; return m; });
    return { rows: rows, total: total, page: page, pageSize: size };
  }
  function get(user, id) {
    Perm.assertClient(user, id);
    var c = DB.get('Clients', id); V.req(c, 'Client not found.');
    var out = { client: Perm.maskClient(user, c) };
    out.contacts = DB.where('ClientContacts', function (x) { return x.client_id === id; });
    out.services = DB.where('ClientServices', function (x) { return x.client_id === id; });
    out.onboarding = DB.where('ClientOnboarding', function (x) { return x.client_id === id; });
    out.tasks = DB.where('Tasks', function (t) { return t.client_id === id && Perm.canSeeTask(user, t); }).map(function (t) { return { task_id: t.task_id, task_no: t.task_no, title: t.title, status: t.status, due_date: t.due_date, fy: t.fy }; });
    out.docRequests = DB.where('DocumentRequests', function (x) { return x.client_id === id; });
    if (Perm.has(user, 'fees.view')) { out.fees = Fees.clientSummary(id); }
    if (Perm.has(user, 'docs.view')) out.documents = DB.where('Documents', function (x) { return x.client_id === id; });
    if (Perm.has(user, 'files.view')) out.files = DB.where('PhysicalFiles', function (x) { return x.client_id === id; });
    out.emails = DB.where('EmailLogs', function (x) { return x.client_id === id; }).slice(-50);
    return out;
  }
  function changeStage(user, id, stage, notes) {
    Perm.require(user, 'client.edit'); Perm.assertClient(user, id); V.oneOf(stage, PIPELINE, 'Stage');
    var c = DB.get('Clients', id), patch = { pipeline_stage: stage };
    if (stage === 'Active Client') patch.status = 'Active'; else if (stage === 'Closed') patch.status = 'Closed'; else if (stage === 'Temporarily Inactive') patch.status = 'Inactive';
    DB.update('Clients', id, patch, user.user_id);
    DB.insert('ClientOnboarding', { client_id: id, stage: stage, entered_at: Util.now(), by_user: user.user_id, notes: Util.clean(notes, 500) }, user.user_id);
    Audit.log(user, 'STAGE', 'Clients', 'Client', id, c.pipeline_stage, stage, notes, 'OK');
    return DB.get('Clients', id);
  }
  function saveContact(user, d) {
    Perm.require(user, 'client.edit'); Perm.assertClient(user, d.client_id);
    var o = { client_id: d.client_id, name: Util.clean(d.name, 120), designation: Util.clean(d.designation, 80), email: d.email ? V.email(d.email) : '', mobile: Util.clean(d.mobile, 15), is_primary: d.is_primary ? 'Y' : 'N' };
    if (o.mobile) V.req(V.MOBILE.test(o.mobile), 'Contact mobile must be a 10-digit Indian mobile number.');
    var r = d.contact_id ? DB.update('ClientContacts', d.contact_id, o, user.user_id) : DB.insert('ClientContacts', o, user.user_id);
    Audit.log(user, d.contact_id ? 'UPDATE' : 'CREATE', 'Clients', 'ClientContacts', r.contact_id, '', o.name, '', 'OK');
    return r;
  }
  function removeContact(user, id) { var c = DB.get('ClientContacts', id); V.req(c, 'Contact not found.'); Perm.require(user, 'client.edit'); Perm.assertClient(user, c.client_id); DB.deactivate('ClientContacts', id, user.user_id); Audit.log(user, 'DEACTIVATE', 'Clients', 'ClientContacts', id, c.name, '', '', 'OK'); return true; }
  function saveService(user, d) {
    Perm.require(user, 'client.edit'); Perm.assertClient(user, d.client_id);
    var dup = DB.findOne('ClientServices', function (x) { return x.client_id === d.client_id && x.service_id === d.service_id && x.fy === (d.fy || '') && x.id !== d.id; });
    if (dup) throw new AppError('DUPLICATE', 'This service is already assigned to the client for that financial year.');
    var o = { client_id: d.client_id, service_id: d.service_id, fy: Util.clean(d.fy, 10), fee: V.num(d.fee || 0, 'Fee', 0), frequency: Util.clean(d.frequency, 30), status: d.status || 'Active' };
    var r = d.id ? DB.update('ClientServices', d.id, o, user.user_id) : DB.insert('ClientServices', o, user.user_id);
    Audit.log(user, d.id ? 'UPDATE' : 'CREATE', 'Clients', 'ClientServices', r.id, '', o.service_id, '', 'OK'); return r;
  }
  function removeService(user, id) { var s = DB.get('ClientServices', id); V.req(s, 'Not found.'); Perm.require(user, 'client.edit'); Perm.assertClient(user, s.client_id); DB.deactivate('ClientServices', id, user.user_id); Audit.log(user, 'DEACTIVATE', 'Clients', 'ClientServices', id, '', '', '', 'OK'); return true; }

  var CSV_COLS = ['name', 'entity_type', 'pan', 'gstin', 'tan', 'cin_llpin', 'address', 'state', 'contact_person', 'email', 'mobile', 'partner_email', 'agreed_fee', 'billing_frequency', 'engagement_start'];
  function importCsv(user, text, dryRun) {
    Perm.require(user, 'client.import'); Perm.require(user, 'client.edit');
    var rows = Util.parseCsv(text); V.req(rows.length > 1, 'The CSV has no data rows.'); V.req(rows.length <= 501, 'A maximum of 500 rows can be imported at once.');
    var head = rows[0].map(function (h) { return h.trim().toLowerCase(); });
    ['name', 'entity_type'].forEach(function (c) { V.req(head.indexOf(c) > -1, 'Missing required column: ' + c); });
    var report = { total: rows.length - 1, ok: 0, errors: [], created: [] }, seenPan = {}, users = DB.all('Users');
    for (var i = 1; i < rows.length; i++) {
      var o = {}; head.forEach(function (h, j) { o[h] = rows[i][j] === undefined ? '' : rows[i][j]; });
      try {
        if (o.partner_email) { var pu = users.filter(function (u) { return u.email.toLowerCase() === o.partner_email.trim().toLowerCase(); })[0]; V.req(pu, 'Partner email not found: ' + o.partner_email); o.partner_id = pu.user_id; }
        delete o.partner_email;
        var clean = sanitize(o, true, null); V.req(clean.name && clean.entity_type, 'Name and entity type are required.');
        if (clean.pan) { V.req(!seenPan[clean.pan], 'Duplicate PAN inside the file.'); seenPan[clean.pan] = 1; }
        checkDup(clean, null);
        if (!dryRun) { var saved = save(user, clean); report.created.push(saved.client_id); }
        report.ok++;
      } catch (e) { report.errors.push({ row: i + 1, message: e.message || String(e) }); }
    }
    Audit.log(user, dryRun ? 'IMPORT_CHECK' : 'IMPORT', 'Clients', 'Client', '', '', 'rows=' + report.total + ' ok=' + report.ok + ' errors=' + report.errors.length, '', 'OK');
    report.dryRun = !!dryRun; return report;
  }
  function exportCsv(user) {
    Perm.require(user, 'client.import');
    var rows = list(user, { pageSize: 200 }).rows;
    Audit.log(user, 'EXPORT', 'Clients', 'Client', '', '', 'rows=' + rows.length, '', 'OK');
    var cols = ['client_code', 'name', 'entity_type', 'pan', 'gstin', 'tan', 'state', 'contact_person', 'email', 'mobile', 'partner_name', 'status', 'pipeline_stage', 'agreed_fee'];
    return { filename: 'clients_' + Util.today() + '.csv', csv: Util.toCsv(cols, rows) };
  }
  return { save: save, list: list, get: get, changeStage: changeStage, saveContact: saveContact, removeContact: removeContact, saveService: saveService, removeService: removeService, importCsv: importCsv, exportCsv: exportCsv, CSV_COLS: CSV_COLS };
})();


// ======== Tasks.gs ========
/** Tasks.gs - work allocation, workflow (maker-checker), instructions, comments, reviews, recurring tasks. */
var Tasks = (function () {
  var TR = {
    'Draft': ['Assigned', 'Cancelled'],
    'Assigned': ['Acknowledged', 'Not Started', 'In Progress', 'On Hold', 'Cancelled'],
    'Acknowledged': ['Not Started', 'In Progress', 'On Hold', 'Cancelled'],
    'Not Started': ['In Progress', 'Waiting for Client Documents', 'On Hold', 'Cancelled'],
    'In Progress': ['Waiting for Client Documents', 'Blocked', 'On Hold', 'Submitted for Review', 'Completed', 'Cancelled'],
    'Waiting for Client Documents': ['In Progress', 'On Hold', 'Cancelled'],
    'Blocked': ['In Progress', 'On Hold', 'Cancelled'],
    'Submitted for Review': ['Under Review', 'Correction Required', 'On Hold', 'Cancelled'],
    'Under Review': ['Correction Required', 'Approved', 'On Hold', 'Cancelled'],
    'Correction Required': ['In Progress', 'Resubmitted', 'On Hold', 'Cancelled'],
    'Resubmitted': ['Under Review', 'Correction Required', 'On Hold', 'Cancelled'],
    'Approved': ['Completed'],
    'Completed': ['In Progress'],
    'On Hold': ['In Progress', 'Assigned', 'Cancelled'],
    'Cancelled': []
  };
  var WORKER_STATES = ['Acknowledged', 'Not Started', 'In Progress', 'Waiting for Client Documents', 'Blocked'];
  var TERMINAL = ['Completed', 'Cancelled', 'Approved'];

  function isManager(user, t) {
    if (!(Perm.has(user, 'task.assign') || Perm.has(user, 'task.approve') || Perm.has(user, 'task.create'))) return false;
    if (Perm.isTop(user)) return true;
    if (t.partner_id === user.user_id || t.senior_id === user.user_id) return true;
    return user.role === 'PARTNER' && Perm.canSeeClient(user, t.client_id);
  }
  function hist(taskId, event, from, to, actor, detail) { DB.insert('TaskHistory', { task_id: taskId, event: event, from_status: from || '', to_status: to || '', actor_id: actor, detail: Util.clean(detail, 900), at: Util.now() }, actor); }
  function names() { return Util.indexBy(DB.all('Users', true), 'user_id'); }
  function activeUser(id, label) { var u = DB.get('Users', id); V.req(u && u.is_active !== 'N', (label || 'User') + ' is not an active user.'); return u; }

  /* ---------- workload ---------- */
  function workload(userId) {
    var open = DB.where('TaskAssignments', function (a) { return a.user_id === userId && !a.released_at; }), hrs = 0, n = 0, soon = 0, review = 0, t0 = Util.today();
    var tmap = Util.indexBy(DB.all('Tasks'), 'task_id');
    var logged = {}; DB.where('TimeLogs', function (l) { return l.user_id === userId && l.task_id; }).forEach(function (l) { logged[l.task_id] = (logged[l.task_id] || 0) + l.minutes; });
    open.forEach(function (a) {
      var t = tmap[a.task_id]; if (!t || OPEN_STATUSES.indexOf(t.status) < 0 || t.status === 'Draft') return;
      n++; hrs += Math.max(0, (t.est_hours || 0) - (logged[t.task_id] || 0) / 60);
      if (t.due_date <= Util.addDays(t0, 7)) soon++;
      if (['Submitted for Review', 'Under Review', 'Resubmitted'].indexOf(t.status) > -1) review++;
    });
    var leaveDays = DB.where('LeaveRequests', function (l) { return l.user_id === userId && l.status === 'Approved' && l.to_date >= t0 && l.from_date <= Util.addDays(t0, 14); }).length;
    var perDay = Settings.num('work_hours_per_day', 8), capacity = Math.max(1, (10 - leaveDays)) * perDay; // two-week capacity heuristic
    return { open_tasks: n, est_hours_remaining: Util.r2(hrs), due_within_7_days: soon, awaiting_review: review, leave_days_next_14: leaveDays, capacity_hours_14d: capacity, utilisation_pct: Math.round(hrs / capacity * 100), overloaded: hrs > capacity * 0.9 || n >= 15 };
  }
  function overloadCheck(userIds, addHours, confirm) {
    var warns = [];
    userIds.forEach(function (id) {
      var w = workload(id); var projected = w.est_hours_remaining + (addHours || 0);
      if (w.overloaded || projected > w.capacity_hours_14d * 0.9) warns.push({ user_id: id, name: (DB.get('Users', id) || {}).full_name, workload: w, projected_hours: Util.r2(projected) });
    });
    if (warns.length && !confirm) throw new AppError('OVERLOAD', 'Workload warning: ' + warns.map(function (w) { return w.name + ' already has ' + w.workload.est_hours_remaining + 'h open (capacity ' + w.workload.capacity_hours_14d + 'h / 2 weeks)'; }).join('; ') + '. Confirm to assign anyway.', warns);
    return warns;
  }

  /* ---------- create ---------- */
  function taskPatch(d, existing) {
    var o = {};
    if (d.title !== undefined) o.title = Util.clean(d.title, 200);
    if (d.description !== undefined) o.description = Util.clean(d.description, 4000);
    if (d.priority !== undefined) o.priority = V.oneOf(d.priority || 'Medium', PRIORITIES, 'Priority');
    if (d.est_hours !== undefined) o.est_hours = V.num(d.est_hours || 0, 'Estimated hours', 0, 2000);
    if (d.start_date !== undefined) o.start_date = V.optDate(d.start_date, 'Start date');
    if (d.due_date !== undefined) o.due_date = V.date(d.due_date, 'Due date');
    ['fy', 'ay', 'billing_ref'].forEach(function (k) { if (d[k] !== undefined) o[k] = Util.clean(d[k], 40); });
    ['in_retainer', 'out_of_scope', 'requires_senior_review', 'requires_partner_approval'].forEach(function (k) { if (d[k] !== undefined) o[k] = (d[k] === true || d[k] === 'Y' || d[k] === 'true') ? 'Y' : 'N'; });
    if (d.service_id !== undefined) o.service_id = d.service_id;
    if (d.partner_id !== undefined) o.partner_id = d.partner_id;
    if (d.senior_id !== undefined) o.senior_id = d.senior_id;
    return o;
  }
  function create(user, d, opts) {
    opts = opts || {};
    Perm.require(user, 'task.create');
    V.req(d.client_id, 'Client is required.'); Perm.assertClient(user, d.client_id);
    var client = DB.get('Clients', d.client_id); V.req(client, 'Client not found.');
    var o = taskPatch(d);
    V.req(o.title, 'Work title is required.'); V.req(o.due_date, 'Due date is required.');
    if (o.start_date && o.due_date) V.req(o.due_date >= o.start_date, 'Due date cannot be before the start date.');
    o.client_id = d.client_id; o.priority = o.priority || 'Medium';
    o.partner_id = o.partner_id || client.partner_id || (user.role === 'PARTNER' ? user.user_id : '');
    o.senior_id = o.senior_id || client.senior_id || '';
    if (o.partner_id) activeUser(o.partner_id, 'Responsible partner'); if (o.senior_id) activeUser(o.senior_id, 'Senior');
    if (o.requires_partner_approval === undefined) o.requires_partner_approval = 'Y';
    if (o.requires_senior_review === undefined) o.requires_senior_review = o.senior_id ? 'Y' : 'N';
    o.fy = o.fy || client.fy || Util.fyOf(o.due_date);
    o.ay = o.ay || (function (fy) { var s = Util.fyStartYear(fy) + 1; return s + '-' + Util.pad((s + 1) % 100); })(o.fy);
    o.assigned_date = Util.today(); o.submission_no = 0; o.review_stage = '';
    o.instructions = Util.clean(d.instructions, 4000);
    ['template_id', 'rule_id', 'period_key', 'parent_task_id'].forEach(function (k) { if (d[k]) o[k] = d[k]; });
    var clerk = d.clerk_id || '', team = (d.team_ids || []).filter(function (x) { return x && x !== clerk; });
    var assignees = (clerk ? [clerk] : []).concat(team);
    assignees.forEach(function (id) { activeUser(id, 'Assignee'); });
    if (assignees.length) overloadCheck(assignees, o.est_hours, d.confirm_overload || opts.skipOverload);
    o.status = assignees.length && !d.draft ? 'Assigned' : 'Draft';
    o.task_no = 'T-' + o.fy.slice(0, 4) + '-' + String(DB.nextSeq('seq_task_' + o.fy.slice(0, 4))).padStart(4, '0');
    var t = DB.insert('Tasks', o, user.user_id);
    assignees.forEach(function (id, i) { DB.insert('TaskAssignments', { task_id: t.task_id, user_id: id, role_in_task: i === 0 && clerk ? 'PRIMARY' : 'TEAM', assigned_by: user.user_id, assigned_at: Util.now(), reason: 'Initial allocation' }, user.user_id); });
    if (o.instructions) DB.insert('TaskInstructions', { task_id: t.task_id, version: 1, author_id: user.user_id, text: o.instructions, previous_text: '', reason: 'Initial instruction', urgent: o.priority === 'Urgent' ? 'Y' : 'N', expected_deliverable: Util.clean(d.expected_deliverable, 500), attachment_refs: Util.clean(d.attachment_refs, 500) }, user.user_id);
    (d.checklist || []).forEach(function (txt, i) { var m = typeof txt === 'object'; DB.insert('TaskChecklistItems', { task_id: t.task_id, seq: i + 1, text: Util.clean(m ? txt.text : txt, 300), mandatory: m && txt.mandatory ? 'Y' : 'N', done: 'N' }, user.user_id); });
    (d.depends_on || []).forEach(function (dep) { addDependency(user, t.task_id, dep, true); });
    hist(t.task_id, 'CREATED', '', t.status, user.user_id, 'Task created' + (assignees.length ? ' and allocated' : ' as draft'));
    Audit.log(user, 'CREATE', 'Tasks', 'Task', t.task_id, '', { no: t.task_no, client: t.client_id, due: t.due_date, status: t.status }, '', 'OK');
    if (assignees.length && t.status === 'Assigned') Notify.send(assignees, 'TASK_ASSIGNED', 'New assignment: ' + t.title, 'Due ' + t.due_date + (t.priority === 'Urgent' ? ' (URGENT)' : ''), 'Task', t.task_id);
    return t;
  }

  function addDependency(user, taskId, depId, silent) {
    V.req(taskId !== depId, 'A task cannot depend on itself.');
    var seen = {}, stack = [depId];
    while (stack.length) { var cur = stack.pop(); if (cur === taskId) throw new AppError('VALIDATION', 'This dependency would create a circular chain.'); if (seen[cur]) continue; seen[cur] = 1; DB.where('TaskDependencies', function (x) { return x.task_id === cur; }).forEach(function (x) { stack.push(x.depends_on_task_id); }); }
    if (DB.findOne('TaskDependencies', function (x) { return x.task_id === taskId && x.depends_on_task_id === depId; })) return null;
    var r = DB.insert('TaskDependencies', { task_id: taskId, depends_on_task_id: depId }, user.user_id);
    if (!silent) hist(taskId, 'DEPENDENCY', '', '', user.user_id, 'Depends on ' + depId);
    return r;
  }
  function unmetDeps(taskId) {
    return DB.where('TaskDependencies', function (x) { return x.task_id === taskId; }).map(function (x) { return DB.get('Tasks', x.depends_on_task_id); }).filter(function (t) { return t && ['Completed', 'Approved', 'Cancelled'].indexOf(t.status) < 0; });
  }

  /* ---------- reads ---------- */
  function mapTaskRow(t, users, assignMap) {
    var a = assignMap[t.task_id] || [], prim = a.filter(function (x) { return x.role_in_task === 'PRIMARY'; })[0] || a[0];
    var overdue = OPEN_STATUSES.indexOf(t.status) > -1 && t.status !== 'Draft' && t.due_date < Util.today();
    return { task_id: t.task_id, task_no: t.task_no, title: t.title, client_id: t.client_id, client_name: (t.__cname || ''), service_id: t.service_id, priority: t.priority, status: t.status, due_date: t.due_date, est_hours: t.est_hours,
      partner_id: t.partner_id, partner_name: (users[t.partner_id] || {}).full_name || '', assignee_ids: a.map(function (x) { return x.user_id; }), assignee_names: a.map(function (x) { return (users[x.user_id] || {}).full_name || ''; }).join(', '),
      primary_name: prim ? (users[prim.user_id] || {}).full_name : '', overdue: overdue, fy: t.fy, review_stage: t.review_stage, period_key: t.period_key };
  }
  function list(user, p) {
    Perm.require(user, 'task.view'); p = p || {};
    var users = names(), clients = Util.indexBy(DB.all('Clients', true), 'client_id'), assignMap = Util.groupBy(DB.where('TaskAssignments', function (a) { return !a.released_at; }), function (a) { return a.task_id; });
    var statuses = p.status ? [].concat(p.status) : null, t0 = Util.today(), q = String(p.q || '').toLowerCase();
    var rows = DB.all('Tasks').filter(function (t) {
      if (!Perm.canSeeTask(user, t)) return false;
      var ids = (assignMap[t.task_id] || []).map(function (a) { return a.user_id; });
      if (p.mine && ids.indexOf(user.user_id) < 0) return false;
      if (p.client_id && t.client_id !== p.client_id) return false;
      if (p.partner_id && t.partner_id !== p.partner_id) return false;
      if (p.user_id && ids.indexOf(p.user_id) < 0) return false;
      if (p.service_id && t.service_id !== p.service_id) return false;
      if (statuses && statuses.indexOf(t.status) < 0) return false;
      if (p.from && t.due_date < p.from) return false; if (p.to && t.due_date > p.to) return false;
      if (p.overdue && !(OPEN_STATUSES.indexOf(t.status) > -1 && t.status !== 'Draft' && t.due_date < t0)) return false;
      if (p.awaiting_review && ['Submitted for Review', 'Under Review', 'Resubmitted'].indexOf(t.status) < 0) return false;
      if (p.awaiting_docs && t.status !== 'Waiting for Client Documents') return false;
      if (p.open_only && OPEN_STATUSES.indexOf(t.status) < 0) return false;
      if (q && (t.title + ' ' + t.task_no + ' ' + ((clients[t.client_id] || {}).name || '')).toLowerCase().indexOf(q) < 0) return false;
      return true;
    }).map(function (t) { t.__cname = (clients[t.client_id] || {}).name || ''; return mapTaskRow(t, users, assignMap); });
    rows.sort(function (a, b) { return a.due_date < b.due_date ? -1 : a.due_date > b.due_date ? 1 : 0; });
    var total = rows.length, page = Math.max(1, parseInt(p.page || 1, 10)), size = Math.min(500, parseInt(p.pageSize || 100, 10));
    return { rows: rows.slice((page - 1) * size, page * size), total: total, page: page, pageSize: size };
  }
  function get(user, id) {
    var t = DB.get('Tasks', id); Perm.assertTask(user, t);
    var users = names(), sensitive = false;
    var unread = {}; // mark related notifications read
    DB.where('Notifications', function (n) { return n.user_id === user.user_id && n.ref_type === 'Task' && n.ref_id === id && n.is_read !== 'Y'; }).forEach(function (n) { DB.update('Notifications', n.notification_id, { is_read: 'Y', read_at: Util.now() }, user.user_id); });
    var assignments = DB.where('TaskAssignments', function (a) { return a.task_id === id; }).map(function (a) { a.name = (users[a.user_id] || {}).full_name; return a; });
    var comments = DB.where('TaskComments', function (c) { return c.task_id === id; }).map(function (c) { c.author_name = (users[c.author_id] || {}).full_name; return c; });
    var time = DB.where('TimeLogs', function (l) { return l.task_id === id; });
    var logged = Util.sum(time, function (l) { return l.minutes; });
    var client = DB.get('Clients', t.client_id);
    var isAssignee = Perm.isAssignee(user, id), mgr = isManager(user, t);
    return { task: t, client: client ? { client_id: client.client_id, name: client.name, client_code: client.client_code } : null,
      assignments: assignments, checklist: DB.where('TaskChecklistItems', function (c) { return c.task_id === id; }).sort(function (a, b) { return a.seq - b.seq; }),
      instructions: DB.where('TaskInstructions', function (x) { return x.task_id === id; }).sort(function (a, b) { return a.version - b.version; }).map(function (x) { x.author_name = (users[x.author_id] || {}).full_name; return x; }),
      comments: comments, reviews: DB.where('TaskReviews', function (r) { return r.task_id === id; }).map(function (r) { r.reviewer_name = (users[r.reviewer_id] || {}).full_name; return r; }),
      history: DB.where('TaskHistory', function (h) { return h.task_id === id; }).map(function (h) { h.actor_name = (users[h.actor_id] || {}).full_name || h.actor_id; return h; }),
      dependencies: DB.where('TaskDependencies', function (x) { return x.task_id === id; }).map(function (x) { var d = DB.get('Tasks', x.depends_on_task_id); return { id: x.id, task_id: d.task_id, task_no: d.task_no, title: d.title, status: d.status }; }),
      logged_hours: Util.r2(logged / 60), documents: Perm.has(user, 'docs.view') ? DB.where('Documents', function (d) { return d.task_id === id; }).map(function (d) { return { doc_id: d.doc_id, file_name: d.file_name, description: d.description, upload_date: d.upload_date, category: d.category }; }) : [],
      emails: DB.where('EmailQueue', function (e) { return e.task_id === id; }).map(function (e) { return { queue_id: e.queue_id, subject: e.subject, status: e.status }; }),
      can: { work: isAssignee && Perm.has(user, 'task.work'), manage: mgr, review: canReview(user, t, false), approve: canReview(user, t, true) } };
  }

  /* ---------- update, assign ---------- */
  function update(user, id, d) {
    var t = DB.get('Tasks', id); Perm.assertTask(user, t); V.req(isManager(user, t), 'Only the responsible partner or senior can change a task.');
    V.req(['Completed', 'Cancelled'].indexOf(t.status) < 0, 'A ' + t.status.toLowerCase() + ' task cannot be edited. Reopen it first.');
    var o = taskPatch(d);
    delete o.status;
    if (o.due_date && o.due_date !== t.due_date) { V.req(Util.clean(d.reason, 300), 'A reason is required to change the due date.'); }
    if (o.partner_id) activeUser(o.partner_id, 'Partner'); if (o.senior_id) activeUser(o.senior_id, 'Senior');
    var upd = DB.update('Tasks', id, o, user.user_id), df = Audit.diff(t, upd);
    if (Object.keys(df.next).length) {
      hist(id, 'UPDATED', t.status, upd.status, user.user_id, JSON.stringify(df.next).slice(0, 400) + (d.reason ? ' | Reason: ' + d.reason : ''));
      Audit.log(user, o.due_date && o.due_date !== t.due_date ? 'DUE_DATE_CHANGE' : 'UPDATE', 'Tasks', 'Task', id, df.prev, df.next, d.reason || '', 'OK');
      if (o.due_date && o.due_date !== t.due_date) Notify.send(Perm.participants(id), 'TASK_DUE_CHANGED', 'Due date changed: ' + t.title, t.due_date + ' -> ' + o.due_date, 'Task', id);
    }
    return upd;
  }
  function assign(user, id, d) {
    var t = DB.get('Tasks', id); Perm.assertTask(user, t); Perm.require(user, 'task.assign');
    V.req(isManager(user, t), 'You are not authorised to allocate this task.');
    V.req(['Completed', 'Cancelled'].indexOf(t.status) < 0, 'Cannot allocate a ' + t.status.toLowerCase() + ' task.');
    var clerk = d.clerk_id || '', team = (d.team_ids || []).filter(function (x) { return x && x !== clerk; }), all = (clerk ? [clerk] : []).concat(team);
    V.req(all.length, 'Select at least one person to allocate the task to.');
    all.forEach(function (x) { activeUser(x, 'Assignee'); });
    var current = DB.where('TaskAssignments', function (a) { return a.task_id === id && !a.released_at; }), curIds = current.map(function (a) { return a.user_id; });
    var changed = all.length !== curIds.length || all.some(function (x) { return curIds.indexOf(x) < 0; });
    if (!changed && (current.filter(function (a) { return a.role_in_task === 'PRIMARY'; })[0] || {}).user_id === (clerk || undefined)) return t;
    if (current.length) V.req(Util.clean(d.reason, 300), 'A reason is required when reassigning work.');
    var added = all.filter(function (x) { return curIds.indexOf(x) < 0; });
    if (added.length) overloadCheck(added, t.est_hours, d.confirm_overload);
    current.forEach(function (a) { DB.update('TaskAssignments', a.assignment_id, { released_at: Util.now(), reason: Util.clean(d.reason || 'Reallocated', 300) }, user.user_id); });
    all.forEach(function (x, i) { DB.insert('TaskAssignments', { task_id: id, user_id: x, role_in_task: i === 0 && clerk ? 'PRIMARY' : 'TEAM', assigned_by: user.user_id, assigned_at: Util.now(), reason: Util.clean(d.reason || 'Allocated', 300) }, user.user_id); });
    var patch = {}; if (t.status === 'Draft') patch.status = 'Assigned';
    var upd = Object.keys(patch).length ? DB.update('Tasks', id, patch, user.user_id) : t;
    hist(id, current.length ? 'REASSIGNED' : 'ASSIGNED', t.status, upd.status, user.user_id, 'To: ' + all.map(function (x) { return (DB.get('Users', x) || {}).full_name; }).join(', ') + (d.reason ? ' | ' + d.reason : ''));
    Audit.log(user, current.length ? 'REASSIGN' : 'ASSIGN', 'Tasks', 'Task', id, curIds.join(','), all.join(','), d.reason || '', 'OK');
    Notify.send(added, 'TASK_ASSIGNED', 'New assignment: ' + t.title, 'Due ' + t.due_date, 'Task', id);
    Notify.send(curIds.filter(function (x) { return all.indexOf(x) < 0; }), 'TASK_REASSIGNED', 'Task reallocated: ' + t.title, 'You are no longer assigned. ' + (d.reason || ''), 'Task', id);
    return upd;
  }

  /* ---------- workflow ---------- */
  function acknowledge(user, id) {
    var t = DB.get('Tasks', id); Perm.assertTask(user, t); V.req(Perm.isAssignee(user, id), 'Only an assigned user can acknowledge a task.');
    V.req(t.status === 'Assigned', 'This task is not waiting for acknowledgement.');
    var a = DB.findOne('TaskAssignments', function (x) { return x.task_id === id && x.user_id === user.user_id && !x.released_at; });
    DB.update('TaskAssignments', a.assignment_id, { ack_at: Util.now() }, user.user_id);
    var upd = DB.update('Tasks', id, { status: 'Acknowledged' }, user.user_id);
    hist(id, 'STATUS', 'Assigned', 'Acknowledged', user.user_id, 'Acknowledged by ' + user.full_name);
    Notify.send([t.partner_id, t.senior_id], 'TASK_ACK', 'Acknowledged: ' + t.title, user.full_name + ' acknowledged the assignment', 'Task', id);
    return upd;
  }
  /** Simple status moves by the person doing the work (or the manager). */
  function setStatus(user, id, to, remarks) {
    var t = DB.get('Tasks', id); Perm.assertTask(user, t); V.oneOf(to, TASK_STATUSES, 'Status');
    V.req(TR[t.status] && TR[t.status].indexOf(to) > -1, 'A task cannot move from "' + t.status + '" to "' + to + '".');
    var mgr = isManager(user, t), asg = Perm.isAssignee(user, id) && Perm.has(user, 'task.work');
    remarks = Util.clean(remarks, 500);
    if (['Submitted for Review', 'Resubmitted'].indexOf(to) > -1) throw new AppError('VALIDATION', 'Use "Submit for review" to send work for review.');
    if (['Under Review', 'Approved'].indexOf(to) > -1 || (to === 'Correction Required')) throw new AppError('FORBIDDEN', 'Review outcomes are recorded through the review action.');
    if (to === 'Completed') {
      V.req(t.status === 'In Progress', 'Only work in progress can be marked complete.');
      V.req(t.requires_senior_review !== 'Y' && t.requires_partner_approval !== 'Y', 'This task requires review/approval. Submit it for review instead.');
      V.req(asg || mgr, 'You are not authorised to complete this task.');
      checkChecklist(id);
    } else if (WORKER_STATES.indexOf(to) > -1) {
      V.req(asg || mgr, 'Only the assigned team or the responsible partner can change the status.');
      if (to === 'In Progress') { var un = unmetDeps(id); V.req(!un.length, 'Blocked by unfinished dependencies: ' + un.map(function (x) { return x.task_no; }).join(', ') + '.'); }
      if (['Blocked', 'Waiting for Client Documents'].indexOf(to) > -1) V.req(remarks, 'Please give a reason.');
    } else if (to === 'On Hold') { V.req(asg || mgr, 'You are not authorised to hold this task.'); V.req(remarks, 'Please give a reason for putting the task on hold.'); }
    else if (to === 'Cancelled') { V.req(mgr, 'Only the responsible partner or senior can cancel a task.'); V.req(remarks, 'Please give a reason for cancelling.'); }
    else if (to === 'Assigned') { V.req(mgr, 'Only a manager can release a task from hold.'); }
    else if (to === 'Draft') { V.req(mgr, 'Not allowed.'); }
    if (t.status === 'Completed' && to === 'In Progress') { V.req(mgr, 'Only the responsible partner can reopen a completed task.'); V.req(remarks, 'Please give a reason for reopening.'); }
    var patch = { status: to };
    if (to === 'In Progress' && !t.start_date) patch.start_date = Util.today();
    if (to === 'Completed') patch.completed_date = Util.today();
    if (to === 'On Hold' || to === 'Blocked' || to === 'Waiting for Client Documents') patch.hold_reason = remarks;
    if (t.status === 'Completed') patch.completed_date = '';
    var upd = DB.update('Tasks', id, patch, user.user_id);
    hist(id, 'STATUS', t.status, to, user.user_id, remarks);
    Audit.log(user, 'STATUS', 'Tasks', 'Task', id, t.status, to, remarks, 'OK');
    if (['Blocked', 'Waiting for Client Documents', 'On Hold'].indexOf(to) > -1) Notify.send([t.partner_id, t.senior_id], 'TASK_' + to.toUpperCase().replace(/ /g, '_'), to + ': ' + t.title, remarks, 'Task', id);
    if (to === 'Cancelled') Notify.send(Perm.participants(id), 'TASK_CANCELLED', 'Task cancelled: ' + t.title, remarks, 'Task', id);
    return upd;
  }
  function checkChecklist(id) {
    var open = DB.where('TaskChecklistItems', function (c) { return c.task_id === id && c.mandatory === 'Y' && c.done !== 'Y'; });
    V.req(!open.length, 'Complete the mandatory checklist items first: ' + open.map(function (c) { return c.text; }).slice(0, 3).join('; ') + '.');
  }
  function submit(user, id, note) {
    var t = DB.get('Tasks', id); Perm.assertTask(user, t);
    V.req(Perm.isAssignee(user, id) && Perm.has(user, 'task.work'), 'Only the assigned user can submit work.');
    V.req(['In Progress', 'Correction Required'].indexOf(t.status) > -1, 'Only work in progress (or returned for correction) can be submitted.');
    var un = unmetDeps(id); V.req(!un.length, 'Blocked by unfinished dependencies: ' + un.map(function (x) { return x.task_no; }).join(', ') + '.');
    checkChecklist(id);
    var resub = t.status === 'Correction Required', n = t.submission_no + 1, needSenior = t.requires_senior_review === 'Y', needPartner = t.requires_partner_approval === 'Y';
    if (!needSenior && !needPartner) return setStatus(user, id, 'Completed', note);
    // duplicate-submission guard: same submission number already recorded
    var upd = DB.update('Tasks', id, { status: resub ? 'Resubmitted' : 'Submitted for Review', submission_no: n, review_stage: needSenior ? 'SENIOR' : 'PARTNER' }, user.user_id);
    hist(id, resub ? 'RESUBMITTED' : 'SUBMITTED', t.status, upd.status, user.user_id, 'Submission #' + n + (note ? ': ' + Util.clean(note, 500) : ''));
    Audit.log(user, resub ? 'RESUBMIT' : 'SUBMIT', 'Tasks', 'Task', id, t.status, upd.status, note || '', 'OK');
    var reviewers = needSenior ? [t.senior_id, t.partner_id] : [t.partner_id];
    Notify.send(reviewers, 'REVIEW_REQUEST', 'Submitted for review: ' + t.title, user.full_name + ' submitted #' + n, 'Task', id);
    return upd;
  }
  function canReview(user, t, finalOnly) {
    if (['Submitted for Review', 'Under Review', 'Resubmitted'].indexOf(t.status) < 0) return false;
    if (Perm.isAssignee(user, t.task_id)) return false; // maker-checker
    var partnerLike = (Perm.has(user, 'task.approve') && (Perm.isTop(user) || t.partner_id === user.user_id || (user.role === 'PARTNER' && Perm.canSeeClient(user, t.client_id))));
    if (partnerLike) return true;
    if (finalOnly) return false;
    return t.review_stage === 'SENIOR' && Perm.has(user, 'task.review') && (t.senior_id === user.user_id || Perm.isTop(user));
  }
  function review(user, id, d) {
    var t = DB.get('Tasks', id); Perm.assertTask(user, t);
    V.oneOf(d.outcome, ['Approved', 'Correction Required', 'Rejected', 'More Information Required', 'On Hold'], 'Outcome');
    V.req(!Perm.isAssignee(user, id), 'Maker-checker rule: you cannot review work you are assigned to.');
    V.req(canReview(user, t, false), 'You are not authorised to review this task at its current stage.');
    var remarks = Util.clean(d.remarks, 1500);
    if (d.outcome !== 'Approved') V.req(remarks, 'Review remarks are required for this outcome.');
    var partnerAct = Perm.has(user, 'task.approve') && (Perm.isTop(user) || t.partner_id === user.user_id || user.role === 'PARTNER');
    var stage = (t.review_stage === 'SENIOR' && !partnerAct) ? 'SENIOR' : 'PARTNER';
    if (d.outcome === 'Rejected') V.req(partnerAct, 'Only a partner can reject a submission.');
    DB.insert('TaskReviews', { task_id: id, submission_no: t.submission_no, stage: stage, reviewer_id: user.user_id, outcome: d.outcome, remarks: remarks, reviewed_at: Util.now() }, user.user_id);
    var patch, ev = d.outcome;
    var assignees = Perm.participants(id);
    if (d.outcome === 'Approved') {
      if (stage === 'SENIOR' && t.requires_partner_approval === 'Y') {
        patch = { status: 'Under Review', review_stage: 'PARTNER' };
        Notify.send([t.partner_id], 'REVIEW_REQUEST', 'Awaiting your approval: ' + t.title, 'Senior review approved by ' + user.full_name, 'Task', id);
      } else {
        patch = { status: 'Completed', review_stage: '', completed_date: Util.today() };
        hist(id, 'STATUS', t.status, 'Approved', user.user_id, 'Approved by ' + user.full_name);
        Notify.send(assignees.concat([t.partner_id]), 'TASK_APPROVED', 'Approved: ' + t.title, remarks, 'Task', id);
      }
    } else if (d.outcome === 'Rejected') { patch = { status: 'Correction Required', review_stage: '' }; Notify.send(assignees, 'CORRECTION', 'Submission rejected: ' + t.title, remarks, 'Task', id); }
    else if (d.outcome === 'Correction Required' || d.outcome === 'More Information Required') { patch = { status: 'Correction Required', review_stage: '' }; Notify.send(assignees, 'CORRECTION', (d.outcome === 'More Information Required' ? 'More information needed: ' : 'Correction required: ') + t.title, remarks, 'Task', id); }
    else { patch = { status: 'On Hold', hold_reason: remarks }; }
    var upd = DB.update('Tasks', id, patch, user.user_id);
    hist(id, 'REVIEW', t.status, upd.status, user.user_id, d.outcome + (remarks ? ': ' + remarks : '') + ' (' + stage + ', submission #' + t.submission_no + ')');
    Audit.log(user, 'REVIEW', 'Tasks', 'Task', id, t.status, upd.status, d.outcome + ' ' + remarks, 'OK');
    if (d.outcome !== 'Approved' || upd.status === 'Completed') DB.insert('TaskComments', { task_id: id, parent_id: '', author_id: user.user_id, text: d.outcome + (remarks ? ': ' + remarks : ''), kind: 'REVIEW', is_internal: 'Y' }, user.user_id);
    return upd;
  }

  /* ---------- instructions & comments ---------- */
  function addInstruction(user, id, d) {
    var t = DB.get('Tasks', id); Perm.assertTask(user, t); Perm.require(user, 'instruction.write');
    V.req(isManager(user, t), 'Only the responsible partner or senior can write instructions.');
    var text = Util.clean(d.text, 4000); V.req(text, 'Instruction text is required.');
    var ins = DB.where('TaskInstructions', function (x) { return x.task_id === id; }), v = ins.length + 1;
    if (v > 1) V.req(Util.clean(d.reason, 300), 'A reason is required when revising an instruction.');
    var r = DB.insert('TaskInstructions', { task_id: id, version: v, author_id: user.user_id, text: text, previous_text: t.instructions, reason: Util.clean(d.reason, 300) || 'Initial instruction', urgent: d.urgent ? 'Y' : 'N', expected_deliverable: Util.clean(d.expected_deliverable, 500), attachment_refs: Util.clean(d.attachment_refs, 500) }, user.user_id);
    DB.update('Tasks', id, { instructions: text }, user.user_id);
    hist(id, 'INSTRUCTION', t.status, t.status, user.user_id, 'Instruction v' + v + (d.urgent ? ' (URGENT)' : ''));
    Audit.log(user, 'INSTRUCTION', 'Tasks', 'TaskInstructions', r.instruction_id, t.instructions, text, d.reason || '', 'OK');
    Notify.send(Perm.participants(id), 'INSTRUCTION', (d.urgent ? 'URGENT instruction: ' : 'Revised instruction: ') + t.title, text.slice(0, 200), 'Task', id);
    return r;
  }
  function addComment(user, id, d) {
    var t = DB.get('Tasks', id); Perm.assertTask(user, t);
    var text = Util.clean(d.text, 3000); V.req(text, 'Comment text is required.');
    var kind = d.kind || 'COMMENT'; V.oneOf(kind, ['COMMENT', 'NOTE', 'QUESTION', 'REPLY'], 'Kind');
    if (d.parent_id) { var p = DB.get('TaskComments', d.parent_id); V.req(p && p.task_id === id, 'Parent comment not found.'); kind = 'REPLY'; }
    var users = DB.all('Users'), mentions = [];
    (text.match(/@([A-Za-z0-9._\-]+)/g) || []).forEach(function (m) { var key = m.slice(1).toLowerCase(); var u = users.filter(function (x) { return x.email.split('@')[0].toLowerCase() === key || x.full_name.toLowerCase().replace(/\s+/g, '') === key; })[0]; if (u && mentions.indexOf(u.user_id) < 0) mentions.push(u.user_id); });
    var c = DB.insert('TaskComments', { task_id: id, parent_id: d.parent_id || '', author_id: user.user_id, text: text, kind: kind, mentions: mentions.join(','), attachment_refs: Util.clean(d.attachment_refs, 500), is_internal: 'Y' }, user.user_id);
    var others = Perm.participants(id).concat([t.partner_id, t.senior_id]).filter(function (x) { return x && x !== user.user_id; });
    Notify.send(mentions.filter(function (x) { return x !== user.user_id; }), 'MENTION', user.full_name + ' mentioned you on ' + t.title, text.slice(0, 200), 'Task', id);
    Notify.send(others.filter(function (x) { return mentions.indexOf(x) < 0; }), 'COMMENT', (kind === 'QUESTION' ? 'Question on ' : 'New comment on ') + t.title, text.slice(0, 200), 'Task', id);
    return c;
  }
  function toggleChecklist(user, itemId, done) {
    var it = DB.get('TaskChecklistItems', itemId); V.req(it, 'Checklist item not found.');
    var t = DB.get('Tasks', it.task_id); Perm.assertTask(user, t); V.req(isManager(user, t) || Perm.isAssignee(user, t.task_id), 'Not allowed.');
    return DB.update('TaskChecklistItems', itemId, { done: done ? 'Y' : 'N', done_by: done ? user.user_id : '', done_at: done ? Util.now() : '' }, user.user_id);
  }
  function addChecklistItem(user, id, text, mandatory) {
    var t = DB.get('Tasks', id); Perm.assertTask(user, t); V.req(isManager(user, t), 'Only a manager can add checklist items.');
    var n = DB.where('TaskChecklistItems', function (c) { return c.task_id === id; }).length;
    return DB.insert('TaskChecklistItems', { task_id: id, seq: n + 1, text: Util.clean(text, 300), mandatory: mandatory ? 'Y' : 'N', done: 'N' }, user.user_id);
  }
  function addDep(user, id, depId) { var t = DB.get('Tasks', id); Perm.assertTask(user, t); V.req(isManager(user, t), 'Only a manager can set dependencies.'); var d = DB.get('Tasks', depId); Perm.assertTask(user, d); return addDependency(user, id, depId); }
  function removeDep(user, depRowId) { var x = DB.get('TaskDependencies', depRowId); V.req(x, 'Not found.'); var t = DB.get('Tasks', x.task_id); Perm.assertTask(user, t); V.req(isManager(user, t), 'Only a manager can change dependencies.'); DB.deactivate('TaskDependencies', depRowId, user.user_id); return true; }

  /* ---------- bulk ---------- */
  function bulkCreate(user, d) {
    Perm.require(user, 'task.bulk'); Perm.require(user, 'task.create');
    V.req(Array.isArray(d.client_ids) && d.client_ids.length, 'Select at least one client.'); V.req(d.client_ids.length <= 100, 'A maximum of 100 clients per bulk run.');
    var tpl = d.template_id ? DB.get('TaskTemplates', d.template_id) : null; if (d.template_id) V.req(tpl, 'Template not found.');
    var out = { created: [], skipped: [] };
    d.client_ids.forEach(function (cid) {
      try {
        var c = DB.get('Clients', cid); V.req(c, 'Client not found.');
        var title = Util.clean(d.title || (tpl ? tpl.title_pattern : ''), 200).replace(/\{\{client\}\}/g, c.name).replace(/\{\{period\}\}/g, d.period || '');
        V.req(title, 'Title is required.');
        var due = d.due_date || (tpl && tpl.default_due_offset_days ? Util.addDays(Util.today(), tpl.default_due_offset_days) : '');
        var dupKey = d.period_key || '';
        if (dupKey && DB.findOne('Tasks', function (t) { return t.client_id === cid && t.template_id === (d.template_id || '') && t.period_key === dupKey && t.status !== 'Cancelled'; })) { out.skipped.push({ client_id: cid, reason: 'Already exists for ' + dupKey }); return; }
        var t = create(user, { client_id: cid, title: title, description: d.description || (tpl && tpl.description), instructions: d.instructions || (tpl && tpl.instructions), due_date: due, est_hours: d.est_hours !== undefined ? d.est_hours : (tpl && tpl.est_hours),
          priority: d.priority || (tpl && tpl.priority) || 'Medium', service_id: d.service_id || (tpl && tpl.service_id) || '', clerk_id: d.clerk_id || c.clerk_id || '', team_ids: d.team_ids || [], partner_id: d.partner_id || '', senior_id: d.senior_id || '',
          requires_senior_review: tpl ? tpl.requires_senior_review : d.requires_senior_review, requires_partner_approval: tpl ? tpl.requires_partner_approval : d.requires_partner_approval,
          checklist: tpl && tpl.checklist ? tpl.checklist.split('|').map(function (x) { return x.trim(); }).filter(Boolean) : (d.checklist || []), template_id: d.template_id || '', period_key: dupKey, confirm_overload: true, fy: d.fy }, { skipOverload: true });
        out.created.push(t.task_id);
      } catch (e) { out.skipped.push({ client_id: cid, reason: e.message }); }
    });
    Audit.log(user, 'BULK_CREATE', 'Tasks', 'Task', '', '', 'created=' + out.created.length + ' skipped=' + out.skipped.length, '', 'OK');
    return out;
  }
  function bulkReassign(user, d) {
    Perm.require(user, 'task.bulk'); V.req(Array.isArray(d.task_ids) && d.task_ids.length, 'Select tasks.'); V.req(Util.clean(d.reason, 300), 'A reason is required.'); V.req(d.clerk_id, 'Select the new assignee.');
    var out = { updated: [], failed: [] };
    d.task_ids.forEach(function (id) { try { assign(user, id, { clerk_id: d.clerk_id, team_ids: [], reason: d.reason, confirm_overload: d.confirm_overload }); out.updated.push(id); } catch (e) { out.failed.push({ task_id: id, reason: e.message }); } });
    Audit.log(user, 'BULK_REASSIGN', 'Tasks', 'Task', '', '', 'ok=' + out.updated.length + ' failed=' + out.failed.length, d.reason, 'OK');
    return out;
  }
  function bulkDueDate(user, d) {
    Perm.require(user, 'task.bulk'); V.req(Array.isArray(d.task_ids) && d.task_ids.length, 'Select tasks.'); V.req(Util.clean(d.reason, 300), 'A reason is required.');
    var out = { updated: [], failed: [] };
    d.task_ids.forEach(function (id) {
      try {
        var t = DB.get('Tasks', id); Perm.assertTask(user, t);
        var nd = d.due_date || Util.addDays(t.due_date, V.num(d.shift_days, 'Shift days', -365, 365));
        update(user, id, { due_date: nd, reason: d.reason }); out.updated.push(id);
      } catch (e) { out.failed.push({ task_id: id, reason: e.message }); }
    });
    return out;
  }

  /* ---------- recurring ---------- */
  function periodFor(rule, asOf) {
    var f = rule.frequency, y = +asOf.slice(0, 4), m = +asOf.slice(5, 7), d = asOf;
    if (f === 'DAILY') return { key: d, start: d, end: d };
    if (f === 'WEEKLY') { var dw = Util.dow(d); var mon = Util.addDays(d, -((dw + 6) % 7)); return { key: 'W' + mon, start: mon, end: Util.addDays(mon, 6) }; }
    if (f === 'MONTHLY') return { key: y + '-' + Util.pad(m), start: y + '-' + Util.pad(m) + '-01', end: Util.monthEnd(y, m) };
    if (f === 'QUARTERLY') { var q = Math.floor((m - 1) / 3), sm = q * 3 + 1; return { key: y + '-Q' + (q + 1), start: y + '-' + Util.pad(sm) + '-01', end: Util.monthEnd(y, sm + 2) }; }
    if (f === 'HALF_YEARLY') { var h = m <= 6 ? 0 : 1, sm2 = h * 6 + 1; return { key: y + '-H' + (h + 1), start: y + '-' + Util.pad(sm2) + '-01', end: Util.monthEnd(y, sm2 + 5) }; }
    var fy = Util.fyOf(d), sy = Util.fyStartYear(fy); return { key: 'FY' + fy, start: sy + '-04-01', end: (sy + 1) + '-03-31' };
  }
  function previousPeriodDate(rule, asOf) {
    var f = rule.frequency;
    if (f === 'DAILY') return Util.addDays(asOf, -1); if (f === 'WEEKLY') return Util.addDays(asOf, -7);
    var p = periodFor(rule, asOf); return Util.addDays(p.start, -1);
  }
  /** Generates tasks for completed periods. Idempotent: (rule_id, period_key) is unique. */
  function generateRecurring(user, asOf) {
    asOf = asOf || Util.today();
    var out = { created: [], skipped: [], errors: [] };
    DB.where('RecurringTaskRules', function (r) { return r.status !== 'Paused' && r.start_date <= asOf && (!r.end_date || r.end_date >= asOf); }).forEach(function (rule) {
      try {
        var tpl = DB.get('TaskTemplates', rule.template_id), c = DB.get('Clients', rule.client_id);
        if (!tpl || !c || c.status === 'Closed') { out.skipped.push({ rule_id: rule.rule_id, reason: 'Template or client unavailable' }); return; }
        var cur = periodFor(rule, asOf), p = (cur.end < asOf) ? cur : periodFor(rule, previousPeriodDate(rule, asOf)); // last completed period
        if (p.end < rule.start_date) { out.skipped.push({ rule_id: rule.rule_id, reason: 'Period before rule start' }); return; }
        if (DB.findOne('Tasks', function (t) { return t.rule_id === rule.rule_id && t.period_key === p.key; })) { out.skipped.push({ rule_id: rule.rule_id, reason: 'Already generated for ' + p.key }); return; }
        if (user && user.user_id && user.user_id !== 'SYSTEM' && !Perm.canSeeClient(user, rule.client_id)) { out.skipped.push({ rule_id: rule.rule_id, reason: 'Client outside your access' }); return; }
        var partner = rule.partner_id || c.partner_id;
        var sysUser = { user_id: 'SYSTEM', role: 'ADMIN', full_name: 'System (recurring)', client_access: 'ALL', email: '' };
        var title = (tpl.title_pattern || tpl.name).replace(/\{\{client\}\}/g, c.name).replace(/\{\{period\}\}/g, p.key);
        var t = create(sysUser, { client_id: c.client_id, title: title, description: tpl.description, instructions: tpl.instructions, due_date: Util.addDays(p.end, rule.due_offset_days || tpl.default_due_offset_days || 0), est_hours: tpl.est_hours,
          priority: tpl.priority || 'Medium', service_id: tpl.service_id, partner_id: partner, senior_id: rule.senior_id || c.senior_id, clerk_id: rule.clerk_id || c.clerk_id,
          requires_senior_review: tpl.requires_senior_review, requires_partner_approval: tpl.requires_partner_approval, checklist: (tpl.checklist || '').split('|').map(function (x) { return x.trim(); }).filter(Boolean),
          template_id: tpl.template_id, rule_id: rule.rule_id, period_key: p.key, confirm_overload: true }, { skipOverload: true });
        DB.update('RecurringTaskRules', rule.rule_id, { last_period_key: p.key }, 'system');
        Audit.log({ user_id: 'system', role: 'SYSTEM' }, 'RECURRING_GENERATE', 'Tasks', 'Task', t.task_id, '', 'rule=' + rule.rule_id + ' period=' + p.key, '', 'OK');
        out.created.push(t.task_id);
      } catch (e) { out.errors.push({ rule_id: rule.rule_id, message: e.message }); }
    });
    return out;
  }

  return { create: create, list: list, get: get, update: update, assign: assign, acknowledge: acknowledge, setStatus: setStatus, submit: submit, review: review, addInstruction: addInstruction,
    addComment: addComment, toggleChecklist: toggleChecklist, addChecklistItem: addChecklistItem, addDep: addDep, removeDep: removeDep, bulkCreate: bulkCreate, bulkReassign: bulkReassign, bulkDueDate: bulkDueDate,
    generateRecurring: generateRecurring, workload: workload, isManager: isManager, canReview: canReview, TR: TR };
})();


// ======== TimeTracking.gs ========
/** TimeTracking.gs - time logs (start/pause/resume/stop/manual), corrections, attendance, leave, productivity and unallocated time. */
var Time = (function () {
  var MAX_DAY_MIN = 16 * 60;

  function running(userId) { return DB.findOne('TimeLogs', function (l) { return l.user_id === userId && l.state === 'RUNNING'; }); }
  function stopLog(log, endTs, userId) {
    var mins = Util.minutesBetween(log.start_ts, endTs);
    return DB.update('TimeLogs', log.log_id, { end_ts: endTs, minutes: mins, state: 'STOPPED' }, userId);
  }
  function start(user, d) {
    Perm.require(user, 'time.log'); d = d || {};
    var cat = V.oneOf(d.category || 'TASK', TIME_CATEGORIES, 'Category');
    V.req(!running(user.user_id), 'A timer is already running. Stop or pause it first.');
    var t = null;
    if (d.task_id) {
      t = DB.get('Tasks', d.task_id); Perm.assertTask(user, t); V.req(Perm.isAssignee(user, d.task_id), 'You can record task time only on tasks assigned to you.');
      V.req(['Completed', 'Cancelled', 'Approved'].indexOf(t.status) < 0, 'This task is closed.');
      cat = 'TASK';
      if (['Assigned', 'Acknowledged', 'Not Started'].indexOf(t.status) > -1) Tasks.setStatus(user, d.task_id, 'In Progress', 'Timer started');
    } else V.req(cat !== 'TASK', 'Select a task for task time.');
    var now = Util.now();
    return DB.insert('TimeLogs', { user_id: user.user_id, task_id: d.task_id || '', client_id: t ? t.client_id : (d.client_id || ''), log_date: now.slice(0, 10), start_ts: now, end_ts: '', minutes: 0, category: cat, description: Util.clean(d.description, 500),
      source: 'TIMER', state: 'RUNNING', session_id: d.session_id || Util.uid('SES'), corrected: 'N' }, user.user_id);
  }
  function stop(user) {
    var l = running(user.user_id); V.req(l, 'No timer is running.');
    var upd = stopLog(l, Util.now(), user.user_id);
    return upd;
  }
  function pause(user) { var r = stop(user); return r; }
  function resume(user, sessionId) {
    var prev = DB.where('TimeLogs', function (l) { return l.user_id === user.user_id && l.session_id === sessionId; }).pop(); V.req(prev, 'Earlier segment not found.');
    return start(user, { task_id: prev.task_id, category: prev.category, description: prev.description, session_id: sessionId, client_id: prev.client_id });
  }
  function overlaps(userId, startTs, endTs, exceptId) {
    return DB.where('TimeLogs', function (l) { return l.user_id === userId && l.log_id !== exceptId && l.end_ts && l.start_ts < endTs && l.end_ts > startTs; });
  }
  function manual(user, d) {
    Perm.require(user, 'time.log');
    var cat = V.oneOf(d.category || 'TASK', TIME_CATEGORIES, 'Category'), date = V.date(d.date, 'Date');
    V.req(date <= Util.today(), 'Time cannot be recorded for a future date.'); V.req(date >= Util.addDays(Util.today(), -31), 'Manual entries older than 31 days need a manager correction.');
    var st = String(d.start || ''), en = String(d.end || '');
    V.req(/^\d{2}:\d{2}$/.test(st) && /^\d{2}:\d{2}$/.test(en), 'Start and end times must be in HH:MM format.');
    var s = date + 'T' + st + ':00', e = date + 'T' + en + ':00'; V.req(e > s, 'End time must be after the start time.');
    V.req(e <= Util.now() || date < Util.today(), 'End time cannot be in the future.');
    var mins = Util.minutesBetween(s, e); V.req(mins <= MAX_DAY_MIN, 'A single entry cannot exceed 16 hours.');
    var t = null;
    if (d.task_id) { t = DB.get('Tasks', d.task_id); Perm.assertTask(user, t); V.req(Perm.isAssignee(user, d.task_id), 'You can record task time only on tasks assigned to you.'); cat = 'TASK'; } else V.req(cat !== 'TASK', 'Select a task for task time.');
    V.req(!overlaps(user.user_id, s, e).length, 'This entry overlaps with an existing time log.');
    var total = Util.sum(DB.where('TimeLogs', function (l) { return l.user_id === user.user_id && l.log_date === date; }), function (l) { return l.minutes; }) + mins;
    V.req(total <= MAX_DAY_MIN, 'Total recorded time for the day would exceed 16 hours.');
    var r = DB.insert('TimeLogs', { user_id: user.user_id, task_id: d.task_id || '', client_id: t ? t.client_id : '', log_date: date, start_ts: s, end_ts: e, minutes: mins, category: cat, description: Util.clean(d.description, 500), source: 'MANUAL', state: 'STOPPED', session_id: Util.uid('SES'), corrected: 'N' }, user.user_id);
    Audit.log(user, 'TIME_MANUAL', 'Time', 'TimeLogs', r.log_id, '', { date: date, minutes: mins, category: cat }, '', 'OK');
    return r;
  }
  function myLogs(user, p) {
    p = p || {}; var from = p.from || Util.addDays(Util.today(), -7), to = p.to || Util.today();
    var uid = p.user_id && p.user_id !== user.user_id ? p.user_id : user.user_id;
    if (uid !== user.user_id) { Perm.require(user, 'time.view_team'); V.req(Perm.canSeeUser(user, uid), 'You are not authorised to view this person\'s time logs.'); }
    var tmap = Util.indexBy(DB.all('Tasks'), 'task_id');
    return { rows: DB.where('TimeLogs', function (l) { return l.user_id === uid && l.log_date >= from && l.log_date <= to; }).sort(function (a, b) { return a.start_ts < b.start_ts ? 1 : -1; }).map(function (l) { l.task_title = (tmap[l.task_id] || {}).title || ''; return l; }), running: running(uid) };
  }
  function requestCorrection(user, d) {
    var l = DB.get('TimeLogs', d.log_id); V.req(l, 'Time log not found.'); V.req(l.user_id === user.user_id, 'You can request corrections only for your own time logs.');
    V.req(l.state === 'STOPPED', 'Stop the timer before requesting a correction.');
    var reason = Util.clean(d.reason, 400); V.req(reason, 'A reason is required.');
    var ns = d.new_start, ne = d.new_end; V.req(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(ns) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(ne), 'Provide new start and end as yyyy-mm-ddTHH:MM.');
    ns = ns.length === 16 ? ns + ':00' : ns; ne = ne.length === 16 ? ne + ':00' : ne; V.req(ne > ns, 'End must be after start.');
    var mins = Util.minutesBetween(ns, ne); V.req(mins <= MAX_DAY_MIN, 'A single entry cannot exceed 16 hours.');
    V.req(!DB.findOne('TimeCorrections', function (c) { return c.log_id === d.log_id && c.status === 'Pending'; }), 'A correction request is already pending for this log.');
    var r = DB.insert('TimeCorrections', { log_id: d.log_id, requested_by: user.user_id, old_start: l.start_ts, old_end: l.end_ts, old_minutes: l.minutes, new_start: ns, new_end: ne, new_minutes: mins, reason: reason, status: 'Pending' }, user.user_id);
    var mgrs = [user.reporting_manager_id, user.partner_id].filter(Boolean);
    Notify.send(mgrs, 'TIME_CORRECTION', 'Time correction requested', user.full_name + ': ' + reason, 'TimeCorrection', r.correction_id);
    Audit.log(user, 'TIME_CORRECTION_REQUEST', 'Time', 'TimeLogs', d.log_id, { start: l.start_ts, end: l.end_ts }, { start: ns, end: ne }, reason, 'OK');
    return r;
  }
  function applyCorrection(log, ns, ne, by) {
    var mins = Util.minutesBetween(ns, ne);
    V.req(!overlaps(log.user_id, ns, ne, log.log_id).length, 'The corrected time overlaps with another log.');
    return DB.update('TimeLogs', log.log_id, { start_ts: ns, end_ts: ne, minutes: mins, log_date: ns.slice(0, 10), corrected: 'Y' }, by);
  }
  function decideCorrection(user, id, approve, remarks) {
    Perm.require(user, 'time.correct');
    var c = DB.get('TimeCorrections', id); V.req(c && c.status === 'Pending', 'Request not found or already decided.');
    var l = DB.get('TimeLogs', c.log_id); V.req(Perm.canSeeUser(user, l.user_id), 'You are not authorised to decide this request.'); V.req(l.user_id !== user.user_id, 'You cannot approve your own correction.');
    if (approve) applyCorrection(l, c.new_start, c.new_end, user.user_id);
    DB.update('TimeCorrections', id, { status: approve ? 'Applied' : 'Rejected', decided_by: user.user_id, decided_at: Util.now(), decision_remarks: Util.clean(remarks, 300) }, user.user_id);
    Notify.send([c.requested_by], 'TIME_CORRECTION', 'Time correction ' + (approve ? 'approved' : 'rejected'), remarks || '', 'TimeCorrection', id);
    Audit.log(user, approve ? 'TIME_CORRECTION_APPROVE' : 'TIME_CORRECTION_REJECT', 'Time', 'TimeLogs', c.log_id, { start: c.old_start, end: c.old_end }, approve ? { start: c.new_start, end: c.new_end } : '', remarks || c.reason, 'OK');
    return true;
  }
  function correctDirect(user, d) {
    Perm.require(user, 'time.correct');
    var l = DB.get('TimeLogs', d.log_id); V.req(l, 'Time log not found.'); V.req(Perm.canSeeUser(user, l.user_id), 'You are not authorised to correct this log.'); V.req(l.user_id !== user.user_id, 'You cannot directly correct your own log; raise a correction request.');
    var reason = Util.clean(d.reason, 400); V.req(reason, 'A reason is required.'); V.req(l.state === 'STOPPED', 'Log is still running.');
    var upd = applyCorrection(l, d.new_start, d.new_end, user.user_id);
    Audit.log(user, 'TIME_CORRECT', 'Time', 'TimeLogs', l.log_id, { start: l.start_ts, end: l.end_ts, minutes: l.minutes }, { start: upd.start_ts, end: upd.end_ts, minutes: upd.minutes }, reason, 'OK');
    return upd;
  }
  function corrections(user) {
    var users = Util.indexBy(DB.all('Users'), 'user_id');
    return DB.all('TimeCorrections').filter(function (c) { return c.requested_by === user.user_id || (Perm.has(user, 'time.correct') && Perm.canSeeUser(user, c.requested_by)); }).map(function (c) { c.requested_by_name = (users[c.requested_by] || {}).full_name; return c; });
  }

  /* ---------- attendance ---------- */
  function checkIn(user) {
    var today = Util.today(), ex = DB.findOne('Attendance', function (a) { return a.user_id === user.user_id && a.att_date === today; });
    V.req(!ex, 'You have already checked in today.');
    var onLeave = DB.findOne('LeaveRequests', function (l) { return l.user_id === user.user_id && l.status === 'Approved' && l.from_date <= today && l.to_date >= today; });
    var r = DB.insert('Attendance', { user_id: user.user_id, att_date: today, check_in: Util.now(), status: onLeave ? 'On leave (checked in)' : 'Present', approval_status: 'Auto' }, user.user_id);
    return r;
  }
  function checkOut(user, d) {
    var today = Util.today(), a = DB.findOne('Attendance', function (x) { return x.user_id === user.user_id && x.att_date === today; });
    V.req(a, 'You have not checked in today.'); V.req(!a.check_out, 'You have already checked out.');
    V.req(!running(user.user_id), 'Stop your running timer before checking out.');
    var now = Util.now(), brk = V.num((d && d.break_minutes) || 0, 'Break minutes', 0, 600), gross = Util.minutesBetween(a.check_in, now);
    return DB.update('Attendance', a.att_id, { check_out: now, break_minutes: brk, hours: Util.r2(Math.max(0, gross - brk) / 60) }, user.user_id);
  }
  function attendanceList(user, p) {
    p = p || {}; var from = p.from || Util.addDays(Util.today(), -30), to = p.to || Util.today(), uid = p.user_id || user.user_id;
    if (uid !== user.user_id) { Perm.require(user, 'attendance.view_team'); V.req(Perm.canSeeUser(user, uid), 'You are not authorised to view this person.'); }
    return DB.where('Attendance', function (a) { return a.user_id === uid && a.att_date >= from && a.att_date <= to; }).sort(function (a, b) { return a.att_date < b.att_date ? 1 : -1; });
  }
  function attendanceCorrect(user, d) {
    Perm.require(user, 'attendance.view_team');
    var a = DB.get('Attendance', d.att_id); V.req(a, 'Attendance record not found.'); V.req(Perm.canSeeUser(user, a.user_id) && a.user_id !== user.user_id, 'You are not authorised to correct this record.');
    var reason = Util.clean(d.reason, 300); V.req(reason, 'A reason is required.');
    var ci = d.check_in || a.check_in, co = d.check_out || a.check_out; V.req(!co || co > ci, 'Check-out must be after check-in.');
    var brk = d.break_minutes !== undefined ? V.num(d.break_minutes, 'Break', 0, 600) : a.break_minutes;
    var upd = DB.update('Attendance', d.att_id, { check_in: ci, check_out: co, break_minutes: brk, hours: co ? Util.r2(Math.max(0, Util.minutesBetween(ci, co) - brk) / 60) : 0, remarks: reason, approval_status: 'Corrected by ' + user.full_name }, user.user_id);
    Audit.log(user, 'ATTENDANCE_CORRECT', 'Attendance', 'Attendance', d.att_id, { in: a.check_in, out: a.check_out }, { in: ci, out: co }, reason, 'OK'); return upd;
  }

  /* ---------- leave ---------- */
  function workingDaysBetween(from, to) {
    var days = Settings.get('work_days', '1,2,3,4,5,6').split(',').map(Number), hol = Settings.get('holidays', '').split(',').map(function (x) { return x.trim(); }), n = 0;
    for (var d = from; d <= to; d = Util.addDays(d, 1)) if (days.indexOf(Util.dow(d)) > -1 && hol.indexOf(d) < 0) n++;
    return n;
  }
  /** Who decides this person's leave: the reporting manager or partner; otherwise the other administrators, managing partners and partners (never the applicant). If nobody else exists (for example a sole firm administrator) the leave is recorded as approved automatically. */
  function leaveRoute(user) {
    var users = DB.all('Users').filter(function (u) { return u.user_id !== user.user_id && u.employment_status !== 'Left'; }), ids = [];
    var direct = [user.reporting_manager_id, user.partner_id].filter(function (x) { return x && x !== user.user_id; });
    direct.forEach(function (id) { var u = users.filter(function (x) { return x.user_id === id; })[0]; if (u && Perm.has(u, 'leave.approve') && ids.indexOf(id) < 0) ids.push(id); });
    if (!ids.length) users.forEach(function (u) { if (['ADMIN', 'MANAGING_PARTNER', 'PARTNER'].indexOf(u.role) > -1 && Perm.has(u, 'leave.approve') && ids.indexOf(u.user_id) < 0) ids.push(u.user_id); });
    var by = Util.indexBy(users, 'user_id');
    return { ids: ids, names: ids.map(function (i) { return by[i].full_name + ' (' + (ROLES[by[i].role] || by[i].role) + ')'; }), auto: !ids.length };
  }
  function leaveApply(user, d) {
    var type = V.oneOf(d.leave_type, LEAVE_TYPES, 'Leave type'), f = V.date(d.from_date, 'From date'), t = V.date(d.to_date, 'To date');
    V.req(t >= f, 'To date cannot be before from date.'); V.req(Util.diffDays(f, t) <= 180, 'Leave period is too long.');
    var clash = DB.findOne('LeaveRequests', function (l) { return l.user_id === user.user_id && ['Pending', 'Approved'].indexOf(l.status) > -1 && l.from_date <= t && l.to_date >= f; });
    V.req(!clash, 'You already have a leave request overlapping these dates.');
    var days = workingDaysBetween(f, t); V.req(days > 0, 'The selected dates contain no working days.');
    var route = leaveRoute(user), approver = route.ids[0] || '';
    var r = DB.insert('LeaveRequests', { user_id: user.user_id, leave_type: type, from_date: f, to_date: t, days: days, reason: Util.clean(d.reason, 300), approver_id: route.auto ? '' : approver, status: route.auto ? 'Approved' : 'Pending', decided_at: route.auto ? Util.now() : '', decision_remarks: route.auto ? 'Recorded automatically: there is no other approver in the firm.' : '' }, user.user_id);
    if (!route.auto) Notify.send(route.ids, 'LEAVE_REQUEST', 'Leave request: ' + user.full_name, f + ' to ' + t + ' (' + days + ' working days)', 'Leave', r.leave_id);
    r.auto_approved = !!route.auto;
    Audit.log(user, 'LEAVE_APPLY', 'Leave', 'LeaveRequests', r.leave_id, '', { from: f, to: t, days: days }, '', 'OK'); return r;
  }
  function leaveDecide(user, id, approve, remarks) {
    Perm.require(user, 'leave.approve');
    var l = DB.get('LeaveRequests', id); V.req(l && l.status === 'Pending', 'Request not found or already decided.'); V.req(l.user_id !== user.user_id, 'You cannot approve your own leave.');
    V.req(Perm.canSeeUser(user, l.user_id), 'You are not authorised to decide this leave request.');
    if (!approve) V.req(Util.clean(remarks, 300), 'Please give a reason for rejecting.');
    var upd = DB.update('LeaveRequests', id, { status: approve ? 'Approved' : 'Rejected', decided_at: Util.now(), decision_remarks: Util.clean(remarks, 300), approver_id: user.user_id }, user.user_id);
    Notify.send([l.user_id], 'LEAVE_DECISION', 'Leave ' + upd.status.toLowerCase(), l.from_date + ' to ' + l.to_date + ' ' + (remarks || ''), 'Leave', id);
    Audit.log(user, approve ? 'LEAVE_APPROVE' : 'LEAVE_REJECT', 'Leave', 'LeaveRequests', id, l.status, upd.status, remarks || '', 'OK'); return upd;
  }
  function leaveCancel(user, id) { var l = DB.get('LeaveRequests', id); V.req(l && l.user_id === user.user_id, 'Leave request not found.'); V.req(['Pending', 'Approved'].indexOf(l.status) > -1 && l.to_date >= Util.today(), 'This request cannot be cancelled.'); var u = DB.update('LeaveRequests', id, { status: 'Cancelled' }, user.user_id); Audit.log(user, 'LEAVE_CANCEL', 'Leave', 'LeaveRequests', id, l.status, 'Cancelled', '', 'OK'); return u; }
  function leaveList(user, p) {
    p = p || {}; var users = Util.indexBy(DB.all('Users'), 'user_id'), team = p.team && Perm.has(user, 'leave.approve');
    return DB.all('LeaveRequests').filter(function (l) { return team ? Perm.canSeeUser(user, l.user_id) : l.user_id === user.user_id; }).map(function (l) { l.user_name = (users[l.user_id] || {}).full_name; return l; }).sort(function (a, b) { return a.from_date < b.from_date ? 1 : -1; });
  }
  function leaveBalance(userId, type, year) {
    var quota = Settings.num('leave_quota_' + type, -1), used = Util.sum(DB.where('LeaveRequests', function (l) { return l.user_id === userId && l.leave_type === type && l.status === 'Approved' && l.from_date.slice(0, 4) === String(year); }), function (l) { return l.days; });
    return { type: type, quota: quota < 0 ? null : quota, used: used, balance: quota < 0 ? null : quota - used };
  }

  /* ---------- productivity / unallocated time ---------- */
  var METHOD = 'Scheduled time = working days in the period (Settings: work_days, holidays) x working hours per day. Approved leave days are deducted. "Accounted time" is the sum of all recorded time logs (task, meetings, training, client visits, administrative, document collection, other) plus recorded breaks. ' +
    'Unallocated time = scheduled time - leave - accounted time (never below zero). It is NOT proven idle time: it only means that no activity was recorded. No screen, keyboard, camera or location monitoring is used.';
  function scheduledMinutes(userId, from, to) {
    var days = Settings.get('work_days', '1,2,3,4,5,6').split(',').map(Number), hol = Settings.get('holidays', '').split(',').map(function (x) { return x.trim(); });
    var emp = DB.get('Employees', userId), perDay = (emp && emp.work_hours_per_day) || Settings.num('work_hours_per_day', 8), working = 0, leave = 0;
    var leaves = DB.where('LeaveRequests', function (l) { return l.user_id === userId && l.status === 'Approved' && l.to_date >= from && l.from_date <= to; });
    var end = to > Util.today() ? Util.today() : to; // only count elapsed days
    for (var d = from; d <= end; d = Util.addDays(d, 1)) {
      if (days.indexOf(Util.dow(d)) < 0 || hol.indexOf(d) > -1) continue; working++;
      if (leaves.some(function (l) { return l.from_date <= d && l.to_date >= d; })) leave++;
    }
    return { working_days: working, leave_days: leave, scheduled: working * perDay * 60, leave: leave * perDay * 60, per_day_hours: perDay };
  }
  function productivity(userId, from, to) {
    var s = scheduledMinutes(userId, from, to), by = {}; TIME_CATEGORIES.forEach(function (c) { by[c] = 0; });
    DB.where('TimeLogs', function (l) { return l.user_id === userId && l.log_date >= from && l.log_date <= to && l.state === 'STOPPED'; }).forEach(function (l) { by[l.category] = (by[l.category] || 0) + l.minutes; });
    var accounted = Util.sum(TIME_CATEGORIES, function (c) { return by[c]; }), net = Math.max(0, s.scheduled - s.leave), unalloc = Math.max(0, net - accounted);
    var assigns = DB.where('TaskAssignments', function (a) { return a.user_id === userId; }).map(function (a) { return a.task_id; });
    var tmap = Util.indexBy(DB.all('Tasks'), 'task_id'), tasks = assigns.map(function (id) { return tmap[id]; }).filter(Boolean);
    var inPeriod = tasks.filter(function (t) { return t.assigned_date >= from && t.assigned_date <= to || (t.completed_date >= from && t.completed_date <= to); });
    var completed = tasks.filter(function (t) { return t.status === 'Completed' && t.completed_date >= from && t.completed_date <= to; });
    var onTime = completed.filter(function (t) { return t.completed_date <= t.due_date; });
    var open = tasks.filter(function (t) { return OPEN_STATUSES.indexOf(t.status) > -1 && t.status !== 'Draft'; });
    var overdue = open.filter(function (t) { return t.due_date < Util.today(); });
    var corr = DB.where('TaskReviews', function (r) { return ['Correction Required', 'Rejected', 'More Information Required'].indexOf(r.outcome) > -1 && assigns.indexOf(r.task_id) > -1 && r.reviewed_at.slice(0, 10) >= from && r.reviewed_at.slice(0, 10) <= to; }).length;
    var turnaround = completed.length ? Util.r2(Util.sum(completed, function (t) { return Math.max(0, Util.diffDays(t.assigned_date, t.completed_date)); }) / completed.length) : 0;
    var estDone = Util.sum(completed, function (t) { return t.est_hours; }), actDone = Util.sum(completed, function (t) { return Util.sum(DB.where('TimeLogs', function (l) { return l.task_id === t.task_id && l.user_id === userId; }), function (l) { return l.minutes; }) / 60; });
    return { user_id: userId, from: from, to: to, working_days: s.working_days, leave_days: s.leave_days, scheduled_hours: Util.r2(s.scheduled / 60), net_scheduled_hours: Util.r2(net / 60),
      by_category_hours: Object.keys(by).reduce(function (o, k) { o[k] = Util.r2(by[k] / 60); return o; }, {}), task_hours: Util.r2(by.TASK / 60), break_hours: Util.r2(by.BREAK / 60), accounted_hours: Util.r2(accounted / 60), unallocated_hours: Util.r2(unalloc / 60),
      over_recorded_hours: Util.r2(Math.max(0, accounted - net) / 60), utilisation_pct: net ? Math.round((by.TASK / net) * 100) : 0,
      tasks_assigned_in_period: inPeriod.length, tasks_completed: completed.length, on_time_completed: onTime.length, on_time_rate_pct: completed.length ? Math.round(onTime.length / completed.length * 100) : null,
      open_tasks: open.length, overdue_tasks: overdue.length, corrections: corr, correction_rate_pct: completed.length + corr ? Math.round(corr / (completed.length + corr) * 100) : 0, avg_turnaround_days: turnaround,
      estimated_vs_actual: { estimated_hours: Util.r2(estDone), actual_hours: Util.r2(actDone) }, methodology: METHOD };
  }
  function myProductivity(user, p) {
    p = p || {}; var from = p.from || Util.addDays(Util.today(), -6), to = p.to || Util.today(), uid = p.user_id || user.user_id;
    if (uid !== user.user_id) { Perm.require(user, 'time.view_team'); V.req(Perm.canSeeUser(user, uid), 'You are not authorised to view this person\'s statistics.'); }
    V.date(from, 'From'); V.date(to, 'To'); V.req(to >= from, 'To date cannot be before from date.');
    return productivity(uid, from, to);
  }
  return { start: start, stop: stop, pause: pause, resume: resume, manual: manual, myLogs: myLogs, requestCorrection: requestCorrection, decideCorrection: decideCorrection, correctDirect: correctDirect, corrections: corrections,
    checkIn: checkIn, checkOut: checkOut, attendanceList: attendanceList, attendanceCorrect: attendanceCorrect, leaveApply: leaveApply, leaveRoute: leaveRoute, leaveDecide: leaveDecide, leaveCancel: leaveCancel, leaveList: leaveList, leaveBalance: leaveBalance,
    productivity: productivity, myProductivity: myProductivity, scheduledMinutes: scheduledMinutes, running: running, METHOD: METHOD, workingDaysBetween: workingDaysBetween };
})();


// ======== Fees.gs ========
/** Fees.gs - fee agreements, invoices, receipts, allocations, adjustments, follow-ups. Balances are always derived from transactions. */
var Fees = (function () {
  function bucketBounds() { return Settings.get('ageing_buckets', '30,60,90').split(',').map(function (x) { return parseInt(x, 10); }).filter(function (x) { return isFinite(x); }).sort(function (a, b) { return a - b; }); }
  function bucketLabels() { var b = bucketBounds(), l = [], prev = 0; b.forEach(function (x) { l.push((prev === 0 ? 0 : prev + 1) + '-' + x); prev = x; }); l.push('Over ' + prev); return l; }
  function bucketOf(age) { var b = bucketBounds(), l = bucketLabels(); for (var i = 0; i < b.length; i++) if (age <= b[i]) return l[i]; return l[l.length - 1]; }

  /** Map of invoice_id -> balance info for ISSUED tax invoices. Optional client filter. */
  function balances(clientId) {
    var invs = DB.where('Invoices', function (i) { return i.status === 'ISSUED' && i.invoice_type === 'TAX' && (!clientId || i.client_id === clientId); });
    var receipts = Util.indexBy(DB.all('Receipts'), 'receipt_id'), paid = {}, cred = {}, deb = {}, out = {}, today = Util.today(), basis = Settings.get('ageing_basis', 'INVOICE_DATE');
    DB.all('ReceiptAllocations').forEach(function (a) { var r = receipts[a.receipt_id]; if (a.status === 'ACTIVE' && r && r.status === 'ACTIVE') paid[a.invoice_id] = (paid[a.invoice_id] || 0) + Util.paise(a.amount); });
    DB.all('Adjustments').forEach(function (a) { if (a.status !== 'ACTIVE') return; if (a.adj_type === 'DEBIT_ADJUSTMENT') deb[a.invoice_id] = (deb[a.invoice_id] || 0) + Util.paise(a.amount); else cred[a.invoice_id] = (cred[a.invoice_id] || 0) + Util.paise(a.amount); });
    invs.forEach(function (i) {
      var tp = Util.paise(i.total), p = paid[i.invoice_id] || 0, c = cred[i.invoice_id] || 0, d = deb[i.invoice_id] || 0, o = tp - p - c + d;
      var from = basis === 'DUE_DATE' && i.due_date ? i.due_date : i.invoice_date, age = Math.max(0, Util.diffDays(from, today));
      out[i.invoice_id] = { invoice_id: i.invoice_id, invoice_no: i.invoice_no, client_id: i.client_id, invoice_date: i.invoice_date, due_date: i.due_date, partner_id: i.partner_id, total: Util.fromPaise(tp), paid: Util.fromPaise(p), credits: Util.fromPaise(c), debits: Util.fromPaise(d),
        outstanding: Util.fromPaise(o), age_days: age, bucket: o > 0 ? bucketOf(age) : '', overdue_days: i.due_date ? Math.max(0, Util.diffDays(i.due_date, today)) : 0 };
    });
    return out;
  }
  function receiptUnallocated(receiptId) {
    var r = DB.get('Receipts', receiptId); if (!r || r.status !== 'ACTIVE') return 0;
    var used = Util.sum(DB.where('ReceiptAllocations', function (a) { return a.receipt_id === receiptId && a.status === 'ACTIVE'; }), function (a) { return Util.paise(a.amount); });
    return Util.fromPaise(Util.paise(r.amount) - used);
  }
  function clientSummary(clientId) {
    var b = balances(clientId), inv = DB.where('Invoices', function (i) { return i.client_id === clientId; }).map(function (i) { var x = b[i.invoice_id]; i.outstanding = x ? x.outstanding : 0; i.paid = x ? x.paid : 0; return i; });
    var rec = DB.where('Receipts', function (r) { return r.client_id === clientId; }).map(function (r) { r.unallocated = receiptUnallocated(r.receipt_id); return r; });
    return { invoices: inv, receipts: rec, outstanding: Util.fromPaise(Util.sum(Object.keys(b), function (k) { return Util.paise(b[k].outstanding); })), unallocated_receipts: Util.fromPaise(Util.sum(rec, function (r) { return Util.paise(r.unallocated); })) };
  }

  /* ---------- agreements ---------- */
  function saveAgreement(user, d) {
    Perm.require(user, 'fees.edit'); Perm.assertClient(user, d.client_id);
    var o = { client_id: d.client_id, partner_id: d.partner_id || '', service_id: d.service_id || '', agreed_fee: V.num(d.agreed_fee, 'Agreed fee', 0), billing_frequency: Util.clean(d.billing_frequency, 30), effective_date: V.optDate(d.effective_date, 'Effective date'),
      renewal_date: V.optDate(d.renewal_date, 'Renewal date'), tax_treatment: Util.clean(d.tax_treatment, 80), payment_terms: Util.clean(d.payment_terms, 200), remarks: Util.clean(d.remarks, 500), status: d.status || 'Active' };
    if (o.effective_date && o.renewal_date) V.req(o.renewal_date >= o.effective_date, 'Renewal date cannot be before the effective date.');
    var r = d.agreement_id ? DB.update('FeeAgreements', d.agreement_id, o, user.user_id) : DB.insert('FeeAgreements', o, user.user_id);
    Audit.log(user, d.agreement_id ? 'UPDATE' : 'CREATE', 'Fees', 'FeeAgreements', r.agreement_id, '', { fee: o.agreed_fee }, '', 'OK'); return r;
  }
  function listAgreements(user, p) {
    Perm.require(user, 'fees.view'); var sc = Perm.clientScope(user), cl = Util.indexBy(DB.all('Clients'), 'client_id');
    return DB.all('FeeAgreements').filter(function (a) { return (sc === null || sc[a.client_id]) && (!p || !p.client_id || a.client_id === p.client_id); }).map(function (a) { a.client_name = (cl[a.client_id] || {}).name; return a; });
  }

  /* ---------- invoices ---------- */
  function computeItems(items) {
    V.req(Array.isArray(items) && items.length, 'Add at least one invoice line.'); V.req(items.length <= 50, 'Too many invoice lines.');
    var tot = 0, rows = items.map(function (it) {
      var qty = V.num(it.qty === undefined || it.qty === '' ? 1 : it.qty, 'Quantity', 0.001, 100000), rate = V.num(it.rate, 'Rate', 0, 100000000), amt = Util.paise(qty * rate);
      V.req(Util.clean(it.description, 300), 'Each line needs a description.'); tot += amt;
      return { description: Util.clean(it.description, 300), sac: Util.clean(it.sac, 12), qty: qty, rate: rate, amount: Util.fromPaise(amt), task_id: it.task_id || '' };
    });
    return { rows: rows, taxable: Util.fromPaise(tot) };
  }
  function taxFor(client, d) {
    var rate = d.tax_rate_pct !== undefined && d.tax_rate_pct !== '' ? V.num(d.tax_rate_pct, 'Tax rate', 0, 40) : Settings.num('default_tax_rate_pct', 18), type = d.tax_type;
    if (!type) { var fs = (Settings.get('firm_state') || '').toLowerCase(), cs = (client.state || '').toLowerCase(); type = rate === 0 ? 'NONE' : (fs && cs && fs === cs ? 'CGST_SGST' : 'IGST'); }
    V.oneOf(type, ['CGST_SGST', 'IGST', 'NONE'], 'Tax type'); if (type === 'NONE') rate = 0;
    return { rate: rate, type: type };
  }
  function saveInvoice(user, d) {
    Perm.require(user, 'fees.edit'); Perm.assertClient(user, d.client_id);
    var client = DB.get('Clients', d.client_id); V.req(client, 'Client not found.');
    var existing = d.invoice_id ? DB.get('Invoices', d.invoice_id) : null;
    if (existing) V.req(existing.status === 'DRAFT', 'Only draft invoices can be edited. Cancel and re-issue if a correction is needed.');
    var type = V.oneOf(d.invoice_type || (existing && existing.invoice_type) || 'TAX', ['TAX', 'PROFORMA'], 'Invoice type');
    var c = computeItems(d.items), tx = taxFor(client, d), taxAmt = Util.r2(c.taxable * tx.rate / 100), total = Util.r2(c.taxable + taxAmt);
    if (d.task_id) { var tk = DB.get('Tasks', d.task_id); V.req(tk && tk.client_id === d.client_id, 'The linked task belongs to a different client.'); }
    var o = { client_id: d.client_id, invoice_type: type, service_desc: Util.clean(d.service_desc || c.rows[0].description, 300), taxable_value: c.taxable, tax_type: tx.type, tax_rate_pct: tx.rate, tax_amount: taxAmt, total: total, task_id: d.task_id || '', status: 'DRAFT',
      partner_id: d.partner_id || client.partner_id || '', due_date: V.optDate(d.due_date, 'Due date'), invoice_date: V.optDate(d.invoice_date, 'Invoice date'), fy: Util.fyOf(d.invoice_date || Util.today()) };
    var inv;
    if (existing) { inv = DB.update('Invoices', existing.invoice_id, o, user.user_id); DB.where('InvoiceItems', function (i) { return i.invoice_id === inv.invoice_id; }).forEach(function (i) { DB.deactivate('InvoiceItems', i.item_id, user.user_id); }); }
    else inv = DB.insert('Invoices', o, user.user_id);
    c.rows.forEach(function (r) { r.invoice_id = inv.invoice_id; DB.insert('InvoiceItems', r, user.user_id); });
    Audit.log(user, existing ? 'UPDATE' : 'CREATE', 'Fees', 'Invoices', inv.invoice_id, existing ? { total: existing.total } : '', { type: type, taxable: c.taxable, tax: taxAmt, total: total }, '', 'OK');
    return inv;
  }
  function issueInvoice(user, id, d) {
    Perm.require(user, 'fees.edit'); d = d || {};
    var inv = DB.get('Invoices', id); V.req(inv, 'Invoice not found.'); Perm.assertClient(user, inv.client_id);
    V.req(inv.status === 'DRAFT', 'Only draft invoices can be issued.');
    var date = V.date(d.invoice_date || inv.invoice_date || Util.today(), 'Invoice date'); V.req(date <= Util.today(), 'Invoice date cannot be in the future.');
    var due = d.due_date ? V.date(d.due_date, 'Due date') : (inv.due_date || Util.addDays(date, V.num(d.due_days === undefined ? 15 : d.due_days, 'Due days', 0, 365))); V.req(due >= date, 'Due date cannot be before the invoice date.');
    var fy = Util.fyOf(date), prefix = Settings.get('invoice_prefix_' + inv.invoice_type, inv.invoice_type === 'TAX' ? 'INV' : 'PRO');
    var seq = DB.nextSeq('seq_' + inv.invoice_type + '_' + fy), no = prefix + '/' + fy + '/' + String(seq).padStart(4, '0');
    V.req(!DB.findOne('Invoices', function (i) { return i.invoice_no === no; }), 'Invoice number clash. Please retry.');
    var upd = DB.update('Invoices', id, { status: 'ISSUED', invoice_no: no, invoice_date: date, due_date: due, fy: fy }, user.user_id);
    if (inv.task_id) { var t = DB.get('Tasks', inv.task_id); if (t && !t.invoice_id && inv.invoice_type === 'TAX') DB.update('Tasks', inv.task_id, { invoice_id: id }, user.user_id); }
    Audit.log(user, 'ISSUE', 'Fees', 'Invoices', id, 'DRAFT', { no: no, total: inv.total }, '', 'OK');
    return upd;
  }
  function cancelInvoice(user, id, reason) {
    Perm.require(user, 'fees.edit'); reason = Util.clean(reason, 300); V.req(reason, 'A reason is required to cancel an invoice.');
    var inv = DB.get('Invoices', id); V.req(inv, 'Invoice not found.'); Perm.assertClient(user, inv.client_id); V.req(inv.status !== 'CANCELLED', 'Invoice is already cancelled.');
    var allocs = DB.where('ReceiptAllocations', function (a) { return a.invoice_id === id && a.status === 'ACTIVE'; });
    V.req(!allocs.length, 'Receipts are allocated to this invoice. Reverse the allocations first.');
    var upd = DB.update('Invoices', id, { status: 'CANCELLED', cancel_reason: reason }, user.user_id);
    if (inv.task_id) { var t = DB.get('Tasks', inv.task_id); if (t && t.invoice_id === id) DB.update('Tasks', inv.task_id, { invoice_id: '' }, user.user_id); }
    Audit.log(user, 'INVOICE_CANCEL', 'Fees', 'Invoices', id, inv.status, 'CANCELLED', reason, 'OK'); return upd;
  }
  function getInvoice(user, id) {
    Perm.require(user, 'fees.view'); var inv = DB.get('Invoices', id); V.req(inv, 'Invoice not found.'); Perm.assertClient(user, inv.client_id);
    var b = balances(inv.client_id)[id];
    return { invoice: inv, items: DB.where('InvoiceItems', function (i) { return i.invoice_id === id; }), balance: b || null, allocations: DB.where('ReceiptAllocations', function (a) { return a.invoice_id === id; }), adjustments: DB.where('Adjustments', function (a) { return a.invoice_id === id; }), client: Perm.maskClient(user, DB.get('Clients', inv.client_id)), firm: { name: Settings.get('firm_name'), address: Settings.get('firm_address'), gstin: Settings.get('firm_gstin') } };
  }
  function listInvoices(user, p) {
    Perm.require(user, 'fees.view'); p = p || {}; var sc = Perm.clientScope(user), cl = Util.indexBy(DB.all('Clients'), 'client_id'), b = balances();
    var rows = DB.all('Invoices').filter(function (i) { return (sc === null || sc[i.client_id]) && (!p.client_id || i.client_id === p.client_id) && (!p.status || i.status === p.status) && (!p.type || i.invoice_type === p.type) && (!p.from || (i.invoice_date || '9') >= p.from) && (!p.to || (i.invoice_date || '') <= p.to); })
      .map(function (i) { i.client_name = (cl[i.client_id] || {}).name; var x = b[i.invoice_id]; i.outstanding = x ? x.outstanding : (i.status === 'ISSUED' && i.invoice_type === 'PROFORMA' ? 0 : 0); i.paid = x ? x.paid : 0; return i; })
      .sort(function (a, c) { return (c.invoice_date || c.created_at) > (a.invoice_date || a.created_at) ? 1 : -1; });
    return { rows: rows, total: rows.length };
  }

  /* ---------- receipts ---------- */
  function checkAlloc(clientId, allocs, available) {
    var b = balances(clientId), seen = {}, tot = 0;
    (allocs || []).forEach(function (a) {
      var amt = Util.paise(V.num(a.amount, 'Allocation amount', 0.01)), x = b[a.invoice_id];
      V.req(x, 'Invoice ' + a.invoice_id + ' is not an issued tax invoice of this client.'); V.req(!seen[a.invoice_id], 'The same invoice appears twice in the allocation.'); seen[a.invoice_id] = 1;
      V.req(amt <= Util.paise(x.outstanding), 'Allocation exceeds the outstanding balance of ' + x.invoice_no + ' (Rs. ' + x.outstanding.toFixed(2) + ').'); tot += amt;
    });
    V.req(tot <= available, 'Allocated total exceeds the available receipt amount.');
    return tot;
  }
  function recordReceipt(user, d) {
    Perm.require(user, 'receipt.edit'); Perm.assertClient(user, d.client_id);
    var amt = V.num(d.amount, 'Amount', 0.01, 1000000000), date = V.date(d.receipt_date, 'Receipt date'); V.req(date <= Util.today(), 'Receipt date cannot be in the future.');
    var mode = V.oneOf(d.mode || 'Bank Transfer', PAYMENT_MODES, 'Payment mode'), ref = Util.clean(d.txn_ref, 80);
    if (ref) V.req(!DB.findOne('Receipts', function (r) { return r.client_id === d.client_id && r.txn_ref === ref && r.status === 'ACTIVE'; }), 'A receipt with this transaction reference is already recorded (possible duplicate).');
    V.req(!DB.findOne('Receipts', function (r) { return r.client_id === d.client_id && r.receipt_date === date && Util.paise(r.amount) === Util.paise(amt) && r.mode === mode && (r.txn_ref || '') === ref && r.status === 'ACTIVE' && r.created_at.slice(0, 10) === Util.today(); }), 'An identical receipt was just recorded (possible duplicate submission).');
    checkAlloc(d.client_id, d.allocations, Util.paise(amt));
    var fy = Util.fyOf(date), no = Settings.get('receipt_prefix', 'RCT') + '/' + fy + '/' + String(DB.nextSeq('seq_receipt_' + fy)).padStart(4, '0');
    var r = DB.insert('Receipts', { client_id: d.client_id, receipt_no: no, receipt_date: date, amount: amt, mode: mode, txn_ref: ref, bank_ref: Util.clean(d.bank_ref, 80), status: 'ACTIVE', remarks: Util.clean(d.remarks, 300) }, user.user_id);
    (d.allocations || []).forEach(function (a) { DB.insert('ReceiptAllocations', { receipt_id: r.receipt_id, invoice_id: a.invoice_id, amount: Util.r2(a.amount), status: 'ACTIVE' }, user.user_id); });
    Audit.log(user, 'RECEIPT', 'Fees', 'Receipts', r.receipt_id, '', { no: no, amount: amt, allocations: (d.allocations || []).length }, '', 'OK');
    r.unallocated = receiptUnallocated(r.receipt_id); return r;
  }
  function allocate(user, receiptId, allocs) {
    Perm.require(user, 'receipt.edit'); var r = DB.get('Receipts', receiptId); V.req(r && r.status === 'ACTIVE', 'Receipt not found or cancelled.'); Perm.assertClient(user, r.client_id);
    checkAlloc(r.client_id, allocs, Util.paise(receiptUnallocated(receiptId)));
    allocs.forEach(function (a) { DB.insert('ReceiptAllocations', { receipt_id: receiptId, invoice_id: a.invoice_id, amount: Util.r2(a.amount), status: 'ACTIVE' }, user.user_id); });
    Audit.log(user, 'ALLOCATE', 'Fees', 'ReceiptAllocations', receiptId, '', { count: allocs.length }, '', 'OK');
    return { receipt_id: receiptId, unallocated: receiptUnallocated(receiptId) };
  }
  function reverseAllocation(user, allocId, reason) {
    Perm.require(user, 'receipt.edit'); reason = Util.clean(reason, 300); V.req(reason, 'A reason is required.');
    var a = DB.get('ReceiptAllocations', allocId); V.req(a && a.status === 'ACTIVE', 'Allocation not found or already reversed.'); var r = DB.get('Receipts', a.receipt_id); Perm.assertClient(user, r.client_id);
    DB.update('ReceiptAllocations', allocId, { status: 'REVERSED', reversed_reason: reason }, user.user_id);
    Audit.log(user, 'ALLOCATION_REVERSE', 'Fees', 'ReceiptAllocations', allocId, { amount: a.amount, invoice: a.invoice_id }, '', reason, 'OK'); return true;
  }
  function cancelReceipt(user, id, reason) {
    Perm.require(user, 'receipt.edit'); reason = Util.clean(reason, 300); V.req(reason, 'A reason is required.');
    var r = DB.get('Receipts', id); V.req(r && r.status === 'ACTIVE', 'Receipt not found or already cancelled.'); Perm.assertClient(user, r.client_id);
    DB.where('ReceiptAllocations', function (a) { return a.receipt_id === id && a.status === 'ACTIVE'; }).forEach(function (a) { DB.update('ReceiptAllocations', a.allocation_id, { status: 'REVERSED', reversed_reason: 'Receipt cancelled: ' + reason }, user.user_id); });
    var upd = DB.update('Receipts', id, { status: 'CANCELLED', cancel_reason: reason }, user.user_id);
    Audit.log(user, 'RECEIPT_CANCEL', 'Fees', 'Receipts', id, { amount: r.amount }, 'CANCELLED', reason, 'OK'); return upd;
  }
  function listReceipts(user, p) {
    Perm.require(user, 'fees.view'); p = p || {}; var sc = Perm.clientScope(user), cl = Util.indexBy(DB.all('Clients'), 'client_id');
    var rows = DB.all('Receipts').filter(function (r) { return (sc === null || sc[r.client_id]) && (!p.client_id || r.client_id === p.client_id) && (!p.from || r.receipt_date >= p.from) && (!p.to || r.receipt_date <= p.to); })
      .map(function (r) { r.client_name = (cl[r.client_id] || {}).name; r.unallocated = receiptUnallocated(r.receipt_id); return r; }).sort(function (a, b) { return a.receipt_date < b.receipt_date ? 1 : -1; });
    return { rows: rows, total: rows.length };
  }
  function addAdjustment(user, d) {
    Perm.require(user, 'fees.edit'); var inv = DB.get('Invoices', d.invoice_id); V.req(inv && inv.status === 'ISSUED' && inv.invoice_type === 'TAX', 'Adjustments apply to issued tax invoices only.'); Perm.assertClient(user, inv.client_id);
    var type = V.oneOf(d.adj_type, ['CREDIT_NOTE', 'WRITE_OFF', 'DEBIT_ADJUSTMENT'], 'Adjustment type'), amt = V.num(d.amount, 'Amount', 0.01), reason = Util.clean(d.reason, 300); V.req(reason, 'A reason is required.');
    var b = balances(inv.client_id)[d.invoice_id];
    if (type !== 'DEBIT_ADJUSTMENT') V.req(Util.paise(amt) <= Util.paise(b.outstanding), 'The adjustment exceeds the outstanding balance (Rs. ' + b.outstanding.toFixed(2) + ').');
    var r = DB.insert('Adjustments', { client_id: inv.client_id, invoice_id: d.invoice_id, adj_type: type, adj_date: V.optDate(d.adj_date, 'Date') || Util.today(), amount: amt, reason: reason, status: 'ACTIVE' }, user.user_id);
    Audit.log(user, 'ADJUSTMENT', 'Fees', 'Adjustments', r.adjustment_id, '', { type: type, amount: amt, invoice: inv.invoice_no }, reason, 'OK'); return r;
  }
  function cancelAdjustment(user, id, reason) {
    Perm.require(user, 'fees.edit'); reason = Util.clean(reason, 300); V.req(reason, 'A reason is required.'); var a = DB.get('Adjustments', id); V.req(a && a.status === 'ACTIVE', 'Adjustment not found.'); Perm.assertClient(user, a.client_id);
    DB.update('Adjustments', id, { status: 'CANCELLED' }, user.user_id); Audit.log(user, 'ADJUSTMENT_CANCEL', 'Fees', 'Adjustments', id, { amount: a.amount }, 'CANCELLED', reason, 'OK'); return true;
  }

  /* ---------- follow-ups ---------- */
  function saveFollowUp(user, d) {
    Perm.require(user, 'followup.edit'); Perm.assertClient(user, d.client_id);
    var inv = d.invoice_id ? DB.get('Invoices', d.invoice_id) : null; if (d.invoice_id) V.req(inv && inv.client_id === d.client_id, 'Invoice does not belong to this client.');
    var b = inv ? balances(d.client_id)[inv.invoice_id] : null, client = DB.get('Clients', d.client_id);
    var o = { client_id: d.client_id, invoice_id: d.invoice_id || '', outstanding: b ? b.outstanding : clientSummary(d.client_id).outstanding, followup_date: V.date(d.followup_date || Util.today(), 'Follow-up date'), method: Util.clean(d.method, 40), contact_person: Util.clean(d.contact_person, 100),
      summary: Util.clean(d.summary, 1000), promised_date: V.optDate(d.promised_date, 'Promised date'), promised_amount: d.promised_amount ? V.num(d.promised_amount, 'Promised amount', 0) : 0, next_followup_date: V.optDate(d.next_followup_date, 'Next follow-up date'),
      assigned_to: d.assigned_to || user.user_id, partner_id: client.partner_id || '', status: d.status || (d.promised_date ? 'Promised' : 'Open') };
    V.oneOf(o.status, ['Open', 'Promised', 'Paid', 'Closed'], 'Status');
    if (o.next_followup_date) V.req(o.next_followup_date >= o.followup_date, 'Next follow-up cannot be before this follow-up.');
    var r = d.followup_id ? DB.update('FeeFollowUps', d.followup_id, o, user.user_id) : DB.insert('FeeFollowUps', o, user.user_id);
    Audit.log(user, 'FOLLOWUP', 'Fees', 'FeeFollowUps', r.followup_id, '', { client: d.client_id, next: o.next_followup_date }, '', 'OK'); return r;
  }
  function listFollowUps(user, p) {
    Perm.require(user, 'fees.view'); p = p || {}; var sc = Perm.clientScope(user), cl = Util.indexBy(DB.all('Clients'), 'client_id'), users = Util.indexBy(DB.all('Users'), 'user_id'), t0 = Util.today();
    var rows = DB.all('FeeFollowUps').filter(function (f) { return (sc === null || sc[f.client_id]) && (!p.client_id || f.client_id === p.client_id) && (!p.status || f.status === p.status) && (!p.due || (['Open', 'Promised'].indexOf(f.status) > -1 && f.next_followup_date && f.next_followup_date <= t0)); })
      .map(function (f) { f.client_name = (cl[f.client_id] || {}).name; f.assigned_name = (users[f.assigned_to] || {}).full_name; f.overdue = ['Open', 'Promised'].indexOf(f.status) > -1 && !!f.next_followup_date && f.next_followup_date < t0; f.promise_broken = f.status === 'Promised' && !!f.promised_date && f.promised_date < t0; return f; }).sort(function (a, b) { return (a.next_followup_date || '9') < (b.next_followup_date || '9') ? -1 : 1; });
    return { rows: rows, total: rows.length };
  }
  /** Client statement: chronological ledger with running balance. */
  function statement(user, clientId, from, to) {
    Perm.require(user, 'fees.view'); Perm.assertClient(user, clientId);
    var lines = [];
    DB.where('Invoices', function (i) { return i.client_id === clientId && i.status !== 'DRAFT' && i.invoice_type === 'TAX'; }).forEach(function (i) { lines.push({ date: i.invoice_date, type: 'Invoice', ref: i.invoice_no, debit: i.total, credit: 0, note: i.status === 'CANCELLED' ? 'Cancelled: ' + i.cancel_reason : i.service_desc, cancelled: i.status === 'CANCELLED' }); });
    DB.where('Receipts', function (r) { return r.client_id === clientId; }).forEach(function (r) { lines.push({ date: r.receipt_date, type: 'Receipt', ref: r.receipt_no, debit: 0, credit: r.amount, note: r.status === 'CANCELLED' ? 'Cancelled: ' + r.cancel_reason : r.mode, cancelled: r.status === 'CANCELLED' }); });
    DB.where('Adjustments', function (a) { return a.client_id === clientId; }).forEach(function (a) { var inv = DB.get('Invoices', a.invoice_id) || {}; lines.push({ date: a.adj_date, type: a.adj_type.replace('_', ' '), ref: inv.invoice_no || '', debit: a.adj_type === 'DEBIT_ADJUSTMENT' ? a.amount : 0, credit: a.adj_type === 'DEBIT_ADJUSTMENT' ? 0 : a.amount, note: a.reason, cancelled: a.status === 'CANCELLED' }); });
    lines.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    var bal = 0, out = [];
    lines.forEach(function (l) { if (!l.cancelled) bal += Util.paise(l.debit) - Util.paise(l.credit); l.balance = Util.fromPaise(bal); if ((!from || l.date >= from) && (!to || l.date <= to)) out.push(l); });
    return { client: DB.get('Clients', clientId).name, lines: out, closing_balance: Util.fromPaise(bal), note: 'Closing balance includes unallocated receipts (advances). Outstanding on invoices is shown on the fee reports.' };
  }
  return { balances: balances, clientSummary: clientSummary, receiptUnallocated: receiptUnallocated, bucketLabels: bucketLabels, bucketOf: bucketOf, saveAgreement: saveAgreement, listAgreements: listAgreements, saveInvoice: saveInvoice, issueInvoice: issueInvoice, cancelInvoice: cancelInvoice,
    getInvoice: getInvoice, listInvoices: listInvoices, recordReceipt: recordReceipt, allocate: allocate, reverseAllocation: reverseAllocation, cancelReceipt: cancelReceipt, listReceipts: listReceipts, addAdjustment: addAdjustment, cancelAdjustment: cancelAdjustment,
    saveFollowUp: saveFollowUp, listFollowUps: listFollowUps, statement: statement };
})();


// ======== FileMovement.gs ========
/** FileMovement.gs - physical file register. Every transfer is a separate history row; the file row only caches the current position. */
var Files = (function () {
  function assertFile(user, id, perm) {
    Perm.require(user, perm || 'files.view');
    var f = DB.get('PhysicalFiles', id); V.req(f, 'File not found.'); Perm.assertClient(user, f.client_id); return f;
  }
  function movements(fileId) { return DB.where('FileMovements', function (m) { return m.file_id === fileId; }).sort(function (a, b) { return a.seq - b.seq; }); }
  function create(user, d) {
    Perm.require(user, 'files.edit'); Perm.assertClient(user, d.client_id);
    var received = V.date(d.received_date || Util.today(), 'Received date'); V.req(received <= Util.today(), 'Received date cannot be in the future.');
    var ref = 'F' + Util.today().slice(2, 4) + '-' + String(DB.nextSeq('seq_file')).padStart(4, '0');
    var custodian = d.custodian_id || user.user_id; var cu = DB.get('Users', custodian); V.req(cu && cu.is_active !== 'N', 'Custodian is not an active user.');
    var f = DB.insert('PhysicalFiles', { file_ref_no: ref, client_id: d.client_id, fy: d.fy || Util.fyOf(received), description: Util.clean(d.description, 300), file_type: Util.clean(d.file_type, 60), received_date: received, received_from: Util.clean(d.received_from, 120),
      current_custodian_id: custodian, current_custodian_name: cu.full_name, current_location: Util.clean(d.location || 'Office', 100), status: 'Received', expected_return_date: '', dispatch_date: '', remarks: Util.clean(d.remarks, 300) }, user.user_id);
    DB.insert('FileMovements', { file_id: f.file_id, seq: 1, from_name: Util.clean(d.received_from, 120) || 'External', to_name: cu.full_name, to_user_id: custodian, to_location: f.current_location, purpose: 'Received', dispatch_date: received, status_after: 'Received', ack_by: custodian, ack_at: Util.now(), remarks: 'Inward entry' }, user.user_id);
    Audit.log(user, 'FILE_CREATE', 'Files', 'PhysicalFiles', f.file_id, '', { ref: ref, client: d.client_id }, '', 'OK'); return f;
  }
  function transfer(user, d) {
    var f = assertFile(user, d.file_id, 'files.edit'); V.req(['Archived'].indexOf(f.status) < 0, 'An archived file cannot be transferred. Return it to office first.');
    var status = V.oneOf(d.status_after, FILE_STATUSES, 'Status after movement'); V.req(['Received', 'Returned', 'Archived'].indexOf(status) < 0, 'Use the return or archive action for that status.');
    var toUser = d.to_user_id ? DB.get('Users', d.to_user_id) : null; if (d.to_user_id) V.req(toUser && toUser.is_active !== 'N', 'Receiving user is not active.');
    var toName = toUser ? toUser.full_name : Util.clean(d.to_name, 120); V.req(toName, 'Enter who the file is being sent to.');
    var exp = V.optDate(d.expected_return_date, 'Expected return date'); if (FILE_OUT_STATUSES.indexOf(status) > -1) V.req(exp, 'Expected return date is required when a file goes outside the office.');
    var disp = V.date(d.dispatch_date || Util.today(), 'Dispatch date'); if (exp) V.req(exp >= disp, 'Expected return date cannot be before the dispatch date.');
    var seq = movements(f.file_id).length + 1;
    var m = DB.insert('FileMovements', { file_id: f.file_id, seq: seq, from_name: f.current_custodian_name, from_user_id: f.current_custodian_id, to_name: toName, to_user_id: toUser ? toUser.user_id : '', from_location: f.current_location, to_location: Util.clean(d.to_location, 100),
      purpose: Util.clean(d.purpose, 200), dispatch_date: disp, expected_return_date: exp, status_after: status, remarks: Util.clean(d.remarks, 300) }, user.user_id);
    var upd = DB.update('PhysicalFiles', f.file_id, { current_custodian_id: toUser ? toUser.user_id : '', current_custodian_name: toName, current_location: Util.clean(d.to_location, 100) || f.current_location, status: status, expected_return_date: exp, dispatch_date: disp }, user.user_id);
    Audit.log(user, 'FILE_TRANSFER', 'Files', 'FileMovements', m.movement_id, { custodian: f.current_custodian_name, status: f.status }, { custodian: toName, status: status }, d.purpose || '', 'OK');
    if (toUser) Notify.send([toUser.user_id], 'FILE_RECEIVED', 'File sent to you: ' + f.file_ref_no, f.description + ' - please acknowledge receipt', 'File', f.file_id);
    return { file: upd, movement: m };
  }
  function acknowledge(user, movementId) {
    var m = DB.get('FileMovements', movementId); V.req(m, 'Movement not found.'); V.req(m.to_user_id === user.user_id, 'Only the receiving employee can acknowledge this transfer.'); V.req(!m.ack_at, 'Already acknowledged.');
    var upd = DB.update('FileMovements', movementId, { ack_by: user.user_id, ack_at: Util.now() }, user.user_id);
    Audit.log(user, 'FILE_ACK', 'Files', 'FileMovements', movementId, '', { file: m.file_id }, '', 'OK'); return upd;
  }
  function returnFile(user, d) {
    var f = assertFile(user, d.file_id, 'files.edit'); V.req(['Returned', 'In Office', 'Received', 'Archived'].indexOf(f.status) < 0, 'The file is already in the office.');
    var date = V.date(d.return_date || Util.today(), 'Return date'); V.req(date <= Util.today(), 'Return date cannot be in the future.');
    var open = movements(f.file_id).filter(function (m) { return !m.return_date && m.status_after !== 'Returned'; }).pop(); if (open) DB.update('FileMovements', open.movement_id, { return_date: date }, user.user_id);
    var seq = movements(f.file_id).length + 1, loc = Util.clean(d.location || 'Office', 100);
    var m = DB.insert('FileMovements', { file_id: f.file_id, seq: seq, from_name: f.current_custodian_name, from_user_id: f.current_custodian_id, to_name: user.full_name, to_user_id: user.user_id, from_location: f.current_location, to_location: loc, purpose: 'Returned to office', dispatch_date: date, status_after: 'Returned', ack_by: user.user_id, ack_at: Util.now(), return_date: date, remarks: Util.clean(d.remarks, 300) }, user.user_id);
    var upd = DB.update('PhysicalFiles', f.file_id, { current_custodian_id: user.user_id, current_custodian_name: user.full_name, current_location: loc, status: 'Returned', expected_return_date: '' }, user.user_id);
    Audit.log(user, 'FILE_RETURN', 'Files', 'FileMovements', m.movement_id, f.status, 'Returned', '', 'OK'); return { file: upd, movement: m };
  }
  function archive(user, d) {
    var f = assertFile(user, d.file_id, 'files.edit'); V.req(['Returned', 'In Office', 'Received'].indexOf(f.status) > -1, 'Only files that are in the office can be archived.');
    var loc = Util.clean(d.location, 100); V.req(loc, 'Enter the archive location.');
    DB.insert('FileMovements', { file_id: f.file_id, seq: movements(f.file_id).length + 1, from_name: f.current_custodian_name, from_user_id: f.current_custodian_id, to_name: 'Archive', from_location: f.current_location, to_location: loc, purpose: 'Archived', dispatch_date: Util.today(), status_after: 'Archived', ack_by: user.user_id, ack_at: Util.now() }, user.user_id);
    var upd = DB.update('PhysicalFiles', f.file_id, { current_location: loc, status: 'Archived', current_custodian_name: 'Archive', current_custodian_id: '' }, user.user_id);
    Audit.log(user, 'FILE_ARCHIVE', 'Files', 'PhysicalFiles', f.file_id, f.status, 'Archived', loc, 'OK'); return upd;
  }
  function reportException(user, d) {
    var f = assertFile(user, d.file_id, 'files.edit'); var rem = Util.clean(d.remarks, 500); V.req(rem, 'Describe the exception.');
    DB.insert('FileMovements', { file_id: f.file_id, seq: movements(f.file_id).length + 1, from_name: f.current_custodian_name, from_user_id: f.current_custodian_id, to_name: f.current_custodian_name, from_location: f.current_location, to_location: f.current_location, purpose: 'Exception', dispatch_date: Util.today(), status_after: 'Lost or Exception Reported', remarks: rem }, user.user_id);
    var upd = DB.update('PhysicalFiles', f.file_id, { status: 'Lost or Exception Reported' }, user.user_id);
    Notify.send(DB.where('Users', function (u) { return u.role === 'ADMIN' || u.role === 'MANAGING_PARTNER' || u.user_id === (DB.get('Clients', f.client_id) || {}).partner_id; }).map(function (u) { return u.user_id; }), 'FILE_EXCEPTION', 'File exception: ' + f.file_ref_no, rem, 'File', f.file_id);
    Audit.log(user, 'FILE_EXCEPTION', 'Files', 'PhysicalFiles', f.file_id, f.status, 'Lost or Exception Reported', rem, 'OK'); return upd;
  }
  function isOverdue(f) {
    if (['Returned', 'Archived', 'In Office', 'Received'].indexOf(f.status) > -1 || !f.expected_return_date) return false;
    return f.expected_return_date < Util.addDays(Util.today(), -Settings.num('file_return_grace_days', 0));
  }
  function list(user, p) {
    Perm.require(user, 'files.view'); p = p || {}; var sc = Perm.clientScope(user), cl = Util.indexBy(DB.all('Clients'), 'client_id'), q = String(p.q || '').toLowerCase();
    var pendingAck = Util.indexBy(DB.where('FileMovements', function (m) { return m.to_user_id && !m.ack_at; }), 'file_id');
    var rows = DB.all('PhysicalFiles').filter(function (f) { return (sc === null || sc[f.client_id]) && (!p.client_id || f.client_id === p.client_id) && (!p.status || f.status === p.status) && (!p.custodian_id || f.current_custodian_id === p.custodian_id)
      && (!p.overdue || isOverdue(f)) && (!p.in_transit || FILE_OUT_STATUSES.indexOf(f.status) > -1) && (!q || (f.file_ref_no + ' ' + f.description + ' ' + ((cl[f.client_id] || {}).name || '')).toLowerCase().indexOf(q) > -1); })
      .map(function (f) { f.client_name = (cl[f.client_id] || {}).name; f.overdue = isOverdue(f); f.pending_ack = !!pendingAck[f.file_id]; return f; }).sort(function (a, b) { return a.file_ref_no < b.file_ref_no ? 1 : -1; });
    return { rows: rows, total: rows.length };
  }
  function history(user, fileId) { var f = assertFile(user, fileId, 'files.view'); return { file: f, movements: movements(fileId) }; }
  function myPendingAcks(user) { return DB.where('FileMovements', function (m) { return m.to_user_id === user.user_id && !m.ack_at; }).map(function (m) { var f = DB.get('PhysicalFiles', m.file_id) || {}; m.file_ref_no = f.file_ref_no; m.description = f.description; return m; }); }
  return { create: create, transfer: transfer, acknowledge: acknowledge, returnFile: returnFile, archive: archive, reportException: reportException, list: list, history: history, isOverdue: isOverdue, myPendingAcks: myPendingAcks };
})();


// ======== Documents.gs ========
/** Documents.gs - Drive folders, document register, access-controlled download, document requests and checklists. Files stay private; no public links are ever created. */
var Docs = (function () {
  var ALLOWED = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'jpg', 'jpeg', 'png', 'txt', 'ppt', 'pptx', 'zip', 'xml', 'json'];
  var SUBFOLDERS = ['Client Documents', 'Client Reports', 'Work Papers', 'Generated Invoices', 'Fee Receipts', 'Management Reports', 'Email Attachments', 'Backups', 'System Exports'];

  function sub(parent, name) { var it = parent.getFoldersByName(name); return it.hasNext() ? it.next() : parent.createFolder(name); }
  function ensureRoot(name) {
    var id = Settings.get('root_folder_id'), root = null;
    if (id) { try { root = DriveApp.getFolderById(id); } catch (e) { root = null; } }
    if (!root) { root = DriveApp.createFolder(name || 'CA Office Management'); Settings.set('root_folder_id', root.getId(), 'system'); }
    SUBFOLDERS.forEach(function (n) { sub(root, n); });
    var b = sub(root, 'Backups'); Settings.set('backup_folder_id', b.getId(), 'system');
    return root.getId();
  }
  function rootFolder() { var id = Settings.get('root_folder_id'); if (!id) throw new AppError('SETUP', 'The Drive root folder is not configured. Run setupApplication() or set it in Settings.'); return DriveApp.getFolderById(id); }
  function ensureClientFolder(client) {
    var id = Settings.get('root_folder_id'); if (!id) return '';
    var cd = sub(sub(rootFolder(), 'Client Documents'), (client.client_code ? client.client_code + ' - ' : '') + client.name.replace(/[\\/:*?"<>|]/g, ' ').slice(0, 80));
    return cd.getId();
  }
  function fyFolder(client, fy) { var cid = client.folder_id || ensureClientFolder(client); V.req(cid, 'Client folder is not available.'); return sub(DriveApp.getFolderById(cid), fy || 'General'); }

  function canOpen(user, doc) {
    if (!Perm.has(user, 'docs.view')) return false;
    if (!Perm.canSeeClient(user, doc.client_id)) return false;
    if (doc.confidentiality === 'Restricted') { var c = DB.get('Clients', doc.client_id) || {}; return Perm.isTop(user) || c.partner_id === user.user_id || doc.uploaded_by === user.user_id; }
    return true;
  }
  function upload(user, d) {
    Perm.require(user, 'docs.upload'); Perm.assertClient(user, d.client_id);
    var client = DB.get('Clients', d.client_id); V.req(client, 'Client not found.');
    var name = Util.clean(d.file_name, 150).replace(/[\\/:*?"<>|]/g, '_'); V.req(name, 'File name is required.');
    var ext = (name.split('.').pop() || '').toLowerCase(); V.req(ALLOWED.indexOf(ext) > -1, 'This file type is not allowed. Allowed: ' + ALLOWED.join(', ') + '.');
    V.req(d.base64 && typeof d.base64 === 'string', 'No file content received.');
    var maxMb = Settings.num('max_download_mb', 20), approxBytes = Math.floor(d.base64.length * 3 / 4); V.req(approxBytes <= maxMb * 1024 * 1024, 'File is larger than the ' + maxMb + ' MB limit.');
    if (d.task_id) { var t = DB.get('Tasks', d.task_id); V.req(t && t.client_id === d.client_id, 'Task does not belong to this client.'); Perm.assertTask(user, t); }
    var conf = d.confidentiality || 'Normal'; V.oneOf(conf, ['Normal', 'Confidential', 'Restricted'], 'Confidentiality');
    var fy = d.fy || client.fy || Util.fyOf(Util.today());
    var prior = DB.where('Documents', function (x) { return x.client_id === d.client_id && x.file_name === name && x.fy === fy; }), version = 'v' + (prior.length + 1);
    var blob = Utilities.newBlob(Utilities.base64Decode(d.base64), d.mime || 'application/octet-stream', name);
    var folder = fyFolder(client, fy), file = folder.createFile(blob);
    try { file.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE); } catch (e) { /* keep default private */ }
    var doc = DB.insert('Documents', { client_id: d.client_id, task_id: d.task_id || '', fy: fy, category: Util.clean(d.category, 60) || 'General', description: Util.clean(d.description || name, 300), file_name: name, drive_file_id: file.getId(), drive_folder_id: folder.getId(), mime: d.mime || '', size: approxBytes,
      uploaded_by: user.user_id, upload_date: Util.today(), version_ref: version, confidentiality: conf, access_class: conf === 'Normal' ? 'Team' : conf === 'Confidential' ? 'Client team' : 'Partner only' }, user.user_id);
    Audit.log(user, 'DOC_UPLOAD', 'Documents', 'Documents', doc.doc_id, '', { file: name, client: d.client_id, version: version }, '', 'OK');
    return doc;
  }
  function list(user, p) {
    Perm.require(user, 'docs.view'); p = p || {}; var q = String(p.q || '').toLowerCase(), cl = Util.indexBy(DB.all('Clients'), 'client_id'), users = Util.indexBy(DB.all('Users'), 'user_id');
    var rows = DB.all('Documents').filter(function (x) { return canOpen(user, x) && (!p.client_id || x.client_id === p.client_id) && (!p.task_id || x.task_id === p.task_id) && (!p.category || x.category === p.category) && (!q || (x.file_name + ' ' + x.description + ' ' + x.category).toLowerCase().indexOf(q) > -1); })
      .map(function (x) { x.client_name = (cl[x.client_id] || {}).name; x.uploaded_by_name = (users[x.uploaded_by] || {}).full_name; return x; }).sort(function (a, b) { return a.created_at < b.created_at ? 1 : -1; });
    return { rows: rows, total: rows.length };
  }
  /** Streams the file to the signed-in browser after verifying permissions. Drive sharing is never changed. */
  function download(user, docId) {
    var d = DB.get('Documents', docId); V.req(d, 'Document not found.');
    if (!canOpen(user, d)) { Audit.logSeparately(user, 'DENIED', 'Documents', 'Document ' + docId, 'DENIED'); throw new AppError('FORBIDDEN', 'You are not authorised to open this document.'); }
    var file = DriveApp.getFileById(d.drive_file_id), blob = file.getBlob(), max = Settings.num('max_download_mb', 20) * 1024 * 1024; V.req(file.getSize() <= max, 'The file is too large to open through the app. Ask the administrator to share it from Drive.');
    Audit.log(user, 'DOC_ACCESS', 'Documents', 'Documents', docId, '', d.file_name, '', 'OK');
    return { file_name: d.file_name, mime: d.mime || blob.getContentType(), base64: Utilities.base64Encode(blob.getBytes()) };
  }
  function exportRegister(user) {
    Perm.require(user, 'docs.view'); var rows = list(user, {}).rows;
    Audit.log(user, 'EXPORT', 'Documents', 'Documents', '', '', 'rows=' + rows.length, '', 'OK');
    return { filename: 'document_register_' + Util.today() + '.csv', csv: Util.toCsv(['doc_id', 'client_name', 'task_id', 'fy', 'category', 'description', 'file_name', 'drive_file_id', 'version_ref', 'confidentiality', 'uploaded_by_name', 'upload_date'], rows) };
  }

  /* ---------- document requests / checklists ---------- */
  function createRequest(user, d) {
    Perm.require(user, 'docs.upload'); Perm.assertClient(user, d.client_id);
    var items = d.items || []; var tpl = d.template_id ? DB.get('ChecklistTemplates', d.template_id) : null; if (d.template_id) V.req(tpl, 'Checklist template not found.');
    if (tpl) items = tpl.items.split(';').map(function (x) { var p = x.split('|'); return { name: p[0], required: p[1] !== 'O' }; });
    V.req(items.length, 'Add at least one document to request.'); V.req(items.length <= 60, 'Too many items.');
    if (d.task_id) { var t = DB.get('Tasks', d.task_id); V.req(t && t.client_id === d.client_id, 'Task does not belong to this client.'); }
    if (d.contact_id) { var c = DB.get('ClientContacts', d.contact_id); V.req(c && c.client_id === d.client_id, 'Contact does not belong to this client.'); }
    var req = DB.insert('DocumentRequests', { client_id: d.client_id, task_id: d.task_id || '', title: Util.clean(d.title || (tpl && tpl.name), 200), requested_by: user.user_id, requested_date: Util.today(), due_date: V.optDate(d.due_date, 'Due date'), contact_id: d.contact_id || '', status: 'Open', template_id: d.template_id || '' }, user.user_id);
    items.forEach(function (it) { DB.insert('DocumentRequestItems', { request_id: req.request_id, name: Util.clean(it.name, 200), required: it.required === false ? 'N' : 'Y', requested_date: Util.today(), verification_status: 'Pending', status: 'Requested' }, user.user_id); });
    Audit.log(user, 'DOCREQ_CREATE', 'Documents', 'DocumentRequests', req.request_id, '', { items: items.length }, '', 'OK'); return req;
  }
  function refreshRequest(requestId, by) {
    var items = DB.where('DocumentRequestItems', function (i) { return i.request_id === requestId; }), req = DB.get('DocumentRequests', requestId); if (!req || req.status === 'Cancelled') return;
    var reqd = items.filter(function (i) { return i.required === 'Y' && i.status !== 'Not Applicable'; }), recd = reqd.filter(function (i) { return i.status === 'Received' && i.verification_status !== 'Issue'; });
    var st = reqd.length && recd.length === reqd.length ? 'Complete' : (items.some(function (i) { return i.status === 'Received'; }) ? 'Partially Received' : 'Open');
    if (st !== req.status) DB.update('DocumentRequests', requestId, { status: st }, by);
    if (st === 'Complete' && req.task_id) { var t = DB.get('Tasks', req.task_id); if (t && t.status === 'Waiting for Client Documents') Notify.send([t.partner_id, t.senior_id].concat(Perm.participants(t.task_id)), 'DOCS_COMPLETE', 'All documents received: ' + t.title, 'You can resume the work.', 'Task', t.task_id); }
  }
  function updateItem(user, itemId, d) {
    Perm.require(user, 'docs.upload'); var it = DB.get('DocumentRequestItems', itemId); V.req(it, 'Item not found.'); var req = DB.get('DocumentRequests', it.request_id); Perm.assertClient(user, req.client_id);
    var patch = {}; if (d.status) patch.status = V.oneOf(d.status, ['Requested', 'Received', 'Incomplete', 'Not Applicable'], 'Status');
    if (patch.status === 'Received') { patch.received_date = V.date(d.received_date || Util.today(), 'Received date'); V.req(patch.received_date <= Util.today(), 'Received date cannot be in the future.'); }
    if (d.verification_status) { patch.verification_status = V.oneOf(d.verification_status, ['Pending', 'Verified', 'Issue'], 'Verification'); }
    if (d.doc_id) { var doc = DB.get('Documents', d.doc_id); V.req(doc && doc.client_id === req.client_id, 'Document does not belong to this client.'); patch.doc_id = d.doc_id; }
    if (d.remarks !== undefined) patch.remarks = Util.clean(d.remarks, 300);
    var upd = DB.update('DocumentRequestItems', itemId, patch, user.user_id); refreshRequest(it.request_id, user.user_id);
    Audit.log(user, 'DOCREQ_ITEM', 'Documents', 'DocumentRequestItems', itemId, it.status, upd.status, '', 'OK'); return upd;
  }
  function listRequests(user, p) {
    Perm.require(user, 'docs.view'); p = p || {}; var sc = Perm.clientScope(user), cl = Util.indexBy(DB.all('Clients'), 'client_id'), items = Util.groupBy(DB.all('DocumentRequestItems'), function (i) { return i.request_id; });
    return DB.all('DocumentRequests').filter(function (r) { return (sc === null || sc[r.client_id]) && (!p.client_id || r.client_id === p.client_id) && (!p.task_id || r.task_id === p.task_id) && (!p.status || r.status === p.status) && (!p.open || ['Open', 'Partially Received'].indexOf(r.status) > -1); })
      .map(function (r) { r.client_name = (cl[r.client_id] || {}).name; r.items = items[r.request_id] || []; r.missing = r.items.filter(function (i) { return i.required === 'Y' && ['Requested', 'Incomplete'].indexOf(i.status) > -1; }).length; return r; });
  }
  return { ensureRoot: ensureRoot, ensureClientFolder: ensureClientFolder, upload: upload, list: list, download: download, exportRegister: exportRegister, createRequest: createRequest, updateItem: updateItem, listRequests: listRequests, canOpen: canOpen, SUBFOLDERS: SUBFOLDERS, ALLOWED: ALLOWED };
})();


// ======== Compliance.gs ========
/** Compliance.gs - administrator-maintained compliance calendar and per-client compliance records. Deadlines are NEVER hard-coded; unverified entries are labelled. */
var Compliance = (function () {
  function effectiveDue(cal) { return Util.addDays(cal.due_date, cal.adjust_days || 0); }
  function saveCalendar(user, d) {
    Perm.require(user, 'compliance.manage');
    var o = { category: V.oneOf(d.category, COMPLIANCE_CATEGORIES, 'Category'), name: Util.clean(d.name, 200), form_ref: Util.clean(d.form_ref, 60), period_label: Util.clean(d.period_label, 60), fy: Util.clean(d.fy, 10), due_date: V.date(d.due_date, 'Due date'),
      adjust_days: V.num(d.adjust_days || 0, 'Adjustment days', -30, 90), source_note: Util.clean(d.source_note, 300) };
    V.req(o.name, 'Name is required.');
    var cur = d.calendar_id ? DB.get('ComplianceCalendar', d.calendar_id) : null;
    if (cur) { var changed = cur.due_date !== o.due_date || cur.adjust_days !== o.adjust_days; o.status = changed ? 'UNVERIFIED' : cur.status; } else o.status = 'UNVERIFIED';
    var r = cur ? DB.update('ComplianceCalendar', cur.calendar_id, o, user.user_id) : DB.insert('ComplianceCalendar', o, user.user_id);
    Audit.log(user, cur ? 'UPDATE' : 'CREATE', 'Compliance', 'ComplianceCalendar', r.calendar_id, cur ? { due: cur.due_date } : '', { due: o.due_date, adj: o.adjust_days }, '', 'OK'); return r;
  }
  function verify(user, id, note) {
    Perm.require(user, 'compliance.manage'); var c = DB.get('ComplianceCalendar', id); V.req(c, 'Calendar entry not found.');
    var src = Util.clean(note, 300); V.req(src || c.source_note, 'Record the authoritative source (notification / portal notice) used to verify this due date.');
    var r = DB.update('ComplianceCalendar', id, { status: 'VERIFIED', verified_by: user.user_id, verified_on: Util.today(), source_note: src || c.source_note }, user.user_id);
    Audit.log(user, 'VERIFY', 'Compliance', 'ComplianceCalendar', id, c.status, 'VERIFIED', src, 'OK'); return r;
  }
  function listCalendar(user, p) {
    Perm.require(user, 'compliance.view'); p = p || {};
    return DB.all('ComplianceCalendar').filter(function (c) { return (!p.category || c.category === p.category) && (!p.from || effectiveDue(c) >= p.from) && (!p.to || effectiveDue(c) <= p.to); })
      .map(function (c) { c.effective_due = effectiveDue(c); return c; }).sort(function (a, b) { return a.effective_due < b.effective_due ? -1 : 1; });
  }
  /** Creates a record for every active client that has a service in the calendar category. Idempotent. */
  function generateRecords(user, calendarId) {
    Perm.require(user, 'compliance.manage'); var cal = DB.get('ComplianceCalendar', calendarId); V.req(cal, 'Calendar entry not found.');
    var svc = Util.indexBy(DB.all('ServiceCategories'), 'service_id'), sc = Perm.clientScope(user), made = 0, skipped = 0;
    var clientIds = {}; DB.all('ClientServices').forEach(function (cs) { var s = svc[cs.service_id]; if (s && s.category === cal.category && cs.status !== 'Inactive') clientIds[cs.client_id] = true; });
    Object.keys(clientIds).forEach(function (cid) {
      var c = DB.get('Clients', cid); if (!c || c.status === 'Closed' || (sc !== null && !sc[cid])) return;
      if (DB.findOne('ComplianceRecords', function (r) { return r.calendar_id === calendarId && r.client_id === cid; })) { skipped++; return; }
      DB.insert('ComplianceRecords', { calendar_id: calendarId, client_id: cid, status: 'Pending', responsible_user: c.clerk_id || c.senior_id || c.partner_id || '' }, user.user_id); made++;
    });
    Audit.log(user, 'GENERATE', 'Compliance', 'ComplianceRecords', calendarId, '', { created: made, skipped: skipped }, '', 'OK'); return { created: made, skipped: skipped };
  }
  function updateRecord(user, id, d) {
    Perm.require(user, 'compliance.view'); var r = DB.get('ComplianceRecords', id); V.req(r, 'Record not found.'); Perm.assertClient(user, r.client_id);
    var c = DB.get('Clients', r.client_id), allowed = Perm.has(user, 'compliance.manage') || r.responsible_user === user.user_id || c.partner_id === user.user_id || Perm.isTop(user); V.req(allowed, 'You are not authorised to update this record.');
    var p = {}; if (d.status) p.status = V.oneOf(d.status, ['Pending', 'Docs Awaited', 'In Progress', 'Filed', 'Not Applicable'], 'Status');
    ['ack_no', 'remarks', 'docs_missing'].forEach(function (k) { if (d[k] !== undefined) p[k] = Util.clean(d[k], 300); });
    if (d.filed_date !== undefined) p.filed_date = V.optDate(d.filed_date, 'Filed date'); if (d.evidence_doc_id) { var doc = DB.get('Documents', d.evidence_doc_id); V.req(doc && doc.client_id === r.client_id, 'Evidence document must belong to this client.'); p.evidence_doc_id = d.evidence_doc_id; }
    if (d.responsible_user) { var u = DB.get('Users', d.responsible_user); V.req(u && u.is_active !== 'N', 'Responsible user is not active.'); p.responsible_user = d.responsible_user; }
    var merged = {}; for (var k in r) merged[k] = r[k]; for (var k2 in p) merged[k2] = p[k2];
    if (merged.status === 'Filed') { V.req(merged.filed_date, 'Enter the filing date.'); V.req(merged.filed_date <= Util.today(), 'Filing date cannot be in the future.'); V.req(merged.ack_no || merged.evidence_doc_id, 'Enter the acknowledgement / reference number or attach evidence.'); }
    var upd = DB.update('ComplianceRecords', id, p, user.user_id); Audit.log(user, 'RECORD_UPDATE', 'Compliance', 'ComplianceRecords', id, { status: r.status }, { status: upd.status }, '', 'OK'); return upd;
  }
  function createTask(user, recordId, confirmOverload) {
    Perm.require(user, 'task.create'); var r = DB.get('ComplianceRecords', recordId); V.req(r, 'Record not found.'); V.req(!r.task_id, 'A task is already linked to this record.'); Perm.assertClient(user, r.client_id);
    var cal = DB.get('ComplianceCalendar', r.calendar_id), c = DB.get('Clients', r.client_id);
    var t = Tasks.create(user, { client_id: r.client_id, title: cal.name + ' - ' + (cal.period_label || '') + ' - ' + c.name, due_date: Compliance.effectiveDue(cal), clerk_id: r.responsible_user || c.clerk_id || '', priority: 'High', est_hours: 0, confirm_overload: !!confirmOverload, description: 'Compliance: ' + cal.category + ' ' + (cal.form_ref || '') });
    DB.update('ComplianceRecords', recordId, { task_id: t.task_id }, user.user_id); return t;
  }
  function listRecords(user, p) {
    Perm.require(user, 'compliance.view'); p = p || {}; var sc = Perm.clientScope(user), cal = Util.indexBy(DB.all('ComplianceCalendar'), 'calendar_id'), cl = Util.indexBy(DB.all('Clients'), 'client_id'), users = Util.indexBy(DB.all('Users'), 'user_id'), t0 = Util.today();
    var rows = DB.all('ComplianceRecords').filter(function (r) { return sc === null || sc[r.client_id]; }).map(function (r) {
      var c = cal[r.calendar_id] || {}; r.client_name = (cl[r.client_id] || {}).name; r.calendar_name = c.name; r.category = c.category; r.period_label = c.period_label; r.due_date = c.due_date ? effectiveDue(c) : ''; r.verified = c.status === 'VERIFIED';
      r.responsible_name = (users[r.responsible_user] || {}).full_name || ''; r.overdue = ['Filed', 'Not Applicable'].indexOf(r.status) < 0 && r.due_date && r.due_date < t0; r.days_to_due = r.due_date ? Util.diffDays(t0, r.due_date) : null; return r;
    }).filter(function (r) { return (!p.client_id || r.client_id === p.client_id) && (!p.status || r.status === p.status) && (!p.category || r.category === p.category) && (!p.overdue || r.overdue) && (!p.from || r.due_date >= p.from) && (!p.to || r.due_date <= p.to); })
      .sort(function (a, b) { return (a.due_date || '9') < (b.due_date || '9') ? -1 : 1; });
    return { rows: rows, total: rows.length };
  }
  return { saveCalendar: saveCalendar, verify: verify, listCalendar: listCalendar, generateRecords: generateRecords, updateRecord: updateRecord, createTask: createTask, listRecords: listRecords, effectiveDue: effectiveDue };
})();


// ======== Email.gs ========
/** Email.gs - client email drafting, approval workflow and sending through Gmail. Never sends without an APPROVED queue row. */
var Mail = (function () {
  var LEVEL_ROLES = { NONE: ['ADMIN', 'MANAGING_PARTNER', 'PARTNER', 'SENIOR', 'CLERK', 'ACCOUNTS'], SENIOR: ['ADMIN', 'MANAGING_PARTNER', 'PARTNER', 'SENIOR'], PARTNER: ['ADMIN', 'MANAGING_PARTNER', 'PARTNER'] };

  function render(text, vars) { return String(text || '').replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, function (m, k) { return vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : m; }); }
  function varsFor(user, d) {
    var c = d.client_id ? DB.get('Clients', d.client_id) : {}, t = d.task_id ? DB.get('Tasks', d.task_id) : {}, svc = t && t.service_id ? DB.get('ServiceCategories', t.service_id) : null, v = d.vars || {};
    var base = { client_name: c.name || '', contact_person: c.contact_person || 'Sir / Madam', fy: c.fy || '', sender_name: user.full_name, firm_name: Settings.get('firm_name'), service: svc ? svc.name : (v.service || ''), due_date: t.due_date || v.due_date || '', period: t.period_key || v.period || '' };
    Object.keys(v).forEach(function (k) { base[k] = String(v[k]); }); return base;
  }
  function recipientOk(email) {
    email = V.email(email, 'Recipient email'); var allow = Settings.get('email_domain_allow', '').split(',').map(function (x) { return x.trim().toLowerCase(); }).filter(Boolean);
    if (allow.length) V.req(allow.indexOf(email.split('@')[1]) > -1, 'Recipient domain is not in the allowed list set by the administrator.'); return email;
  }
  function levelFor(code) { var tpl = code ? DB.get('EmailTemplates', code) : null; var lv = (tpl && tpl.approval_level) || Settings.get('email_default_approval', 'PARTNER'); return LEVEL_ROLES[lv] ? lv : 'PARTNER'; }

  function draft(user, d) {
    Perm.require(user, 'email.draft');
    V.req(d.client_id, 'Select a client.'); Perm.assertClient(user, d.client_id);
    var tpl = d.template_code ? DB.get('EmailTemplates', d.template_code) : null; if (d.template_code) V.req(tpl, 'Template not found.');
    var vars = varsFor(user, d), subject = d.subject ? Util.clean(d.subject, 250) : render(tpl.subject, vars), body = d.body ? Util.clean(d.body, 8000) : render(tpl.body, vars);
    V.req(subject && body, 'Subject and message are required.');
    var to = recipientOk(d.to_email || (DB.get('Clients', d.client_id) || {}).email), cc = d.cc_email ? recipientOk(d.cc_email) : '';
    var unresolved = (subject + ' ' + body).match(/\{\{[a-z_]+\}\}/gi);
    var refs = (d.attachment_doc_ids || []).map(function (id) { var doc = DB.get('Documents', id); V.req(doc && doc.client_id === d.client_id && Docs.canOpen(user, doc), 'You cannot attach document ' + id + '.'); return id; });
    var q = DB.insert('EmailQueue', { client_id: d.client_id, task_id: d.task_id || '', template_code: d.template_code || '', to_email: to, cc_email: cc, subject: subject, body: body, status: 'DRAFT', approval_level: levelFor(d.template_code), drafted_by: user.user_id, attempts: 0,
      dedupe_key: d.dedupe_key || '', attachment_refs: refs.join(',') }, user.user_id);
    Audit.log(user, 'EMAIL_DRAFT', 'Email', 'EmailQueue', q.queue_id, '', { to: to, subject: subject }, '', 'OK');
    q.warnings = unresolved ? ['Unfilled placeholders: ' + unresolved.join(', ')] : []; return q;
  }
  function editDraft(user, id, d) {
    var q = DB.get('EmailQueue', id); V.req(q, 'Email not found.'); V.req(q.drafted_by === user.user_id || Perm.isTop(user), 'Only the author can edit this draft.'); V.req(['DRAFT', 'REJECTED'].indexOf(q.status) > -1, 'Only drafts can be edited.');
    Perm.assertClient(user, q.client_id);
    var p = {}; if (d.subject !== undefined) p.subject = Util.clean(d.subject, 250); if (d.body !== undefined) p.body = Util.clean(d.body, 8000); if (d.to_email) p.to_email = recipientOk(d.to_email); if (d.cc_email !== undefined) p.cc_email = d.cc_email ? recipientOk(d.cc_email) : '';
    p.status = 'DRAFT'; return DB.update('EmailQueue', id, p, user.user_id);
  }
  function submit(user, id) {
    var q = DB.get('EmailQueue', id); V.req(q && q.drafted_by === user.user_id, 'Email not found.'); V.req(q.status === 'DRAFT', 'Only a draft can be submitted.'); Perm.assertClient(user, q.client_id);
    V.req(!/\{\{[a-z_]+\}\}/i.test(q.subject + q.body), 'Fill in or remove the {{placeholders}} before submitting.');
    var st = q.approval_level === 'NONE' ? 'APPROVED' : 'PENDING_APPROVAL', upd = DB.update('EmailQueue', id, { status: st, approved_by: st === 'APPROVED' ? 'auto' : '', approved_at: st === 'APPROVED' ? Util.now() : '' }, user.user_id);
    if (st === 'PENDING_APPROVAL') { var c = DB.get('Clients', q.client_id); Notify.send([c.partner_id].concat(DB.where('Users', function (u) { return u.role === 'MANAGING_PARTNER'; }).map(function (u) { return u.user_id; })), 'EMAIL_APPROVAL', 'Email awaiting approval: ' + q.subject, 'Drafted by ' + user.full_name, 'Email', id); }
    Audit.log(user, 'EMAIL_SUBMIT', 'Email', 'EmailQueue', id, 'DRAFT', st, '', 'OK'); return upd;
  }
  function decide(user, id, approve, remarks) {
    Perm.require(user, 'email.approve'); var q = DB.get('EmailQueue', id); V.req(q && q.status === 'PENDING_APPROVAL', 'Email is not awaiting approval.'); Perm.assertClient(user, q.client_id);
    V.req(LEVEL_ROLES[q.approval_level].indexOf(user.role) > -1, 'This email needs ' + q.approval_level.toLowerCase() + '-level approval.');
    if (q.drafted_by === user.user_id) V.req(Settings.get('email_allow_self_approval', 'N') === 'Y' && user.role !== 'SENIOR', 'You cannot approve your own draft. Another partner or the administrator must approve it.');
    if (!approve) V.req(Util.clean(remarks, 300), 'Please give a reason for rejecting.');
    var upd = DB.update('EmailQueue', id, { status: approve ? 'APPROVED' : 'REJECTED', approved_by: user.user_id, approved_at: Util.now(), last_error: approve ? '' : Util.clean(remarks, 300) }, user.user_id);
    Notify.send([q.drafted_by], 'EMAIL_DECISION', 'Email ' + (approve ? 'approved' : 'rejected') + ': ' + q.subject, remarks || '', 'Email', id);
    Audit.log(user, approve ? 'EMAIL_APPROVE' : 'EMAIL_REJECT', 'Email', 'EmailQueue', id, q.status, upd.status, remarks || '', 'OK'); return upd;
  }
  function send(user, id) {
    Perm.require(user, 'email.send'); var q = DB.get('EmailQueue', id); V.req(q, 'Email not found.'); Perm.assertClient(user, q.client_id);
    V.req(['APPROVED', 'FAILED'].indexOf(q.status) > -1, q.status === 'SENT' ? 'This email has already been sent.' : q.status === 'SENDING' ? 'This email is already being sent. Check the log before retrying.' : 'Only approved emails can be sent.');
    V.req(q.attempts < 5, 'Too many failed attempts. Please review the error and create a new draft.');
    if (q.dedupe_key && DB.findOne('EmailQueue', function (x) { return x.dedupe_key === q.dedupe_key && x.status === 'SENT' && x.queue_id !== id; })) throw new AppError('DUPLICATE', 'An email with the same reference was already sent.');
    var quota = 1; try { quota = MailApp.getRemainingDailyQuota(); } catch (e) {}
    V.req(quota > 0, 'The daily Gmail sending quota is exhausted. Try again tomorrow.');
    DB.update('EmailQueue', id, { status: 'SENDING', attempts: q.attempts + 1 }, user.user_id);
    try {
      var opts = { name: Settings.get('firm_name') }; if (q.cc_email) opts.cc = q.cc_email; var reply = Settings.get('firm_email'); if (reply) opts.replyTo = reply;
      if (q.attachment_refs) opts.attachments = q.attachment_refs.split(',').filter(Boolean).map(function (did) { var doc = DB.get('Documents', did); V.req(doc && Docs.canOpen(user, doc), 'Attachment is not accessible.'); return DriveApp.getFileById(doc.drive_file_id).getBlob(); });
      GmailApp.sendEmail(q.to_email, q.subject, q.body, opts);
      DB.update('EmailQueue', id, { status: 'SENT', sent_at: Util.now(), last_error: '' }, user.user_id);
      DB.insert('EmailLogs', { queue_id: id, client_id: q.client_id, task_id: q.task_id, to_email: q.to_email, subject: q.subject, status: 'SENT', sent_by: user.user_id, sent_at: Util.now() }, user.user_id);
      Audit.log(user, 'EMAIL_SEND', 'Email', 'EmailQueue', id, '', { to: q.to_email }, '', 'OK');
      return { status: 'SENT' };
    } catch (e) {
      var msg = String(e && e.message || e).slice(0, 200);
      DB.update('EmailQueue', id, { status: 'FAILED', last_error: msg }, user.user_id);
      DB.insert('EmailLogs', { queue_id: id, client_id: q.client_id, task_id: q.task_id, to_email: q.to_email, subject: q.subject, status: 'FAILED', error: msg, sent_by: user.user_id, sent_at: Util.now() }, user.user_id);
      Audit.log(user, 'EMAIL_SEND', 'Email', 'EmailQueue', id, '', { to: q.to_email }, msg, 'FAILED');
      return { status: 'FAILED', error: 'The email could not be sent. You can retry from the queue. (' + msg + ')' };
    }
  }
  function list(user, p) {
    Perm.require(user, 'email.draft'); p = p || {}; var sc = Perm.clientScope(user), cl = Util.indexBy(DB.all('Clients'), 'client_id'), users = Util.indexBy(DB.all('Users'), 'user_id');
    var rows = DB.all('EmailQueue').filter(function (q) { return (sc === null || sc[q.client_id]) && (!p.client_id || q.client_id === p.client_id) && (!p.status || q.status === p.status) && (!p.task_id || q.task_id === p.task_id) && (p.all || Perm.isTop(user) || q.drafted_by === user.user_id || (Perm.has(user, 'email.approve'))); })
      .map(function (q) { q.client_name = (cl[q.client_id] || {}).name; q.drafted_by_name = (users[q.drafted_by] || {}).full_name; return q; }).sort(function (a, b) { return a.created_at < b.created_at ? 1 : -1; });
    return { rows: rows, total: rows.length, quota_remaining: (function () { try { return MailApp.getRemainingDailyQuota(); } catch (e) { return null; } })() };
  }
  function history(user, clientId) { Perm.assertClient(user, clientId); return DB.where('EmailLogs', function (l) { return l.client_id === clientId; }).sort(function (a, b) { return a.sent_at < b.sent_at ? 1 : -1; }); }
  return { draft: draft, editDraft: editDraft, submit: submit, decide: decide, send: send, list: list, history: history, render: render };
})();


/** System emails (activation keys etc.). Sends from the configured alias when Gmail allows it, otherwise from the account itself with Reply-To set. */
var Mailer = (function () {
  function send(to, subject, body) {
    var from = String(Settings.get('mail_from', '')).trim(), o = { name: Settings.get('mail_from_name', Settings.get('firm_name', APP.NAME)) };
    var reply = from || Settings.get('firm_email', ''); if (reply) o.replyTo = reply;
    var quota = 1; try { quota = MailApp.getRemainingDailyQuota(); } catch (e) {}
    if (quota <= 0) throw new AppError('QUOTA', 'The daily email limit has been reached. Please try again tomorrow.');
    if (from) { try { var o2 = {}; for (var k in o) o2[k] = o[k]; o2.from = from; GmailApp.sendEmail(to, subject, body, o2); return { from: from }; } catch (e) { console.warn('Alias send failed, using account default: ' + (e && e.message)); } }
    GmailApp.sendEmail(to, subject, body, o); return { from: 'account default' };
  }
  return { send: send };
})();


// ======== Admin.gs ========
/** Admin.gs - users, permissions, settings, master data, audit viewer. */
var Admin = (function () {
  function lastAdminGuard(targetId) {
    var admins = DB.where('Users', function (u) { return u.role === 'ADMIN' && u.is_active !== 'N'; }); V.req(!(admins.length === 1 && admins[0].user_id === targetId), 'At least one active Firm Administrator must remain.');
  }
  function directory(user) {
    var showEmail = Perm.has(user, 'user.manage') || Perm.isTop(user);
    return DB.all('Users').map(function (u) { var o = { user_id: u.user_id, full_name: u.full_name, role: u.role, partner_id: u.partner_id }; if (showEmail) o.email = u.email; return o; });
  }
  function listUsers(user) {
    Perm.require(user, 'user.manage'); var cred = Util.indexBy(DB.all('Credentials'), 'user_id'), emp = Util.indexBy(DB.all('Employees'), 'user_id');
    return DB.all('Users', true).map(function (u) { var c = cred[u.user_id] || {}; u.activated = !!c.hash; u.last_login = c.last_login || ''; u.locked = !!(c.locked_until && c.locked_until > Util.now()); u.work_hours_per_day = (emp[u.user_id] || {}).work_hours_per_day || ''; return u; });
  }
  function saveUser(user, d) {
    Perm.require(user, 'user.manage');
    var o = { full_name: Util.clean(d.full_name, 120), email: V.email(d.email), role: V.oneOf(d.role, Object.keys(ROLES), 'Role'), employee_code: Util.clean(d.employee_code, 30), partner_id: d.partner_id || '', reporting_manager_id: d.reporting_manager_id || '',
      joining_date: V.optDate(d.joining_date, 'Joining date'), employment_status: Util.clean(d.employment_status || 'Active', 30), department: Util.clean(d.department, 60), contact_number: Util.clean(d.contact_number, 15), client_access: d.client_access || 'ASSIGNED' };
    V.req(o.full_name, 'Full name is required.');
    if (o.contact_number) V.req(V.MOBILE.test(o.contact_number), 'Contact number must be a 10-digit Indian mobile number.');
    if (o.partner_id) { var p = DB.get('Users', o.partner_id); V.req(p && ['PARTNER', 'MANAGING_PARTNER', 'ADMIN'].indexOf(p.role) > -1, 'Partner in charge must be a partner.'); }
    if (d.user_id) {
      var cur = DB.get('Users', d.user_id); V.req(cur, 'User not found.');
      if (cur.role === 'ADMIN' && o.role !== 'ADMIN') lastAdminGuard(cur.user_id);
      V.req(!(cur.user_id === user.user_id && o.role !== cur.role), 'You cannot change your own role.');
      var upd = DB.update('Users', d.user_id, o, user.user_id), df = Audit.diff(cur, upd); Audit.log(user, 'USER_UPDATE', 'Users', 'Users', d.user_id, df.prev, df.next, '', 'OK');
      if (cur.role !== upd.role) Audit.log(user, 'ROLE_CHANGE', 'Users', 'Users', d.user_id, cur.role, upd.role, d.reason || '', 'OK');
      syncProfile(upd, d, user); return { user: upd };
    }
    var u = DB.insert('Users', o, user.user_id); syncProfile(u, d, user);
    var code = Auth.issueActivation(u.user_id, user.user_id);
    Audit.log(user, 'USER_CREATE', 'Users', 'Users', u.user_id, '', { email: u.email, role: u.role }, '', 'OK');
    return { user: u, activation_code: code, note: 'Give this one-time code to the user. It is shown only once and expires in 3 days.' };
  }
  function syncProfile(u, d, by) {
    if (['PARTNER', 'MANAGING_PARTNER'].indexOf(u.role) > -1) { var pr = { display_name: u.full_name, membership_no: Util.clean(d.membership_no, 30), specialization: Util.clean(d.specialization, 100), can_approve: 'Y' }; if (DB.get('Partners', u.user_id)) DB.update('Partners', u.user_id, pr, by.user_id); else { pr.user_id = u.user_id; DB.insert('Partners', pr, by.user_id); } }
    if (['SENIOR', 'CLERK', 'ACCOUNTS'].indexOf(u.role) > -1) {
      var em = { designation: Util.clean(d.designation, 60), articleship_start: V.optDate(d.articleship_start, 'Articleship start'), articleship_end: V.optDate(d.articleship_end, 'Articleship end'), work_hours_per_day: d.work_hours_per_day ? V.num(d.work_hours_per_day, 'Work hours', 1, 16) : Settings.num('work_hours_per_day', 8), cost_per_hour: d.cost_per_hour ? V.num(d.cost_per_hour, 'Cost per hour', 0) : 0 };
      if (DB.get('Employees', u.user_id)) DB.update('Employees', u.user_id, em, by.user_id); else { em.user_id = u.user_id; DB.insert('Employees', em, by.user_id); }
    }
  }
  function deactivate(user, id, reason) {
    Perm.require(user, 'user.manage'); reason = Util.clean(reason, 300); V.req(reason, 'A reason is required.');
    var u = DB.get('Users', id); V.req(u, 'User not found.'); V.req(id !== user.user_id, 'You cannot deactivate your own account.'); if (u.role === 'ADMIN') lastAdminGuard(id);
    var open = Perm.activeAssignments(id).filter(function (a) { var t = DB.get('Tasks', a.task_id); return t && OPEN_STATUSES.indexOf(t.status) > -1; }).length;
    DB.update('Users', id, { is_active: 'N', deactivated_on: Util.today(), employment_status: 'Inactive' }, user.user_id);
    Audit.log(user, 'USER_DEACTIVATE', 'Users', 'Users', id, 'active', 'inactive', reason, 'OK');
    return { deactivated: true, open_tasks_to_reassign: open };
  }
  function reactivate(user, id) { Perm.require(user, 'user.manage'); var u = DB.get('Users', id); V.req(u, 'User not found.'); DB.update('Users', id, { is_active: 'Y', deactivated_on: '', employment_status: 'Active' }, user.user_id); var code = Auth.issueActivation(id, user.user_id); Audit.log(user, 'USER_REACTIVATE', 'Users', 'Users', id, 'inactive', 'active', '', 'OK'); return { activation_code: code }; }
  function resetAccess(user, id) { Perm.require(user, 'user.manage'); var u = DB.get('Users', id); V.req(u && u.is_active !== 'N', 'User not found or inactive.'); var code = Auth.issueActivation(id, user.user_id); Audit.log(user, 'USER_RESET', 'Users', 'Users', id, '', '', '', 'OK'); return { activation_code: code }; }

  function permMatrix(user) {
    Perm.require(user, 'user.manage'); var roles = {}; Object.keys(ROLES).forEach(function (r) { roles[r] = ALL_PERMS.filter(function (p) { var rows = DB.where('RolePermissions', function (x) { return x.role === r; }); return rows.length ? rows.some(function (x) { return x.perm === p && x.effect !== 'DENY'; }) : DEFAULT_ROLE_PERMS[r].indexOf(p) > -1; }); });
    return { perms: PERMS, roles: roles, role_labels: ROLES, overrides: DB.all('UserPermissions') };
  }
  function setRolePerms(user, role, perms) {
    Perm.require(user, 'user.manage'); V.oneOf(role, Object.keys(ROLES), 'Role'); V.req(role !== 'ADMIN', 'Administrator permissions are fixed.'); V.req(Array.isArray(perms), 'Invalid permission list.');
    perms.forEach(function (p) { V.req(PERMS[p], 'Unknown permission ' + p); });
    DB.where('RolePermissions', function (x) { return x.role === role; }).forEach(function (x) { DB.deactivate('RolePermissions', x.id, user.user_id); });
    DB.insert('RolePermissions', { role: role, perm: '__marker__', effect: 'DENY' }, user.user_id); // marks the role as customised
    perms.forEach(function (p) { DB.insert('RolePermissions', { role: role, perm: p, effect: 'GRANT' }, user.user_id); });
    Audit.log(user, 'PERMISSION_CHANGE', 'Permissions', 'RolePermissions', role, '', { count: perms.length }, '', 'OK'); return true;
  }
  function setUserPerm(user, userId, perm, effect, reason) {
    Perm.require(user, 'user.manage'); V.req(DB.get('Users', userId), 'User not found.'); V.req(PERMS[perm], 'Unknown permission.');
    DB.where('UserPermissions', function (x) { return x.user_id === userId && x.perm === perm; }).forEach(function (x) { DB.deactivate('UserPermissions', x.id, user.user_id); });
    if (effect === 'GRANT' || effect === 'DENY') DB.insert('UserPermissions', { user_id: userId, perm: perm, effect: effect, reason: Util.clean(reason, 200) }, user.user_id);
    Audit.log(user, 'PERMISSION_CHANGE', 'Permissions', 'UserPermissions', userId, '', { perm: perm, effect: effect || 'CLEAR' }, reason || '', 'OK'); return true;
  }
  function setClientAccess(user, userId, clientIds) {
    Perm.require(user, 'user.manage'); V.req(DB.get('Users', userId), 'User not found.'); V.req(Array.isArray(clientIds), 'Invalid list.');
    clientIds.forEach(function (c) { V.req(DB.get('Clients', c), 'Client not found: ' + c); });
    DB.where('UserClientAccess', function (x) { return x.user_id === userId; }).forEach(function (x) { if (clientIds.indexOf(x.client_id) < 0) DB.deactivate('UserClientAccess', x.id, user.user_id); });
    var have = DB.where('UserClientAccess', function (x) { return x.user_id === userId; }).map(function (x) { return x.client_id; });
    clientIds.forEach(function (c) { if (have.indexOf(c) < 0) DB.insert('UserClientAccess', { user_id: userId, client_id: c, access_level: 'WORK' }, user.user_id); });
    Audit.log(user, 'CLIENT_ACCESS', 'Users', 'UserClientAccess', userId, '', { clients: clientIds.length }, '', 'OK'); return true;
  }
  function getClientAccess(user, userId) { Perm.require(user, 'user.manage'); return DB.where('UserClientAccess', function (x) { return x.user_id === userId; }).map(function (x) { return x.client_id; }); }

  /* ---------- settings ---------- */
  var NUMERIC = ['work_hours_per_day', 'default_tax_rate_pct', 'deadline_reminder_days', 'review_escalation_days', 'file_return_grace_days', 'max_download_mb', 'session_hours', 'backup_retention'];
  function getSettings(user) { Perm.require(user, 'settings.manage'); return DB.all('Settings').filter(function (s) { return s.key.indexOf('seq_') !== 0 && s.key !== 'registry_key' && s.key !== 'registry_id'; }); }
  /** Techmin registration: the profile the firm shares, the id and (for administrators only) the key used to talk to the Techmin registry. */
  function registryGet(user) {
    Perm.require(user, 'settings.manage');
    var keys = ['firm_name', 'firm_address', 'firm_city', 'firm_state', 'firm_pincode', 'firm_gstin', 'firm_pan', 'firm_frn', 'firm_contact', 'firm_email', 'firm_phone'], p = {};
    keys.forEach(function (k) { p[k] = Settings.get(k, ''); });
    var id = Settings.get('registry_id', ''), key = Settings.get('registry_key', '');
    return { profile: p, registry_id: id, registry_key: id && key ? key : '', registered: !!(id && key), active_users: DB.where('Users', function (u) { return u.employment_status === 'Active' || u.employment_status === ''; }).length, version: APP.VERSION };
  }
  function registrySave(user, p) {
    Perm.require(user, 'settings.manage'); p = p || {};
    V.req(/^F-[A-Z0-9-]{6,30}$/.test(String(p.registry_id || '')), 'The Techmin firm id is not valid.'); V.req(/^[a-f0-9]{32}$/.test(String(p.registry_key || '')), 'The Techmin firm key is not valid.');
    V.req(!Settings.get('registry_id', '') || Settings.get('registry_id') === p.registry_id, 'This workspace is already registered with Techmin. Contact Techmin support to change it.');
    DB.tx(function () { Settings.set('registry_id', p.registry_id, user.user_id); Settings.set('registry_key', p.registry_key, user.user_id); });
    Audit.log(user, 'REGISTRY_REGISTER', 'Settings', 'Settings', 'registry_id', '', { registry_id: p.registry_id }, '', 'OK');
    var warn = ''; if (p.values && typeof p.values === 'object') { try { saveSettings(user, p.values); } catch (e) { warn = String(e && e.message || e); } }
    var out = registryGet(user); out.registered = true; if (warn) out.warning = warn; return out;
  }
  function firmLink() {
    var base = Settings.get('app_url', ''), svc = webAppUrl_();
    if (!base) return ''; if (!svc) return base;
    return base + (base.indexOf('?') < 0 ? '?' : '&') + 'ws=' + encodeURIComponent(svc);
  }
  function publicSettings() { return { firm_link: firmLink(), firm_name: Settings.get('firm_name', APP.NAME), demo_mode: Settings.get('demo_mode', 'N'), version: APP.VERSION, open_registration: Settings.get('open_registration', 'Y'), registration_approval: Settings.get('registration_approval', 'Y') }; }

  /* ---- self-registration (public) ---- */
  var REG_ROLES = ['CLERK', 'SENIOR', 'ACCOUNTS'];
  function throttle(key, max, secs) {
    var c = CacheService.getScriptCache(), k = 'thr:' + key, n = parseInt(c.get(k) || '0', 10);
    if (n >= max) throw new AppError('RATE', 'Too many requests. Please wait a while and try again.');
    c.put(k, String(n + 1), secs);
  }
  function activationMail(u, code, pending) {
    var firm = Settings.get('firm_name', APP.NAME), url = firmLink(), exp = Util.addDays(Util.today(), 3);
    var body = 'Dear ' + u.full_name + ',\n\nThank you for registering with ' + firm + '.\n\nYour activation key: ' + code + '\n(valid until ' + exp + ' and usable once)\n\n' +
      'Your data and this firm\'s records are kept in the firm\'s own Google account.\n\nTo activate your account:\n1. Open this firm link: ' + (url || 'the address given by your administrator') + '\n2. Choose "First time? Activate your account"\n3. Enter this email address, the key above, and choose a password (at least 10 characters with upper case, lower case and a digit).\n\n' +
      (pending ? 'Your registration will be reviewed by the firm administrator. You will be able to sign in after it is approved.\n\n' : '') +
      'If you did not register, please ignore this email.\n\nRegards,\n' + firm;
    return Mailer.send(u.email, 'Your activation key - ' + firm, body);
  }
  function register(p) {
    if (Settings.get('open_registration', 'Y') !== 'Y') throw new AppError('FORBIDDEN', 'Registration is closed. Please contact the firm administrator.');
    var generic = { registered: true, message: 'If this email can be registered, an activation key has been sent to it. Please check your inbox and spam folder.' };
    if (p.website) return generic; // honeypot field filled in by bots
    var name = Util.clean(p.full_name, 120), email = V.email(p.email), mobile = Util.clean(p.mobile, 15), org = Util.clean(p.organisation, 120);
    V.req(name.length >= 2, 'Please enter your full name.');
    if (mobile) V.req(V.MOBILE.test(mobile), 'Mobile number must be a 10-digit Indian mobile number.');
    V.req(p.consent === true || p.consent === 'Y', 'Please accept the terms and privacy policy to register.');
    throttle('reg:all', 40, 3600); throttle('reg:' + Util.sha256Hex(email), 3, 3600);
    var pending = Settings.get('registration_approval', 'Y') === 'Y', ex = Auth.userByEmail(email), by = { user_id: 'self-registration', role: '' };
    if (ex) {
      var c = DB.get('Credentials', ex.user_id);
      if (ex.is_active === 'N' || (c && c.hash)) { Audit.log(by, 'REGISTER_EXISTING', 'Auth', 'Users', ex.user_id, '', '', '', 'IGNORED'); return generic; }
      var code0 = Auth.issueActivation(ex.user_id, 'system'); activationMail(ex, code0, ex.employment_status === 'Pending Approval');
      Audit.log(by, 'REGISTER_RESEND', 'Auth', 'Users', ex.user_id, '', '', '', 'OK'); return generic;
    }
    var role = REG_ROLES.indexOf(Settings.get('registration_default_role', 'CLERK')) > -1 ? Settings.get('registration_default_role', 'CLERK') : 'CLERK';
    var u = DB.insert('Users', { full_name: name, email: email, role: role, contact_number: mobile, department: org, employment_status: pending ? 'Pending Approval' : 'Active', client_access: 'ASSIGNED', joining_date: Util.today() }, 'system');
    syncProfile(u, {}, { user_id: 'system' });
    var code = Auth.issueActivation(u.user_id, 'system');
    try { activationMail(u, code, pending); } catch (e) { Audit.log(by, 'REGISTER', 'Auth', 'Users', u.user_id, '', { email: email }, 'activation email failed: ' + String(e && e.message).slice(0, 120), 'FAILED'); throw new AppError('MAIL', 'We could not send the activation email right now. Please try again later or contact the administrator.'); }
    Audit.log(by, 'REGISTER', 'Auth', 'Users', u.user_id, '', { email: email, role: role, pending: pending }, '', 'OK');
    var admins = DB.where('Users', function (x) { return x.role === 'ADMIN' && x.is_active !== 'N'; }).map(function (x) { return x.user_id; });
    if (admins.length) Notify.send(admins, 'REGISTRATION', 'New registration: ' + name, email + (org ? ' (' + org + ')' : '') + (pending ? ' is waiting for your approval.' : ' has registered.'), 'Users', u.user_id);
    return generic;
  }
  function resendCode(p) {
    var email = V.email(p.email), generic = { registered: true, message: 'If this email has a registration that is not yet activated, a new activation key has been sent to it.' };
    throttle('rs:all', 40, 3600); throttle('rs:' + Util.sha256Hex(email), 3, 3600);
    var u = Auth.userByEmail(email), c = u && DB.get('Credentials', u.user_id);
    if (!u || u.is_active === 'N' || (c && c.hash)) return generic;
    var code = Auth.issueActivation(u.user_id, 'system'); activationMail(u, code, u.employment_status === 'Pending Approval');
    Audit.log({ user_id: 'self-registration', role: '' }, 'REGISTER_RESEND', 'Auth', 'Users', u.user_id, '', '', '', 'OK'); return generic;
  }
  function approveUser(user, d) {
    Perm.require(user, 'user.manage'); var u = DB.get('Users', d.user_id); V.req(u, 'User not found.'); V.req(u.employment_status === 'Pending Approval', 'This user is not waiting for approval.');
    var patch = { employment_status: 'Active' };
    if (d.role) { V.oneOf(d.role, Object.keys(ROLES), 'Role'); patch.role = d.role; }
    var upd = DB.update('Users', u.user_id, patch, user.user_id); syncProfile(upd, {}, user);
    Audit.log(user, 'USER_APPROVE', 'Users', 'Users', u.user_id, 'Pending Approval', 'Active' + (patch.role && patch.role !== u.role ? ' / ' + patch.role : ''), '', 'OK');
    try { Mailer.send(u.email, 'Your account has been approved - ' + Settings.get('firm_name', APP.NAME), 'Dear ' + u.full_name + ',\n\nYour registration has been approved. You can now sign in' + (Settings.get('app_url', '') ? ' at ' + Settings.get('app_url', '') : '') + ' with your email and password.\n\nRegards,\n' + Settings.get('firm_name', APP.NAME)); } catch (e) {}
    return { user: upd };
  }
  function saveSettings(user, map) {
    Perm.require(user, 'settings.manage'); var known = Util.indexBy(DB.all('Settings'), 'key'), changed = {};
    Object.keys(map || {}).forEach(function (k) {
      V.req(known[k] && k.indexOf('seq_') !== 0, 'Unknown setting ' + k); V.req(k !== 'registry_id' && k !== 'registry_key', 'The Techmin registration cannot be edited here.'); var v = Util.clean(map[k], 500);
      if (NUMERIC.indexOf(k) > -1) V.num(v, k, 0, 100000);
      if (k === 'work_days') V.req(/^[0-6](,[0-6])*$/.test(v), 'Working days must be digits 0-6 separated by commas.');
      if (k === 'open_registration' || k === 'registration_approval') V.oneOf(v, ['Y', 'N'], k.replace(/_/g, ' '));
      if (k === 'registration_default_role') V.oneOf(v, ['CLERK', 'SENIOR', 'ACCOUNTS'], 'Default role for self-registered users');
      if (k === 'mail_from' && v) V.email(v, 'Send-as address');
      if (k === 'firm_pan' && v) V.req(V.PAN.test(v.toUpperCase()), 'PAN is not in the correct format (for example ABCDE1234F).');
      if (k === 'firm_gstin' && v) V.req(V.GSTIN.test(v.toUpperCase()), 'GSTIN is not in the correct format.');
      if (k === 'firm_pincode' && v) V.req(/^[1-9][0-9]{5}$/.test(v), 'Pincode must be 6 digits.');
      if (k === 'firm_phone' && v) V.req(V.MOBILE.test(v), 'Mobile number must be a 10-digit Indian mobile number.');
      if (k === 'firm_email' && v) V.email(v, 'Firm email');
      if (k === 'app_url' && v) V.req(/^https:\/\/[^\s]+$/.test(v), 'Web address must start with https://');
      if (k === 'holidays' && v) v.split(',').forEach(function (x) { V.date(x.trim(), 'Holiday'); });
      if (k === 'ageing_buckets') V.req(/^\d+(,\d+)*$/.test(v), 'Ageing buckets must be numbers separated by commas.');
      if (k === 'ageing_basis') V.oneOf(v, ['INVOICE_DATE', 'DUE_DATE'], 'Ageing basis'); if (k === 'email_default_approval') V.oneOf(v, ['NONE', 'SENIOR', 'PARTNER'], 'Email approval');
      if (known[k].value !== v) { changed[k] = [known[k].value, v]; DB.update('Settings', k, { value: v }, user.user_id); }
    });
    if (Object.keys(changed).length) Audit.log(user, 'SETTINGS', 'Settings', 'Settings', '', Object.keys(changed).reduce(function (o, k) { o[k] = changed[k][0]; return o; }, {}), Object.keys(changed).reduce(function (o, k) { o[k] = changed[k][1]; return o; }, {}), '', 'OK');
    return { changed: Object.keys(changed) };
  }

  /* ---------- generic masters ---------- */
  var MASTERS = {
    ServiceCategories: { read: null, write: 'settings.manage' }, TaskTemplates: { read: 'task.view', write: 'task.manage_recurring' }, RecurringTaskRules: { read: 'task.view', write: 'task.manage_recurring', clientField: 'client_id' },
    ChecklistTemplates: { read: null, write: 'settings.manage' }, EmailTemplates: { read: 'email.draft', write: 'settings.manage' }, IntegrationRegister: { read: 'settings.manage', write: 'settings.manage' },
    ComplianceCalendar: { read: 'compliance.view', write: 'compliance.manage' }, InternalAnnouncements: { read: null, write: 'announce.post' }, ClientContacts: { read: 'client.view', write: 'client.edit', clientField: 'client_id' }, ClientServices: { read: 'client.view', write: 'client.edit', clientField: 'client_id' }
  };
  function cfg(table) { var c = MASTERS[table]; V.req(c, 'Unknown master table.'); return c; }
  function masterList(user, table) {
    var c = cfg(table); if (c.read) Perm.require(user, c.read); var sc = c.clientField ? Perm.clientScope(user) : null;
    return DB.all(table).filter(function (r) { return !c.clientField || sc === null || sc[r[c.clientField]]; });
  }
  function masterSave(user, table, d) {
    var c = cfg(table); Perm.require(user, c.write); var def = DB.def(table), o = {};
    def.cols.forEach(function (k) { if (d[k] !== undefined) o[k] = def.num[k] ? V.num(d[k] || 0, k) : Util.clean(d[k], k === 'body' || k === 'instructions' || k === 'description' || k === 'items' || k === 'setup_instructions' ? 8000 : 500); });
    if (c.clientField && o[c.clientField]) Perm.assertClient(user, o[c.clientField]);
    ['start_date', 'end_date'].forEach(function (k) { if (o[k]) V.date(o[k], k); });
    var r = d[def.pk] ? DB.update(table, d[def.pk], o, user.user_id) : DB.insert(table, (def.noPkGen ? (function () { o[def.pk] = Util.clean(d[def.pk] || o[def.pk], 60); return o; })() : o), user.user_id);
    Audit.log(user, d[def.pk] ? 'UPDATE' : 'CREATE', 'Masters', table, r[def.pk], '', o, '', 'OK'); return r;
  }
  function masterRemove(user, table, id) { var c = cfg(table); Perm.require(user, c.write); var r = DB.get(table, id); V.req(r, 'Record not found.'); if (c.clientField) Perm.assertClient(user, r[c.clientField]); DB.deactivate(table, id, user.user_id); Audit.log(user, 'DEACTIVATE', 'Masters', table, id, '', '', '', 'OK'); return true; }
  function auditList(user, p) {
    Perm.require(user, 'audit.view'); p = p || {}; var users = Util.indexBy(DB.all('Users', true), 'user_id');
    var rows = DB.all('AuditLogs').filter(function (a) { return (!p.user_id || a.user_id === p.user_id) && (!p.module || a.module === p.module) && (!p.action || a.action === p.action) && (!p.from || a.ts.slice(0, 10) >= p.from) && (!p.to || a.ts.slice(0, 10) <= p.to); })
      .sort(function (a, b) { return a.ts < b.ts ? 1 : -1; }); var total = rows.length;
    rows = rows.slice(0, Math.min(1000, p.limit || 300)).map(function (a) { a.user_name = (users[a.user_id] || {}).full_name || a.user_id; return a; });
    return { rows: rows, total: total, note: 'This log is stored in a Google Sheet and is not tamper-proof. Restrict edit access to the spreadsheet.' };
  }
  return { directory: directory, listUsers: listUsers, saveUser: saveUser, deactivate: deactivate, reactivate: reactivate, resetAccess: resetAccess, permMatrix: permMatrix, setRolePerms: setRolePerms, setUserPerm: setUserPerm, setClientAccess: setClientAccess,
    getClientAccess: getClientAccess, getSettings: getSettings, saveSettings: saveSettings, registryGet: registryGet, registrySave: registrySave, publicSettings: publicSettings, register: register, resendCode: resendCode, approveUser: approveUser, masterList: masterList, masterSave: masterSave, masterRemove: masterRemove, auditList: auditList, MASTERS: MASTERS };
})();


// ======== Reports.gs ========
/** Reports.gs - 25 management reports and role dashboards. All figures come from live records; all reports are scoped to the caller's authorised clients and staff. */
var Reports = (function () {
  function C(key, label, type) { return { key: key, label: label, type: type || 'text' }; }
  function rng(f) { var to = f && f.to || Util.today(), from = f && f.from || Util.addDays(to, -29); V.date(from, 'From'); V.date(to, 'To'); V.req(to >= from, 'To date cannot be before from date.'); V.req(Util.diffDays(from, to) <= 400, 'Date range is too long (max 400 days).'); return { from: from, to: to }; }
  function staff(user, f) {
    var vis = Perm.visibleUserIds(user);
    return DB.all('Users').filter(function (u) { return ['ADMIN'].indexOf(u.role) < 0 && (vis === null || vis[u.user_id]) && (!f || !f.user_id || u.user_id === f.user_id); });
  }
  function scopedTasks(user, f) { return DB.all('Tasks').filter(function (t) { return Perm.canSeeTask(user, t) && (!f || ((!f.client_id || t.client_id === f.client_id) && (!f.partner_id || t.partner_id === f.partner_id) && (!f.service_id || t.service_id === f.service_id))); }); }
  function names() { return { u: Util.indexBy(DB.all('Users', true), 'user_id'), c: Util.indexBy(DB.all('Clients', true), 'client_id'), s: Util.indexBy(DB.all('ServiceCategories', true), 'service_id') }; }
  function assigneeIds(tid) { return Perm.participants(tid); }
  function hoursByTask() { var m = {}; DB.all('TimeLogs').forEach(function (l) { if (l.task_id && l.state === 'STOPPED') m[l.task_id] = (m[l.task_id] || 0) + l.minutes; }); return m; }
  function periodRows(user, f, from, to) {
    return staff(user, f).map(function (u) { var p = Time.productivity(u.user_id, from, to); return { staff: u.full_name, role: ROLES[u.role], assigned: p.tasks_assigned_in_period, completed: p.tasks_completed, open: p.open_tasks, overdue: p.overdue_tasks, corrections: p.corrections, task_hours: p.task_hours, accounted_hours: p.accounted_hours, unallocated_hours: p.unallocated_hours }; });
  }
  var PERIOD_COLS = [C('staff', 'Staff'), C('role', 'Role'), C('assigned', 'Assigned', 'num'), C('completed', 'Completed', 'num'), C('open', 'Open', 'num'), C('overdue', 'Overdue', 'num'), C('corrections', 'Corrections', 'num'), C('task_hours', 'Task hours', 'num'), C('accounted_hours', 'Accounted hours', 'num'), C('unallocated_hours', 'Unallocated hours', 'num')];
  function needFees(user) { Perm.require(user, 'fees.view'); return Perm.clientScope(user); }

  var R = {};
  R.daily = { title: 'Daily work status', perm: 'report.team', run: function (user, f) { var d = (f && f.to) || Util.today(); V.date(d, 'Date'); return { columns: PERIOD_COLS, rows: periodRows(user, f, d, d), notes: ['Date: ' + d, Time.METHOD] }; } };
  R.weekly = { title: 'Weekly work status', perm: 'report.team', run: function (user, f) { var to = (f && f.to) || Util.today(), from = Util.addDays(to, -((Util.dow(to) + 6) % 7)); return { columns: PERIOD_COLS, rows: periodRows(user, f, from, to), notes: ['Week: ' + from + ' to ' + to, Time.METHOD] }; } };
  R.monthly = { title: 'Monthly work status', perm: 'report.team', run: function (user, f) { var to = (f && f.to) || Util.today(), from = to.slice(0, 8) + '01'; return { columns: PERIOD_COLS, rows: periodRows(user, f, from, to), notes: ['Month: ' + from + ' to ' + to, Time.METHOD] }; } };
  R.employee_tasks = { title: 'Employee-wise task report', perm: 'report.team', run: function (user, f) {
    var tasks = scopedTasks(user, f), rows = staff(user, f).map(function (u) { var mine = tasks.filter(function (t) { return assigneeIds(t.task_id).indexOf(u.user_id) > -1; }); var o = { staff: u.full_name, total: mine.length };
      TASK_STATUSES.forEach(function (s) { o['s_' + s.replace(/\W/g, '_')] = mine.filter(function (t) { return t.status === s; }).length; }); o.overdue = mine.filter(function (t) { return OPEN_STATUSES.indexOf(t.status) > -1 && t.status !== 'Draft' && t.due_date < Util.today(); }).length; return o; });
    return { columns: [C('staff', 'Staff'), C('total', 'Total', 'num')].concat(TASK_STATUSES.map(function (s) { return C('s_' + s.replace(/\W/g, '_'), s, 'num'); }), [C('overdue', 'Overdue', 'num')]), rows: rows }; } };
  R.partner_tasks = { title: 'Partner-wise task report', perm: 'report.team', run: function (user, f) {
    var n = names(), g = Util.groupBy(scopedTasks(user, f), function (t) { return t.partner_id || '-'; });
    return { columns: [C('partner', 'Partner'), C('total', 'Total', 'num'), C('open', 'Open', 'num'), C('completed', 'Completed', 'num'), C('overdue', 'Overdue', 'num'), C('awaiting', 'Awaiting review', 'num')], rows: Object.keys(g).map(function (k) { var a = g[k]; return { partner: (n.u[k] || {}).full_name || 'Unassigned', total: a.length,
      open: a.filter(function (t) { return OPEN_STATUSES.indexOf(t.status) > -1; }).length, completed: a.filter(function (t) { return t.status === 'Completed'; }).length, overdue: a.filter(function (t) { return OPEN_STATUSES.indexOf(t.status) > -1 && t.status !== 'Draft' && t.due_date < Util.today(); }).length, awaiting: a.filter(function (t) { return ['Submitted for Review', 'Under Review', 'Resubmitted'].indexOf(t.status) > -1; }).length }; }) }; } };
  R.client_work = { title: 'Client-wise work report', perm: 'report.team', run: function (user, f) {
    var n = names(), h = hoursByTask(), g = Util.groupBy(scopedTasks(user, f), function (t) { return t.client_id; });
    return { columns: [C('client', 'Client'), C('total', 'Tasks', 'num'), C('open', 'Open', 'num'), C('completed', 'Completed', 'num'), C('overdue', 'Overdue', 'num'), C('est', 'Estimated hrs', 'num'), C('actual', 'Logged hrs', 'num')], rows: Object.keys(g).map(function (k) { var a = g[k]; return { client: (n.c[k] || {}).name, total: a.length,
      open: a.filter(function (t) { return OPEN_STATUSES.indexOf(t.status) > -1; }).length, completed: a.filter(function (t) { return t.status === 'Completed'; }).length, overdue: a.filter(function (t) { return OPEN_STATUSES.indexOf(t.status) > -1 && t.status !== 'Draft' && t.due_date < Util.today(); }).length, est: Util.r2(Util.sum(a, function (t) { return t.est_hours; })), actual: Util.r2(Util.sum(a, function (t) { return (h[t.task_id] || 0) / 60; })) }; }) }; } };
  R.service_workload = { title: 'Service-wise workload report', perm: 'report.team', run: function (user, f) {
    var n = names(), h = hoursByTask(), g = Util.groupBy(scopedTasks(user, f), function (t) { return t.service_id || '-'; });
    return { columns: [C('service', 'Service'), C('total', 'Tasks', 'num'), C('open', 'Open', 'num'), C('completed', 'Completed', 'num'), C('est', 'Estimated hrs', 'num'), C('actual', 'Logged hrs', 'num')], rows: Object.keys(g).map(function (k) { var a = g[k]; return { service: (n.s[k] || {}).name || 'Unclassified', total: a.length,
      open: a.filter(function (t) { return OPEN_STATUSES.indexOf(t.status) > -1; }).length, completed: a.filter(function (t) { return t.status === 'Completed'; }).length, est: Util.r2(Util.sum(a, function (t) { return t.est_hours; })), actual: Util.r2(Util.sum(a, function (t) { return (h[t.task_id] || 0) / 60; })) }; }) }; } };
  function taskListRows(user, f, pred) {
    var n = names(); return scopedTasks(user, f).filter(pred).map(function (t) { return { task_no: t.task_no, title: t.title, client: (n.c[t.client_id] || {}).name, assignees: assigneeIds(t.task_id).map(function (x) { return (n.u[x] || {}).full_name; }).join(', '), partner: (n.u[t.partner_id] || {}).full_name || '', priority: t.priority, status: t.status, due_date: t.due_date,
      days_overdue: t.due_date < Util.today() ? Util.diffDays(t.due_date, Util.today()) : 0 }; }).sort(function (a, b) { return a.due_date < b.due_date ? -1 : 1; });
  }
  var TCOLS = [C('task_no', 'Task'), C('title', 'Title'), C('client', 'Client'), C('assignees', 'Assigned to'), C('partner', 'Partner'), C('priority', 'Priority'), C('status', 'Status'), C('due_date', 'Due', 'date'), C('days_overdue', 'Days overdue', 'num')];
  R.pending = { title: 'Pending work report', perm: 'report.team', run: function (user, f) { return { columns: TCOLS, rows: taskListRows(user, f, function (t) { return OPEN_STATUSES.indexOf(t.status) > -1 && t.status !== 'Draft'; }) }; } };
  R.overdue = { title: 'Overdue assignments', perm: 'report.team', run: function (user, f) { return { columns: TCOLS, rows: taskListRows(user, f, function (t) { return OPEN_STATUSES.indexOf(t.status) > -1 && t.status !== 'Draft' && t.due_date < Util.today(); }) }; } };
  R.review_corrections = { title: 'Review and correction report', perm: 'report.team', run: function (user, f) {
    var r = rng(f), n = names(), tmap = Util.indexBy(scopedTasks(user, f), 'task_id');
    var rows = DB.all('TaskReviews').filter(function (v) { return tmap[v.task_id] && v.reviewed_at.slice(0, 10) >= r.from && v.reviewed_at.slice(0, 10) <= r.to; }).map(function (v) { var t = tmap[v.task_id]; return { task_no: t.task_no, title: t.title, client: (n.c[t.client_id] || {}).name, submission: v.submission_no, stage: v.stage, reviewer: (n.u[v.reviewer_id] || {}).full_name, outcome: v.outcome, remarks: v.remarks, when: v.reviewed_at.replace('T', ' ') }; });
    return { columns: [C('task_no', 'Task'), C('title', 'Title'), C('client', 'Client'), C('submission', 'Submission #', 'num'), C('stage', 'Stage'), C('reviewer', 'Reviewer'), C('outcome', 'Outcome'), C('remarks', 'Remarks'), C('when', 'When')], rows: rows, notes: ['Period ' + r.from + ' to ' + r.to] }; } };
  R.productivity = { title: 'Productivity and time report', perm: 'report.team', run: function (user, f) {
    var r = rng(f); return { columns: [C('staff', 'Staff'), C('sched', 'Scheduled hrs', 'num'), C('task', 'Task hrs', 'num'), C('other', 'Other activity hrs', 'num'), C('util', 'Task utilisation %', 'num'), C('completed', 'Completed', 'num'), C('ontime', 'On-time %', 'num'), C('turn', 'Avg turnaround days', 'num'), C('corr', 'Correction rate %', 'num'), C('est', 'Est. hrs (completed)', 'num'), C('act', 'Actual hrs (completed)', 'num')],
      rows: staff(user, f).map(function (u) { var p = Time.productivity(u.user_id, r.from, r.to); return { staff: u.full_name, sched: p.net_scheduled_hours, task: p.task_hours, other: Util.r2(p.accounted_hours - p.task_hours), util: p.utilisation_pct, completed: p.tasks_completed, ontime: p.on_time_rate_pct === null ? '' : p.on_time_rate_pct, turn: p.avg_turnaround_days, corr: p.correction_rate_pct, est: p.estimated_vs_actual.estimated_hours, act: p.estimated_vs_actual.actual_hours }; }),
      notes: ['Task count alone is not a measure of performance: complex assignments (e.g. audits) differ from simple ones. Read these indicators together with estimated vs actual hours.', Time.METHOD] }; } };
  R.unallocated = { title: 'Unallocated time report', perm: 'report.team', run: function (user, f) {
    var r = rng(f); return { columns: [C('staff', 'Staff'), C('days', 'Working days', 'num'), C('leave', 'Leave days', 'num'), C('sched', 'Net scheduled hrs', 'num'), C('task', 'Task hrs', 'num'), C('other', 'Other recorded hrs', 'num'), C('brk', 'Break hrs', 'num'), C('un', 'Unallocated hrs', 'num'), C('over', 'Over-recorded hrs', 'num')],
      rows: staff(user, f).map(function (u) { var p = Time.productivity(u.user_id, r.from, r.to), b = p.by_category_hours; return { staff: u.full_name, days: p.working_days, leave: p.leave_days, sched: p.net_scheduled_hours, task: p.task_hours, other: Util.r2(p.accounted_hours - p.task_hours - b.BREAK), brk: b.BREAK, un: p.unallocated_hours, over: p.over_recorded_hours }; }), notes: [Time.METHOD] }; } };
  R.attendance_leave = { title: 'Attendance and leave report', perm: 'report.team', run: function (user, f) {
    var r = rng(f); return { columns: [C('staff', 'Staff'), C('present', 'Days present', 'num'), C('hours', 'Attendance hrs', 'num'), C('leave', 'Approved leave days', 'num'), C('pending', 'Pending leave requests', 'num')],
      rows: staff(user, f).map(function (u) { var att = DB.where('Attendance', function (a) { return a.user_id === u.user_id && a.att_date >= r.from && a.att_date <= r.to; }), lv = DB.where('LeaveRequests', function (l) { return l.user_id === u.user_id && l.to_date >= r.from && l.from_date <= r.to; });
        return { staff: u.full_name, present: att.length, hours: Util.r2(Util.sum(att, function (a) { return a.hours; })), leave: Util.sum(lv.filter(function (l) { return l.status === 'Approved'; }), function (l) { return l.days; }), pending: lv.filter(function (l) { return l.status === 'Pending'; }).length }; }), notes: ['Attendance hours are not the same as productive hours.'] }; } };
  R.fee_outstanding = { title: 'Outstanding fee report', perm: 'fees.view', run: function (user, f) {
    var sc = needFees(user), n = names(), b = Fees.balances(); var rows = Object.keys(b).map(function (k) { return b[k]; }).filter(function (x) { return x.outstanding > 0 && (sc === null || sc[x.client_id]) && (!f || ((!f.client_id || x.client_id === f.client_id) && (!f.partner_id || x.partner_id === f.partner_id))); })
      .map(function (x) { return { client: (n.c[x.client_id] || {}).name, partner: (n.u[x.partner_id] || {}).full_name || '', invoice_no: x.invoice_no, invoice_date: x.invoice_date, due_date: x.due_date, total: x.total, paid: x.paid, credits: x.credits, outstanding: x.outstanding, age_days: x.age_days, overdue_days: x.overdue_days }; }).sort(function (a, c) { return c.outstanding - a.outstanding; });
    return { columns: [C('client', 'Client'), C('partner', 'Partner'), C('invoice_no', 'Invoice'), C('invoice_date', 'Date', 'date'), C('due_date', 'Due', 'date'), C('total', 'Total', 'money'), C('paid', 'Received', 'money'), C('credits', 'Credits', 'money'), C('outstanding', 'Outstanding', 'money'), C('age_days', 'Age (days)', 'num'), C('overdue_days', 'Overdue (days)', 'num')], rows: rows, summary: { outstanding: Util.r2(Util.sum(rows, function (x) { return x.outstanding; })) } }; } };
  R.fee_ageing = { title: 'Fee ageing report', perm: 'fees.view', run: function (user, f) {
    var sc = needFees(user), n = names(), b = Fees.balances(), labels = Fees.bucketLabels(), g = {};
    Object.keys(b).forEach(function (k) { var x = b[k]; if (x.outstanding <= 0 || (sc !== null && !sc[x.client_id]) || (f && f.client_id && x.client_id !== f.client_id) || (f && f.partner_id && x.partner_id !== f.partner_id)) return; var r = g[x.client_id] = g[x.client_id] || { client: (n.c[x.client_id] || {}).name, total: 0 }; r[x.bucket] = Util.r2((r[x.bucket] || 0) + x.outstanding); r.total = Util.r2(r.total + x.outstanding); });
    var rows = Object.keys(g).map(function (k) { return g[k]; }).sort(function (a, c) { return c.total - a.total; }), tot = { client: 'TOTAL', total: 0 }; rows.forEach(function (r) { labels.forEach(function (l) { tot[l] = Util.r2((tot[l] || 0) + (r[l] || 0)); }); tot.total = Util.r2(tot.total + r.total); });
    return { columns: [C('client', 'Client')].concat(labels.map(function (l) { return C(l, l + ' days', 'money'); }), [C('total', 'Total', 'money')]), rows: rows.concat(rows.length ? [tot] : []), notes: ['Ageing basis: ' + Settings.get('ageing_basis', 'INVOICE_DATE') + '. Buckets are configurable in Settings.'] }; } };
  R.collection_followup = { title: 'Collection follow-up report', perm: 'fees.view', run: function (user, f) {
    var fu = Fees.listFollowUps(user, {}).rows; return { columns: [C('client_name', 'Client'), C('followup_date', 'Last follow-up', 'date'), C('method', 'Method'), C('contact_person', 'Contact'), C('outstanding', 'Outstanding', 'money'), C('promised_date', 'Promised on', 'date'), C('next_followup_date', 'Next follow-up', 'date'), C('assigned_name', 'Assigned to'), C('status', 'Status'), C('overdue', 'Follow-up overdue'), C('promise_broken', 'Promise missed'), C('summary', 'Summary')],
      rows: fu.map(function (x) { return { client_name: x.client_name, followup_date: x.followup_date, method: x.method, contact_person: x.contact_person, outstanding: x.outstanding, promised_date: x.promised_date, next_followup_date: x.next_followup_date, assigned_name: x.assigned_name, status: x.status, overdue: x.overdue ? 'Yes' : '', promise_broken: x.promise_broken ? 'Yes' : '', summary: x.summary }; }) }; } };
  R.monthly_billing = { title: 'Monthly billing report', perm: 'fees.view', run: function (user, f) {
    var sc = needFees(user), r = rng(f), g = {}; DB.all('Invoices').forEach(function (i) { if (i.status !== 'ISSUED' || i.invoice_type !== 'TAX' || (sc !== null && !sc[i.client_id]) || i.invoice_date < r.from || i.invoice_date > r.to) return; var m = i.invoice_date.slice(0, 7), x = g[m] = g[m] || { month: m, invoices: 0, taxable: 0, tax: 0, total: 0 }; x.invoices++; x.taxable = Util.r2(x.taxable + i.taxable_value); x.tax = Util.r2(x.tax + i.tax_amount); x.total = Util.r2(x.total + i.total); });
    return { columns: [C('month', 'Month'), C('invoices', 'Invoices', 'num'), C('taxable', 'Taxable value', 'money'), C('tax', 'Tax', 'money'), C('total', 'Total billed', 'money')], rows: Object.keys(g).sort().map(function (k) { return g[k]; }), notes: ['Issued tax invoices only; cancelled invoices and proforma invoices are excluded.'] }; } };
  R.monthly_collection = { title: 'Monthly fee collection report', perm: 'fees.view', run: function (user, f) {
    var sc = needFees(user), r = rng(f), g = {}; DB.all('Receipts').forEach(function (x) { if (x.status !== 'ACTIVE' || (sc !== null && !sc[x.client_id]) || x.receipt_date < r.from || x.receipt_date > r.to) return; var m = x.receipt_date.slice(0, 7), k = g[m] = g[m] || { month: m, receipts: 0, amount: 0, unallocated: 0 }; k.receipts++; k.amount = Util.r2(k.amount + x.amount); k.unallocated = Util.r2(k.unallocated + Fees.receiptUnallocated(x.receipt_id)); });
    return { columns: [C('month', 'Month'), C('receipts', 'Receipts', 'num'), C('amount', 'Collected', 'money'), C('unallocated', 'Unallocated (advances)', 'money')], rows: Object.keys(g).sort().map(function (k) { return g[k]; }) }; } };
  R.unbilled = { title: 'Unbilled work report', perm: 'fees.view', run: function (user, f) {
    needFees(user); var n = names(), h = hoursByTask(), sc = Perm.clientScope(user), rows = DB.all('Tasks').filter(function (t) { return (sc === null || sc[t.client_id]) && (!f || ((!f.client_id || t.client_id === f.client_id) && (!f.partner_id || t.partner_id === f.partner_id))); }).filter(function (t) { return t.status === 'Completed' && !t.invoice_id && t.in_retainer !== 'Y'; }).map(function (t) { var cs = DB.findOne('ClientServices', function (x) { return x.client_id === t.client_id && x.service_id === t.service_id; }); return { task_no: t.task_no, title: t.title, client: (n.c[t.client_id] || {}).name, completed: t.completed_date, service_fee: cs ? cs.fee : '', logged_hours: Util.r2((h[t.task_id] || 0) / 60), out_of_scope: t.out_of_scope === 'Y' ? 'Yes' : '', days_since_completion: Util.diffDays(t.completed_date, Util.today()) }; });
    return { columns: [C('task_no', 'Task'), C('title', 'Title'), C('client', 'Client'), C('completed', 'Completed', 'date'), C('service_fee', 'Agreed service fee', 'money'), C('logged_hours', 'Logged hrs', 'num'), C('out_of_scope', 'Outside scope'), C('days_since_completion', 'Days since completion', 'num')], rows: rows, notes: ['Completed tasks with no linked tax invoice and not marked as included in a retainer.'] }; } };
  R.file_movement = { title: 'Physical file movement report', perm: 'files.view', run: function (user, f) {
    var r = rng(f), sc = Perm.clientScope(user), files = Util.indexBy(DB.all('PhysicalFiles'), 'file_id'), n = names();
    return { columns: [C('file_ref', 'File'), C('client', 'Client'), C('description', 'Description'), C('seq', '#', 'num'), C('from', 'From'), C('to', 'To'), C('purpose', 'Purpose'), C('dispatch', 'Dispatch', 'date'), C('status', 'Status after'), C('ack', 'Acknowledged'), C('returned', 'Returned', 'date')], rows: DB.all('FileMovements').filter(function (m) { var fl = files[m.file_id]; return fl && (sc === null || sc[fl.client_id]) && m.dispatch_date >= r.from && m.dispatch_date <= r.to; })
      .map(function (m) { var fl = files[m.file_id]; return { file_ref: fl.file_ref_no, client: (n.c[fl.client_id] || {}).name, description: fl.description, seq: m.seq, from: m.from_name, to: m.to_name, purpose: m.purpose, dispatch: m.dispatch_date, status: m.status_after, ack: m.ack_at ? m.ack_at.slice(0, 10) : (m.to_user_id ? 'Pending' : ''), returned: m.return_date }; }) }; } };
  R.files_transit = { title: 'Files in transit report', perm: 'files.view', run: function (user, f) {
    var rows = Files.list(user, { in_transit: true }).rows.concat(Files.list(user, { status: 'Assigned to Employee' }).rows, Files.list(user, { status: 'Sent to Partner' }).rows);
    return { columns: [C('file_ref_no', 'File'), C('client_name', 'Client'), C('description', 'Description'), C('status', 'Status'), C('current_custodian_name', 'With'), C('current_location', 'Location'), C('dispatch_date', 'Dispatched', 'date'), C('expected_return_date', 'Expected return', 'date'), C('overdue', 'Overdue'), C('pending_ack', 'Awaiting acknowledgement')], rows: rows.map(function (x) { return { file_ref_no: x.file_ref_no, client_name: x.client_name, description: x.description, status: x.status, current_custodian_name: x.current_custodian_name, current_location: x.current_location, dispatch_date: x.dispatch_date, expected_return_date: x.expected_return_date, overdue: x.overdue ? 'Yes' : '', pending_ack: x.pending_ack ? 'Yes' : '' }; }) }; } };
  R.missing_docs = { title: 'Missing document report', perm: 'docs.view', run: function (user, f) {
    var reqs = Docs.listRequests(user, { open: true }), rows = []; reqs.forEach(function (r) { r.items.forEach(function (i) { if (i.required === 'Y' && ['Requested', 'Incomplete'].indexOf(i.status) > -1) rows.push({ client: r.client_name, request: r.title, document: i.name, status: i.status, requested: i.requested_date, due: r.due_date, days_pending: Util.diffDays(i.requested_date, Util.today()) }); }); });
    return { columns: [C('client', 'Client'), C('request', 'Request'), C('document', 'Document'), C('status', 'Status'), C('requested', 'Requested', 'date'), C('due', 'Due', 'date'), C('days_pending', 'Days pending', 'num')], rows: rows.sort(function (a, b) { return b.days_pending - a.days_pending; }) }; } };
  R.compliance = { title: 'Compliance deadline report', perm: 'compliance.view', run: function (user, f) {
    var r = f && (f.from || f.to) ? rng(f) : { from: Util.addDays(Util.today(), -30), to: Util.addDays(Util.today(), 45) };
    var rows = Compliance.listRecords(user, { from: r.from, to: r.to }).rows.map(function (x) { return { client: x.client_name, compliance: x.calendar_name, category: x.category, period: x.period_label, due: x.due_date, days_to_due: x.days_to_due, status: x.status, responsible: x.responsible_name, ack_no: x.ack_no, verified: x.verified ? 'Verified' : 'UNVERIFIED', overdue: x.overdue ? 'Yes' : '' }; });
    return { columns: [C('client', 'Client'), C('compliance', 'Compliance'), C('category', 'Category'), C('period', 'Period'), C('due', 'Due', 'date'), C('days_to_due', 'Days to due', 'num'), C('status', 'Status'), C('responsible', 'Responsible'), C('ack_no', 'Ack / ref no.'), C('verified', 'Due date check'), C('overdue', 'Overdue')], rows: rows, notes: ['Due dates are maintained by the administrator. Entries marked UNVERIFIED have not been confirmed against an authoritative source.'] }; } };
  R.audit = { title: 'User activity audit report', perm: 'audit.view', run: function (user, f) {
    var r = rng(f), a = Admin.auditList(user, { from: r.from, to: r.to, user_id: f && f.user_id, module: f && f.module, limit: 1000 });
    return { columns: [C('ts', 'Time'), C('user_name', 'User'), C('user_role', 'Role'), C('action', 'Action'), C('module', 'Module'), C('record_type', 'Record type'), C('record_id', 'Record'), C('previous_value', 'Previous'), C('new_value', 'New'), C('reason', 'Reason'), C('status', 'Status')], rows: a.rows, notes: [a.note, 'Showing ' + a.rows.length + ' of ' + a.total + ' entries.'] }; } };
  R.costing = { title: 'Task costing and workload report', perm: 'report.team', run: function (user, f) {
    var n = names(), h = hoursByTask(), inv = Util.indexBy(DB.all('Invoices'), 'invoice_id'), rows = scopedTasks(user, f).filter(function (t) { return t.status !== 'Draft' && t.status !== 'Cancelled'; }).map(function (t) { var actual = Util.r2((h[t.task_id] || 0) / 60), iv = inv[t.invoice_id]; return { task_no: t.task_no, title: t.title, client: (n.c[t.client_id] || {}).name, est: t.est_hours, actual: actual, variance: Util.r2(actual - t.est_hours), over_pct: t.est_hours ? Math.round((actual - t.est_hours) / t.est_hours * 100) : '', billing: iv ? (iv.status === 'ISSUED' ? 'Billed ' + iv.invoice_no : iv.status) : (t.in_retainer === 'Y' ? 'In retainer' : 'Unbilled'), out_of_scope: t.out_of_scope === 'Y' ? 'Yes' : '', fee: iv ? iv.taxable_value : '', fee_per_hour: iv && actual ? Util.r2(iv.taxable_value / actual) : '' }; });
    return { columns: [C('task_no', 'Task'), C('title', 'Title'), C('client', 'Client'), C('est', 'Estimated hrs', 'num'), C('actual', 'Actual hrs', 'num'), C('variance', 'Variance hrs', 'num'), C('over_pct', 'Over estimate %', 'num'), C('billing', 'Billing'), C('out_of_scope', 'Outside scope'), C('fee', 'Billed value', 'money'), C('fee_per_hour', 'Indicative fee / hr', 'money')], rows: rows.sort(function (a, b) { return b.variance - a.variance; }),
      notes: ['INDICATIVE time-based analysis only. It is not a profit calculation: staff cost, overheads and non-billable time are not included unless configured.'] }; } };
  var ORDER = ['daily', 'weekly', 'monthly', 'employee_tasks', 'partner_tasks', 'client_work', 'service_workload', 'pending', 'overdue', 'review_corrections', 'productivity', 'unallocated', 'attendance_leave', 'fee_outstanding', 'fee_ageing', 'collection_followup', 'monthly_billing', 'monthly_collection', 'unbilled', 'file_movement', 'files_transit', 'missing_docs', 'compliance', 'audit', 'costing'];
  function catalog(user) { return ORDER.filter(function (k) { return Perm.has(user, R[k].perm); }).map(function (k) { return { id: k, title: R[k].title }; }); }
  function run(user, id, f) {
    var r = R[id]; V.req(r, 'Unknown report.'); Perm.require(user, r.perm); var out = r.run(user, f || {}); out.id = id; out.title = r.title; out.generated = Util.now(); out.generated_by = user.full_name; out.filters = f || {}; return out;
  }
  function exportCsv(user, id, f) { var rep = run(user, id, f); Audit.log(user, 'EXPORT', 'Reports', 'Report', id, '', 'rows=' + rep.rows.length, '', 'OK'); return { filename: id + '_' + Util.today() + '.csv', csv: Util.toCsv(rep.columns.map(function (c) { return c.key; }), rep.rows).replace(/^[^\r\n]*/, rep.columns.map(function (c) { return Util.csvCell(c.label); }).join(',')) }; }

  /* ---------- dashboards ---------- */
  function dashboard(user) {
    var t0 = Util.today(), month = t0.slice(0, 7), cards = [], tables = {}, n = names();
    function card(key, label, value, hint, link) { cards.push({ key: key, label: label, value: value, hint: hint || '', link: link || '' }); }
    var tasks = Perm.has(user, 'task.view') ? DB.all('Tasks').filter(function (t) { return Perm.canSeeTask(user, t); }) : [], mine = DB.all('TaskAssignments').filter(function (a) { return a.user_id === user.user_id && !a.released_at; }).map(function (a) { return a.task_id; });
    var open = tasks.filter(function (t) { return OPEN_STATUSES.indexOf(t.status) > -1 && t.status !== 'Draft'; });
    if (Perm.has(user, 'leave.approve')) card('leave_wait', 'Leave waiting for my approval', DB.where('LeaveRequests', function (l) { return l.status === 'Pending' && l.user_id !== user.user_id && Perm.canSeeUser(user, l.user_id); }).length, 'Open Time & leave to approve or reject', 'time/leave');
    if (user.role === 'CLERK' || (Perm.has(user, 'task.work') && !Perm.has(user, 'task.assign'))) {
      var my = tasks.filter(function (t) { return mine.indexOf(t.task_id) > -1; }), myOpen = my.filter(function (t) { return OPEN_STATUSES.indexOf(t.status) > -1 && t.status !== 'Draft'; });
      card('my_open', 'My open tasks', myOpen.length, '', 'tasks'); card('today', 'Due today', myOpen.filter(function (t) { return t.due_date === t0; }).length); card('soon', 'Due in next 3 days', myOpen.filter(function (t) { return t.due_date > t0 && t.due_date <= Util.addDays(t0, 3); }).length);
      card('overdue', 'Overdue', myOpen.filter(function (t) { return t.due_date < t0; }).length, '', 'tasks'); card('ack', 'Awaiting my acknowledgement', my.filter(function (t) { return t.status === 'Assigned'; }).length); card('docs', 'Waiting for client documents', my.filter(function (t) { return t.status === 'Waiting for Client Documents'; }).length);
      card('review', 'Submitted for review', my.filter(function (t) { return ['Submitted for Review', 'Under Review', 'Resubmitted'].indexOf(t.status) > -1; }).length); card('corr', 'Corrections requested', my.filter(function (t) { return t.status === 'Correction Required'; }).length);
      card('done', 'Completed this month', my.filter(function (t) { return t.status === 'Completed' && (t.completed_date || '').slice(0, 7) === month; }).length);
      var wk = Util.addDays(t0, -((Util.dow(t0) + 6) % 7)), pd = Time.productivity(user.user_id, t0, t0), pw = Time.productivity(user.user_id, wk, t0), pm = Time.productivity(user.user_id, t0.slice(0, 8) + '01', t0);
      card('today_hrs', 'Hours logged today', pd.accounted_hours); tables.summary = [{ period: 'Today', task_hours: pd.task_hours, accounted: pd.accounted_hours, unallocated: pd.unallocated_hours }, { period: 'This week', task_hours: pw.task_hours, accounted: pw.accounted_hours, unallocated: pw.unallocated_hours }, { period: 'This month', task_hours: pm.task_hours, accounted: pm.accounted_hours, unallocated: pm.unallocated_hours }];
      tables.priorities = myOpen.sort(function (a, b) { return a.due_date < b.due_date ? -1 : 1; }).slice(0, 8).map(function (t) { return { task_id: t.task_id, title: t.title, client: (n.c[t.client_id] || {}).name, due: t.due_date, status: t.status, priority: t.priority }; });
      tables.new_instructions = DB.where('Notifications', function (x) { return x.user_id === user.user_id && x.type === 'INSTRUCTION' && x.is_read !== 'Y'; }).slice(0, 5);
    } else if (tasks.length || Perm.has(user, 'task.view')) {
      card('clients', 'Active clients', DB.all('Clients').filter(function (c) { return c.status === 'Active' && Perm.canSeeClient(user, c.client_id); }).length, '', 'clients');
      if (Perm.has(user, 'user.manage') || Perm.isTop(user)) card('users', 'Active users', DB.all('Users').length);
      card('open', 'Open assignments', open.length, '', 'tasks'); card('today', 'Tasks due today', open.filter(function (t) { return t.due_date === t0; }).length); card('overdue', 'Overdue tasks', open.filter(function (t) { return t.due_date < t0; }).length, '', 'tasks');
      var aw = tasks.filter(function (t) { return ['Submitted for Review', 'Under Review', 'Resubmitted'].indexOf(t.status) > -1; }); card('review', 'Awaiting review / approval', aw.length, '', 'tasks');
      card('done', 'Completed this month', tasks.filter(function (t) { return t.status === 'Completed' && (t.completed_date || '').slice(0, 7) === month; }).length);
      card('docs', 'Blocked by client documents', tasks.filter(function (t) { return t.status === 'Waiting for Client Documents'; }).length);
      if (Perm.has(user, 'task.approve')) card('my_approvals', 'Awaiting my approval', aw.filter(function (t) { return Tasks.canReview(user, t, true); }).length);
      tables.workload = staff(user, {}).filter(function (u) { return ['CLERK', 'SENIOR'].indexOf(u.role) > -1; }).map(function (u) { var w = Tasks.workload(u.user_id); return { staff: u.full_name, open: w.open_tasks, est_hours: w.est_hours_remaining, due_7d: w.due_within_7_days, awaiting_review: w.awaiting_review, utilisation_pct: w.utilisation_pct, overloaded: w.overloaded ? 'Yes' : '' }; });
      tables.overdue_list = open.filter(function (t) { return t.due_date < t0; }).sort(function (a, b) { return a.due_date < b.due_date ? -1 : 1; }).slice(0, 8).map(function (t) { return { task_id: t.task_id, title: t.title, client: (n.c[t.client_id] || {}).name, due: t.due_date, status: t.status }; });
    }
    if (Perm.has(user, 'fees.view')) { var sc = Perm.clientScope(user), b = Fees.balances(), out = 0, collected = 0; Object.keys(b).forEach(function (k) { if (sc === null || sc[b[k].client_id]) out += Util.paise(b[k].outstanding); });
      DB.all('Receipts').forEach(function (r) { if (r.status === 'ACTIVE' && r.receipt_date.slice(0, 7) === month && (sc === null || sc[r.client_id])) collected += Util.paise(r.amount); });
      card('outstanding', 'Outstanding fees (Rs.)', Util.fromPaise(out), 'Issued tax invoices', 'fees'); card('collected', 'Fees collected this month (Rs.)', Util.fromPaise(collected)); card('followups', 'Follow-ups due', Fees.listFollowUps(user, { due: true }).total, '', 'fees');
      tables.promises_missed = Fees.listFollowUps(user, { status: 'Promised' }).rows.filter(function (x) { return x.promise_broken; }).slice(0, 8).map(function (x) { return { client: x.client_name, promised_on: x.promised_date, amount: x.promised_amount || x.outstanding }; }); }
    if (Perm.has(user, 'files.view')) { var fl = Files.list(user, {}).rows; card('transit', 'Files in transit', fl.filter(function (x) { return FILE_OUT_STATUSES.indexOf(x.status) > -1; }).length, '', 'files'); card('file_exc', 'File exceptions / overdue', fl.filter(function (x) { return x.overdue || x.status === 'Lost or Exception Reported'; }).length, '', 'files'); }
    if (Perm.has(user, 'compliance.view')) { var cr = Compliance.listRecords(user, { from: t0, to: Util.addDays(t0, 14) }).rows.filter(function (r) { return ['Filed', 'Not Applicable'].indexOf(r.status) < 0; }); card('compliance', 'Compliance due in 14 days', cr.length, '', 'compliance'); tables.upcoming = cr.slice(0, 8).map(function (r) { return { client: r.client_name, compliance: r.calendar_name, due: r.due_date, status: r.status, check: r.verified ? '' : 'UNVERIFIED' }; }); }
    if (Perm.has(user, 'docs.view')) card('missing_docs', 'Missing client documents', Docs.listRequests(user, { open: true }).reduce(function (a, r) { return a + r.missing; }, 0), '', 'documents');
    var pa = Fileacks(user); if (pa) card('acks', 'Files awaiting my acknowledgement', pa);
    return { cards: cards, tables: tables, role: ROLES[user.role], demo: Settings.get('demo_mode', 'N') === 'Y', generated: Util.now() };
  }
  function Fileacks(user) { try { return Files.myPendingAcks(user).length; } catch (e) { return 0; } }
  return { catalog: catalog, run: run, exportCsv: exportCsv, dashboard: dashboard, ORDER: ORDER };
})();


// ======== Backup.gs ========
/**
 * Backup.gs - database backup, CSV exports, document inventory, configuration export.
 * DATABASE backup (spreadsheet copy) is separate from DOCUMENT backup (Drive files are NOT copied by a database backup)
 * and from SOURCE-CODE backup (copy the Apps Script project / use clasp) - see docs/BACKUP_RESTORE.md.
 */
var Backup = (function () {
  var EXPORT_TABLES = ['Clients', 'Tasks', 'TaskAssignments', 'TimeLogs', 'Invoices', 'InvoiceItems', 'Receipts', 'ReceiptAllocations', 'Adjustments', 'FeeFollowUps', 'PhysicalFiles', 'FileMovements', 'Documents', 'ComplianceRecords', 'Attendance', 'LeaveRequests', 'AuditLogs'];

  function backupFolder() { var id = Settings.get('backup_folder_id'); V.req(id, 'Backup folder is not configured. Run setupApplication() or set backup_folder_id in Settings.'); return DriveApp.getFolderById(id); }
  function log(user, kind, status, target, detail, started) { return DB.insert('BackupLogs', { started_at: started, finished_at: Util.now(), kind: kind, status: status, target: target || '', detail: String(detail || '').slice(0, 800), run_by: user ? user.user_id : 'system' }, user ? user.user_id : 'system'); }

  function backupDatabase(user) {
    if (user) Perm.require(user, 'backup.manage'); var started = Util.now();
    try {
      DB.flushWrites();
      var id = PropertiesService.getScriptProperties().getProperty('DB_ID'), name = 'CA-OMS Database Backup ' + started.replace('T', ' ').replace(/:/g, '').slice(0, 15), copy = DriveApp.getFileById(id).makeCopy(name, backupFolder());
      var keep = Settings.num('backup_retention', 10), olds = DB.where('BackupLogs', function (b) { return b.kind === 'DATABASE' && b.status === 'OK' && b.target; }).sort(function (a, b) { return a.started_at < b.started_at ? 1 : -1; });
      var removed = 0; olds.slice(keep - 1).forEach(function (b) { try { DriveApp.getFileById(b.target).setTrashed(true); removed++; DB.update('BackupLogs', b.backup_id, { status: 'EXPIRED' }, 'system'); } catch (e) {} });
      log(user, 'DATABASE', 'OK', copy.getId(), 'Copy: ' + name + '; expired ' + removed, started); if (user) Audit.log(user, 'BACKUP', 'Backup', 'BackupLogs', copy.getId(), '', name, '', 'OK');
      return { file_id: copy.getId(), name: name, expired: removed };
    } catch (e) { log(user, 'DATABASE', 'FAILED', '', String(e && e.message || e), started); throw new AppError('BACKUP', 'Backup failed: ' + String(e && e.message || e).slice(0, 150)); }
  }
  function exportCsvAll(user) {
    Perm.require(user, 'backup.manage'); var started = Util.now(), folder = DriveApp.getFolderById(Settings.get('root_folder_id')).getFoldersByName('System Exports').next(), made = [];
    EXPORT_TABLES.forEach(function (t) { var def = DB.def(t), cols = [def.pk].concat(def.cols, AUDIT_COLS), rows = DB.all(t, true), f = folder.createFile(t + '_' + Util.today() + '.csv', Util.toCsv(cols, rows), 'text/csv'); made.push(f.getName()); });
    log(user, 'CSV_EXPORT', 'OK', '', made.length + ' files', started); Audit.log(user, 'EXPORT', 'Backup', 'Tables', '', '', made.length + ' CSV files', '', 'OK'); return { files: made };
  }
  function documentInventory(user) {
    Perm.require(user, 'backup.manage'); var started = Util.now(), rows = [];
    (function walk(folder, path) { var fi = folder.getFiles(); while (fi.hasNext()) { var f = fi.next(); rows.push({ path: path, name: f.getName(), id: f.getId(), size: f.getSize(), modified: Utilities.formatDate(f.getLastUpdated(), APP.TZ, 'yyyy-MM-dd HH:mm') }); } var sub = folder.getFolders(); while (sub.hasNext()) { var s = sub.next(); walk(s, path + '/' + s.getName()); } })(DriveApp.getFolderById(Settings.get('root_folder_id')), '');
    var out = DriveApp.getFolderById(Settings.get('root_folder_id')).getFoldersByName('System Exports').next().createFile('document_inventory_' + Util.today() + '.csv', Util.toCsv(['path', 'name', 'id', 'size', 'modified'], rows), 'text/csv');
    log(user, 'DOC_INVENTORY', 'OK', out.getId(), rows.length + ' files', started); return { count: rows.length, file_id: out.getId() };
  }
  function exportConfig(user) {
    Perm.require(user, 'backup.manage'); var started = Util.now(), cfg = {};
    ['Settings', 'Roles', 'RolePermissions', 'UserPermissions', 'ServiceCategories', 'TaskTemplates', 'RecurringTaskRules', 'ChecklistTemplates', 'EmailTemplates', 'ComplianceCalendar', 'IntegrationRegister'].forEach(function (t) { cfg[t] = DB.all(t, true); });
    cfg.settings_note = 'Configuration only. Credentials, hashes and client data are not included.'; var f = DriveApp.getFolderById(Settings.get('root_folder_id')).getFoldersByName('System Exports').next().createFile('config_export_' + Util.today() + '.json', JSON.stringify(cfg, null, 1), 'application/json');
    log(user, 'CONFIG_EXPORT', 'OK', f.getId(), '', started); return { file_id: f.getId() };
  }
  /** Restoration test: compares a backup copy with the live database (row counts per tab). */
  function verifyBackup(user, backupFileId) {
    Perm.require(user, 'backup.manage'); V.req(backupFileId, 'Backup file id is required.'); var started = Util.now(), copy = (function () { try { return SpreadsheetApp.openById(backupFileId); } catch (e) { throw new AppError('NOT_FOUND', 'The backup file could not be opened. Check the file id and that the backup still exists in Drive.'); } })(), diffs = [], ok = true;
    SHEET_ORDER.forEach(function (t) { var s = copy.getSheetByName(t); if (!s) { diffs.push({ tab: t, backup: 'MISSING', live: DB.count(t) }); ok = false; return; } var b = Math.max(0, s.getLastRow() - 1), live = DB.all(t, true).length; if (b !== live) diffs.push({ tab: t, backup: b, live: live }); });
    log(user, 'VERIFY', ok && !diffs.length ? 'OK' : 'DIFFERENCES', backupFileId, diffs.length + ' tab differences', started); return { structure_ok: ok, differences: diffs, note: 'Differences are expected if data changed after the backup was taken.' };
  }
  function list(user) { Perm.require(user, 'backup.manage'); return { logs: DB.all('BackupLogs').sort(function (a, b) { return a.started_at < b.started_at ? 1 : -1; }).slice(0, 100), retention: Settings.get('backup_retention'), triggers: Jobs.listTriggers() }; }
  return { backupDatabase: backupDatabase, exportCsvAll: exportCsvAll, documentInventory: documentInventory, exportConfig: exportConfig, verifyBackup: verifyBackup, list: list, EXPORT_TABLES: EXPORT_TABLES };
})();


// ======== Jobs.gs ========
/** Jobs.gs - scheduled work (time-driven triggers): recurring task generation, reminders, escalations. Triggers are installed idempotently. */
var Jobs = (function () {
  var HANDLERS = ['dailyJob', 'weeklyBackupJob'];

  function installTriggers() {
    removeTriggers(); // never leave duplicates
    ScriptApp.newTrigger('dailyJob').timeBased().everyDays(1).atHour(7).create();
    ScriptApp.newTrigger('weeklyBackupJob').timeBased().onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(2).create();
    return listTriggers();
  }
  function removeTriggers() { var n = 0; ScriptApp.getProjectTriggers().forEach(function (t) { if (HANDLERS.indexOf(t.getHandlerFunction()) > -1) { ScriptApp.deleteTrigger(t); n++; } }); return n; }
  function listTriggers() { return ScriptApp.getProjectTriggers().map(function (t) { return { handler: t.getHandlerFunction(), type: String(t.getEventType()), id: t.getUniqueId() }; }); }

  /** Runs inside a lock; every reminder carries a dedupe key so a re-run never duplicates notifications. */
  function run(asOf) {
    var today = asOf || Util.today(), res = { recurring: null, reminders: 0, autoStopped: 0 };
    DB.tx(function () {
      res.recurring = Tasks.generateRecurring(null, today);
      var remind = Settings.num('deadline_reminder_days', 3), esc = Settings.num('review_escalation_days', 2), n = 0, users = DB.all('Users');
      var admins = users.filter(function (u) { return u.role === 'ADMIN' || u.role === 'MANAGING_PARTNER'; }).map(function (u) { return u.user_id; });
      DB.all('Tasks').forEach(function (t) {
        if (OPEN_STATUSES.indexOf(t.status) < 0 || t.status === 'Draft') return;
        var parts = Perm.participants(t.task_id), days = Util.diffDays(today, t.due_date);
        if (days >= 0 && days <= remind && ['On Hold'].indexOf(t.status) < 0) n += Notify.send(parts, 'DEADLINE', 'Due ' + (days === 0 ? 'today' : 'in ' + days + ' day(s)') + ': ' + t.title, 'Due ' + t.due_date, 'Task', t.task_id, 'due|' + t.task_id + '|' + today);
        if (days < 0) n += Notify.send(parts.concat([t.partner_id, t.senior_id]), 'OVERDUE', 'Overdue by ' + (-days) + ' day(s): ' + t.title, 'Due ' + t.due_date, 'Task', t.task_id, 'od|' + t.task_id + '|' + today);
        if (['Submitted for Review', 'Under Review', 'Resubmitted'].indexOf(t.status) > -1) {
          var last = DB.where('TaskHistory', function (h) { return h.task_id === t.task_id && (h.event === 'SUBMITTED' || h.event === 'RESUBMITTED'); }).pop();
          if (last && Util.diffDays(last.at.slice(0, 10), today) >= esc) n += Notify.send([t.partner_id].concat(admins), 'REVIEW_ESCALATION', 'Review pending for ' + Util.diffDays(last.at.slice(0, 10), today) + ' days: ' + t.title, '', 'Task', t.task_id, 'esc|' + t.task_id + '|' + today);
        }
      });
      DB.all('FeeFollowUps').forEach(function (f) {
        if (['Open', 'Promised'].indexOf(f.status) < 0) return;
        if (f.next_followup_date && f.next_followup_date <= today) n += Notify.send([f.assigned_to], 'FOLLOWUP_DUE', 'Fee follow-up due', 'Client follow-up scheduled for ' + f.next_followup_date, 'FollowUp', f.followup_id, 'fu|' + f.followup_id + '|' + today);
        if (f.status === 'Promised' && f.promised_date && f.promised_date < today) n += Notify.send([f.assigned_to, f.partner_id], 'PROMISE_MISSED', 'Promised payment not received', 'Promised on ' + f.promised_date, 'FollowUp', f.followup_id, 'pm|' + f.followup_id + '|' + today);
      });
      DB.all('PhysicalFiles').forEach(function (f) { if (Files.isOverdue(f)) n += Notify.send([f.current_custodian_id].concat(admins), 'FILE_OVERDUE', 'File not returned: ' + f.file_ref_no, 'Expected back ' + f.expected_return_date, 'File', f.file_id, 'fo|' + f.file_id + '|' + today); });
      DB.all('ComplianceRecords').forEach(function (r) {
        if (['Filed', 'Not Applicable'].indexOf(r.status) > -1) return; var cal = DB.get('ComplianceCalendar', r.calendar_id); if (!cal) return; var d = Util.diffDays(today, Compliance.effectiveDue(cal));
        if (d <= remind * 2) n += Notify.send([r.responsible_user], 'COMPLIANCE', (d < 0 ? 'Compliance overdue: ' : 'Compliance due soon: ') + cal.name, 'Due ' + Compliance.effectiveDue(cal), 'Compliance', r.record_id, 'cp|' + r.record_id + '|' + today);
      });
      DB.all('DocumentRequests').forEach(function (r) { if (['Open', 'Partially Received'].indexOf(r.status) > -1 && r.due_date && r.due_date < today) n += Notify.send([r.requested_by], 'DOCS_MISSING', 'Client documents overdue: ' + r.title, 'Requested ' + r.requested_date, 'DocRequest', r.request_id, 'dr|' + r.request_id + '|' + today); });
      DB.where('TimeLogs', function (l) { return l.state === 'RUNNING' && l.log_date < today; }).forEach(function (l) {
        DB.update('TimeLogs', l.log_id, { end_ts: l.log_date + 'T23:59:00', minutes: Util.minutesBetween(l.start_ts, l.log_date + 'T23:59:00'), state: 'STOPPED', corrected: 'Y', description: (l.description + ' [auto-stopped at 23:59: timer was left running]').trim() }, 'system');
        Notify.send([l.user_id], 'TIMER', 'A timer was left running and was stopped at 23:59', 'Please review the time log and request a correction if needed.', 'TimeLog', l.log_id); res.autoStopped++;
      });
      res.reminders = n; Audit.log({ user_id: 'system', role: 'SYSTEM' }, 'DAILY_JOB', 'Jobs', '', '', '', { recurring_created: res.recurring.created.length, reminders: n }, '', 'OK');
    });
    return res;
  }
  return { installTriggers: installTriggers, removeTriggers: removeTriggers, listTriggers: listTriggers, run: run };
})();
function dailyJob() { return Jobs.run(); }
function weeklyBackupJob() { try { DB.reset(); return DB.tx(function () { return Backup.backupDatabase(null); }); } catch (e) { console.error('Weekly backup failed: ' + e); } }


// ======== Setup.gs ========
/**
 * Setup.gs - one-time installation, first administrator, trigger installation, demo data and maintenance helpers.
 * Run these from the Apps Script editor (they are not callable from the web app).
 */

/** STEP 1: run once. Creates the database spreadsheet, tabs, defaults, Drive folders and the first administrator. */
function setupApplication() {
  var props = PropertiesService.getScriptProperties();
  if (props.getProperty('DB_ID')) { Logger.log('Already set up (DB_ID exists). To add missing tabs run migrateSchema().'); return migrateSchema(); }
  var ss = SpreadsheetApp.create('CA Office Work Management - Database');
  props.setProperty('DB_ID', ss.getId()); DB.reset(); DB.setSpreadsheet(ss);
  DB.ensureSchema(ss);
  var adminEmail = (props.getProperty('ADMIN_EMAIL') || Session.getEffectiveUser().getEmail() || '').toLowerCase(), adminName = props.getProperty('ADMIN_NAME') || 'Firm Administrator';
  if (!adminEmail) throw new Error('Set Script property ADMIN_EMAIL (Project Settings > Script properties) and run again.');
  var out = {};
  DB.tx(function () {
    seedDefaults_();
    try { Docs.ensureRoot('CA Office Management'); } catch (e) { Logger.log('Drive folders were not created: ' + e); }
    var admin = DB.insert('Users', { full_name: adminName, email: adminEmail, role: 'ADMIN', employment_status: 'Active', client_access: 'ALL', joining_date: Util.today() }, 'system');
    out.code = Auth.issueActivation(admin.user_id, 'system'); out.email = adminEmail;
    Audit.log({ user_id: 'system', role: 'SYSTEM' }, 'SETUP', 'Setup', 'Users', admin.user_id, '', 'first administrator created', '', 'OK');
  });
  var mailed = false;
  try { var fl = webAppUrl_();
    Mailer.send(adminEmail, 'Your CA Office Manager administrator activation key', 'Dear ' + adminName + ',\n\nYour CA Office Manager workspace has been set up in your own Google account. All data stays in your Google Drive.\n\nYour one-time activation key: ' + out.code + '\n(valid for 3 days, usable once)\n\n1. Open this firm link: ' + (Settings.get('app_url') + (fl ? '?ws=' + encodeURIComponent(fl) : '')) + (fl ? '' : '\n   (This email was sent while setup ran from the script editor, so it cannot show your workspace address. Open the page above, and in the box paste your workspace address: in the script editor choose Deploy > Manage deployments and copy the Web app URL ending /exec. Setup guide, Step 8.)') + '\n2. Choose "First time? Activate your account", enter this email address, the key above and a new password.\n\nShare the same firm link with your staff so they can register.\n'); mailed = true;
  } catch (e1) { Logger.log('The activation key could not be emailed: ' + e1); }
  Logger.log('SETUP COMPLETE.' + (mailed ? ' The administrator key was also emailed to ' + adminEmail + '.' : '')+ '\n\nDatabase: ' + ss.getUrl() + '\nFirst administrator: ' + out.email + '\nOne-time activation code: ' + out.code + '\nOpen the web app, choose "Activate account", enter the email and this code, then set your password. The code expires in 3 days.');
  return { database: ss.getUrl(), admin: out.email, activation_code: out.code };
}
/** Adds any new tabs/columns after an upgrade (never deletes data). */
function migrateSchema() {
  DB.reset(); var created = DB.ensureSchema(); var added = [];
  SHEET_ORDER.forEach(function (n) { // append missing header columns at the end only if the sheet has fewer columns than the schema
    var s = DB.spreadsheet().getSheetByName(n), h = DB.headers(n), cur = s.getLastColumn();
    if (cur < h.length) { s.getRange(1, cur + 1, 1, h.length - cur).setValues([h.slice(cur)]); added.push(n); }
  });
  DB.tx(function () { Settings.set('schema_version', String(APP.SCHEMA_VERSION), 'system'); seedDefaults_(true); });
  Logger.log('Schema checked. New tabs: ' + created.join(', ') + '. Tabs with new columns: ' + added.join(', ')); return { created: created, extended: added };
}
function seedDefaults_(onlyMissing) {
  DEFAULT_SETTINGS.forEach(function (r) { if (!DB.get('Settings', r[0])) DB.insert('Settings', { key: r[0], value: r[1], description: r[2] }, 'system'); });
  Object.keys(ROLES).forEach(function (k) { if (!DB.get('Roles', k)) DB.insert('Roles', { role: k, label: ROLES[k], description: '' }, 'system'); });
  ALL_PERMS.forEach(function (p) { if (!DB.get('Permissions', p)) DB.insert('Permissions', { perm: p, description: PERMS[p] }, 'system'); });
  DEFAULT_SERVICES.forEach(function (r) { if (!DB.findOne('ServiceCategories', function (x) { return x.code === r[0]; })) DB.insert('ServiceCategories', { code: r[0], name: r[1], category: r[2], description: r[3], default_est_hours: r[4] }, 'system'); });
  var svc = {}; DB.all('ServiceCategories').forEach(function (s) { svc[s.code] = s.service_id; });
  DEFAULT_CHECKLISTS.forEach(function (r) { if (!DB.findOne('ChecklistTemplates', function (x) { return x.name === r[0]; })) DB.insert('ChecklistTemplates', { name: r[0], service_id: svc[r[1]] || '', items: r[2] }, 'system'); });
  DEFAULT_EMAIL_TEMPLATES.forEach(function (r) { if (!DB.get('EmailTemplates', r[0])) DB.insert('EmailTemplates', { code: r[0], name: r[1], subject: r[2], body: r[3], approval_level: r[4] }, 'system'); });
  DEFAULT_INTEGRATIONS.forEach(function (r) { if (!DB.get('IntegrationRegister', r[0])) DB.insert('IntegrationRegister', { integration: r[0], provider: r[1], purpose: r[2], status: r[3], auth_requirements: r[4], expected_cost: r[5], data_permissions: r[6], security_implications: r[7], rate_limits: r[8], setup_instructions: r[9], fallback_process: r[10] }, 'system'); });
  var tpls = [['GST return (monthly)', 'GST-RET', 'GST return - {{client}} - {{period}}', 3, 'Y', 'Reconcile sales and purchases|Prepare return|Reconcile with books|File and save acknowledgement', 20], ['TDS return (quarterly)', 'TDS-RET', 'TDS return - {{client}} - {{period}}', 4, 'N', 'Collect deductee data|Prepare statement|File and save acknowledgement', 31],
    ['Payroll (monthly)', 'PAYROLL', 'Payroll - {{client}} - {{period}}', 5, 'N', 'Collect attendance|Process payroll|Prepare payslips|Prepare PF / ESI data', 7]];
  tpls.forEach(function (t) { if (!DB.findOne('TaskTemplates', function (x) { return x.name === t[0]; })) DB.insert('TaskTemplates', { name: t[0], service_id: svc[t[1]] || '', title_pattern: t[2], est_hours: t[3], priority: 'Medium', requires_senior_review: 'Y', requires_partner_approval: t[4], checklist: t[5], default_due_offset_days: t[6] }, 'system'); });
}

/** Installs the daily and weekly triggers (idempotent - removes previous copies first). */
function installTriggers() { var r = Jobs.installTriggers(); Logger.log(JSON.stringify(r)); return r; }
function removeTriggers() { var n = Jobs.removeTriggers(); Logger.log('Removed ' + n + ' trigger(s)'); return n; }
function showTriggers() { var r = Jobs.listTriggers(); Logger.log(JSON.stringify(r)); return r; }

/** Emergency: issue a fresh activation code for the administrator whose email is in Script property ADMIN_EMAIL. */
function resetAdminAccess() {
  var email = PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL'); if (!email) throw new Error('Set Script property ADMIN_EMAIL first.');
  DB.reset(); var code; DB.tx(function () { var u = Auth.userByEmail(email); if (!u || u.role !== 'ADMIN') throw new Error('No administrator with that email.'); code = Auth.issueActivation(u.user_id, 'system'); Audit.log({ user_id: 'system', role: 'SYSTEM' }, 'ADMIN_RESET', 'Setup', 'Users', u.user_id, '', '', 'run from editor', 'OK'); });
  Logger.log('New one-time activation code for ' + email + ': ' + code); return code;
}
/** Restore: point the app at a backup copy of the database (run from the editor, then verify). */
function restoreFromBackup(backupFileId) {
  if (!backupFileId) throw new Error('Call restoreFromBackup("<backup spreadsheet file id>") - see docs/BACKUP_RESTORE.md');
  var ss = SpreadsheetApp.openById(backupFileId), missing = SHEET_ORDER.filter(function (n) { return !ss.getSheetByName(n); });
  if (missing.length) throw new Error('Backup is missing tabs: ' + missing.join(', '));
  var props = PropertiesService.getScriptProperties(); props.setProperty('DB_ID_PREVIOUS', props.getProperty('DB_ID') || ''); props.setProperty('DB_ID', backupFileId); DB.reset();
  Logger.log('Database switched to backup ' + backupFileId + '. Previous database id saved as DB_ID_PREVIOUS. Run showHealth() to verify.'); return true;
}
function showHealth() { DB.reset(); var out = { app: APP.VERSION, schema: Settings.get('schema_version'), users: DB.count('Users'), clients: DB.count('Clients'), tasks: DB.count('Tasks'), triggers: Jobs.listTriggers().length }; Logger.log(JSON.stringify(out)); return out; }


// ======== Demo.gs ========
/**
 * Demo.gs - fictional test-data generator. NEVER load real client data in demo mode.
 * Run seedDemoData() from the editor on a TEST copy only; it prints a random demo password to the execution log.
 * purgeDemoData() removes demo records (rows created by the generator) and switches demo mode off.
 */
function seedDemoData() { var pw = 'Demo' + Util.randHex(6) + '#9'; var r = Demo.seed({ password: pw }); Logger.log('Demo data loaded. Demo users share the password: ' + pw + '\nLogin emails: ' + r.emails.join(', ') + '\nDelete demo data before real use: run purgeDemoData().'); return r; }
function purgeDemoData() { DB.reset(); return DB.tx(function () { return Demo.purge(); }); }

var Demo = (function () {
  var TAG = 'DEMO';
  function U(email) { return DB.findOne('Users', function (u) { return u.email === email; }); }
  function sys() { return { user_id: 'SYSTEM', role: 'ADMIN', full_name: 'Demo seeder', client_access: 'ALL', email: '' }; }

  function seed(opt) {
    opt = opt || {}; var pw = opt.password || 'DemoPass#2026x', out = { emails: [] }; DB.reset(); Perm.reset();
    DB.tx(function () {
      var s = sys(), mk = function (name, email, role, extra) {
        var u = U(email); if (u) return u; extra = extra || {};
        u = DB.insert('Users', { full_name: name, email: email, role: role, employment_status: 'Active', client_access: 'ASSIGNED', department: extra.dept || '', partner_id: extra.partner_id || '', reporting_manager_id: extra.mgr || '', employee_code: TAG + '-' + Util.randHex(4), joining_date: '2025-04-01' }, 'demo');
        Admin_sync(u, role); var code = Auth.issueActivation(u.user_id, 'demo'); Auth.activate(email, code, pw); out.emails.push(email); return u;
      };
      if (!DB.get('Settings', 'firm_name')) seedDefaults_();
      Settings.set('firm_name', 'Demo CA Firm (fictional)', 'demo'); Settings.set('firm_state', 'Kerala', 'demo'); Settings.set('firm_gstin', '32ABCDE1234F1Z5', 'demo'); Settings.set('demo_mode', 'Y', 'demo');
      var admin = mk('Demo Administrator', 'admin@demo-ca.test', 'ADMIN'), mp = mk('Meera Nair', 'mp@demo-ca.test', 'MANAGING_PARTNER'), p1 = mk('Arun Menon', 'p1@demo-ca.test', 'PARTNER'), p2 = mk('Divya Iyer', 'p2@demo-ca.test', 'PARTNER');
      var sr = mk('Kavita Rao', 'senior@demo-ca.test', 'SENIOR', { partner_id: p1.user_id }), c1 = mk('Rahul Das', 'clerk1@demo-ca.test', 'CLERK', { partner_id: p1.user_id, mgr: sr.user_id }), c2 = mk('Sneha Pillai', 'clerk2@demo-ca.test', 'CLERK', { partner_id: p2.user_id, mgr: p2.user_id }), ac = mk('Joseph Thomas', 'accounts@demo-ca.test', 'ACCOUNTS');
      var svc = {}; DB.all('ServiceCategories').forEach(function (x) { svc[x.code] = x.service_id; });
      var cl = function (name, et, partner, senior, clerk, pan, gst, state, email) { return Clients.save(P(partner), { name: name, entity_type: et, pan: pan, gstin: gst, state: state, contact_person: 'Accounts Manager', email: email, partner_id: partner.user_id, senior_id: senior ? senior.user_id : '', clerk_id: clerk ? clerk.user_id : '', agreed_fee: 12000, billing_frequency: 'Monthly' }); };
      function P(u) { return u.role === 'ADMIN' ? u : { user_id: u.user_id, role: 'ADMIN', full_name: u.full_name, client_access: 'ALL', email: u.email }; }
      var A = cl('Alpha Traders', 'Proprietorship', p1, sr, c1, 'AAAPA1111A', '32AAAPA1111A1Z5', 'Kerala', 'alpha@example.invalid'), B = cl('Bright Textiles Pvt Ltd', 'Private Limited', p1, sr, c1, 'AABCB2222B', '32AABCB2222B1Z3', 'Kerala', 'bright@example.invalid');
      var Cc = cl('Coastal Foods LLP', 'LLP', p2, null, c2, 'AAFFC3333C', '33AAFFC3333C1Z1', 'Tamil Nadu', 'coastal@example.invalid'), D = cl('Delta Infra Pvt Ltd', 'Private Limited', p2, null, c2, 'AACCD4444D', '32AACCD4444D1Z9', 'Kerala', 'delta@example.invalid');
      [A, B, Cc, D].forEach(function (c) { Clients.saveService(P(admin), { client_id: c.client_id, service_id: svc['GST-RET'], fy: Util.fyOf(Util.today()), fee: 3000, frequency: 'MONTHLY' }); });
      Clients.saveService(P(admin), { client_id: A.client_id, service_id: svc['TDS-RET'], fy: Util.fyOf(Util.today()), fee: 2000, frequency: 'QUARTERLY' });
      Clients.saveContact(P(admin), { client_id: A.client_id, name: 'Anil Kumar', designation: 'Owner', email: 'anil@example.invalid', is_primary: true });
      var tpl = DB.findOne('TaskTemplates', function (t) { return t.name === 'GST return (monthly)'; });
      DB.insert('RecurringTaskRules', { name: 'GST monthly - Alpha', template_id: tpl.template_id, client_id: A.client_id, frequency: 'MONTHLY', due_offset_days: 20, start_date: Util.addDays(Util.today(), -75), partner_id: p1.user_id, senior_id: sr.user_id, clerk_id: c1.user_id, status: 'Active' }, 'demo');
      var t0 = Util.today(), mkTask = function (client, title, due, clerk, partner, extra) { var d = { client_id: client.client_id, title: title, due_date: due, clerk_id: clerk.user_id, est_hours: 4, instructions: 'Please complete as per checklist.', checklist: ['Collect data', 'Prepare', 'Review'], service_id: svc['GST-RET'], confirm_overload: true }; for (var k in (extra || {})) d[k] = extra[k]; return Tasks.create(P(partner), d); };
      var tk1 = mkTask(A, 'GST return - Alpha - last month', Util.addDays(t0, -2), c1, p1), tk2 = mkTask(B, 'Bank reconciliation - Bright', Util.addDays(t0, 3), c1, p1), tk3 = mkTask(Cc, 'TDS statement - Coastal', Util.addDays(t0, 6), c2, p2, { requires_senior_review: 'N' }), tk4 = mkTask(D, 'Audit planning - Delta', Util.addDays(t0, 12), c2, p2, { est_hours: 10 });
      Tasks.acknowledge(c1, tk1.task_id); Tasks.setStatus(c1, tk1.task_id, 'In Progress', ''); Tasks.acknowledge(c2, tk3.task_id);
      var inv = Fees.saveInvoice(P(ac), { client_id: A.client_id, invoice_type: 'TAX', items: [{ description: 'GST compliance - monthly', sac: '998221', qty: 1, rate: 3000 }] }); inv = Fees.issueInvoice(P(ac), inv.invoice_id, { invoice_date: Util.addDays(t0, -45), due_days: 15 });
      var inv2 = Fees.saveInvoice(P(ac), { client_id: B.client_id, invoice_type: 'TAX', items: [{ description: 'Accounting - quarterly', sac: '998221', qty: 1, rate: 15000 }] }); Fees.issueInvoice(P(ac), inv2.invoice_id, { invoice_date: Util.addDays(t0, -20), due_days: 15 });
      Fees.recordReceipt(P(ac), { client_id: A.client_id, receipt_date: Util.addDays(t0, -10), amount: 2000, mode: 'UPI', txn_ref: 'DEMO-UPI-1', allocations: [{ invoice_id: inv.invoice_id, amount: 2000 }] });
      Fees.saveFollowUp(P(ac), { client_id: A.client_id, invoice_id: inv.invoice_id, followup_date: Util.addDays(t0, -3), method: 'Phone', summary: 'Promised payment', promised_date: Util.addDays(t0, -1), next_followup_date: Util.addDays(t0, 0), status: 'Promised' });
      Files.create(P(ac), { client_id: A.client_id, description: 'Purchase bills FY (box 1)', file_type: 'Bills', received_from: 'Anil Kumar' });
      Compliance.saveCalendar(P(admin), { category: 'GST', name: 'Sample GST monthly return (demo date)', form_ref: 'DEMO', period_label: 'Demo period', due_date: Util.addDays(t0, 8), source_note: 'Demo entry - not a real deadline' });
      Compliance.generateRecords(P(admin), DB.all('ComplianceCalendar')[0].calendar_id);
    });
    out.password = pw; return out;
  }
  function Admin_sync(u, role) { if (['PARTNER', 'MANAGING_PARTNER'].indexOf(role) > -1) DB.insert('Partners', { user_id: u.user_id, display_name: u.full_name, can_approve: 'Y' }, 'demo'); if (['SENIOR', 'CLERK', 'ACCOUNTS'].indexOf(role) > -1) DB.insert('Employees', { user_id: u.user_id, designation: role === 'CLERK' ? 'Articled Clerk' : role, work_hours_per_day: 8 }, 'demo'); }
  /** Removes demo users and everything they created/own (clients with demo emails); resets demo mode. */
  function purge() {
    if (Settings.get('demo_mode', 'N') !== 'Y') throw new Error('Refusing to purge: demo mode is not active on this database. Use this only on a TEST copy that holds fictional demo data.');
    var demoUsers = DB.all('Users', true).filter(function (u) { return /@demo-ca\.test$/.test(u.email); }).map(function (u) { return u.user_id; });
    DB.flushWrites();
    var tables = SHEET_ORDER.filter(function (t) { return ['Settings', 'Roles', 'Permissions', 'ServiceCategories', 'TaskTemplates', 'ChecklistTemplates', 'EmailTemplates', 'IntegrationRegister', 'BackupLogs'].indexOf(t) < 0; });
    tables.forEach(function (t) { var sh = DB.spreadsheet().getSheetByName(t); if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).clearContent(); });
    DB.reset(); Settings.set('demo_mode', 'N', 'system');
    return { removed_users: demoUsers.length, note: 'All operational tabs were cleared (this includes every user). Create the administrator again by running resetAdminAccess() after re-adding the user, or run setupApplication() on a fresh project.' };
  }
  return { seed: seed, purge: purge };
})();


// ======== Code.gs ========
/**
 * Code.gs - web app entry point and the single API gateway used by the browser (google.script.run.api).
 * Every call: validates the session, re-reads the user from the database, enforces permissions inside the module functions,
 * wraps write actions in a script lock, and returns {ok, data} or {ok:false, error}. Nothing is trusted from the browser.
 */
/** JSON API for the static web front end (GitHub Pages). Body: {token, action, payload, reqId} sent as text/plain to avoid a CORS pre-flight. */
function doPost(e) {
  var out;
  try {
    var raw = e && e.postData && e.postData.contents ? e.postData.contents : '';
    if (raw.length > 14500000) throw new AppError('VALIDATION', 'Request is too large.');
    var b = JSON.parse(raw);
    out = api(b.token, b.action, b.payload, b.reqId);
  } catch (err) { out = { ok: false, error: { code: 'VALIDATION', message: 'Malformed request.' } }; }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}
function doGet(e) {
  if (e && e.parameter && e.parameter.ping) return ContentService.createTextOutput(JSON.stringify({ ok: true, name: APP.NAME, version: APP.VERSION })).setMimeType(ContentService.MimeType.JSON);
  var t; try { t = HtmlService.createTemplateFromFile('Index'); } catch (err) {
    return HtmlService.createHtmlOutput('<!doctype html><meta charset="utf-8"><title>' + APP.NAME + '</title><body style="font-family:Arial,sans-serif;padding:24px"><h2>' + APP.NAME + ' - data service</h2><p>This address is the firm data service. Open the CA Office Manager page and use the firm link you were given.</p></body>');
  }
  return t.evaluate().setTitle(APP.NAME).addMetaTag('viewport', 'width=device-width, initial-scale=1').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}
/** Public web-app address. When code runs from the editor Google returns the owner-only test address ending /dev, which nobody else can open and which cannot be turned into the published /exec address, so it is treated as unknown (blank). */
function webAppUrl_() { var u = ''; try { u = ScriptApp.getService().getUrl() || ''; } catch (e) { u = ''; } return /\/exec$/.test(u) ? u : ''; }
function include(name) { return HtmlService.createHtmlOutputFromFile(name).getContent(); }

var ACTIONS = {};
function act_(name, fn, w, pub) { ACTIONS[name] = { fn: fn, w: !!w, pub: !!pub }; }
function userView_(u) {
  return { user_id: u.user_id, full_name: u.full_name, email: u.email, role: u.role, role_label: ROLES[u.role], partner_id: u.partner_id, perms: Object.keys(Perm.effective(u)), client_access: u.client_access };
}

/* ---- public ---- */
act_('info', function () { return Admin.publicSettings(); }, false, true);
act_('login', function (u, p) { var token = Auth.login(p.email, p.password); var user = Auth.authenticate(token); return { token: token, me: userView_(user) }; }, true, true);
act_('register', function (u, p) { return Admin.register(p); }, true, true);
act_('register.resend', function (u, p) { return Admin.resendCode(p); }, true, true);
act_('users.approve', function (u, p) { return Admin.approveUser(u, p); }, true);
act_('activate', function (u, p) { Auth.activate(p.email, p.code, p.password); return { activated: true }; }, true, true);
/* ---- session ---- */
act_('me', function (u) { return { enums: { ENTITY_TYPES: ENTITY_TYPES, PIPELINE: PIPELINE, PRIORITIES: PRIORITIES, TASK_STATUSES: TASK_STATUSES, TIME_CATEGORIES: TIME_CATEGORIES, LEAVE_TYPES: LEAVE_TYPES, PAYMENT_MODES: PAYMENT_MODES, FILE_STATUSES: FILE_STATUSES, FILE_OUT_STATUSES: FILE_OUT_STATUSES, COMPLIANCE_CATEGORIES: COMPLIANCE_CATEGORIES, RECURRENCE: RECURRENCE, ROLES: ROLES }, me: userView_(u), settings: Admin.publicSettings(), directory: Admin.directory(u), pending_acks: Files.myPendingAcks(u).length }; });
act_('logout', function (u, p, ctx) { Auth.logout(ctx.token); Audit.log(u, 'LOGOUT', 'Auth', 'User', u.user_id, '', '', '', 'OK'); return true; }, true);
act_('changePassword', function (u, p) { return Auth.changePassword(u, p.old_password, p.new_password); }, true);
act_('dashboard', function (u) { return Reports.dashboard(u); });
/* ---- notifications ---- */
act_('notif.list', function (u, p) { var r = Notify.list(u, p); r.messages_unread = Msg.unreadCount(u); return r; });
act_('msg.send', function (u, p) { return Msg.send(u, p); }, true);
act_('msg.inbox', function (u, p) { return Msg.inbox(u, p); });
act_('msg.thread', function (u, p) { return Msg.thread(u, p.thread_id); }, true);
act_('notif.read', function (u, p) { return Notify.markRead(u, p.ids); }, true);
act_('announce.post', function (u, p) { return Notify.postAnnouncement(u, p); }, true);
/* ---- admin ---- */
act_('users.directory', function (u) { return Admin.directory(u); });
act_('users.list', function (u) { return Admin.listUsers(u); });
act_('users.save', function (u, p) { return Admin.saveUser(u, p); }, true);
act_('users.deactivate', function (u, p) { return Admin.deactivate(u, p.user_id, p.reason); }, true);
act_('users.reactivate', function (u, p) { return Admin.reactivate(u, p.user_id); }, true);
act_('users.reset', function (u, p) { return Admin.resetAccess(u, p.user_id); }, true);
act_('users.setClientAccess', function (u, p) { return Admin.setClientAccess(u, p.user_id, p.client_ids); }, true);
act_('users.getClientAccess', function (u, p) { return Admin.getClientAccess(u, p.user_id); });
act_('perm.matrix', function (u) { return Admin.permMatrix(u); });
act_('perm.setRole', function (u, p) { return Admin.setRolePerms(u, p.role, p.perms); }, true);
act_('perm.setUser', function (u, p) { return Admin.setUserPerm(u, p.user_id, p.perm, p.effect, p.reason); }, true);
act_('settings.get', function (u) { return Admin.getSettings(u); });
act_('registry.get', function (u) { return Admin.registryGet(u); });
act_('registry.save', function (u, p) { return Admin.registrySave(u, p); }, true);
act_('settings.save', function (u, p) { return Admin.saveSettings(u, p.values); }, true);
act_('master.list', function (u, p) { return Admin.masterList(u, p.table); });
act_('master.save', function (u, p) { return Admin.masterSave(u, p.table, p.data); }, true);
act_('master.remove', function (u, p) { return Admin.masterRemove(u, p.table, p.id); }, true);
act_('audit.list', function (u, p) { return Admin.auditList(u, p); });
/* ---- clients ---- */
act_('clients.list', function (u, p) { return Clients.list(u, p); });
act_('clients.get', function (u, p) { return Clients.get(u, p.client_id); });
act_('clients.save', function (u, p) { return Clients.save(u, p); }, true);
act_('clients.stage', function (u, p) { return Clients.changeStage(u, p.client_id, p.stage, p.notes); }, true);
act_('clients.contact.save', function (u, p) { return Clients.saveContact(u, p); }, true);
act_('clients.contact.remove', function (u, p) { return Clients.removeContact(u, p.id); }, true);
act_('clients.service.save', function (u, p) { return Clients.saveService(u, p); }, true);
act_('clients.service.remove', function (u, p) { return Clients.removeService(u, p.id); }, true);
act_('clients.import', function (u, p) { return Clients.importCsv(u, p.csv, p.dryRun); }, true);
act_('clients.export', function (u) { return Clients.exportCsv(u); }, true);
/* ---- tasks ---- */
act_('tasks.list', function (u, p) { return Tasks.list(u, p); });
act_('tasks.get', function (u, p) { return Tasks.get(u, p.task_id); }, true);
act_('tasks.create', function (u, p) { return Tasks.create(u, p); }, true);
act_('tasks.update', function (u, p) { return Tasks.update(u, p.task_id, p); }, true);
act_('tasks.assign', function (u, p) { return Tasks.assign(u, p.task_id, p); }, true);
act_('tasks.ack', function (u, p) { return Tasks.acknowledge(u, p.task_id); }, true);
act_('tasks.status', function (u, p) { return Tasks.setStatus(u, p.task_id, p.status, p.remarks); }, true);
act_('tasks.submit', function (u, p) { return Tasks.submit(u, p.task_id, p.note); }, true);
act_('tasks.review', function (u, p) { return Tasks.review(u, p.task_id, p); }, true);
act_('tasks.instruct', function (u, p) { return Tasks.addInstruction(u, p.task_id, p); }, true);
act_('tasks.comment', function (u, p) { return Tasks.addComment(u, p.task_id, p); }, true);
act_('tasks.checklist.toggle', function (u, p) { return Tasks.toggleChecklist(u, p.item_id, p.done); }, true);
act_('tasks.checklist.add', function (u, p) { return Tasks.addChecklistItem(u, p.task_id, p.text, p.mandatory); }, true);
act_('tasks.dep.add', function (u, p) { return Tasks.addDep(u, p.task_id, p.depends_on); }, true);
act_('tasks.dep.remove', function (u, p) { return Tasks.removeDep(u, p.id); }, true);
act_('tasks.bulkCreate', function (u, p) { return Tasks.bulkCreate(u, p); }, true);
act_('tasks.bulkReassign', function (u, p) { return Tasks.bulkReassign(u, p); }, true);
act_('tasks.bulkDue', function (u, p) { return Tasks.bulkDueDate(u, p); }, true);
act_('tasks.generateRecurring', function (u, p) { Perm.require(u, 'task.manage_recurring'); return Tasks.generateRecurring(u, p && p.as_of); }, true);
act_('tasks.workload', function (u, p) { Perm.require(u, 'task.assign'); return (p.user_ids || []).map(function (id) { var w = Tasks.workload(id); w.user_id = id; return w; }); });
/* ---- time, attendance, leave ---- */
act_('time.start', function (u, p) { return Time.start(u, p); }, true);
act_('time.stop', function (u) { return Time.stop(u); }, true);
act_('time.pause', function (u) { return Time.pause(u); }, true);
act_('time.resume', function (u, p) { return Time.resume(u, p.session_id); }, true);
act_('time.manual', function (u, p) { return Time.manual(u, p); }, true);
act_('time.logs', function (u, p) { return Time.myLogs(u, p); });
act_('time.corr.request', function (u, p) { return Time.requestCorrection(u, p); }, true);
act_('time.corr.decide', function (u, p) { return Time.decideCorrection(u, p.correction_id, p.approve, p.remarks); }, true);
act_('time.corr.direct', function (u, p) { return Time.correctDirect(u, p); }, true);
act_('time.corr.list', function (u) { return Time.corrections(u); });
act_('time.productivity', function (u, p) { return Time.myProductivity(u, p); });
act_('att.in', function (u) { return Time.checkIn(u); }, true);
act_('att.out', function (u, p) { return Time.checkOut(u, p); }, true);
act_('att.list', function (u, p) { return Time.attendanceList(u, p); });
act_('att.correct', function (u, p) { return Time.attendanceCorrect(u, p); }, true);
act_('leave.apply', function (u, p) { return Time.leaveApply(u, p); }, true);
act_('leave.decide', function (u, p) { return Time.leaveDecide(u, p.leave_id, p.approve, p.remarks); }, true);
act_('leave.route', function (u) { var r = Time.leaveRoute(u); return { names: r.names, auto: r.auto }; });
act_('leave.cancel', function (u, p) { return Time.leaveCancel(u, p.leave_id); }, true);
act_('leave.list', function (u, p) { return Time.leaveList(u, p); });
act_('leave.balance', function (u, p) { return LEAVE_TYPES.map(function (t) { return Time.leaveBalance(u.user_id, t, (p && p.year) || Util.today().slice(0, 4)); }); });
/* ---- compliance ---- */
act_('comp.cal.list', function (u, p) { return Compliance.listCalendar(u, p); });
act_('comp.cal.save', function (u, p) { return Compliance.saveCalendar(u, p); }, true);
act_('comp.verify', function (u, p) { return Compliance.verify(u, p.calendar_id, p.note); }, true);
act_('comp.generate', function (u, p) { return Compliance.generateRecords(u, p.calendar_id); }, true);
act_('comp.rec.list', function (u, p) { return Compliance.listRecords(u, p); });
act_('comp.rec.update', function (u, p) { return Compliance.updateRecord(u, p.record_id, p); }, true);
act_('comp.rec.task', function (u, p) { return Compliance.createTask(u, p.record_id, p.confirm_overload); }, true);
/* ---- fees ---- */
act_('fees.agreement.save', function (u, p) { return Fees.saveAgreement(u, p); }, true);
act_('fees.agreement.list', function (u, p) { return Fees.listAgreements(u, p); });
act_('fees.invoice.save', function (u, p) { return Fees.saveInvoice(u, p); }, true);
act_('fees.invoice.issue', function (u, p) { return Fees.issueInvoice(u, p.invoice_id, p); }, true);
act_('fees.invoice.cancel', function (u, p) { return Fees.cancelInvoice(u, p.invoice_id, p.reason); }, true);
act_('fees.invoice.get', function (u, p) { return Fees.getInvoice(u, p.invoice_id); });
act_('fees.invoice.list', function (u, p) { return Fees.listInvoices(u, p); });
act_('fees.receipt.record', function (u, p) { return Fees.recordReceipt(u, p); }, true);
act_('fees.receipt.allocate', function (u, p) { return Fees.allocate(u, p.receipt_id, p.allocations); }, true);
act_('fees.receipt.cancel', function (u, p) { return Fees.cancelReceipt(u, p.receipt_id, p.reason); }, true);
act_('fees.receipt.list', function (u, p) { return Fees.listReceipts(u, p); });
act_('fees.alloc.reverse', function (u, p) { return Fees.reverseAllocation(u, p.allocation_id, p.reason); }, true);
act_('fees.adj.add', function (u, p) { return Fees.addAdjustment(u, p); }, true);
act_('fees.adj.cancel', function (u, p) { return Fees.cancelAdjustment(u, p.adjustment_id, p.reason); }, true);
act_('fees.followup.save', function (u, p) { return Fees.saveFollowUp(u, p); }, true);
act_('fees.followup.list', function (u, p) { return Fees.listFollowUps(u, p); });
act_('fees.statement', function (u, p) { return Fees.statement(u, p.client_id, p.from, p.to); });
act_('fees.client', function (u, p) { Perm.require(u, 'fees.view'); Perm.assertClient(u, p.client_id); return Fees.clientSummary(p.client_id); });
/* ---- files ---- */
act_('files.list', function (u, p) { return Files.list(u, p); });
act_('files.create', function (u, p) { return Files.create(u, p); }, true);
act_('files.transfer', function (u, p) { return Files.transfer(u, p); }, true);
act_('files.ack', function (u, p) { return Files.acknowledge(u, p.movement_id); }, true);
act_('files.return', function (u, p) { return Files.returnFile(u, p); }, true);
act_('files.archive', function (u, p) { return Files.archive(u, p); }, true);
act_('files.exception', function (u, p) { return Files.reportException(u, p); }, true);
act_('files.history', function (u, p) { return Files.history(u, p.file_id); });
act_('files.pendingAcks', function (u) { return Files.myPendingAcks(u); });
/* ---- documents ---- */
act_('docs.list', function (u, p) { return Docs.list(u, p); });
act_('docs.upload', function (u, p) { return Docs.upload(u, p); }, true);
act_('docs.download', function (u, p) { return Docs.download(u, p.doc_id); }, true);
act_('docs.export', function (u) { return Docs.exportRegister(u); }, true);
act_('docreq.create', function (u, p) { return Docs.createRequest(u, p); }, true);
act_('docreq.item', function (u, p) { return Docs.updateItem(u, p.item_id, p); }, true);
act_('docreq.list', function (u, p) { return Docs.listRequests(u, p); });
/* ---- email ---- */
act_('mail.draft', function (u, p) { return Mail.draft(u, p); }, true);
act_('mail.edit', function (u, p) { return Mail.editDraft(u, p.queue_id, p); }, true);
act_('mail.submit', function (u, p) { return Mail.submit(u, p.queue_id); }, true);
act_('mail.decide', function (u, p) { return Mail.decide(u, p.queue_id, p.approve, p.remarks); }, true);
act_('mail.send', function (u, p) { return Mail.send(u, p.queue_id); }, true);
act_('mail.list', function (u, p) { return Mail.list(u, p); });
act_('mail.history', function (u, p) { return Mail.history(u, p.client_id); });
/* ---- reports ---- */
act_('reports.catalog', function (u) { return Reports.catalog(u); });
act_('reports.run', function (u, p) { return Reports.run(u, p.id, p.filters); });
act_('reports.export', function (u, p) { return Reports.exportCsv(u, p.id, p.filters); }, true);
/* ---- backup / jobs ---- */
act_('backup.list', function (u) { return Backup.list(u); });
act_('backup.db', function (u) { return Backup.backupDatabase(u); }, true);
act_('backup.csv', function (u) { return Backup.exportCsvAll(u); }, true);
act_('backup.inventory', function (u) { return Backup.documentInventory(u); }, true);
act_('backup.config', function (u) { return Backup.exportConfig(u); }, true);
act_('backup.verify', function (u, p) { return Backup.verifyBackup(u, p.file_id); }, true);
act_('jobs.install', function (u) { Perm.require(u, 'backup.manage'); Audit.log(u, 'TRIGGERS_INSTALL', 'Jobs', '', '', '', '', '', 'OK'); return Jobs.installTriggers(); }, true);
act_('jobs.remove', function (u) { Perm.require(u, 'backup.manage'); Audit.log(u, 'TRIGGERS_REMOVE', 'Jobs', '', '', '', '', '', 'OK'); return Jobs.removeTriggers(); }, true);
act_('jobs.runNow', function (u) { Perm.require(u, 'backup.manage'); return Jobs.run(); }, true);

/** The only function the browser calls. */
function api(token, action, payload, reqId) {
  var ref = Util.randHex(8).toUpperCase();
  try {
    DB.reset(); Perm.reset();
    var def = Object.prototype.hasOwnProperty.call(ACTIONS, String(action)) ? ACTIONS[action] : null; if (!def || typeof def.fn !== 'function') throw new AppError('NOT_FOUND', 'Unknown request.');
    var p = payload; if (typeof p === 'string') { try { p = JSON.parse(p); } catch (e) { throw new AppError('VALIDATION', 'Malformed request.'); } } p = p || {};
    if (JSON.stringify(p).length > 14000000) throw new AppError('VALIDATION', 'Request is too large.');
    var run = function (user) {
      var ctx = { token: token };
      if (def.w) return DB.tx(function () { return def.fn(user, p, ctx); });
      return def.fn(user, p, ctx);
    };
    if (def.pub) return { ok: true, data: run(null) };
    var user = (function () { return Auth.authenticate(token); })();
    var cache = CacheService.getScriptCache(), key = null;
    if (def.w && reqId && /^[A-Za-z0-9\-]{8,64}$/.test(String(reqId))) {
      key = 'req:' + user.user_id + ':' + reqId; var seen = cache.get(key);
      if (seen) { if (seen === '1') return { ok: true, data: null, duplicate: true }; return JSON.parse(seen); }
    }
    var out = { ok: true, data: run(user) };
    if (key) { try { var s = JSON.stringify(out); cache.put(key, s.length < 90000 ? s : '1', 120); } catch (e) {} }
    return out;
  } catch (e) {
    if (e instanceof AppError || (e && e.name === 'AppError')) return { ok: false, error: { code: e.code, message: e.message, details: e.details || null } };
    console.error('[' + ref + '] ' + action + ': ' + (e && e.stack || e));
    return { ok: false, error: { code: 'SERVER', message: 'Something went wrong. Please try again; if it continues contact the administrator and quote reference ' + ref + '.' } };
  }
}
