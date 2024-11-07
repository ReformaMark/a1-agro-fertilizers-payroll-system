"use client"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useAuthActions } from "@convex-dev/auth/react"
import { Loader2, TriangleAlertIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AuthFlow } from "../types"
// import { useCheckRole } from "../api/use-check-role"

interface SignInCardProps {
    setState: (state: AuthFlow) => void
}

export const SignInCard = ({ setState }: SignInCardProps) => {

    const { signIn } = useAuthActions();
    // const { isAuthenticated } = useConvexAuth();

    // const { data: role } = useCheckRole()
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pending, setPending] = useState<boolean>(false);
    const [error, setError] = useState("");

    const router = useRouter()

    // useEffect(() => {
    //     if (isAuthenticated) {
    //         if (role === "admin") {
    //             router.push("/admin");
    //         } else {
    //             router.push("/employee");
    //         }
    //     }
    // }, [isAuthenticated, role, router]);

    const onSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setPending(true)
        setError("")

        try {
            await signIn("password", {
                email,
                password,
                flow: "signIn"
            });

        } catch (error) {
            setError("Invalid email or password")
            console.error(error)
        } finally {
            setPending(false)
        }
    }

    return (
        <Card className="w-full h-full p-8">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-primary">
                    Login to continue
                </CardTitle>
                <CardDescription>
                    Use your email or another service to continue
                </CardDescription>
            </CardHeader>
            {!!error && (
                <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
                    <TriangleAlertIcon className="size-4" />
                    {error}
                </div>
            )}
            <CardContent className="space-y-5 px-0 pb-0">
                <form onSubmit={onSignIn} className="space-y-2.5">
                    <Input
                        disabled={pending}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        type="email"
                        required
                    />
                    <Input
                        disabled={pending}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        type="password"
                        required
                    />
                    <Button
                        type="submit"
                        className="w-full"
                        size={"lg"}
                        disabled={pending}
                    >
                        {pending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing In...
                            </>
                        ) : (
                            "Continue"
                        )}
                    </Button>
                </form>
                <Separator />
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                        Don&apos;t have an account? <span
                            className="text-primary hover:underline cursor-pointer"
                            onClick={() => setState("signUp")}>
                            Sign up
                        </span>
                    </p>

                    <p className="block lg:hidden text-sm text-muted-foreground">
                        Changed your mind? <span
                            className="text-primary hover:underline cursor-pointer"
                            onClick={() => router.push("/")}>
                            Go back to homepage.
                        </span>
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
