# Skill Market - Frontend

A modern Angular 21 application for managing freelance projects and skills marketplace. Built with standalone components, Bootstrap 5, and Keycloak authentication.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: v18+ ([Download](https://nodejs.org/))
- **npm**: v10+ (comes with Node.js)
- **Angular CLI**: v21+ (optional but recommended)
  ```bash
  npm install -g @angular/cli@21
  ```

## 🚀 Getting Started

### 1. Installation

Clone the repository and install dependencies:

```bash
# Install dependencies
npm install
```

### 2. Backend & Authentication Setup

This application requires:
- **Keycloak** server running on `http://localhost:8081`
- **Backend API** running on `http://localhost:8080/api/v1`

### 3. Development Server

Start the Angular development server:

```bash
npm start
```

Or use the Angular CLI directly:

```bash
ng serve
```

The application will be available at `http://localhost:4200/`. The browser will automatically reload when you modify source files.
