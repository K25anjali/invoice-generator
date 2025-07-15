# 🧾 Subscription Billing System (Node.js + Express + Sequelize + PostgreSQL)

A robust backend application that handles multi-organization subscription billing, including user management, subscription plans, invoicing, payments, refunds, and authorization using JWT.

## 🚀 Features

- 🔐 JWT-based authentication and role validation
- 🏢 Multi-organization architecture
- 👥 User registration, login, and organizational association
- 📦 Subscription plan creation and upgrades
- 💳 Invoice generation and payment handling
- 💸 Refund processing with validation
- 📊 Organization summary with recent invoices & payments
- 📥 Sequelize ORM with auto migrations and associations

---

## 🏗️ Tech Stack

- **Node.js** + **Express** for the backend server
- **PostgreSQL** as the database
- **Sequelize** for ORM and model definitions
- **JWT** for secure auth middleware
- **dotenv**, **bcryptjs**, **jsonwebtoken**, etc.

---

## 📁 Project Structure

\`\`\`bash
.
├── config/
│ └── database.js # Sequelize DB setup & model loading
├── controllers/ # Business logic for routes
│ ├── authController.js
│ ├── organizationController.js
│ ├── subscriptionController.js
│ └── userController.js
├── middleware/
│ └── authMiddleware.js # JWT authentication middleware
├── models/ # Sequelize models (not shown here)
├── routes/
│ └── routes.js # Combined routes (auth, org, user, subs)
├── utils/
│ └── utils.js # Utility for checking user existence
├── .env
├── app.js (or server.js) # Entry point
\`\`\`

---

## 🧪 API Endpoints

> All protected routes require \`Authorization: Bearer <token>\`

### 🛂 Auth

| Method | Endpoint          | Description         |
| ------ | ----------------- | ------------------- |
| POST   | \`/api/register\` | Register user       |
| POST   | \`/api/login\`    | Login and get token |

---

### 🏢 Organization

| Method | Endpoint                          | Description                        |
| ------ | --------------------------------- | ---------------------------------- |
| POST   | \`/api/createOrganization\`       | Create new organization            |
| GET    | \`/api/getAllOrganizations\`      | List all organizations             |
| GET    | \`/api/organization/:id/summary\` | Summary (users, invoices, revenue) |

---

### 👥 User

| Method | Endpoint                        | Description              |
| ------ | ------------------------------- | ------------------------ |
| POST   | \`/api/createUser\`             | Create a user            |
| GET    | \`/api/getAllUsers\`            | List users               |
| GET    | \`/api/user/:id/subscriptions\` | Get user's subscriptions |

---

### 📦 Subscription & Invoicing

| Method | Endpoint                        | Description                    |
| ------ | ------------------------------- | ------------------------------ |
| POST   | \`/api/createSubscriptionPlan\` | Create plan for organization   |
| POST   | \`/api/subscribe\`              | Subscribe a user to a plan     |
| POST   | \`/api/pay_invoice\`            | Pay an invoice                 |
| GET    | \`/api/invoice/:id\`            | Get invoice details            |
| POST   | \`/api/upgrade_plan\`           | Upgrade a user’s plan          |
| POST   | \`/api/refund\`                 | Process a refund for a payment |

---

## ⚙️ Environment Variables (\`.env\`)

\`\`\`
PORT=5000
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_DIALECT=postgres
JWT_SECRET=your_jwt_secret
\`\`\`

---

## 🛠️ Setup Instructions

1. Clone the repo

\`\`\`bash
git clone https://github.com/your-username/subscription-billing-system.git
cd subscription-billing-system
\`\`\`

2. Install dependencies

\`\`\`bash
npm install
\`\`\`

3. Create \`.env\` file (see above)

4. Start the server

\`\`\`bash
npm start
\`\`\`

5. Test with Postman or any API tool

---

## 📌 Notes

- Sequelize models are dynamically loaded from the \`models/\` directory.
- Use \`db.connectAndMigrate()\` for syncing schema (\`alter: true\` for dev).
- Custom error handling & authorization integrated in routes.

---

## 🧑‍💻 Author

**Anjali Kumari**  
[GitHub](https://github.com/k25anjali)

---
