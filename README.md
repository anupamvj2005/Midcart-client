# 💊 Midcart – Intelligent Online Pharmacy Platform

A full-stack MERN + Python ML pharmacy system with prescription upload, smart inventory, demand forecasting & more.

---

## 📁 Project Structure

```
Midcart/
├── client/          → React.js (Vite) – User Interface
├── server/          → Node.js + Express.js – REST API
├── ml-api/          → Python Flask – ML Microservice
└── database/        → MongoDB Schemas + Seed Data
```

---

## 🚀 How to Run Locally

You can launch all services (client, server, ml-api) concurrently with a single command!

### 📌 Prerequisites:

* Node.js installed
* Python installed
* MongoDB installed locally OR MongoDB Atlas configured

---

### ⚙️ Setup Environment Variables

#### 1. Backend (`server/.env`)

```
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

#### 2. Frontend (`client/.env`)

```
VITE_API_URL=http://localhost:5000
```

#### 3. ML API (`ml-api/.env`) *(if required)*

```
# Add variables if your ML service needs them
```

---

### ▶️ Start All Services

```bash
npm run dev
```

### 🌐 Services will run on:

* **Client (React)** → http://localhost:5173
* **Server (Node)** → http://localhost:5000
* **ML API (Flask)** → http://localhost:8000

---

## 🌍 How to Deploy for Free

This project can be deployed using:

* Frontend → Vercel
* Backend & ML API → Render
* Database → MongoDB Atlas

---

## 🚀 STEP 1: Deploy Backend (Render)

1. Go to Render and login
2. Click **New → Web Service**
3. Select your GitHub repo

### 🔧 Settings:

* **Root Directory:** `server`
* **Build Command:** `npm install`
* **Start Command:** `node server.js`

### 🔑 Environment Variables:

```
MONGO_URI=your_mongodb_atlas_url
JWT_SECRET=your_secret_key
NODE_ENV=production
PORT=10000
CLIENT_URL=https://your-frontend.vercel.app
```

👉 Deploy and copy backend URL:

```
https://your-backend.onrender.com
```

---

## 🤖 STEP 2: Deploy ML API (Render)

1. Create another Web Service
2. Select same repo

### 🔧 Settings:

* **Root Directory:** `ml-api`
* **Build Command:** `pip install -r requirements.txt`
* **Start Command:** `python app.py`

👉 After deploy:

```
https://your-ml-api.onrender.com
```

👉 Add this to backend ENV:

```
ML_API_URL=https://your-ml-api.onrender.com
```

---

## 🌐 STEP 3: Deploy Frontend (Vercel)

1. Go to Vercel and login
2. Click **Add New → Project**
3. Import GitHub repo

### 🔧 Settings:

* **Root Directory:** `client`

### 🔑 Environment Variables:

```
VITE_API_URL=https://your-backend.onrender.com
```

👉 Click **Deploy**

👉 You will get:

```
https://your-app.vercel.app
```

---

## 🔗 FINAL STEP (VERY IMPORTANT)

After frontend deployment:

1. Copy your Vercel URL
2. Go to Render → Backend → Environment
3. Update:

```
CLIENT_URL=https://your-app.vercel.app
```

4. Click:

```
Manual Deploy → Deploy latest commit
```

---

## ⚠️ Important Notes

* ❌ Do NOT use `localhost` in deployed apps
* ✅ Always use deployed URLs
* ⚠️ Render free tier sleeps after inactivity (normal)
* ✅ Ensure MongoDB Atlas allows access (`0.0.0.0/0`)

---

## 🔑 Default Admin Credentials

* Email: `admin@midcart.com`
* Password: `Admin@123`

---

## 🌟 Features

* 📄 Prescription Upload & OCR
* 💊 Medicine Search & Ordering
* 🛒 Smart Cart & Checkout
* 📊 Admin Dashboard with Analytics
* 🤖 ML Demand Forecasting
* ⚠️ Low Stock & Expiry Alerts
* 💡 Medicine Recommendations
* 📱 Responsive Design

---

## 🎯 Tech Stack

* Frontend: React (Vite)
* Backend: Node.js, Express.js
* Database: MongoDB
* ML: Python (Flask)
* Deployment: Vercel + Render

---
