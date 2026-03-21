# Content Service - R1 API Testing Checklist

## 🎯 Seed Data
```
CONTENT_PROVIDER:
- contentprovider1@apsas / SecurePassword123!
- contentprovider2@apsas / SecurePassword123!

INSTRUCTOR:
- instructor1@apsas / SecurePassword123!
- instructor2@apsas / SecurePassword123!
- instructor3@apsas / SecurePassword123!
```

## ✅ Testing (20 APIs)

### 🔐 Authentication (2)
- [ ] Login Content Provider 1 → 200 + token
- [ ] Login Instructor 1 → 200 + token

### 🎯 Skills (5)
- [ ] GET /api/v1/skills → 200
- [ ] POST /api/v1/skills → 201
- [ ] GET /api/v1/skills/{id} → 200
- [ ] PATCH /api/v1/skills/{id} → 200
- [ ] DELETE /api/v1/skills/{id} → 204

### 📚 Tutorials (5)
- [ ] GET /api/v1/tutorials → 200
- [ ] POST /api/v1/tutorials → 201
- [ ] GET /api/v1/tutorials/{id} → 200
- [ ] PATCH /api/v1/tutorials/{id} → 200
- [ ] DELETE /api/v1/tutorials/{id} → 204

### 📝 Assignments (8)
- [ ] GET /api/v1/assignments → 200
- [ ] POST /api/v1/assignments → 201
- [ ] GET /api/v1/assignments/{id} → 200
- [ ] PATCH /api/v1/assignments/{id} → 200
- [ ] POST /archive → 200
- [ ] POST /publish → 200
- [ ] PATCH /schedule (INSTRUCTOR) → 200
- [ ] DELETE → 204

### ⚠️ Error Cases
- [ ] 401 Unauthorized
- [ ] 403 Forbidden
- [ ] 404 Not Found
- [ ] 400 Bad Request

---

## 🚀 Start
1. Import HTTP files → Insomnia
2. Login (seed data)
3. Test 20 APIs
4. Mark ✅/❌

