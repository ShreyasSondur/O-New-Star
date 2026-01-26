import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function RefundPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            <SiteHeader />
            <main className="pt-24 pb-20 container mx-auto px-6 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8 text-gray-900">Refund Policy</h1>

                <div className="space-y-8 text-gray-600 leading-relaxed">
                    <section className="bg-red-50 p-6 rounded-lg border border-red-100">
                        <h2 className="text-xl font-bold text-red-700 mb-4">No Refund Policy</h2>
                        <p className="font-medium text-gray-900">
                            Please note that all bookings made with O New Star Hotel are non-refundable.
                        </p>
                        <p className="mt-2">
                            Once a reservation is confirmed and payment is processed, we do not offer any refunds, cancellations, or modifications that result in a refund of the paid amount. This policy applies to all room types and booking durations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cancellation Policy</h2>
                        <p>
                            In the event of a cancellation by the guest, the full amount paid for the booking will be forfeited. We recommend guests to be certain of their travel plans before confirming their reservation.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">No-Show Policy</h2>
                        <p>
                            If a guest fails to arrive on the scheduled check-in date ("No-Show"), the reservation will be considered cancelled effectively from the check-in time, and the full booking amount will be retained by the hotel. No refunds or partial credits will be issued.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Early Check-out</h2>
                        <p>
                            Guests who choose to check out earlier than their scheduled departure date will not be eligible for a refund for the unused nights.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Us</h2>
                        <p>
                            If you have any questions about this policy prior to booking, please contact us at:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Email: info@onewstar.com</li>
                            <li>Phone: 80184 07510</li>
                        </ul>
                    </section>
                </div>
            </main>
            <SiteFooter />
        </div>
    )
}
