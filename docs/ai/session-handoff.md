# Session Handoff — Phase 12: Notification & Routing Refinement

## Status: COMPLETE ✅

## What Was Accomplished

### Git Branch
Staged, committed, and merged bugfix branch `bugfix/chat-ui-new-badge-refinements` into `master` branch.

### Backend Changes
1. Created new Swagger-annotated PUT endpoint `/api/v1/notifications/read-all` in `NotificationController.java`.
2. Implemented `markAllAsRead(UUID userId)` in `NotificationService.java` to set `isRead = true` for all unread notifications.
3. Added `authorId` property to `ComplaintImageResponse.java` DTO.
4. Updated image mapping logic in `ComplaintService.java`, `OfficerService.java`, and `AdminService.java` to populate `authorId` using the complaint's citizen ID.

### Frontend Changes
1. Refined scroll-and-highlight logic on the "New comment below" click event. It now identifies the latest comment ID, targets the element (`comment-${comment.id}`), calls `.scrollIntoView({ behavior: 'smooth', block: 'center' })`, and applies a temporary 2000ms background highlight (`bg-yellow-100`).
2. Updated "New" comment badge condition to strictly check that the current user is not the author: `comment.authorId !== user?.id`.
3. Restricted the "New" badge to appear only on the last comment in the list: `index === complaint.comments.length - 1`.
4. Added `markAllAsRead` method to `notificationService.js` and exposed it in `NotificationContext.jsx`.
5. Updated notification dropdown styles to use `fixed` mobile positioning (`fixed top-16 right-2 w-[calc(100vw-1rem)] z-50 sm:absolute sm:top-full sm:right-0 sm:w-80 sm:mt-2`).
6. Added "Mark all as read" button at the top header of the dropdown list.
7. Simplified click-to-read behavior: clicking on any list item immediately marks it as read and redirects. Removed the separate checkmark button.
8. Moved details pages Back button into the normal layout flow right above cards, aligning with responsive hidden text classes (`hidden sm:inline`).
9. Changed Back button route action from `navigate(-1)` to explicit role-aware dashboard routes (`/citizen/dashboard` and `/officer/dashboard`).
10. Updated "New" badge conditions to evaluate `img.authorId !== user?.id` for image attachments.

---

## Validation
- Backend Integration & Unit Tests: `mvn test` -> `BUILD SUCCESS` (37 tests run, 0 failures, 0 errors) ✅
- Frontend Production Build: `npm run build` -> Compiled successfully ✅
