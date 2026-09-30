# Security Specification & Test Payloads

## 1. Data Invariants
1. **User Profiles (`/users/{userId}`)**: Only authenticated users can write their own profile document (`request.auth.uid == userId`). Public read is allowed for community social interaction (names, avatars, bios).
2. **Posts (`/posts/{postId}`)**: Any signed-in user can create a post where `incoming().userId == request.auth.uid`. Updates are restricted to either post author (content, media) or other users interacting with `likes`, `savedBy`, and `comments`. Deletion is strictly reserved for the author.
3. **Messages (`/messages/{messageId}`)**: Only the sender (`senderId == request.auth.uid`) can create a message. Read is restricted to the sender or recipient (`senderId == request.auth.uid || receiverId == request.auth.uid`).
4. **Live Sessions (`/liveSessions/{sessionId}`)**: Only the host (`userId == request.auth.uid`) can start, modify or end their live session. Viewers can update viewer counts or reaction state if authenticated.
5. **Notifications (`/notifications/{notificationId}`)**: Only recipient can read or mark as read.

## 2. Dirty Dozen Test Payloads (Designed to Break Identity, Integrity, and State)
1. Spoofed User ID on profile create: `{ id: 'victim123', name: 'Hacker' }` by `attacker` -> PERMISSION_DENIED.
2. Injected 1MB text into post content: `{ content: 'A'.repeat(100000) }` -> PERMISSION_DENIED.
3. Updating another user's post content: `attacker` updating `post.content` authored by `victim` -> PERMISSION_DENIED.
4. Forging senderId in message: `attacker` sending message with `senderId: 'victim'` -> PERMISSION_DENIED.
5. Reading private messages of unrelated users: `attacker` reading message between `userA` and `userB` -> PERMISSION_DENIED.
6. Shadow fields on post creation: `{ extraAdminKey: true }` -> Rejected by schema validation.
7. Modifying immutable field `createdAt` / `timestamp`: Author tries changing timestamp back in time -> PERMISSION_DENIED.
8. Unauthenticated post creation: `request.auth == null` creating post -> PERMISSION_DENIED.
9. Deleting another user's post: `attacker` calling delete on `victim`'s post -> PERMISSION_DENIED.
10. Hijacking live session: `attacker` setting `isActive: false` on `victim`'s live broadcast -> PERMISSION_DENIED.
11. Reading unowned notifications: `attacker` listing notifications for `victim` -> PERMISSION_DENIED.
12. Malformed Document ID: Attempting path traversal or >128 char junk ID -> PERMISSION_DENIED.
