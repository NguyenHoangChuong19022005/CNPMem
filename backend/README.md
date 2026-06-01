# CareerPathSE Backend

Spring Boot backend service for CareerPathSE - Personalized Career Orientation & Learning Roadmap Platform for Software Engineering Students.

## Setup

### Prerequisites
- Java 17+
- Maven 3.6+
- SQLite

### Build
```bash
mvn clean install
```

### Run
```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

## Database

- **Type**: SQLite (embedded, no separate server needed)
- **File**: `career_guidance.db` (created automatically in backend folder)
- **Auto-Schema**: Tables are created automatically from entity classes

## Endpoints

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API reference.

### Quick Test

**Register:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123","email":"test@example.com","fullName":"Test User"}'
```

**Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

**Get Profile (replace TOKEN with accessToken from login):**
```bash
curl -X GET http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer TOKEN"
```

## Project Structure

```
src/main/java/com/platform/careerguidance/
├── CareerguidanceApplication.java    # Main Spring Boot entry point
├── config/
│   ├── JwtAuthenticationFilter.java   # JWT filter for authentication
│   ├── JwtTokenProvider.java          # JWT token generation/validation
│   └── SecurityConfig.java            # Spring Security configuration
├── controller/
│   ├── AuthController.java            # Login/Register endpoints
│   └── UserController.java            # User profile endpoints
├── entity/
│   └── User.java                      # User JPA entity
└── repository/
    └── UserRepository.java            # User data access layer
```

## Configuration

File: `src/main/resources/application.properties`

```properties
spring.application.name=careerguidance
spring.datasource.url=jdbc:sqlite:career_guidance.db
spring.datasource.driver-class-name=org.sqlite.JDBC
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
```

## Dependencies

- Spring Boot 3.2.2
- Spring Security (JWT auth)
- Spring Data JPA
- SQLite JDBC
- Lombok
- JJWT (JWT token library)

## Notes

- JWT token expires after 24 hours
- Passwords are hashed using BCrypt
- CORS is enabled for all origins
- All password fields are excluded from API responses
- SQLite database is embedded (no external setup needed)
