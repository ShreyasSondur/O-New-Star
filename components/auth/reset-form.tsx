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

const ResetSchema = z.object({
    email: z.string().email({
        message: "Email is required"
    }),
})

export const ResetForm = () => {
    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")
    const [isPending, startTransition] = useTransition()

    const form = useForm<z.infer<typeof ResetSchema>>({
        resolver: zodResolver(ResetSchema),
        defaultValues: {
            email: "",
        },
    })

    const onSubmit = (values: z.infer<typeof ResetSchema>) => {
        setError("")
        setSuccess("")

        startTransition(() => {
            reset(values.email)
                .then((data) => {
                    setError(data?.error)
                    setSuccess(data?.success)
                })
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
                        Send reset email
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}
