import{PLANS as i,gstBreakup as s,inr as l,TRIAL_DAYS as n}from"./core/plans.js";const d=document.getElementById("plans");let a="Y";function c(){d.innerHTML=i.map(e=>{const t=a==="Y"?e.yearly:e.monthly,r=s(t,"32"),o=s(t,"33");return`<div class="plan ${e.popular?"pop":""}">${e.popular?'<span class="badge">Most popular</span>':""}
      <h3>${e.name}</h3>
      <div class="price">${l(t)}<small>${t?a==="Y"?" / year":" / month":""}</small></div>
      <div class="gst">${t?`+ 18% GST = ${l(r.total)}${r.total!==o.total?` (${l(o.total)} outside Kerala)`:""}`:"Free, after the trial"}</div>
      <div class="save">${t&&a==="Y"?`Save ${l(e.monthly)} — one month free`:""}</div>
      <ul><li>${e.computers} computer${e.computers>1?"s":""}${e.computers>1?", counters synced":""}</li><li>${e.users} user login${e.users>1?"s":""}</li><li>${e.note}</li>${t?"<li>GST tax invoice &amp; receipt</li><li>Updates and support</li>":""}</ul>
      <a class="btn ${e.popular?"gold":"primary"}" href="./">${t?"Start free trial":"Start"}</a></div>`}).join("")}document.querySelectorAll("[data-cycle]").forEach(e=>e.addEventListener("click",()=>{a=e.dataset.cycle,document.querySelectorAll("[data-cycle]").forEach(t=>t.classList.toggle("on",t===e)),c()})),document.getElementById("trial-pill").textContent=`${n}-day free trial — every feature`,c();
