"use client";

//import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function UserInfo() {
  const { data: session } = useSession();

  return (
    <div className="grid place-items-start justify-center pt-8 h-screen bg-background">
      <div className="shadow-lg p-8 bg-zince-300/10 flex flex-col gap-2 my-6">
        <div>
          <span className="text-2xl font-bold">
            Welcome {session?.user?.name}
          </span>
        </div>
        <div className="text-center">
          <span className="text-sm">Email: {session?.user?.email}</span>
        </div>
        <Link
          href="/snipstart"
          className="bg-green-600 text-white rounded-md w-fit mt-6 mb-5 p-2 mx-auto"
        >
          Snippet Library
        </Link>
        {/*<button
          onClick={() => signOut()}
          className="bg-red-500 text-white font-bold px-6 py-2 mt-3"
        >
          Log Out
        </button>*/}
      </div>
    </div>
  );
}
