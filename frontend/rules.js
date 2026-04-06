window.addEventListener('load', function () {
  fillFormWithCurrentRules();
  loadViolationsFromBackend();
  renderViolations();
});

function fillFormWithCurrentRules() {
  document.getElementById('max-trades').value = myRules.maxTradesPerDay;
  document.getElementById('max-loss').value = myRules.maxDailyLoss;
  document.getElementById('max-risk').value = myRules.maxRiskPerTrade;
  document.getElementById('max-drawdown').value = myRules.maxDrawdown;
  document.getElementById('min-rr').value = myRules.minRewardRisk;

  document.getElementById('rule-stoploss').checked = myRules.needStopLoss;
  document.getElementById('rule-rr').checked = myRules.enforceRR;
  document.getElementById('rule-daily-cap').checked = myRules.useDailyCap;
  document.getElementById('rule-loss-limit').checked = myRules.useLossLimit;
}

function saveRules() {
  var maxTrades = parseInt(document.getElementById('max-trades').value);
  var maxLoss = parseFloat(document.getElementById('max-loss').value);
  var maxRisk = parseFloat(document.getElementById('max-risk').value);
  var maxDrawdown = parseFloat(document.getElementById('max-drawdown').value);
  var minRR = parseFloat(document.getElementById('min-rr').value);

  if (!maxTrades || !maxLoss || !maxRisk || !maxDrawdown || !minRR) {
    showToast('error', 'Please fill in all fields before saving.');
    return;
  }

  if (maxTrades < 1) {
    showToast('error', 'Max trades must be at least 1.');
    return;
  }

  if (maxRisk > 10) {
    showToast('warning', 'Risk per trade is quite high. Are you sure?');
  }

  myRules.maxTradesPerDay = maxTrades;
  myRules.maxDailyLoss = maxLoss;
  myRules.maxRiskPerTrade = maxRisk;
  myRules.maxDrawdown = maxDrawdown;
  myRules.minRewardRisk = minRR;
  myRules.needStopLoss = document.getElementById('rule-stoploss').checked;
  myRules.enforceRR = document.getElementById('rule-rr').checked;
  myRules.useDailyCap = document.getElementById('rule-daily-cap').checked;
  myRules.useLossLimit = document.getElementById('rule-loss-limit').checked;

  saveRulesToStorage();
  postToAPI('/create-rule', myRules);
  showToast('success', 'Rules saved!');
}
