export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="h-full min-h-screen w-full flex items-center justify-center bg-gray-50">
            {children}
        </div>
    );
}
