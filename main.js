const API_URL = 'https://vt-web-app-backend-production.up.railway.app/upload-ifc';

function getIfcFiles() {
  const allFiles = Array.from(document.getElementById('fileInput').files);
  return allFiles.filter(f => f.name.toLowerCase().endsWith('.ifc'));
}

function updateFileList() {
  const ifcFiles = getIfcFiles();
  const allFiles = Array.from(document.getElementById('fileInput').files);
  const list = document.getElementById('fileList');
  const btn  = document.getElementById('uploadBtn');

  if (ifcFiles.length === 0) {
    list.textContent = allFiles.length > 0
      ? 'No IFC files found in that folder.'
      : 'No folder selected';
    btn.disabled = true;
  } else {
    list.innerHTML = ifcFiles.map(f => `<span>${f.name}</span>`).join('');
    btn.disabled = false;
  }
}

function setStatus(type, msg) {
  const el = document.getElementById('status');
  el.style.display = type === 'loading' ? 'flex' : 'block';
  el.className = type === 'loading' ? 'status' : type;
  el.innerHTML = type === 'loading'
    ? `<div class="spinner"></div><span>${msg}</span>`
    : `${type === 'success' ? '&#10003;' : '&#10007;'} ${msg}`;
}

async function uploadFiles() {
  const ifcFiles = getIfcFiles();
  const btn = document.getElementById('uploadBtn');
  if (ifcFiles.length === 0) return;

  btn.disabled = true;
  const formData = new FormData();
  for (const f of ifcFiles) formData.append('files', f);

  try {
    setStatus('loading', 'Uploading files&#8230;');
    const response = await fetch(API_URL, { method: 'POST', body: formData });
    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    setStatus('loading', 'Preparing your Excel file&#8230;');
    const blob = await response.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'Extracted_Data.xlsx';
    document.body.appendChild(a); a.click(); a.remove();

    setStatus('success', 'Excel file downloaded successfully.');
  } catch (err) {
    setStatus('error', err.message || 'Something went wrong.');
  } finally {
    btn.disabled = false;
  }
}