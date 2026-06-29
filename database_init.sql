-- ==============================================================================
-- DATABASE INITIALIZATION SCRIPT FOR EDU-SPACE (POSTGRESQL VERSION)
-- ==============================================================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS community_comments CASCADE;
DROP TABLE IF EXISTS community_post_likes CASCADE;
DROP TABLE IF EXISTS community_posts CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS box_chat_members CASCADE;
DROP TABLE IF EXISTS box_chats CASCADE;
DROP TABLE IF EXISTS friendships CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS guests CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Helper function to auto-update updated_at columns
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Base Users Table
CREATE TABLE users (
    user_id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username    VARCHAR(50) UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    full_name   VARCHAR(100),
    avatar_url  TEXT,
    phone       VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role        VARCHAR(20) NOT NULL DEFAULT 'GUEST',
    status      VARCHAR(20) DEFAULT 'ACTIVE',
    auth_provider VARCHAR(20) DEFAULT 'local',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP
);

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 2. Guests Table
CREATE TABLE guests (
    user_id BIGINT PRIMARY KEY,
    dob     DATE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. Admins Table
CREATE TABLE admins (
    user_id BIGINT PRIMARY KEY,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 4. Rooms Table
CREATE TABLE rooms (
    room_id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    room_name       VARCHAR(100) NOT NULL,
    description     TEXT,
    room_type       VARCHAR(20) NOT NULL,
    room_status     VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    password        VARCHAR(255),
    room_code       VARCHAR(8) NOT NULL UNIQUE,
    host_id         BIGINT,
    max_participants INT DEFAULT 8,
    create_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (host_id) REFERENCES users(user_id)
);

-- 5. Enrollments Table
CREATE TABLE enrollments (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    guest_id    BIGINT NOT NULL,
    room_id     BIGINT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guests(user_id),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
);

-- 6. Friendships Table
CREATE TABLE friendships (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    requester_id BIGINT NOT NULL,
    addressee_id BIGINT NOT NULL,
    status       VARCHAR(20) NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(user_id),
    FOREIGN KEY (addressee_id) REFERENCES users(user_id),
    CONSTRAINT UQ_Friendship UNIQUE (requester_id, addressee_id)
);

CREATE TRIGGER trg_friendships_updated_at
    BEFORE UPDATE ON friendships
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 7. Box Chats Table
CREATE TABLE box_chats (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    chat_name  VARCHAR(255),
    is_group   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TRIGGER trg_box_chats_updated_at
    BEFORE UPDATE ON box_chats
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 8. Box Chat Members Table
CREATE TABLE box_chat_members (
    box_chat_id BIGINT NOT NULL,
    user_id     BIGINT NOT NULL,
    PRIMARY KEY (box_chat_id, user_id),
    FOREIGN KEY (box_chat_id) REFERENCES box_chats(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)     REFERENCES users(user_id) ON DELETE CASCADE
);

-- 9. Messages Table
CREATE TABLE messages (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    box_chat_id BIGINT NOT NULL,
    sender_id   BIGINT NOT NULL,
    content     TEXT NOT NULL,
    type        VARCHAR(20) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (box_chat_id) REFERENCES box_chats(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id)   REFERENCES users(user_id)
);

-- 10. Community Posts Table
CREATE TABLE community_posts (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    author_id     BIGINT NOT NULL,
    content       TEXT NOT NULL,
    media_url     TEXT,
    like_count    INT NOT NULL DEFAULT 0,
    comment_count INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TRIGGER trg_community_posts_updated_at
    BEFORE UPDATE ON community_posts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 11. Community Post Likes Table
CREATE TABLE community_post_likes (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_id    BIGINT NOT NULL,
    user_id    BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id)  REFERENCES community_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)  REFERENCES users(user_id)
);

-- 12. Community Comments Table
CREATE TABLE community_comments (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_id    BIGINT NOT NULL,
    author_id  BIGINT NOT NULL,
    content    TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (post_id)   REFERENCES community_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(user_id)
);

CREATE TRIGGER trg_community_comments_updated_at
    BEFORE UPDATE ON community_comments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 13. Notifications Table
CREATE TABLE notifications (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    recipient_id BIGINT NOT NULL,
    sender_id    BIGINT,
    type         VARCHAR(50) NOT NULL,
    content      TEXT NOT NULL,
    is_read      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id)    REFERENCES users(user_id)
);

-- ==========================================
-- SEED DATA
-- ==========================================

INSERT INTO users (username, email, full_name, password_hash, role, status) VALUES
('admin_user', 'admin@edu.com',  'Admin System',   '$2a$10$fL07XJVbBvsrMtnFS.F.yOt8T3HmvJ6usG3uEk8RpmI5rp4jinLjG', 'ADMIN', 'ACTIVE'),
('john_doe',   'john@gmail.com', 'John Doe',        '$2a$10$fL07XJVbBvsrMtnFS.F.yOt8T3HmvJ6usG3uEk8RpmI5rp4jinLjG', 'GUEST', 'ACTIVE'),
('jane_smith', 'jane@gmail.com', 'Jane Smith',      '$2a$10$fL07XJVbBvsrMtnFS.F.yOt8T3HmvJ6usG3uEk8RpmI5rp4jinLjG', 'GUEST', 'ACTIVE'),
('michael_w',  'mike@gmail.com', 'Michael Wright',  '$2a$10$fL07XJVbBvsrMtnFS.F.yOt8T3HmvJ6usG3uEk8RpmI5rp4jinLjG', 'GUEST', 'ACTIVE');

INSERT INTO admins (user_id) VALUES (1);

INSERT INTO guests (user_id, dob) VALUES
(2, '2000-01-01'),
(3, '1998-05-12'),
(4, '1995-11-23');

INSERT INTO box_chats (is_group) VALUES (FALSE);

INSERT INTO box_chat_members (box_chat_id, user_id) VALUES
(1, 2),
(1, 3);

INSERT INTO messages (box_chat_id, sender_id, content, type) VALUES
(1, 2, 'Hey Jane, how is the Java course going?', 'TEXT'),
(1, 3, 'It is going great! I just finished the Spring Boot section.', 'TEXT');

INSERT INTO community_posts (author_id, content, like_count, comment_count) VALUES
(2, 'Just finished my first Spring Boot API. So excited! #coding #springboot', 1, 1);

INSERT INTO community_post_likes (post_id, user_id) VALUES (1, 3);

INSERT INTO community_comments (post_id, author_id, content) VALUES
(1, 3, 'Congrats John! Keep up the good work.');

INSERT INTO notifications (recipient_id, sender_id, type, content, is_read) VALUES
(2, 3, 'LIKE',    'Jane Smith đã thích bài viết của bạn',      FALSE),
(2, 3, 'COMMENT', 'Jane Smith đã bình luận về bài viết của bạn', FALSE);