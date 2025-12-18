"use client";
import Footer from "@/components/Footer";
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { VscLoading } from "react-icons/vsc";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { useMediaQuery } from 'react-responsive';
function Signin() {


  
    const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1000px)' });
const Bigtablet = useMediaQuery({ minWidth: 700, maxWidth: 1000 });
    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 699px)' });
  const { signIn, isLoaded, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password: password,
      });

      if (result.status === "complete") {
        await setActive({
          session: result.createdSessionId,
          beforeEmit: async (session) => {
            return session;
          },
        });

        if (typeof window !== "undefined") {
          if (rememberMe) {
            localStorage.setItem("clerk_remember_me", "true");
          } else {
            localStorage.removeItem("clerk_remember_me");
          }
        }

        toast.success("Login successful!", {
          description: "Welcome back to E-Compare",
        });

        router.push("/");
      } else {
        const errorMsg = "Sign in incomplete. Please try again.";
        toast.error("Login failed", {
          description: errorMsg,
        });
        setError(errorMsg);
      }
    } catch (err) {
      console.error("Sign-in error:", err);
      const errorMessage =
        err.errors?.[0]?.message || "Invalid email or password";
      toast.error("Login failed", {
        description: errorMessage,
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = (provider) => {
    if (!isLoaded) return;

    const strategy = provider === "google" ? "oauth_google" : "oauth_facebook";

    if (typeof window !== "undefined") {
      if (rememberMe) {
        localStorage.setItem("clerk_remember_me", "true");
      } else {
        localStorage.removeItem("clerk_remember_me");
      }
    }

    try {
      signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: window.location.origin + "/sso-callback",
        redirectUrlComplete: window.location.origin + "/",
      });
    } catch (err) {
      const providerName = provider === "google" ? "Google" : "Facebook";
      toast.error(`${providerName} login failed`, {
        description: "Please try again or use a different method",
      });
    }
  };

  return (
<>
    {isDesktopOrLaptop &&
    <>
    <div className="flex flex-col lg:flex-row items-stretch justify-center max-w-screen overflow-x-hidden min-h-screen lg:h-screen text-white">
      <div className="min-h-[40vh] lg:min-h-screen w-full lg:w-1/2 px-6 sm:px-10 py-5 flex items-center justify-between flex-col sticky top-0">
        <div className="w-full">
          <h1
            onClick={() => router.push("/")}
            className="relative inline-block text-[24px] font-vagRounded font-bold cursor-pointer group text-white"
          >
            Go to home
            <span className="absolute left-1/2 bottom-0 h-[2px] w-0 bg-white transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
          </h1>
        </div>
        <div className="cursor-default text-center lg:text-left">
          <h1 className="text-3xl font-bold font-vagRounded sm:text-4xl lg:text-5xl text-white">
            Welcome to
          </h1>
          <p className="font-baloo text-5xl  sm:text-6xl lg:text-8xl whitespace-nowrap">
            E-Compare
          </p>
          <div className="">
            <p className="font-vagRounded text-lg font-regular sm:text-[24px] lg:text-2xl mt-1">
              Start your <span className="font-semibold">smart</span> online
              shopping here.
            </p>
          </div>
        </div>
        <div className="cursor-default hidden lg:block w-full">
          <div className="cursor-default hidden lg:block w-full self-end mt-auto mb-[-16px]
     [&_footer]:!static [&_footer]:!bottom-auto [&_footer]:!left-auto [&_footer]:w-full">
            <Footer />
          </div>
        </div>
      </div>

      {/* right side */}

      <div className="w-full px-6 py-10 lg:w-1/2 sm:px-10 lg:overflow-y-auto scrollbar !bg-black/20
      inner-shadow-y border-l border-gray-500">
        <form onSubmit={handleSubmit}>
          {/* Email or Username */}
          <div className="mb-7 sm:mb-10">
            <p className="cursor-default mb-3 text-[20px] font-normal text-white font-vagRounded">
              Email or Username
            </p>

            {/* ✅ wrap the input in glass-search div */}
            <div className="h-[64px] glass-loginInput relative w-full">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-full  text-white placeholder-white/50 text-[16px] 
               font-normal transition-all duration-300  focus:outline-none"
                placeholder="Enter your email address or username"
              />
            </div>
          </div>
          {/* Password */}
          <div className="mb-7">
            <p className="cursor-default mb-3 text-[20px] font-normal text-white font-vagRounded">
              Password
            </p>

            {/* ✅ wrap the input and eye toggle in glass-search div */}
            <div className="h-[64px] glass-loginInput relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full  rounded-2xl text-white placeholder-white/50 text-[16px]
                 font-normal transition-all duration-300  bg-transparent focus:outline-none"
                placeholder="Enter your password"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          <div className="flex flex-row items-start justify-between gap-10 mb-10 sm:flex-row sm:items-center sm:mb-18">
            <div className="flex items-center gap-2 ">
              <input
                className="glass-checkbox"
                type="checkbox"
                id="option1"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label
                htmlFor="option1"
                className=" font-vagRounded font-normal cursor-pointer text-[16px] text-white"
              >
                Remember me
              </label>
            </div>
            <div className="flex items-center">
              <h1
                onClick={() => router.push("/forgot-password")}
                className="text-white relative inline-block  hover:text-gray-300 text-lg font-normal cursor-pointer text-[16px] font-vagRounded"
              >
                Forgot password
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
              </h1>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between sm:gap-10">
            <div className="flex items-center justify-center w-full">
              <button
                type="submit"
                disabled={loading || !isLoaded}
                className="w-full px-2 text-lg glass-loginButton sm:w-auto sm:text-xl sm:px-12 font-vagRounded text-white"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <VscLoading className="animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Login Now"
                )}
              </button>
            </div>

            <div>
              <p className="cursor-default text-center text-white font-vagRounded text-[24px]">
                or
              </p>
            </div>

            <div className="flex flex-col items-center justify-center w-full gap-4 sm:gap-5 text-[16px]">
              <button
                type="button"
                onClick={() => handleOAuthSignIn("google")}
                disabled={!isLoaded}
                className="search-button cursor-pointer flex flex-row items-center text-white justify-center w-full gap-2 px-6 text-base
               !w-full !rounded-[23px] !min-h-[64px] sm:w-auto sm:text-xl sm:px-12 font-vagRounded "
              >
                <FcGoogle className="text-2xl sm:text-4xl" />
                <span className="hidden  sm:inline">Login with Google</span>
                <span className="sm:hidden">Google</span>
              </button>




              <button
                type="button"
                onClick={() => handleOAuthSignIn("facebook")}
                disabled={!isLoaded}
              className="search-button cursor-pointer flex flex-row items-center text-white justify-center w-full gap-2 px-6 text-base
               !w-full !rounded-[23px] !min-h-[64px] sm:w-auto sm:text-xl sm:px-12 font-vagRounded"
              >
                <div className="p-2 sm:p-1 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-md"
                  >
                    <rect width="512" height="512" fill="#1877F2" rx="15" />
                    <path
                      fill="#fff"
                      d="M355.6 330.7l11.3-73.8h-70.8v-47.9c0-20.2 9.9-39.9 41.6-39.9h32.2V105c0 0-29.2-5-57.2-5-58.3 0-96.4 35.4-96.4 99.5v57.3H140v73.8h76.3v178.3c15.3 2.4 30.9 3.7 46.8 3.7s31.5-1.3 46.8-3.7V330.7h45.7z"
                    />
                  </svg>
                </div>
                <span className="text-hidden sm:inline">
                  Login with Facebook
                </span>
                <span className="sm:hidden">Facebook</span>
              </button>
            </div>

            <div>
              <p className=" cursor-default text-[16px] text-center text-white ">
                Don't have account?{" "}
                <span
                  onClick={() => router.push("/sign-up")}
                  className="font-vagRounded font-semibold text-[16px] text-white underline cursor-pointer underline-offset-2"
                >
                  Sign up
                </span>
              </p>
            </div>
          </div>
        </form>

        {/* Mobile footer */}
        <div className="cursor-default mt-8 text-center lg:hidden">
          <p className="text-lg font-bold">by Jeacodes</p>
        </div>
      </div>
    </div>
    </>
    
              }

               {Bigtablet &&
    <>
    <div className="flex flex-col lg:flex-row items-stretch justify-center !h-[100vh] overflow-x-hidden 
      text-white ">
      <div className=" !h-[100vh] w-full  px-10  py-5 flex items-center justify-between flex-col  top-0">
        <div className="w-full">
          <h1
            onClick={() => router.push("/")}
            className=" pt-10 relative inline-block text-[24px] font-vagRounded font-bold cursor-pointer group text-white"
          >
            Go to home
            <span className="absolute left-1/2 bottom-0 h-[2px] w-0 bg-white transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
          </h1>
        </div>
        <div className="cursor-default text-center lg:text-left">
          <h1 className="text-3xl font-bold font-vagRounded sm:text-4xl lg:text-5xl text-white">
            Welcome to
          </h1>
          <p className="font-baloo text-5xl  sm:text-6xl lg:text-8xl">
            E-Compare
          </p>
          <div className="">
            <p className="font-vagRounded text-lg font-regular sm:text-[24px] lg:text-2xl mt-1">
              Start your <span className="font-semibold">smart</span> online
              shopping here.
            </p>
          </div>
        </div>
        <div className="cursor-default hidden lg:block w-full">
          <div className="cursor-default hidden lg:block w-full self-end mt-auto mb-[-16px]
     [&_footer]:!static [&_footer]:!bottom-auto [&_footer]:!left-auto [&_footer]:w-full">
            <Footer />
          </div>
        </div>
      </div>

      {/* right side */}

         <div className="w-full px-6 py-10 lg:w-1/2 sm:px-10 lg:overflow-y-auto scrollbar !bg-black/20
      big-tablet border-l border-gray-500">
        <form onSubmit={handleSubmit}>
          {/* Email or Username */}
          <div className="mb-7 sm:mb-10">
            <p className="cursor-default mb-3 text-[20px] font-normal text-white font-vagRounded">
              Email or Username
            </p>

            {/* ✅ wrap the input in glass-search div */}
            <div className="h-[64px] glass-loginInput relative w-full">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-full  text-white placeholder-white/50 text-[16px] 
               font-normal transition-all duration-300  focus:outline-none"
                placeholder="Enter your email address or username"
              />
            </div>
          </div>
          {/* Password */}
          <div className="mb-7">
            <p className="cursor-default mb-3 text-[20px] font-normal text-white font-vagRounded">
              Password
            </p>

            {/* ✅ wrap the input and eye toggle in glass-search div */}
            <div className="h-[64px] glass-loginInput relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full  rounded-2xl text-white placeholder-white/50 text-[16px]
                 font-normal transition-all duration-300  bg-transparent focus:outline-none"
                placeholder="Enter your password"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          <div className="flex flex-row items-start justify-between gap-10 mb-10 sm:flex-row sm:items-center sm:mb-18">
            <div className="flex items-center gap-2 ">
              <input
                className="glass-checkbox"
                type="checkbox"
                id="option1"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label
                htmlFor="option1"
                className=" font-vagRounded font-normal cursor-pointer text-[16px] text-white"
              >
                Remember me
              </label>
            </div>
            <div className="flex items-center">
              <h1
                onClick={() => router.push("/forgot-password")}
                className="text-white relative inline-block  hover:text-gray-300 text-lg font-normal cursor-pointer text-[16px] font-vagRounded"
              >
                Forgot password
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
              </h1>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between sm:gap-10">
            <div className="flex items-center justify-center w-full">
              <button
                type="submit"
                disabled={loading || !isLoaded}
                className="w-full px-2 text-lg glass-loginButton sm:w-auto sm:text-xl sm:px-12 font-vagRounded text-white"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <VscLoading className="animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Login Now"
                )}
              </button>
            </div>

            <div>
              <p className="cursor-default text-center text-white font-vagRounded text-[24px]">
                or
              </p>
            </div>

            <div className="flex flex-col items-center justify-center w-full gap-4 sm:gap-5 text-[16px]">
              <button
                type="button"
                onClick={() => handleOAuthSignIn("google")}
                disabled={!isLoaded}
                className="search-button cursor-pointer flex flex-row items-center text-white justify-center w-full gap-2 px-6 text-base
               !w-full !rounded-[23px] !min-h-[64px] sm:w-auto sm:text-xl sm:px-12 font-vagRounded "
              >
                <FcGoogle className="text-2xl sm:text-4xl" />
                <span className="hidden  sm:inline">Login with Google</span>
                <span className="sm:hidden">Google</span>
              </button>




              <button
                type="button"
                onClick={() => handleOAuthSignIn("facebook")}
                disabled={!isLoaded}
              className="search-button cursor-pointer flex flex-row items-center text-white justify-center w-full gap-2 px-6 text-base
               !w-full !rounded-[23px] !min-h-[64px] sm:w-auto sm:text-xl sm:px-12 font-vagRounded"
              >
                <div className="p-2 sm:p-1 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-md"
                  >
                    <rect width="512" height="512" fill="#1877F2" rx="15" />
                    <path
                      fill="#fff"
                      d="M355.6 330.7l11.3-73.8h-70.8v-47.9c0-20.2 9.9-39.9 41.6-39.9h32.2V105c0 0-29.2-5-57.2-5-58.3 0-96.4 35.4-96.4 99.5v57.3H140v73.8h76.3v178.3c15.3 2.4 30.9 3.7 46.8 3.7s31.5-1.3 46.8-3.7V330.7h45.7z"
                    />
                  </svg>
                </div>
                <span className="text-hidden sm:inline">
                  Login with Facebook
                </span>
                <span className="sm:hidden">Facebook</span>
              </button>
            </div>

            <div>
              <p className=" cursor-default text-[16px] text-center text-white ">
                Don't have account?{" "}
                <span
                  onClick={() => router.push("/sign-up")}
                  className="font-vagRounded font-semibold text-[16px] text-white underline cursor-pointer underline-offset-2"
                >
                  Sign up
                </span>
              </p>
            </div>
          </div>
        </form>

        {/* Mobile footer */}
        <div className="cursor-default mt-8 text-center lg:hidden">
          <p className="text-lg font-bold">by Jeacodes</p>
        </div>
      </div>
    </div>
    </>


              }
               {isTabletOrMobile &&
    <>
    <div className="flex flex-col l items-stretch justify-center 
    max-w-screen overflow-x-hidden min-h-screen lg:h-screen text-white">
      <div className= " w-full lg:w-1/2 px-6 sm:px-10 py-5 flex items-center justify-between flex-col sticky top-0">
        <div className=" mb-15 w-full">
          <h1
            onClick={() => router.push("/")}
            className="mt-5 relative inline-block text-[16px] font-vagRounded font-bold cursor-pointer group text-white"
          >
            Go to home
            <span className="absolute left-1/2 bottom-0 h-[2px] 
            w-0 bg-white transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
          </h1>
        </div>
        <div className="cursor-default text-center">
          <h1 className="text-[16px] font-bold font-vagRounded sm:text-4xl lg:text-5xl text-white">
            Welcome to
          </h1>
          <p className="font-baloo text-[50px]">
            E-Compare
          </p>
          <div className="">
            <p className="font-vagRounded text-[12px] font-regular sm:text-[24px] lg:text-2xl mt-1">
              Start your <span className="font-semibold">smart</span> online
              shopping here.
            </p>
          </div>
        </div>
        <div className="cursor-default hidden lg:block w-full">
          <div className="cursor-default hidden lg:block w-full self-end mt-auto mb-[-16px]
     [&_footer]:!static [&_footer]:!bottom-auto [&_footer]:!left-auto [&_footer]:w-full">
            <Footer />
          </div>
        </div>
      </div>

      {/* right side */}

      <div className="w-full px-6 !pt-10 lg:w-1/2 sm:px-10 lg:overflow-y-auto scrollbar 
      !bg-black/20 mobile-bg-m border-l border-gray-500">
        <form onSubmit={handleSubmit}>
          {/* Email or Username */}
          <div className="mb-7 sm:mb-10">
            <p className="cursor-default mb-3 text-[14px] font-normal text-white font-vagRounded">
              Email or Username
            </p>

            {/* ✅ wrap the input in glass-search div */}
            <div className="!h-[48px] glass-loginInput relative w-full">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-full  text-white placeholder-white/50 !text-[12px] 
               font-normal transition-all duration-300  focus:outline-none"
                placeholder="Enter your email address or username"
              />
            </div>
          </div>
          {/* Password */}
          <div className="mb-7">
           <p className="cursor-default mb-3 text-[14px] font-normal text-white font-vagRounded">
              Password
            </p>

            {/* ✅ wrap the input and eye toggle in glass-search div */}
            <div className="!h-[48px] glass-loginInput relative w-full ">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full  rounded-2xl text-white placeholder-white/50  !text-[12px] 
                 font-normal transition-all duration-300  bg-transparent focus:outline-none"
                placeholder="Enter your password"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex flex-row items-start justify-between gap-10 mb-10 sm:flex-row sm:items-center sm:mb-18">
            <div className="flex items-center gap-2 ">
              <input
                className="glass-checkbox !h-[18px] !w-[18px]"
                type="checkbox"
                id="option1"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label
                htmlFor="option1"
                className=" font-vagRounded font-normal cursor-pointer !text-[12px] text-white"
              >
                Remember me
              </label>
            </div>
            <div className="flex items-center">
              <h1
                onClick={() => router.push("/forgot-password")}
                className="text-white relative inline-block  hover:text-gray-300 text-lg font-normal cursor-pointer 
                !text-[12px] font-vagRounded"
              >
                Forgot password
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
              </h1>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between sm:gap-10">
            <div className="flex items-center justify-center w-full">
              <button
                type="submit"
                disabled={loading || !isLoaded}
                className="w-full !h-[48px] px-2 text-[16px] glass-loginButton !rounded-[16px] font-vagRounded text-white"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <VscLoading className="animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Login Now"
                )}
              </button>
            </div>

            <div>
              <p className="mt-5 mb-5 cursor-default text-center text-white font-vagRounded !text-[16px]">
                or
              </p>
            </div>

            <div className="flex flex-col items-center justify-center w-full gap-4  text-[16px]">
              <button
                type="button"
                onClick={() => handleOAuthSignIn("google")}
                disabled={!isLoaded}
                className="search-button !h-[48px] cursor-pointer flex flex-row items-center text-white justify-center 
                w-full gap-2 px-6 !text-[14px]
               !w-full !rounded-[16px]  font-vagRounded "
              >
                <FcGoogle className="!text-[14px]" />
                <span className="">Login with Google</span>
              
              </button>




              <button
                type="button"
                onClick={() => handleOAuthSignIn("facebook")}
                disabled={!isLoaded}
              className="search-button cursor-pointer flex flex-row items-center text-white justify-center w-full  px-6 text-base
               !w-full !rounded-[16px] !h-[48px] sm:w-auto sm:text-xl sm:px-12 font-vagRounded"
              >
                <div className="p-2 sm:p-1 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    className="!w-3 !h-3 sm:w-8 sm:h-8 rounded-md"
                  >
                    <rect width="512" height="512" fill="#1877F2" rx="15" />
                    <path
                      fill="#fff"
                      d="M355.6 330.7l11.3-73.8h-70.8v-47.9c0-20.2 9.9-39.9 41.6-39.9h32.2V105c0 0-29.2-5-57.2-5-58.3 0-96.4 35.4-96.4 99.5v57.3H140v73.8h76.3v178.3c15.3 2.4 30.9 3.7 46.8 3.7s31.5-1.3 46.8-3.7V330.7h45.7z"
                    />
                  </svg>
                </div>
                <span className="!text-[14px]">
                  Login with Facebook
                </span>
               
              </button>
            </div>

            <div>
              <p className=" mt-4 cursor-default text-[12px] text-center text-white ">
                Don't have account?{" "}
                <span
                  onClick={() => router.push("/sign-up")}
                  className="mb-5 font-vagRounded font-semibold text-[12px]
                   text-white underline cursor-pointer underline-offset-2"
                >
                  Sign up
                </span>
              </p>
            </div>
          </div>
        </form>

        {/* Mobile footer */}
        <div className=" bottom-0  cursor-default mt-8 text-center ">
<Footer/>
        </div>
      </div>
    </div>
    </>
              }
              </>
  );
}

export default Signin;
