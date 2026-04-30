var todayStats = {
  tradesPlaced: 0,
  totalLoss: 0,
  disciplineScore: 100,
  violations: 0
};

var tradeList = [];
var pendingTrade = null;

window.addEventListener('load', function () {
  loadSessionFromBackend();
  updateStatBoxes();
  updateProgressBars();
  checkForWarnings();
  loadTradeTable();
});

async function loadSessionFromBackend() {
  var data = await getFromAPI('/risk-status');
  if (!data) return;

  if (data.trades_today != null) todayStats.tradesPlaced = data.trades_today;
  if (data.daily_loss != null) todayStats.totalLoss = data.daily_loss;
  if (data.discipline_score != null) todayStats.disciplineScore = data.discipline_score;
  if (data.violations != null) todayStats.violations = data.violations;
  if (data.max_trades != null) myRules.maxTradesPerDay = data.max_trades;
  if (data.max_loss != null) myRules.maxDailyLoss = data.max_loss;

  updateStatBoxes();
  updateProgressBars();
  checkForWarnings();
  loadTradeTable();
}

function updateStatBoxes() {
  setText('stat-trades', todayStats.tradesPlaced);
  setText('stat-score', todayStats.disciplineScore);
  setText('stat-violations', todayStats.violations);
  setText('stat-max-trades', myRules.maxTradesPerDay);
  setText('stat-max-loss', myRules.maxDailyLoss);
}

function updateProgressBars() {
  var riskInput = document.getElementById('trade-risk');
  var currentRisk = riskInput ? parseFloat(riskInput.value) : 1.5;

  fillProgressBar('bar-trades', (todayStats.tradesPlaced / myRules.maxTradesPerDay) * 100);
  fillProgressBar('bar-loss', (todayStats.totalLoss / myRules.maxDailyLoss) * 100);
  fillProgressBar('bar-risk', (currentRisk / myRules.maxRiskPerTrade) * 100);

  setText('bar-label-trades', todayStats.tradesPlaced + ' / ' + myRules.maxTradesPerDay);
  setText('bar-label-loss', '$' + todayStats.totalLoss + ' / $' + myRules.maxDailyLoss);
  setText('bar-label-risk', currentRisk + '% / ' + myRules.maxRiskPerTrade + '%');
}

function fillProgressBar(barId, percent) {
  var bar = document.getElementById(barId);
  if (!bar) return;
  if (percent > 100) percent = 100;
  bar.style.width = percent + '%';
  bar.className = 'progress-bar ' + (percent < 50 ? 'green' : percent < 80 ? 'yellow' : 'red');
}

document.addEventListener('DOMContentLoaded', function () {
  var riskInput = document.getElementById('trade-risk');
  if (riskInput) riskInput.addEventListener('input', updateProgressBars);
});

function checkForWarnings() {
  var area = document.getElementById('dashboard-warnings');
  if (!area) return;

  var html = '';

  if (todayStats.tradesPlaced >= myRules.maxTradesPerDay) {
    html += '<div class="alert alert-danger">🚫 Daily trade limit reached. No more trades today.</div>';
  } else if (todayStats.tradesPlaced >= myRules.maxTradesPerDay - 1) {
    html += '<div class="alert alert-warning">⚠️ Almost at your trade limit — ' + todayStats.tradesPlaced + ' of ' + myRules.maxTradesPerDay + ' used.</div>';
  }

  if (todayStats.totalLoss >= myRules.maxDailyLoss) {
    html += '<div class="alert alert-danger">🔴 Daily loss limit hit. Trading halted.</div>';
  } else if (todayStats.totalLoss >= myRules.maxDailyLoss * 0.8) {
    html += '<div class="alert alert-warning">⚠️ Getting close to daily loss limit — $' + todayStats.totalLoss + ' of $' + myRules.maxDailyLoss + '.</div>';
  }

  area.innerHTML = html;
}

function checkTradeRules(trade) {
  var problems = [];

  if (myRules.useDailyCap && todayStats.tradesPlaced >= myRules.maxTradesPerDay)
    problems.push('Already placed ' + todayStats.tradesPlaced + ' trades today. Max is ' + myRules.maxTradesPerDay + '.');

  if (myRules.useLossLimit && todayStats.totalLoss >= myRules.maxDailyLoss)
    problems.push('Daily loss limit reached ($' + todayStats.totalLoss + ' / $' + myRules.maxDailyLoss + ').');

  if (trade.risk > myRules.maxRiskPerTrade)
    problems.push('Risk is ' + trade.risk + '% but your limit is ' + myRules.maxRiskPerTrade + '%.');

  if (myRules.needStopLoss && (!trade.stopLoss || trade.stopLoss === 0))
    problems.push('A stop loss is required before placing this trade.');

  if (myRules.enforceRR && trade.stopLoss && trade.takeProfit && trade.openPrice) {
    var ratio = Math.abs(trade.takeProfit - trade.openPrice) / Math.abs(trade.openPrice - trade.stopLoss);
    if (ratio < myRules.minRewardRisk)
      problems.push('R:R ratio is ' + ratio.toFixed(2) + ', minimum is ' + myRules.minRewardRisk + '.');
  }

  return problems;
}

function submitTrade() {
  var trade = {
    symbol: document.getElementById('trade-symbol').value,
    direction: document.getElementById('trade-direction').value,
    lot: parseFloat(document.getElementById('trade-lot').value),
    risk: parseFloat(document.getElementById('trade-risk').value),
    stopLoss: parseFloat(document.getElementById('trade-stoploss').value),
    takeProfit: parseFloat(document.getElementById('trade-takeprofit').value),
    openPrice: parseFloat((Math.random() * 0.5 + 1.08).toFixed(4))
  };

  var problems = checkTradeRules(trade);
  var isBlocked = problems.length > 0;
  pendingTrade = trade;

  var titleEl = document.getElementById('popup-title');
  titleEl.textContent = isBlocked ? 'Trade Blocked' : 'Trade Looks Good!';
  titleEl.style.color = isBlocked ? 'var(--red)' : 'var(--green)';
  document.getElementById('popup-subtitle').textContent = isBlocked
    ? 'This trade breaks one or more of your rules.'
    : 'All rules passed. Ready to send to MT5.';

  var body = '<div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:14px;font-size:13px;line-height:2;margin-bottom:12px">'
    + '<div>Symbol: <strong>' + trade.symbol + '</strong> &nbsp; Direction: <strong>' + trade.direction + '</strong></div>'
    + '<div>Lot: <strong>' + trade.lot + '</strong> &nbsp; Risk: <strong>' + trade.risk + '%</strong></div>'
    + '<div>SL: <strong>' + trade.stopLoss + ' pips</strong> &nbsp; TP: <strong>' + trade.takeProfit + ' pips</strong></div>'
    + '</div>';

  if (isBlocked) {
    for (var i = 0; i < problems.length; i++)
      body += '<div class="alert alert-danger" style="margin-bottom:8px">⛔ ' + problems[i] + '</div>';

    document.getElementById('popup-confirm-btn').style.display = 'none';
    todayStats.violations++;
    updateDisciplineScore(true);
    updateStatBoxes();

    for (var j = 0; j < problems.length; j++)
      addViolation('Trade BLOCKED — ' + problems[j]);
  } else {
    body += '<div class="alert alert-success">✓ All rules satisfied</div>';
    document.getElementById('popup-confirm-btn').style.display = 'inline-flex';
  }

  document.getElementById('popup-body').innerHTML = body;
  document.getElementById('trade-popup').classList.add('open');
}

function closePopup() {
  document.getElementById('trade-popup').classList.remove('open');
}

function confirmTrade() {
  var trade = pendingTrade;

  var newTrade = {
    id: 'T' + String(tradeList.length + 1).padStart(3, '0'),
    symbol: trade.symbol,
    direction: trade.direction,
    lot: trade.lot,
    openPrice: trade.openPrice,
    stopLoss: trade.stopLoss,
    takeProfit: trade.takeProfit,
    profit: '—',
    status: 'allowed',
    time: new Date().toTimeString().slice(0, 5)
  };

  tradeList.unshift(newTrade);
  todayStats.tradesPlaced++;

  var hint = document.getElementById('first-trade-hint');
  if (hint) hint.style.display = 'none';

  updateDisciplineScore(false);
  updateStatBoxes();
  updateProgressBars();
  checkForWarnings();
  loadTradeTable();
  closePopup();
  postToAPI('/execute-trade', newTrade);
  showToast('success', 'Trade sent: ' + trade.direction + ' ' + trade.symbol);
}

function updateDisciplineScore(brokeARule) {
  todayStats.disciplineScore += brokeARule ? -5 : 2;
  if (todayStats.disciplineScore < 0) todayStats.disciplineScore = 0;
  if (todayStats.disciplineScore > 100) todayStats.disciplineScore = 100;
}

async function loadTradeTable() {
  var data = await getFromAPI('/trade-history');
  if (data && data.trades && data.trades.length > 0) tradeList = data.trades;

  var tbody = document.getElementById('trade-table-body');
  if (!tbody) return;

  if (tradeList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:var(--text-dim);padding:28px">No trades yet. Place your first trade above.</td></tr>';
    return;
  }

  var rows = '';
  for (var i = 0; i < tradeList.length; i++) {
    var t = tradeList[i];
    var profitColor = t.profit.startsWith('+') ? 'var(--green)' : t.profit.startsWith('-') ? 'var(--red)' : 'var(--text-muted)';
    var dirTag = t.direction === 'BUY' ? 'tag-blue' : 'tag-yellow';
    var statusTag = t.status === 'allowed' ? 'tag-green' : 'tag-red';

    rows += '<tr>'
      + '<td style="color:var(--text-dim)">' + t.id + '</td>'
      + '<td><strong style="color:var(--text)">' + t.symbol + '</strong></td>'
      + '<td><span class="tag ' + dirTag + '">' + t.direction + '</span></td>'
      + '<td>' + t.lot + '</td>'
      + '<td>' + t.openPrice + '</td>'
      + '<td style="color:var(--red)">' + (t.stopLoss || '—') + '</td>'
      + '<td style="color:var(--green)">' + (t.takeProfit || '—') + '</td>'
      + '<td style="color:' + profitColor + '">' + t.profit + '</td>'
      + '<td><span class="tag ' + statusTag + '">' + t.status + '</span></td>'
      + '<td style="color:var(--text-dim)">' + t.time + '</td>'
      + '</tr>';
  }
  tbody.innerHTML = rows;
}
