import React from "react";
import { Link, Routes, Route, Navigate } from "react-router-dom";
import githubIcon from "../../../assets/img/imgAdmin/github.svg";
import googleIcon from "../../../assets/img/imgAdmin/google.svg";
import registerBg from "../../../assets/img/imgAdmin/register_bg_2.png";
import logoB from "../../../assets/img/logoB.png";

// components
import FooterSmall from "../../../components/Admin/Footers/FooterSmall.jsx";

// views
import Login from "../../../pages/Admin/AuthAdmin/LoginAdmin.jsx";

export default function LoginAdmin() {
  return (
    <>
      <main>
        <section className="relative w-full min-h-screen flex items-center justify-center">
          {/* Background Image */}
          <div
            className="absolute top-0 left-0 w-full h-full bg-slate-800 bg-no-repeat bg-cover z-0"
            style={{
              backgroundImage: `url(${registerBg})`,
            }}
          ></div>

          {/* Login Card */}
          <div className="container mx-auto px-4 h-full relative z-10">
            <div className="flex content-center items-center justify-center min-h-screen">
              <div className="w-full lg:w-4/12 px-4">
                <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-slate-200 border-0">
                  <div className="rounded-t mb-0 px-6 py-6">
                    <img src={logoB} alt="" className="mx-auto h-20 object-contain" />
                    <hr className="mt-6 border-b-1 border-slate-300" />
                  </div>
                  {/* <div className="mb-4 text-center">
                    <h5 className="font-bold mt-2 text-xl mb-2">
                      Welcome to EVOConnect
                    </h5>
                  </div> */}
                  <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                    <form>
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-slate-600 text-xs font-bold mb-2"
                          htmlFor="email"
                        >
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          placeholder="Email"
                        />
                      </div>

                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-slate-600 text-xs font-bold mb-2"
                          htmlFor="password"
                        >
                          Password
                        </label>
                        <input
                          id="password"
                          type="password"
                          className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          placeholder="Password"
                        />
                      </div>

                      <div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            id="customCheckLogin"
                            type="checkbox"
                            className="form-checkbox border-0 rounded text-slate-700 ml-1 w-5 h-5 ease-linear transition-all duration-150"
                          />
                          <span className="ml-2 text-sm font-semibold text-slate-600">
                            Remember me
                          </span>
                        </label>
                      </div>

                      <div className="text-center mb-3">
                        <h6 className="text-slate-500 text-sm font-bold">Sign in with</h6>
                      </div>
                      <div className="btn-wrapper text-center">
                        <button
                          className="bg-white active:bg-slate-50 text-slate-700 w-full py-2 rounded outline-none focus:outline-none mb-1 uppercase shadow hover:shadow-md inline-flex items-center justify-center font-bold text-xs ease-linear transition-all duration-150"
                          type="button"
                        >
                          <img alt="google" className="w-5 mr-2" src={googleIcon} />
                          Google
                        </button>

                      </div>

                      <div className="text-center mt-6">
                        <button
                          className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:bg-blue-700 text-white text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none w-full ease-linear transition-all duration-150"
                          type="button"
                        >
                          Sign In
                        </button>
                      </div>

                      <div className="flex flex-wrap mt-6 relative text-sm">
                        <div className="w-full text-center">
                          <a
                            href="#pablo"
                            onClick={(e) => e.preventDefault()}
                            className="text-slate-600 hover:underline"
                          >
                            Forgot password?
                          </a>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Routes dan Footer */}
          <Routes>
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
          </Routes>
          <FooterSmall absolute />
        </section>
      </main>
    </>
  );
}