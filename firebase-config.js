// =====================================================
//  RealGym — Firebase Configuration
//  Google Firestore + Firebase Storage (Free Tier)
// =====================================================

const firebaseConfig = {
    apiKey: "AIzaSyDFbPKJn1PAKoOeOgRYptjncEcZngcilcE",
    authDomain: "realgym-5fdc6.firebaseapp.com",
    projectId: "realgym-5fdc6",
    storageBucket: "realgym-5fdc6.firebasestorage.app",
    messagingSenderId: "584835744398",
    appId: "1:584835744398:web:09f2460a3d5c063b9bffdf"
};

// Initialize Firebase (compat SDK)
firebase.initializeApp(firebaseConfig);

// Global Firestore handle used throughout the site
const db = firebase.firestore();

// Razorpay Payment Gateway Configuration
// Enter your live Razorpay Key ID here once you have activated your account.
// Using default test key for testing.
const RAZORPAY_KEY_ID = "rzp_test_5S3RzT0Zt2c9ff";

console.log("✅ RealGym Firebase connected — Firestore ready.");
