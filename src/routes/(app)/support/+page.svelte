<script lang="ts">
	import { MessageCircle, Mail, Phone, Clock, ExternalLink } from 'lucide-svelte';
	import NavigationHeader from '$lib/components/base/NavigationHeader.svelte';
</script>

<div class="min-h-screen bg-gray-50 pb-20">
	<NavigationHeader title="Support" showBack={true} />

	<div class="space-y-4 p-4">
		<!-- Header -->
		<div class="rounded-xl bg-gradient-to-br from-navy-light to-navy p-6 text-white">
			<h1 class="mb-2 text-xl font-bold">How can we help?</h1>
			<p class="text-sm text-purple-200">
				Having issues with a machine or payment? We're here to help.
			</p>
		</div>

		<!-- Contact Options -->
		<div class="space-y-3">
			<a
				href="https://wa.me/60123456789"
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center gap-4 rounded-xl bg-white p-4 transition-shadow hover:shadow-md"
			>
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
					<MessageCircle class="h-6 w-6 text-green-600" />
				</div>
				<div class="flex-1">
					<p class="font-semibold text-navy">WhatsApp</p>
					<p class="text-sm text-gray-500">Fastest response • Usually within minutes</p>
				</div>
				<ExternalLink class="h-5 w-5 text-accent-green" />
			</a>

			<a
				href="mailto:support@gachapon.com"
				class="flex items-center gap-4 rounded-xl bg-white p-4 transition-shadow hover:shadow-md"
			>
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
					<Mail class="h-6 w-6 text-blue-600" />
				</div>
				<div class="flex-1">
					<p class="font-semibold text-navy">Email</p>
					<p class="text-sm text-gray-500">support@gachapon.com</p>
				</div>
				<ExternalLink class="h-5 w-5 text-accent-green" />
			</a>

			<a
				href="tel:+60123456789"
				class="flex items-center gap-4 rounded-xl bg-white p-4 transition-shadow hover:shadow-md"
			>
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
					<Phone class="h-6 w-6 text-purple-600" />
				</div>
				<div class="flex-1">
					<p class="font-semibold text-navy">Phone</p>
					<p class="text-sm text-gray-500">+60 12-345 6789</p>
				</div>
				<ExternalLink class="h-5 w-5 text-accent-green" />
			</a>
		</div>

		<!-- Operating Hours -->
		<div class="rounded-xl bg-white p-4">
			<div class="mb-3 flex items-center gap-2">
				<Clock class="h-5 w-5 text-gray-600" />
				<h3 class="font-semibold text-navy">Operating Hours</h3>
			</div>
			<div class="space-y-1 text-sm">
				<div class="flex justify-between">
					<span class="text-gray-600">Monday - Friday</span>
					<span class="font-medium text-gray-900">9:00 AM - 6:00 PM</span>
				</div>
				<div class="flex justify-between">
					<span class="text-gray-600">Saturday</span>
					<span class="font-medium text-gray-900">10:00 AM - 2:00 PM</span>
				</div>
				<div class="flex justify-between">
					<span class="text-gray-600">Sunday & Public Holidays</span>
					<span class="font-medium text-gray-500">Closed</span>
				</div>
			</div>
		</div>

		<!-- FAQ Section -->
		<div class="rounded-xl bg-white p-4">
			<h3 class="mb-3 font-semibold text-navy">Common Issues</h3>
			<div class="space-y-3 text-sm">
				<div>
					<p class="font-medium text-gray-900">Machine didn't dispense my item</p>
					<p class="text-gray-600">
						Contact us with your transaction ID. We'll investigate and process a refund if
						confirmed.
					</p>
				</div>
				<div class="border-t border-gray-100 pt-3">
					<p class="font-medium text-gray-900">Payment failed but money was deducted</p>
					<p class="text-gray-600">
						Wait 24-48 hours for automatic refund. If not received, contact us with payment proof.
					</p>
				</div>
				<div class="border-t border-gray-100 pt-3">
					<p class="font-medium text-gray-900">Wrong item dispensed</p>
					<p class="text-gray-600">
						Take a photo of the item received and contact us with your transaction ID.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
