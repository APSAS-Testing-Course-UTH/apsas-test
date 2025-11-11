-- Add default admin user, password is 'admin'
INSERT INTO identity.users(id, email, password_hash, first_name, last_name, role, is_email_verified)
VALUES ('00000000-0000-0000-0000-000000000001',
        'admin@apsas', '{bcrypt}$2a$10$2SVOMhHQ5pVBKg1fCF1Lquvnk61MzL8rKbk8RfvO9Sbg/FUjPe/fu',
        'System', 'Administrator', 'ADMIN', true)
ON CONFLICT (id) DO NOTHING;
