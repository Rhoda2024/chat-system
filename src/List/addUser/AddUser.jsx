import React, { useState } from "react";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import { TiTimes } from "react-icons/ti";

const AddUser = ({ setAddMode }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));

      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0].data());
        setError("");

        // ✅ CLEAR INPUT AFTER SEARCH
        e.target.reset();
      } else {
        setError("User does not exist");
      }
    } catch (error) {
      console.log("Error fetching user:", error);
    }
  };

  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");

    try {
      const currentUserChatsDoc = await getDoc(
        doc(userChatsRef, currentUser.id)
      );

      if (currentUserChatsDoc.exists()) {
        const currentUserChats = currentUserChatsDoc.data().chats || [];

        const chatExists = currentUserChats.some(
          (chat) => chat.receiverId === user.id
        );

        if (chatExists) {
          setError("Chat already exists with this user.");
          return;
        }
      }

      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });

      console.log("New chat created:", newChatRef.id);

      // ✅ CLEAR USER & CLOSE FORM
      setUser(null); // Hide user details
      setAddMode(false); // Close modal if using state to toggle visibility
      setError(""); // Reset error
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className=" fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
      <div className="  max-w-fit h-fit sm-[300px] p-[25px] de:p-[25px] bg-white rounded-[18px]  shadow-2xl">
        <div className="flex justify-between">
          <p className=" text-[24px] pb-3 ">New Chat</p>
          <TiTimes
            size={30}
            className="cursor-pointer text-gray-500 hover:text-black"
            onClick={() => setAddMode(false)}
          />
        </div>
        <form className="flex gap-[20px]" onSubmit={handleSearch}>
          <input
            className="p-[10px] rounded-[10px] bg-transparent border w-[150px] sm:w-full  border-[#7879f1] outline-none  "
            type="text"
            placeholder="Username..."
            name="username"
          />
          <button className="px-[20px] py-[15px] rounded-[10px] bg-[#7879f1] hover:text-white hover:bg-[#4949a8] ">
            Search
          </button>
        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {user && (
          <div className="mt-[50px] flex items-center justify-between  ">
            <div className=" flex items-center gap-[20px] ">
              {user?.avatar && user?.avatar.includes("http") ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-[50px] h-[50px] object-cover rounded-full"
                />
              ) : (
                <div className="w-[50px] h-[50px] flex items-center justify-center bg-gray-500 text-white text-[24px] font-bold rounded-full">
                  {user?.username ? user.username.charAt(0).toUpperCase() : "?"}
                </div>
              )}
              <span>{user.username}</span>
            </div>
            <button
              className="px-[10px] py-[15px] rounded-[10px] bg-[#7879f1] hover:text-white hover:bg-[#4949a8] cursor-pointer border-none "
              onClick={handleAdd}
            >
              Add User
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddUser;
