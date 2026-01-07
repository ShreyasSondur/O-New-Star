import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function TermsConditionsPage() {
    return (
        <div className="min-h-screen bg-white">
            <SiteHeader />
            <main className="pt-24 pb-20 container mx-auto px-6 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8 text-gray-900">Terms and Conditions</h1>

                <div className="space-y-8 text-gray-600 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Agreement to Terms</h2>
                        <p>
                            These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and O New Star Hotel ("we," "us," or "our"), concerning your access to and use of our hotel services and website. By making a booking, you agree that you have read, understood, and agreed to be bound by all of these Terms and Conditions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Check-in and Check-out</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Check-in time:</strong> 12:00 PM (Noon)</li>
                            <li><strong>Check-out time:</strong> 11:00 AM</li>
                        </ul>
                        <p className="mt-2">
                            Guests are required to present a valid government-issued photo ID (Aadhar Card, Passport, Voter ID, or Driving License) upon check-in. PAN cards are not accepted as valid address proof.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Booking and Payment</h2>
                        <p>
                            Full payment or a deposit as specified during the booking process is required to confirm your reservation. We accept payments via Credit/Debit Cards, UPI, and Cash.
                        </p>
                        <p className="mt-2 text-red-600 font-medium">
                            Note: All bookings are non-refundable as per our Refund Policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Guest Conduct</h2>
                        <p>
                            We reserve the right to refuse service or remove guests who engage in inappropriate behavior, cause damage to property, or disturb other guests. Guests will be held responsible for any loss or damage to the hotel property caused by themselves, their guests, or any person for whom they are responsible.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Liability</h2>
                        <p>
                            The management is not responsible for the loss or damage of guests' personal belongings or valuables. Guests are advised to take care of their personal property.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these terms at any time. Any changes will be effective immediately upon posting on our website.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact</h2>
                        <p>
                            For any queries regarding these terms, please contact us at info@onewstar.com.
                        </p>
                    </section>
                </div>
            </main>
            <SiteFooter />
        </div>
    )
}
