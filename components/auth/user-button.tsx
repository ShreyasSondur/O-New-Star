"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "@/components/ui/avatar"
import { FaUser } from "react-icons/fa"
import { useCurrentUser } from "@/hooks/use-current-user" // I need to create this hook or useSession
// I'll use useSession directly for simplicity or create the hook. 
// Standard pattern: hooks/use-current-user.ts
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"

export const UserButton = () => {
    const { data: session } = useSession() // Direct usage
    const user = session?.user

    if (!user) {
        return (
            <Button asChild variant="ghost" className="font-semibold">
                <a href="/auth/login">Sign In</a>
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Avatar>
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback className="bg-sky-500">
                        <FaUser className="text-white" />
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align="end">
                <DropdownMenuItem onClick={() => signOut()}>
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
