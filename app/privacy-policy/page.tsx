import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            <SiteHeader />
            <main className="pt-24 pb-20 container mx-auto px-6 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8 text-gray-900">Privacy Policy</h1>
                <p className="text-sm text-gray-500 mb-8">Last Updated: January 2026</p>

                <div className="space-y-8 text-gray-600 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Introduction</h2>
                        <p>
                            Welcome to O New Star Hotel ("we," "our," or "us"). We are committed to protecting your privacy and ensuring transparency about how we handle your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a booking with us.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Information We Collect</h2>
                        <p className="mb-4">We may collect personal information that you voluntarily provide to us when you:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Make a reservation or booking.</li>
                            <li>Contact us via email or phone.</li>
                            <li>Subscribe to our newsletter or promotional materials.</li>
                        </ul>
                        <p className="mt-4">The types of information we may collect include:</p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li>Name and contact details (email address, phone number).</li>
                            <li>Billing and payment information (processed securely).</li>
                            <li>Copy of government-issued ID (Passport, Aadhar, Driving License) upon check-in for verification purposes as required by law.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">How We Use Your Information</h2>
                        <p>We use the information we collect to:</p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li>Process and manage your bookings and payments.</li>
                            <li>Communicate with you regarding your stay and respond to inquiries.</li>
                            <li>Verify your identity upon check-in.</li>
                            <li>Comply with legal obligations and law enforcement requests.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Security</h2>
                        <p>
                            We prioritize the security of your personal information. We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction. However, please note that no method of transmission over the internet is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Third-Party Disclosure</h2>
                        <p>
                            We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties, except to trust third parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at:
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
