# Mistakes & Anti-Patterns Log

## 1. Officer 403 Forbidden on Comments
- **Issue:** Officers were unable to post comments on their assigned complaints, receiving a `403 Forbidden` error.
- **Cause:** The frontend was hardcoded to call the `/api/v1/citizen/complaints/{id}/comments` endpoint. Since `RoleAuthInterceptor` checks request path segments against the logged-in user's role, it correctly blocked the officer (who does not have the `CITIZEN` role).
- **Fix:** 
  1. Created a dedicated endpoint `POST /api/v1/officer/complaints/{id}/comments` on the backend.
  2. Implemented verification in `OfficerService` to check that the officer is assigned to the complaint.
  3. Modified frontend `complaintService.addComment` to dynamically use the `citizen` or `officer` path prefix based on the logged-in user's role.
