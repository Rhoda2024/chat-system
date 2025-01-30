import React, { useEffect, useState } from "react";
import img from "../assets/avatar.png";
import { db } from "../lib/firebase";
import { useChatStore } from "../lib/chatStore";
import {
  arrayRemove,
  arrayUnion,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { useUserStore } from "../lib/userStore";
import { MdKeyboardArrowUp, MdOutlineKeyboardArrowDown } from "react-icons/md";
import { toast } from "react-toastify";

const Detailss = () => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } =
    useChatStore();
  const [view, setView] = useState(false);
  const { currentUser } = useUserStore();

  const toggleView = () => {
    setView(!view);
  };

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      // Debugging: Log the action
      console.log(
        isReceiverBlocked ? "Unblocking user..." : "Blocking user...",
        user.id
      );

      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
        lastUpdated: new Date(), // Force re-fetch for other user
      });

      // Debugging: Log success
      console.log(
        isReceiverBlocked
          ? "User unblocked successfully."
          : "User blocked successfully."
      );

      changeBlock();
    } catch (error) {
      console.error("Error updating block status:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  // Listen for real-time updates to the blocked status
  useEffect(() => {
    if (!user || !currentUser) return;

    const userDocRef = doc(db, "users", user.id);

    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      const data = doc.data();
      console.log("User document updated:", data); // Debugging: Log the document data

      if (data?.blocked?.includes(currentUser.id)) {
        console.log("You have been blocked by this user.");
        // Optionally, update the UI to reflect the blocked status
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [user, currentUser]);

  // Listen for real-time updates to the chat state
  useEffect(() => {
    if (!currentUser || !chatId) return;

    const chatDocRef = doc(db, "chats", chatId);

    const unsubscribe = onSnapshot(chatDocRef, (doc) => {
      const data = doc.data();
      console.log("Chat document updated:", data); // Debugging: Log the document data

      if (data?.lastUpdated) {
        console.log("Chat state updated. Re-fetching data...");
        // Add logic to re-fetch chat data or update the UI
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [currentUser, chatId]);

  return (
    <div className="detail">
      <div className="py-[30px] px-[10px] flex flex-col items-center gap-[5px] border-b-[#7879f1] border-b">
        <img
          src={user?.avatar || img}
          alt=""
          className="w-[100px] h-[100px] object-cover rounded-[50%]"
        />
        <h3 className="text-[24px]">{user?.username}</h3>
        <p className="text-[16px]">{user?.email}</p>
      </div>

      <div className="p-[30px] flex flex-col gap-[25px]">
        <div className="">
          <div className="flex items-center justify-between">
            <span>Chat Settings</span>
            <MdKeyboardArrowUp
              size={30}
              color="white"
              alt=""
              className="w-[30px] h-[30px] bg-[#7879f1] cursor-pointer rounded-[50%] p-[2px]"
            />
          </div>
        </div>

        <div className="">
          <div className="flex items-center justify-between">
            <span>Privacy & help</span>
            <div
              className="w-[30px] h-[30px] bg-[#7879f1] flex items-center cursor-pointer rounded-[50%] p-[2px]"
              onClick={toggleView}
            >
              {view ? (
                <MdOutlineKeyboardArrowDown color="white" size={30} />
              ) : (
                <MdKeyboardArrowUp size={30} color="white" />
              )}
            </div>
          </div>
        </div>

        {view && (
          <button
            onClick={handleBlock}
            className="p-[10px] border border-[#7879f1] text-black rounded-[5px] cursor-pointer hover:bg-[rgba(220,20,60,0.88)] hover:text-white hover:border-none"
          >
            {isCurrentUserBlocked
              ? "You are Blocked"
              : isReceiverBlocked
              ? "Unblock"
              : "Block User"}
          </button>
        )}
      </div>
    </div>
  );
};

export default Detailss;
