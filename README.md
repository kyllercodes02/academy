<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

# Academy Management System

A comprehensive Laravel-based school management system for handling students, teachers, attendance, and administrative tasks.

## Features

- **Student Management**: Register and manage student information
- **Teacher Management**: Handle teacher profiles and assignments
- **Attendance Tracking**: Monitor student attendance with NFC support
- **Grade Level Management**: Organize students by grade levels and sections
- **Guardian Portal**: Parent/guardian access to student information
- **Admin Dashboard**: Comprehensive administrative interface
- **Real-time Notifications**: Instant updates for important events
- **PDF Reports**: Generate attendance and other reports
- **Excel Import/Export**: Bulk data management capabilities

## Technology Stack

- **Backend**: Laravel 11 (PHP)
- **Frontend**: React.js with Inertia.js
- **Styling**: Tailwind CSS
- **Database**: SQLite (development) / MySQL/PostgreSQL (production)
- **Authentication**: Laravel Sanctum
- **File Management**: Laravel Storage
- **PDF Generation**: DomPDF
- **Excel Processing**: Laravel Excel

## Prerequisites

- PHP 8.2 or higher
- Composer
- Node.js and npm
- Git

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

## Usage

### Admin Access
- URL: `/admin/login`
- Default credentials: Check the database seeders

### Teacher Access
- URL: `/teacher/login`
- Teachers can manage their assigned sections and track attendance

### Guardian Access
- URL: `/guardian/login`
- Guardians can view their children's information and attendance

## Development

### Running Tests
```bash
php artisan test
```

### Code Quality
```bash
./vendor/bin/pint
```

### Database Migrations
```bash
php artisan migrate
php artisan migrate:rollback
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
