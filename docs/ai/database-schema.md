# Database Schema - Citizen Grievance Portal (Phase 1)

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

### Indexes
- Primary Key on `id`.
- Unique constraint `UK6dotkott2kjsp8vw4d0m25fb7` on `email`.

---

## 2. `user_sessions` Table

Maps to the `UserSession` entity. Used to track active sessions across requests and run custom cookie authentication.

| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(255)` | `PRIMARY KEY`, `NOT NULL` | Session ID (matches `JSESSIONID` cookie value). |
| `user_id` | `BINARY(16)` | `FOREIGN KEY`, `NOT NULL` | Reference to the user who owns this session. |
| `last_access_time` | `DATETIME(6)` | `NOT NULL` | Time when the session was last verified. |
| `expiry_time` | `DATETIME(6)` | `NOT NULL` | Absolute time after which the session is considered invalid. |

### Foreign Keys
- `FK8klxsgb8dcjjklmqebqp1twd5`: `user_id` references `users(id)`.
