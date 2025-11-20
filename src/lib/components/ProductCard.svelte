<script lang="ts">
	interface Product {
		imageUrl: string;
		name: string;
		price?: number;
		location?: string;
	}

	interface Props {
		product: Product;
		variant?: 'horizontal' | 'grid';
	}

	let { product, variant = 'horizontal' }: Props = $props();

	function formatPrice(price?: number): string {
		if (!price) return '';
		return `SGD ${price.toFixed(2)}`;
	}
</script>

<div class="product-card {variant}" data-testid="product-card">
	<div class="image-container">
		<img src={product.imageUrl} alt={product.name} class="product-image" />
	</div>

	{#if variant === 'horizontal'}
		<div class="product-info">
			<h3 class="product-name">{product.name}</h3>
			{#if product.price}
				<p class="product-price">{formatPrice(product.price)}</p>
			{/if}
			{#if product.location}
				<p class="product-location">{product.location}</p>
			{/if}
		</div>
	{:else}
		<div class="product-info-compact">
			<p class="product-name-compact">{product.name}</p>
		</div>
	{/if}
</div>

<style>
	.product-card {
		display: flex;
		border-radius: 0.75rem;
		overflow: hidden;
		background-color: white;
		box-shadow:
			0 1px 3px 0 rgba(0, 0, 0, 0.1),
			0 1px 2px 0 rgba(0, 0, 0, 0.06);
		transition: box-shadow 0.2s;
	}

	.product-card:hover {
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
	}

	/* Horizontal variant */
	.product-card.horizontal {
		flex-direction: row;
		gap: 1rem;
		padding: 0.75rem;
	}

	.product-card.horizontal .image-container {
		flex-shrink: 0;
		width: 5rem;
		height: 5rem;
	}

	.product-card.horizontal .product-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.25rem;
	}

	/* Grid variant */
	.product-card.grid {
		flex-direction: column;
		aspect-ratio: 1;
	}

	.product-card.grid .image-container {
		flex: 1;
	}

	.product-card.grid .product-info-compact {
		padding: 0.5rem;
	}

	/* Common styles */
	.image-container {
		background-color: rgb(243, 244, 246);
		position: relative;
		overflow: hidden;
	}

	.product-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.product-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgb(17, 24, 39);
		line-height: 1.25;
	}

	.product-name-compact {
		font-size: 0.75rem;
		font-weight: 500;
		color: rgb(17, 24, 39);
		line-height: 1.25;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.product-price {
		font-size: 0.875rem;
		font-weight: 700;
		color: rgb(124, 58, 237);
	}

	.product-location {
		font-size: 0.75rem;
		color: rgb(107, 114, 128);
	}
</style>
