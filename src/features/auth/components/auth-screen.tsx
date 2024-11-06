"use client"
import Image from "next/image"
import { SignInCard } from "./sign-in-card"

export const AuthScreen = () => {
    return (
        <div className="h-screen w-full lg:flex lg:flex-row">
            <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-primary to-primary/80">
                <div className="h-full flex flex-col justify-center items-center px-24 space-y-16">
                    <div className="relative w-full max-w-[420px] h-[120px]">
                        <Image
                            src="/logo.svg"
                            alt="Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div className="text-center space-y-6">
                        <h1 className="text-5xl font-bold text-white">Welcome</h1>
                        <p className="text-xl text-white/80">Sign in to continue to your account</p>
                    </div>
                </div>
            </div>

            <div className="h-full w-full lg:w-[50%] flex flex-col flex-1 items-center justify-center">
                <div className="h-full flex items-center justify-center ">
                    <div className="md:h-auto md:w-[420px]">
                        <SignInCard />
                    </div>
                </div>
            </div>
        </div>
    )
}