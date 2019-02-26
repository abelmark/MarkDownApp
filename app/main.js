const fs = require('fs');
const { app, BrowserWindow, dialog, Menu } = require('electron');

let mainWindow = null;

app.on('ready', () => {
  mainWindow = new BrowserWindow({ show: false });

  mainWindow.loadFile(`${__dirname}/index.html`);

  Menu.setApplicationMenu(applicationMenu);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
});

exports.getFileFromUser = () => {
  const files = dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    buttonLabel: 'Unveil',
    title: 'Open Fire Sale Document',
    filters: [
      { name: 'Markdown', extensions: ['md', 'mdown', 'markdown', 'marcdown'] },
      { name: 'Text', extensions: ['txt', 'text'] },
    ],
  });

  if (!files) return;

  const file = files[0];
  openFile(file);
};

exports.saveMarkDown  = (file, content) => {
  if (!file) {
    file = dialog.showSaveDialog(mainWindow, {
      title: 'Save Markdown',
      defaultPath: app.getPath('desktop'),
      filters: [
        { name: 'Markdown', extensions: ['md', 'markdown', 'mdown', 'marcdown'] }
      ]
    });
  }
  if (!file) return;

  fs.writeFileSync(file, content);
  openFile(file);
};

exports.saveHTML = (content) => {
  const file = dialog.showSaveDialog(mainWindow, {
    title: 'Save Html',
    defaultPath: app.getPath('desktop'),
    filters: [
      { name: 'HTML', extensions: ['html'] }
    ]
  });
  if (!file) return;

  fs.writeFileSync(file, content);
};

const openFile = (exports.openFile = file => {
  const content = fs.readFileSync(file).toString();
  app.addRecentDocument(file);
  mainWindow.webContents.send('file-opened', file, content);
});

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open File',
        accelerator: 'CommandOrControl+O',
        click(){
          exports.getFileFromUser();
        }
      },
      {
        label: 'Save File',
        accelerator: 'CommandOrControl+S',
        click(){
          mainWindow.webContents.send('save-markdown');
        }
      },
      {
        label: 'Save HTML',
        accelerator: 'CommandOrControl+H',
        click(){
          mainWindow.webContents.send('save-html');
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'pasteandmatchstyle' },
      { role: 'delete' },
      { role: 'selectall' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    role: 'window',
    submenu: [
      { role: 'minimize' },
      { role: 'close' }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () { require('electron').shell.openExternal('https://electronjs.org') }
      }
    ]
  }
];

if (process.platform === 'darwin'){
  const applicationName = 'Fire Sale';
  template.unshift({
    label: applicationName,
    submenu: [
      {
        label: `About ${applicationName}`,
      },
      {
        label: `Quit ${applicationName}`,
        role: 'quit'
      }
    ]
  });
}

const applicationMenu = Menu.buildFromTemplate(template);



