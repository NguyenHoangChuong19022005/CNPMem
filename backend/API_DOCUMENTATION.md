# Backend API Documentation

## Authentication Endpoints

### 1. Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "student123",
  "password": "password123",
  "email": "student@example.com",
  "fullName": "Nguyen Van A"
}

Response (201):
{
  "message": "Đăng ký tài khoản thành công!"
}
```

### 2. Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "student123",
  "password": "password123"
}

Response (200):
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer"
}
```

---

## User Profile Endpoints

### 3. Get Current User Profile (Requires Token)
```
GET /api/users/profile
Authorization: Bearer <accessToken>

Response (200):
{
  "id": 1,
  "username": "student123",
  "email": "student@example.com",
  "fullName": "Nguyen Van A",
  "role": "ROLE_STUDENT",
  "password": null
}
```

### 4. Update User Profile (Requires Token)
```
PUT /api/users/profile
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "fullName": "Nguyen Van A New",
  "email": "newemail@example.com"
}

Response (200):
{
  "message": "Cập nhật profile thành công!",
  "user": {
    "id": 1,
    "username": "student123",
    "email": "newemail@example.com",
    "fullName": "Nguyen Van A New",
    "role": "ROLE_STUDENT",
    "password": null
  }
}
```

### 5. Change Password (Requires Token)
```
PUT /api/users/change-password
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "oldPassword": "password123",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}

Response (200):
{
  "message": "Đổi mật khẩu thành công!"
}
```

### 6. Get All Users (Public - No Token Required)
```
GET /api/users/list

Response (200):
{
  "total": 5,
  "users": [
    {
      "id": 1,
      "username": "student123",
      "fullName": "Nguyen Van A",
      "email": "student@example.com",
      "role": "ROLE_STUDENT"
    },
    ...
  ]
}
```

### 7. Get User by ID (Public - No Token Required)
```
GET /api/users/{id}

Response (200):
{
  "id": 1,
  "username": "student123",
  "email": "student@example.com",
  "fullName": "Nguyen Van A",
  "role": "ROLE_STUDENT",
  "password": null
}
```

### 8. Delete User Profile (Requires Token)
```
DELETE /api/users/profile
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Tài khoản đã bị xóa vĩnh viễn!"
}
```

---

## Error Responses

### Unauthorized (401)
```
{
  "error": "Mật khẩu nhập vào không chính xác!"
}
```

### Bad Request (400)
```
{
  "error": "Tên tài khoản này đã tồn tại!"
}
```

### Not Found (404)
```
{
  "message": "Không tìm thấy thông tin thành viên"
}
```

---

## Skill Assessment Endpoints

### 9. Create New Skill (Admin)
```
POST /api/skills
Content-Type: application/json

{
  "name": "Java",
  "description": "Java programming language",
  "category": "Backend",
  "proficiencyLevel": 3
}

Response (200):
{
  "message": "Kỹ năng được tạo thành công!",
  "skill": {
    "id": 1,
    "name": "Java",
    "description": "Java programming language",
    "category": "Backend",
    "proficiencyLevel": 3,
    "createdAt": "2026-06-01T10:00:00"
  }
}
```

### 10. Get All Skills
```
GET /api/skills

Response (200):
{
  "total": 10,
  "skills": [
    {
      "id": 1,
      "name": "Java",
      "description": "Java programming language",
      "category": "Backend",
      "proficiencyLevel": 3,
      "createdAt": "2026-06-01T10:00:00"
    },
    ...
  ]
}
```

### 11. Get Skills by Category
```
GET /api/skills/category/{category}
Example: GET /api/skills/category/Frontend

Response (200):
{
  "category": "Frontend",
  "total": 5,
  "skills": [...]
}
```

### 12. Get Skill by ID
```
GET /api/skills/{id}

Response (200):
{
  "id": 1,
  "name": "Java",
  "description": "Java programming language",
  "category": "Backend",
  "proficiencyLevel": 3,
  "createdAt": "2026-06-01T10:00:00"
}
```

### 13. Update Skill
```
PUT /api/skills/{id}
Content-Type: application/json

{
  "proficiencyLevel": 4,
  "description": "Advanced Java programming"
}

Response (200):
{
  "message": "Cập nhật kỹ năng thành công!",
  "skill": {...}
}
```

### 14. Delete Skill
```
DELETE /api/skills/{id}

Response (200):
{
  "message": "Xóa kỹ năng thành công!"
}
```

### 15. Get My Skill Assessments (Requires Token)
```
GET /api/skills/assessments/my-assessments
Authorization: Bearer <accessToken>

Response (200):
{
  "total": 3,
  "assessments": [
    {
      "id": 1,
      "skill": "Java",
      "score": 85,
      "proficiencyLevel": 4,
      "status": "COMPLETED",
      "feedback": "Good progress",
      "assessedAt": "2026-06-01T10:30:00",
      "updatedAt": "2026-06-01T10:30:00"
    },
    ...
  ]
}
```

### 16. Submit New Skill Assessment (Requires Token)
```
POST /api/skills/assessments
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "skillId": 1,
  "score": 85,
  "proficiencyLevel": 4,
  "feedback": "Good understanding of core concepts"
}

Response (200):
{
  "message": "Gửi đánh giá thành công!",
  "assessment": {
    "id": 1,
    "user": {...},
    "skill": {...},
    "score": 85,
    "proficiencyLevel": 4,
    "feedback": "Good understanding of core concepts",
    "status": "COMPLETED",
    "assessedAt": "2026-06-01T10:30:00",
    "createdAt": "2026-06-01T10:30:00",
    "updatedAt": "2026-06-01T10:30:00"
  }
}
```

### 17. Update Skill Assessment (Requires Token)
```
PUT /api/skills/assessments/{id}
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "score": 90,
  "proficiencyLevel": 5,
  "feedback": "Excellent mastery"
}

Response (200):
{
  "message": "Cập nhật đánh giá thành công!",
  "assessment": {...}
}
```

### 18. Get Assessment by ID (Requires Token)
```
GET /api/skills/assessments/{id}
Authorization: Bearer <accessToken>

Response (200):
{
  "id": 1,
  "user": {...},
  "skill": {...},
  "score": 85,
  "proficiencyLevel": 4,
  "feedback": "Good understanding",
  "status": "COMPLETED",
  "assessedAt": "2026-06-01T10:30:00",
  "createdAt": "2026-06-01T10:30:00",
  "updatedAt": "2026-06-01T10:30:00"
}
```

### 19. Delete Assessment (Requires Token)
```
DELETE /api/skills/assessments/{id}
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Xóa đánh giá thành công!"
}
```

### 20. Get Skill Summary (Requires Token)
```
GET /api/skills/assessments/summary
Authorization: Bearer <accessToken>

Response (200):
{
  "totalAssessments": 5,
  "averageScore": 84.5,
  "categoryBreakdown": {
    "Backend": 3,
    "Frontend": 2
  },
  "assessments": [
    {
      "skill": "Java",
      "score": 85,
      "proficiency": 4
    },
    ...
  ]
}
```

### 21. Get Assessments by Status (Requires Token)
```
GET /api/skills/assessments/status/{status}
Authorization: Bearer <accessToken>
Example: GET /api/skills/assessments/status/COMPLETED

Response (200):
{
  "status": "COMPLETED",
  "total": 3,
  "assessments": [...]
}
```

---

## Assessment Status Values

- `PENDING` - Assessment not yet started
- `IN_PROGRESS` - Assessment is being conducted
- `COMPLETED` - Assessment is finished

## Proficiency Levels

- `1` - Beginner
- `2` - Elementary
- `3` - Intermediate
- `4` - Advanced
- `5` - Expert

---

## Career Recommendation Endpoints

### 22. Create New Career
```
POST /api/careers
Content-Type: application/json

{
  "title": "Backend Developer",
  "description": "Develop server-side applications",
  "responsibilities": "Design APIs, database schemas, manage servers",
  "requirements": "Experience with Java, Spring Boot, databases",
  "seniority": "MID_LEVEL",
  "salaryRange": "$70k-$90k",
  "experienceYearsRequired": 3
}

Response (200):
{
  "message": "Công việc được tạo thành công!",
  "career": {
    "id": 1,
    "title": "Backend Developer",
    "description": "Develop server-side applications",
    "seniority": "MID_LEVEL",
    "salaryRange": "$70k-$90k",
    "experienceYearsRequired": 3,
    "createdAt": "2026-06-01T10:00:00"
  }
}
```

### 23. Get All Careers
```
GET /api/careers

Response (200):
{
  "total": 10,
  "careers": [
    {
      "id": 1,
      "title": "Backend Developer",
      "description": "Develop server-side applications",
      "seniority": "MID_LEVEL",
      "salaryRange": "$70k-$90k",
      "experienceYearsRequired": 3,
      "createdAt": "2026-06-01T10:00:00"
    },
    ...
  ]
}
```

### 24. Get Careers by Seniority Level
```
GET /api/careers/seniority/{seniority}
Example: GET /api/careers/seniority/ENTRY_LEVEL

Response (200):
{
  "seniority": "ENTRY_LEVEL",
  "total": 5,
  "careers": [...]
}
```

### 25. Get Career by ID
```
GET /api/careers/{id}

Response (200):
{
  "id": 1,
  "title": "Backend Developer",
  "description": "Develop server-side applications",
  "responsibilities": "Design APIs, database schemas, manage servers",
  "requirements": "Experience with Java, Spring Boot, databases",
  "seniority": "MID_LEVEL",
  "salaryRange": "$70k-$90k",
  "experienceYearsRequired": 3,
  "createdAt": "2026-06-01T10:00:00"
}
```

### 26. Update Career
```
PUT /api/careers/{id}
Content-Type: application/json

{
  "salaryRange": "$75k-$95k",
  "seniority": "SENIOR"
}

Response (200):
{
  "message": "Cập nhật công việc thành công!",
  "career": {...}
}
```

### 27. Delete Career
```
DELETE /api/careers/{id}

Response (200):
{
  "message": "Xóa công việc thành công!"
}
```

### 28. Add Skill Requirement to Career
```
POST /api/careers/{careerId}/requirements
Content-Type: application/json

{
  "skillId": 1,
  "minProficiencyLevel": 4,
  "mandatory": true
}

Response (200):
{
  "message": "Thêm yêu cầu thành công!",
  "requirement": {
    "id": 1,
    "career": {...},
    "skill": {...},
    "minProficiencyLevel": 4,
    "mandatory": true
  }
}
```

### 29. Get Career Requirements
```
GET /api/careers/{careerId}/requirements

Response (200):
{
  "careerId": 1,
  "total": 5,
  "requirements": [
    {
      "id": 1,
      "skill": "Java",
      "minProficiencyLevel": 4,
      "mandatory": true
    },
    ...
  ]
}
```

### 30. Generate Career Recommendations (Requires Token)
```
POST /api/careers/recommendations/generate
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Tạo khuyến nghị thành công!",
  "total": 3,
  "recommendations": [
    {
      "id": 1,
      "career": "Backend Developer",
      "matchScore": 85,
      "strength": "HIGH",
      "matchedSkills": "Java, Spring Boot, SQL",
      "skillsToImprove": "Docker (current: 2, required: 3), Kubernetes (optional)"
    },
    {
      "id": 2,
      "career": "Full-Stack Developer",
      "matchScore": 72,
      "strength": "MEDIUM",
      "matchedSkills": "Java, React",
      "skillsToImprove": "Node.js (current: 1, required: 3), DevOps (optional)"
    },
    ...
  ]
}
```

### 31. Get My Career Recommendations (Requires Token)
```
GET /api/careers/recommendations/my-recommendations
Authorization: Bearer <accessToken>

Response (200):
{
  "total": 3,
  "recommendations": [
    {
      "id": 1,
      "career": "Backend Developer",
      "careerDescription": "Develop server-side applications",
      "matchScore": 85,
      "strength": "HIGH",
      "analysis": "Bạn phù hợp với công việc Backend Developer. Bạn đã có 5/5 kỹ năng cần thiết.",
      "matchedSkills": "Java, Spring Boot, SQL, REST APIs, Microservices",
      "skillsToImprove": "Docker (current: 2, required: 3), Kubernetes (optional)",
      "salaryRange": "$70k-$90k",
      "seniority": "MID_LEVEL"
    },
    ...
  ]
}
```

### 32. Get Specific Recommendation
```
GET /api/careers/recommendations/{id}
Authorization: Bearer <accessToken>

Response (200):
{
  "id": 1,
  "career": {
    "id": 1,
    "title": "Backend Developer",
    ...
  },
  "matchScore": 85,
  "strength": "HIGH",
  "analysis": "Bạn phù hợp với công việc Backend Developer...",
  "matchedSkills": "Java, Spring Boot, SQL, REST APIs, Microservices",
  "skillsToImprove": "Docker, Kubernetes",
  "status": "ACTIVE"
}
```

### 33. Archive Career Recommendation
```
PUT /api/careers/recommendations/{id}/archive
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Lưu trữ khuyến nghị thành công!"
}
```

---

## Career Seniority Levels

- `ENTRY_LEVEL` - 0-2 years experience
- `MID_LEVEL` - 3-5 years experience
- `SENIOR` - 5+ years experience

## Recommendation Strength

- `HIGH` - Match score 80+
- `MEDIUM` - Match score 50-79
- `LOW` - Match score below 50

## Recommendation Status

- `ACTIVE` - Currently active recommendation
- `ARCHIVED` - Archived by user

## Recommendation Algorithm

The recommendation engine:
1. Analyzes all of the user's skill assessments
2. Compares against requirements for each career
3. Mandatory skills must be at or above required proficiency level
4. Optional skills are counted as bonus points
5. Calculates match score as (matched_skills / total_required_skills) * 100
6. Returns careers sorted by match score (highest first)
7. Includes detailed analysis of matched and needed skills

---

## Token Format

All authenticated endpoints require an Authorization header:
```
Authorization: Bearer <your_access_token>
```

The token is valid for **24 hours** from the time of login.

---

## Notes

- Passwords are hashed using BCrypt before storage
- Password fields are always omitted from responses for security
- Email must be unique across all users
- Username must be unique across all users
- Token is required for profile updates, password changes, and profile deletion
- Each user can only have one assessment per skill
- Assessments track score (0-100) and proficiency level (1-5)
- Skills can be categorized (Backend, Frontend, DevOps, Database, etc.)
- Career recommendations are generated based on user's skill assessments
- Only careers with all mandatory skills met will be recommended
