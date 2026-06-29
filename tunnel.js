const localtunnel = require('localtunnel');
let subdomain = process.argv[2] || 'aksci-morningstar';
async function start() {
  const tunnel = await localtunnel({ port: 3456, subdomain });
  console.log('Tunnel URL:', tunnel.url);
  tunnel.on('close', () => { setTimeout(start, 2000); });
}
start();
