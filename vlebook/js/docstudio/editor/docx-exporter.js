function g(t){const r=typeof t=="string"?new TextEncoder().encode(t):t;let e=-1;for(let n=0;n<r.length;n++)e=e>>>8^y[(e^r[n])&255];return(e^-1)>>>0}const y=(()=>{let t;const r=[];for(let e=0;e<256;e++){t=e;for(let n=0;n<8;n++)t=t&1?3988292384^t>>>1:t>>>1;r[e]=t}return r})();class x{constructor(){this.files=[]}addFile(r,e){const n=typeof e=="string"?new TextEncoder().encode(e):e;this.files.push({path:r,bytes:n,crc:g(n)})}generateBlob(){let r=0;const e=[],n=[];this.files.forEach(l=>{const w=new TextEncoder().encode(l.path),p=l.bytes.length,u=new Uint8Array(30+w.length),c=new DataView(u.buffer);c.setUint32(0,67324752,!0),c.setUint16(4,20,!0),c.setUint16(6,0,!0),c.setUint16(8,0,!0),c.setUint16(10,0,!0),c.setUint16(12,0,!0),c.setUint32(14,l.crc,!0),c.setUint32(18,p,!0),c.setUint32(22,p,!0),c.setUint16(26,w.length,!0),c.setUint16(28,0,!0),u.set(w,30),e.push({header:u,data:l.bytes,offset:r});const f=new Uint8Array(46+w.length),o=new DataView(f.buffer);o.setUint32(0,33639248,!0),o.setUint16(4,20,!0),o.setUint16(6,20,!0),o.setUint16(8,0,!0),o.setUint16(10,0,!0),o.setUint16(12,0,!0),o.setUint16(14,0,!0),o.setUint32(16,l.crc,!0),o.setUint32(20,p,!0),o.setUint32(24,p,!0),o.setUint16(28,w.length,!0),o.setUint16(30,0,!0),o.setUint16(32,0,!0),o.setUint16(34,0,!0),o.setUint16(36,0,!0),o.setUint32(38,0,!0),o.setUint32(42,r,!0),f.set(w,46),n.push(f),r+=u.length+l.bytes.length});const m=r;let i=0;n.forEach(l=>i+=l.length);const s=new Uint8Array(22),a=new DataView(s.buffer);a.setUint32(0,101010256,!0),a.setUint16(4,0,!0),a.setUint16(6,0,!0),a.setUint16(8,this.files.length,!0),a.setUint16(10,this.files.length,!0),a.setUint32(12,i,!0),a.setUint32(16,m,!0),a.setUint16(20,0,!0);const d=[];return e.forEach(l=>{d.push(l.header),d.push(l.data)}),n.forEach(l=>d.push(l)),d.push(s),new Blob(d,{type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"})}}function h(t){return t?t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;"):""}function C(t){if(!t)return"<w:p><w:r><w:t></w:t></w:r></w:p>";if(typeof document>"u"){let m="";const s=t.replace(/\r?\n/g," ").match(/<(h[1-3]|p|div|li)[^>]*>(.*?)<\/\1>/gi);if(s)for(const a of s){const d=a.match(/^<([a-z0-9]+)/i)[1].toLowerCase(),w=a.replace(/^<[^>]+>/,"").replace(/<\/[^>]+>$/,"").replace(/<[^>]+>/g,"").trim(),p=/<(b|strong)[^>]*>/i.test(a),u=d.startsWith("h"),c=u?d.slice(1):null;let f="<w:pPr>";u&&(f+=`<w:pStyle w:val="Heading${c}"/>`),f+="</w:pPr>";let o="<w:rPr>";(p||u)&&(o+="<w:b/>"),o+='<w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Noto Sans Malayalam"/></w:rPr>',m+=`<w:p>${f}<w:r>${o}<w:t xml:space="preserve">${h(w)}</w:t></w:r></w:p>`}return m||`<w:p><w:r><w:t xml:space="preserve">${h(t.replace(/<[^>]+>/g,""))}</w:t></w:r></w:p>`}const r=document.createElement("div");r.innerHTML=t;let e="";const n=m=>{for(const i of m.childNodes)if(i.nodeType===Node.TEXT_NODE){const s=i.nodeValue;s&&s.trim()&&(e+=`<w:p><w:r><w:t xml:space="preserve">${h(s)}</w:t></w:r></w:p>`)}else if(i.nodeType===Node.ELEMENT_NODE){const s=i.tagName.toLowerCase();if(s==="p"||s==="div")e+=U(i);else if(s==="h1"||s==="h2"||s==="h3")e+=v(i,s);else if(s==="table")e+=b(i);else if(s==="ul"||s==="ol")for(const a of i.querySelectorAll("li"))e+=`<w:p><w:pPr><w:pStyle w:val="ListParagraph"/></w:pPr><w:r><w:t>• ${h(a.innerText)}</w:t></w:r></w:p>`;else n(i)}};return n(r),e||"<w:p><w:r><w:t></w:t></w:r></w:p>"}function U(t){let r="";const e=t.style.textAlign||"";let n="";e==="center"?n='<w:jc w:val="center"/>':e==="right"?n='<w:jc w:val="right"/>':e==="justify"&&(n='<w:jc w:val="both"/>');const m=(i,s=!1,a=!1,d=!1)=>{for(const l of i.childNodes)if(l.nodeType===Node.TEXT_NODE){const w=l.nodeValue;if(w){let p="<w:rPr>";s&&(p+="<w:b/>"),a&&(p+="<w:i/>"),d&&(p+='<w:u w:val="single"/>'),p+='<w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Noto Sans Malayalam"/></w:rPr>',r+=`<w:r>${p}<w:t xml:space="preserve">${h(w)}</w:t></w:r>`}}else if(l.nodeType===Node.ELEMENT_NODE){const w=l.tagName.toLowerCase();m(l,s||w==="b"||w==="strong",a||w==="i"||w==="em",d||w==="u")}};return m(t),`<w:p><w:pPr>${n}</w:pPr>${r}</w:p>`}function v(t,r){const e=r==="h1"?"1":r==="h2"?"2":"3";return`<w:p><w:pPr><w:pStyle w:val="Heading${e}"/><w:jc w:val="left"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="${e==="1"?"32":"28"}"/></w:rPr><w:t>${h(t.innerText)}</w:t></w:r></w:p>`}function b(t){let r='<w:tbl><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/><w:left w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/><w:right w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/></w:tblBorders></w:tblPr>';for(const e of t.querySelectorAll("tr")){r+="<w:tr>";for(const n of e.querySelectorAll("td, th"))r+=`<w:tc><w:p><w:r><w:t>${h(n.innerText)}</w:t></w:r></w:p></w:tc>`;r+="</w:tr>"}return r+="</w:tbl>",r}function T(t,r="Document"){const e=new x;e.addFile("[Content_Types].xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`),e.addFile("_rels/.rels",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`),e.addFile("word/_rels/document.xml.rels",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`),e.addFile("word/styles.xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Noto Sans Malayalam"/>
        <w:sz w:val="24"/>
        <w:lang w:val="en-US"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:rPr><w:b/><w:sz w:val="36"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:rPr><w:b/><w:sz w:val="28"/></w:rPr>
  </w:style>
</w:styles>`);const n=C(t);return e.addFile("word/document.xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${n}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`),e.generateBlob()}export{T as generateDocxBlob,C as htmlToDocxXml};
