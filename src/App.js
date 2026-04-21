import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc, query, orderBy, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCCzFtgLd-Dn76q4MMbE8Dqs3ZhENfuR3E",
  authDomain: "offszn-portal.firebaseapp.com",
  projectId: "offszn-portal",
  storageBucket: "offszn-portal.firebasestorage.app",
  messagingSenderId: "1027879996229",
  appId: "1:1027879996229:web:7d709b06d0a5a07d2e8c2c"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const WHATSAPP_NUMBER = "2347072654465";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
const CALENDLY_URL = "https://calendly.com/offsznfitness/30min";
const GOOGLE_MAP_EMBED = `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63433.717629755476!2d3.405385486200593!3d6.444434088416819!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x843f52860d3572fd%3A0x93855861f2d34fcf!2sOff-Szn%20Mobile%20Gym%20Ltd!5e0!3m2!1sen!2sng!4v1776186010992!5m2!1sen!2sng" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
const FONT = "'Arial Black', Impact, 'Helvetica Neue', Arial, sans-serif";
const FL = "'Helvetica Neue', Arial, sans-serif";
const VAT = 0.075;
const vat = (p) => Math.round(p * (1 + VAT));
const fmtPrice = (p) => vat(p).toLocaleString();

const LOGO_SVG = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120"><text x="200" y="70" text-anchor="middle" font-family="Arial Black,Impact,sans-serif" font-weight="900" font-size="64" fill="white" font-style="italic" letter-spacing="-2">OFF-SZN</text><text x="200" y="100" text-anchor="middle" font-family="Arial,sans-serif" font-weight="400" font-size="20" fill="white" letter-spacing="12">MOBILE</text></svg>`)}`;

const sendToWhatsApp = (data) => { const msg = encodeURIComponent(`New Sign-Up from Off-Szn Website:\n\nName: ${data.name}\nLocation: ${data.location}\nGoal: ${data.goal}\nPhone: ${data.phone}\n\nSent from offszn.com`); window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`; };
const sendPlanToWhatsApp = (planName, price) => { const msg = encodeURIComponent(`Hi Off-Szn! I'm interested in the ${planName} plan (₦${price} incl. VAT). I'd like to get started.`); window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`; };
const scrollToSection = (id) => { document.getElementById(id)?.scrollIntoView({behavior:"smooth"}); };

const useSmoothScroll = () => { const [scrollY, setScrollY] = useState(0); const target = useRef(0), current = useRef(0), raf = useRef(null); useEffect(() => { const onScroll = () => { target.current = window.scrollY; }; window.addEventListener("scroll", onScroll, {passive:true}); const animate = () => { current.current += (target.current - current.current)*0.08; setScrollY(current.current); raf.current = requestAnimationFrame(animate); }; raf.current = requestAnimationFrame(animate); return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf.current); }; }, []); return scrollY; };

const useInView = (threshold=0.15) => { const ref = useRef(null); const [visible, setVisible] = useState(false); useEffect(() => { const el = ref.current; if(!el) return; const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting){setVisible(true);obs.unobserve(el);} },{threshold}); obs.observe(el); return () => obs.disconnect(); }, [threshold]); return [ref, visible]; };

const AnimateIn = ({children, delay=0, direction="up", style:s}) => { const [ref, visible] = useInView(0.1); const t = {up:"translateY(60px)",down:"translateY(-60px)",left:"translateX(60px)",right:"translateX(-60px)",scale:"scale(0.9)"}; return <div ref={ref} style={{opacity:visible?1:0,transform:visible?"translate(0) scale(1)":t[direction],transition:`opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,willChange:"opacity, transform",...s}}>{children}</div>; };

const Spinner = ({white}) => <div style={{width:20,height:20,border:`2px solid ${white?"rgba(255,255,255,0.2)":"rgba(0,0,0,0.2)"}`,borderTop:`2px solid ${white?"#fff":"#000"}`,borderRadius:"50%",animation:"spin 0.6s linear infinite",display:"inline-block",verticalAlign:"middle"}}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

const Carousel = ({images}) => { const [idx, setIdx] = useState(0); const timer = useRef(null); useEffect(() => { timer.current = setInterval(() => setIdx(p=>(p+1)%images.length),3000); return () => clearInterval(timer.current); },[images.length]); return (<div style={{position:"relative",width:"100%",height:300,overflow:"hidden"}}>{images.map((img,i) => <div key={i} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",opacity:i===idx?1:0,transform:i===idx?"scale(1)":"scale(1.05)",transition:"opacity 0.8s ease, transform 0.8s ease",background:"#111",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"rgba(255,255,255,0.15)",fontSize:14,letterSpacing:2}}>{img}</span></div>)}<div style={{position:"absolute",bottom:12,left:"50%",transform:"translateX(-50%)",display:"flex",gap:8,zIndex:2}}>{images.map((_,i) => <button key={i} onClick={() => {setIdx(i);clearInterval(timer.current);}} style={{width:i===idx?24:8,height:8,background:i===idx?"#fff":"rgba(255,255,255,0.3)",border:"none",cursor:"pointer",transition:"all 0.3s",padding:0}}/>)}</div></div>); };

const LogoSmall = () => <img src={LOGO_SVG} alt="Off-Szn" style={{height:38,width:"auto",display:"block"}}/>;
const CartBtn = ({count, onClick}) => { const [h, setH] = useState(false); return <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:"none",border:"none",cursor:"pointer",padding:4,transition:"opacity 0.3s",opacity:h?0.6:1,fontFamily:FL,fontSize:14,fontWeight:500,color:"#fff",letterSpacing:2,whiteSpace:"nowrap"}}>CART{count>0&&<span style={{marginLeft:4,background:"#fff",color:"#000",fontSize:10,fontWeight:700,width:18,height:18,borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",verticalAlign:"middle"}}>{count}</span>}</button>; };

const WhatsAppButton = () => { const [h, setH] = useState(false); return <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{position:"fixed",bottom:24,right:24,zIndex:9999,width:56,height:56,borderRadius:"50%",background:"#25D366",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 12px rgba(0,0,0,0.3)",cursor:"pointer",textDecoration:"none",transition:"transform 0.3s",transform:h?"scale(1.1)":"scale(1)"}}><svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.553 4.121 1.523 5.86L0 24l6.335-1.652A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.98 0-3.82-.577-5.37-1.57l-.385-.228-3.99 1.046 1.065-3.89-.252-.4A9.772 9.772 0 012.18 12c0-5.422 4.398-9.82 9.82-9.82 5.422 0 9.82 4.398 9.82 9.82 0 5.422-4.398 9.82-9.82 9.82z"/></svg></a>; };

const BtnPrimary = ({onClick, label, style:s, loading}) => { const [h, setH] = useState(false); return <button onClick={onClick} disabled={loading} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{padding:"16px 48px",background:loading?"rgba(255,255,255,0.7)":h?"rgba(255,255,255,0.85)":"#fff",color:"#000",border:"none",fontSize:15,fontWeight:600,cursor:loading?"not-allowed":"pointer",letterSpacing:2,transition:"all 0.3s cubic-bezier(0.16,1,0.3,1)",transform:h&&!loading?"scale(1.03)":"scale(1)",fontFamily:FL,minHeight:52,...s}}>{loading?<Spinner/>:label}</button>; };
const BtnOutline = ({onClick, label, full, style:s, loading}) => { const [h, setH] = useState(false); return <button onClick={onClick} disabled={loading} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{padding:"14px 32px",background:h?"rgba(255,255,255,0.08)":"transparent",color:"#fff",border:"1px solid",borderColor:h?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.15)",fontSize:14,fontWeight:500,cursor:loading?"not-allowed":"pointer",transition:"all 0.3s cubic-bezier(0.16,1,0.3,1)",width:full?"100%":"auto",transform:h&&!loading?"scale(1.02)":"scale(1)",fontFamily:FL,letterSpacing:1,...s}}>{loading?<Spinner white/>:label}</button>; };

const CartDrawer = ({cart, setCart, isOpen, setIsOpen}) => { const [loading, setLoading] = useState(false); const total = cart.reduce((s,i)=>s+i.price*i.qty,0); const totalVat = vat(total); const handleCheckout = () => { setLoading(true); setTimeout(()=>{setLoading(false);alert("Paystack checkout triggers here.");},1500); }; return (<div style={{position:"fixed",top:0,right:0,width:isOpen?"min(380px,90vw)":"0",height:"100%",background:"#0a0a0a",zIndex:1001,transition:"width 0.4s cubic-bezier(0.16,1,0.3,1)",overflow:"hidden",borderLeft:isOpen?"1px solid rgba(255,255,255,0.08)":"none"}}><div style={{padding:24,height:"100%",display:"flex",flexDirection:"column",minWidth:320}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}><h3 style={{fontSize:18,fontWeight:500,color:"#fff",margin:0,fontFamily:FL,letterSpacing:1}}>Your cart</h3><button onClick={()=>setIsOpen(false)} style={{background:"none",border:"none",color:"#fff",fontSize:24,cursor:"pointer",padding:4}}>&#10005;</button></div>{cart.length===0?<p style={{color:"rgba(255,255,255,0.35)",fontSize:14,flex:1,fontFamily:FL}}>Your cart is empty</p>:(<><div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:16}}>{cart.map((item,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 0",borderBottom:"1px solid rgba(255,255,255,0.06)"}}><div><p style={{color:"#fff",fontSize:14,fontWeight:500,margin:"0 0 4px",fontFamily:FL}}>{item.name}</p><p style={{color:"rgba(255,255,255,0.4)",fontSize:13,margin:0,fontFamily:FL}}>Qty: {item.qty}</p></div><div style={{display:"flex",alignItems:"center",gap:12}}><span style={{color:"#fff",fontSize:14,fontWeight:500,fontFamily:FL}}>&#8358;{(vat(item.price)*item.qty).toLocaleString()}</span><button onClick={()=>setCart(cart.filter((_,idx)=>idx!==i))} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",cursor:"pointer",fontSize:16}}>&#10005;</button></div></div>)}</div><div style={{borderTop:"1px solid rgba(255,255,255,0.1)",paddingTop:20,marginTop:16}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:"rgba(255,255,255,0.35)",fontSize:13,fontFamily:FL}}>Subtotal</span><span style={{color:"rgba(255,255,255,0.5)",fontSize:13,fontFamily:FL}}>&#8358;{total.toLocaleString()}</span></div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:"rgba(255,255,255,0.35)",fontSize:13,fontFamily:FL}}>VAT (7.5%)</span><span style={{color:"rgba(255,255,255,0.5)",fontSize:13,fontFamily:FL}}>&#8358;{(totalVat-total).toLocaleString()}</span></div><div style={{display:"flex",justifyContent:"space-between",marginBottom:20,marginTop:8}}><span style={{color:"rgba(255,255,255,0.5)",fontSize:15,fontFamily:FL}}>Total</span><span style={{color:"#fff",fontSize:20,fontWeight:600,fontFamily:FL}}>&#8358;{totalVat.toLocaleString()}</span></div><BtnPrimary onClick={handleCheckout} label={loading?null:"CHECKOUT"} style={{width:"100%"}} loading={loading}/></div></>)}</div></div>); };

const HamburgerMenu = ({isOpen, setIsOpen, setCurrentPage, user}) => {
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const items = [
    {label:"Home",action:()=>{setCurrentPage("home");setIsOpen(false);}},
    {label:"Memberships",action:()=>{setCurrentPage("memberships");setIsOpen(false);}},
    {label:"Store",action:()=>{setCurrentPage("store");setIsOpen(false);}},
  ];
  return (
    <div style={{position:"fixed",top:64,left:0,width:"100%",height:isOpen?"calc(100% - 64px)":"0",background:"rgba(0,0,0,0.98)",zIndex:999,overflow:"hidden",transition:"height 0.4s cubic-bezier(0.16,1,0.3,1)"}}>
      <div style={{padding:"0 32px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:0}}>
        {items.map((item,i)=><AnimateIn key={i} delay={isOpen?i*0.05:0} direction="right"><MenuItem label={item.label} onClick={item.action}/></AnimateIn>)}
        <AnimateIn delay={isOpen?0.15:0} direction="right"><MenuItem label="Sign up" onClick={()=>setSignUpOpen(!signUpOpen)}/></AnimateIn>
        {signUpOpen&&<><AnimateIn delay={0.05} direction="right"><MenuItem label="Quick sign up" onClick={()=>{setCurrentPage("signup");setIsOpen(false);}} sub/></AnimateIn><AnimateIn delay={0.1} direction="right"><MenuItem label="Book consultation" onClick={()=>{setCurrentPage("consultation");setIsOpen(false);}} sub/></AnimateIn></>}
        <AnimateIn delay={isOpen?0.2:0} direction="right"><MenuItem label="About" onClick={()=>setAboutOpen(!aboutOpen)}/></AnimateIn>
        {aboutOpen&&<><AnimateIn delay={0.05} direction="right"><MenuItem label="Training services" onClick={()=>{setCurrentPage("training");setIsOpen(false);}} sub/></AnimateIn><AnimateIn delay={0.1} direction="right"><MenuItem label="Virtual services" onClick={()=>{setCurrentPage("virtual");setIsOpen(false);}} sub/></AnimateIn></>}
        <AnimateIn delay={isOpen?0.25:0} direction="right"><MenuItem label="Client portal" onClick={()=>{setCurrentPage(user?"portal":"login");setIsOpen(false);}}/></AnimateIn>
        <AnimateIn delay={isOpen?0.3:0} direction="right"><MenuItem label="Contact" onClick={()=>{setCurrentPage("contact");setIsOpen(false);}}/></AnimateIn>
      </div>
    </div>
  );
};

const MenuItem = ({label, onClick, sub}) => { const [h, setH] = useState(false); return <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{display:"flex",alignItems:"center",justifyContent:"center",width:"100%",padding:sub?"6px 0":"10px 0",background:"none",border:"none",cursor:"pointer",transition:"all 0.4s cubic-bezier(0.16,1,0.3,1)",color:h?"rgba(255,255,255,0.4)":"#fff",fontFamily:FONT,textAlign:"center"}}><span style={{fontSize:sub?18:40,fontWeight:sub?500:700,letterSpacing:2}}>{label}</span></button>; };

const HeroSection = () => { const scrollY = useSmoothScroll(); const parallaxY = scrollY*0.4; const opacity = Math.max(1-scrollY/600,0); const scale = 1+scrollY*0.0003; return (<section style={{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center",padding:"80px 24px 40px",background:"#000",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:0,left:0,width:"100%",height:"120%",background:"#000",transform:`translateY(-${parallaxY}px) scale(${scale})`,willChange:"transform"}}><video autoPlay muted loop playsInline style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",objectFit:"cover",opacity:0.3}}><source src="" type="video/mp4"/></video><div style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",background:"linear-gradient(180deg,rgba(0,0,0,0.3) 0%,rgba(0,0,0,0.8) 100%)"}}/></div><div style={{position:"relative",zIndex:1,maxWidth:700,opacity,transform:`translateY(${scrollY*0.15}px)`,willChange:"transform,opacity"}}><AnimateIn delay={0.4}><h1 style={{fontSize:"clamp(64px, 12vw, 100px)",fontWeight:900,color:"#fff",lineHeight:1.0,margin:"0 0 16px",letterSpacing:-2,fontFamily:FONT}}>WE PULL UP.<br/>YOU LEVEL UP.</h1></AnimateIn><AnimateIn delay={0.6}><p style={{fontSize:18,color:"rgba(255,255,255,0.55)",margin:"0 0 12px",fontWeight:400,fontFamily:FL}}>At your convenience</p></AnimateIn><AnimateIn delay={0.7}><div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",margin:"0 0 40px"}}>{["Lekki","Victoria Island","Ikoyi"].map(a=><LocationTag key={a} label={a}/>)}</div></AnimateIn><AnimateIn delay={0.85}><BtnPrimary onClick={()=>scrollToSection("intro-offer")} label="START NOW"/></AnimateIn></div><div style={{position:"absolute",bottom:32,left:"50%",transform:"translateX(-50%)",zIndex:1,opacity:0.4}}><div style={{width:1,height:40,background:"rgba(255,255,255,0.3)",margin:"0 auto 8px",animation:"scrollPulse 2s infinite"}}/><style>{`@keyframes scrollPulse{0%,100%{opacity:0.3;transform:scaleY(1)}50%{opacity:0.8;transform:scaleY(1.3)}}`}</style></div></section>); };

const LocationTag = ({label}) => { const [h, setH] = useState(false); return <span onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{padding:"6px 16px",border:"1px solid",borderColor:h?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.2)",fontSize:13,color:h?"#fff":"rgba(255,255,255,0.6)",letterSpacing:1,transition:"all 0.3s",cursor:"default",background:h?"rgba(255,255,255,0.05)":"transparent",fontFamily:FL}}>{label}</span>; };

const SectionHeading = ({sub, title}) => (<>{sub&&<AnimateIn><h2 style={{fontSize:13,color:"rgba(255,255,255,0.4)",letterSpacing:4,fontWeight:500,margin:"0 0 12px",fontFamily:FL}}>{sub}</h2></AnimateIn>}{title&&<AnimateIn delay={0.1}><p style={{fontSize:"clamp(28px,5vw,44px)",fontWeight:700,color:"#fff",margin:"0 0 64px",fontFamily:FONT}}>{title}</p></AnimateIn>}</>);

const HowItWorks = () => { const steps = [{num:"01",title:"Book",desc:"Pick your plan and schedule your first session in under 3 minutes"},{num:"02",title:"We show up",desc:"Our trainers arrive at your location with all the equipment"},{num:"03",title:"You train",desc:"Get a personalized workout tailored to your goals"}]; return (<section style={{padding:"100px 24px",background:"#000"}}><div style={{maxWidth:800,margin:"0 auto",textAlign:"center"}}><SectionHeading sub="HOW IT WORKS" title="Simple as 1-2-3"/><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:32}}>{steps.map((s,i)=><AnimateIn key={i} delay={0.15+i*0.12}><StepCard {...s}/></AnimateIn>)}</div></div></section>); };
const StepCard = ({num, title, desc}) => { const [h, setH] = useState(false); return <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{padding:32,border:"1px solid",borderColor:h?"rgba(255,255,255,0.35)":"rgba(255,255,255,0.06)",transition:"all 0.5s cubic-bezier(0.16,1,0.3,1)",transform:h?"translateY(-8px)":"none",background:h?"rgba(255,255,255,0.03)":"transparent"}}><span style={{fontSize:44,fontWeight:800,color:h?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.08)",transition:"color 0.4s",fontFamily:FONT}}>{num}</span><h3 style={{fontSize:20,fontWeight:600,color:"#fff",margin:"16px 0 8px",fontFamily:FL}}>{title}</h3><p style={{fontSize:14,color:"rgba(255,255,255,0.4)",lineHeight:1.6,margin:0,fontFamily:FL}}>{desc}</p></div>; };

const IntroOffer = () => { const [loading, setLoading] = useState(false); const basePrice = 45000; const handleBuy = () => { setLoading(true); setTimeout(()=>{setLoading(false); const msg = encodeURIComponent("Hi Off-Szn! I'd like to purchase the 3-Session Starter Pack (₦" + fmtPrice(basePrice) + " incl. VAT). How do I proceed?"); window.location.href = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + msg;},1000); }; return (<section id="intro-offer" style={{padding:"100px 24px",background:"#000",borderTop:"1px solid rgba(255,255,255,0.04)"}}><div style={{maxWidth:600,margin:"0 auto",textAlign:"center"}}><AnimateIn><div style={{display:"inline-block",padding:"4px 14px",background:"rgba(255,255,255,0.05)",marginBottom:16,fontSize:12,color:"rgba(255,255,255,0.5)",fontWeight:500,letterSpacing:2,fontFamily:FL}}>LIMITED OFFER</div></AnimateIn><AnimateIn delay={0.1}><h2 style={{fontSize:"clamp(32px,6vw,48px)",fontWeight:700,color:"#fff",margin:"0 0 8px",fontFamily:FONT}}>3-session starter pack</h2></AnimateIn><AnimateIn delay={0.2} direction="scale"><div style={{margin:"24px 0"}}><span style={{fontSize:60,fontWeight:800,color:"#fff",fontFamily:FONT}}>&#8358;{fmtPrice(basePrice)}</span><p style={{fontSize:12,color:"rgba(255,255,255,0.25)",marginTop:4,fontFamily:FL}}>incl. 7.5% VAT</p></div></AnimateIn><AnimateIn delay={0.3}><p style={{fontSize:16,color:"rgba(255,255,255,0.4)",margin:"0 0 8px",fontFamily:FL}}>Zero commitment. Zero risk. Just results.</p></AnimateIn><AnimateIn delay={0.35}><div style={{display:"flex",flexDirection:"column",gap:12,margin:"32px auto",maxWidth:320,textAlign:"left"}}>{["3 personal training sessions","Full equipment provided","Train anywhere in our radius","Customized workout plan"].map((f,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10}}><span style={{color:"#fff",fontSize:16}}>&#10003;</span><span style={{color:"rgba(255,255,255,0.55)",fontSize:14,fontFamily:FL}}>{f}</span></div>)}</div></AnimateIn><AnimateIn delay={0.45}><BtnPrimary onClick={handleBuy} label="BUY 3-PACK NOW" loading={loading} style={{marginTop:16}}/></AnimateIn><AnimateIn delay={0.5}><p style={{fontSize:12,color:"rgba(255,255,255,0.2)",marginTop:16,fontFamily:FL}}>Secure payment via Paystack</p></AnimateIn></div></section>); };

const ResultsSection = () => { const results = [{name:"Tunde A.",duration:"8 weeks",desc:"Lost 12kg and gained serious confidence."},{name:"Chioma O.",duration:"12 weeks",desc:"Went from zero gym experience to completing a 5K."},{name:"Emeka N.",duration:"6 weeks",desc:"Built lean muscle while managing a crazy work schedule."}]; return (<section style={{padding:"100px 24px",background:"#000",borderTop:"1px solid rgba(255,255,255,0.04)"}}><div style={{maxWidth:900,margin:"0 auto",textAlign:"center"}}><SectionHeading sub="REAL RESULTS" title="Our clients speak for us"/><AnimateIn delay={0.2}><Carousel images={["WORKOUT SESSION 1","TRAINING HIGHLIGHT 2","COMMUNITY SESSION 3","OUTDOOR TRAINING 4"]}/></AnimateIn><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))",gap:24,marginTop:40}}>{results.map((r,i)=><AnimateIn key={i} delay={0.1+i*0.1}><ResultCard {...r}/></AnimateIn>)}</div></div></section>); };
const ResultCard = ({name, duration, desc}) => { const [h, setH] = useState(false); return (<div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{border:"1px solid",borderColor:h?"rgba(255,255,255,0.35)":"rgba(255,255,255,0.06)",overflow:"hidden",transition:"all 0.5s cubic-bezier(0.16,1,0.3,1)",transform:h?"translateY(-6px)":"none"}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",height:200}}><div style={{background:"#111",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"rgba(255,255,255,0.2)",flexDirection:"column",gap:8,fontFamily:FL}}>Before</div><div style={{background:"#0a0a0a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"rgba(255,255,255,0.2)",flexDirection:"column",gap:8,fontFamily:FL}}>After</div></div><div style={{padding:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><span style={{fontWeight:600,color:"#fff",fontSize:15,fontFamily:FL}}>{name}</span><span style={{fontSize:12,color:"rgba(255,255,255,0.4)",fontWeight:500,fontFamily:FL}}>{duration}</span></div><p style={{fontSize:13,color:"rgba(255,255,255,0.35)",lineHeight:1.6,margin:0,fontFamily:FL}}>"{desc}"</p></div></div>); };

const MembershipsPage = () => { const [activeTab, setActiveTab] = useState(0); const tabs = ["One-off sessions","Monthly (trainer + equipment)","Monthly (trainer only)"]; const oneOff = [{name:"1:1 Trainer + Equipment",sub:"At your home (45–60 mins)",price:35000,features:["Personal trainer","Full equipment provided","Customized workout","At your location"]},{name:"1:1 Trainer Only",sub:"At your home (45–60 mins)",price:30000,features:["Personal trainer","Bring your own equipment","Customized workout","At your location"]},{name:"1:1 Trainer Only",sub:"At the gym (45–60 mins)",price:25000,features:["Personal trainer","Use gym equipment","Customized workout","Meet at gym"]},{name:"Virtual Session",sub:"Online (45–60 mins)",price:25000,features:["Live video call","Form correction","Customized workout","Train from anywhere"]}]; const monthlyEquip = [{name:"2x / week",sub:"8 sessions per month",price:200000,features:["Personal trainer","Full equipment provided","Progress tracking","WhatsApp support"],highlight:false},{name:"3x / week",sub:"12 sessions per month",price:300000,features:["Personal trainer","Full equipment provided","Progress tracking","Nutrition guidance","Priority scheduling"],highlight:true},{name:"5x / week",sub:"20 sessions per month",price:500000,features:["Personal trainer","Full equipment provided","Progress tracking","Nutrition guidance","Dedicated trainer","24/7 WhatsApp"],highlight:false}]; const monthlyTrainer = [{name:"2x / week",sub:"8 sessions per month",price:144000,features:["Personal trainer","Customized workouts","Progress tracking","WhatsApp support"],highlight:false},{name:"3x / week",sub:"12 sessions per month",price:216000,features:["Personal trainer","Customized workouts","Progress tracking","Nutrition guidance","Priority scheduling"],highlight:true},{name:"5x / week",sub:"20 sessions per month",price:360000,features:["Personal trainer","Customized workouts","Progress tracking","Nutrition guidance","Dedicated trainer","24/7 WhatsApp"],highlight:false}]; const data = [oneOff, monthlyEquip, monthlyTrainer]; return (<PageWrapper title="Memberships" subtitle="Choose your plan"><div style={{maxWidth:1000,margin:"0 auto"}}><AnimateIn><div style={{display:"flex",gap:0,marginBottom:48,justifyContent:"center",flexWrap:"wrap"}}>{tabs.map((t,i)=>{const active=i===activeTab;return <button key={i} onClick={()=>setActiveTab(i)} style={{padding:"12px 24px",background:active?"#fff":"transparent",color:active?"#000":"rgba(255,255,255,0.4)",border:"1px solid",borderColor:active?"#fff":"rgba(255,255,255,0.1)",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.3s",fontFamily:FL,letterSpacing:1}}>{t.toUpperCase()}</button>})}</div></AnimateIn><div style={{display:"grid",gridTemplateColumns:`repeat(auto-fit, minmax(${activeTab===0?"200px":"250px"}, 1fr))`,gap:24}}>{data[activeTab].map((p,i)=><AnimateIn key={`${activeTab}-${i}`} delay={i*0.1}><PlanCard {...p}/></AnimateIn>)}</div><AnimateIn delay={0.3}><div style={{textAlign:"center",marginTop:48,padding:24,border:"1px solid rgba(255,255,255,0.06)"}}><p style={{color:"rgba(255,255,255,0.5)",fontSize:14,margin:"0 0 4px",fontFamily:FL}}>Consultation fee</p><span style={{fontSize:28,fontWeight:700,color:"#fff",fontFamily:FONT}}>&#8358;{fmtPrice(20000)}</span><p style={{color:"rgba(255,255,255,0.25)",fontSize:12,marginTop:4,fontFamily:FL}}>incl. 7.5% VAT</p></div></AnimateIn></div></PageWrapper>); };

const PlanCard = ({name, sub, price, features, highlight}) => { const [h, setH] = useState(false); const priceWithVat = fmtPrice(price); return (<div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{border:highlight?"2px solid #fff":"1px solid rgba(255,255,255,0.06)",padding:28,transition:"all 0.5s cubic-bezier(0.16,1,0.3,1)",transform:h?"translateY(-8px)":"none",background:h?"rgba(255,255,255,0.03)":"transparent",position:"relative",display:"flex",flexDirection:"column"}}>{highlight&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:"#fff",color:"#000",fontSize:11,fontWeight:600,padding:"4px 16px",letterSpacing:1,fontFamily:FL}}>POPULAR</div>}<h3 style={{fontSize:17,fontWeight:600,color:"#fff",margin:"0 0 4px",fontFamily:FL}}>{name}</h3>{sub&&<p style={{fontSize:12,color:"rgba(255,255,255,0.35)",margin:"0 0 16px",fontFamily:FL}}>{sub}</p>}<div style={{margin:"0 0 4px"}}><span style={{fontSize:30,fontWeight:700,color:"#fff",fontFamily:FONT}}>&#8358;{priceWithVat}</span></div><p style={{fontSize:11,color:"rgba(255,255,255,0.25)",margin:"0 0 20px",fontFamily:FL}}>incl. 7.5% VAT</p><div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24,flex:1}}>{features.map((f,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8}}><span style={{color:"#fff",fontSize:12}}>&#10003;</span><span style={{color:"rgba(255,255,255,0.45)",fontSize:13,fontFamily:FL}}>{f}</span></div>)}</div>{highlight?<BtnPrimary onClick={()=>sendPlanToWhatsApp(name+(sub?" ("+sub+")":""), priceWithVat)} label="Get started" style={{width:"100%",padding:"12px"}}/>:<BtnOutline onClick={()=>sendPlanToWhatsApp(name+(sub?" ("+sub+")":""), priceWithVat)} label="Get started" full/>}</div>); };

const StorePage = ({cart, setCart}) => { const products = [{name:"Off-Szn Performance Tee",price:15000,img:"T"},{name:"Off-Szn Training Shorts",price:18000,img:"S"},{name:"Off-Szn Shaker Bottle",price:8000,img:"B"},{name:"Off-Szn Resistance Band Set",price:12000,img:"R"}]; const addToCart = (product) => { const existing = cart.findIndex(i=>i.name===product.name); if(existing>=0){const u=[...cart];u[existing].qty+=1;setCart(u);}else setCart([...cart,{...product,qty:1}]); }; return (<PageWrapper title="Store" subtitle="Gear up for greatness"><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:24,maxWidth:900,margin:"0 auto"}}>{products.map((p,i)=><AnimateIn key={i} delay={i*0.1}><ProductCard {...p} onAdd={()=>addToCart(p)}/></AnimateIn>)}</div></PageWrapper>); };
const ProductCard = ({name, price, img, onAdd}) => { const [h, setH] = useState(false); const [added, setAdded] = useState(false); const handleAdd = () => { onAdd(); setAdded(true); setTimeout(()=>setAdded(false),1200); }; return (<div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{border:"1px solid",borderColor:h?"rgba(255,255,255,0.35)":"rgba(255,255,255,0.06)",overflow:"hidden",transition:"all 0.5s cubic-bezier(0.16,1,0.3,1)",transform:h?"translateY(-6px)":"none",cursor:"pointer"}}><div style={{height:200,background:"#111",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}><span style={{fontSize:48,color:"rgba(255,255,255,0.06)",fontWeight:800,transition:"transform 0.5s",transform:h?"scale(1.2) rotate(-5deg)":"scale(1)"}}>{img}</span></div><div style={{padding:16}}><p style={{fontSize:14,fontWeight:600,color:"#fff",margin:"0 0 4px",fontFamily:FL}}>{name}</p><p style={{fontSize:14,color:"rgba(255,255,255,0.5)",fontWeight:600,margin:"0 0 2px",fontFamily:FL}}>&#8358;{fmtPrice(price)}</p><p style={{fontSize:11,color:"rgba(255,255,255,0.25)",margin:"0 0 12px",fontFamily:FL}}>incl. VAT</p><BtnOutline onClick={handleAdd} label={added?"Added!":"Add to cart"} full/></div></div>); };

const SignUpPage = ({setCurrentPage}) => { const [form, setForm] = useState({name:"",location:"",goal:"",phone:""}); const [submitted, setSubmitted] = useState(false); const [loading, setLoading] = useState(false); const [errors, setErrors] = useState({}); const validate = () => { const e={}; if(!form.name.trim())e.name="Required"; if(!form.phone.trim())e.phone="Required"; if(!form.location.trim())e.location="Required"; return e; }; const handleSubmit = () => { const e=validate(); if(Object.keys(e).length>0){setErrors(e);return;} setErrors({}); setLoading(true); setTimeout(()=>{sendToWhatsApp(form);setLoading(false);setSubmitted(true);},1000); }; if(submitted) return (<PageWrapper title="" subtitle=""><AnimateIn direction="scale"><div style={{textAlign:"center",maxWidth:500,margin:"0 auto"}}><div style={{width:80,height:80,background:"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",fontSize:36,color:"#fff"}}>&#10003;</div><h2 style={{fontSize:32,fontWeight:700,color:"#fff",margin:"0 0 12px",fontFamily:FONT}}>You're in!</h2><p style={{color:"rgba(255,255,255,0.4)",fontSize:16,margin:"0 0 32px",fontFamily:FL}}>Welcome to Off-Szn, {form.name}. Your details have been sent via WhatsApp.</p><BtnPrimary onClick={()=>setCurrentPage("home")} label="Back to home"/></div></AnimateIn></PageWrapper>); const fields = [{label:"Name",key:"name",placeholder:"Your full name",type:"text"},{label:"Location",key:"location",placeholder:"e.g. Lekki Phase 1",type:"text"},{label:"Fitness goal",key:"goal",placeholder:"e.g. Lose weight, build muscle",type:"text"},{label:"Phone number",key:"phone",placeholder:"+234 800 000 0000",type:"tel"}]; return (<PageWrapper title="Sign up" subtitle="Get started in under 3 minutes"><div style={{maxWidth:440,margin:"0 auto"}}>{fields.map((f,i)=>(<AnimateIn key={f.key} delay={i*0.08}><div style={{marginBottom:20}}><label style={{display:"block",fontSize:12,color:"rgba(255,255,255,0.35)",marginBottom:6,fontWeight:500,letterSpacing:1,fontFamily:FL}}>{f.label}{(f.key!=="goal")&&<span style={{color:"rgba(255,255,255,0.2)"}}> *</span>}</label><input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e=>{setForm({...form,[f.key]:e.target.value});if(errors[f.key])setErrors({...errors,[f.key]:null});}} style={{width:"100%",padding:"14px 16px",background:"rgba(255,255,255,0.03)",border:`1px solid ${errors[f.key]?"rgba(255,100,100,0.5)":"rgba(255,255,255,0.08)"}`,color:"#fff",fontSize:15,outline:"none",boxSizing:"border-box",transition:"border 0.3s",fontFamily:FL}} onFocus={e=>e.target.style.borderColor="rgba(255,255,255,0.4)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.08)"}/>{errors[f.key]&&<p style={{color:"rgba(255,100,100,0.7)",fontSize:12,marginTop:4,fontFamily:FL}}>{errors[f.key]}</p>}</div></AnimateIn>))}<AnimateIn delay={0.35}><BtnPrimary onClick={handleSubmit} label="Complete sign up" loading={loading} style={{width:"100%",marginTop:8}}/></AnimateIn></div></PageWrapper>); };

const ConsultationPage = () => (<PageWrapper title="Book a consultation" subtitle={`Schedule a call — \u20A6${fmtPrice(20000)} incl. VAT`}><AnimateIn><div style={{maxWidth:700,margin:"0 auto",textAlign:"center"}}><div style={{border:"1px solid rgba(255,255,255,0.06)",overflow:"hidden",minHeight:500}}><iframe src={CALENDLY_URL} width="100%" height="500" frameBorder="0" style={{border:"none",background:"#111"}} title="Book consultation"/></div></div></AnimateIn></PageWrapper>);

const MapEmbed = () => (<div style={{marginTop:40,padding:32,border:"1px solid rgba(255,255,255,0.06)",textAlign:"center"}}><h3 style={{color:"rgba(255,255,255,0.3)",fontSize:13,letterSpacing:2,fontWeight:500,margin:"0 0 16px",fontFamily:FL}}>SERVICE RADIUS</h3><div style={{width:"100%",height:300,overflow:"hidden"}} dangerouslySetInnerHTML={{__html:GOOGLE_MAP_EMBED}}/></div>);

const TrainingPage = () => (<PageWrapper title="Training services" subtitle="What we bring to your doorstep"><div style={{maxWidth:700,margin:"0 auto"}}><div style={{display:"flex",flexDirection:"column",gap:24}}>{[{title:"Personal training",desc:"One-on-one sessions with a certified trainer at your location. Fully equipped — dumbbells, kettlebells, bands, mats, everything."},{title:"Group sessions",desc:"Train with friends or colleagues. Up to 4 people per session. Same premium equipment and coaching."},{title:"Corporate fitness",desc:"We bring wellness to your office. Scheduled sessions for your team, on your premises, on your terms."}].map((s,i)=><AnimateIn key={i} delay={i*0.1}><HoverCard title={s.title} desc={s.desc}/></AnimateIn>)}</div><AnimateIn delay={0.3}><MapEmbed/></AnimateIn></div></PageWrapper>);
const VirtualPage = ({setCurrentPage}) => (<PageWrapper title="Virtual services" subtitle="Train from anywhere"><div style={{maxWidth:700,margin:"0 auto"}}><div style={{display:"flex",flexDirection:"column",gap:24}}>{[{title:"Live virtual training",desc:"Real-time sessions via video call. Full coaching, form correction, and accountability."},{title:"Custom programs",desc:"Fully personalised workout program delivered weekly. Video guides, progression tracking, and check-ins."},{title:"Nutrition guidance",desc:"General nutrition guidance tailored to your goals and lifestyle. Ongoing support as you progress."}].map((s,i)=><AnimateIn key={i} delay={i*0.1}><HoverCard title={s.title} desc={s.desc}/></AnimateIn>)}</div><AnimateIn delay={0.3}><div style={{textAlign:"center",marginTop:48}}><BtnPrimary onClick={()=>setCurrentPage("signup")} label="Sign up for virtual"/></div></AnimateIn></div></PageWrapper>);
const HoverCard = ({title, desc}) => { const [h, setH] = useState(false); return <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{border:"1px solid",borderColor:h?"rgba(255,255,255,0.35)":"rgba(255,255,255,0.06)",padding:24,transition:"all 0.4s cubic-bezier(0.16,1,0.3,1)",background:h?"rgba(255,255,255,0.02)":"transparent",transform:h?"translateX(8px)":"translateX(0)"}}><h3 style={{fontSize:17,fontWeight:600,color:"#fff",margin:"0 0 8px",fontFamily:FL}}>{title}</h3><p style={{fontSize:14,color:"rgba(255,255,255,0.4)",lineHeight:1.7,margin:0,fontFamily:FL}}>{desc}</p></div>; };

const ContactPage = () => (<PageWrapper title="Contact us" subtitle="We'd love to hear from you"><div style={{maxWidth:500,margin:"0 auto",textAlign:"center"}}><AnimateIn><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,padding:"18px 32px",background:"#fff",textDecoration:"none",color:"#000",fontWeight:600,fontSize:15,marginBottom:24,fontFamily:FL,letterSpacing:1}}>Chat on WhatsApp</a></AnimateIn>{[{label:"Email",value:"contact@offsznfitness.com",link:"mailto:contact@offsznfitness.com"},{label:"Support",value:"help@offsznfitness.com",link:"mailto:help@offsznfitness.com"},{label:"Instagram",value:"@Off_sznmobile",link:"https://instagram.com/Off_sznmobile"},{label:"Location",value:"Lekki, VI, Ikoyi — Lagos"}].map((c,i)=><AnimateIn key={i} delay={0.1+i*0.08}><div style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{color:"rgba(255,255,255,0.3)",fontSize:14,fontFamily:FL}}>{c.label}</span>{c.link?<a href={c.link} target="_blank" rel="noopener noreferrer" style={{color:"#fff",fontSize:14,fontWeight:500,textDecoration:"none",fontFamily:FL}}>{c.value}</a>:<span style={{color:"#fff",fontSize:14,fontWeight:500,fontFamily:FL}}>{c.value}</span>}</div></AnimateIn>)}</div></PageWrapper>);

const FooterLink = ({label, onClick}) => { const [h, setH] = useState(false); return <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:"none",border:"none",color:h?"rgba(255,255,255,0.6)":"rgba(255,255,255,0.35)",fontSize:12,fontWeight:500,letterSpacing:2,cursor:"pointer",padding:0,transition:"color 0.3s",fontFamily:FL}}>{label}</button>; };
const Footer = ({setCurrentPage}) => (<footer style={{padding:"80px 32px 40px",background:"#000",borderTop:"1px solid rgba(255,255,255,0.04)"}}><div style={{maxWidth:1200,margin:"0 auto"}}><div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:40,marginBottom:48}}><div style={{display:"grid",gridTemplateColumns:"repeat(3, auto)",gap:"20px 64px"}}><FooterLink label="MEMBERSHIP" onClick={()=>setCurrentPage("memberships")}/><FooterLink label="CLASSES" onClick={()=>setCurrentPage("training")}/><FooterLink label="PARTNERSHIPS" onClick={()=>window.open(WHATSAPP_URL,"_blank")}/><FooterLink label="TRAINING" onClick={()=>setCurrentPage("training")}/><FooterLink label="ABOUT" onClick={()=>setCurrentPage("training")}/><FooterLink label="CONTACT US" onClick={()=>setCurrentPage("contact")}/><FooterLink label="STORE" onClick={()=>setCurrentPage("store")}/><FooterLink label="PRESS" onClick={()=>window.open(WHATSAPP_URL,"_blank")}/></div><div style={{display:"flex",flexDirection:"column",gap:20,alignItems:"flex-end"}}><FooterLink label="TIKTOK" onClick={()=>window.open("https://tiktok.com","_blank")}/><FooterLink label="INSTAGRAM" onClick={()=>window.open("https://instagram.com/Off_sznmobile","_blank")}/></div></div><div style={{borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:24,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}><div style={{display:"flex",gap:32}}><span style={{color:"rgba(255,255,255,0.2)",fontSize:11,letterSpacing:2,fontFamily:FL}}>PRIVACY</span><span style={{color:"rgba(255,255,255,0.2)",fontSize:11,letterSpacing:2,fontFamily:FL}}>POLICIES</span><span style={{color:"rgba(255,255,255,0.2)",fontSize:11,letterSpacing:2,fontFamily:FL}}>TERMS</span></div><span style={{color:"rgba(255,255,255,0.2)",fontSize:11,letterSpacing:2,fontFamily:FL}}>&copy;2024 OFF-SZN MOBILE GYM</span></div></div></footer>);

/* ==================== CLIENT PORTAL ==================== */

const LoginPage = ({setCurrentPage, setUser}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async () => {
    setError(""); setLoading(true);
    try {
      if (isRegister) {
        if (!name.trim() || !phone.trim()) { setError("Name and phone are required"); setLoading(false); return; }
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "clients", cred.user.uid), {
          name, email, phone, createdAt: new Date().toISOString(),
          subscription: { plan: "None", status: "inactive", startDate: null, endDate: null },
          progress: { weight: [], measurements: [] },
          program: { current: "No program assigned yet", sessions: [] }
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setCurrentPage("portal");
    } catch (err) {
      const msg = err.code === "auth/email-already-in-use" ? "Email already registered. Please log in." : err.code === "auth/wrong-password" || err.code === "auth/invalid-credential" ? "Incorrect email or password." : err.code === "auth/weak-password" ? "Password must be at least 6 characters." : err.code === "auth/invalid-email" ? "Please enter a valid email." : "Something went wrong. Please try again.";
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <PageWrapper title="Client portal" subtitle={isRegister ? "Create your account" : "Log in to your account"}>
      <div style={{maxWidth:400,margin:"0 auto"}}>
        {error && <div style={{background:"rgba(255,100,100,0.1)",border:"1px solid rgba(255,100,100,0.3)",padding:"12px 16px",marginBottom:20,fontSize:13,color:"rgba(255,100,100,0.8)",fontFamily:FL}}>{error}</div>}
        {isRegister && <>
          <div style={{marginBottom:16}}><label style={{display:"block",fontSize:12,color:"rgba(255,255,255,0.35)",marginBottom:6,fontFamily:FL}}>Full name *</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name" style={{width:"100%",padding:"14px 16px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",color:"#fff",fontSize:15,outline:"none",boxSizing:"border-box",fontFamily:FL}}/></div>
          <div style={{marginBottom:16}}><label style={{display:"block",fontSize:12,color:"rgba(255,255,255,0.35)",marginBottom:6,fontFamily:FL}}>Phone *</label><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+234 800 000 0000" style={{width:"100%",padding:"14px 16px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",color:"#fff",fontSize:15,outline:"none",boxSizing:"border-box",fontFamily:FL}}/></div>
        </>}
        <div style={{marginBottom:16}}><label style={{display:"block",fontSize:12,color:"rgba(255,255,255,0.35)",marginBottom:6,fontFamily:FL}}>Email *</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" style={{width:"100%",padding:"14px 16px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",color:"#fff",fontSize:15,outline:"none",boxSizing:"border-box",fontFamily:FL}}/></div>
        <div style={{marginBottom:24}}><label style={{display:"block",fontSize:12,color:"rgba(255,255,255,0.35)",marginBottom:6,fontFamily:FL}}>Password *</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min 6 characters" style={{width:"100%",padding:"14px 16px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",color:"#fff",fontSize:15,outline:"none",boxSizing:"border-box",fontFamily:FL}}/></div>
        <BtnPrimary onClick={handleAuth} label={isRegister?"Create account":"Log in"} loading={loading} style={{width:"100%"}}/>
        <p style={{textAlign:"center",marginTop:20,fontSize:14,color:"rgba(255,255,255,0.4)",fontFamily:FL}}>{isRegister?"Already have an account?":"Don't have an account?"} <button onClick={()=>{setIsRegister(!isRegister);setError("");}} style={{background:"none",border:"none",color:"#fff",fontWeight:600,cursor:"pointer",fontFamily:FL,textDecoration:"underline"}}>{isRegister?"Log in":"Register"}</button></p>
      </div>
    </PageWrapper>
  );
};

const PortalPage = ({user, setCurrentPage}) => {
  const [tab, setTab] = useState("dashboard");
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const snap = await getDoc(doc(db, "clients", user.uid));
      if (snap.exists()) setClientData(snap.data());
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleLogout = async () => { await signOut(auth); setCurrentPage("home"); };

  if (loading) return <PageWrapper title="" subtitle=""><div style={{textAlign:"center",paddingTop:40}}><Spinner white/></div></PageWrapper>;

  const tabs = ["dashboard","program","progress","subscription"];
  const cd = clientData || {};

  return (
    <PageWrapper title="" subtitle="">
      <div style={{maxWidth:700,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32}}>
          <div><h2 style={{fontSize:28,fontWeight:700,color:"#fff",margin:"0 0 4px",fontFamily:FONT}}>Welcome back{cd.name?`, ${cd.name.split(" ")[0]}`:""}</h2><p style={{color:"rgba(255,255,255,0.35)",fontSize:14,margin:0,fontFamily:FL}}>{user?.email}</p></div>
          <button onClick={handleLogout} style={{background:"none",border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.5)",padding:"8px 20px",fontSize:13,cursor:"pointer",fontFamily:FL,transition:"all 0.3s"}} onMouseEnter={e=>{e.target.style.borderColor="rgba(255,255,255,0.4)";e.target.style.color="#fff";}} onMouseLeave={e=>{e.target.style.borderColor="rgba(255,255,255,0.15)";e.target.style.color="rgba(255,255,255,0.5)";}}>Log out</button>
        </div>

        <div style={{display:"flex",gap:0,marginBottom:32,flexWrap:"wrap"}}>{tabs.map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:"10px 20px",background:tab===t?"#fff":"transparent",color:tab===t?"#000":"rgba(255,255,255,0.4)",border:"1px solid",borderColor:tab===t?"#fff":"rgba(255,255,255,0.08)",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:FL,letterSpacing:1,textTransform:"uppercase"}}>{t}</button>)}</div>

        {tab==="dashboard" && <PortalDashboard cd={cd} setTab={setTab}/>}
        {tab==="program" && <PortalProgram cd={cd}/>}
        {tab==="progress" && <PortalProgress user={user} cd={cd} setClientData={setClientData}/>}
        {tab==="subscription" && <PortalSubscription cd={cd}/>}
      </div>
    </PageWrapper>
  );
};

const PortalDashboard = ({cd, setTab}) => {
  const sub = cd.subscription || {};
  const statBox = (label, value, action) => (
    <div onClick={action} style={{border:"1px solid rgba(255,255,255,0.06)",padding:24,cursor:action?"pointer":"default",transition:"all 0.3s"}} onMouseEnter={e=>{if(action)e.currentTarget.style.borderColor="rgba(255,255,255,0.3)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.06)";}}>
      <p style={{color:"rgba(255,255,255,0.35)",fontSize:12,margin:"0 0 8px",fontFamily:FL,letterSpacing:1}}>{label}</p>
      <p style={{color:"#fff",fontSize:20,fontWeight:600,margin:0,fontFamily:FL}}>{value}</p>
    </div>
  );
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))",gap:16}}>
      {statBox("CURRENT PLAN", sub.plan || "None", ()=>setTab("subscription"))}
      {statBox("STATUS", sub.status === "active" ? "Active" : "Inactive", ()=>setTab("subscription"))}
      {statBox("PROGRAM", cd.program?.current ? "Assigned" : "None", ()=>setTab("program"))}
      {statBox("PROGRESS ENTRIES", `${cd.progress?.weight?.length || 0} logged`, ()=>setTab("progress"))}
    </div>
  );
};

const PortalProgram = ({cd}) => {
  const prog = cd.program || {};
  return (
    <div>
      <div style={{border:"1px solid rgba(255,255,255,0.06)",padding:24,marginBottom:20}}>
        <p style={{color:"rgba(255,255,255,0.35)",fontSize:12,margin:"0 0 8px",fontFamily:FL,letterSpacing:1}}>CURRENT PROGRAM</p>
        <p style={{color:"#fff",fontSize:16,margin:0,fontFamily:FL,lineHeight:1.7}}>{prog.current || "No program assigned yet. Your trainer will set this up after your first session."}</p>
      </div>
      <div style={{border:"1px solid rgba(255,255,255,0.06)",padding:24}}>
        <p style={{color:"rgba(255,255,255,0.35)",fontSize:12,margin:"0 0 16px",fontFamily:FL,letterSpacing:1}}>SESSION HISTORY</p>
        {(prog.sessions && prog.sessions.length > 0) ? prog.sessions.map((s,i) => (
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
            <span style={{color:"#fff",fontSize:14,fontFamily:FL}}>{s.name}</span>
            <span style={{color:"rgba(255,255,255,0.35)",fontSize:13,fontFamily:FL}}>{s.date}</span>
          </div>
        )) : <p style={{color:"rgba(255,255,255,0.3)",fontSize:14,fontFamily:FL}}>No sessions recorded yet.</p>}
      </div>
    </div>
  );
};

const PortalProgress = ({user, cd, setClientData}) => {
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const weights = cd.progress?.weight || [];

  const handleLog = async () => {
    if (!weight) return;
    setSaving(true);
    const newEntry = { value: parseFloat(weight), note, date: new Date().toISOString().split("T")[0] };
    const updated = [...weights, newEntry];
    await updateDoc(doc(db, "clients", user.uid), { "progress.weight": updated });
    setClientData({ ...cd, progress: { ...cd.progress, weight: updated } });
    setWeight(""); setNote(""); setSaving(false);
  };

  return (
    <div>
      <div style={{border:"1px solid rgba(255,255,255,0.06)",padding:24,marginBottom:20}}>
        <p style={{color:"rgba(255,255,255,0.35)",fontSize:12,margin:"0 0 16px",fontFamily:FL,letterSpacing:1}}>LOG PROGRESS</p>
        <div style={{display:"flex",gap:12,marginBottom:12,flexWrap:"wrap"}}>
          <input value={weight} onChange={e=>setWeight(e.target.value)} placeholder="Weight (kg)" type="number" style={{flex:1,minWidth:120,padding:"12px 16px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",color:"#fff",fontSize:14,outline:"none",fontFamily:FL}}/>
          <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Notes (optional)" style={{flex:2,minWidth:180,padding:"12px 16px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",color:"#fff",fontSize:14,outline:"none",fontFamily:FL}}/>
        </div>
        <BtnPrimary onClick={handleLog} label="Log entry" loading={saving} style={{padding:"12px 32px"}}/>
      </div>
      <div style={{border:"1px solid rgba(255,255,255,0.06)",padding:24}}>
        <p style={{color:"rgba(255,255,255,0.35)",fontSize:12,margin:"0 0 16px",fontFamily:FL,letterSpacing:1}}>WEIGHT HISTORY</p>
        {weights.length > 0 ? [...weights].reverse().map((w,i) => (
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
            <div><span style={{color:"#fff",fontSize:16,fontWeight:600,fontFamily:FL}}>{w.value} kg</span>{w.note && <span style={{color:"rgba(255,255,255,0.3)",fontSize:13,marginLeft:12,fontFamily:FL}}>{w.note}</span>}</div>
            <span style={{color:"rgba(255,255,255,0.3)",fontSize:13,fontFamily:FL}}>{w.date}</span>
          </div>
        )) : <p style={{color:"rgba(255,255,255,0.3)",fontSize:14,fontFamily:FL}}>No entries yet. Log your first weigh-in above.</p>}
      </div>
    </div>
  );
};

const PortalSubscription = ({cd}) => {
  const sub = cd.subscription || {};
  const isActive = sub.status === "active";
  const handleRenew = () => {
    const msg = encodeURIComponent(`Hi Off-Szn! I'd like to renew my ${sub.plan} membership. My email is ${cd.email}. Please let me know the next steps.`);
    window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  };
  return (
    <div>
      <div style={{border:"1px solid rgba(255,255,255,0.06)",padding:24,marginBottom:20}}>
        <p style={{color:"rgba(255,255,255,0.35)",fontSize:12,margin:"0 0 16px",fontFamily:FL,letterSpacing:1}}>YOUR SUBSCRIPTION</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          <div><p style={{color:"rgba(255,255,255,0.35)",fontSize:12,margin:"0 0 4px",fontFamily:FL}}>Plan</p><p style={{color:"#fff",fontSize:18,fontWeight:600,margin:0,fontFamily:FL}}>{sub.plan || "None"}</p></div>
          <div><p style={{color:"rgba(255,255,255,0.35)",fontSize:12,margin:"0 0 4px",fontFamily:FL}}>Status</p><p style={{color:isActive?"#4ade80":"rgba(255,255,255,0.5)",fontSize:18,fontWeight:600,margin:0,fontFamily:FL}}>{isActive?"Active":"Inactive"}</p></div>
          {sub.startDate && <div><p style={{color:"rgba(255,255,255,0.35)",fontSize:12,margin:"0 0 4px",fontFamily:FL}}>Started</p><p style={{color:"#fff",fontSize:14,margin:0,fontFamily:FL}}>{sub.startDate}</p></div>}
          {sub.endDate && <div><p style={{color:"rgba(255,255,255,0.35)",fontSize:12,margin:"0 0 4px",fontFamily:FL}}>Expires</p><p style={{color:"#fff",fontSize:14,margin:0,fontFamily:FL}}>{sub.endDate}</p></div>}
        </div>
      </div>
      <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
        {isActive ? <BtnPrimary onClick={handleRenew} label="Renew membership" style={{flex:1}}/> : <BtnPrimary onClick={()=>{const msg=encodeURIComponent("Hi Off-Szn! I'd like to start a membership. What plans are available?");window.location.href=`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;}} label="Get a membership" style={{flex:1}}/>}
        <BtnOutline onClick={()=>{window.location.href=`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I have a question about my Off-Szn subscription.")}`;}} label="Contact support" style={{flex:1}}/>
      </div>
    </div>
  );
};

/* ==================== END CLIENT PORTAL ==================== */

const PageWrapper = ({title, subtitle, children}) => (<div style={{minHeight:"100vh",paddingTop:100,paddingBottom:60,paddingLeft:24,paddingRight:24,background:"#000"}}><div style={{textAlign:"center",marginBottom:48}}>{title&&<AnimateIn><h2 style={{fontSize:"clamp(28px,5vw,40px)",fontWeight:700,color:"#fff",margin:"0 0 8px",fontFamily:FONT}}>{title}</h2></AnimateIn>}{subtitle&&<AnimateIn delay={0.1}><p style={{fontSize:15,color:"rgba(255,255,255,0.3)",margin:0,fontFamily:FL}}>{subtitle}</p></AnimateIn>}</div>{children}</div>);

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [currentPage, setCurrentPage] = useState("home");
  const [user, setUser] = useState(null);

  useEffect(() => { document.title = "Off-Szn Mobile Gym — We Pull Up. You Level Up."; }, []);
  useEffect(() => { window.scrollTo({top:0,behavior:"smooth"}); },[currentPage]);
  useEffect(() => { const unsub = onAuthStateChanged(auth, (u) => setUser(u)); return unsub; }, []);

  const renderPage = () => {
    switch(currentPage) {
      case "memberships": return <MembershipsPage/>;
      case "store": return <StorePage cart={cart} setCart={setCart}/>;
      case "signup": return <SignUpPage setCurrentPage={setCurrentPage}/>;
      case "consultation": return <ConsultationPage/>;
      case "training": return <TrainingPage/>;
      case "virtual": return <VirtualPage setCurrentPage={setCurrentPage}/>;
      case "contact": return <ContactPage/>;
      case "login": return <LoginPage setCurrentPage={setCurrentPage} setUser={setUser}/>;
      case "portal": return user ? <PortalPage user={user} setCurrentPage={setCurrentPage}/> : <LoginPage setCurrentPage={setCurrentPage} setUser={setUser}/>;
      default: return (<><HeroSection/><HowItWorks/><IntroOffer/><ResultsSection/><Footer setCurrentPage={setCurrentPage}/></>);
    }
  };

  return (
    <div style={{background:"#000",minHeight:"100vh",fontFamily:FL,color:"#fff",overflowX:"hidden"}}>
      <div style={{position:"fixed",top:0,left:0,width:"100%",height:64,background:"transparent",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",zIndex:1000}}>
        <button onClick={()=>{setMenuOpen(!menuOpen);setCartOpen(false);}} style={{background:"none",border:"none",cursor:"pointer",padding:8,display:"flex",flexDirection:"column",gap:5}}>
          <span style={{display:"block",width:24,height:2,background:"#fff",transition:"all 0.4s cubic-bezier(0.16,1,0.3,1)",transform:menuOpen?"rotate(45deg) translate(5px,5px)":"none"}}/>
          <span style={{display:"block",width:24,height:2,background:"#fff",transition:"all 0.4s cubic-bezier(0.16,1,0.3,1)",opacity:menuOpen?0:1}}/>
          <span style={{display:"block",width:24,height:2,background:"#fff",transition:"all 0.4s cubic-bezier(0.16,1,0.3,1)",transform:menuOpen?"rotate(-45deg) translate(5px,-5px)":"none"}}/>
        </button>
        <span onClick={()=>{setCurrentPage("home");setMenuOpen(false);setCartOpen(false);}} style={{cursor:"pointer"}}><LogoSmall/></span>
        <CartBtn count={cart.reduce((s,i)=>s+i.qty,0)} onClick={()=>{setCartOpen(!cartOpen);setMenuOpen(false);}}/>
      </div>
      <HamburgerMenu isOpen={menuOpen} setIsOpen={setMenuOpen} setCurrentPage={(p)=>{setCurrentPage(p);setCartOpen(false);}} user={user}/>
      <CartDrawer cart={cart} setCart={setCart} isOpen={cartOpen} setIsOpen={setCartOpen}/>
      {renderPage()}
      <WhatsAppButton/>
    </div>
  );
}