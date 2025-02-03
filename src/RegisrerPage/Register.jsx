import React, { useState } from "react";
import img from "../assets/avatar.png";
import { toast, ToastContainer } from "react-toastify";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });
  const [username, setUsername] = useState(""); // Store username in state
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const uploadToCloudinary = async (file) => {
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/ds3vaxiod/image/upload`;
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", "chatapp");

    try {
      const response = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);

      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      throw error;
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      // Check if the username is already in use
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        toast.error("This username is not available.");
        setLoading(false);
        return; // Stop the registration process
      }
      if (!email || !password) {
        toast.error("Email and password are required!");
        setLoading(false);
        return;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        toast.error("Please enter a valid email address.");
        setLoading(false);
        return;
      }

      // Create user with Firebase Authentication
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // Upload avatar to Cloudinary if an image is selected
      const imgUrl = avatar.file ? await uploadToCloudinary(avatar.file) : null;

      // Use first letter of username if no image is uploaded
      const avatarPlaceholder = username.charAt(0).toUpperCase();

      // Add user to Firestore
      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl || avatarPlaceholder,
        id: res.user.uid,
        blocked: [],
      });

      // Create an empty chat structure
      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });

      toast.success("Account created! You can login now");
      navigate("/");
    } catch (error) {
      console.error("Registration Error:", error);
      const errorMessage = mapAuthError(error.code);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const mapAuthError = (errorCode) => {
    const errorMessages = {
      "auth/invalid-email": "The email address is not valid.",
      "auth/user-disabled": "This user account has been disabled.",
      "auth/invalid-credential": "No user found with this email.",
      "auth/email-already-in-use": "Email is already in use",
      "auth/invalid-password": "Incorrect password. Please try again.",
    };
    return (
      errorMessages[errorCode] ||
      "An unexpected error occurred. Please try again."
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-[2rem] xl:gap-[8rem] items-center w-full lg:px-[2rem]">
      <div className="max-w-[200px] sm:max-w-[350px] lg:max-w-[650px]">
        <img src={"/chatimg.svg"} alt="" />
      </div>

      <div className="flex flex-col gap-[10px] items-center">
        <h2 className="font-medium text-white text-[35px] sm:text-[50px]">
          Create an Account
        </h2>
        <form onSubmit={handleRegister} className="flex flex-col gap-[20px]">
          <label htmlFor="file" className="flex items-center gap-[15px]">
            {avatar.url ? (
              <img
                src={avatar.url}
                alt="Profile"
                className="rounded-full w-[60px] sm:w-[90px]"
              />
            ) : (
              <div className="w-[60px] sm:w-[90px] h-[60px] sm:h-[90px] flex items-center justify-center bg-gray-500 text-white text-3xl font-bold rounded-full">
                {username ? username.charAt(0).toUpperCase() : "?"}
              </div>
            )}
            <p className="text-[18px] sm:text-[24px] cursor-pointer underline hover:text-blue-200">
              Upload a Profile Picture
            </p>
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatar}
          />
          <input
            type="text"
            placeholder="Username..."
            name="username"
            className="w-[300px] de:w-[390px] sm:w-[500px] p-[20px] text-[20px] rounded-[1rem] outline-none text-black"
            value={username} // Bind input to state
            onChange={(e) => setUsername(e.target.value)} // Update state on change
          />
          <input
            type="email"
            placeholder="Email..."
            name="email"
            className="w-[300px] de:w-[390px] sm:w-[500px] p-[20px] text-[20px] rounded-[1rem] outline-none text-black"
          />
          <input
            type="password"
            placeholder="Password..."
            name="password"
            className="w-[300px] de:w-[390px] sm:w-[500px] p-[20px] text-[20px] rounded-[1rem] outline-none text-black"
          />

          <button
            className="bg-transparent border-2 text-white text-[20px] border-blue-900 hover:bg-blue-950 p-[10px] rounded-[12px]"
            disabled={loading}
          >
            {loading ? "Loading..." : "Sign Up"}
          </button>
        </form>
        <p className="text-blue-950 text-[18px] sm:text-[24px]">
          Already have an account? Login{" "}
          <Link to="/login" className="underline hover:text-blue-200">
            here
          </Link>
        </p>

        <ToastContainer />
      </div>
    </div>
  );
};

export default Register;
