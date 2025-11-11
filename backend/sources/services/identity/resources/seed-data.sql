-- Identity Service Seed Data
-- Default user password: 'SecurePassword123!'
-- Students 1-4: Hard-coded UUIDs for submission service references
INSERT INTO identity.users(email, password_hash, first_name, last_name, role, is_email_verified)
VALUES ('instructor1@apsas', '{bcrypt}$2a$10$WMBlN/wOemR3WSllN.s7/uRjCljr.ix/STF7Lvi7EurA4DXRyN4mW',
        'Tuấn', 'Nguyễn', 'INSTRUCTOR', true)
ON CONFLICT (email) DO NOTHING;
INSERT INTO identity.users(id, email, password_hash, first_name, last_name, role, is_email_verified)
VALUES ('550e8400-e29b-41d4-a716-446655440011', 'student1@apsas',
        '{bcrypt}$2a$10$WMBlN/wOemR3WSllN.s7/uRjCljr.ix/STF7Lvi7EurA4DXRyN4mW',
        'An', 'Trần', 'STUDENT', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO identity.users(id, email, password_hash, first_name, last_name, role, is_email_verified)
VALUES ('29ada301-a1f4-41d5-a8fb-dbb8618f2f1d', 'contentprovider1@apsas',
        '{bcrypt}$2a$10$WMBlN/wOemR3WSllN.s7/uRjCljr.ix/STF7Lvi7EurA4DXRyN4mW',
        'Minh', 'Lê', 'CONTENT_PROVIDER', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO identity.users(id, email, password_hash, first_name, last_name, role, is_email_verified)
VALUES ('550e8400-e29b-41d4-a716-446655440012', 'student2@apsas',
        '{bcrypt}$2a$10$WMBlN/wOemR3WSllN.s7/uRjCljr.ix/STF7Lvi7EurA4DXRyN4mW',
        'Quâng', 'Phạm', 'STUDENT', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO identity.users(email, password_hash, first_name, last_name, role, is_email_verified)
VALUES ('instructor2@apsas', '{bcrypt}$2a$10$WMBlN/wOemR3WSllN.s7/uRjCljr.ix/STF7Lvi7EurA4DXRyN4mW',
        'Hương', 'Vũ', 'INSTRUCTOR', true)
ON CONFLICT (email) DO NOTHING;
INSERT INTO identity.users(id, email, password_hash, first_name, last_name, role, is_email_verified)
VALUES ('bd3c3370-b0cd-4a3b-ab70-07028213daa0', 'contentprovider2@apsas',
        '{bcrypt}$2a$10$WMBlN/wOemR3WSllN.s7/uRjCljr.ix/STF7Lvi7EurA4DXRyN4mW',
        'Lan', 'Đỗ', 'CONTENT_PROVIDER', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO identity.users(id, email, password_hash, first_name, last_name, role, is_email_verified)
VALUES ('550e8400-e29b-41d4-a716-446655440013', 'student3@apsas',
        '{bcrypt}$2a$10$WMBlN/wOemR3WSllN.s7/uRjCljr.ix/STF7Lvi7EurA4DXRyN4mW',
        'Bình', 'Ngô', 'STUDENT', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO identity.users(id, email, password_hash, first_name, last_name, role, is_email_verified)
VALUES ('550e8400-e29b-41d4-a716-446655440014', 'student4@apsas',
        '{bcrypt}$2a$10$WMBlN/wOemR3WSllN.s7/uRjCljr.ix/STF7Lvi7EurA4DXRyN4mW',
        'Duy',
        'Lâm', 'STUDENT', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO identity.users(email, password_hash, first_name, last_name, role, is_email_verified)
VALUES ('student5@apsas', '{bcrypt}$2a$10$WMBlN/wOemR3WSllN.s7/uRjCljr.ix/STF7Lvi7EurA4DXRyN4mW',
        'Hải',
        'Phan', 'STUDENT', true)
ON CONFLICT (email) DO NOTHING;
INSERT INTO identity.users(email, password_hash, first_name, last_name, role, is_email_verified)
VALUES ('student6@apsas', '{bcrypt}$2a$10$WMBlN/wOemR3WSllN.s7/uRjCljr.ix/STF7Lvi7EurA4DXRyN4mW',
        'Linh', 'Võ', 'STUDENT', true)
ON CONFLICT (email) DO NOTHING;
INSERT INTO identity.users(email, password_hash, first_name, last_name, role, is_email_verified)
VALUES ('student7@apsas', '{bcrypt}$2a$10$WMBlN/wOemR3WSllN.s7/uRjCljr.ix/STF7Lvi7EurA4DXRyN4mW',
        'Nam',
        'Bùi', 'STUDENT', true)
ON CONFLICT (email) DO NOTHING;
INSERT INTO identity.users(email, password_hash, first_name, last_name, role, is_email_verified)
VALUES ('student8@apsas', '{bcrypt}$2a$10$WMBlN/wOemR3WSllN.s7/uRjCljr.ix/STF7Lvi7EurA4DXRyN4mW',
        'Phúc', 'Đặng', 'STUDENT', true)
ON CONFLICT (email) DO NOTHING;
INSERT INTO identity.users(email, password_hash, first_name, last_name, role, is_email_verified)
VALUES ('student9@apsas', '{bcrypt}$2a$10$WMBlN/wOemR3WSllN.s7/uRjCljr.ix/STF7Lvi7EurA4DXRyN4mW',
        'Quỳnh', 'Trịnh', 'STUDENT', true)
ON CONFLICT (email) DO NOTHING;
INSERT INTO identity.users(email, password_hash, first_name, last_name, role, is_email_verified)
VALUES ('student10@apsas', '{bcrypt}$2a$10$WMBlN/wOemR3WSllN.s7/uRjCljr.ix/STF7Lvi7EurA4DXRyN4mW',
        'Thảo', 'Hoàng', 'STUDENT', true)
ON CONFLICT (email) DO NOTHING;
INSERT INTO identity.users(email, password_hash, first_name, last_name, role, is_email_verified)
VALUES ('instructor3@apsas', '{bcrypt}$2a$10$WMBlN/wOemR3WSllN.s7/uRjCljr.ix/STF7Lvi7EurA4DXRyN4mW',
        'Vinh', 'Trần', 'INSTRUCTOR', true)
ON CONFLICT (email) DO NOTHING;
