# Dental Clinic Management System

A full-stack dental clinic management system with React frontend and Spring Boot backend.

## Features

- **User Management**: Admin, Doctor, Staff, and Patient roles
- **Patient Management**: Complete patient records and medical history
- **Appointment Scheduling**: Manage appointments with doctors and staff
- **Expense Tracking**: Track clinic expenses with approval workflow
- **Real-time Data**: Live updates between frontend and backend
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- Next.js 15 with React 19
- TypeScript
- Tailwind CSS
- Context API for state management

### Backend
- Spring Boot 3.5.4
- Spring Security
- Spring Data JPA
- MySQL Database
- RESTful APIs

## Prerequisites

- Node.js 18+ and npm
- Java 21+
- MySQL 8.0+
- Maven 3.6+

## Setup Instructions

### Backend Setup

1. **Database Setup**
   ```sql
   CREATE DATABASE clinicdb;
   ```

2. **Update Database Configuration**
   Edit `DentalClinic/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/clinicdb?useSSL=false&serverTimezone=UTC
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

3. **Run the Backend**
   ```bash
   cd DentalClinic
   ./mvnw spring-boot:run
   ```
   The backend will start on http://localhost:8080

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd clinic-management-master
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The frontend will start on http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/{id}` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/{id}` - Update patient
- `DELETE /api/patients/{id}` - Delete patient

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/{id}` - Get appointment by ID
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/{id}` - Update appointment
- `DELETE /api/appointments/{id}` - Delete appointment

### Expenses
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/{id}` - Get expense by ID
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense
- `POST /api/expenses/{id}/approve` - Approve expense

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/role/{role}` - Get users by role
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

## Testing Connectivity

Run the connectivity test:
```bash
node test-connectivity.js
```

## Default Users

The system creates default users on startup:
- **Admin**: username: `admin`, password: `admin`
- **Doctor**: username: `doctor`, password: `doctor`
- **Staff**: username: `staff`, password: `staff`

## User Roles

- **ADMIN**: Full access to all features
- **DOCTOR**: Can manage patients and appointments
- **STAFF**: Can manage appointments and add expenses
- **PATIENT**: Can view their own appointments and bills

## Key Features

### Patient Management
- Complete patient profiles with medical history
- Search and filter patients
- Bulk operations for admins

### Appointment System
- Schedule appointments with doctors
- Track appointment status
- View upcoming appointments

### Expense Management
- Add and track clinic expenses
- Approval workflow for expenses
- Filter by date and status

### Real-time Updates
- Live data synchronization
- Automatic refresh on data changes
- Error handling and user feedback

## Development

### Adding New Features
1. Create API endpoints in Spring Boot controllers
2. Update TypeScript types in `src/types/index.ts`
3. Add API methods in `src/lib/api.ts`
4. Update context providers in `src/context/`
5. Create/update React components

### Database Schema
The system uses JPA entities that automatically create the database schema:
- `User` - User accounts and authentication
- `Patient` - Patient records
- `Appointment` - Appointment scheduling
- `Expense` - Expense tracking

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure the backend allows requests from http://localhost:3000
2. **Database Connection**: Verify MySQL is running and credentials are correct
3. **Port Conflicts**: Ensure ports 3000 and 8080 are available

### Logs
- Backend logs: Check console output when running `./mvnw spring-boot:run`
- Frontend logs: Check browser console for errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.