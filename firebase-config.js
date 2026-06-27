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

console.log("✅ RealGym Firebase connected — Firestore ready.");
