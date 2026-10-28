import { BarChart3, Bell, Building2, Calculator, ChevronDown, ChevronRight, ClipboardList, FileSpreadsheet, FileText, History, KeyRound, LogOut, Menu, ReceiptText, Package, ShieldCheck, Truck, Users, WalletCards, X, ArrowUpRight, PanelLeftClose } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useBranch } from '../contexts/BranchContext.jsx';
import { confirmAction } from '../utils/alerts.js';

const sections = [
 {title:'เริ่มต้นใช้งาน',items:[['dashboard','ภาพรวมธุรกิจ',BarChart3,true],['quick','บันทึกงานด่วน',ClipboardList,false],['deliveries','ประวัติรายการ',History,false],['calculator','คำนวณระยะทาง',Calculator,false]]},
 {title:'งานขนส่งและบัญชี',items:[['trips','บัญชีคนขับ',ReceiptText,true],['billing','ใบวางบิล',FileText,true],['ledger','บัญชีขนส่ง',WalletCards,true],['reports','รายงานประจำเดือน',FileSpreadsheet,true]]},
 {title:'จัดการองค์กร',items:[['materials','ประเภทวัสดุ',Package,true],['vehicles','รถและคนขับ',Truck,true],['branches','สาขา',Building2,true],['users','พนักงานและสิทธิ์',Users,true],['notifications','แจ้งเตือน',Bell,true],['account','บัญชีของฉัน',KeyRound,false]]}
];
export default function Layout({page,setPage,children}) {
 const {user,logout,isOwner}=useAuth();
 const {activeBranch,activeBranches,activeBranchId,selectBranch}=useBranch();
 const [open,setOpen]=useState(false); const [compact,setCompact]=useState(false);
 const permitted=sections.map(g=>({...g,items:g.items.filter(([, , ,admin])=>!admin||isOwner)})).filter(g=>g.items.length);
 const all=permitted.flatMap(g=>g.items);
 const selected=all.find(item=>item[0]===page)||all[0];
 const SelectedIcon=selected[2];
 const docks=(isOwner?['dashboard','quick','billing','trips']:['quick','deliveries','calculator','account']);
 useEffect(()=>{document.body.classList.toggle('jps-drawer-lock',open);const esc=e=>{if(e.key==='Escape')setOpen(false)};window.addEventListener('keydown',esc);return()=>{document.body.classList.remove('jps-drawer-lock');window.removeEventListener('keydown',esc)}},[open]);
 function go(key){setPage(key);setOpen(false);window.scrollTo({top:0,behavior:'smooth'})}
 async function signOut(){if(await confirmAction('ออกจากระบบ?','ข้อมูลที่บันทึกไว้จะยังคงอยู่'))logout()}
 const menu=<>
  <div className="neo-brand"><img src="/jps-logo.png" alt="โลโก้ JPS"/><div><strong>JPS <em>TRANSPORT</em></strong><span>TEST SYSTEM / OPERATIONS</span></div></div>
  <div className="neo-nav-scroll">{permitted.map(group=><div className="neo-nav-section" key={group.title}><p className="neo-nav-caption">{group.title}</p>{group.items.map(([key,label,Icon])=><button key={key} type="button" className={'neo-nav-button '+(page===key?'neo-active':'')} onClick={()=>go(key)} title={label} aria-current={page===key?'page':undefined}><Icon size={19}/><span>{label}</span>{page===key&&<ChevronRight className="neo-nav-arrow" size={15}/>}</button>)}</div>)}</div>
  <div className="neo-sidebar-foot"><div className="neo-user-avatar">{(user?.name||user?.username||'J')[0].toUpperCase()}</div><div className="neo-user-meta"><strong>{user?.name||user?.username||'ผู้ใช้งาน'}</strong><span>{isOwner?'ผู้ดูแลระบบ':'เจ้าหน้าที่บันทึกงาน'}</span></div><button type="button" onClick={signOut} aria-label="ออกจากระบบ" title="ออกจากระบบ"><LogOut size={19}/></button></div>
 </>;
 return <div className={'neo-app '+(compact?'neo-compact':'')}>
  <aside className="neo-sidebar" aria-label="เมนูหลักของระบบ">{menu}</aside>
  <div className="neo-workspace">
   <header className="neo-topbar"><div className="neo-topbar-left"><button className="neo-icon-button neo-mobile-toggle" onClick={()=>setOpen(true)} aria-label="เปิดเมนู"><Menu size={23}/></button><button className="neo-icon-button neo-desktop-toggle" onClick={()=>setCompact(v=>!v)} aria-label="ย่อเมนู"><PanelLeftClose size={20}/></button><div className="neo-breadcrumb"><span>JPS Workspace</span><ChevronRight size={14}/><strong>{selected[1]}</strong></div></div><div className="neo-topbar-right">{isOwner?<label className="neo-branch-picker"><Building2 size={17}/><select value={activeBranchId||''} onChange={e=>selectBranch(e.target.value)} aria-label="เลือกสาขา">{activeBranches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select><ChevronDown size={15}/></label>:<span className="neo-branch-picker"><Building2 size={17}/>{activeBranch?.name||'สาขาของฉัน'}</span>}<div className="neo-avatar-small">{(user?.name||user?.username||'J')[0].toUpperCase()}</div></div></header>
   <main className="neo-content" id="main-content"><div className="neo-page-heading"><div><p className="neo-eyebrow">JPS / TRANSPORT OPERATIONS</p><h1><SelectedIcon size={26}/>{selected[1]}</h1><p>จัดการข้อมูลขนส่งอย่างเป็นระบบ แม่นยำ และใช้งานง่าย</p></div><button className="neo-quick-create" onClick={()=>go('quick')}><ClipboardList size={18}/> บันทึกงานใหม่ <ArrowUpRight size={17}/></button></div>{children}</main>
  </div>
  <nav className="neo-mobile-dock" aria-label="เมนูด่วน">{docks.map(key=>{const item=all.find(it=>it[0]===key);if(!item)return null;const Icon=item[2];return <button key={key} onClick={()=>go(key)} className={page===key?'neo-dock-active':''}><Icon size={21}/><span>{item[1]}</span></button>})}<button onClick={()=>setOpen(true)} aria-label="เมนูทั้งหมด"><Menu size={21}/><span>เพิ่มเติม</span></button></nav>
  {open&&<div className="neo-drawer-overlay" onClick={()=>setOpen(false)}><div className="neo-drawer" role="dialog" aria-modal="true" aria-label="เมนูทั้งหมด" onClick={e=>e.stopPropagation()}><button className="neo-drawer-close" onClick={()=>setOpen(false)} aria-label="ปิดเมนู"><X size={22}/></button>{menu}</div></div>}
 </div>
}
