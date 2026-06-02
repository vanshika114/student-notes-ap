const inputText = document.getElementById('inputText');
const sizeEl = document.getElementById('size');
const marginEl = document.getElementById('margin');
const generateBtn = document.getElementById('generate');
const downloadBtn = document.getElementById('download');
const clearBtn = document.getElementById('clear');
const canvas = document.getElementById('qrcanvas');
const placeholder = document.getElementById('qrplaceholder');

function renderQR(){
  const text = (inputText.value || '').trim();
  const size = Math.max(64, Math.min(1024, parseInt(sizeEl.value)||256));
  const margin = Math.max(0, Math.min(20, parseInt(marginEl.value)||2));
  if(!text){ placeholder.style.display='block'; canvas.style.display='none'; downloadBtn.disabled=true; return; }

  placeholder.style.display='none'; canvas.style.display='block';
  // use qrcode lib to draw to canvas
  QRCode.toCanvas(canvas, text, { width: size, margin }, function (error) {
    if (error) {
      console.error(error);
      placeholder.textContent = 'Failed to generate QR';
      placeholder.style.display = 'block';
      canvas.style.display = 'none';
      downloadBtn.disabled = true;
      return;
    }
    downloadBtn.disabled = false;
  });
}

function downloadPNG(){
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  const safeText = (inputText.value || 'qr').replace(/[^a-z0-9-_]/gi,'_').slice(0,40);
  a.download = `qrcode_${safeText}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function clearAll(){ inputText.value=''; placeholder.style.display='block'; canvas.style.display='none'; downloadBtn.disabled=true; }

generateBtn.addEventListener('click', renderQR);
inputText.addEventListener('keypress', (e)=>{ if(e.key==='Enter') renderQR(); });
downloadBtn.addEventListener('click', downloadPNG);
clearBtn.addEventListener('click', clearAll);

// initial state
canvas.style.display='none'; downloadBtn.disabled=true; placeholder.style.display='block';