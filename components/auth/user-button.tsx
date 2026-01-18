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
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || ""} alt={user.name || ""} />
                        <AvatarFallback className="bg-blue-600 text-white">
                            {user.name?.charAt(0).toUpperCase() || <FaUser className="h-4 w-4" />}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="cursor-pointer" asChild>
                    <a href="/my-bookings">My Bookings</a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-red-600 focus:text-red-600">
                    Log Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
