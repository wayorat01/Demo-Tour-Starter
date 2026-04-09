# 🔐 Module: User & Authentication (Users, Roles, OAuth2)

> ระบบจัดการผู้ใช้ สิทธิ์การเข้าถึง และ Authentication
> รวม Role-Based Access Control, Google OAuth2, และ Permission System

---

## 🏗️ Architecture Overview

```mermaid
flowchart TB
    subgraph "Authentication"
        LOGIN["🔑 Login\n(Email/Password)"]
        GOOGLE["🔗 Google OAuth2"]
        JWT["🎫 JWT Token\n(saveToJWT)"]
    end

    subgraph "User Management"
        USER["👤 Users Collection"]
        ROLE["🛡️ Roles Collection"]
    end

    subgraph "Access Control"
        AC1["anyone"]
        AC2["authenticated"]
        AC3["authenticatedOrPublished"]
        AC4["isAdmin"]
        AC5["isAdminOrSelf"]
        PERM["Permissions\ncheckPermission()"]
    end

    LOGIN --> JWT
    GOOGLE --> JWT
    JWT --> USER
    USER -->|"roles (relationship)"| ROLE
    ROLE -->|"permissions"| PERM
    PERM --> AC1 & AC2 & AC3 & AC4 & AC5
```

---

## 📊 Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        string id PK
        string name
        string email UK
        string hash "password hash (Payload Auth)"
        string sub "OAuth2 subject ID"
        relationship roles "FK -> Roles[] (many)"
        timestamp createdAt
        timestamp updatedAt
    }

    ROLES {
        string id PK
        string name UK "e.g., Admin, Editor"
        string slug UK "e.g., admin, editor"
        string description
        boolean canManageContent
        boolean canPublish
        boolean canManageUsers
        boolean canManageRedirects
        timestamp createdAt
        timestamp updatedAt
    }

    USERS }o--o{ ROLES : "has roles (many-to-many)"
```

---

## 🔄 User Journey: Login & Role Assignment

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant CMS as Payload CMS
    participant Google as Google OAuth2
    participant DB as MongoDB

    alt Email/Password Login
        User->>FE: กรอก Email & Password
        FE->>CMS: POST /api/users/login
        CMS->>DB: Verify credentials
        DB-->>CMS: User document
        CMS-->>FE: JWT Token + User data
    end

    alt Google OAuth2 Login
        User->>FE: คลิก "Login with Google"
        FE->>Google: Redirect to Google Auth
        Google-->>FE: Authorization code
        FE->>CMS: /api/users/oauth/google/callback
        CMS->>Google: Exchange code for token
        Google-->>CMS: Access token
        CMS->>Google: GET /userinfo
        Google-->>CMS: Email, Name, Picture
        CMS->>DB: Find or Create user
        Note over CMS, DB: Auto-assign role\n(admin if first user\nor email domain match)
        CMS-->>FE: JWT Token + Redirect
    end

    FE->>FE: Store JWT in cookie
    FE->>CMS: Subsequent requests with JWT
```

---

## 🛡️ Role Assignment Flow

```mermaid
flowchart TD
    A["New User Created"] --> B{"First user in system?"}
    B -->|"Yes"| C["Assign 'Admin' role"]
    B -->|"No"| D{"Email domain in\nALLOWED_EMAIL_DOMAINS?"}
    D -->|"Yes"| C
    D -->|"No"| E["Assign 'Editor' role"]
    C --> F["Save user with role"]
    E --> F

    G["Admin manually creates user"] --> H{"Roles already set?"}
    H -->|"Yes"| I["Keep existing roles"]
    H -->|"No"| B
```

---

## 📝 State Diagram: User Access

```mermaid
stateDiagram-v2
    [*] --> Anonymous : เข้าเว็บไซต์

    state Anonymous {
        [*] --> PublicAccess
        PublicAccess : อ่าน Published content
        PublicAccess : ดู Media
        PublicAccess : ค้นหา
    }

    Anonymous --> Authenticated : Login (Email/OAuth2)

    state Authenticated {
        [*] --> CheckRole
        CheckRole --> Editor : role = editor
        CheckRole --> Admin : role = admin

        state Editor {
            [*] --> EditorAccess
            EditorAccess : CRUD Content (Pages, Posts)
            EditorAccess : Upload Media
            EditorAccess : แก้ไขโปรไฟล์ตัวเอง
        }

        state Admin {
            [*] --> AdminAccess
            AdminAccess : ทำได้ทุกอย่าง
            AdminAccess : จัดการ Users
            AdminAccess : จัดการ Roles
            AdminAccess : จัดการ Redirects
            AdminAccess : แก้ไข ThemeConfig
            AdminAccess : แก้ไข PageConfig
        }
    }

    Authenticated --> Anonymous : Logout
```

---

## 🔑 Access Control Policies

```mermaid
flowchart LR
    subgraph "Access Functions"
        direction TB
        A["anyone()"]
        B["authenticated()"]
        C["authenticatedOrPublished()"]
        D["isAdmin()"]
        E["isAdminOrSelf()"]
        F["hasPermission(perm)"]
    end

    subgraph "Usage"
        A -->|"Media.read\nCategories.read\nTourCategories.read"| R1["Public Read"]
        B -->|"Pages.create/update/delete\nPosts.create/update/delete\nMedia.create/update/delete"| R2["Auth Required"]
        C -->|"Pages.read\nPosts.read"| R3["Published or Auth"]
        D -->|"Users.create\nRoles.CRUD\nThemeConfig.update\nPageConfig.update"| R4["Admin Only"]
        E -->|"Users.update\nUsers.delete"| R5["Self or Admin"]
        F -->|"Redirects.CRUD"| R6["Permission Check"]
    end
```

---

## 🔗 Permission System

| Permission | คำอธิบาย | Default (Editor) | Default (Admin) |
|-----------|----------|:-:|:-:|
| `canManageContent` | สร้าง/แก้ไขเนื้อหา | ❌ | ✅ |
| `canPublish` | Publish เนื้อหา | ❌ | ✅ |
| `canManageUsers` | จัดการผู้ใช้ | ❌ | ✅ |
| `canManageRedirects` | จัดการ Redirects | ❌ | ✅ |

---

## 🔑 Key Files

| File | คำอธิบาย |
|------|----------|
| `src/collections/Users/index.ts` | Users collection config + beforeValidate hook |
| `src/collections/Roles/index.ts` | Roles collection config + permissions |
| `src/access/anyone.ts` | Anyone access policy |
| `src/access/authenticated.ts` | Authenticated access policy |
| `src/access/authenticatedOrPublished.ts` | Published or authenticated |
| `src/access/isAdmin.ts` | Admin-only check (via role slug) |
| `src/access/isAdminOrCreatedBy.ts` | Self or Admin check |
| `src/utilities/checkRole.ts` | Role checking utility |
| `src/utilities/checkPermission.ts` | Permission checking utility |
| `src/utilities/initRoles.ts` | Initial roles setup on first run |
| `src/actions/auth/` | Auth server actions |
| `src/blocks/Login/` | Login block component |
| `src/blocks/Signup/` | Signup block component |

---

## ⚙️ API Endpoints

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| POST | `/api/users/login` | Login (email/password) |
| POST | `/api/users/logout` | Logout |
| GET | `/api/users/me` | Current user profile |
| POST | `/api/users` | Create user (Admin only) |
| GET | `/api/users` | List users (Authenticated) |
| PATCH | `/api/users/:id` | Update user (Self/Admin) |
| DELETE | `/api/users/:id` | Delete user (Self/Admin) |
| GET | `/api/users/oauth/google` | Start Google OAuth flow |
| GET | `/api/roles` | List roles (Authenticated) |
| POST | `/api/roles` | Create role (Admin only) |

---

## ⚙️ Environment Variables

| Variable | คำอธิบาย |
|----------|----------|
| `GOOGLE_LOGIN_CLIENT_ID` | Google OAuth2 Client ID |
| `GOOGLE_LOGIN_CLIENT_SECRET` | Google OAuth2 Client Secret |
| `ALLOWED_EMAIL_DOMAINS` | Comma-separated domains for auto-admin (e.g., `company.com`) |
| `PAYLOAD_SECRET` | JWT signing secret |
