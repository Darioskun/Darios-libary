// Firebase Configuration
// Thay đổi các giá trị này bằng thông tin từ Firebase Console của bạn

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com"
};

// Initialize Firebase (nếu bạn muốn dùng Firebase Realtime Database)
// Hiện tại backend đang xử lý, nhưng bạn có thể mở rộng sử dụng Firebase Client SDK

console.log('Firebase config loaded. Update with your Firebase credentials.');
