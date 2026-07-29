
const currentDashboardPage=document.body.dataset.dashboardPage;
document.querySelectorAll('.dash-nav [data-page]').forEach(link=>link.classList.toggle('active',link.dataset.page===currentDashboardPage));
document.querySelectorAll('.period-switch button,.dash-tabs button').forEach(button=>button.addEventListener('click',()=>{button.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('active'));button.classList.add('active')}));
document.querySelectorAll('.music-controls button,.admin-actions button,.text-button').forEach(button=>button.addEventListener('click',()=>{button.classList.add('clicked');setTimeout(()=>button.classList.remove('clicked'),220)}));

// Server management tabs and demo interactions.
const serverTabButtons=document.querySelectorAll('[data-server-tab]');
const serverPanels=document.querySelectorAll('[data-server-panel]');
function openServerPanel(name){serverTabButtons.forEach(button=>button.classList.toggle('active',button.dataset.serverTab===name));serverPanels.forEach(panel=>panel.classList.toggle('active',panel.dataset.serverPanel===name));history.replaceState(null,'',`#${name}`)}
serverTabButtons.forEach(button=>button.addEventListener('click',()=>openServerPanel(button.dataset.serverTab)));
document.querySelectorAll('[data-open-panel]').forEach(button=>button.addEventListener('click',()=>openServerPanel(button.dataset.openPanel)));
const requestedPanel=location.hash.slice(1);if(requestedPanel&&document.querySelector(`[data-server-panel="${requestedPanel}"]`))openServerPanel(requestedPanel);
const saveSettings=document.getElementById('saveSettings');const saveState=document.getElementById('saveState');
if(saveSettings&&saveState){saveSettings.addEventListener('click',()=>{saveState.textContent='Saving…';saveSettings.disabled=true;setTimeout(()=>{saveState.textContent='All changes saved';saveSettings.disabled=false},700)});document.querySelectorAll('.server-workspace input,.server-workspace select,.server-workspace textarea').forEach(field=>field.addEventListener('change',()=>saveState.textContent='Unsaved changes'))}
const memberSearch=document.getElementById('memberSearch');if(memberSearch){memberSearch.addEventListener('input',()=>{const query=memberSearch.value.toLowerCase().trim();document.querySelectorAll('[data-member-row]').forEach(row=>row.style.display=row.textContent.toLowerCase().includes(query)?'grid':'none')})}
