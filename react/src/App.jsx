import React, { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import Swal from "sweetalert2";
import axios from "axios";
import ImgUpload from "../Components/ImgUpload";
import "../style.css";

const Index = () => {
  const [dataAuth, setdataAuth] = useState();
  const [dataUsers, setdataUsers] = useState();
  const [signUp, setsignUp] = useState(false);
  const [nav, setnav] = useState("dashboard");

  const handleAsyncApi = async (tipe, req, params) => {
    if (tipe === "login") {
      try {
        await axios({
          method: "POST",
          url: "api/login",
          data: req,
        }).then((res) => {
          localStorage.setItem("token", res.data.token);
          handleAsyncApi("cekToken");
        });
      } catch (error) {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: error.response.data.messages.error,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    }
    if (tipe === "register") {
      try {
        await axios({
          method: "POST",
          url: "api/register",
          data: req,
        }).then((res) => {
          console.log(res);
        });
      } catch (error) {
        if (error.response.data.messages.email) {
          document.getElementById("msgEmail").innerText =
            error.response.data.messages.email;
        } else {
          document.getElementById("msgEmail").innerText = "";
        }

        if (error.response.data.messages.name) {
          document.getElementById("msgName").innerText =
            error.response.data.messages.name;
        } else {
          document.getElementById("msgName").innerText = "";
        }

        if (error.response.data.messages.password) {
          document.getElementById("msgPassword").innerText =
            error.response.data.messages.name;
        } else {
          document.getElementById("msgPassword").innerText = "";
        }

        if (error.response.data.messages.passconf) {
          document.getElementById("msgpasswordConfirm").innerText =
            error.response.data.messages.passconf;
        } else {
          document.getElementById("msgpasswordConfirm").innerText = "";
        }
      }
    } else if (tipe === "cekToken") {
      try {
        await axios({
          method: "GET",
          url: "api/token",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }).then((res) => {
          setdataAuth(res.data);
          handleAsyncApi("users", null, res.data.uuid);
        });
      } catch (error) {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: error.response.data.messages.error,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } else if (tipe === "users") {
      try {
        await axios({
          method: "GET",
          url: "api/users/" + params,
          data: {},
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }).then((res) => {
          setdataUsers(res.data);
        });
      } catch (error) {
        console.log(error);
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: error.response.data.messages.error,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (inputCheck() === true) {
      handleAsyncApi("login", {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
      });
    } else {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Email/Password not valid",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const submitSignUp = (e) => {
    e.preventDefault();
    if (inputCheck() === true) {
      handleAsyncApi("register", {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        name: document.getElementById("name").value,
        passconf: document.getElementById("passwordConfirm").value,
      });
    }
  };

  const inputCheck = () => {
    var cekEmail = true;
    var cekPass = true;
    var email = document.getElementById("email");

    if (email.value) {
      var filter =
        /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      if (filter.test(email.value)) {
        email.style.borderBottom = "2px solid green";
        cekEmail = true;
      } else {
        email.style.borderBottom = "2px solid red";
        cekEmail = false;
      }
    } else {
      email.style.borderBottom = "";
      cekEmail = false;
    }

    var pass = document.getElementById("password");
    if (pass.value) {
      var lowerCaseLetters = /[a-z]/g;
      var upperCaseLetters = /[A-Z]/g;
      var numbers = /[0-9]/g;
      if (
        pass.value.match(numbers) &&
        pass.value.match(upperCaseLetters) &&
        pass.value.match(lowerCaseLetters) &&
        pass.value.length >= 8
      ) {
        pass.style.borderBottom = "2px solid green";
        cekPass = true;
      } else {
        pass.style.borderBottom = "2px solid red";
        cekPass = false;
      }
    } else {
      cekPass = false;
    }

    var passCof = document.getElementById("passwordConfirm");

    if (passCof) {
      var name = document.getElementById("name");
      if (name.value) {
        name.style.borderBottom = "2px solid green";
      } else {
        name.style.borderBottom = "";
      }
      if (passCof.value === pass.value) {
        if (passCof.value) {
          document.getElementById("msgpasswordConfirm").innerText = "";
          passCof.style.borderBottom = "2px solid green";
          if (cekPass && cekEmail) {
            return true;
          } else {
            return false;
          }
        } else {
          document.getElementById("msgpasswordConfirm").innerText = "";
          passCof.style.borderBottom = "";
        }
      } else {
        passCof.style.borderBottom = "2px solid red";
        document.getElementById("msgpasswordConfirm").innerText =
          "Password not match";
      }
    } else {
      if (cekPass && cekEmail) {
        return true;
      } else {
        return false;
      }
    }
  };

  //useEffect
  useEffect(() => {
    if (localStorage.getItem("token")) handleAsyncApi("cekToken");
  }, []);

  const logOut = () => {
    localStorage.removeItem("token");
    setdataAuth(undefined);
    setdataUsers(undefined);
  };

  return (
    <>
      {!dataUsers ? (
        <div className="lg:flex">
          {signUp === true ? (
            <div className="lg:w-1/2 xl:max-w-screen-sm animate-fade-right">
              <div className="mt-10 px-12 sm:px-24 md:px-48 lg:px-12 lg:mt-16 xl:px-24 xl:max-w-2xl mb-5">
                <h2
                  className="text-center text-4xl text-indigo-900 font-display font-semibold lg:text-left xl:text-5xl
                    xl:text-bold"
                >
                  Sign Up
                </h2>
                <div className="mt-12">
                  <form id="createForm" onSubmit={submitSignUp}>
                    <div>
                      <div className="text-sm font-bold text-gray-700 tracking-wide">
                        Email Address
                      </div>
                      <input
                        className="w-full text-lg py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                        type="email"
                        id="email"
                        placeholder="mike@gmail.com"
                        onChange={() => {
                          inputCheck();
                        }}
                      />
                      <small id="msgEmail" className="text-red-900"></small>
                    </div>
                    <div className="mt-8">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-bold text-gray-700 tracking-wide">
                          Name
                        </div>
                      </div>
                      <input
                        className="w-full text-lg py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                        type="text"
                        id="name"
                        placeholder="Enter your name"
                        onChange={() => {
                          inputCheck();
                        }}
                      />
                      <small id="msgName" className="text-red-900"></small>
                    </div>
                    <div className="mt-8">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-bold text-gray-700 tracking-wide">
                          Password
                        </div>
                      </div>
                      <input
                        className="w-full text-lg py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                        type="password"
                        id="password"
                        onChange={() => {
                          inputCheck();
                        }}
                        placeholder="Enter your password"
                      />
                      <small>
                        Min 1 Lowercase, Min 1 Uppercase, Min 1 Number, Min 8
                        Char
                      </small>
                      <small id="msgPassword" className="text-red-900"></small>
                    </div>

                    <div className="mt-8">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-bold text-gray-700 tracking-wide">
                          Password Confirm
                        </div>
                      </div>
                      <input
                        className="w-full text-lg py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                        type="password"
                        id="passwordConfirm"
                        onChange={() => {
                          inputCheck();
                        }}
                        placeholder="Enter your password"
                      />
                      <small
                        id="msgpasswordConfirm"
                        className="text-red-900"
                      ></small>
                    </div>
                    <div className="mt-10">
                      <button
                        type="submit"
                        className="bg-indigo-500 text-gray-100 p-4 w-full rounded-full tracking-wide
                                font-semibold font-display focus:outline-none focus:shadow-outline hover:bg-indigo-600
                                shadow-lg "
                      >
                        Sign Up
                      </button>
                    </div>
                  </form>
                  <div className="mt-12 text-sm font-display font-semibold text-gray-700 text-center">
                    I have an account ?{" "}
                    <a
                      className="cursor-pointer text-indigo-600 hover:text-indigo-800"
                      onClick={() => {
                        setsignUp(false);
                      }}
                    >
                      Log In
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:w-1/2 xl:max-w-screen-sm animate-fade-left">
              <div className="mt-10 px-12 sm:px-24 md:px-48 lg:px-12 lg:mt-16 xl:px-24 xl:max-w-2xl">
                <h2
                  className="text-center text-4xl text-indigo-900 font-display font-semibold lg:text-left xl:text-5xl
                    xl:text-bold"
                >
                  Log in
                </h2>
                <div className="mt-12">
                  <form id="createForm" onSubmit={submit}>
                    <div>
                      <div className="text-sm font-bold text-gray-700 tracking-wide">
                        Email Address
                      </div>
                      <input
                        className="w-full text-lg py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                        type="email"
                        id="email"
                        placeholder="mike@gmail.com"
                        onChange={() => {
                          inputCheck();
                        }}
                      />
                    </div>
                    <div className="mt-8">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-bold text-gray-700 tracking-wide">
                          Password
                        </div>
                        <div>
                          <a
                            className="text-xs font-display font-semibold text-indigo-600 hover:text-indigo-800
                                        cursor-pointer"
                          >
                            Forgot Password?
                          </a>
                        </div>
                      </div>
                      <input
                        className="w-full text-lg py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                        type="password"
                        id="password"
                        onChange={() => {
                          inputCheck();
                        }}
                        placeholder="Enter your password"
                      />
                    </div>
                    <div className="mt-10">
                      <button
                        type="submit"
                        className="bg-indigo-500 text-gray-100 p-4 w-full rounded-full tracking-wide
                                font-semibold font-display focus:outline-none focus:shadow-outline hover:bg-indigo-600
                                shadow-lg "
                      >
                        Log In
                      </button>
                    </div>
                  </form>
                  <div className="mt-12 text-sm font-display font-semibold text-gray-700 text-center">
                    Don't have an account ?{" "}
                    <a
                      className="cursor-pointer text-indigo-600 hover:text-indigo-800"
                      onClick={() => {
                        setsignUp(true);
                      }}
                    >
                      Sign up
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="hidden lg:flex fixed w-1/2 right-0 items-center justify-center bg-indigo-100 flex-1 h-screen animate-fade-right">
            <div className="max-w-xs transform duration-200 hover:scale-110 cursor-pointer">
              <svg
                className="w-5/6 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                id="f080dbb7-9b2b-439b-a118-60b91c514f72"
                data-name="Layer 1"
                viewBox="0 0 528.71721 699.76785"
              >
                <title>Login</title>
                <rect y="17.06342" width="444" height="657" fill="#535461" />
                <polygon
                  points="323 691.063 0 674.063 0 17.063 323 0.063 323 691.063"
                  fill="#7f9cf5"
                />
                <circle cx="296" cy="377.06342" r="4" fill="#535461" />
                <polygon
                  points="296 377.66 298.773 382.463 301.545 387.265 296 387.265 290.455 387.265 293.227 382.463 296 377.66"
                  fill="#535461"
                />
                <polygon
                  points="337 691.063 317.217 691 318 0.063 337 0.063 337 691.063"
                  fill="#7f9cf5"
                />
                <g opacity="0.1">
                  <polygon
                    points="337.217 691 317.217 691 318.217 0 337.217 0 337.217 691"
                    fill="#fff"
                  />
                </g>
                <circle cx="296" cy="348.06342" r="13" opacity="0.1" />
                <circle cx="296" cy="346.06342" r="13" fill="#535461" />
                <line
                  x1="52.81943"
                  y1="16.10799"
                  x2="52.81943"
                  y2="677.15616"
                  fill="none"
                  stroke="#000"
                  strokeMiterlimit="10"
                  strokeWidth="2"
                  opacity="0.1"
                />
                <line
                  x1="109.81943"
                  y1="12.10799"
                  x2="109.81943"
                  y2="679.15616"
                  fill="none"
                  stroke="#000"
                  strokeMiterlimit="10"
                  strokeWidth="2"
                  opacity="0.1"
                />
                <line
                  x1="166.81943"
                  y1="9.10799"
                  x2="166.81943"
                  y2="683"
                  fill="none"
                  stroke="#000"
                  strokeMiterlimit="10"
                  strokeWidth="2"
                  opacity="0.1"
                />
                <line
                  x1="223.81943"
                  y1="6.10799"
                  x2="223.81943"
                  y2="687.15616"
                  fill="none"
                  stroke="#000"
                  strokeMiterlimit="10"
                  strokeWidth="2"
                  opacity="0.1"
                />
                <line
                  x1="280.81943"
                  y1="3.10799"
                  x2="280.81943"
                  y2="688"
                  fill="none"
                  stroke="#000"
                  strokeMiterlimit="10"
                  strokeWidth="2"
                  opacity="0.1"
                />
                <ellipse
                  cx="463.21721"
                  cy="95.32341"
                  rx="39.5"
                  ry="37"
                  fill="#2f2e41"
                />
                <path
                  d="M683.8586,425.93948l-10,14s-48,10-30,25,44-14,44-14l14-18Z"
                  transform="translate(-335.6414 -100.11607)"
                  fill="#ffb8b8"
                />
                <path
                  d="M735.8586,266.93948s-13,0-16,18-6,78-6,78-42,55-35,62,15,20,20,18,48-61,48-61Z"
                  transform="translate(-335.6414 -100.11607)"
                  fill="#7f9cf5"
                />
                <path
                  d="M735.8586,266.93948s-13,0-16,18-6,78-6,78-42,55-35,62,15,20,20,18,48-61,48-61Z"
                  transform="translate(-335.6414 -100.11607)"
                  opacity="0.1"
                />
                <path
                  d="M775.8586,215.93948s-1,39-13,41-8,15-8,15,39,23,65,0l5-12s-18-13-10-31Z"
                  transform="translate(-335.6414 -100.11607)"
                  fill="#ffb8b8"
                />
                <path
                  d="M708.8586,455.93948s-59,110-37,144,55,104,60,104,33-14,31-23-32-76-40-82-4-22-3-23,34-54,34-54-1,84,3,97-1,106,4,110,28,11,32,5,16-97,8-118l15-144Z"
                  transform="translate(-335.6414 -100.11607)"
                  fill="#2f2e41"
                />
                <path
                  d="M762.8586,722.93948l-25,46s-36,26-11,30,40-6,40-6l22-16v-46Z"
                  transform="translate(-335.6414 -100.11607)"
                  fill="#2f2e41"
                />
                <path
                  d="M728.8586,696.93948l13,31s5,13,0,16-19,21-10,23a29.29979,29.29979,0,0,0,5.49538.5463,55.56592,55.56592,0,0,0,40.39768-16.43936l8.10694-8.10694s-27.77007-63.94827-27.385-63.47414S728.8586,696.93948,728.8586,696.93948Z"
                  transform="translate(-335.6414 -100.11607)"
                  fill="#2f2e41"
                />
                <circle cx="465.21721" cy="105.82341" r="34" fill="#ffb8b8" />
                <path
                  d="M820.3586,253.43948l-10.5,10.5s-32,12-47,0c0,0,5.5-11.5,5.5-10.5s-43.5,7.5-47.5,25.5,3,49,3,49-28,132-17,135,114,28,113,9,8-97,8-97l35-67s-5-22-17-29S820.3586,253.43948,820.3586,253.43948Z"
                  transform="translate(-335.6414 -100.11607)"
                  fill="#7f9cf5"
                />
                <path
                  d="M775.8586,448.93948l-13,8s-50,34-24,40,41-24,41-24l10-12Z"
                  transform="translate(-335.6414 -100.11607)"
                  fill="#ffb8b8"
                />
                <path
                  d="M849.8586,301.93948l9,9s6,84-6,101-67,63-70,60-22-18-18-20,57.18287-57.56942,57.18287-57.56942l-4.18287-77.43058Z"
                  transform="translate(-335.6414 -100.11607)"
                  opacity="0.1"
                />
                <path
                  d="M853.8586,298.93948l9,9s6,84-6,101-67,63-70,60-22-18-18-20,57.18287-57.56942,57.18287-57.56942l-4.18287-77.43058Z"
                  transform="translate(-335.6414 -100.11607)"
                  fill="#7f9cf5"
                />
                <path
                  d="M786.797,157.64461s-11.5575-4.20273-27.31774,4.72807l8.40546,2.10136s-12.60819,1.05068-14.18421,17.8616h5.77875s-3.67739,14.70955,0,18.91228l2.364-4.4654,6.82943,13.65887,1.576-6.82944,3.15205,1.05069,2.10137-11.03217s5.25341,7.88012,9.45614,8.40546V195.2065s11.5575,13.13352,15.23489,12.60818l-5.25341-7.35477,7.35477,1.576-3.152-5.25341,18.91228,5.25341-4.20273-5.25341,13.13352,4.20273,6.3041,2.6267s8.9308-20.4883-3.67739-34.67251S798.61712,151.60318,786.797,157.64461Z"
                  transform="translate(-335.6414 -100.11607)"
                  fill="#2f2e41"
                />
              </svg>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="bg-gray-800 flex-1 flex flex-col space-y-5 lg:space-y-0 lg:flex-row lg:space-x-10 max-w-6xl sm:p-6 sm:my-2 sm:mx-4 sm:rounded-2xl">
            <div className="bg-gray-900 px-2 lg:px-4 py-2 lg:py-10 sm:rounded-xl flex lg:flex-col justify-between">
              <nav className="flex items-center flex-row space-x-2 lg:space-x-0 lg:flex-col lg:space-y-2">
                <a
                  onClick={() => {
                    setnav("dashboard");
                  }}
                  className={
                    nav === "dashboard"
                      ? "bg-gray-800 text-white p-4 inline-flex justify-center rounded-md cursor-pointer"
                      : "text-white/50 p-4 inline-flex justify-center rounded-md hover:bg-gray-800 hover:text-white smooth-hover cursor-pointer"
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </a>
              </nav>
              <div className="flex items-center flex-row space-x-2 lg:space-x-0 lg:flex-col lg:space-y-2 mt-5">
                <a
                  onClick={() => {
                    setnav("setting");
                  }}
                  className={
                    nav === "setting"
                      ? "bg-gray-800 text-white p-4 inline-flex justify-center rounded-md cursor-pointer"
                      : "text-white/50 p-4 inline-flex justify-center rounded-md hover:bg-gray-800 hover:text-white smooth-hover cursor-pointer"
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  className="cursor-pointer text-white/50 p-4 inline-flex justify-center rounded-md hover:bg-gray-800 hover:text-white smooth-hover"
                  onClick={() => {
                    logOut();
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
            {nav === "dashboard" && (
              <div className="flex-1 px-2 sm:px-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-extralight text-white/50">
                    Dashboard
                  </h3>
                  <div className="inline-flex items-center space-x-2">
                    <a
                      className="bg-gray-900 text-white/50 p-2 rounded-md hover:text-white smooth-hover"
                      href="#"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        />
                      </svg>
                    </a>
                    <a
                      className="bg-gray-900 text-white/50 p-2 rounded-md hover:text-white smooth-hover"
                      href="#"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 6h16M4 10h16M4 14h16M4 18h16"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
                <div className="mb-10 sm:mb-0 mt-10 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  <div className="relative group bg-gray-900 py-10 sm:py-20 px-4 flex flex-col space-y-2 items-center cursor-pointer rounded-md hover:bg-gray-900/80 hover:smooth-hover">
                    <img
                      className="w-20 h-20 object-cover object-center rounded-full"
                      src="https://images.unsplash.com/photo-1547592180-85f173990554?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80"
                      alt="cuisine"
                    />
                    <h4 className="text-white text-2xl font-bold capitalize text-center">
                      Welcome
                    </h4>
                    <p className="text-white/50 text-center">
                      {dataAuth?.name}
                    </p>
                    <p className="absolute top-2 text-white/20 inline-flex items-center text-xs">
                      Online{" "}
                      <span className="ml-2 w-2 h-2 block bg-green-500 rounded-full group-hover:animate-pulse"></span>
                    </p>
                  </div>
                </div>
              </div>
            )}
            {nav === "setting" && (
              <div className="flex-1 px-2 sm:px-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-extralight text-white/50">
                    Setting Profil
                  </h3>
                  <div className="inline-flex items-center space-x-2">
                    <a
                      className="bg-gray-900 text-white/50 p-2 rounded-md hover:text-white smooth-hover"
                      href="#"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        />
                      </svg>
                    </a>
                    <a
                      className="bg-gray-900 text-white/50 p-2 rounded-md hover:text-white smooth-hover"
                      href="#"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 6h16M4 10h16M4 14h16M4 18h16"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
                <div className="mb-10 sm:mb-0 mt-10 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  <ImgUpload
                    name="img"
                    id="img"
                    src={dataUsers.img}
                    empty={dataUsers.img ? false : dataUsers?.name}
                  />
                  <div>
                    <div className="text-sm text-white/50 mb-1 font-bold  tracking-wide">
                      Name
                    </div>
                    <input
                      className="w-full pl-2 rounded-md text-lg py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                      type="text"
                      id="name"
                      placeholder="mike"
                      defaultValue={dataUsers?.name}
                      onChange={() => {
                        inputCheck();
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-sm text-white/50 mb-1 font-bold  tracking-wide">
                      Email Address
                    </div>
                    <input
                      className="w-full pl-2 rounded-md text-lg py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                      type="email"
                      id="email"
                      defaultValue={dataUsers?.email}
                      disabled
                      placeholder="mike@gmail.com"
                      onChange={() => {
                        inputCheck();
                      }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    className="mt-2 px-4 py-3 bg-blue-600 rounded-md text-white outline-none focus:ring-4 shadow-lg transform active:scale-75 transition-transform"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const container = document.getElementById("app");
const root = createRoot(container);
root.render(<Index />);
