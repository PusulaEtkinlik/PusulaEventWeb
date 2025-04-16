import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc
} from "firebase/firestore";
import { auth, db } from "../firebase";


export async function isPhoneAdmin(phoneNumber) {
  const q = query(
    collection(db, "admins"),
    where("phone", "==", phoneNumber),
    where("role", "==", "admin")
  );

  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}
export async function registerAdmin({ password, phone, role = "normal", firstName, lastName }) {
    const q = query(collection(db, "admins"), where("phone", "==", phone));
    const snapshot = await getDocs(q);
  
    if (!snapshot.empty) {
      throw new Error("Bu telefon numarasıyla kayıtlı bir admin zaten var.");
    }
  
    const fakeEmail = `${phone.replace("+", "")}@pusula.fake`;
    const userCred = await createUserWithEmailAndPassword(auth, fakeEmail, password);
    const user = userCred.user;
  
    await setDoc(doc(db, "admins", user.uid), {
      uid: user.uid,
      phone,
      firstName,
      lastName,
      role
    });
  
    return user;
  }

import { signInWithEmailAndPassword } from "firebase/auth";

export async function loginAdmin(email, password) {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  return userCred.user;
}