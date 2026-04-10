AuraPix - Full Stack Financial Services Platform
​AuraPix is a modern financial management and payment solution designed to simplify Pix transactions and credit management. Built with a focus on high security and native mobile performance, the application provides a seamless experience for both personal and business financial operations.
​🚀 Key Features
​Native Biometric Authentication: Secure access using fingerprint or facial recognition via @capgo/capacitor-native-biometric.
​Real-time Push Notifications: Integrated with Firebase Cloud Messaging (FCM) to provide instant transaction alerts even when the app is in the background.
​Advanced Pix Management: Full area dedicated to Pix transfers with real-time validation for Brazilian document standards (CPF/CNPJ).
​Dynamic Theme Support: Automatically adapts to the user's system preferences (Dark/Light mode).
​Mobile-First UX: Built using React and Capacitor, ensuring a native feel with handled back-button logic and safe-area padding for modern devices.
​🛠️ Tech Stack
​Frontend: React.js, Tailwind CSS, Lucide React (Icons).
​Mobile Engine: Capacitor.js (Android/iOS integration).
​Backend: Node.js, Express.
​Database & Auth: Firebase (Authentication, Firestore, Cloud Messaging).
​Integrations: External Payment Gateway APIs (Asaas). 
 
​📦 Project Structure
src/
├── components/     # Reusable UI components (Pix, Profile, Limits)
├── termo/          # Legal documents and Help Center
├── assets/         # Images and brand assets
└── App.jsx         # Main application logic and routing

 Security & Performance
​Environment Variables: Sensitive data is managed through .env files to prevent credential leakage.
​Input Sanitization: Real-time masking and validation for financial data and documents.
​Hardware Integration: Direct communication with mobile hardware for biometric security and push registration.
​👨‍💻 Developer
​Developed by Felipe Augusto (Founder of Prime Studios).
Currently pursuing a Bachelor’s Degree in Analysis and Systems Development.