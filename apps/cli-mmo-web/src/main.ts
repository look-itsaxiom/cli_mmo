import '@xterm/xterm/css/xterm.css';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { ClipboardAddon } from '@xterm/addon-clipboard';

async function main() {
  let termEl = document.getElementById('terminal');

  if (!termEl) {
    termEl = document.createElement('div');
    termEl.id = 'terminal';
    document.body.appendChild(termEl);
  }

  const term = new Terminal({ cursorBlink: true, convertEol: true });
  const fitAddon = new FitAddon();
  const webLinksAddon = new WebLinksAddon();
  const clipboardAddon = new ClipboardAddon();

  term.loadAddon(fitAddon);
  term.loadAddon(webLinksAddon);
  term.loadAddon(clipboardAddon);

  term.open(termEl);
  fitAddon.fit();
}

main().catch((err) => {
  console.error(err);
});
