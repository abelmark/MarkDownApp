const path = require('path');

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

const truncatePath = (filePath) => {
  return path.basename(filePath);
};

const updateUserInterface = (isEdited) => {
  let title = 'Fire Sale';

  if (filePath) {
    title = `${truncatePath(filePath)} - ${title}`;
    currentWindow.setRepresentedFilename(filePath);
  }
  if (isEdited) {
    title = `${title} (Edited)`;
    currentWindow.setDocumentEdited(isEdited);
  }
  currentWindow.setTitle(title);
  
  
  saveMarkdownButton.disabled = !isEdited;
  revertButton.disabled = !isEdited;

};

markdownView.addEventListener('keyup', event => {
  const currentContent = event.target.value;

  renderMarkdownToHtml(currentContent);
  updateUserInterface(currentContent !== originalContent);
});

openFileButton.addEventListener('click', () => {
  mainProcess.getFileFromUser();
});

newFileButton.addEventListener('click', () => {
  alert('you clicked new!');
});

saveMarkdownButton.addEventListener('click', () => {
  mainProcess.saveMarkDown(filePath, markdownView.value);
});

saveHtmlButton.addEventListener('click', () => {
  mainProcess.saveHTML(htmlView.innerHTML);
});

ipcRenderer.on('file-opened', (event, name, content) => {
  filePath = name;
  originalContent = content;

  markdownView.value = content;
  renderMarkdownToHtml(content);

  updateUserInterface();
});

document.addEventListener('dragstart', event => event.preventDefault());
document.addEventListener('dragover', event => event.preventDefault());
document.addEventListener('dragleave', event => event.preventDefault());
document.addEventListener('drop', event => event.preventDefault());

const getDraggedFile = event => event.dataTransfer.items[0];
const getDroppedFile = event => event.dataTransfer.files[0];
const fileTypeIsSupported = file => {
  return ['text/plain', 'text/markdown'].includes(file.type);
};
const clearClassesFromView = () => {
  markdownView.classList.remove('drag-over');
  markdownView.classList.remove('drag-error');
};

markdownView.addEventListener('dragover', (event) => {
  const file = getDraggedFile(event);

  if (fileTypeIsSupported(file)){
    markdownView.classList.add('drag-over');
  } else {
    markdownView.classList.add('drag-error');
  }
});

markdownView.addEventListener('dragleave', () => {
  clearClassesFromView();
});

markdownView.addEventListener('drop', (event) => {
  const file = getDroppedFile(event);
  
  if (fileTypeIsSupported(file)) {
    mainProcess.openFile(file.path);
  } else {
    alert('That file type is not supported');
  }

  clearClassesFromView();
});