# Academy Management System

A comprehensive Laravel-based school management system for handling students, teachers, guardians, attendance, and administrative tasks.

## Features

- **User Management**: Admin, Teacher, and Guardian portals
- **Student Management**: Complete student profiles and records
- **Attendance Tracking**: NFC-based attendance system
- **Grade Management**: Academic performance tracking
- **Announcements**: School-wide communication system
- **Reports**: Comprehensive reporting and analytics
- **Multi-role Authentication**: Secure role-based access control

## Technology Stack

- **Backend**: Laravel 11 (PHP)
- **Frontend**: React.js with Inertia.js
- **Database**: SQLite (development) / MySQL (production)
- **Styling**: Tailwind CSS
- **Authentication**: Laravel Breeze
- **File Management**: Laravel Storage
- **PDF Generation**: DomPDF
- **Excel Import/Export**: Laravel Excel

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kyllercodes02/academy.git
   cd academy
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Database setup**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

6. **Build assets**
   ```bash
   npm run build
   ```

7. **Start the development server**
   ```bash
   php artisan serve
   ```

## Default Credentials

After running the seeders, you can use these default credentials:

- **Admin**: admin@academy.com / password
- **Teacher**: teacher@academy.com / password
- **Guardian**: guardian@academy.com / password

## Project Structure

```
academy/
├── app/
│   ├── Http/Controllers/    # Application controllers
│   ├── Models/             # Eloquent models
│   ├── Events/             # Event classes
│   └── Notifications/      # Notification classes
├── resources/
│   ├── js/
│   │   ├── Components/     # React components
│   │   ├── Layouts/        # Layout components
│   │   └── Pages/          # Page components
│   └── views/              # Blade templates
├── database/
│   ├── migrations/         # Database migrations
│   └── seeders/           # Database seeders
└── routes/                # Application routes
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Support

For support, email support@academy.com or create an issue in this repository.
