# E2EE Messaging Architecture - UML Diagrams Documentation

## Overview

This document contains comprehensive UML diagrams for the End-to-End Encrypted (E2EE) messaging architecture. The diagrams are organized into:

1. **Component Diagram** - Overall system architecture
2. **Data Model Diagram** - Database schema and relationships
3. **Sequence Diagrams** - Detailed workflows for each feature (13 diagrams)

---

## How to View the Diagrams

### Option 1: Online PlantUML Viewers
1. Visit [PlantUML Web Server](https://www.plantuml.com/plantuml/uml/)
2. Copy the content of any `.puml` file
3. Paste into the editor
4. View the rendered diagram

### Option 2: VS Code Extension
1. Install "PlantUML" extension by jebbs
2. Open any `.puml` file
3. Press `Alt+D` to preview

### Option 3: Command Line
```bash
# Install PlantUML (requires Java)
npm install -g node-plantuml

# Generate PNG images
for file in *.puml; do
    puml generate "$file" -o diagrams/
done
```

---

## Diagram Index

### Component Architecture

#### `component-diagram.puml` - System Components
**Purpose:** Shows the overall architecture with all major components and their relationships.

**Key Components:**
- **Client Application Layer:**
  - User Interface
  - Crypto Layer (all encryption operations)
  - Device Storage (identity_secret, keys)
  - Memory Store (decrypted data)
  
- **Server Infrastructure:**
  - REST API (authentication, messages, conversations)
  - Application Database (encrypted data only)
  - Notification Service (WebSocket)
  
- **HashiCorp Vault:**
  - KV Secrets Engine (token versions storage)
  - Server Secrets (operational keys)

**Security Highlights:**
- All cryptographic operations happen CLIENT-SIDE
- Server never sees plaintext keys or messages
- Vault stores only client-encrypted blobs

---

### Data Model

#### `14-data-model.puml` - Database Schema
**Purpose:** Complete data model showing all entities, relationships, and encryption layers.

**Key Entities:**

**Application Database:**
- `users` - User accounts (NO identity_secret stored)
- `conversations` - Conversation metadata
- `conversation_members` - Member list with encrypted member_keys
- `messages` - Encrypted message content
- `rotation_queue` - Scheduled token rotations

**Vault Storage:**
- `vault_token_versions` - Encrypted token versions (KV store)
- `vault_user_backups` - Optional identity_secret backups

**Client-Side Storage:**
- `device_storage` - identity_secret, temp key pairs
- `browser_localstorage` - Encrypted tokens and member_keys
- `memory_cache` - Decrypted data (RAM only)

**Encryption Chain:**
```
identity_secret (device)
  ↓ decrypt
member_key (database)
  ↓ decrypt
group_key (memory only)
  ↓ decrypt
encrypted_token (Vault)
  ↓ decrypt
token (memory only)
  ↓ decrypt
encrypted_message (database)
  ↓ decrypt
plaintext (memory only)
```

**Critical Security Properties:**
- Server sees: `member_key`, `encrypted_token`, `encrypted_message`
- Server CANNOT decrypt any layer
- Plaintext exists ONLY in client memory

---

### Sequence Diagrams - User Workflows

#### `01-signup.puml` - User Signup
**Flow:** User registration with client-side identity_secret generation

**Steps:**
1. User registers with email/password
2. Server creates account
3. Client generates `identity_secret` (256-bit CSPRNG)
4. `identity_secret` stored on device
5. NEVER transmitted to server

**Security:** Identity secret is client-generated and never leaves the device.

---

#### `02-auth-qr.puml` - Authentication with QR Code
**Flow:** User logs in from new device using QR code transfer

**Steps:**
1. New device login (email/password)
2. No `identity_secret` found locally
3. User selects "Use another device"
4. Old device generates QR code containing `identity_secret`
5. New device scans QR code
6. `identity_secret` transferred offline
7. No server involvement in transfer

**Security:** Transfer happens via QR code (offline), server never involved.

---

#### `03-auth-no-device.puml` - Authentication Without Other Device
**Flow:** User has no other device available - generates new identity_secret

**Steps:**
1. User selects "No device available"
2. Server sends verification email
3. User clicks verification link
4. Server sets all `member_key`s to NULL
5. Client generates NEW `identity_secret`
6. User must request group keys from online members

**Security:** 
- New identity secret generated
- All conversations locked until group keys retrieved
- Email verification required

**Trade-off:** User locked out until another member comes online.

---

#### `04-request-group-key.puml` - Request Group Key After Identity Reset
**Flow:** User with NULL member_key requests group_key from online member

**Steps:**
1. Client generates ephemeral key pair (X25519)
2. Sends `publicKey` to server (keeps `privateKey` secret)
3. Server notifies online helper (preferring admin)
4. Helper encrypts `group_key` with requester's `publicKey`
5. Server forwards encrypted blob (CANNOT decrypt)
6. Requester decrypts with `privateKey`
7. Requester generates `member_key` and submits to server
8. Temporary key pair discarded

**Security:** 
- Asymmetric encryption prevents server decryption
- Server only sees public key and encrypted blob
- Server never has access to `group_key`

**Critical Fix:** This replaced the server-generated authorization token approach.

---

#### `05-user-joins.puml` - New Member Joins Conversation
**Flow:** New user joins conversation and creates new token epoch

**Steps:**
1. Server adds member with `member_key` = NULL
2. Member follows same group key request flow (diagram 04)
3. Member receives `group_key`
4. Member generates new `token` (new epoch after join)
5. Member encrypts `token` with `group_key`
6. Submits encrypted `token` and `member_key` to server
7. Server stores in Vault and updates conversation

**Security:**
- New epoch created after each join
- Member cannot access messages before `join_date`
- Server authorization enforces `join_date <= token.create_date`

---

#### `06-member-leaves.puml` - Member Leaves (Scheduled)
**Flow:** Member leaves, token rotation scheduled to avoid race conditions

**Steps:**
1. Member removed from conversation
2. Server queues token rotation (scheduled for 5 minutes)
3. Leaver clears all local data
4. Cron job triggers at scheduled time
5. Server notifies ALL online members
6. Multiple members may generate tokens (race condition)
7. FIRST member to upload to Vault wins
8. Vault rejects duplicates (prevents malicious alteration)
9. Server updates conversation with new token version

**Security:**
- Leaver cannot decrypt future messages
- Batched rotation reduces overhead
- Vault uniqueness constraint prevents tampering

**Race Condition Handling:** First response accepted, others rejected.

---

#### `07-member-banned.puml` - Admin Bans Member
**Flow:** Admin immediately bans member and creates new token

**Steps:**
1. Admin requests member ban
2. Server removes member immediately
3. Admin generates new token (NO scheduling)
4. Server stores in Vault
5. Server invalidates cache for all members
6. Other members re-fetch conversation data

**Security:**
- Immediate security (no 5-minute wait)
- No scheduled queue for urgent actions
- Banned member cut off instantly

**Difference from regular leave:** No scheduled rotation, admin creates token immediately.

---

#### `08-fetch-conversation.puml` - Fetch Conversation Data
**Flow:** User fetches conversation and token versions

**Steps:**
1. Client requests conversation metadata
2. Server returns `latest_token_version` name
3. Client checks localStorage for token
4. If not found, requests from server
5. Server checks authorization: `join_date <= token.create_date`
6. Server fetches from Vault (still encrypted)
7. Server forwards encrypted blob to client
8. Client decrypts with `group_key`
9. Client stores decrypted token in memory

**Security:**
- Server performs authorization check
- Server never decrypts token
- Decrypted token exists only in memory

**Storage Hierarchy:**
1. Memory (fastest)
2. localStorage (fast)
3. Server fetch (slowest)

---

#### `09-enter-conversation.puml` - Enter Conversation
**Flow:** User opens conversation and prepares for messaging

**Steps:**
1. Fetch conversation metadata
2. Check localStorage for latest token
3. Decrypt `member_key` with `identity_secret` → `group_key`
4. Decrypt `encrypted_token` with `group_key` → `token`
5. Store `token` and `group_key` in memory
6. Ready to read/send messages

**Security:**
- All decryption happens client-side
- `group_key` and `token` exist only in memory
- Cleared on logout or conversation exit

---

#### `10-display-messages.puml` - Display Messages
**Flow:** Rendering messages with progressive token loading

**Steps:**
1. Loop through messages in view
2. For each message, get `token_version`
3. Check memory cache → localStorage → server (in order)
4. If not in memory/localStorage, show spinner
5. Fetch from server if needed
6. Decrypt token with `group_key`
7. Decrypt message with `token`
8. Render plaintext

**UX Considerations:**
- Recent messages use cached latest token (instant)
- Scrolling to old messages may trigger fetches (spinner shown)
- Progressive loading prevents UI blocking

**Security:** Authorization check prevents access to tokens before `join_date`.

---

#### `11-send-message.puml` - Send Message
**Flow:** Encrypt and send message

**Steps:**
1. User types message
2. Get latest `token` from memory (already loaded)
3. Encrypt message with `token` (AES-256-GCM)
4. Send `encrypted_content` + `token_version` to server
5. Server stores encrypted content (cannot decrypt)
6. Server broadcasts via WebSocket to members
7. Client caches plaintext in memory for display

**Security:**
- Message encrypted client-side
- Server only sees ciphertext
- Only members with `token` can decrypt

---

#### `12-receive-message.puml` - Receive Message
**Flow:** Real-time message delivery and decryption

**Steps:**
1. WebSocket delivers message notification
2. Client receives: `{encrypted_content, token_version}`
3. Get `token` from memory cache
4. If token not in memory, fetch it (rare)
5. Decrypt message with `token`
6. Cache decrypted message in memory (NOT persistent)
7. Update UI with plaintext

**Security:**
- Decrypted message stored only in memory
- Cleared on logout/browser close
- Server transmitted only ciphertext

---

#### `13-group-key-rotation.puml` - Group Key Rotation
**Flow:** Admin rotates group_key and re-encrypts all tokens

**Steps:**
1. Admin triggers rotation (explicit or implicit)
2. Admin generates new `group_key`
3. Admin fetches ALL token versions from server
4. Admin decrypts all tokens with old `group_key`
5. Admin re-encrypts all tokens with new `group_key`
6. Admin uploads re-encrypted tokens to Vault
7. Server sets all `member_key`s to NULL (except admin)
8. Server notifies all members
9. Members request new `group_key` via asymmetric exchange
10. Members generate new `member_key` and submit

**Security Properties:**
✅ Old `group_key` compromised → still secure after rotation
✅ All historical messages protected by new key

**Trade-offs:**
⚠️ High overhead (decrypt + re-encrypt all tokens)
⚠️ Admin temporarily has all tokens in plaintext
⚠️ Members locked out until they get new `group_key`
⚠️ Requires all members to be online or wait

**Alternative Approach (Not Implemented):**
Version-based rotation where old tokens stay encrypted with old `group_key`, new tokens use new `group_key`. This would eliminate re-encryption overhead but add version management complexity.

---

## Security Summary

### E2EE Properties Maintained

✅ **Client-Side Encryption:** All cryptographic operations on client
✅ **Zero Knowledge Server:** Server cannot decrypt any user data
✅ **Asymmetric Key Exchange:** Group key distribution via public key crypto
✅ **Memory-Only Plaintext:** Sensitive data never persisted decrypted
✅ **Forward Secrecy:** New tokens after member changes prevent decryption of future messages
✅ **Vault as KV Store:** Vault stores client-encrypted blobs without decryption capability

### Critical Security Flows

**Identity Secret:**
- Generated client-side (CSPRNG)
- NEVER transmitted to server
- Transferred between devices via QR code (offline)
- Optional email recovery with trade-offs

**Group Key Distribution:**
- Uses asymmetric encryption (X25519/ECIES)
- Server relays encrypted blob
- Only recipient can decrypt with private key
- Server has zero access to plaintext

**Token Storage:**
- Encrypted with group_key before upload to Vault
- Vault stores opaque blobs
- Server cannot decrypt when retrieving
- Client decrypts after receiving

**Message Encryption:**
- Client encrypts with token (AES-256-GCM)
- Server stores ciphertext only
- Only members with token can decrypt
- Real-time delivery via WebSocket (encrypted in transit)

---

## Implementation Checklist

Based on these diagrams, here's what needs to be implemented:

### Client-Side (Browser/Mobile App)

- [ ] **Crypto Layer**
  - [ ] Identity secret generation (CSPRNG, 256-bit)
  - [ ] Group key encryption/decryption
  - [ ] Token encryption/decryption
  - [ ] Message encryption/decryption (AES-256-GCM)
  - [ ] Asymmetric key pair generation (X25519)
  - [ ] Asymmetric encryption (ECIES/NaCl Box)

- [ ] **Storage Management**
  - [ ] Device storage for identity_secret (secure)
  - [ ] localStorage for encrypted tokens/member_keys
  - [ ] Memory cache for decrypted data (cleared on logout)
  - [ ] Cache invalidation on rotation

- [ ] **UI Components**
  - [ ] QR code generation/scanning
  - [ ] Message loading spinners
  - [ ] Group key request flows
  - [ ] Cache invalidation handling

### Server-Side (REST API)

- [ ] **Authentication Service**
  - [ ] User registration
  - [ ] Login
  - [ ] Session management
  - [ ] Email verification for identity reset

- [ ] **Conversation Service**
  - [ ] Create conversation
  - [ ] Add/remove members
  - [ ] Group key request coordination
  - [ ] Member_key updates

- [ ] **Message Service**
  - [ ] Store encrypted messages
  - [ ] Retrieve message history
  - [ ] WebSocket delivery

- [ ] **Token Service**
  - [ ] Token version CRUD via Vault
  - [ ] Authorization checks (join_date <= create_date)
  - [ ] Scheduled rotation queue

- [ ] **Vault Integration**
  - [ ] KV storage for token versions
  - [ ] Batch operations for rotation
  - [ ] Uniqueness constraints

### Database

- [ ] **Schema Implementation**
  - [ ] users table
  - [ ] conversations table
  - [ ] conversation_members table
  - [ ] messages table
  - [ ] rotation_queue table

- [ ] **Indexes**
  - [ ] conversation_id + user_id (members)
  - [ ] conversation_id + timestamp (messages)
  - [ ] scheduled_at (rotation_queue)

### HashiCorp Vault

- [ ] **KV Configuration**
  - [ ] Enable KV v2 engine
  - [ ] Configure paths: conversations/{id}/versions/{ver}
  - [ ] Set up access policies

- [ ] **Server Secrets**
  - [ ] Database credentials
  - [ ] API keys
  - [ ] Session secrets

---

## Testing Scenarios

Use these diagrams to create test cases:

### E2EE Verification Tests

1. **Server Cannot Decrypt Test**
   - Intercept all server-client communication
   - Verify server never receives plaintext keys/messages
   - Verify Vault transit engine NOT used for message keys

2. **Group Key Exchange Test**
   - Simulate man-in-the-middle
   - Verify asymmetric encryption prevents server decryption
   - Verify temporary keys discarded after use

3. **Token Authorization Test**
   - User joins at time T1
   - Attempt to access token created at T0 (before join)
   - Verify 403 Forbidden
   - Verify access to tokens created at T2 (after join)

4. **Memory-Only Plaintext Test**
   - Inspect browser localStorage/IndexedDB
   - Verify no plaintext tokens or messages
   - Verify decrypted data only in memory
   - Verify cleared on logout

5. **Rotation Security Test**
   - Rotate group_key
   - Attempt to decrypt new tokens with old group_key
   - Verify failure
   - Verify all tokens decryptable with new group_key

### Race Condition Tests

1. **Concurrent Token Creation**
   - Multiple members create tokens simultaneously
   - Verify Vault uniqueness constraint
   - Verify first wins, others rejected

2. **Concurrent Member_Key Updates**
   - Multiple devices update member_key
   - Verify database constraints
   - Verify eventual consistency

### Edge Cases

1. **No Online Members**
   - User loses identity_secret
   - All members offline
   - Verify lockout state
   - Verify recovery when member comes online

2. **Partial Rotation Failure**
   - Start group_key rotation
   - Simulate network failure midway
   - Verify rollback or completion
   - Verify no corruption

---

## Diagram Relationships

### Component Diagram Dependencies
```
Component Diagram
  ├── Shows overall structure
  └── Referenced by all sequence diagrams

Data Model
  ├── Shows data structures
  └── Referenced by all CRUD operations in sequences

Sequence Diagrams
  ├── 01-signup → Creates user in Data Model
  ├── 02-auth-qr → Transfers identity_secret
  ├── 03-auth-no-device → Sets member_keys to NULL
  ├── 04-request-group-key → Uses asymmetric crypto from Component
  ├── 05-user-joins → Follows 04 + creates token
  ├── 06-member-leaves → Uses rotation_queue from Data Model
  ├── 07-member-banned → Similar to 06 but immediate
  ├── 08-fetch-conversation → Uses Vault from Component
  ├── 09-enter-conversation → Follows 08 with decryption
  ├── 10-display-messages → Loops 08 for multiple tokens
  ├── 11-send-message → Uses crypto from Component
  ├── 12-receive-message → Inverse of 11
  └── 13-group-key-rotation → Complex flow touching all components
```

---

## Glossary

**identity_secret:** 256-bit key generated client-side, never leaves device, used to encrypt/decrypt member_keys

**group_key:** Symmetric key shared among conversation members, exists only in memory, used to encrypt/decrypt tokens

**member_key:** Encrypted copy of group_key using user's identity_secret, stored in database, unique per user per conversation

**token / token version:** Symmetric key used to encrypt/decrypt actual messages, encrypted with group_key before storage in Vault

**Vault KV:** Key-Value storage in HashiCorp Vault, stores client-encrypted blobs, cannot decrypt them

**Vault Transit:** Encryption-as-a-service in Vault, used ONLY for server operational secrets, NOT for user message keys

**Asymmetric key exchange:** Using public-key cryptography (X25519/ECIES) to share group_key without server being able to decrypt

**Memory-only storage:** Sensitive data (plaintext tokens, group keys, messages) stored only in RAM, cleared on logout/close

---

## Next Steps

1. **Review diagrams with team**
   - Security team: Verify E2EE properties
   - Backend team: Implement server flows
   - Frontend team: Implement client flows
   - DevOps: Set up Vault infrastructure

2. **Create implementation timeline**
   - Phase 1: Core E2EE (diagrams 01, 08, 09, 11, 12)
   - Phase 2: Group management (04, 05, 06, 07)
   - Phase 3: Key rotation (13)
   - Phase 4: Device management (02, 03)

3. **Set up testing environment**
   - Use diagrams to create test scenarios
   - Implement E2EE verification tests
   - Security audit before production

---

## Questions & Support

If you have questions about any diagram:

1. Reference the diagram number (e.g., "In diagram 04...")
2. Specify the step or component
3. Describe the concern

Common questions answered in diagrams:
- "How does server not see keys?" → See component-diagram.puml
- "What if user loses device?" → See 03-auth-no-device.puml
- "How are messages encrypted?" → See 11-send-message.puml
- "Where is sensitive data stored?" → See 14-data-model.puml
