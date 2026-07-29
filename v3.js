
const currentDashboardPage=document.body.dataset.dashboardPage;
document.querySelectorAll('.dash-nav [data-page]').forEach(link=>link.classList.toggle('active',link.dataset.page===currentDashboardPage));
document.querySelectorAll('.period-switch button,.dash-tabs button').forEach(button=>button.addEventListener('click',()=>{button.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('active'));button.classList.add('active')}));
document.querySelectorAll('.music-controls button,.admin-actions button,.text-button').forEach(button=>button.addEventListener('click',()=>{button.classList.add('clicked');setTimeout(()=>button.classList.remove('clicked'),220)}));
