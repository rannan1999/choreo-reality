const http = require('http');
const fs = require('fs');
const exec = require("child_process").exec;
const subtxt = './app/url.txt'
const HTTP_PORT = process.env.HTTP_PORT || 3000;

// Set environment variables with default values
const UUID = process.env.UUID || 'faacf142-dee8-48c2-8558-641123eb939c';
const NEZHA_SERVER = process.env.NEZHA_SERVER || 'nezha.mingfei1981.eu.org';
const NEZHA_PORT = process.env.NEZHA_PORT || '443';
const NEZHA_KEY = process.env.NEZHA_KEY || 'm8jMueKABWlcoPwkw8';
const FILE_PATH = process.env.FILE_PATH || './.npm';
const SNI = process.env.SNI || 'www.yahoo.com';
const SERVER_PORT = process.env.SERVER_PORT || process.env.PORT || '7860';

// Ensure the download directory exists
const DOWNLOAD_DIR = path.resolve(FILE_PATH);
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

const ARCH = os.arch();
let FILE_INFO = [];

if (['arm', 'arm64', 'aarch64'].includes(ARCH)) {
  FILE_INFO = [
    { url: 'https://github.com/eooce/test/releases/download/arm64/xray', filename: 'web' },
    { url: 'https://github.com/eooce/test/releases/download/ARM/swith', filename: 'npm' }
  ];
} else if (['amd64', 'x86_64', 'x86'].includes(ARCH)) {
  FILE_INFO = [
    { url: 'https://github.com/eooce/test/releases/download/amd64/xray', filename: 'web' },
    { url: 'https://github.com/eooce/test/releases/download/bulid/swith', filename: 'npm' }
  ];
} else {
  console.error(`Unsupported architecture: ${ARCH}`);
  process.exit(1);
}

const downloadFile = (url, filename) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filename);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        fs.chmodSync(filename, '755');
        console.log(`\x1b[1;32mDownloading ${filename}\x1b[0m`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(filename);
      reject(err.message);
    });
  });
};

const downloadFiles = async () => {
  for (const { url, filename } of FILE_INFO) {
    const filePath = path.join(DOWNLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
      console.log(`\x1b[1;32m${filePath} already exists, Skipping download\x1b[0m`);
    } else {
      await downloadFile(url, filePath);
    }
  }
};

const generateConfig = () => {
  const X25519Key = execSync(`${path.join(DOWNLOAD_DIR, 'web')} x25519`).toString();
  const [PrivateKey, PublicKey] = X25519Key.split('\n').map(line => line.split(' ')[2]);
  const shortid = execSync('openssl rand -hex 8').toString().trim();

  const config = {
    inbounds: [{
      port: SERVER_PORT,
      protocol: 'vless',
      settings: {
        clients: [{ id: UUID, flow: 'xtls-rprx-vision' }],
        decryption: 'none'
      },
      streamSettings: {
        network: 'tcp',
        security: 'reality',
        realitySettings: {
          show: false,
          dest: '1.1.1.1:443',
          xver: 0,
          serverNames: [SNI],
          privateKey: PrivateKey,
          minClientVer: '',
          maxClientVer: '',
          maxTimeDiff: 0,
          shortIds: [shortid]
        }
      }
    }],
    outbounds: [
      { protocol: 'freedom', tag: 'direct' },
      { protocol: 'blackhole', tag: 'blocked' }
    ]
  };

  fs.writeFileSync(path.join(DOWNLOAD_DIR, 'config.json'), JSON.stringify(config, null, 2));
};

const run = () => {
  if (fs.existsSync(path.join(DOWNLOAD_DIR, 'npm'))) {
    const tlsPorts = ['443', '8443', '2096', '2087', '2083', '2053'];
    const NEZHA_TLS = tlsPorts.includes(NEZHA_PORT) ? '--tls' : '';
    if (NEZHA_SERVER && NEZHA_PORT && NEZHA_KEY) {
      exec(`nohup ${path.join(DOWNLOAD_DIR, 'npm')} -s ${NEZHA_SERVER}:${NEZHA_PORT} -p ${NEZHA_KEY} ${NEZHA_TLS} >/dev/null 2>&1 &`, (err) => {
        if (err) throw err;
        console.log('\x1b[1;32mnpm is running\x1b[0m');
      });
    } else {
      console.log('\x1b[1;35mNEZHA variable is empty, skipping running\x1b[0m');
    }
  }

  if (fs.existsSync(path.join(DOWNLOAD_DIR, 'web'))) {
    exec(`nohup ${path.join(DOWNLOAD_DIR, 'web')} -c ${path.join(DOWNLOAD_DIR, 'config.json')} >/dev/null 2>&1 &`, (err) => {
      if (err) throw err;
      console.log('\x1b[1;32mweb is running\x1b[0m');
    });
  }
};

const getPublicIP = () => {
  return new Promise((resolve, reject) => {
    https.get('https://ipv4.icanhazip.com', (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        resolve(data.trim());
      });
    }).on('error', (err) => {
      reject(err.message);
    });
  });
};

const getISP = () => {
  return new Promise((resolve, reject) => {
    https.get('https://speed.cloudflare.com/meta', (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        const ispInfo = JSON.parse(data);
        resolve(`${ispInfo.org}-${ispInfo.asn}`.replace(/ /g, '_'));
      });
    }).on('error', (err) => {
      reject(err.message);
    });
  });
};

const saveConfig = async () => {
  const IP = await getPublicIP();
  const ISP = await getISP();

  const configUrl = `vless://${UUID}@${IP}:${SERVER_PORT}?encryption=none&flow=xtls-rprx-vision&security=reality&sni=${SNI}&fp=chrome&pbk=${PublicKey}&sid=${shortid}&type=tcp&headerType=none#${ISP}`;
  fs.writeFileSync(path.join(DOWNLOAD_DIR, 'list.txt'), configUrl);
  console.log(`\n\x1b[1;32m${path.join(DOWNLOAD_DIR, 'list.txt')} saved successfully\x1b[0m`);
};

(async () => {
  try {
    await downloadFiles();
    generateConfig();
    run();
    await saveConfig();
    console.log('\n\x1b[1;32mRunning success!\x1b[0m');
  } catch (error) {
    console.error(error);
  }
})();
