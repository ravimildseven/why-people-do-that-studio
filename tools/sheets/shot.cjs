// usage: node shot.cjs <html> <png> <w> <h> [scale]
const {chromium} = (() => { try { return require('/opt/node-tools/node_modules/playwright'); } catch { return require('playwright'); } })();
(async () => {
  const [html, png, w, h, scale = '1'] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({viewport: {width: +w, height: +h}, deviceScaleFactor: +scale});
  await p.goto('file://' + require('path').resolve(html));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(150);
  await p.screenshot({path: png});
  await b.close();
})();
