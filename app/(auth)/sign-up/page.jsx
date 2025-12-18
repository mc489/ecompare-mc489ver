"use client";
import Footer from "@/components/Footer";
import { useEffect, useRef, useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { VscLoading } from "react-icons/vsc";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { useMediaQuery } from 'react-responsive';
function Signup() {
const Bigtablet = useMediaQuery({ minWidth: 700, maxWidth: 1000 });
  

    const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1000px)' });
    
      const isTabletOrMobile = useMediaQuery({ query: '(max-width: 699px)' });
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();

  // form fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // other state
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [loadingButton, setLoadingButton] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // validation states (Option B styling will be applied where rendered)
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // debounce ref for email validation
  const emailDebounceRef = useRef(null);

  // --- Helpers: validation logic ---
  const validateEmailValue = (value) => {
    // Strong TLD validation: 2–10 alphabetical characters
    const emailRegex = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,10}$/;
    return emailRegex.test(value);
  };

  const validatePasswordComplexity = (value) => {
    // must contain at least one uppercase, one number, one symbol (non-alphanumeric)
    const hasUpper = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSymbol = /[^A-Za-z0-9]/.test(value);
    return hasUpper && hasNumber && hasSymbol;
  };

  // Clear debounce timer on unmount
  useEffect(() => {
    return () => {
      if (emailDebounceRef.current) {
        clearTimeout(emailDebounceRef.current);
      }
    };
  }, []);

  // Live password + confirm validation (ensures length >= 8 and complexity)
  useEffect(() => {
    // password validations
    if (password.length === 0) {
      setPasswordError("");
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long. Password must contain a capital letter, number, and symbol.");
    } else if (!validatePasswordComplexity(password)) {
      setPasswordError(
        "Password must contain a capital letter, number, and symbol."
      );
    } else {
      setPasswordError("");
    }

    // confirm password validation
    if (confirmPassword.length === 0) {
      setConfirmPasswordError("");
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
    } else {
      setConfirmPasswordError("");
    }
  }, [password, confirmPassword]);

  // --- Handle Email/Password Signup ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // if Clerk not loaded, don't proceed (button is disabled until isLoaded true)
    if (!isLoaded) return;

    // perform final validation check before submitting
    let hasError = false;

    // Email
    if (!validateEmailValue(email)) {
      setEmailError("Please enter a valid email address (e.g. user@example.com).");
      hasError = true;
    } else {
      setEmailError("");
    }


    if (username.trim().length < 8) {
      setUsernameError("Username must be at least 8 characters long (e.g. jeacodes23).");
      hasError = true;
    } else {
      setUsernameError("");
    }

    // Password: check length + complexity here synchronously to ensure final check
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long. Password must contain a capital letter, number, and symbol.");
      hasError = true;
    } else if (!validatePasswordComplexity(password)) {
      setPasswordError(
        "Password must contain a capital letter, number, and symbol."
      );
      hasError = true;
    } else {
      setPasswordError("");
    }

    // Confirm password matches
    if (password !== confirmPassword) {
      setConfirmPasswordError("Password do not match.");
      hasError = true;
    } else {
      setConfirmPasswordError("");
    }

    if (hasError) {
      // don't proceed with sign up if validation errors present
      return;
    }

    setLoadingButton("signup");
    setError("");

    try {
      await signUp.create({
        emailAddress: email,
        password,
        username,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setVerifying(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      const message =
        err?.errors?.[0]?.message || "An error occurred during sign up";
      setError(message);
      toast.error(message);
    } finally {
      setLoadingButton("");
    }
  };

  // --- Handle Email Verification ---
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoadingButton("verify");
    setError("");

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        window.location.href = "/";
      } else {
        setError("Verification incomplete. Please try again.");
        toast.error("Verification incomplete. Please try again.");
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      const message = err?.errors?.[0]?.message || "Invalid verification code";
      setError(message);
      toast.error(message);
    } finally {
      setLoadingButton("");
    }
  };

  // --- Handle OAuth Signup ---
  const handleOAuthSignUp = (provider) => {
    if (!isLoaded) return;

    setLoadingButton(provider);

    signUp.authenticateWithRedirect({
      strategy: provider,
      redirectUrl: window.location.origin + "/sso-callback",
      redirectUrlComplete: window.location.origin + "/",
    });
  };

  // --- Verification View ---
  if (verifying) {
    return (

      <div className="flex flex-col  lg:flex-row items-center justify-center max-w-screen overflow-x-hidden min-h-screen lg:h-screen text-white">
        <div className="min-h-[40vh] lg:min-h-screen w-full lg:w-1/2 px-6 sm:px-10 py-5 flex items-center justify-between flex-col sticky top-0">
          <div className="w-full">
            <h1
              onClick={() => router.push("/")}
              className="relative inline-block text-xl font-bold cursor-pointer sm:text-2xl group text-white"
            >
              Go to home
              <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
            </h1>
          </div>

          <div className="text-center lg:text-left">
            <h1 className=" cursor-default text-3xl font-bold font-vagRounded sm:text-4xl lg:text-5xl text-white">
              Verify Your Email
            </h1>
            <p className="cursor-default font-vagRounded text-lg sm:text-xl lg:text-2xl mt-4">
              We sent a code to {email}
            </p>
          </div>

          <div className="cursor-default hidden lg:block w-full">
            <div className="cursor-default hidden lg:block w-full self-end mt-auto mb-[-16px] [&_footer]:!static [&_footer]:!bottom-auto [&_footer]:!left-auto [&_footer]:w-full">
              <Footer />
            </div>
          </div>
        </div>

        <div className="w-full px-6 py-10 lg:w-1/2 sm:px-10 lg:overflow-y-auto !bg-black/20 inner-shadow-y min-h-screen flex justify-center items-center ">
          <form
            onSubmit={handleVerify}
            className="w-full min-h-screen flex justify-center items-center flex-col"
          >
            <div className="mb-7 sm:mb-10 w-full">
              <p className="mb-2 text-xl font-light text-white sm:text-2xl font-vagRounded w-full ">
                Verification Code
              </p>
              <div className="h-[64px] glass-loginInput relative w-full">
                <input
                  type="text"
                  maxLength={6}
                  value={code}

                  onChange={(e) => setCode(e.target.value.slice(0, 6))}
                  required
                  className=" "
                  placeholder="Enter 6-digit code"
                />
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-8 w-full ">
              <button
                type="submit"
                disabled={loadingButton !== "" || !isLoaded}
                className=" w-full relative cursor-pointer px-8 text-lg glass-loginButton sm:w-auto sm:text-xl sm:px-12 font-vagRounded text-white "
              >
                {loadingButton === "verify" ? (
                  <span className="flex items-center justify-center gap-2">
                    <VscLoading className="animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Verify Email"
                )}
              </button>

              <button
                type="button"
                onClick={() => setVerifying(false)}
                disabled={loadingButton !== ""}
                className="cursor-pointer text-white underline underline-offset-5 hover:text-gray-300 disabled:opacity-50"
              >
                Back to sign up
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- Signup Form View ---
  return (
    <>
    
    {
      isDesktopOrLaptop &&
    <>
    <div className="flex flex-col lg:flex-row items-stretch justify-center max-w-screen overflow-x-hidden min-h-screen lg:h-screen text-white">
      {/* Left Side */}
      <div className="min-h-[40vh] lg:min-h-screen w-full lg:w-1/2 px-6 sm:px-10 py-5 flex items-center justify-between flex-col sticky top-0">
        <div className="w-full">
          <h1
            onClick={() => router.push("/")}
            className="relative inline-block text-xl font-bold cursor-pointer sm:text-2xl group text-white"
          >
            Go to home
            <span className="absolute left-1/2 bottom-0 h-[2px] w-0 bg-white transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
          </h1>
        </div>

        <div className="cursor-default text-center lg:text-left">
          <h1 className="text-3xl font-bold font-vagRounded sm:text-4xl lg:text-5xl text-white">
            Welcome to
          </h1>
          <p className="font-baloo text-5xl sm:text-6xl lg:text-8xl">E-Compare</p>
          <p className="font-semibold font-vagRounded text-lg sm:text-xl lg:text-2xl mt-2">
            Sign up for free.
          </p>
        </div>
        <div className="cursor-default hidden lg:block w-full">
          <div className="cursor-default hidden lg:block w-full self-end mt-auto mb-[-16px] [&_footer]:!static [&_footer]:!bottom-auto [&_footer]:!left-auto [&_footer]:w-full">
            <Footer />
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full px-6 py-10 lg:w-1/2 sm:px-10 lg:overflow-y-auto scrollbar !bg-black/20 
    
    inner-shadow-y border-l border-gray-500">
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-7 sm:mb-10">
            <p className="mb-3 text-[20px] font-normal text-white font-vagRounded">
              Email
            </p>

            <div className="h-[64px] glass-loginInput relative w-full">
              <input
                type="text"
                value={email}
                // live update + debounced validation
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);

                  // clear previous timer
                  if (emailDebounceRef.current) {
                    clearTimeout(emailDebounceRef.current);
                  }

                  // debounce validation
                  emailDebounceRef.current = setTimeout(() => {
                    if (value.trim() === "") {
                      setEmailError("");
                    } else if (!validateEmailValue(value)) {
                      setEmailError("Please enter a valid email address.");
                    } else {
                      setEmailError("");
                    }
                  }, 800);
                }}

                onBlur={() => {
                  if (emailDebounceRef.current) {
                    clearTimeout(emailDebounceRef.current);
                  }

                  if (email.trim() === "") {
                    setEmailError("");
                  } else if (!validateEmailValue(email)) {
                    setEmailError("Please enter a valid email address.");
                  } else {
                    setEmailError("");
                  }
                }}
                required
                className="w-full h-full  text-white placeholder-white/50 text-[16px] 
               font-normal transition-all duration-300  focus:outline-none"
                placeholder="jeacodes@email.com"
              />
            </div>

            {/* Option B: smaller, lighter text under input */}
            {emailError && (
              <p className="text-white/70 text-sm mt-1">{emailError}</p>
            )}
          </div>

          {/* Username */}
          <div className="mb-7 sm:mb-10">
            <p className="mb-3 text-[20px] font-normal text-white font-vagRounded">
              Username
            </p>

            <div className="h-[64px] glass-loginInput relative w-full">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  const v = e.target.value;
                  setUsername(v);
                  if (v.trim().length === 0) {
                    setUsernameError("");
                  } else if (v.trim().length < 8) {
                    setUsernameError("Username must be at least 8 characters long.");
                  } else {
                    setUsernameError("");
                  }
                }}
                required
                className="w-full h-full  text-white placeholder-white/50 text-[16px] 
               font-normal transition-all duration-300  focus:outline-none"
                placeholder="jeacodes23"
              />
            </div>

            {usernameError && (
              <p className="text-white/70 text-sm mt-1">{usernameError}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-7">
            <p className="mb-3 text-[20px] font-normal text-white font-vagRounded">
              Password
            </p>

            <div className="h-[64px] glass-loginInput relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  const v = e.target.value;
                  setPassword(v);
                  // live validation is handled in useEffect
                }}
                required
                className="w-full  rounded-2xl text-white placeholder-white/50 text-[16px]
                       font-normal transition-all duration-300  bg-transparent focus:outline-none"
                placeholder="········"
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

            {passwordError && (
              <p className="text-white/70 text-sm mt-1">{passwordError}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-7">
            <p className="mb-3 text-[20px] font-normal text-white  font-vagRounded">
              Confirm Password
            </p>
            <div className="h-[64px] glass-loginInput relative w-full">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  const v = e.target.value;
                  setConfirmPassword(v);
                  // live validation handled in useEffect
                }}
                required
                className="w-full  rounded-2xl text-white placeholder-white/50 text-[16px]
                       font-normal transition-all duration-300  bg-transparent focus:outline-none"
              />
            </div>

            {confirmPasswordError && (
              <p className="text-white/70 text-sm mt-1">{confirmPasswordError}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex flex-col items-center justify-between gap-8 sm:gap-10">
            <div id="clerk-captcha"></div>
            <div className="flex items-center justify-center w-full">
              <button
                type="submit"
                disabled={loadingButton !== "" || !isLoaded}
                className="cursor-pointer px-8 text-lg glass-loginButton  sm:w-auto sm:text-x
                l sm:px-12 font-vagRounded text-white "
              >
                {loadingButton === "signup" ? (
                  <span className="flex items-center justify-center gap-2">
                    <VscLoading className="animate-spin" />
                    Signing up...
                  </span>
                ) : (
                  "Sign up"
                )}
              </button>
            </div>

            <p className="text-xl text-center sm:text-2xl text-white">or</p>

            {/* OAuth Buttons */}
            <div className="flex flex-col items-center justify-center w-full gap-4 sm:gap-5">
              {/* Google */}
              <button
                type="button"
                onClick={() => handleOAuthSignUp("oauth_google")}
                disabled={loadingButton !== "" || !isLoaded}
                className="cursor-pointer flex flex-row items-center text-white justify-center gap-2 px-6
                 !rounded-[23px] !w-full text-base search-button !h-[64px] !text-lg font-vagRounded"
              >
                {loadingButton === "oauth_google" ? (
                  <VscLoading className="text-3xl sm:text-4xl animate-spin" />
                ) : (
                  <FcGoogle className="!text-2xl sm:text-4xl" />
                )}
                <span className="hidden sm:inline">
                  {loadingButton === "oauth_google"
                    ? "Loading..."
                    : "Continue with Google"}
                </span>
                <span className="sm:hidden">
                  {loadingButton === "oauth_google" ? "Loading..." : "Google"}
                </span>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() => handleOAuthSignUp("oauth_facebook")}
                disabled={loadingButton !== "" || !isLoaded}
                className="cursor-pointer flex flex-row items-center justify-center text-white px-6 text-base
                !w-full search-button !rounded-[23px] !min-h-[64px] sm:w-auto sm:text-xl sm:px-12 font-vagRounded"
              >
                {loadingButton === "oauth_facebook" ? (
                  <VscLoading className="text-3xl sm:text-4xl animate-spin" />
                ) : (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 48 48"
                      className="sm:w-[38px] sm:h-[38px]"
                    >
                      <path
                        fill="#039be5"
                        d="M24 5A19 19 0 1 0 24 43A19 19 0 1 0 24 5Z"
                      ></path>
                      <path
                        fill="#fff"
                        d="M26.572,29.036h4.917l0.772-4.995h-5.69v-2.73
                        c0-2.075,0.678-3.915,2.619-3.915h3.119v-4.359
                        c-0.548-0.074-1.707-0.236-3.897-0.236
                        c-4.573,0-7.254,2.415-7.254,7.917v3.323h-4.701v4.995h4.701
                        v13.729C22.089,42.905,23.032,43,24,43
                        c0.875,0,1.729-0.08,2.572-0.194V29.036z"
                      ></path>
                    </svg>

                    <span className="hidden sm:inline">
                      {loadingButton === "oauth_facebook"
                        ? "Loading..."
                        : "Continue with Facebook"}
                    </span>
                    <span className="sm:hidden">
                      {loadingButton === "oauth_facebook"
                        ? "Loading..."
                        : "Facebook"}
                    </span>
                  </div>
                )}
              </button>
            </div>

            {/* Login link */}
            <p className="font-sans text-sm text-center text-white sm:text-base">
              Already have an account?{" "}
              <span
                onClick={() => loadingButton === "" && router.push("/sign-in")}
                className={`font-bold text-white underline underline-offset-2 ${loadingButton === "" ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                  }`}
              >
                Login
              </span>
            </p>
          </div>
        </form>

        <div className="cursor-default mt-8 text-center lg:hidden">
          <p className="text-lg font-bold">by Jeacodes</p>
        </div>
      </div>
    </div>
    </>
    }
   {
      Bigtablet &&
    <>
  <div className="flex flex-col lg:flex-row items-stretch justify-center !h-[100vh] overflow-x-hidden 
      text-white ">
          <div className=" mt-50 !h-[100vh] w-full  px-10  py-5 flex items-center justify-between flex-col  top-0">
        <div className="w-full">
          <h1
            onClick={() => router.push("/")}
            className="!mb-15 pt-10 relative inline-block text-[24px] font-vagRounded font-bold cursor-pointer group text-white"
          >
            Go to home
            <span className=" absolute left-1/2 bottom-0 h-[2px] w-0 bg-white transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
          </h1>
        </div>
        <div className="cursor-default text-center lg:text-left">
 <h1 className="text-3xl font-bold font-vagRounded sm:text-4xl lg:text-5xl text-white">      Welcome to
          </h1>
           <p className="font-baloo text-5xl  sm:text-6xl lg:text-8xl">
      
            E-Compare
          </p>
           <p className="font-vagRounded text-lg font-regular sm:text-[24px] lg:text-2xl mt-1">
            Sign up for free.
          </p>
        </div>
        <div className="cursor-default hidden lg:block w-full">
          <div className="cursor-default hidden lg:block w-full self-end mt-auto mb-[-16px] [&_footer]:!static [&_footer]:!bottom-auto [&_footer]:!left-auto [&_footer]:w-full">
            <Footer />
          </div>
        </div>
      </div>

      {/* Right Side */}
       <div className="w-full px-6 py-10 lg:w-1/2 sm:px-10 lg:overflow-y-auto scrollbar !bg-black/20
      big-tablet border-l border-gray-500">
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-7 sm:mb-10">
            <p className="mb-3 text-[20px] font-normal text-white font-vagRounded">
              Email
            </p>

            <div className="h-[64px] glass-loginInput relative w-full">
              <input
                type="text"
                value={email}
                // live update + debounced validation
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);

                  // clear previous timer
                  if (emailDebounceRef.current) {
                    clearTimeout(emailDebounceRef.current);
                  }

                  // debounce validation
                  emailDebounceRef.current = setTimeout(() => {
                    if (value.trim() === "") {
                      setEmailError("");
                    } else if (!validateEmailValue(value)) {
                      setEmailError("Please enter a valid email address.");
                    } else {
                      setEmailError("");
                    }
                  }, 800);
                }}

                onBlur={() => {
                  if (emailDebounceRef.current) {
                    clearTimeout(emailDebounceRef.current);
                  }

                  if (email.trim() === "") {
                    setEmailError("");
                  } else if (!validateEmailValue(email)) {
                    setEmailError("Please enter a valid email address.");
                  } else {
                    setEmailError("");
                  }
                }}
                required
                className="w-full h-full  text-white placeholder-white/50 text-[16px] 
               font-normal transition-all duration-300  focus:outline-none"
                placeholder="jeacodes@email.com"
              />
            </div>

            {/* Option B: smaller, lighter text under input */}
            {emailError && (
              <p className="text-white/70 text-sm mt-1">{emailError}</p>
            )}
          </div>

          {/* Username */}
          <div className="mb-7 sm:mb-10">
            <p className="mb-3 text-[20px] font-normal text-white font-vagRounded">
              Username
            </p>

            <div className="h-[64px] glass-loginInput relative w-full">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  const v = e.target.value;
                  setUsername(v);
                  if (v.trim().length === 0) {
                    setUsernameError("");
                  } else if (v.trim().length < 8) {
                    setUsernameError("Username must be at least 8 characters long.");
                  } else {
                    setUsernameError("");
                  }
                }}
                required
                className="w-full h-full  text-white placeholder-white/50 text-[16px] 
               font-normal transition-all duration-300  focus:outline-none"
                placeholder="jeacodes23"
              />
            </div>

            {usernameError && (
              <p className="text-white/70 text-sm mt-1">{usernameError}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-7">
            <p className="mb-3 text-[20px] font-normal text-white font-vagRounded">
              Password
            </p>

            <div className="h-[64px] glass-loginInput relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  const v = e.target.value;
                  setPassword(v);
                  // live validation is handled in useEffect
                }}
                required
                className="w-full  rounded-2xl text-white placeholder-white/50 text-[16px]
                       font-normal transition-all duration-300  bg-transparent focus:outline-none"
                placeholder="········"
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

            {passwordError && (
              <p className="text-white/70 text-sm mt-1">{passwordError}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-7">
            <p className="mb-3 text-[20px] font-normal text-white  font-vagRounded">
              Confirm Password
            </p>
            <div className="h-[64px] glass-loginInput relative w-full">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  const v = e.target.value;
                  setConfirmPassword(v);
                  // live validation handled in useEffect
                }}
                required
                className="w-full  rounded-2xl text-white placeholder-white/50 text-[16px]
                       font-normal transition-all duration-300  bg-transparent focus:outline-none"
              />
            </div>

            {confirmPasswordError && (
              <p className="text-white/70 text-sm mt-1">{confirmPasswordError}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex flex-col items-center justify-between gap-8 sm:gap-10">
            <div id="clerk-captcha"></div>
            <div className="flex items-center justify-center w-full">
              <button
                type="submit"
                disabled={loadingButton !== "" || !isLoaded}
                className="cursor-pointer px-8 text-lg glass-loginButton  sm:w-auto sm:text-x
                l sm:px-12 font-vagRounded text-white "
              >
                {loadingButton === "signup" ? (
                  <span className="flex items-center justify-center gap-2">
                    <VscLoading className="animate-spin" />
                    Signing up...
                  </span>
                ) : (
                  "Sign up"
                )}
              </button>
            </div>

            <p className="text-xl text-center sm:text-2xl text-white">or</p>

            {/* OAuth Buttons */}
            <div className="flex flex-col items-center justify-center w-full gap-4 sm:gap-5">
              {/* Google */}
              <button
                type="button"
                onClick={() => handleOAuthSignUp("oauth_google")}
                disabled={loadingButton !== "" || !isLoaded}
                className="cursor-pointer flex flex-row items-center text-white justify-center gap-2 px-6
                 !rounded-[23px] !w-full text-base search-button !h-[64px] !text-lg font-vagRounded"
              >
                {loadingButton === "oauth_google" ? (
                  <VscLoading className="text-3xl sm:text-4xl animate-spin" />
                ) : (
                  <FcGoogle className="!text-2xl sm:text-4xl" />
                )}
                <span className="hidden sm:inline">
                  {loadingButton === "oauth_google"
                    ? "Loading..."
                    : "Continue with Google"}
                </span>
                <span className="sm:hidden">
                  {loadingButton === "oauth_google" ? "Loading..." : "Google"}
                </span>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() => handleOAuthSignUp("oauth_facebook")}
                disabled={loadingButton !== "" || !isLoaded}
                className="cursor-pointer flex flex-row items-center justify-center text-white px-6 text-base
                !w-full search-button !rounded-[23px] !min-h-[64px] sm:w-auto sm:text-xl sm:px-12 font-vagRounded"
              >
                {loadingButton === "oauth_facebook" ? (
                  <VscLoading className="text-3xl sm:text-4xl animate-spin" />
                ) : (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 48 48"
                      className="sm:w-[38px] sm:h-[38px]"
                    >
                      <path
                        fill="#039be5"
                        d="M24 5A19 19 0 1 0 24 43A19 19 0 1 0 24 5Z"
                      ></path>
                      <path
                        fill="#fff"
                        d="M26.572,29.036h4.917l0.772-4.995h-5.69v-2.73
                        c0-2.075,0.678-3.915,2.619-3.915h3.119v-4.359
                        c-0.548-0.074-1.707-0.236-3.897-0.236
                        c-4.573,0-7.254,2.415-7.254,7.917v3.323h-4.701v4.995h4.701
                        v13.729C22.089,42.905,23.032,43,24,43
                        c0.875,0,1.729-0.08,2.572-0.194V29.036z"
                      ></path>
                    </svg>

                    <span className="hidden sm:inline">
                      {loadingButton === "oauth_facebook"
                        ? "Loading..."
                        : "Continue with Facebook"}
                    </span>
                    <span className="sm:hidden">
                      {loadingButton === "oauth_facebook"
                        ? "Loading..."
                        : "Facebook"}
                    </span>
                  </div>
                )}
              </button>
            </div>

            {/* Login link */}
            <p className="font-sans text-sm text-center text-white sm:text-base">
              Already have an account?{" "}
              <span
                onClick={() => loadingButton === "" && router.push("/sign-in")}
                className={`font-bold text-white underline underline-offset-2 ${loadingButton === "" ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                  }`}
              >
                Login
              </span>
            </p>
          </div>
        </form>

        <div className="cursor-default mt-8 text-center lg:hidden">
          <p className="text-lg font-bold">by Jeacodes</p>
        </div>
      </div>
    </div>
    </>
    }
    {
      isTabletOrMobile &&
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
       <p className="font-vagRounded text-[12px] font-regular sm:text-[24px] lg:text-2xl mt-1">
            Sign up for free.
          </p>
        </div>
        <div className="cursor-default hidden lg:block w-full">
          <div className="cursor-default hidden lg:block w-full self-end mt-auto mb-[-16px] [&_footer]:!static [&_footer]:!bottom-auto [&_footer]:!left-auto [&_footer]:w-full">
            <Footer />
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full px-6 pt-10 lg:w-1/2 sm:px-10 lg:overflow-y-auto scrollbar !bg-black/20 mobile-bg-m border-l border-gray-500">
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-7 sm:mb-10">
            <p className="mb-3 !text-[14px] font-normal text-white font-vagRounded">
              Email
            </p>

            <div className="!h-[48px] glass-loginInput relative w-full">
              <input
                type="text"
                
                value={email}
                // live update + debounced validation
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);

                  // clear previous timer
                  if (emailDebounceRef.current) {
                    clearTimeout(emailDebounceRef.current);
                  }

                  // debounce validation
                  emailDebounceRef.current = setTimeout(() => {
                    if (value.trim() === "") {
                      setEmailError("");
                    } else if (!validateEmailValue(value)) {
                      setEmailError("Please enter a valid email address.");
                    } else {
                      setEmailError("");
                    }
                  }, 800);
                }}

                onBlur={() => {
                  if (emailDebounceRef.current) {
                    clearTimeout(emailDebounceRef.current);
                  }

                  if (email.trim() === "") {
                    setEmailError("");
                  } else if (!validateEmailValue(email)) {
                    setEmailError("Please enter a valid email address.");
                  } else {
                    setEmailError("");
                  }
                }}
                required
                className="!text-[14px] w-full h-full  text-white placeholder-white/50  
               font-normal transition-all duration-300  focus:outline-none"
                placeholder="jeacodes@email.com"
              />
            </div>

            {/* Option B: smaller, lighter text under input */}
            {emailError && (
              <p className="text-white/70 text-sm mt-1">{emailError}</p>
            )}
          </div>

          {/* Username */}
          <div className="mb-7 sm:mb-10">
            <p className="mb-3 !text-[14px] font-normal text-white font-vagRounded">
              Username
            </p>

            <div className="!h-[48px]  glass-loginInput relative w-full">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  const v = e.target.value;
                  setUsername(v);
                  if (v.trim().length === 0) {
                    setUsernameError("");
                  } else if (v.trim().length < 8) {
                    setUsernameError("Username must be at least 8 characters long.");
                  } else {
                    setUsernameError("");
                  }
                }}
                required
                className="!text-[14px] w-full h-full  text-white placeholder-white/50 text-[16px] 
               font-normal transition-all duration-300  focus:outline-none"
                placeholder="jeacodes23"
              />
            </div>

            {usernameError && (
              <p className="text-white/70 text-sm mt-1">{usernameError}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-7">
            <p className="mb-3 text-[14px] font-normal text-white font-vagRounded">
              Password
            </p>

            <div className="!h-[48px] glass-loginInput relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  const v = e.target.value;
                  setPassword(v);
                  // live validation is handled in useEffect
                }}
                required
                className="w-full  rounded-2xl text-white placeholder-white/50 !text-[14px]
                       font-normal transition-all duration-300  bg-transparent focus:outline-none"
                placeholder="········"
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

            {passwordError && (
              <p className="text-white/70 text-sm mt-1">{passwordError}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-7">
            <p className="mb-3 text-[14px] font-normal text-white  font-vagRounded">
              Confirm Password
            </p>
            <div className="!h-[48px] glass-loginInput relative w-full">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  const v = e.target.value;
                  setConfirmPassword(v);
                  // live validation handled in useEffect
                }}
                required
                className="w-full  rounded-2xl text-white placeholder-white/50 !text-[16px]
                       font-normal transition-all duration-300  bg-transparent focus:outline-none"
              />
            </div>

            {confirmPasswordError && (
              <p className="text-white/70 text-sm mt-1">{confirmPasswordError}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex flex-col items-center justify-between ">
            <div id="clerk-captcha"></div>
            <div className="flex items-center justify-center w-full">
              <button
                type="submit"
                disabled={loadingButton !== "" || !isLoaded}
                className="cursor-pointer !rounded-[16px] px-8 text-lg glass-loginButton !h-[48px] 
                !text-[16px]  font-vagRounded text-white "
              >
                {loadingButton === "signup" ? (
                  <span className="flex items-center justify-center gap-2">
                    <VscLoading className="animate-spin" />
                    Signing up...
                  </span>
                ) : (
                  "Sign up"
                )}
              </button>
            </div>

            <p className="mt-5 mb-5 !text-[16px] text-center sm:text-2xl text-white">or</p>

            {/* OAuth Buttons */}
            <div className="flex flex-col items-center justify-center w-full gap-4 sm:gap-5">
              {/* Google */}
              <button
                type="button"
                onClick={() => handleOAuthSignUp("oauth_google")}
                disabled={loadingButton !== "" || !isLoaded}
                className="cursor-pointer flex flex-row items-center text-white justify-center gap-2 px-6 
                !rounded-[16px] search-button !h-[48px] !w-full font-vagRounded"
              >
                {loadingButton === "oauth_google" ? (
                  <VscLoading className="text-3xl sm:text-4xl animate-spin" />
                ) : (
                  <FcGoogle className="!text-[16px]" />
                )}
                <span className="!text-[14px]">
                  {loadingButton === "oauth_google"
                    ? "Loading..."
                    : "Continue with Google"}
                </span>
           
                
                
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() => handleOAuthSignUp("oauth_facebook")}
                disabled={loadingButton !== "" || !isLoaded}
                className="cursor-pointer flex flex-row items-center justify-center text-white px-6 !text-[16px]
                !w-full !rounded-[16px] search-button !h-[48px]  font-vagRounded"
              >
                {loadingButton === "oauth_facebook" ? (
                  <VscLoading className="text-3xl sm:text-4xl animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 48 48"
                      className="!w-[16px] !h-[16px]"
                    >
                      <path
                        fill="#039be5"
                        d="M24 5A19 19 0 1 0 24 43A19 19 0 1 0 24 5Z"
                      ></path>
                      <path
                        fill="#fff"
                        d="M26.572,29.036h4.917l0.772-4.995h-5.69v-2.73
                        c0-2.075,0.678-3.915,2.619-3.915h3.119v-4.359
                        c-0.548-0.074-1.707-0.236-3.897-0.236
                        c-4.573,0-7.254,2.415-7.254,7.917v3.323h-4.701v4.995h4.701
                        v13.729C22.089,42.905,23.032,43,24,43
                        c0.875,0,1.729-0.08,2.572-0.194V29.036z"
                      ></path>
                    </svg>

                    <span className="!text-[14px]">
                      {loadingButton === "oauth_facebook"
                        ? "Loading..."
                        : "Continue with Facebook"}
                    </span>
                  
                  </div>
                )}
              </button>
            </div>

            {/* Login link */}
            <p className="mt-4 !font-vagrounded !text-[12px] text-center ">
              Already have an account?{" "}
              <span
                onClick={() => loadingButton === "" && router.push("/sign-in")}
                className=
                {`!mb-5 font-bold text-white underline underline-offset-2 ${loadingButton === "" ? 
                  "cursor-pointer" : " cursor-not-allowed opacity-50"
                  }`}
              >
                Login
              </span>
            </p>
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

export default Signup;
