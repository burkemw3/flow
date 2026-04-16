// flow.js — toggle nav, store persistent state (currentBalance, dailyAccrual, lastAccrual)
document.addEventListener('DOMContentLoaded', ()=>{
	const menuBtn = document.getElementById('menu-btn');
	const nav = document.getElementById('site-nav');
	const large = document.getElementById('large-number');
	const input = document.getElementById('small-input');
	const buyBtn = document.getElementById('buy-btn');

	// Nav toggle
	if(menuBtn && nav){
		menuBtn.addEventListener('click', ()=>{
			const open = nav.classList.toggle('open');
			menuBtn.setAttribute('aria-expanded', open);
			nav.setAttribute('aria-hidden', !open);
		});
	}

	// LocalStorage keys
	const LS_KEYS = {
		currentBalance: 'flow.currentBalance',
		dailyAccrual: 'flow.dailyAccrual',
		lastAccrual: 'flow.lastAccrual'
	};

	// Defaults
	const DEFAULTS = {
		currentBalance: 1000,
		dailyAccrual: 16,
		lastAccrual: new Date().toISOString()
	};

	function loadState(){
		const rawBal = localStorage.getItem(LS_KEYS.currentBalance);
		const rawAcc = localStorage.getItem(LS_KEYS.dailyAccrual);
		const rawLast = localStorage.getItem(LS_KEYS.lastAccrual);

		const state = {
			currentBalance: rawBal !== null ? Number(rawBal) : DEFAULTS.currentBalance,
			dailyAccrual: rawAcc !== null ? Number(rawAcc) : DEFAULTS.dailyAccrual,
			lastAccrual: rawLast !== null ? rawLast : DEFAULTS.lastAccrual
		};

		// Apply accrued days since lastAccrual
		try{
			const last = new Date(state.lastAccrual);
			const now = new Date();
			const msPerDay = 1000*60*60*24;
			const days = Math.floor((now - last) / msPerDay);
			if(days > 0){
				state.currentBalance += days * state.dailyAccrual;
				last.setDate(last.getDate() + days);
				state.lastAccrual = last.toISOString();
				saveState(state);
			}
		}catch(e){
			// if parsing fails, reset lastAccrual
			state.lastAccrual = new Date().toISOString();
			saveState(state);
		}

		return state;
	}

	function saveState(state){
		localStorage.setItem(LS_KEYS.currentBalance, String(state.currentBalance));
		localStorage.setItem(LS_KEYS.dailyAccrual, String(state.dailyAccrual));
		localStorage.setItem(LS_KEYS.lastAccrual, String(state.lastAccrual));
	}

	function formatNumber(n){
		if(Number.isFinite(n)) return Math.round(n).toLocaleString();
		return String(n);
	}

	// Initialize
	let state = loadState();

	function updateUI(){
		if(large) large.textContent = formatNumber(state.currentBalance);
	}

	updateUI();

	// Buy behavior: deduct amount from balance and persist
	if(buyBtn && input){
		buyBtn.addEventListener('click', ()=>{
			const raw = input.value.trim();
			const amount = raw === '' ? NaN : Number(raw);
			if(!Number.isFinite(amount) || amount <= 0){
				input.focus();
				alert('Please enter a positive number');
				return;
			}

			state.currentBalance = Math.round((state.currentBalance - amount) * 100) / 100;
			saveState(state);
			updateUI();
			input.value = '';
		});
	}
});

// Register service worker for PWA (optional, safe to run if supported)
if('serviceWorker' in navigator){
	window.addEventListener('load', ()=>{
		navigator.serviceWorker.register('service-worker.js').then(reg => {
			console.log('Service worker registered:', reg.scope);
		}).catch(err => console.warn('SW registration failed:', err));
	});
}


