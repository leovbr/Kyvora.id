(()=>{'use strict';
const SUPABASE_URL='https://pwjdhvpbvyazwcwbblll.supabase.co';
const SUPABASE_KEY='sb_publishable_sySKIQtnTqJsHtH7jLYYBw__VoTaiBA';
const LOGIN='admin-login.html',ACTIVATE='admin-activate.html';
const protectedPath=/^admin(?:-catalog|-testimonials)?\.html$/;
const path=location.pathname.split('/').pop()||'index.html';
const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
async function isAdmin(user){if(!user?.id)return false;const {data,error}=await client.from('kyvora_admin_users').select('user_id').eq('user_id',user.id).maybeSingle();return !error&&!!data}
async function requireAdmin(){const {data:{session}}=await client.auth.getSession();if(!session?.user||!(await isAdmin(session.user))){await client.auth.signOut();location.replace(LOGIN+'?next='+encodeURIComponent(path));return false}return true}
window.KyvoraAuth={client,isAdmin,requireAdmin,async logout(){await client.auth.signOut();location.replace(LOGIN)}};
document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('[data-auth-placeholder="logout"]').forEach(link=>link.addEventListener('click',async e=>{e.preventDefault();if(confirm('Keluar dari dashboard admin?'))await window.KyvoraAuth.logout()}))});
if(protectedPath.test(path)){document.documentElement.style.visibility='hidden';document.addEventListener('DOMContentLoaded',async()=>{try{if(await requireAdmin())document.documentElement.style.visibility='visible'}catch{location.replace(LOGIN)}},{once:true})}
if(path===LOGIN){client.auth.getSession().then(async({data:{session}})=>{if(session?.user&&await isAdmin(session.user)){const next=new URLSearchParams(location.search).get('next');location.replace(next&&/^admin(?:-catalog|-testimonials)?\.html$/.test(next)?next:'admin.html')}})}
})();