import React, { useEffect, useState } from "react";
import ChatPage from "../Pages/ChatPage";
import DetailPage from "../Pages/DetailPage";
import ListPage from "../Pages/ListPage";
import Notification from "../Notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useUserStore } from "../lib/userStore";
import { useChatStore } from "../lib/chatStore";

const PagesHolder = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const [isRegistering, setIsRegistering] = useState(false);
  const { chatId } = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  console.log(currentUser);

  if (isLoading)
    return (
      <div className=" p-[50px] text-[36px] rounded-[10px] bg-[rgba(17,25,40,0.9)] ">
        Loading...
      </div>
    );

  return (
    <div className=" flex bg-white text-black max-w-[85vw] h-[90vh] rounded-[12px] border-[#7879f1] border">
      <>
        <ListPage />
        {chatId && <ChatPage />}
        {/* {chatId && <DetailPage />} */}
      </>
      <Notification />
    </div>
  );
};

export default PagesHolder;
