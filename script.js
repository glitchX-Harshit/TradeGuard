var API_URL = 'http://localhost:8000';

var myRules = {
  maxTradesPerDay: 5,
  maxDailyLoss: 500,
  maxRiskPerTrade: 2,
  maxDrawdown: 1000,
  minRewardRisk: 1.5,
  needStopLoss: true,
  enforceRR: true,
  useDailyCap: true,
  useLossLimit: true
};

function loadSavedRules() {
  var saved = localStorage.getItem('myRules');
  if (saved) myRules = JSON.parse(saved);
}

function saveRulesToStorage() {
  localStorage.setItem('myRules', JSON.stringify(myRules));
}

loadSavedRules();

// violations list — shared between dashboard and rules page
var violationsList = [];

function addViolation(message) {
  var time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  violationsList.unshift({ message: message, time: 'Today at ' + time, type: 'red' });
  if (violationsList.length > 10) violationsList.pop();
}

function renderViolations() {
  var container = document.getElementById('violations-list');
  if (!container) return;

  if (violationsList.length === 0) {
    container.innerHTML = '<div style="color: var(--text-dim); font-size: 13px; padding: 12px 0">No violations yet. Keep following your rules!</div>';
    return;
  }

  var html = '';
  for (var i = 0; i < violationsList.length; i++) {
    var v = violationsList[i];
    html += '<div class="violation-item">'
      + '<span class="violation-dot ' + v.type + '"></span>'
      + '<div>'
      + '<div class="violation-text">' + v.message + '</div>'
      + '<div class="violation-time">' + v.time + '</div>'
      + '</div></div>';
  }
  container.innerHTML = html;
}

async function loadViolationsFromBackend() {
  var data = await getFromAPI('/violations');
  if (!data || !data.violations) return;

  violationsList = data.violations.map(function (v) {
    return {
      message: v.message,
      time: v.time,
      type: v.severity === 'block' ? 'red' : 'yellow'
    };
  });
  renderViolations();
}

async function loadLiveStats() {
  var data = await getFromAPI('/risk-status');
  if (!data) return;

  var hint = document.getElementById('live-stats-hint');
  if (hint && data.trades_today > 0) hint.style.display = 'none';

  setText('live-trades-today', data.trades_today ?? '0');
  setText('live-daily-pnl', data.daily_pnl != null ? '$' + data.daily_pnl : '$0');
  setText('live-score', data.discipline_score ?? '100');
  setText('live-violations', data.violations ?? '0');
  setText('live-win-rate', data.win_rate != null ? data.win_rate + '%' : '—');
  setText('live-avg-rr', data.avg_rr ?? '—');
}

function showToast(type, message) {
  var area = document.getElementById('toast-area');
  if (!area) return;

  var box = document.createElement('div');
  box.className = 'toast ' + type;
  box.textContent = message;
  area.appendChild(box);

  setTimeout(function () { box.remove(); }, 3000);
}

function setText(id, value) {
  var el = document.getElementById(id);
  if (el) el.textContent = value;
}

async function postToAPI(endpoint, data) {
  try {
    var res = await fetch(API_URL + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (e) {
    return null;
  }
}

async function getFromAPI(endpoint) {
  try {
    var res = await fetch(API_URL + endpoint);
    return await res.json();
  } catch (e) {
    return null;
  }
}
