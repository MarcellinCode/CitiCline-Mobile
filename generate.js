const fs = require('fs');
try {
  const img = fs.readFileSync('c:/Users/User/Desktop/RecyCla/wave-clean-mobile/assets/citicline_logo.png');
  const base64Str = 'data:image/png;base64,' + img.toString('base64');
  const content = 'export const CITICLINE_LOGO_BASE64 = `' + base64Str + '`;\n';
  fs.writeFileSync('c:/Users/User/Desktop/RecyCla/wave-clean-mobile/src/components/ui/logoBase64.ts', content);
  console.log('SUCCESS: logoBase64.ts created!');
} catch (e) {
  console.error('ERROR:', e);
}
