import React, { useState } from "react";
import avatar from "../assets/avatar.png";
import { useUserStore } from "../lib/userStore";
import { auth } from "../lib/firebase";
import { TbLogout } from "react-icons/tb";
import {
  doc,
  deleteDoc,
  getDocs,
  collection,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { getAuth, deleteUser } from "firebase/auth";
import { db } from "../lib/firebase"; // Your Firebase config
import { FaTrash } from "react-icons/fa";

const UserInfo = () => {
  const [tooltip, setTooltip] = useState("");
  const [tooltip1, setTooltip1] = useState("");
  const [showConfirm, setShowConfirm] = useState(false); // State for confirmation modal
  const { currentUser } = useUserStore();

  const handleDeleteAccount = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.log("No user is logged in.");
      return;
    }

    try {
      const userChatsRef = doc(db, "userchats", user.uid);
      const userDocRef = doc(db, "users", user.uid);

      // Find all chats where this user is involved
      const chatsQuery = query(
        collection(db, "chats"),
        where("participants", "array-contains", user.uid)
      );
      const chatsSnapshot = await getDocs(chatsQuery);

      // Batch delete operation for Firestore
      const batch = writeBatch(db);

      // Remove user's personal chat list
      batch.delete(userChatsRef);

      // Remove user profile
      batch.delete(userDocRef);

      // Remove this user from all chats they were a part of
      chatsSnapshot.forEach((chatDoc) => {
        const chatData = chatDoc.data();
        const chatRef = doc(db, "chats", chatDoc.id);

        if (chatData.participants.includes(user.uid)) {
          batch.update(chatRef, {
            participants: chatData.participants.filter((id) => id !== user.uid),
          });
        }
      });

      // Commit batch deletion
      await batch.commit();

      // Delete user from Firebase Auth
      await deleteUser(user);

      console.log("Account deleted successfully.");
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  return (
    <div className="p-[20px] border-b border-b-[#7879f1] we:border-none flex items-center justify-between">
      <div className="flex items-center gap-[20px]">
        {currentUser.avatar && currentUser.avatar.startsWith("http") ? (
          <img
            src={currentUser.avatar}
            alt=""
            className="w-[50px] h-[50px] rounded-full object-cover"
          />
        ) : (
          <div className="w-[50px] h-[50px] flex items-center justify-center bg-[#7879f1] text-white text-xl font-bold rounded-full">
            {currentUser.username
              ? currentUser.username.charAt(0).toUpperCase()
              : "?"}
          </div>
        )}
        <h3>{currentUser.username}</h3>
      </div>

      <div className="flex items-center gap-[20px]">
        <div className="relative inline-block">
          <FaTrash
            size={20}
            onClick={() => setShowConfirm(true)} // Show confirmation modal
            className="text-[#7879f1] cursor-pointer"
            onMouseEnter={() => setTooltip1("Delete")}
            onMouseLeave={() => setTooltip1("")}
          />

          {tooltip1 && (
            <div className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 bg-[#7879f1] text-white text-sm rounded-md px-2 py-1 z-10">
              {tooltip1}
            </div>
          )}
        </div>

        <div className="relative inline-block">
          <TbLogout
            size={25}
            color="#7879f1"
            onClick={() => auth.signOut()}
            className="cursor-pointer"
            onMouseEnter={() => setTooltip("Logout")}
            onMouseLeave={() => setTooltip("")}
          />

          {tooltip && (
            <div className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 bg-[#7879f1] text-white text-sm rounded-md px-2 py-1 z-10">
              {tooltip}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-lg font-semibold">Are you sure?</h2>
            <p className="text-gray-600">
              Do you really want to delete your account?
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={handleDeleteAccount}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-300 px-4 py-2 rounded-md"
              >
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfo;
