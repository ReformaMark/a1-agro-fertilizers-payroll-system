import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useAuthActions } from "@convex-dev/auth/react"
import { format } from "date-fns"
import { ArrowLeftIcon, ArrowRightIcon, Calendar as CalendarIcon, CheckIcon, TriangleAlertIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AuthFlow } from "../types"
import { useCheckRole } from "../api/use-check-role"
import { useConvexAuth } from "convex/react"

interface SignUpCardProps {
    setState: (state: AuthFlow) => void
}

export const SignUpCard = ({
    setState
}: SignUpCardProps) => {
    const { signIn } = useAuthActions()
    const { isAuthenticated } = useConvexAuth();

    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [date, setDate] = useState<Date>()
    const [gender, setGender] = useState<"male" | "female">("male");
    const [maritalStatus, setMaritalStatus] = useState<"single" | "married" | "widowed" | "divorced" | "separated">("single");
    const [contactType, setContactType] = useState<"mobile" | "landline">("mobile");
    const [contactNumber, setContactNumber] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pending, setPending] = useState<boolean>(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState(1);

    const router = useRouter()

    const onSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (!date) {
            setError("Date of birth is required")
            return
        }

        setPending(true)
        setError("")

        try {
            await signIn("password", {
                email,
                firstName,
                middleName,
                lastName,
                dateOfBirth,
                gender,
                maritalStatus,
                contactType,
                contactNumber,
                password,
                isArchived: false,
                flow: "signUp",
            })
        } catch (err) {
            console.error("Sign up error:", err)
            if (err instanceof Error) {
                setError(err.message)
            } else if (typeof err === 'string') {
                setError(err)
            } else {
                setError("Failed to sign up. Please try again.")
            }
        } finally {
            setPending(false)
        }
    }

    const handleFirstStep = () => {
        if (!firstName || !lastName || !email) {
            setError("All fields are required")
            return
        }

        const checkedFirstName = /^[a-zA-Z]+$/.test(firstName)
        const checkedLastName = /^[a-zA-Z]+$/.test(lastName)
        const checkedEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

        if (checkedFirstName && checkedLastName && checkedEmail) {
            setStep((prevStep) => prevStep + 1)
            setError("")
        } else {
            setError("Please check your inputs: Names should only contain letters and email should be valid")
        }
    }

    const handleSecondStep = () => {
        if (!password || !confirmPassword) {
            setError("Both password fields are required")
            return
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long")
            return
        }

        if (password === confirmPassword) {
            setStep((prevStep) => prevStep + 1)
            setError("")
        } else {
            setError("Passwords do not match")
        }
    }

    const handlePrevious = () => {
        if (step > 1) setStep((prevStep) => prevStep - 1)
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                disabled={pending}
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Enter your first name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="middleName">Middle Name</Label>
                            <Input
                                id="middleName"
                                disabled={pending}
                                value={middleName}
                                onChange={(e) => setMiddleName(e.target.value)}
                                placeholder="Enter your middle name (optional)"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                disabled={pending}
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Enter your last name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                disabled={pending}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                type="email"
                                required
                            />
                        </div>
                    </>
                )
            case 2:
                return (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                disabled={pending}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                type="password"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                disabled={pending}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                type="password"
                                required
                            />
                        </div>
                    </>
                )
            case 3:
                return (
                    <>
                        <div className="space-y-2">
                            <Label>Date of Birth</Label>
                            <Input
                                type="date"
                                value={dateOfBirth}
                                onChange={(e) => {
                                    setDateOfBirth(e.target.value)
                                    setDate(e.target.value ? new Date(e.target.value) : undefined)
                                }}
                                placeholder="Select your date of birth"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Gender</Label>
                            <Select
                                value={gender}
                                onValueChange={(value: "male" | "female") => setGender(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Marital Status</Label>
                            <Select
                                value={maritalStatus}
                                onValueChange={(value: "single" | "married" | "widowed" | "divorced" | "separated") => setMaritalStatus(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your marital status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="single">Single</SelectItem>
                                    <SelectItem value="married">Married</SelectItem>
                                    <SelectItem value="widowed">Widowed</SelectItem>
                                    <SelectItem value="divorced">Divorced</SelectItem>
                                    <SelectItem value="separated">Separated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Contact Type</Label>
                            <Select
                                value={contactType}
                                onValueChange={(value: "mobile" | "landline") => setContactType(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your contact type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mobile">Mobile</SelectItem>
                                    <SelectItem value="landline">Landline</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactNumber">Contact Number</Label>
                            <Input
                                id="contactNumber"
                                disabled={pending}
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
                                placeholder="Enter your contact number"
                                type="tel"
                                required
                            />
                        </div>
                    </>
                )
            default:
                return null
        }
    }

    return (
        <Card className="w-full h-full p-8">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-primary">
                    Sign up to continue
                </CardTitle>
                <CardDescription>
                    All fields are required to continue
                </CardDescription>
            </CardHeader>

            {!!error && (
                <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
                    <TriangleAlertIcon className="size-4" />
                    {error}
                </div>
            )}

            <CardContent className="space-y-5 px-0 pb-0">
                <form
                    id="sign-up-form"
                    onSubmit={onSignUp}
                    className="space-y-2.5"
                >
                    <div className="mb-6 flex justify-between">
                        {[1, 2, 3].map((stepNumber) => (
                            <div
                                key={stepNumber}
                                className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= stepNumber ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                                    }`}
                            >
                                {step > stepNumber ? <CheckIcon className="h-5 w-5" /> : stepNumber}
                            </div>
                        ))}
                    </div>
                    {renderStep()}
                </form>
                <CardFooter className="flex justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={step === 1}
                    >
                        <ArrowLeftIcon className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    {step < 3 ? (
                        <Button type="button" onClick={step === 1 ? handleFirstStep : handleSecondStep}>
                            Next <ArrowRightIcon className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button type="submit" form="sign-up-form">
                            Submit <CheckIcon className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </CardFooter>
                <Separator />
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                        Already have an account? <span
                            className="text-primary hover:underline cursor-pointer"
                            onClick={() => setState("signIn")}>
                            Sign in
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
        </Card >
    )
}