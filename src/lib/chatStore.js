import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firebase";
import { useUserStore } from "./userStore";

export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  unsubscribe: null, // Store Firestore listener reference

  changeChat: async (chatId, user) => {
    const currentUser = useUserStore.getState().currentUser;

    try {
      // Fetch latest block status
      const userDoc = await getDoc(doc(db, "users", user.id));
      const currentUserDoc = await getDoc(doc(db, "users", currentUser.id));

      const userData = userDoc.exists() ? userDoc.data() : {};
      const currentUserData = currentUserDoc.exists()
        ? currentUserDoc.data()
        : {};

      const isBlockedByCurrentUser = currentUserData?.blocked?.includes(
        user.id
      );
      const isBlockedByReceiver = userData?.blocked?.includes(currentUser.id);

      // Set the chat state
      set({
        chatId,
        user: isBlockedByReceiver ? null : user,
        isCurrentUserBlocked: isBlockedByReceiver,
        isReceiverBlocked: isBlockedByCurrentUser,
      });

      // Unsubscribe from previous listener if it exists
      const previousUnsubscribe = useChatStore.getState().unsubscribe;
      if (previousUnsubscribe) previousUnsubscribe();

      // Real-time updates for block status
      const unsubscribe = onSnapshot(doc(db, "users", user.id), (docSnap) => {
        const updatedUserData = docSnap.data();
        const updatedIsBlockedByReceiver = updatedUserData?.blocked?.includes(
          currentUser.id
        );

        set({
          isCurrentUserBlocked: updatedIsBlockedByReceiver,
        });
      });

      // Save the new unsubscribe function
      set({ unsubscribe });
    } catch (error) {
      console.error("Error fetching block status:", error);
    }
  },

  changeBlock: async () => {
    set((state) => ({
      ...state,
      isReceiverBlocked: !state.isReceiverBlocked,
    }));
  },
}));
