"use client"

import * as z from "zod"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { reset } from "@/actions/reset"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { CardWrapper } from "@/components/auth/card-wrapper"
import { Button } from "@/components/ui/button"

export const ResetForm = () => {
    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")
    const [isPending, startTransition] = useTransition()
    const [isCodeSent, setIsCodeSent] = useState(false)

    // Schema for Step 1: Email
    const EmailSchema = z.object({
        email: z.string().email({ message: "Email is required" }),
    })

    // Schema for Step 2: Code + Password
    const ResetPasswordSchema = z.object({
        code: z.string().min(6, "Code required"),
        password: z.string().min(6, "Minimum 6 characters"),
    })

    const form = useForm<z.infer<typeof EmailSchema> & z.infer<typeof ResetPasswordSchema>>({
        resolver: zodResolver(isCodeSent ? ResetPasswordSchema : EmailSchema),
        defaultValues: {
            email: "",
            code: "",
            password: "",
        },
    })

    const onSubmit = (values: any) => {
        setError("")
        setSuccess("")

        startTransition(() => {
            if (!isCodeSent) {
                // Step 1: Send OTP
                reset(values.email)
                    .then((data) => {
                        if (data?.error) {
                            setError(data.error)
                        }
                        if (data?.success) {
                            setSuccess(data.success)
                            setIsCodeSent(true)
                        }
                    })
            } else {
                // Step 2: Verify OTP and Set Password
                // Dynamically import newPassword action to avoid circular deps if any
                import("@/actions/new-password").then(({ newPassword }) => {
                    newPassword(values.password, values.code)
                        .then((data) => {
                            if (data?.error) {
                                setError(data.error)
                            }
                            if (data?.success) {
                                setSuccess(data.success)
                                // Optional: clear form or redirect
                            }
                        })
                })
            }
        })
    }

    return (
        <CardWrapper
            headerLabel="Forgot your password?"
            backButtonLabel="Back to login"
            backButtonHref="/auth/login"
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="space-y-4">
                        {!isCodeSent && (
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
                                                placeholder="john.doe@example.com"
                                                type="email"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {isCodeSent && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>OTP Code</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={isPending}
                                                    placeholder="123456"
                                                    type="text"
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
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={isPending}
                                                    placeholder="******"
                                                    type="password"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}
                    </div>
                    {error && (
                        <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive">
                            <p>{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-emerald-500">
                            <p>{success}</p>
                        </div>
                    )}
                    <Button
                        disabled={isPending}
                        type="submit"
                        className="w-full"
                    >
                        {isCodeSent ? "Reset Password" : "Send OTP"}
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}
