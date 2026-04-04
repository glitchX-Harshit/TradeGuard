window.addEventListener('load', function () {
  loadAnalyticsData();
});

async function loadAnalyticsData() {
  var data = await getFromAPI('/analytics');

  if (!data) {
    showEmptyChart('pnl-chart', 'No data yet — make some trades first');
    showEmptyChart('score-chart', 'No data yet — make some trades first');
    showEmptyChart('winloss-chart', 'No trades yet');
    showEmptyChart('symbols-chart', 'No trades yet');
    showEmptyChart('violations-chart', 'No violations yet');
    return;
  }

  drawPnLChart(data.daily_pnl || []);
  drawScoreChart(data.daily_scores || []);
  drawWinLossChart(data.wins || 0, data.losses || 0, data.breakeven || 0);
  drawSymbolsChart(
    data.symbols || ['EURUSD', 'GBPUSD', 'XAUUSD', 'NAS100', 'US30'],
    data.symbol_counts || [0, 0, 0, 0, 0]
  );
  drawViolationsChart(
    data.violation_types || ['Hit Loss Limit', 'No Stop Loss', 'Too Much Risk', 'Too Many Trades'],
    data.violation_counts || [0, 0, 0, 0]
  );
}

function showEmptyChart(canvasId, message) {
  var ctx = setupCanvas(canvasId);
  if (!ctx) return;
  ctx.fillStyle = '#64748b';
  ctx.font = '13px Segoe UI, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(message, ctx.canvas.width / 2, ctx.canvas.height / 2);
}

function setupCanvas(canvasId) {
  var canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  canvas.width = canvas.offsetWidth || canvas.parentElement.offsetWidth;
  canvas.height = canvas.offsetHeight || canvas.parentElement.offsetHeight;
  return canvas.getContext('2d');
}

function drawPnLChart(values) {
  var ctx = setupCanvas('pnl-chart');
  if (!ctx) return;
  if (values.length === 0) { showEmptyChart('pnl-chart', 'No trade data yet'); return; }

  var canvas = ctx.canvas;
  var w = canvas.width, h = canvas.height, p = 30;
  var max = Math.max.apply(null, values);
  var min = Math.min.apply(null, values);
  var range = (max - min) || 1;
  var bw = (w - p * 2) / values.length - 2;
  var zeroY = h - p - ((0 - min) / range) * (h - p * 2);

  for (var i = 0; i < values.length; i++) {
    var v = values[i];
    var x = p + i * ((w - p * 2) / values.length);
    var bh = (Math.abs(v) / range) * (h - p * 2);
    ctx.fillStyle = v >= 0 ? 'rgba(16,185,129,0.7)' : 'rgba(239,68,68,0.7)';
    ctx.fillRect(x, v >= 0 ? zeroY - bh : zeroY, bw, bh);
  }

  ctx.strokeStyle = '#2a3347';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(p, zeroY);
  ctx.lineTo(w - p, zeroY);
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '10px Segoe UI, Arial, sans-serif';
  ctx.fillText('Profit', 2, zeroY - 6);
  ctx.fillText('Loss', 2, zeroY + 14);
}

function drawScoreChart(values) {
  var ctx = setupCanvas('score-chart');
  if (!ctx) return;
  if (values.length === 0) { showEmptyChart('score-chart', 'No score data yet'); return; }

  var canvas = ctx.canvas;
  var w = canvas.width, h = canvas.height, p = 30;

  function toY(v) { return h - p - (v / 100) * (h - p * 2); }
  function toX(i) { return p + (i / (values.length - 1)) * (w - p * 2); }

  ctx.beginPath();
  ctx.moveTo(toX(0), toY(values[0]));
  for (var i = 1; i < values.length; i++) ctx.lineTo(toX(i), toY(values[i]));
  ctx.lineTo(toX(values.length - 1), h - p);
  ctx.lineTo(toX(0), h - p);
  ctx.closePath();
  ctx.fillStyle = 'rgba(59,130,246,0.07)';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(toX(0), toY(values[0]));
  for (var i = 1; i < values.length; i++) ctx.lineTo(toX(i), toY(values[i]));
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.stroke();

  for (var i = 0; i < values.length; i++) {
    ctx.beginPath();
    ctx.arc(toX(i), toY(values[i]), 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
  }

  ctx.fillStyle = '#64748b';
  ctx.font = '10px Segoe UI, Arial, sans-serif';
  ctx.fillText('100', 2, p + 4);
  ctx.fillText('50', 2, h / 2);
  ctx.fillText('0', 2, h - p);
}

function drawWinLossChart(wins, losses, breakeven) {
  var ctx = setupCanvas('winloss-chart');
  if (!ctx) return;
  if (wins + losses + breakeven === 0) { showEmptyChart('winloss-chart', 'No trades yet'); return; }

  var c = ctx.canvas;
  var ls = 44, cx = c.width / 2, cy = (c.height - ls) / 2, r = Math.min(cx, cy) - 12;
  drawDonutChart(ctx, cx, cy, r, ['Wins', 'Losses', 'Breakeven'], [wins, losses, breakeven], ['#10b981', '#ef4444', '#f59e0b'], ls, c.height);
}

function drawSymbolsChart(symbols, counts) {
  var ctx = setupCanvas('symbols-chart');
  if (!ctx) return;

  var hasData = counts.some(function (c) { return c > 0; });
  if (!hasData) { showEmptyChart('symbols-chart', 'No trades yet'); return; }

  var canvas = ctx.canvas;
  var w = canvas.width, h = canvas.height, p = 10, lw = 58;
  var maxCount = Math.max.apply(null, counts) || 1;
  var rowH = (h - p * 2) / symbols.length;

  for (var i = 0; i < symbols.length; i++) {
    var y = p + i * rowH;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Segoe UI, Arial, sans-serif';
    ctx.fillText(symbols[i], p, y + rowH / 2 + 4);

    var bl = (counts[i] / maxCount) * (w - lw - p * 2);
    ctx.fillStyle = 'rgba(59,130,246,0.55)';
    ctx.beginPath();
    ctx.roundRect(lw, y + 7, bl, rowH - 16, 3);
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.fillText(counts[i], lw + bl + 5, y + rowH / 2 + 4);
  }
}

function drawViolationsChart(labels, counts) {
  var ctx = setupCanvas('violations-chart');
  if (!ctx) return;

  var total = counts.reduce(function (a, b) { return a + b; }, 0);
  if (total === 0) { showEmptyChart('violations-chart', 'No violations yet!'); return; }

  var c = ctx.canvas;
  var ls = 44, cx = c.width / 2, cy = (c.height - ls) / 2, r = Math.min(cx, cy) - 12;
  drawDonutChart(ctx, cx, cy, r, labels, counts, ['#ef4444', '#f59e0b', '#f97316', '#64748b'], ls, c.height);
}

function drawDonutChart(ctx, cx, cy, r, labels, values, colors, ls, ch) {
  var total = values.reduce(function (a, b) { return a + b; }, 0);
  var angle = -Math.PI / 2;

  for (var i = 0; i < values.length; i++) {
    var slice = (values[i] / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle, angle + slice);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();
    angle += slice;
  }

  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
  ctx.fillStyle = '#1c2333';
  ctx.fill();

  var ly = ch - ls + 10;
  var iw = ctx.canvas.width / labels.length;
  for (var i = 0; i < labels.length; i++) {
    var ix = i * iw + 6;
    ctx.fillStyle = colors[i];
    ctx.fillRect(ix, ly, 8, 8);
    ctx.fillStyle = '#64748b';
    ctx.font = '9px Segoe UI, Arial, sans-serif';
    ctx.fillText(labels[i], ix + 11, ly + 8);
  }
}
