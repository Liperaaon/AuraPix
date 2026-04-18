# 🚀 AuraPix 
**Full-Stack Financial Services Platform**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

> A modern financial management and payment solution designed to simplify Pix transactions, credit management, and personal finances. Built by **Prime Studios** with a strict focus on high security, sleek UI/UX, and native mobile performance.

## ✨ Key Features

* 🔐 **Native Biometric Authentication:** Secure and seamless access using device hardware (fingerprint/facial recognition) via `@capgo/capacitor-native-biometric`.
* 🔔 **Real-Time Push Notifications:** Integrated with Firebase Cloud Messaging (FCM) and native Capacitor plugins to provide instant transaction alerts, even in the background.
* 💸 **Advanced Pix & Credit Engine:** Dedicated ecosystem for Pix transfers with real-time validation for Brazilian document standards (CPF/CNPJ) via `cpf-cnpj-validator`, plus a real-time credit limit simulation engine.
* 🌓 **Dynamic Theming & Fluid UI:** Automatically adapts to the user's system preferences (Dark/Light mode). Interface enriched with smooth entry animations (`animate-in`) and TailwindCSS.
* 📱 **True Mobile-First UX:** Built with React and Capacitor, ensuring a native feel. Features custom back-button logic interception, safe-area padding for modern notch devices, and offline-aware error handling.

## 🛠️ Tech Stack

**Frontend & UI:**
* React.js (Hooks, Context)
* Tailwind CSS (Responsive styling & Dark Mode)
* Lucide React (Scalable iconography)

**Mobile Engine:**
* Capacitor.js (Android/iOS seamless web-to-native wrapper)
* Push Notifications & Biometric Native Plugins

**Backend & Cloud Services:**
* Node.js & Express (AuraPix Brain Server)
* Firebase (Authentication, Firestore, Cloud Messaging)
* API Integrations: ViaCEP for address resolution and Asaas/Custom Gateway for payment processing.

## 🛡️ Security & Performance

* **Environment Protection:** Sensitive data and API keys are strictly managed through `.env` variables to prevent credential leakage.
* **Input Sanitization:** Real-time masking, math validation for documents (CPF), and controlled inputs to prevent front-end vulnerabilities.
* **Offline Resilience:** Implementation of `AbortController` and `navigator.onLine` checks to gracefully handle network timeouts and prevent infinite loading states.

## 📦 Project Structure 

```text
src/
 ├── components/       # Reusable UI components (Pix, Profile, Limits, Notifications)
 ├── termo/            # Legal documents, Privacy Policies, and Help Center
 ├── assets/           # Static images, brand assets, and icons
 └── App.jsx           # Main application logic, state management, and routing
