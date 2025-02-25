import React, { useEffect, useState } from "react";
import ListPage from "../Pages/ListPage";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useUserStore } from "../lib/userStore";
import { useChatStore } from "../lib/chatStore";
import ChatWindow from "../List/ChatWindow";
import Chats from "../Chat/Chats";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { IoChatbubbleEllipses } from "react-icons/io5";

const PagesHolder = () => {
  const { currentUser, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 980);

  // Update screen size on resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 980);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  console.log(currentUser);

  return (
    <div className="">
      {/* <h1 className=" we:hidden text-white text-[24px] justify-center pb-[0.5rem] flex gap-[5px] items-center">
        <IoChatbubbleEllipses size={40} />
        Chatify
      </h1> */}
      <div className="flex bg-white text-black w-full we:max-w-fit h-[100vh] we:h-[90vh] rounded-[12px] border border-[#7879f1]">
        {(!chatId || !isMobile) && (
          <div className="flex-grow w-[99.5vw] we:max-w-fit border-r border-r-[#7879f1]">
            <ListPage />
          </div>
        )}

        {(chatId || !isMobile) && (
          <div className="flex-grow w-[99.5vw] we:w-[60vw]">
            {isMobile && chatId && (
              <button
                onClick={() => useChatStore.setState({ chatId: null })}
                className="absolute top-[5rem] left-[2rem] hidden"
              >
                <MdOutlineKeyboardBackspace
                  size={25}
                  className="text-blue-700"
                />
              </button>
            )}
            {chatId ? <Chats /> : <ChatWindow />}
          </div>
        )}
      </div>
    </div>
  );
};

export default PagesHolder;
