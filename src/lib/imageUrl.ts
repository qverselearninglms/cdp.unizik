import { ROOT_IMAGE_URL } from "@/config";

const DEFAULT_IMAGE = `${ROOT_IMAGE_URL}/products/default_product_image_2.png`;

export function formatImageUrl(imagePath: string | null | undefined): string {
	if (!imagePath || typeof imagePath !== "string" || !imagePath.trim()) {
		return DEFAULT_IMAGE;
	}

	// Return as-is: blob previews and absolute URLs
	if (imagePath.startsWith("blob:") || imagePath.startsWith("http")) {
		return imagePath;
	}

	// Reject dev/local paths in all environments
	if (imagePath.includes("localhost") || imagePath.includes("127.0.0.1")) {
		return DEFAULT_IMAGE;
	}

	// Relative path → prepend storage base
	return `${ROOT_IMAGE_URL}/${imagePath.replace(/^\//, "")}`;
}

export function getSafeImageUrl(url: string): string {
	return url.startsWith("blob:") ? url : formatImageUrl(url);
}

export interface AcademicImage {
	id: number;
	url: string;
	alt: string;
	file?: File;
	primary: boolean;
}

export function convertImageUrlsToPictures(urls: string[]): AcademicImage[] {
	return urls.map((url, index) => ({
		id: Date.now() + index,
		url,
		alt: `Image ${index + 1}`,
		primary: index === 0,
	}));
}