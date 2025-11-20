// Unity WebView detection and messaging utilities

import type { UnityMessage } from '$lib/types';

/**
 * Detects if the app is running inside Unity WebView
 * Unity sets a specific user agent pattern
 */
export function isUnityWebView(): boolean {
	if (typeof window === 'undefined') return false;

	const userAgent = window.navigator.userAgent.toLowerCase();
	return userAgent.includes('unity') || userAgent.includes('uniwebview');
}

/**
 * Sends a message to Unity WebView
 * @param message - Message to send to Unity
 */
export function sendToUnity(message: UnityMessage): void {
	if (!isUnityWebView()) {
		console.warn('Not running in Unity WebView, message not sent:', message);
		return;
	}

	// Unity WebView message format
	// Reference: https://docs.unity3d.com/Manual/webview-interacting.html
	if (window.webkit?.messageHandlers?.unityControl) {
		// iOS WebView
		window.webkit.messageHandlers.unityControl.postMessage(JSON.stringify(message));
	} else if ((window as any).unityControl) {
		// Android WebView
		(window as any).unityControl.postMessage(JSON.stringify(message));
	} else {
		console.error('Unity message handlers not found');
	}
}

/**
 * Notifies Unity that the web app is ready
 */
export function notifyUnityReady(): void {
	sendToUnity({ type: 'ready' });
}

/**
 * Requests Unity to navigate back (close WebView)
 */
export function requestUnityNavigateBack(): void {
	sendToUnity({ type: 'navigate_back' });
}

/**
 * Requests Unity to open external URL
 * @param url - External URL to open
 */
export function requestUnityOpenExternal(url: string): void {
	sendToUnity({ type: 'open_external', payload: { url } });
}

/**
 * Notifies Unity of authentication failure
 * @param reason - Reason for auth failure
 */
export function notifyUnityAuthFailed(reason: string): void {
	sendToUnity({ type: 'auth_failed', payload: { reason } });
}

/**
 * Gets Unity-specific CSS classes for safe area padding
 * Unity WebView may have notches/status bars to account for
 */
export function getUnitySafeAreaClasses(): string {
	if (!isUnityWebView()) return '';

	// Add safe area padding for iOS notch, Android status bar
	return 'pt-safe-top pb-safe-bottom';
}

/**
 * Type augmentation for Unity WebView message handlers
 */
declare global {
	interface Window {
		webkit?: {
			messageHandlers?: {
				unityControl?: {
					postMessage: (message: string) => void;
				};
			};
		};
	}
}
