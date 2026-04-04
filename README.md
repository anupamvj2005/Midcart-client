# 💊 PharmaX – Intelligent Online Pharmacy Platform

A full-stack MERN + Python ML pharmacy system with prescription upload, smart inventory, demand forecasting & more.

## 📁 Project Structure

```
PharmaX/
├── client/          → React.js (Vite) – User Interface
├── server/          → Node.js + Express.js – REST API
├── ml-api/          → Python Flask – ML Microservice
└── database/        → MongoDB Schemas + Seed Data
```

## 🚀 How to Run Locally

You can launch all services (client, server, ml-api) concurrently with a single command!

### Prerequisites:
- Node.js installed
- Python installed
- MongoDB installed locally or MongoDB Atlas connection string configured in `server/.env`.
  *(Copy `server/.env.example` to `server/.env` and update your `MONGO_URI` and `JWT_SECRET` prior to starting)*

### Start Services:
```bash
# In the root folder context:
npm run dev
```

This single command will install all missing dependencies and start your services:
- **Client (React)** – Runs on `http://localhost:5173`
- **Server (Node)** – Runs on `http://localhost:5000`
- **ML API (Python)** – Runs on `http://localhost:8000`

---

## 🌍 How to Deploy for Free

This project is fully configured for free deployment via **Vercel** (Frontend) and **Render** (Backend & ML API).

### 1. Deploy Databases & APIs to Render
The `server` and `ml-api` can be deployed simultaneously using the provided `render.yaml` Blueprint.

1. Go to [Render.com](https://render.com) and create an account.
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file in the root folder and configure your **pharmax-server** and **pharmax-ml-api** services.
5. In the Render Dashboard, open the Environment settings for **pharmax-server** and specify these fields when prompted:
   - `MONGO_URI`: Your MongoDB Atlas URL
   - `JWT_SECRET`: A secure random string for JWTs
   - `CLIENT_URL`: Your Vercel frontend URL (You will update this after you deploy step 2).

### 2. Deploy Client to Vercel
The frontend React app is optimized for Vercel deployment. (A `vercel.json` routing configuration is included in `client/`).

1. Go to [Vercel.com](https://vercel.com) and create an account.
2. Click **Add New...** and select **Project**.
3. Import your GitHub repository.
4. In the project configuration, set the **Root Directory** to `client`.
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: Set this to your new Render Backend URL (e.g., `https://pharmax-server.onrender.com/api`).
6. Click **Deploy**.

**Remember:** After Vercel deploys your frontend, grab the generated frontend URL and add it to your Render Backend's `CLIENT_URL` environment variable to ensure CORS works correctly.

---

## 🔑 Default Admin Credentials
- Email: `admin@smartpharma.com`
- Password: `Admin@123`

## 🌟 Features
- 📄 Prescription Upload & OCR
- 💊 Medicine Search & Ordering
- 🛒 Smart Cart & Checkout
- 📊 Admin Dashboard with Analytics
- 🤖 ML Demand Forecasting
- ⚠️ Low Stock & Expiry Alerts
- 💡 Medicine Recommendations
- 📱 Responsive Design