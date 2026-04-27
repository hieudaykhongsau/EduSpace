-- ==============================================================================
-- DATABASE INITIALIZATION SCRIPT FOR EDU-SPACE
-- ==============================================================================

-- Drop tables if they exist to allow clean re-runs
IF OBJECT_ID('notifications', 'U') IS NOT NULL DROP TABLE notifications;
IF OBJECT_ID('community_comments', 'U') IS NOT NULL DROP TABLE community_comments;
IF OBJECT_ID('community_post_likes', 'U') IS NOT NULL DROP TABLE community_post_likes;
IF OBJECT_ID('community_posts', 'U') IS NOT NULL DROP TABLE community_posts;
IF OBJECT_ID('messages', 'U') IS NOT NULL DROP TABLE messages;
IF OBJECT_ID('box_chat_members', 'U') IS NOT NULL DROP TABLE box_chat_members;
IF OBJECT_ID('box_chats', 'U') IS NOT NULL DROP TABLE box_chats;
IF OBJECT_ID('friendships', 'U') IS NOT NULL DROP TABLE friendships;
IF OBJECT_ID('enrollments', 'U') IS NOT NULL DROP TABLE enrollments;
IF OBJECT_ID('rooms', 'U') IS NOT NULL DROP TABLE rooms;
IF OBJECT_ID('admins', 'U') IS NOT NULL DROP TABLE admins;
IF OBJECT_ID('guests', 'U') IS NOT NULL DROP TABLE guests;
IF OBJECT_ID('users', 'U') IS NOT NULL DROP TABLE users;

GO

-- 1. Base Users Table (InheritanceType.JOINED)
CREATE TABLE users (
    user_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name NVARCHAR(100),
    avatar_url NVARCHAR(MAX),
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'GUEST',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    auth_provider VARCHAR(20) DEFAULT 'local',
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME
);

-- 2. Guests Table
CREATE TABLE guests (
    user_id BIGINT PRIMARY KEY,
    dob DATE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. Admins Table
CREATE TABLE admins (
    user_id BIGINT PRIMARY KEY,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 4. Rooms Table
CREATE TABLE rooms (
    room_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    room_name NVARCHAR(100) NOT NULL,
    description NVARCHAR(500),
    room_type VARCHAR(20) NOT NULL,
    room_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    password VARCHAR(255),
    room_code VARCHAR(8) NOT NULL UNIQUE,
    host_id BIGINT,
    max_participants INT DEFAULT 8,
    create_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (host_id) REFERENCES users(user_id)
);

-- 5. Enrollments Table
CREATE TABLE enrollments (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    guest_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    enrolled_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (guest_id) REFERENCES guests(user_id),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
);

-- 6. Friendships Table
CREATE TABLE friendships (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    requester_id BIGINT NOT NULL,
    addressee_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME,
    FOREIGN KEY (requester_id) REFERENCES users(user_id),
    FOREIGN KEY (addressee_id) REFERENCES users(user_id),
    CONSTRAINT UQ_Friendship UNIQUE(requester_id, addressee_id)
);

-- 7. Box Chats Table
CREATE TABLE box_chats (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    chat_name NVARCHAR(255),
    is_group BIT NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME
);

-- 8. Box Chat Members Table
CREATE TABLE box_chat_members (
    box_chat_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (box_chat_id, user_id),
    FOREIGN KEY (box_chat_id) REFERENCES box_chats(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 9. Messages Table
CREATE TABLE messages (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    box_chat_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    type VARCHAR(20) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (box_chat_id) REFERENCES box_chats(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(user_id)
);

-- 10. Community Posts Table
CREATE TABLE community_posts (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    author_id BIGINT NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    media_url VARCHAR(255),
    like_count INT NOT NULL DEFAULT 0,
    comment_count INT NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME,
    FOREIGN KEY (author_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 11. Community Post Likes Table
CREATE TABLE community_post_likes (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 12. Community Comments Table
CREATE TABLE community_comments (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    post_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME,
    FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(user_id)
);

-- 13. Notifications Table
CREATE TABLE notifications (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    recipient_id BIGINT NOT NULL,
    sender_id BIGINT,
    type VARCHAR(50) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    is_read BIT NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (recipient_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(user_id)
);

GO

-- ==========================================
-- SEED DATA
-- Password for all is 'password123'
-- Hash: $2a$10$fL07XJVbBvsrMtnFS.F.yOt8T3HmvJ6usG3uEk8RpmI5rp4jinLjG
-- ==========================================

INSERT INTO users (username, email, full_name, password_hash, role, status) VALUES 
('admin_user', 'admin@edu.com', 'Admin System', '$2a$10$fL07XJVbBvsrMtnFS.F.yOt8T3HmvJ6usG3uEk8RpmI5rp4jinLjG', 'ADMIN', 'ACTIVE'),
('john_doe', 'john@gmail.com', 'John Doe', '$2a$10$fL07XJVbBvsrMtnFS.F.yOt8T3HmvJ6usG3uEk8RpmI5rp4jinLjG', 'GUEST', 'ACTIVE'),
('jane_smith', 'jane@gmail.com', 'Jane Smith', '$2a$10$fL07XJVbBvsrMtnFS.F.yOt8T3HmvJ6usG3uEk8RpmI5rp4jinLjG', 'GUEST', 'ACTIVE'),
('michael_w', 'mike@gmail.com', 'Michael Wright', '$2a$10$fL07XJVbBvsrMtnFS.F.yOt8T3HmvJ6usG3uEk8RpmI5rp4jinLjG', 'GUEST', 'ACTIVE');

-- Assuming IDs generated are 1, 2, 3, 4

INSERT INTO admins (user_id) VALUES (1);

INSERT INTO guests (user_id, dob) VALUES 
(2, '2000-01-01'), 
(3, '1998-05-12'), 
(4, '1995-11-23');

-- Add Friendships
-- 2 is friends with 3
INSERT INTO friendships (requester_id, addressee_id, status) VALUES (2, 3, 'ACCEPTED');

-- 4 requested 2
INSERT INTO friendships (requester_id, addressee_id, status) VALUES (4, 2, 'PENDING');

-- Create a Box Chat (1-on-1 between 2 and 3)
INSERT INTO box_chats (is_group) VALUES (0); -- id 1

INSERT INTO box_chat_members (box_chat_id, user_id) VALUES 
(1, 2),
(1, 3);

-- Add some messages
INSERT INTO messages (box_chat_id, sender_id, content, type) VALUES 
(1, 2, 'Hey Jane, how is the Java course going?', 'TEXT'),
(1, 3, 'It is going great! I just finished the Spring Boot section.', 'TEXT');

-- Add a Community Post
INSERT INTO community_posts (author_id, content, like_count, comment_count) VALUES 
(2, 'Just finished my first Spring Boot API. So excited! #coding #springboot', 1, 1); -- id 1

-- Add Like
INSERT INTO community_post_likes (post_id, user_id) VALUES (1, 3);

-- Add Comment
INSERT INTO community_comments (post_id, author_id, content) VALUES 
(1, 3, 'Congrats John! Keep up the good work.');

-- Add Notifications
INSERT INTO notifications (recipient_id, sender_id, type, content, is_read) VALUES 
(2, 3, 'LIKE', 'Jane Smith đã thích bài viết của bạn', 0),
(2, 3, 'COMMENT', 'Jane Smith đã bình luận về bài viết của bạn', 0),
(2, 4, 'FRIEND_REQUEST', 'Michael Wright đã gửi lời mời kết bạn', 0);
