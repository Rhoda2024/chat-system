import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../lib/userStore";

const Login = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  console.log(currentUser);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

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

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log(currentUser);
      toast.success("success");
      navigate("/");
    } catch (error) {
      console.log(error);
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
      "auth/invalid-password": "Incorrect password. Please try again.",
    };
    return (
      errorMessages[errorCode] ||
      "An unexpected error occurred. Please try again."
    );
  };

  return (
    <div className="flex flex-col gap-[3rem] xl:gap-[8rem] lg:flex-row items-center w-full lg:px-[2rem] ">
      <div className=" max-w-[200px] sm:max-w-[350px] lg:max-w-[650px]">
        <img src={"/chatimg.svg"} alt="" />
      </div>

      <div className="flex flex-col gap-[20px] items-center justify-center">
        <h2 className="font-medium text-white text-[40px] sm:text-[50px]">
          Welcome back
        </h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-[20px]">
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
            className=" outline-none w-[300px] de:w-[390px] sm:w-[500px] p-[20px] text-[20px] rounded-[1rem] text-black"
          />

          <button
            className="bg-transparent border-2 text-white text-[20px] border-blue-900 hover:bg-blue-950 p-[10px] rounded-[12px] "
            disabled={loading}
          >
            {loading ? "Loading..." : "Sign In"}
          </button>
        </form>
        <p className="text-blue-950 text-[18px] sm:text-[24px] ">
          Don't have an account ? Register{" "}
          <Link to="/register" className="underline hover:text-blue-200">
            here
          </Link>
        </p>

        <ToastContainer />
      </div>
    </div>
  );
};

export default Login;
