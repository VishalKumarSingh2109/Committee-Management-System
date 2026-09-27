# 🏛️ Committee Management System

A full-stack membership payment management web application built with **React, Node.js, Express, and MySQL**. Manage club members, track monthly dues, verify UPI payments, and visualize collections with interactive dashboards — built for real-world use by a society or club committee.

## ✨ Features

- 🔐 **Secure Authentication** — JWT-based auth with bcrypt password hashing and role-based access (admin/member)
- 👥 **Member Management** — Add, edit, and deactivate members; each gets a linked login account automatically
- 💳 **UPI QR Payments** — Members scan a dynamic QR code and submit a transaction reference for verification
- ✅ **Admin Verification Workflow** — Nothing is marked paid automatically — the admin reviews and confirms every payment
- 📅 **Automatic Due Tracking** — A daily scheduled job ensures every active member has a due record each month
- 📊 **Dashboards & Charts** — Monthly collection, paid vs. due breakdown, and trend lines (Recharts)
- 📈 **Reports** — Club-wide and per-member statistics with drill-down trend views
- 🧾 **PDF Receipts** — Downloadable receipt for every verified payment
- 📤 **CSV Exports** — Payment records and member statistics, ready for a spreadsheet
- 🔔 **Due Alerts** — Sidebar badges and dashboard banners flag overdue members automatically
- 🔑 **Password Management** — Members change their own password; admins can force-reset one
- 🗂️ **Soft Delete** — Deactivating a member preserves their full payment history

## 🛠️ Tech Stack

**Frontend:** React.js (Vite), React Router, Tailwind CSS, Axios, Recharts
**Backend:** Node.js, Express.js, Sequelize, JWT, bcrypt, express-validator, node-cron
**Database:** MySQL

## 📁 Project Structure

```
CMS/
├── client/          # React (Vite) frontend
├── server/          # Node.js + Express REST API
├── database/        # SQL schema
├── scripts/         # Backup scripts (Windows + Linux)
└── backups/         # Generated DB backups (gitignored)
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MySQL Server

### Database

```bash
mysql -u root -p -e "CREATE DATABASE committee_management"
mysql -u root -p committee_management < database/schema.sql
```

### Backend Setup

```bash
cd server
copy .env.example .env    # fill in your DB credentials and JWT secret
npm install
npm run seed               # creates the admin account + sample data
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

```bash
cd client
copy .env.example .env    # points VITE_API_URL at your backend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## 🔑 Default Login (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@committee.local` | `Admin@123` |
| Sample Member | `rahul@committee.local` | `Member@123` |

⚠️ Change these before using the app with a real club — update `SEED_ADMIN_*` in `server/.env`, and use **Change Password** in-app to update any account.

## 📌 API Overview

| Module | Base Route |
|---|---|
| Auth | `/api/auth` |
| Members | `/api/members` |
| Payments | `/api/payments` |
| Statistics | `/api/statistics` |
| Club Info | `/api/club` |

## 🗄️ Database Schema

Three core tables — `users`, `members`, `payments` — connected via foreign keys, with a unique constraint preventing duplicate payment records per member/month/year, and indexes on the frequently queried status/date columns.

## 💾 Database Backups

```bash
# Windows
powershell -ExecutionPolicy Bypass -File scripts/backup.ps1

# Linux/hosting (add to crontab for daily automation)
bash scripts/backup.sh
```

Both scripts pull credentials straight from `server/.env` and auto-delete backups older than 14 days.

## ☁️ Deployment

- **Frontend:** Vercel (root directory: `client`)
- **Backend + Database:** Railway (root directory: `server`; provision a MySQL service)

Set `VITE_API_URL` on Vercel to your Railway backend URL, and `CLIENT_ORIGIN` on Railway to your Vercel frontend URL for CORS to work correctly.

## 📄 License

This project is for personal/educational and club-management use.
