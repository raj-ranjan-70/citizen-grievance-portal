# Mistakes & Anti-Patterns Log

## 1. Officer 403 Forbidden on Comments
- **Issue:** Officers were unable to post comments on their assigned complaints, receiving a 403 Forbidden error.
- **Cause:** The frontend was hardcoded to call the citizen complaints comments endpoint. RoleAuthInterceptor blocked the officer session.
- **Fix:** Created POST /api/v1/officer/complaints/{id}/comments and updated complaintService.addComment to dynamically select the role prefix.

## 2. Double Path Prefix in SSE Subscribe URL
- **Issue:** The React client failed to initialize the Server-Sent Events (SSE) stream, throwing errors in console.
- **Cause:** The stream URL was constructed as `${apiBase}/v1/notifications/subscribe`, which became `/api/v1/v1/notifications/subscribe` because VITE_API_BASE_URL was already `/api/v1`.
- **Fix:** Changed path to `${apiBase}/notifications/subscribe` in NotificationContext.jsx.

## 3. Lack of Single Complaint Get Endpoints for Admin and Officer
- **Issue:** Deep linking from notifications or live sync would fail for Officers and Admins because there was no GET endpoint to retrieve details for a single complaint.
- **Cause:** The original design only exposed GET /api/v1/citizen/complaints/{id}.
- **Fix:** Added GET /api/v1/officer/complaints/{id} and GET /api/v1/admin/complaints/{id} with proper authorization checks.
## 4. Missing Explicit Imports in Service Classes
- **Issue:** Backend compilation failed during refactoring due to undefined symbol `NotificationType`.
- **Cause:** While some services imported `com.raj.citizen_grievance_backend.entity.*`, `OfficerService.java` used individual explicit imports for entities and was missing `NotificationType`.
- **Fix:** Added `import com.raj.citizen_grievance_backend.entity.NotificationType;` explicitly to resolve compile error.
