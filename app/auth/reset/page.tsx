import { ResetForm } from "@/components/auth/reset-form"
import { Suspense } from "react"

export default function ResetPage() {
    return (
        <Suspense>
            <div className="flex justify-center items-center min-h-[85vh]">
                <ResetForm />
            </div>
        </Suspense>
    )
}
