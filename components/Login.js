import React from "react";
import Image from "next/image";
import { signIn } from "next-auth/client";

function Login() {
  return (
    <div className=" grid place-items-center ">
      <Image
        src="https://links.papareact.com/5me"
        height={400}
        width={400}
        objectFit="contain"
      />
      <h1
        onClick={() => signIn()}
        className="p-5 bg-blue-500 rounded-full text-center cursor-pointer text-white"
      >
        Login with Facebook
      </h1>
    </div>
  );
}

export default Login;