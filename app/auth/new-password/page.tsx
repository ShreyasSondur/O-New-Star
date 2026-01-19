import { NewPasswordForm } from "@/components/auth/new-password-form"
import { Suspense } from "react"

export default function NewPasswordPage() {
    return (
        <div className="flex justify-center items-center min-h-[85vh]">
            <Suspense>
                <NewPasswordForm />
            </Suspense>
        </div>
    )
}
