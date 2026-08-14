// ── Firebase bootstrap ──────────────────────────────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import {
  getFirestore, onSnapshot as firebaseOnSnapshot,
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyADxqvXuy61QfRXyd7gLV6mWavokJ3InSg",
  authDomain: "byteblitzonline.firebaseapp.com",
  projectId: "byteblitzonline",
  storageBucket: "byteblitzonline.firebasestorage.app",
  messagingSenderId: "344331634699",
  appId: "1:344331634699:web:6f8f7b7ee5834bb83c9f0e",
  measurementId: "G-B6DL8J108T",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: "select_account" });
setPersistence(auth, browserLocalPersistence).catch(() => {});

// Re-export the SDK surface the rest of the app uses, so no other module has
// to repeat the CDN URLs. Every real-time stream uses this guard: Firestore
// errors stay visible in the console but cannot become unhandled rejections
// that leave the surrounding component in a half-loaded state.
export function onSnapshot(target, next, onError) {
  return firebaseOnSnapshot(target, next, (error) => {
    console.error("Firestore listener stopped", error);
    if (typeof onError === "function") onError(error);
  });
}

// Anonymous auth is deliberately absent: guest play is local-only and never
// talks to Firebase (see local.js).
export {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup,
  signOut, onAuthStateChanged, updateProfile,
  sendPasswordResetEmail, linkWithPopup, EmailAuthProvider, linkWithCredential,
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

export {
  doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, collection,
  query, where, orderBy, limit, serverTimestamp, increment,
  writeBatch, runTransaction, collectionGroup, arrayUnion, arrayRemove,
  deleteField, startAfter,
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
