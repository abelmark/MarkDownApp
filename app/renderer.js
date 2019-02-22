const marked = require('marked');

const { remote, ipcRenderer } = require('electron');

let filePath = null;
let originalContent = '';

const mainProcess = remote.require('./main');
const currentWindow = remote.getCurrentWindow();

console.log(mainProcess);

const markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const newFileButton = document.querySelector('#new-file');
const openFileButton = document.querySelector('#open-file');
const saveMarkdownButton = document.querySelector('#save-markdown');
const revertButton = document.querySelector('#revert');
const saveHtmlButton = document.querySelector('#save-html');
const showFileButton = document.querySelector('#show-file');
const openInDefaultButton = document.querySelector('#open-in-default');

const renderMarkdownToHtml = markdown => {
  htmlView.innerHTML = marked(markdown, { sanitize: true });
};

const updateUserInterface = () => {
  console.log('[current window]', currentWindow);
  let title = 'Fire Sale';
  if(filePath){
    console.log('[HIT]');
    console.log('[file path]', filePath);
    title = `${filePath} - ${title}`;
    currentWindow.setTitle(title);
  }
};

markdownView.addEventListener('keyup', event => {
  const currentContent = event.target.value;
  renderMarkdownToHtml(currentContent);
});

openFileButton.addEventListener('click', () => {
  mainProcess.getFileFromUser();
});

newFileButton.addEventListener('click', () => {
  alert('you clicked new!');
});

ipcRenderer.on('file-opened', (event, name, content) => {
  filePath = name;
  originalContent = content;

  markdownView.value = content;
  renderMarkdownToHtml(content);

  updateUserInterface();
});