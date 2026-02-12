-- Migration: 003_add_device_details (Down)

ALTER TABLE devices
DROP COLUMN IF EXISTS local_ip,
DROP COLUMN IF EXISTS mac_address,
DROP COLUMN IF EXISTS boot_time,
DROP COLUMN IF EXISTS current_user,
DROP COLUMN IF EXISTS os_info,
DROP COLUMN IF EXISTS hardware,
DROP COLUMN IF EXISTS network_interfaces,
DROP COLUMN IF EXISTS storage_drives,
DROP COLUMN IF EXISTS installed_software,
DROP COLUMN IF EXISTS processes,
DROP COLUMN IF EXISTS patches,
DROP COLUMN IF EXISTS security,
DROP COLUMN IF EXISTS audit_log;