import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function MyBookingsPage() {
    const session = await auth()

    if (!session?.user?.email) {
        redirect("/auth/login?callbackUrl=/my-bookings")
    }

    const bookings = await db.booking.findMany({
        where: {
            guest_email: session.user.email
        },
        include: {
            room: true
        },
        orderBy: {
            created_at: 'desc'
        }
    })

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                    <Link href="/" className="text-blue-600 hover:underline">
                        Back to Home
                    </Link>
                </div>

                {bookings.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Calendar className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
                            <p className="text-gray-500 mb-6">You haven't made any reservations with us yet.</p>
                            <Link href="/rooms">
                                <Badge className="text-sm px-4 py-2 cursor-pointer hover:bg-primary/90">
                                    Browse Rooms
                                </Badge>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {bookings.map((booking) => (
                            <Card key={booking.id} className="overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
                                    {/* Image Section */}
                                    <div className="relative h-48 md:h-full col-span-1 bg-gray-200">
                                        {booking.room?.image_url ? (
                                            <Image
                                                src={booking.room.image_url}
                                                alt={booking.room.room_name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    {/* Details Section */}
                                    <div className="col-span-3 p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-xl font-bold">{booking.room?.room_name || "Room"}</h3>
                                                    <p className="text-gray-500 text-sm">Booking ID: #{booking.id}</p>
                                                </div>
                                                <Badge variant={booking.status === "CONFIRMED" ? "default" : "secondary"}>
                                                    {booking.status}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar className="h-4 w-4 text-blue-500" />
                                                    <span>
                                                        {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <MapPin className="h-4 w-4 text-red-500" />
                                                    <span>Room {booking.room?.room_number}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Clock className="h-4 w-4 text-orange-500" />
                                                    <span>{booking.num_adults} Adults, {booking.num_children} Children</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex justify-between items-center border-t pt-4">
                                            <div className="text-sm text-gray-500">
                                                Booked on {new Date(booking.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="text-lg font-bold">
                                                To Pay/Paid: ₹{Number(booking.total_amount).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
