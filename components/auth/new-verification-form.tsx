"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { newVerification } from "@/actions/new-verification";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
    InputOTPSeparator,
} from "@/components/ui/input-otp";

export const NewVerificationForm = () => {
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();
    const [otp, setOtp] = useState("");
    const [isPending, setIsPending] = useState(false);

    const router = useRouter();

    const onSubmit = useCallback(() => {
        if (otp.length !== 6) {
            setError("Please enter a 6-digit code.");
            return;
        }

        setSuccess("");
        setError("");
        setIsPending(true);

        newVerification(otp)
            .then((data) => {
                if (data.success) {
                    setSuccess(data.success);
                    setTimeout(() => {
                        router.push("/");
                    }, 2000); // 2 second delay to read message
                } else {
                    setError(data.error);
                }
            })
            .catch(() => {
                setError("Something went wrong!");
            })
            .finally(() => {
                setIsPending(false);
            });
    }, [otp, router]);

    return (
        <CardWrapper
            headerLabel="Confirm your email"
            backButtonLabel="Back to login"
            backButtonHref="/auth/login"
        >
            <div className="flex flex-col items-center justify-center w-full gap-4">
                {!success && !error && (
                    <div className="text-center mb-4">
                        <p className="text-sm text-gray-600">Enter the code sent to your email.</p>
                    </div>
                )}

                <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    disabled={isPending || !!success}
                >
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>

                <div className="w-full mt-4">
                    <Button
                        onClick={onSubmit}
                        className="w-full"
                        disabled={isPending || otp.length < 6}
                    >
                        {isPending ? "Verifying..." : "Submit"}
                    </Button>
                </div>

                <FormSuccess message={success} />
                {!success && (
                    <FormError message={error} />
                )}
            </div>
        </CardWrapper>
    );
};
