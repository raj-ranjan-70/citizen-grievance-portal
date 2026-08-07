# Database Schema - Citizen Grievance Portal

## 1. `users` Table

Maps to the `User` entity. Stores authentication credentials and user profile information.

| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BINARY(16)` | `PRIMARY KEY`, `NOT NULL` | Unique identifier (UUID). |
| `name` | `VARCHAR(255)` | `NOT NULL` | User's full name. |
| `email` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | Unique registration email. |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | SHA-256 hashed password with random salt (`saltHex:hashHex`). |
| `role` | `ENUM('CITIZEN', 'OFFICER', 'ADMIN')` | `NOT NULL` | Category/permissions of the user. |
| `department` | `ENUM('WATER', 'ELECTRICITY', 'ROADS', 'SANITATION', 'NONE')` | `NULLABLE` | Assigned department (Officer only). |
| `created_at` | `DATETIME(6)` | `NOT NULL`, `UNUPDATABLE` | Timestamp when the user registered. |
| `updated_at` | `DATETIME(6)` | `NOT NULL` | Timestamp when the user profile was last updated. |

---

## 2. `user_sessions` Table

Maps to the `UserSession` entity. Used to track active sessions across requests and run custom cookie authentication.

| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(255)` | `PRIMARY KEY`, `NOT NULL` | Session ID (matches `JSESSIONID` cookie value). |
| `user_id` | `BINARY(16)` | `FOREIGN KEY`, `NOT NULL` | Reference to the user who owns this session. |
| `last_access_time` | `DATETIME(6)` | `NOT NULL` | Time when the session was last verified. |
| `expiry_time` | `DATETIME(6)` | `NOT NULL` | Absolute time after which the session is considered invalid. |

---

## 3. `complaints` Table

Maps to the `Complaint` entity. Stores grievance details filed by citizens.

| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BINARY(16)` | `PRIMARY KEY`, `NOT NULL` | Unique identifier (UUID). |
| `citizen_id` | `BINARY(16)` | `FOREIGN KEY`, `NOT NULL` | Reference to the user (Citizen) who filed it. |
| `title` | `VARCHAR(255)` | `NOT NULL` | Title of the grievance. |
| `description` | `TEXT` | `NOT NULL` | Detailed description of the grievance. |
| `category` | `VARCHAR(255)` | `NOT NULL` | Category of the concern (e.g. Roads & Infrastructure). |
| `priority` | `VARCHAR(50)` | `NOT NULL` | Priority rating: `LOW`, `MEDIUM`, `HIGH`. |
| `status` | `VARCHAR(50)` | `NOT NULL` | Life-cycle status: `PENDING`, `ASSIGNED`, `RESOLVED`, `REJECTED`. |
| `assigned_officer_id`| `BINARY(16)`| `FOREIGN KEY`, `NULLABLE` | Reference to the Officer assigned to address this. |
| `created_at` | `DATETIME(6)` | `NOT NULL` | Timestamp when the grievance was filed. |
| `updated_at` | `DATETIME(6)` | `NOT NULL` | Timestamp when last updated. |

---

## 4. `comments` Table

Maps to the `Comment` entity. Stores the conversation thread history for complaints.

| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BINARY(16)` | `PRIMARY KEY`, `NOT NULL` | Unique identifier (UUID). |
| `complaint_id` | `BINARY(16)` | `FOREIGN KEY`, `NOT NULL` | Reference to the associated Complaint. |
| `author_id` | `BINARY(16)` | `FOREIGN KEY`, `NOT NULL` | Reference to the user (Citizen/Officer) who wrote it. |
| `content` | `TEXT` | `NOT NULL` | Body of the message/update. |
| `created_at` | `DATETIME(6)` | `NOT NULL` | Timestamp when comment was added. |
