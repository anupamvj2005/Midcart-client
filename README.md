# 💊 MidCart – Intelligent Online Pharmacy Platform

🚀 A full-stack **MERN + Python ML-based pharmacy system** designed to provide fast, secure, and intelligent healthcare services.  
MidCart enables users to search medicines, upload prescriptions, manage orders, and leverage AI-powered insights like demand forecasting and expiry alerts.

---

## 📌 Overview

MidCart is a modern digital pharmacy platform that bridges the gap between traditional pharmacies and smart healthcare solutions.  
It combines **e-commerce, prescription validation, and machine learning** to deliver a seamless user experience.

---

## ✨ Key Features

- 💊 **Medicine Search & Ordering** – Search by name, brand, or symptoms  
- 📄 **Prescription Upload System** – Verified by pharmacists  
- 🛒 **Smart Cart & Checkout** – Easy ordering with secure payments  
- 📊 **Admin Dashboard** – Manage orders, inventory, analytics  
- 🤖 **ML Demand Forecasting** – Predict medicine demand trends  
- ⚠️ **Low Stock & Expiry Alerts** – Smart inventory management  
- 💡 **Recommendation System** – Suggest related medicines  
- 📦 **Fast Delivery System** – Efficient order processing  
- 📱 **Responsive UI** – Works across all devices  

---

## 🏗️ Project Architecture


```

MidCart/
├── client/          → React.js (Vite) – Frontend UI
├── server/          → Node.js + Express – Backend API
├── ml-api/          → Python Flask – ML Microservice
└── database/        → MongoDB Schemas & Seed Data

```

---

## ⚙️ Tech Stack

| Layer        | Technology Used                |
|-------------|------------------------------|
| Frontend     | React.js (Vite), HTML, CSS   |
| Backend      | Node.js, Express.js          |
| Database     | MongoDB (Atlas / Local)      |
| ML Service   | Python, Flask, Scikit-learn  |
| Deployment   | Vercel + Render              |

---

## 🚀 How to Run Locally

### 📌 Prerequisites

- Node.js installed  
- Python installed  
- MongoDB (Local or Atlas)  

---

### 🔧 Setup Environment Variables

#### 1️⃣ Backend (`server/.env`)

```

MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret_key
CLIENT_URL=[http://localhost:5173](http://localhost:5173)
ML_API_URL=[http://localhost:8000](http://localhost:8000)

```

---

#### 2️⃣ Frontend (`client/.env`)

```

VITE_API_URL=[http://localhost:5000](http://localhost:5000)

```

---

#### 3️⃣ ML API (`ml-api/.env`)

```

# Add if required

````

---

### ▶️ Run All Services

```bash
npm run dev
````

---

### 🌐 Local URLs

* Frontend → [http://localhost:5173](http://localhost:5173)
* Backend → [http://localhost:5000](http://localhost:5000)
* ML API → [http://localhost:8000](http://localhost:8000)

---

## 🌍 Deployment Guide (Free)

### 🚀 STEP 1: Deploy Backend (Render)

* Root Directory → `server`
* Build Command → `npm install`
* Start Command → `node server.js`

#### Environment Variables:

```
MONGO_URI=your_mongodb_atlas_url
JWT_SECRET=your_secret_key
NODE_ENV=production
PORT=10000
CLIENT_URL=https://your-frontend.vercel.app
ML_API_URL=https://your-ml-api.onrender.com
```

---

### 🤖 STEP 2: Deploy ML API (Render)

* Root Directory → `ml-api`
* Build Command → `pip install -r requirements.txt`
* Start Command → `python app.py`

---

### 🌐 STEP 3: Deploy Frontend (Vercel)

* Root Directory → `client`

#### Environment Variables:

```
VITE_API_URL=https://your-backend.onrender.com
```

---

### 🔗 Final Setup

After frontend deployment:

1. Copy Vercel URL
2. Update backend `.env`:

```
CLIENT_URL=https://your-app.vercel.app
```

3. Redeploy backend

---

## 🔐 Default Admin Credentials

```
Email: admin@midcart.com
Password: Admin@123
```

---

## 🔄 System Workflow

1. User visits website
2. Searches or browses medicines
3. Selects products
4. Uploads prescription (if required)
5. Adds items to cart
6. Completes payment
7. Pharmacy processes order
8. Delivery within few hours

---

## 📊 Future Enhancements

* 🔊 Voice-based medicine search
* 🚁 Drone delivery integration
* 📈 Advanced AI analytics dashboard
* 🧠 Personalized health recommendations
* 📍 Real-time delivery tracking

---

## ⚠️ Important Notes

* ❌ Do NOT use `localhost` in deployed apps
* ✅ Always use deployed URLs
* ⚠️ Render free tier may sleep (normal behavior)
* ✅ MongoDB Atlas should allow access (`0.0.0.0/0`)

---

## 🤝 Contributors

* Anupam Jadhav
* Team Members

---

## 📄 License

This project is developed for educational and academic purposes.

---

## ⭐ Support

If you like this project:

👉 Give it a **star ⭐ on GitHub**
👉 Share with others
