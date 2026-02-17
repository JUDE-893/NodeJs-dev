# E2EE Architecture UML Diagrams - Quick Reference

## 📦 Package Contents

This package contains **15 PlantUML diagrams** documenting the complete E2EE messaging architecture:

### 🏗️ Architecture Diagrams (2)
- `component-diagram.puml` - Overall system architecture
- `14-data-model.puml` - Database schema and encryption layers

### 🔄 Sequence Diagrams (13)

**Authentication & Identity (3)**
- `01-signup.puml` - User registration with identity generation
- `02-auth-qr.puml` - Device-to-device identity transfer via QR
- `03-auth-no-device.puml` - Identity reset via email verification

**Group Key Management (2)**
- `04-request-group-key.puml` - Asymmetric group key exchange
- `13-group-key-rotation.puml` - Complete group key rotation with re-encryption

**Membership Operations (3)**
- `05-user-joins.puml` - New member joins and creates token epoch
- `06-member-leaves.puml` - Scheduled token rotation after leave
- `07-member-banned.puml` - Immediate token rotation on ban

**Messaging Operations (5)**
- `08-fetch-conversation.puml` - Load conversation and token versions
- `09-enter-conversation.puml` - Open conversation and decrypt
- `10-display-messages.puml` - Progressive message rendering
- `11-send-message.puml` - Encrypt and send message
- `12-receive-message.puml` - Real-time message receipt and decryption

---

## 🚀 Quick Start

### View Online (Easiest)
1. Go to https://www.plantuml.com/plantuml/uml/
2. Copy any `.puml` file content
3. Paste and view

### Generate Images (Best for Documentation)
```bash
# Install PlantUML (requires Java)
brew install plantuml  # macOS
sudo apt install plantuml  # Linux

# Generate all diagrams as PNG
plantuml *.puml -tpng -o ./images/

# Generate all diagrams as SVG (scalable)
plantuml *.puml -tsvg -o ./images/
```

### VS Code (Best for Development)
1. Install "PlantUML" extension
2. Open `.puml` file
3. `Alt+D` to preview
4. `Ctrl+Shift+P` → "Export Current Diagram"

---

## 📋 Diagram Selection Guide

### "I need to understand..."

| Need | Diagram | File |
|------|---------|------|
| Overall architecture | Component Diagram | `component-diagram.puml` |
| Database design | Data Model | `14-data-model.puml` |
| How signup works | User Signup | `01-signup.puml` |
| Device transfer | QR Transfer | `02-auth-qr.puml` |
| Lost device recovery | No Device Auth | `03-auth-no-device.puml` |
| Group key sharing | Request Group Key | `04-request-group-key.puml` |
| New members | User Joins | `05-user-joins.puml` |
| Members leaving | Member Leaves | `06-member-leaves.puml` |
| Banning users | Member Banned | `07-member-banned.puml` |
| Loading conversations | Fetch Conversation | `08-fetch-conversation.puml` |
| Opening chats | Enter Conversation | `09-enter-conversation.puml` |
| Rendering messages | Display Messages | `10-display-messages.puml` |
| Sending messages | Send Message | `11-send-message.puml` |
| Receiving messages | Receive Message | `12-receive-message.puml` |
| Key rotation | Group Key Rotation | `13-group-key-rotation.puml` |

### "I'm implementing..."

| Task | Required Diagrams | Order |
|------|------------------|-------|
| **Authentication system** | 01, 02, 03 | signup → QR → email recovery |
| **Messaging core** | 08, 09, 11, 12 | fetch → enter → send → receive |
| **Group management** | 04, 05, 06, 07 | key request → join → leave → ban |
| **Key rotation** | 13, 04 | rotation → key redistribution |
| **Database schema** | 14 | data model |
| **Security audit** | component, all sequence | architecture + flows |

### "I'm debugging..."

| Issue | Check Diagram |
|-------|--------------|
| User can't access messages | 08, 04 (authorization flow) |
| Group key distribution fails | 04 (asymmetric exchange) |
| Token versions missing | 08, 06, 07 (token creation) |
| Race conditions on leave | 06 (scheduled rotation) |
| Messages not decrypting | 10, 11, 12 (encryption flow) |
| Memory leaks | 09, 10, 12 (memory storage notes) |
| Vault errors | 08, 13 (Vault interactions) |

---

## 🔐 Security Checklist by Diagram

### Critical Security Properties to Verify

**From `component-diagram.puml`:**
- [ ] All crypto operations CLIENT-SIDE only
- [ ] Server never sees plaintext keys/messages
- [ ] Vault is KV store, not transit decryption service

**From `14-data-model.puml`:**
- [ ] identity_secret NEVER in database
- [ ] group_key NEVER persisted anywhere
- [ ] Decrypted tokens only in memory
- [ ] Decrypted messages only in memory

**From `04-request-group-key.puml`:**
- [ ] Asymmetric encryption (NOT server token)
- [ ] Server only sees public key
- [ ] Server cannot decrypt group_key exchange

**From `08-fetch-conversation.puml`:**
- [ ] Server authorization check (join_date <= create_date)
- [ ] Server never decrypts tokens
- [ ] Client decrypts after receiving

**From `11-send-message.puml`:**
- [ ] Message encrypted client-side
- [ ] Server stores only ciphertext
- [ ] Token never transmitted in plaintext

**From `13-group-key-rotation.puml`:**
- [ ] Re-encryption happens client-side
- [ ] Server never sees plaintext tokens
- [ ] Members use asymmetric exchange for new key

---

## 🎯 Implementation Priority

### Phase 1: Core Messaging (Minimum Viable Product)
```
01-signup.puml          → User registration
08-fetch-conversation.puml → Load data
09-enter-conversation.puml → Open chat
11-send-message.puml    → Send
12-receive-message.puml → Receive
component-diagram.puml  → Architecture reference
14-data-model.puml      → Database setup
```
**Deliverable:** Users can signup, send/receive encrypted messages

### Phase 2: Multi-Device & Groups
```
02-auth-qr.puml         → Device transfer
04-request-group-key.puml → Key sharing
05-user-joins.puml      → Add members
10-display-messages.puml → Better UX
```
**Deliverable:** Multi-device support, group conversations

### Phase 3: Advanced Features
```
03-auth-no-device.puml  → Recovery without device
06-member-leaves.puml   → Scheduled rotation
07-member-banned.puml   → Immediate ban
```
**Deliverable:** Complete membership management

### Phase 4: Security Hardening
```
13-group-key-rotation.puml → Key rotation
All sequence diagrams     → Security audit
```
**Deliverable:** Production-ready security

---

## 📊 Complexity Ratings

| Diagram | Complexity | Implementation Time | Dependencies |
|---------|-----------|---------------------|--------------|
| 01-signup | ⭐ Simple | 1-2 days | Crypto lib |
| 02-auth-qr | ⭐⭐ Medium | 2-3 days | QR lib, crypto |
| 03-auth-no-device | ⭐⭐ Medium | 3-4 days | Email service, DB |
| 04-request-group-key | ⭐⭐⭐ Complex | 5-7 days | Asymmetric crypto, WebSocket |
| 05-user-joins | ⭐⭐ Medium | 2-3 days | Diagram 04 |
| 06-member-leaves | ⭐⭐⭐ Complex | 4-5 days | Cron, Vault, race handling |
| 07-member-banned | ⭐⭐ Medium | 2-3 days | Diagram 06 |
| 08-fetch-conversation | ⭐⭐ Medium | 3-4 days | Vault integration |
| 09-enter-conversation | ⭐ Simple | 1-2 days | Diagram 08 |
| 10-display-messages | ⭐⭐ Medium | 3-4 days | Progressive loading |
| 11-send-message | ⭐ Simple | 1-2 days | WebSocket |
| 12-receive-message | ⭐ Simple | 1-2 days | WebSocket |
| 13-group-key-rotation | ⭐⭐⭐⭐ Very Complex | 7-10 days | All components |
| component-diagram | N/A | Architecture planning | - |
| 14-data-model | ⭐⭐ Medium | 2-3 days | Database setup |

**Total Estimated Implementation:** 8-12 weeks (2-3 developers)

---

## 🧪 Testing Strategy by Diagram

### Unit Tests
```javascript
// From 01-signup.puml
test('generates 256-bit identity secret', () => {
  const secret = generateIdentitySecret();
  expect(secret.length).toBe(32); // 32 bytes = 256 bits
});

// From 11-send-message.puml
test('encrypts message with AES-256-GCM', () => {
  const encrypted = encryptMessage(plaintext, token);
  expect(encrypted.algorithm).toBe('AES-256-GCM');
  expect(encrypted.nonce).toBeDefined();
});
```

### Integration Tests
```javascript
// From 04-request-group-key.puml
test('asymmetric group key exchange', async () => {
  const requester = await requestGroupKey(convId);
  const helper = await provideGroupKey(convId, requesterPubKey);
  
  // Server should not be able to decrypt
  expect(serverCanDecrypt(helper.encryptedKey)).toBe(false);
  
  // Requester should decrypt successfully
  const groupKey = await requester.decrypt(helper.encryptedKey);
  expect(groupKey).toBeDefined();
});

// From 06-member-leaves.puml
test('handles concurrent token creation', async () => {
  const promises = members.map(m => m.createToken(convId));
  const results = await Promise.all(promises);
  
  // Only one should succeed
  const successful = results.filter(r => r.status === 201);
  expect(successful.length).toBe(1);
  
  // Others should get conflict
  const conflicts = results.filter(r => r.status === 409);
  expect(conflicts.length).toBe(members.length - 1);
});
```

### E2E Tests
```javascript
// Complete flow from 01 → 11 → 12
test('end-to-end messaging flow', async () => {
  // 01-signup
  const user1 = await signup('user1@test.com');
  const user2 = await signup('user2@test.com');
  
  // 05-user-joins (both join conversation)
  const conv = await createConversation([user1, user2]);
  
  // 11-send-message
  const message = await user1.sendMessage(conv.id, 'Hello');
  
  // 12-receive-message
  const received = await user2.receiveMessage(message.id);
  
  expect(received.plaintext).toBe('Hello');
  
  // Verify server never saw plaintext
  expect(serverHasPlaintext(message.id)).toBe(false);
});
```

---

## 🔧 Development Tools

### Recommended Libraries

**Client-Side Crypto:**
```javascript
// Asymmetric (from 04-request-group-key.puml)
import nacl from 'tweetnacl';
import { generateKeyPair, box, boxOpen } from '@noble/curves/ed25519';

// Symmetric (from 11-send-message.puml)
import { encrypt, decrypt } from '@noble/ciphers/aes-gcm';

// Key derivation
import { argon2id } from '@noble/hashes/argon2';
```

**Server-Side:**
```javascript
// Vault client
import vault from 'node-vault';

// WebSocket
import { Server } from 'socket.io';

// Queue
import Bull from 'bull'; // For rotation_queue
```

---

## 📝 Documentation Links

- **Full Documentation:** `UML_DIAGRAMS_DOCUMENTATION.md`
- **Security Review:** `Updated_E2EE_Architecture_Review.md`
- **PlantUML Official:** https://plantuml.com/
- **PlantUML Cheat Sheet:** https://plantuml.com/sequence-diagram

---

## ❓ FAQ

**Q: Which diagram should I start with?**
A: Start with `component-diagram.puml` for overall architecture, then `14-data-model.puml` for database design.

**Q: Are these diagrams complete?**
A: Yes, they cover every workflow marked with "##" in your architecture document.

**Q: Can I modify the diagrams?**
A: Absolutely! They're PlantUML text files - edit and regenerate.

**Q: How do I convert to PDF/PNG?**
A: Use `plantuml *.puml -tpng` or online converters.

**Q: What if I find an issue?**
A: Check the corresponding section in `UML_DIAGRAMS_DOCUMENTATION.md` for detailed explanations.

**Q: Which diagram shows the E2EE proof?**
A: `04-request-group-key.puml` shows the critical asymmetric exchange. `component-diagram.puml` shows server cannot decrypt.

---

## ✅ Validation Checklist

Before implementation, verify:

- [ ] Read `component-diagram.puml` - understand architecture
- [ ] Read `14-data-model.puml` - understand data storage
- [ ] Review Phase 1 diagrams (01, 08, 09, 11, 12)
- [ ] Understand asymmetric exchange (04)
- [ ] Understand authorization (08 - join_date check)
- [ ] Understand memory-only storage (all diagrams)
- [ ] Team reviewed all security properties
- [ ] Development environment set up
- [ ] Test cases written based on diagrams
- [ ] Vault properly configured (KV, not transit)

---

**Last Updated:** February 6, 2026
**Architecture Version:** 2.0 (E2EE Corrected)
**Total Diagrams:** 15
