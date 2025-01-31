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

const AddUser = () => {
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

      console.log(newChatRef.id);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-fit h-fit sm-[300px] p-[15px] de:p-[25px] bg-white rounded-[18px] absolute top-[25rem] left-[1.6rem] de:left-[5rem]  we:left-[30rem] shadow-2xl ">
      <div>
        <p className=" text-[24px] pb-3 ">New Chat</p>
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
            <img
              src={user.avatar}
              alt=""
              className="w-[50px] h-[50px] rounded-[50%] object-cover "
            />
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
  );
};

export default AddUser;
