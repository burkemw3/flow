// settings.js — load and save currentBalance and dailyAccrual to localStorage
document.addEventListener('DOMContentLoaded', ()=>{
  const LS_KEYS = {
    currentBalance: 'flow.currentBalance',
    dailyAccrual: 'flow.dailyAccrual',
    lastAccrual: 'flow.lastAccrual'
  };

  const currentInput = document.getElementById('currentBalance');
  const dailyInput = document.getElementById('dailyAccrual');
  const lastAccrualDisplay = document.getElementById('lastAccrualDisplay');
  const form = document.getElementById('settings-form');

  function load(){
    const rawBal = localStorage.getItem(LS_KEYS.currentBalance);
    const rawAcc = localStorage.getItem(LS_KEYS.dailyAccrual);
    const rawLastAccrual = localStorage.getItem(LS_KEYS.lastAccrual);
    if(rawBal !== null) currentInput.value = Number(rawBal);
    if(rawAcc !== null) dailyInput.value = Number(rawAcc);
    if(rawLastAccrual !== null) {
      const date = new Date(rawLastAccrual);
      lastAccrualDisplay.textContent = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  }

  function save(e){
    e.preventDefault();
    const bal = Number(currentInput.value);
    const acc = Number(dailyInput.value);
    if(!Number.isFinite(bal) || !Number.isFinite(acc)){
      alert('Please enter valid numbers');
      return;
    }
    localStorage.setItem(LS_KEYS.currentBalance, String(bal));
    localStorage.setItem(LS_KEYS.dailyAccrual, String(acc));
    localStorage.setItem(LS_KEYS.lastAccrual, new Date().toISOString());
    alert('Settings saved');
    window.location.href = 'index.html';
  }

  if(form) form.addEventListener('submit', save);
  load();
});
