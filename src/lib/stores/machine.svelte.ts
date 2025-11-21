/**
 * Machine connection store
 * Manages WebSocket connection state for machine scanning
 * Currently mocked - will integrate with friend B's WS endpoint
 */

import { getContext, setContext } from 'svelte';

const MACHINE_CONTEXT_KEY = Symbol('machine');

export type ScanStatus = 'idle' | 'connecting' | 'connected' | 'error';

export interface MachineState {
	scanned: boolean;
	machineId: string | null;
	machineName: string | null;
	locationId: string | null;
	spinCount: number;
	status: ScanStatus;
	error: string | null;
}

export function createMachineStore() {
	let scanned = $state(false);
	let machineId = $state<string | null>(null);
	let machineName = $state<string | null>(null);
	let locationId = $state<string | null>(null);
	let spinCount = $state(0);
	let status = $state<ScanStatus>('idle');
	let error = $state<string | null>(null);

	// Mock WebSocket - will be replaced with real endpoint
	let mockWs: ReturnType<typeof setTimeout> | null = null;

	function reset() {
		scanned = false;
		machineId = null;
		machineName = null;
		locationId = null;
		spinCount = 0;
		status = 'idle';
		error = null;
	}

	/**
	 * Simulate successful machine scan (mock)
	 * Uses real machine IDs from mock data for testing
	 */
	function mockScanSuccess() {
		status = 'connecting';
		error = null;

		// Use real machine IDs for proper testing
		const mockMachines = [
			{ id: 'machine_001', name: 'Anime Paradise', location: 'Pavilion KL' },
			{ id: 'machine_002', name: 'Snack Attack', location: 'Mid Valley' },
			{ id: 'machine_003', name: 'Retro Gaming', location: 'Sunway Pyramid' }
		];
		const randomMachine = mockMachines[Math.floor(Math.random() * mockMachines.length)];

		mockWs = setTimeout(() => {
			scanned = true;
			machineId = randomMachine.id;
			machineName = randomMachine.name;
			locationId = `location-${Math.floor(Math.random() * 10) + 1}`;
			spinCount = Math.floor(Math.random() * 5) + 1;
			status = 'connected';
		}, 1500);
	}

	/**
	 * Simulate failed machine scan (mock)
	 */
	function mockScanFail() {
		status = 'connecting';
		error = null;

		mockWs = setTimeout(() => {
			status = 'error';
			error = 'Failed to connect to machine. Please try again.';
		}, 1500);
	}

	function disconnect() {
		if (mockWs) {
			clearTimeout(mockWs);
			mockWs = null;
		}
		reset();
	}

	/**
	 * Future: Connect to real WebSocket
	 * Will be called when friend B provides endpoint
	 */
	// function connectWebSocket(userId: string) {
	// 	const ws = new WebSocket(`wss://api.example.com/ws?userId=${userId}`);
	// 	ws.onmessage = (event) => {
	// 		const data = JSON.parse(event.data);
	// 		if (data.type === 'machine_scan') {
	// 			scanned = true;
	// 			machineId = data.machineId;
	// 			// ... etc
	// 		}
	// 	};
	// }

	return {
		get scanned() {
			return scanned;
		},
		get machineId() {
			return machineId;
		},
		get machineName() {
			return machineName;
		},
		get locationId() {
			return locationId;
		},
		get spinCount() {
			return spinCount;
		},
		get status() {
			return status;
		},
		get error() {
			return error;
		},
		mockScanSuccess,
		mockScanFail,
		disconnect,
		reset
	};
}

export type MachineStore = ReturnType<typeof createMachineStore>;

export function setMachineContext(store: MachineStore) {
	setContext(MACHINE_CONTEXT_KEY, store);
}

export function getMachineContext(): MachineStore {
	return getContext<MachineStore>(MACHINE_CONTEXT_KEY);
}
