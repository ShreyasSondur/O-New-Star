import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";

const font = Poppins({
    subsets: ["latin"],
    weight: ["600"],
});

interface HeaderProps {
    label: string;
}

export const Header = ({ label }: HeaderProps) => {
    return (
        <div className="w-full flex flex-col gap-y-4 items-center justify-center">
            <div className="relative w-16 h-16 mb-2">
                <img
                    src="/logo.png"
                    alt="Logo"
                    className="w-full h-full object-contain"
                />
            </div>
            <h1 className={cn("text-2xl font-bold tracking-tight text-gray-900", font.className)}>
                NEW STAR LODGE
            </h1>
            <p className="text-muted-foreground text-sm">
                {label}
            </p>
        </div>
    );
};
