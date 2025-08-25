import '@xterm/xterm/css/xterm.css';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { ClipboardAddon } from '@xterm/addon-clipboard';
import { WebContainer, WebContainerProcess } from '@webcontainer/api';
import { files } from './files';

async function main() {
  let webcontainerInstance: WebContainer;

  const termEl = document.getElementById('terminal');

  if (!termEl) {
    throw new Error('Terminal element not found');
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

  window.addEventListener('load', async () => {
    webcontainerInstance = await WebContainer.boot();
    await webcontainerInstance.mount(files);

    // Wait for `server-ready` event
    webcontainerInstance.on('server-ready', async (port, url) => {
      console.log('Webcontainer is ready');
    });

    const shellProcess = await startShell(term, webcontainerInstance);
    window.addEventListener('resize', () => {
      fitAddon.fit();
      shellProcess.resize({
        cols: term.cols,
        rows: term.rows,
      });
    });
  });
}

async function startShell(terminal: Terminal, webContainerInstance: WebContainer): Promise<WebContainerProcess> {
  const shellProcess = await webContainerInstance.spawn('jsh', {
    terminal: {
      cols: terminal.cols,
      rows: terminal.rows,
    },
  });

  shellProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        terminal.write(data);
      },
    })
  );
  const shellInputWriter = shellProcess.input.getWriter();
  terminal.onData((data) => {
    shellInputWriter.write(data);
  });

  return shellProcess;
}

main().catch((err) => {
  console.error(err);
});
