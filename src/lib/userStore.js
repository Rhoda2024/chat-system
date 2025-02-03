import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";

export const useUserStore = create((set) => {
  const fetchUserInfo = async (uid) => {
    if (!uid) {
      set({ currentUser: null, isLoading: false });
      return;
    }

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({ currentUser: docSnap.data(), isLoading: false });
      } else {
        set({ currentUser: null, isLoading: false });
      }
    } catch (error) {
      console.log("Error fetching user info:", error);
      set({ currentUser: null, isLoading: false });
    }
  };

  set({ isLoading: true }); // Initially set loading to true

  onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchUserInfo(user.uid); // Fetch user data from Firestore
    } else {
      set({ currentUser: null, isLoading: false });
    }
  });

  return {
    currentUser: null,
    isLoading: true,
    fetchUserInfo,
  };
});
