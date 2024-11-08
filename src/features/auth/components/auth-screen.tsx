"use client"

import { RoleCheck } from "@/components/role-check"
import { useConvexAuth } from "convex/react"
import Image from "next/image"
import { useState } from "react"
import { AuthFlow } from "../types"
import { SignInCard } from "./sign-in-card"
import { SignUpCard } from "./sign-up-card"

export const AuthScreen = () => {
    const [state, setState] = useState<AuthFlow>("signIn")
    const { isAuthenticated } = useConvexAuth()

    if (isAuthenticated) {
        return <RoleCheck />
    }

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
                        {/* {state === "signIn" ? <SignInCard setState={setState} /> : <SignUpCard setState={setState} />} */}
                        <SignInCard setState={setState} />
                    </div>
                </div>
            </div>
        </div>
    )
}