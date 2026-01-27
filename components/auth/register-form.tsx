"use client"

import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

import { RegisterSchema } from "@/actions/schemas"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { CardWrapper } from "@/components/auth/card-wrapper"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"
import { register } from "@/actions/register"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"

export const RegisterForm = () => {
    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")
    const [isPending, startTransition] = useTransition()
    const [showPassword, setShowPassword] = useState(false)
    const [strength, setStrength] = useState("Weak")
    const [isCodeSent, setIsCodeSent] = useState(false)
    const [submittedEmail, setSubmittedEmail] = useState("")

    // Resend Timer State
    const [timeLeft, setTimeLeft] = useState(59)
    const [canResend, setCanResend] = useState(false)

    // Timer Logic
    useEffect(() => {
        let timer: NodeJS.Timeout
        if (isCodeSent && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1)
            }, 1000)
        } else if (timeLeft === 0) {
            setCanResend(true)
        }
        return () => clearInterval(timer)
    }, [isCodeSent, timeLeft])

    const form = useForm<z.infer<typeof RegisterSchema> & { code: string }>({
        resolver: zodResolver(isCodeSent ? z.object({ code: z.string().min(6, "Code required") }) : RegisterSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            name: "",
            code: "",
        },
    })

    const password = form.watch("password")

    const checkStrength = (pass: string) => {
        let score = 0;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        if (score <= 2) setStrength("Weak");
        else if (score === 3) setStrength("Medium");
        else setStrength("Strong");
    };

    useEffect(() => {
        if (!isCodeSent) {
            checkStrength(password || "")
        }
    }, [password, isCodeSent])

    const router = useRouter();

    const onSubmit = (values: any) => {
        setError("")
        setSuccess("")

        startTransition(() => {
            if (!isCodeSent) {
                // Register Step
                register(values)
                    .then((data) => {
                        if (data.error) {
                            setError(data.error)
                        } else {
                            // Store the email for the next step so strictly relying on form state isn't needed if unmounted
                            setSubmittedEmail(values.email)
                            setSuccess(data.success)
                            setIsCodeSent(true)
                            setCanResend(false)
                            setTimeLeft(59)
                        }
                    })
            } else {
                // Verify Step - Use submittedEmail instead of values.email (which might be lost)
                import("@/actions/verify-registration").then(({ verifyRegistration }) => {
                    verifyRegistration(submittedEmail, values.code)
                        .then((data) => {
                            if (data.error) {
                                setError(data.error)
                            } else {
                                setSuccess("Account created! Logging in...")

                                // Auto-login using the password we have in the form state
                                import("@/actions/login").then(({ login }) => {
                                    login({
                                        email: submittedEmail,
                                        password: values.password || form.getValues("password"), // Ensure we get the password
                                    }).then((loginData) => {
                                        if (loginData?.error) {
                                            // Fallback if auto-login fails
                                            setError(loginData.error)
                                            setTimeout(() => {
                                                router.push("/auth/login")
                                            }, 2000)
                                        } else {
                                            // Login action handles redirect (via signIn), but if it returns (e.g. for 2FA which shouldn't happen for new user), handle it.
                                            // Actually signIn redirect will happen on server side if using server action? 
                                            // No, server action `signIn` throws error to redirect.
                                            // So this promise might not resolve if redirect happens?
                                            // Or we might need to router.refresh() 
                                            // Let's assume login action handles it.
                                        }
                                    })
                                })
                            }
                        })
                })
            }
        })
    }

    const onResend = () => {
        if (!canResend) return;

        setError("")
        setSuccess("")
        setCanResend(false)
        setTimeLeft(59)

        startTransition(() => {
            // We can re-use register action to resend the OTP
            // We need to pass the name/password again or just enough to trigger the OTP logic.
            // Actually, register action creates a new record. We probably want a "resend" action?
            // But re-calling register with same email works because of our logic:
            // "Check/Delete existing pending user" -> Create new one with new OTP.
            // However, we need the original password/name to re-create the PendingUser properly.
            // Fortunately, form values are still in the hook form (unless unmounted inputs cleared them?).
            // React Hook Form `watch` values persist even if inputs unmount? No, default behavior is they stay registered if we don't unregister.
            // But if we used conditional rendering (&&), inputs are unmounted.
            // Let's assume we need to pass the *original* values.

            // Wait, if we unmount inputs, RHF might lose values depending on "shouldUnregister" config (default false).
            // To be safe, we should probably keep them in state or just hidden via CSS.
            // BUT, since we have `submittedEmail`, let's try calling register again.
            // If we really lost password, we can't recreate the PendingUser fully (it needs password hash).
            // CRITICAL: We need a dedicated "resendOtp" action that just updates the token for an existing PendingUser?
            // Or, simpler: Just hide the fields with `className={isCodeSent ? "hidden" : "block"}` instead of unmounting.

            // Let's use the current form values.
            const currentValues = form.getValues();
            // If email is missing in currentValues (because input unmounted), use submittedEmail.
            // We still need password though.

            // Strategy: The previous implementation unmounted fields.
            // I will change the render logic to HIDE fields instead of unmount them, ensuring values stay.
            register({ ...currentValues, email: submittedEmail || currentValues.email })
                .then((data) => {
                    if (data.error) {
                        setError(data.error)
                    } else {
                        setSuccess("New OTP sent!")
                    }
                })
        })
    }

    return (
        <CardWrapper
            headerLabel="Create an account"
            backButtonLabel="Already have an account?"
            backButtonHref="/auth/login"
            showSocial
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="space-y-4">
                        {/* 
                           CRITICAL FIX: Use 'hidden' class instead of unmounting 
                           so current values (password/name) are preserved for Resend 
                        */}
                        <div className={isCodeSent ? "hidden" : "space-y-4"}>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={isPending}
                                                placeholder="name"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={isPending}
                                                placeholder="username@example.com"
                                                type="email"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    {...field}
                                                    disabled={isPending}
                                                    placeholder="password"
                                                    type={showPassword ? "text" : "password"}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        checkStrength(e.target.value);
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    {...field}
                                                    disabled={isPending}
                                                    placeholder="confirm password"
                                                    type={showPassword ? "text" : "password"}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Password Strength Indicator */}
                            {password && (
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${strength === "Weak" ? "bg-red-500 w-1/3" :
                                                strength === "Medium" ? "bg-yellow-500 w-2/3" :
                                                    "bg-green-500 w-full"
                                                }`}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600">{strength}</span>
                                </div>
                            )}
                        </div>

                        {isCodeSent && (
                            <div className="space-y-4">
                                <FormItem>
                                    <FormLabel>Enter 6-Digit OTP</FormLabel>
                                    <FormControl>
                                        <div className="flex justify-center">
                                            <FormField
                                                control={form.control}
                                                name="code"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <InputOTP
                                                                maxLength={6}
                                                                {...field}
                                                            >
                                                                <InputOTPGroup>
                                                                    <InputOTPSlot index={0} />
                                                                    <InputOTPSlot index={1} />
                                                                    <InputOTPSlot index={2} />
                                                                    <InputOTPSlot index={3} />
                                                                    <InputOTPSlot index={4} />
                                                                    <InputOTPSlot index={5} />
                                                                </InputOTPGroup>
                                                            </InputOTP>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </FormControl>
                                </FormItem>

                                <div className="text-center text-sm">
                                    {canResend ? (
                                        <Button
                                            size="sm"
                                            variant="link"
                                            onClick={onResend}
                                            type="button"
                                            className="text-blue-500 font-bold"
                                        >
                                            Resend OTP
                                        </Button>
                                    ) : (
                                        <p className="text-gray-500">
                                            Resend in <span className="font-mono font-bold">{timeLeft}s</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <FormError message={error} />
                    <FormSuccess message={success} />
                    <Button
                        disabled={isPending}
                        type="submit"
                        className="w-full"
                    >
                        {isCodeSent ? "Verify & Create Account" : "Send OTP"}
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}
