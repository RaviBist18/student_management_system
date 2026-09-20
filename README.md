# Ambition Brilliance

Build a high-contrast, ultra-clean interactive Web Application prototype for "Ambition Technical Institute" designed as an Operator-led Student Record & Performance Showcase System used during parent-teacher presentations.

IMPORTANT: This is a front-end UI prototype with full interactivity using local state (React state). No backend database is required, but ALL buttons, navigation links, filters, modals, tab switches, dark/light theme toggles, and search bars MUST work seamlessly with pre-loaded mock data.

---

### 1. DESIGN & COLOR SYSTEM

- Theme: Dark Modern Glassmorphism (Default) with a Light Mode toggle option.

- Dark Palette: Deep Navy Slate (#0F172A), Charcoal Card Surface (#1E293B), Accent Indigo (#6366F1), Electric Purple (#8B5CF6).

- Light Palette: Clean Slate White (#F8FAFC), Crisp Card Surface (#FFFFFF), Deep Slate Text (#0F172A).

- Text & Contrast: High contrast for max readability on projector or monitor screens.

- Typography: Sans-serif ("Plus Jakarta Sans" or "Inter"). Headers: Semi-bold/Bold, Data Metrics: Monospace or Large Clean Numbers.

- Performance Indicators (Color Badges):

  * Excellent (85%+): Emerald Green (#10B981)

  * Good (70%–84%): Indigo Blue (#6366F1)

  * Average (50%–69%): Amber Yellow (#F59E0B)

  * Needs Attention (<50%): Coral Red (#EF4444)

---

### 2. PRE-LOADED DEMO STUDENT DATA

Please pre-load the following 4 dummy student profiles into the app state so the UI is fully populated and interactive upon launch:

1. Student #1:

   - Name: Aarav Sharma (ID: ATI-2025-0101)

   - Course: Master Diploma in Computer Technology (MDCT) | Batch: 2025

   - Father's Name: Ramesh Sharma | Phone: +977 9841234567 | Address: Ward 4, Birendranagar

   - School/College: Model Higher Secondary School | Prior Education: +2 Science

   - Overall Score: 88% (Grade A+) | Attendance: 94% | Status: Top Performer

   - Weekly Exams:

     * Week 1 (HTML/CSS): 48/50 | Week 2 (JavaScript): 45/50 | Week 3 (React Basics): 42/50 | Week 4 (Node.js): 46/50

   - Monthly/Term Exams:

     * Computer Fundamentals: 92/100 | Programming in C/C++: 86/100 | Web Technology: 90/100 | Database Systems: 84/100

   - Instructor Remarks: "Aarav shows exceptional logical skills and is consistently ahead in practical lab assignments."

2. Student #2:

   - Name: Priya Adhikari (ID: ATI-2025-0102)

   - Course: Python Programming & Data Science | Batch: 2025

   - Father's Name: Hari Prasad Adhikari | Phone: +977 9851098765 | Address: Main Road, Surkhet

   - School/College: Horizon Higher Secondary School | Prior Education: +2 Management

   - Overall Score: 76% (Grade B+) | Attendance: 88% | Status: Good

   - Weekly Exams:

     * Week 1 (Python Syntax): 40/50 | Week 2 (Data Structures): 38/50 | Week 3 (Pandas/Numpy): 37/50 | Week 4 (OOP Concepts): 39/50

   - Monthly/Term Exams:

     * Core Python: 78/100 | Data Analysis: 72/100 | Statistics: 75/100 | SQL Basics: 79/100

   - Instructor Remarks: "Priya is working hard and grasping concepts well. Extra practice on data analysis projects will boost her performance."

3. Student #3:

   - Name: Rohan Karki (ID: ATI-2025-0103)

   - Course: UI/UX & Graphic Design | Batch: 2024

   - Father's Name: Bikram Karki | Phone: +977 9803456789 | Address: Housing Colony, Birendranagar

   - School/College: National Technical Institute | Prior Education: Grade 10 (SEE)

   - Overall Score: 62% (Grade C+) | Attendance: 72% | Status: Needs Attention

   - Weekly Exams:

     * Week 1 (Figma Tools): 35/50 | Week 2 (Color Theory): 30/50 | Week 3 (Typography): 28/50 | Week 4 (Wireframing): 32/50

   - Monthly/Term Exams:

     * Vector Graphics: 60/100 | UI Layouts: 64/100 | Design Systems: 58/100 | User Research: 66/100

   - Instructor Remarks: "Rohan has great creative potential, but needs to improve attendance and submit weekly design tasks on time."

4. Student #4:

   - Name: Sneha Thapa (ID: ATI-2025-0104)

   - Course: Web Development & Hardware | Batch: 2025

   - Father's Name: Dhan Bahadur Thapa | Phone: +977 9812987654 | Address: Airport Area, Surkhet

   - School/College: Valley Public School | Prior Education: +2 Science

   - Overall Score: 83% (Grade A) | Attendance: 91% | Status: Top Performer

   - Weekly Exams:

     * Week 1 (Hardware Assembly): 45/50 | Week 2 (Networking): 42/50 | Week 3 (Tailwind CSS): 41/50 | Week 4 (JavaScript ES6): 40/50

   - Monthly/Term Exams:

     * Computer Hardware: 88/100 | Network Security: 80/100 | Responsive Web Design: 84/100 | Frontend Frameworks: 80/100

   - Instructor Remarks: "Sneha is very consistent in both theory and practical lab sessions."

---

### 3. CORE UI & INTERACTIVITY REQUIREMENTS

The Web Application must feature 2 Primary Views + 1 Interactive Modal:

#### VIEW 1: OPERATOR DASHBOARD PAGE

1. Header Bar:

   - Logo & Title: "Ambition Technical Institute - Student Profile Management"

   - Live Search Input: Type student name, ID, or phone number to dynamically filter the grid below in real-time.

   - Buttons: "+ Add New Student" (opens Modal), "Upload CSV" (simulates file upload alert), "Light/Dark Theme Toggle".

   - Operator Profile Tag: "Operator Mode (Logged in as Admin)".

2. Analytics Counter Bar (Top Cards):

   - Total Students: 4

   - Active Courses: 4

   - Avg. Attendance Rate: 86.25%

   - Top Performers: 2

3. Filter Controls:

   - Course Dropdown: (All Courses, MDCT, Python, Graphic Design, Web Dev)

   - Batch Dropdown: (All Batches, 2024, 2025)

   - Performance Filter: (All Statuses, Top Performers, Needs Attention)

4. Student Cards Grid:

   - Display cards for each student showing: Avatar, Full Name, Student ID, Course Name, Batch, Overall Score Badge, Attendance Badge, and a "View Full Performance Profile" CTA button.

   - CLICKING ANY CARD smoothly opens View 2 (Detailed Student Profile View) with that student's specific data loaded.

#### VIEW 2: DETAILED STUDENT PROFILE VIEW (Parent Presentation Mode)

1. Top Navigation:

   - "← Back to Dashboard" button (returns to View 1).

   - "Export PDF Report Card" button (triggers a realistic printable layout or download prompt).

   - "Export Excel Sheet" button.

2. Student Identity & Parent Details Banner:

   - Large Profile Picture/Avatar, Full Name, ID, Course Enrolled, Batch Year.

   - Parent Details Box: Father's Name, Contact Number, Address, School/College.

   - "Edit Record / Add Marks" Button (opens Edit Modal).

3. Performance Key Metrics:

   - Circular/Animated Score Meter showing Overall Score %.

   - Attendance Rate Meter %.

   - Overall Grade Badge (e.g., Grade A+).

4. Switchable Tabs Section:

   - TAB 1: Weekly Exams Breakdown:

     * Shows a table/list of Week 1 to Week 4 test scores, max marks, date, and percentage.

   - TAB 2: Monthly / Term Exams Breakdown:

     * Shows subject-wise breakdown cards with score progress bars and marks achieved.

   - TAB 3: Attendance History:

     * Visual grid representation showing present vs absent days.

5. Instructor Remarks Box:

   - Displays teacher's qualitative comments clearly for parents to read.

#### VIEW 3: ADD / EDIT STUDENT MODAL

- Form Dialog with inputs for: Student Name, ID, Course, Father's Name, Phone, Address, Overall Marks, Attendance, and Instructor Remarks.

- "Save Student Record" button that dynamically appends or updates the student array in the UI state without reloading the browser page.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/be6911d1-a922-49b1-a7ae-8b346f101690).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
