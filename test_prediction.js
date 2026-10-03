(async () => {
  try {
    await import('file:///' + 'c:/Users/HP/OneDrive/Documents/SIH2/admin/prediction.js');
    console.log('prediction.js loaded successfully');
  } catch (e) {
    console.log('prediction.js error:', e);
  }
})();
