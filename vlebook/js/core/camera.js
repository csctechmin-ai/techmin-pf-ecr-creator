import{esc as u}from"./utils.js";function p(){return!!navigator.mediaDevices?.getUserMedia}function h({title:s="Camera",facing:m="environment"}={}){return new Promise(n=>{if(!p()){n(null);return}const a=document.createElement("div");a.className="modal-backdrop open studio-cam",a.innerHTML=`
      <div class="modal" style="max-width:720px;">
        <div class="modal-header"><h3>${u(s)}</h3></div>
        <div class="modal-body">
          <video id="cam-v" autoplay playsinline muted style="width:100%;max-height:60vh;background:#000;border-radius:8px;"></video>
          <div class="form-hint" id="cam-msg">Allow camera access when the browser asks. Hold the document flat and well lit.</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" data-cam="flip">Switch camera</button>
          <button class="btn btn-outline" data-cam="cancel">Cancel</button>
          <button class="btn btn-primary" data-cam="snap" disabled>Capture</button>
        </div>
      </div>`,document.body.appendChild(a);const t=a.querySelector("#cam-v");let o=null,c=m;const i=()=>o?.getTracks().forEach(e=>e.stop()),d=e=>{i(),a.remove(),n(e)},r=async()=>{i();try{o=await navigator.mediaDevices.getUserMedia({video:{facingMode:c,width:{ideal:2560},height:{ideal:1440}},audio:!1}),t.srcObject=o,a.querySelector('[data-cam="snap"]').disabled=!1}catch(e){a.querySelector("#cam-msg").textContent=`The camera could not be opened (${e.name||e.message}). Check the browser's camera permission.`}};a.querySelector('[data-cam="cancel"]').onclick=()=>d(null),a.querySelector('[data-cam="flip"]').onclick=()=>{c=c==="environment"?"user":"environment",r()},a.querySelector('[data-cam="snap"]').onclick=()=>{const e=document.createElement("canvas");e.width=t.videoWidth,e.height=t.videoHeight,e.getContext("2d").drawImage(t,0,0),e.toBlob(l=>d(l?new File([l],`camera_${Date.now()}.jpg`,{type:"image/jpeg"}):null),"image/jpeg",.95)},r()})}export{p as cameraSupported,h as captureFromCamera};
