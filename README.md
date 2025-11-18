# EdTech Learning Task Manager

A full-stack role-based task management application built for educational environments with secure JWT authentication and MongoDB database.

## 🎯 Project Overview

This application enables teachers and students to manage learning tasks with role-based access control:
- **Students**: Create, view, update, and delete their own learning tasks
- **Teachers**: View all tasks from assigned students while maintaining their own tasks

**Live Demo:** [If deployed, add link]
**Video Walkthrough:** [Add YouTube/Drive link]

---

## 🛠️ Tech Stack

### Frontend
- React 18.2.0
- React Router DOM 6.20.0
- Axios for API calls
- Tailwind CSS for styling
- Context API for state management

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Bcrypt for password hashing
- Joi for input validation

---

## ✨ Features

### Core Functionality
✅ Role-based access control (Student & Teacher)
✅ JWT authentication with secure token management
✅ Password hashing using bcrypt
✅ Full CRUD operations on tasks
✅ Task filtering by progress status (Not Started, In Progress, Completed)
✅ Optional due dates for tasks
✅ Teacher-Student relationship management
✅ Rate limiting on login endpoint
✅ Comprehensive error handling
✅ Input validation with Joi
✅ Responsive UI design

### Security Features
✅ JWT-based authentication
✅ Password hashing (bcrypt, 10 salt rounds)
✅ Rate limiting (5 attempts per 15 minutes on login)
✅ Input sanitization and validation
✅ Ownership verification for edit/delete operations
✅ Role-based query filtering

---

##  Role-Based Functionality

### Student Role

**Permissions:**
- ✅ Create tasks for personal learning
- ✅ View **only their own tasks**
- ✅ Update progress on their own tasks
- ✅ Delete their own tasks
- ❌ Cannot view other students' tasks
- ❌ Cannot modify tasks they don't own

**Requirements:**
- Must be assigned to a teacher during signup
- Teacher ID (MongoDB ObjectId) is mandatory

**Use Case:**
Students manage their personal learning tasks independently. They have complete control over their own tasks but cannot interfere with other students' work, ensuring data privacy and autonomy.

---

### Teacher Role

**Permissions:**
- ✅ View **all tasks from assigned students**
- ✅ Create their own tasks
- ✅ Update their own tasks
- ✅ Delete their own tasks
- ❌ Cannot edit student-created tasks (view only)
- ❌ Cannot delete student-created tasks (view only)

**Use Case:**
Teachers monitor student progress across all their assigned students. They can see what tasks students are working on but maintain data integrity by only being able to modify their own tasks. This creates a supervision system without risking accidental alteration of student work.

---

### Teacher Task-View Logic (Implementation)

**Backend Implementation (`server/src/controllers/taskController.js`):**
```javascript
const getTasks = async (req, res, next) => {
  const { role, _id: userId } = req.user;
  
  if (role === 'student') {
    // Students see only their own tasks
    tasks = await Task.find({ userId }).sort({ createdAt: -1 });
  } 
  else if (role === 'teacher') {
    // Step 1: Find all students assigned to this teacher
    const assignedStudents = await User.find({ 
      role: 'student', 
      teacherId: userId 
    }).select('_id');
    
    // Step 2: Extract student IDs
    const studentIds = assignedStudents.map(s => s._id);
    
    // Step 3: Query tasks where userId is either:
    //   - The teacher's ID (their own tasks)
    //   - OR in the list of assigned student IDs
    tasks = await Task.find({
      $or: [
        { userId },                    // Teacher's own tasks
        { userId: { $in: studentIds } } // Students' tasks
      ]
    })
    .populate('userId', 'email role')
    .sort({ createdAt: -1 });
  }
  
  res.json({ success: true, data: tasks });
};
```

**Key Points:**
1. **Student Isolation**: Students only see `Task.find({ userId })` - their own tasks
2. **Teacher Aggregation**: Teachers see tasks from:
   - Themselves: `{ userId: teacherId }`
   - Assigned students: `{ userId: { $in: [student1_id, student2_id, ...] } }`
3. **Relationship Enforcement**: Student-Teacher link via `teacherId` field in User model
4. **Population**: `.populate('userId', 'email role')` includes creator details
5. **Authorization**: Edit/Delete buttons shown only for task owners (checked by `isOwner()` function)

**Frontend Implementation (`client/src/components/Dashboard/Dashboard.jsx`):**
```javascript
const isOwner = (task) => {
  // Check if logged-in user created this task
  return task.userId === user._id || task.userId?._id === user._id;
};

// In JSX:
{isOwner(task) && (
  
    <button onClick={() => openModal(task)}>Edit
    <button onClick={() => handleDelete(task._id)}>Delete
  
)}
```

This ensures:
- Teachers can **view** all assigned students' tasks
- Edit/Delete buttons only appear on **own tasks**
- Frontend and backend both enforce ownership rules

---

##  Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (free tier) or local MongoDB
- Git

### 1. Clone Repository
```bash
git clone https://github.com/hari-1412/edtech-task-manager.git
cd edtech-task-manager
```

### 2. Backend Setup
```bash
cd server
npm install
```

**Create `.env` file in `server/` folder:**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
NODE_ENV=development
```

⚠️ **Important:** Replace `MONGODB_URI` with your actual MongoDB connection string from MongoDB Atlas.

**Start backend server:**
```bash
npm run dev
```

Expected output:
🚀 Server running on http://localhost:5000
✅ MongoDB connected successfully

### 3. Frontend Setup

**Open new terminal:**
```bash
cd client
npm install
```

**Start frontend:**
```bash
npm start
```

Browser will open at `http://localhost:3000`

### 4. Create Test Accounts

**Teacher Account:**
1. Navigate to `/signup`
2. Email: `teacher@example.com`
3. Password: `teacher123`
4. Role: Teacher
5. Sign up

**Get Teacher ID:**
- Open browser DevTools (F12)
- Console tab
- Type: `JSON.parse(localStorage.getItem('user'))._id`
- Copy the ID

**Student Account:**
1. Logout from teacher
2. Go to `/signup`
3. Email: `student@example.com`
4. Password: `student123`
5. Role: Student
6. Teacher ID: Paste the copied teacher ID
7. Sign up

---

##  API Endpoints

### Authentication

**POST** `/auth/signup` - Register new user
```json
Request:
{
  "email": "user@example.com",
  "password": "password123",
  "role": "student",
  "teacherId": "673856abc123..." // Required for students
}

Response: 
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJ...",
    "user": { ... }
  }
}
```

**POST** `/auth/login` - Authenticate user (Rate limited: 5/15min)
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJ...",
    "user": { ... }
  }
}
```

### Tasks (Protected Routes - Require JWT)

**GET** `/tasks` - Get all accessible tasks (role-based)
**POST** `/tasks` - Create new task
**PUT** `/tasks/:id` - Update task (owner only)
**DELETE** `/tasks/:id` - Delete task (owner only)

---

##  Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  passwordHash: String (required),
  role: String (enum: ['student', 'teacher'], required),
  teacherId: ObjectId (required for students, references User),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email`: Unique index

**Validation:**
- Students must have `teacherId`
- `teacherId` must reference a user with role "teacher"

### Tasks Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (required, references User),
  title: String (required, max 200 chars),
  description: String (required, max 1000 chars),
  dueDate: Date (optional),
  progress: String (enum: ['not-started', 'in-progress', 'completed']),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `userId, createdAt`: Compound index for efficient querying

---

##  Security Implementation

### Password Security
- Bcrypt hashing with 10 salt rounds
- Original passwords never stored
- Minimum length: 6 characters

### JWT Authentication
- Token expires in 7 days
- Signed with 32+ character secret
- Verified on every protected route
- Stored securely in localStorage

### Rate Limiting
- Login endpoint: 5 attempts per 15 minutes per IP
- Prevents brute force attacks

### Input Validation
- Joi schemas for all request bodies
- Type checking and format validation
- Clear error messages

### Authorization
- Ownership verification for edit/delete
- Role-based query filtering
- Frontend and backend enforcement

---

##  Known Issues

### Current Limitations:
1. **No Password Reset**: Users cannot reset forgotten passwords
2. **No Email Verification**: Email addresses not verified during signup
3. **Basic Search**: No advanced search or filtering by title/description
4. **No File Attachments**: Cannot attach files to tasks

### Browser Compatibility:
- Tested on Chrome, Firefox, Edge (latest versions)
- localStorage required (may not work in private/incognito mode)

---

##  Future Improvements

### Planned Features:
1. **Email Notifications** - Reminders for upcoming due dates
2. **Task Assignment** - Teachers can assign specific tasks to students
3. **Progress Analytics** - Visual charts showing completion rates
4. **File Attachments** - Upload documents, images with tasks
5. **Real-time Updates** - WebSocket implementation for live updates
6. **Advanced Search** - Full-text search across title and description
7. **Categories/Tags** - Organize tasks by subject or category
8. **Calendar View** - Visual calendar showing all tasks with due dates
9. **Comments System** - Teachers can comment on student tasks
10. **Export Reports** - Generate PDF reports of task completion

### Technical Improvements:
- Implement refresh token mechanism
- Add Redis caching for frequent queries
- Migrate to TypeScript for better type safety
- Add comprehensive testing (Jest, React Testing Library)
- Implement CI/CD pipeline (GitHub Actions)
- Add Docker containerization
- Implement proper logging system (Winston)
- Add API documentation (Swagger/OpenAPI)

---

##  AI Assistance Disclosure

### What AI (Claude by Anthropic) Helped With:

**1. Project Architecture & Planning:**
- Suggested MERN stack folder structure
- Recommended separation of concerns (MVC pattern)
- Advised on RESTful API design principles
- Suggested middleware organization

**2. Code Examples & Boilerplate:**
- Provided JWT authentication middleware template
- Suggested Joi validation schemas structure
- Helped with MongoDB query examples
- Provided error handling patterns

**3. Debugging Assistance:**
- Helped resolve CORS configuration issues
- Debugged MongoDB connection string format
- Fixed token verification edge cases
- Resolved Git submodule issues during GitHub upload

**4. UI/UX Design Suggestions:**
- Recommended modern color schemes (indigo/blue gradients)
- Suggested Tailwind CSS utility class combinations
- Provided layout structure for responsive design
- Recommended emoji usage for visual enhancement

**5. Documentation:**
- Helped structure README template
- Suggested comprehensive API documentation format
- Provided examples for setup instructions
- Recommended testing scenario descriptions

---

### What I Implemented and Understood Myself:

**1. Core Business Logic:**
- ✅ Designed and implemented role-based access control
- ✅ Created student-teacher relationship schema
- ✅ Implemented ownership validation for edit/delete operations
- ✅ Designed and coded role-based task query filtering logic
- ✅ Implemented authorization checks in both frontend and backend

**2. Database Design:**
- ✅ Designed Users and Tasks collection schemas
- ✅ Created appropriate indexes for performance
- ✅ Implemented validation rules and relationships
- ✅ Designed the teacher-student association logic

**3. Frontend Development:**
- ✅ Built all React components from scratch
- ✅ Implemented React Router navigation
- ✅ Created authentication flow with Context API
- ✅ Designed and implemented modal system
- ✅ Built statistics dashboard with live counts
- ✅ Implemented task filtering functionality
- ✅ Created responsive layout that works on all devices

**4. Backend API Implementation:**
- ✅ Wrote all controller logic for auth and tasks
- ✅ Implemented comprehensive error handling
- ✅ Created centralized error middleware
- ✅ Configured rate limiting
- ✅ Implemented input validation with Joi
- ✅ Designed and coded all API endpoints

**5. Security Implementation:**
- ✅ Configured bcrypt password hashing
- ✅ Implemented JWT token generation and verification
- ✅ Set up rate limiting configuration
- ✅ Added input sanitization
- ✅ Implemented ownership verification logic

**6. Testing & Bug Fixes:**
- ✅ Tested all user flows (signup, login, CRUD operations)
- ✅ Fixed edge cases in task ownership checks
- ✅ Resolved frontend state management issues
- ✅ Debugged API integration problems
- ✅ Fixed Git repository setup and file tracking issues
- ✅ Resolved MongoDB connection configuration

**7. Deployment Preparation:**
- ✅ Created .gitignore files for security
- ✅ Set up environment variables properly
- ✅ Prepared .env.example template
- ✅ Created comprehensive README documentation
- ✅ Made multiple meaningful commits showing development process

---

### My Learning Outcomes:

Through building this project, I gained practical, hands-on experience with:

1. **Full-Stack Development:**
   - Connecting React frontend with Node.js backend
   - RESTful API design and implementation
   - State management across application layers

2. **Authentication & Security:**
   - JWT-based authentication implementation
   - Password hashing and validation
   - Role-based authorization logic
   - Security best practices (rate limiting, input validation)

3. **Database Management:**
   - MongoDB schema design
   - Mongoose ODM usage
   - Database relationships and references
   - Query optimization with indexes

4. **React Development:**
   - Component architecture and reusability
   - React Hooks (useState, useEffect, useContext)
   - Context API for global state
   - React Router for navigation
   - Controlled forms and validation

5. **Problem-Solving:**
   - Debugging complex authentication flows
   - Resolving Git and version control issues
   - Fixing MongoDB connection problems
   - Implementing role-based query logic

6. **Professional Development:**
   - Git workflow and meaningful commits
   - Project documentation
   - Code organization and maintainability
   - Following coding best practices

---

## 📹 Video Walkthrough

**Link:** [Add your YouTube/Google Drive link here]

**Contents (5-10 minutes):**
1. **Demo (3-4 min):**
   - Signup as teacher and student
   - Create tasks as different users
   - Show role-based task visibility
   - Demonstrate CRUD operations

2. **Code Walkthrough (3-4 min):**
   - Show `taskController.js` getTasks logic
   - Explain role-based filtering
   - Show frontend isOwner function
   - Demonstrate authorization middleware

3. **Features (2 min):**
   - Filter tasks by progress
   - Update task status
   - Delete tasks

---

## 👤 Developer

**Name:** [K.SRIHARI]
**Email:** [harigoud1412@gmail.com]
**GitHub:** https://github.com/hari-1412
**Repository:** https://github.com/hari-1412/edtech-task-manager

---

##  License

This project was created as part of a Full-Stack Developer assignment for DIGITIT.

---

##  Acknowledgments

- DIGITIT for the assignment opportunity
- Anthropic's Claude AI for development guidance and debugging assistance
- MongoDB Atlas for free database hosting
- The open-source community for excellent libraries and tools

---

## 📞 Contact

For questions or feedback about this project:
- Open an issue in the GitHub repository
- Email: [Your email]
