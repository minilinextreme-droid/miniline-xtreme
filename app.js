/* MiniLine Xtreme — experiência integrada e persistente (front-end local)
   Todos os dados de catálogo, conta, carrinho, favoritos, pedidos e anúncios
   ficam persistidos no navegador. Para produção/multiusuário: conectar backend + DB + gateway.
*/
(() => {
  'use strict';
  const K = {
    products:'mlx_products_v3', users:'mlx_users_v3', session:'mlx_session_v3', cart:'mlx_cart_v3',
    favorites:'mlx_favorites_v3', notifications:'mlx_notifications_v3', orders:'mlx_orders_v3',
    searches:'mlx_searches_v3', hot:'mlx_hot_v3', theme:'mlx_theme_v3'
  };
  const seed = [
    {id:'mlx001',name:'Hot Wheels Lamborghini Aventador',category:'Premium',price:59.90,stock:5,type:'ready',seller:'MiniLine Xtreme',rating:5,sales:28,images:[]},
    {id:'mlx002',name:'Hot Wheels Nissan Skyline',category:'Mainline',price:29.90,stock:12,type:'ready',seller:'Mini Garage',rating:4.9,sales:43,images:[]},
    {id:'mlx003',name:'Hot Wheels Fast & Furious',category:'Fast & Furious',price:39.90,stock:8,type:'ready',seller:'Xtreme Cars',rating:4.8,sales:31,images:[]},
    {id:'mlx004',name:'Hot Wheels Raridade Especial',category:'Raridades',price:89.90,stock:2,type:'ready',seller:'Colecionador X',rating:5,sales:17,images:[]},
    {id:'mlx005',name:'Hot Wheels Premium Porsche',category:'Premium',price:79.90,stock:6,type:'ready',seller:'Mini Garage',rating:5,sales:22,images:[]},
    {id:'mlx006',name:'Hot Wheels Barbie',category:'Barbie',price:34.90,stock:10,type:'ready',seller:'Pink Collection',rating:4.9,sales:35,images:[]},
    {id:'mlx007',name:'Hot Wheels 007',category:'007',price:49.90,stock:4,type:'ready',seller:'Collector Store',rating:4.9,sales:19,images:[]},
    {id:'mlx008',name:'Hot Wheels Premium Especial',category:'Premium',price:59.90,stock:20,type:'presale',entry:25,balance:34.90,arrival:'2026-10-15',time:'18:00',seller:'MiniLine Xtreme',rating:5,sales:7,images:[]}
  ];
  const read=(k,d)=>{try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch{return d}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  let products=read(K.products,null); if(!Array.isArray(products)||!products.length){products=seed;write(K.products,products)}
  let users=read(K.users,[]), session=read(K.session,null), cart=read(K.cart,[]), favorites=read(K.favorites,[]), notifications=read(K.notifications,[]), orders=read(K.orders,[]), searches=read(K.searches,[]), hot=read(K.hot,[]), sellerRequests=read('mlx_seller_requests_v3',[]), metrics=read('mlx_metrics_v3',{visits:0,views:{},orders:0}), lots=read('mlx_lots_v3',{}), collection=read('mlx_collection_v1',[]), commission=read('mlx_commission_v3',10), reviews=read('mlx_reviews_v3',[]), coupons=read('mlx_coupons_v3',[{code:'BEMVINDO10',percent:10,active:true}]), messages=read('mlx_messages_v3',{});
  const money=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const currentUser=()=>session?users.find(u=>u.id===session.userId)||null:null;
  const persist=()=>{write('mlx_seller_requests_v3',sellerRequests);write('mlx_metrics_v3',metrics);write('mlx_lots_v3',lots);write('mlx_reviews_v3',reviews);write('mlx_coupons_v3',coupons);write('mlx_collection_v1',collection);write('mlx_messages_v3',messages);write(K.products,products);write(K.users,users);write(K.session,session);write(K.cart,cart);write(K.favorites,favorites);write(K.notifications,notifications);write(K.orders,orders);write(K.searches,searches);write(K.hot,hot);write(K.theme,document.body.classList.contains('dark-mode')?'dark':'light');updateHeader()};
  const toast=t=>{document.querySelectorAll('.mlx-toast').forEach(x=>x.remove());const x=document.createElement('div');x.className='mlx-toast';x.textContent=t;document.body.appendChild(x);setTimeout(()=>x.remove(),2800)};
  const notify=(title,text)=>{notifications.unshift({id:Date.now()+Math.random(),title,text,date:new Date().toLocaleString('pt-BR'),read:false,userId:session?.userId||null});notifications=notifications.slice(0,100);persist()};
  const find=id=>products.find(p=>p.id===id);
  const imageOf=p=>(p?.images?.[0]||p?.image||'');
  const formatDate=v=>{if(!v)return 'A definir';const d=new Date(v+'T12:00:00');return isNaN(d)?v:d.toLocaleDateString('pt-BR')};

  function icon(name, label=''){
    const paths={
      gear:'<circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.09a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.09a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z"/>',
      moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
      logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
      gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M5 12v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
      star:'<path d="M12 3.5 14.7 9l6 .8-4.4 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.3 9.8l6-.8z"/>',
      shield:'<path d="M12 3 4.5 6v5.5c0 4.5 3 7.5 7.5 9 4.5-1.5 7.5-4.5 7.5-9V6L12 3z"/>',
      flame:'<path d="M12 21c3.9 0 6.5-2.6 6.5-6.2 0-3.4-2.6-5.1-3.4-7.8-.9 1.5-1.3 2.5-1.3 3.9-1.7-1.3-2.6-3-2.8-5.4-2.7 1.9-5.5 5-5.5 9.3C5.5 18.4 8.1 21 12 21z"/>',
      gem:'<path d="M7 3h10l4 6-9 12L3 9l4-6z"/><path d="M3 9h18"/><path d="M12 21 8.5 9M12 21l3.5-12"/>',
      rocket:'<path d="M14.5 3.5C17 6 18 9 18 12l-5 5-3.5-1L9 12.5 14.5 3.5z"/><circle cx="15" cy="9" r="1.6"/><path d="M5 15c-1 3 0 5 0 5s3-1 4-2"/><path d="M9 12l-4 3 3 3 3-4"/>',
      robot:'<rect x="5" y="8" width="14" height="11" rx="2.5"/><path d="M12 8V5M9 5h6"/><circle cx="9.5" cy="13" r="1.1" fill="white"/><circle cx="14.5" cy="13" r="1.1" fill="white"/><path d="M9.5 16.5h5"/>',
      home:'<path d="M3 11.2 12 3l9 8.2"/><path d="M5.2 10.5V21h13.6V10.5"/><path d="M9 21v-5.2h6V21"/><path d="M8 8.1h8"/>',
      search:'<circle cx="10.2" cy="10.2" r="6.5"/><path d="m15.2 15.2 5.3 5.3"/><path d="M7.5 10.2h5.4"/><path d="M10.2 7.5v5.4"/>',
      products:'<path d="M4 7.5 12 3l8 4.5-8 4.5z"/><path d="M4 7.5V16l8 5 8-5V7.5"/><path d="M12 12v9"/><path d="M8.3 5.1 16 9.4"/>',
      plus:'<circle cx="12" cy="12" r="8.8"/><path d="M12 7v10M7 12h10"/>',
      sell:'<path d="M3.5 9.2 8 4h10.2l2.3 2.3-9.4 13.4z"/><path d="M8.2 4 20.5 16.3"/><circle cx="14.2" cy="8.2" r="1.2"/><path d="M8 15.5h5.5"/>',
      cart:'<path d="M3 5h2.2l2.1 10.1h10.8L21 8H6"/><path d="M8 9.3h11"/><circle cx="9.2" cy="19.3" r="1.6"/><circle cx="17.5" cy="19.3" r="1.6"/><path d="M12 6.5h4"/>',
      user:'<circle cx="12" cy="8.1" r="3.8"/><path d="M4.5 21c.8-4 3.3-6 7.5-6s6.7 2 7.5 6"/><path d="M8.7 4.8a4.8 4.8 0 0 1 6.6 0"/>',
      bell:'<path d="M18.1 9.3a6.1 6.1 0 0 0-12.2 0c0 6.1-2.2 7.3-2.2 8.8h16.6c0-1.5-2.2-2.7-2.2-8.8z"/><path d="M9.6 21h4.8"/><path d="M9.5 3.8a3 3 0 0 1 5 0"/>',
      message:'<path d="M4 5.2h16v10.7H9.7L4 20.2z"/><path d="M8 9.1h8M8 12.3h5"/><path d="M17.5 5.2v3"/>',
      heart:'<path d="M20.5 8.8c0 5-8.5 10.2-8.5 10.2S3.5 13.8 3.5 8.8A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.5 2.6z"/>',
      car:'<path d="M5 15.5 6.8 9h10.4l1.8 6.5"/><path d="M4 15.5h16v3.2H4z"/><circle cx="7.5" cy="18.8" r="1.5"/><circle cx="16.5" cy="18.8" r="1.5"/><path d="M8.3 9 10 6.2h4L15.7 9"/><path d="M7.2 12.2h9.6"/>',
      garage:'<path d="M3 10.5 12 4l9 6.5"/><path d="M5 10v10h14V10"/><path d="M8 20v-7h8v7"/><path d="M9.5 16h5"/><path d="M9.5 18h5"/>',
      collection:'<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16M8 5v5M16 5v5"/><path d="M8 14h3M13 14h3M8 17h8"/>',
      presale:'<path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/><path d="M17 4v4h-4"/>',
      rarity:'<path d="m12 3 2.2 5.1 5.6.5-4.2 3.7 1.3 5.5-4.9-2.9-4.9 2.9 1.3-5.5-4.2-3.7 5.6-.5z"/><circle cx="12" cy="12" r="2"/>',
      buy:'<path d="M4 7h16l-1.6 11H5.6z"/><path d="M8 7a4 4 0 0 1 8 0"/><circle cx="9" cy="15" r="1"/><circle cx="15" cy="15" r="1"/>',
      collect:'<path d="M4 8h16v11H4z"/><path d="M8 8V6h8v2M7 12h10M7 15h6"/><path d="M17 4v4M15 6h4"/>',
      menu:'<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><path d="M16.75 13.5v6.5M13.5 16.75h6.5"/>',
      close:'<path d="m6 6 12 12M18 6 6 18"/><circle cx="12" cy="12" r="9"/>'
    };
    return `<svg class="mlx-icon mlx-icon-${name}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name]||paths.products}</svg>${label?`<span>${label}</span>`:''}`;
  }
  function injectShell(){
    document.querySelectorAll('header,.categories,body>footer,.mobile-bottom-nav').forEach(el=>el.remove());
    const path=location.pathname.split('/').pop()||'index.html';
    const isAuthPage=path==='login.html'||path==='cadastro.html';
    document.body.classList.toggle('auth-page',isAuthPage);
    if(isAuthPage){ document.documentElement.style.setProperty('--mlx-header-height','0px'); return; }
    const shell=document.createElement('div'); shell.innerHTML=`
      <header class="mlx-header">
        <div class="mlx-header-top">
          <a class="mlx-logo" href="index.html" aria-label="MiniLine Xtreme"><strong>MiniLine</strong><span>Xtreme</span></a>
          <div class="mlx-header-actions">
            <nav class="header-links" aria-label="Atalhos da conta">
              <a href="favoritos.html">Favoritos</a>
              <a href="notificacoes.html">Notificações<span id="notificationCount" class="notification-count"></span></a>
              <a href="carrinho.html">Carrinho<span id="cartCount" class="cart-count">0</span></a>
              <a class="header-account-name" href="conta.html">Entrar</a>
            </nav>
            <div class="header-icons-m">
              <a class="header-icon" href="favoritos.html" title="Favoritos">${icon('heart')}</a>
              <a class="header-icon" href="notificacoes.html" title="Notificações">${icon('bell')}<span id="notificationCount" class="notification-count"></span></a>
            </div>
            <a class="account-chip" href="conta.html"><span class="account-avatar" id="accountAvatar">${(()=>{const u=currentUser();const src=u?.avatar_url||u?.avatar||u?.photoURL||u?.picture||u?.image||'';return src?`<img src="${esc(src)}" alt="" referrerpolicy="no-referrer" onerror="this.style.display='none';this.parentElement.innerHTML=icon('user')">`:icon('user')})()}</span><span class="account-name">${esc(currentUser()?.name?.split(' ')[0]||'Entrar')}</span></a>
          </div>
        </div>
        <div class="mlx-search-wrap">
          <form class="mlx-search" id="searchForm" role="search">
            <span class="search-icon">${icon('search')}</span><input id="searchInput" type="search" placeholder="Buscar miniaturas, marcas, séries..." autocomplete="off" aria-label="Buscar">
            <button type="submit" aria-label="Pesquisar">${icon('search')}</button>
            <div id="searchSuggestions" class="search-suggestions"></div>
          </form>
        </div>
        <nav class="mlx-nav" aria-label="Categorias">
          <a href="index.html" class="${path==='index.html'?'active':''}">Início</a><a href="index.html?cat=Premium">Premium</a><a href="index.html?cat=Silver%20Series">Silver Series</a><a href="index.html?cat=Barbie">Barbie</a><a href="index.html?cat=Lightyear">Lightyear</a><a href="index.html?cat=Transformers">Transformers</a><a href="index.html?cat=Fast%20%26%20Furious">Fast &amp; Furious</a><a href="index.html?cat=Raridades">Raridades</a><a href="pre-vendas.html" class="presale-nav">Pré-vendas</a><a href="vender.html" class="sell-link">Vender</a>
        </nav>
      </header>`;
    document.body.prepend(shell.firstElementChild);
    const syncHeaderHeight=()=>document.documentElement.style.setProperty('--mlx-header-height',(document.querySelector('.mlx-header')?.offsetHeight||0)+'px'); syncHeaderHeight(); window.addEventListener('resize',syncHeaderHeight,{passive:true}); if(window.ResizeObserver){new ResizeObserver(syncHeaderHeight).observe(document.querySelector('.mlx-header'));}
    const active=path==='carrinho.html'||path==='checkout.html'?'cart':path==='vender.html'?'sell':path==='conta.html'||path==='conta-vendedor.html'||path==='login.html'||path==='cadastro.html'||path==='configuracoes.html'?'account':path==='search.html'||path==='produto.html'||path==='pre-vendas.html'||path==='loja.html'?'products':'home';
    const bottom=document.createElement('nav');bottom.className='mobile-bottom-nav';bottom.setAttribute('aria-label','Navegação principal');bottom.innerHTML=`
      <a class="${active==='home'?'active':''}" href="index.html" data-bottom="home">${icon('garage','Início')}</a>
      <a class="${active==='products'?'active':''}" href="search.html" data-bottom="products">${icon('search','Pesquisar')}</a>
      <a class="${active==='cart'?'active':''}" href="carrinho.html" data-bottom="cart">${icon('cart','Carrinho')}<span id="bottomCartCount" class="cart-count"></span></a>
      <a class="${location.pathname.endsWith('lotes.html')?'active':''}" href="lotes.html" data-bottom="lots">${icon('collection','Lotes')}</a>
      <a class="${active==='account'?'active':''}" href="conta.html" data-bottom="account">${icon('menu','Menu')}</a>`;document.body.appendChild(bottom);
    const footer=document.createElement('footer');footer.className='mlx-footer';footer.innerHTML=`
      <div class="footer-brand"><a class="mlx-logo" href="index.html"><strong>MiniLine</strong><span>Xtreme</span></a><p>Marketplace brasileiro de miniaturas e colecionáveis — lotes oficiais por ano e letra, pré-vendas e repasse seguro entre colecionadores.</p><button type="button" class="button ghost" id="installAppBtn" hidden>📲 Instalar aplicativo</button></div>
      <div><b>Comprar</b><a href="index.html">Produtos</a><a href="pre-vendas.html">Pré-vendas</a><a href="lotes.html">Lotes 2024–2026</a><a href="cupons.html">Cupons</a><a href="favoritos.html">Favoritos</a></div>
      <div><b>Sua conta</b><a href="conta.html">Minha conta</a><a href="colecao.html">Minha coleção</a><a href="pedidos.html">Pedidos</a><a href="vender.html">Vender</a><a href="loja.html">Lojas</a></div>
      <div><b>Institucional</b><a href="sobre.html">Sobre nós</a><a href="faq.html">Central de ajuda (FAQ)</a><a href="politica.html">Trocas e reembolso</a><a href="admin.html">Painel Admin</a></div>
      <p class="footer-copy">© 2026 MiniLine Xtreme — feito por colecionadores, para colecionadores. 🇧🇷</p>`;
    document.body.appendChild(footer);
    const ib=document.getElementById('installAppBtn');
    if(ib){if(window.__mlxInstall)ib.hidden=false;ib.onclick=async()=>{if(!window.__mlxInstall)return;window.__mlxInstall.prompt();window.__mlxInstall=null;ib.hidden=true;toast('Instalação iniciada!')}}
  }
  function updateHeader(){const qty=cart.reduce((s,x)=>s+(+x.qty||0),0),unread=notifications.filter(n=>!n.read&&(!n.userId||n.userId===session?.userId)).length;document.querySelectorAll('#cartCount,#bottomCartCount').forEach(x=>x.textContent=qty);document.querySelectorAll('#notificationCount').forEach(x=>{x.textContent=unread||'';x.style.display=unread?'flex':'none'});document.querySelectorAll('.account-name,.header-account-name').forEach(a=>a.textContent=currentUser()?.name?.split(' ')[0]||'Entrar');const av=document.querySelector('#accountAvatar');if(av){const u=currentUser(),src=u?.avatar_url||u?.avatar||u?.photoURL||u?.picture||u?.image||'';av.innerHTML=src?`<img src="${esc(src)}" alt="" referrerpolicy="no-referrer" onerror="this.style.display='none';this.parentElement.innerHTML=icon('user')">`:icon('user')}}
  function setupSearch(){const f=document.querySelector('#searchForm'),i=document.querySelector('#searchInput'),box=document.querySelector('#searchSuggestions');if(!f||!i)return;const isSearchPage=location.pathname.endsWith('search.html');const params=new URLSearchParams(location.search);if(isSearchPage)i.value=params.get('q')||'';const goSearch=()=>{const q=i.value.trim();location.href='search.html'+(q?'?q='+encodeURIComponent(q):'')};if(!isSearchPage){i.addEventListener('click',goSearch);f.addEventListener('submit',e=>{e.preventDefault();goSearch()});return}const show=async()=>{const q=i.value.trim().toLowerCase();if(!q){box.classList.remove('open');box.innerHTML='';return}let hits=products.filter(p=>(p.name+' '+p.category+' '+p.seller).toLowerCase().includes(q)).slice(0,7);try{const r=await fetch('/api/products?q='+encodeURIComponent(q),{cache:'no-store'});if(r.ok){const j=await r.json();if(Array.isArray(j.products)&&j.products.length)hits=j.products.map(p=>({...p,id:p.id,seller:p.profiles?.display_name||p.seller||'Vendedor',images:Array.isArray(p.images)?p.images:[]})).slice(0,7)}}catch{}box.innerHTML=(hits.length?hits.map(p=>`<button type="button" data-id="${p.id}"><span class="suggest-icon">${icon('search')}</span><span><b>${esc(p.name)}</b><small>${esc(p.category)} · ${money(p.price)}</small></span></button>`).join(''):`<div class="suggest-empty">Nenhum resultado rápido. Pressione Enter para ver a pesquisa.</div>`);box.classList.add('open');box.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>location.href='produto.html?id='+encodeURIComponent(b.dataset.id))};i.addEventListener('input',show);f.addEventListener('submit',e=>{e.preventDefault();const q=i.value.trim();if(!q)return;searches=[q,...searches.filter(x=>x.toLowerCase()!==q.toLowerCase())].slice(0,8);persist();location.href='search.html?q='+encodeURIComponent(q)});document.addEventListener('click',e=>{if(!f.contains(e.target))box?.classList.remove('open')})}

  function productCard(p){const fav=favorites.includes(p.id),img=imageOf(p),seller=p.storeName||p.seller||'';return `<article class="product-card"><div class="product-photo-wrap"><a class="product-link" href="produto.html?id=${encodeURIComponent(p.id)}"><div class="product-photo">${p.type==='presale'?'<span class="badge presale">PRÉ-VENDA</span>':''}${p.stock<=2?'<span class="badge stock">ÚLTIMAS</span>':''}${img?`<img src="${esc(img)}" alt="${esc(p.name)}" loading="lazy">`:'<div class="product-placeholder"><span>MLX</span><small>MiniLine Xtreme</small></div>'}</div></a><button class="product-favorite${fav?' is-favorite':''}" data-fav="${p.id}" aria-label="${fav?'Remover favorito':'Adicionar favorito'}" title="${fav?'Remover favorito':'Adicionar favorito'}" aria-pressed="${fav}">${icon('heart')}</button></div><div class="product-info"><a class="product-link" href="produto.html?id=${encodeURIComponent(p.id)}"><div class="product-name">${esc(p.name)}</div><div class="product-meta"><span>${esc(p.category)}</span><span class="rating">${p.rating||5}</span></div><div class="product-seller">${seller?`<a href="loja.html?${p.ownerId?`id=${encodeURIComponent(p.ownerId)}`:`loja=${encodeURIComponent(p.storeSlug||'')}`}" onclick="event.stopPropagation()">${esc(seller)}</a>`:'&nbsp;'}</div><div class="price">${money(p.price)}</div><div class="presale-note${p.type==='presale'?' has-presale':''}">${p.type==='presale'?`<b>Entrada ${money(p.entry||25)}</b> · saldo ${money(p.balance??Math.max(0,p.price-(p.entry||25)))}`:'&nbsp;'}</div></a><div class="product-actions"><button class="button primary" data-add="${p.id}">Adicionar ao carrinho</button></div></div></article>`}
  function bindCards(root=document){root.querySelectorAll('[data-add]').forEach(b=>b.onclick=e=>{e.preventDefault();addCart(b.dataset.add)});root.querySelectorAll('[data-fav]').forEach(b=>b.onclick=e=>{e.preventDefault();toggleFav(b.dataset.fav)})}
  function addCart(id){const p=find(id);if(!p)return;if(p.stock<=0)return toast('Este produto está sem estoque.');const item=cart.find(x=>x.id===id);if(item&&item.qty>=p.stock)return toast('Você já atingiu o estoque disponível.');item?item.qty++:sfx.pop();cart.push({id,qty:1});persist();toast(p.type==='presale'?'Pré-venda adicionada. Você paga R$ 25,00 agora.':'Produto adicionado ao carrinho.')}
  function toggleFav(id){const adding=!favorites.includes(id);try{sfx[adding?'like':'unlike']()}catch{};favorites=adding?[...favorites,id]:favorites.filter(x=>x!==id);persist();document.querySelectorAll(`[data-fav=\"${CSS.escape(id)}\"]`).forEach(b=>{b.classList.toggle('is-favorite',adding);b.setAttribute('aria-pressed',String(adding));b.setAttribute('aria-label',adding?'Remover favorito':'Adicionar favorito');b.setAttribute('title',adding?'Remover favorito':'Adicionar favorito')});toast(adding?'Salvo nos favoritos.':'Removido dos favoritos.');renderFavorites()}
  function categoryFilter(cat){const root=document.querySelector('#productGrid');if(!root)return;const list=cat==='Todos'?products:products.filter(p=>p.category.toLowerCase()===String(cat).toLowerCase());root.innerHTML=list.length?list.map(productCard).join(''):'<div class="empty-state">Nenhum produto encontrado nesta categoria.</div>';bindCards(root)}
  window.filtrarCategoria=categoryFilter;window.mostrarPreVendas=()=>location.href='pre-vendas.html';window.irParaVenda=()=>location.href='vender.html';window.alterarTema=m=>{document.body.classList.toggle('dark-mode',m==='dark');persist();toast(m==='dark'?'Modo escuro ativado.':'Modo claro ativado.')};

  function renderCatalog(){const root=document.querySelector('#productGrid');if(!root)return;const params=new URLSearchParams(location.search),q=(params.get('q')||'').trim().toLowerCase(),cat=params.get('cat'),sort=params.get('sort')||'relevance';let list=[...products];if(location.pathname.endsWith('pre-vendas.html'))list=list.filter(p=>p.type==='presale');if(q)list=list.filter(p=>(p.name+' '+p.category+' '+p.seller).toLowerCase().includes(q));if(cat)list=list.filter(p=>p.category.toLowerCase()===cat.toLowerCase());if(sort==='priceAsc')list.sort((a,b)=>a.price-b.price);if(sort==='priceDesc')list.sort((a,b)=>b.price-a.price);if(sort==='new')list.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));root.innerHTML=list.length?list.map(productCard).join(''):`<div class="empty-state"><strong>Nenhum produto encontrado.</strong><p>Tente outro termo ou limpe os filtros.</p><button class="button primary" onclick="location.href='search.html'">Nova pesquisa</button></div>`;bindCards(root);const title=document.querySelector('#catalogTitle');if(title)title.textContent=q?`Resultados para “${params.get('q')}”`:cat||'Todos os produtos';const count=document.querySelector('#catalogCount');if(count)count.textContent=`${list.length} produto${list.length===1?'':'s'}`;document.querySelector('#sortProducts')?.addEventListener('change',e=>{const u=new URL(location.href);u.searchParams.set('sort',e.target.value);location.href=u.toString()},{once:true});}
  function renderHomeSections(){document.querySelectorAll('#popularProducts').forEach(x=>{x.innerHTML=[...products].sort((a,b)=>(b.sales||0)-(a.sales||0)).slice(0,8).map(productCard).join('');bindCards(x)});document.querySelectorAll('#preSaleProducts').forEach(x=>{x.innerHTML=products.filter(p=>p.type==='presale').map(productCard).join('');bindCards(x)});const ul=document.querySelector('#adminUsersList');if(ul)ul.innerHTML=users.length?users.map(u=>`<div class="admin-product"><div class="admin-thumb">MLX</div><section><b>${esc(u.name)}</b><small>${esc(u.email)} · cadastro ${new Date(u.createdAt||Date.now()).toLocaleDateString('pt-BR')}</small></section></div>`).join(''):'<div class="empty-state">Nenhum usuário cadastrado.</div>';
    const ol=document.querySelector('#adminOrdersList');if(ol)ol.innerHTML=orders.length?orders.map(o=>`<div class="admin-product"><div class="admin-thumb">MLX</div><section><b>${esc(o.id)}</b><small>${o.items?.map(i=>esc(i.product?.name||'Produto')).join(', ')} · ${money(o.totalNow||0)} · ${esc(o.status)}</small></section><button class="button ghost" data-order-status="${o.id}">Avançar status</button></div>`).join(''):'<div class="empty-state">Nenhum pedido.</div>';
    ol?.querySelectorAll('[data-order-status]').forEach(b=>b.onclick=()=>{const o=orders.find(x=>x.id===b.dataset.orderStatus);if(!o)return;const statuses=['Pedido recebido','Pagamento aprovado','Preparando','Enviado','Em trânsito','Entregue'];o.status=statuses[Math.min(statuses.length-1,statuses.indexOf(o.status)+1)];persist();renderAdmin();toast('Status atualizado.')});
    document.querySelectorAll('#hotGallery').forEach(renderHot)}
  function renderProduct(){
    const root=document.querySelector('#produto');if(!root)return;
    const p=find(new URLSearchParams(location.search).get('id'));if(!p){root.innerHTML='<div class="empty-state"><strong>Produto não encontrado.</strong><a class="button primary" href="index.html">Voltar à loja</a></div>';return}
    const imgs=(Array.isArray(p.images)?p.images:[]).filter(Boolean);const gallery=imgs.length?imgs:[''];
    root.innerHTML=`<div class="detail"><div class="detail-gallery"><div class="detail-photo" id="mainProductPhoto">${p.type==='presale'?'<span class="badge presale">PRÉ-VENDA</span>':''}${gallery[0]?`<img src="${gallery[0]}" alt="${esc(p.name)}">`:'<div class="product-placeholder"><span class="placeholder-mark">MLX</span><small>Sem foto cadastrada</small></div>'}</div>${gallery.length>1?`<div class="detail-thumbs" aria-label="Fotos do produto">${gallery.map((x,i)=>`<button type="button" class="detail-thumb ${i===0?'active':''}" data-thumb="${i}"><img src="${x}" alt="Foto ${i+1}"></button>`).join('')}</div>`:''}</div><div class="detail-info"><div class="product-meta"><span>${esc(p.category)}</span><span class="rating">${p.rating||5} / 5</span></div><h1>${esc(p.name)}</h1>${p.flashEnds>Date.now()&&p.flashPrice?`<div class="detail-price" style="color:#e53935">${money(p.flashPrice)} <s style="color:var(--muted);font-size:.55em;font-weight:600">${money(p.price)}</s> <span class="store-badge" style="background:rgba(229,57,53,.12);color:#e53935">⚡ OFERTA</span></div>`:`<div class="detail-price">${money(p.price)}</div>`}<p class="page-subtitle">Vendido por <a href="loja.html?${p.ownerId?`id=${encodeURIComponent(p.ownerId)}`:`loja=${encodeURIComponent(p.storeSlug||'')}`}"><b>${esc(p.storeName||p.seller||'Vendedor')}</b></a> · ${p.stock} em estoque</p>${p.type==='presale'?`<div class="presale-box"><b>PRÉ-VENDA</b><p>Chegada prevista: <strong>${formatDate(p.arrival)}</strong> às <strong>${esc(p.time||'A definir')}</strong>.</p><p><strong>${money(p.entry||25)}</strong> pagos agora · <strong>${money(p.balance??Math.max(0,p.price-(p.entry||25)))}</strong> de saldo quando chegar.</p></div>`:''}<p class="description">${esc(p.description||'Miniatura para colecionadores. Confira as fotos e as informações do anúncio.')}</p><div class="seller-rating card"><b>Avaliação da loja</b><strong>${p.rating||5} / 5</strong><span>${p.seller||'Vendedor'} · vendas verificadas</span></div><div class="detail-actions"><button class="button primary" id="buyNow">Comprar agora</button><button class="button" id="detailAddCart">Adicionar ao carrinho</button><a class="button ghost" href="mensagens.html?vendedor=${encodeURIComponent(p.seller||'Vendedor')}">Falar com vendedor</a></div></div></div>`;
    root.querySelectorAll('[data-thumb]').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.thumb;const main=root.querySelector('#mainProductPhoto');if(gallery[i])main.innerHTML=`${p.type==='presale'?'<span class="badge presale">PRÉ-VENDA</span>':''}<img src="${gallery[i]}" alt="${esc(p.name)}">`;root.querySelectorAll('.detail-thumb').forEach(x=>x.classList.toggle('active',x===b))}));
    root.querySelector('#detailAddCart')?.addEventListener('click',()=>addCart(p.id));
    root.querySelector('#buyNow')?.addEventListener('click',()=>{addCart(p.id);location.href='carrinho.html'});
  }
  const cartTotals=()=>{const base=cart.reduce((a,i)=>{const p=find(i.id);if(!p)return a;const flash=p.flashEnds>Date.now()&&p.flashPrice;const unit=p.type==='presale'?p.entry||25:(flash?p.flashPrice:p.price);a.now+=unit*i.qty;if(p.type==='presale')a.balance+=(p.balance??Math.max(0,p.price-unit))*i.qty;a.total+=(flash?p.flashPrice:p.price)*i.qty;return a},{now:0,balance:0,total:0});
  const cp=coupons.find(x=>x.active&&String(x.code).toUpperCase()===String(read('mlx_coupon_v3','')).toUpperCase());
  base.subtotal=base.now;
  base.discount=cp?+(cp.percent/100*base.now).toFixed(2):0;
  base.afterDiscount=+(base.now-base.discount).toFixed(2);
  base.shipping=(!base.afterDiscount||base.afterDiscount>=149.9)?0:12.9;
  base.now=+(base.afterDiscount+base.shipping).toFixed(2);
  base.coupon=cp?cp.code:null;
  return base};
  function renderCart(){
    const root=document.querySelector('#cartItems'); if(!root)return;
    if(!cart.length){root.innerHTML='<div class="empty-state"><strong>Seu carrinho está vazio.</strong><p>Adicione produtos para começar.</p><a class="button primary" href="index.html">Explorar produtos</a></div>';document.querySelector('#cartSummary').innerHTML='';return}
    let selected=read('mlx_selected_cart_v3',cart.map(i=>i.id)); selected=selected.filter(id=>cart.some(i=>i.id===id)); write('mlx_selected_cart_v3',selected);
    const selectedItems=()=>cart.filter(i=>selected.includes(i.id));
    const totals=()=>selectedItems().reduce((a,i)=>{const p=find(i.id);if(!p)return a;const q=Number(i.qty)||1;const now=(p.type==='presale'?(p.entry||25):p.price)*q;a.now+=now;a.total+=p.price*q;if(p.type==='presale')a.balance+=(p.balance??Math.max(0,p.price-(p.entry||25)))*q;return a},{now:0,total:0,balance:0});
    root.innerHTML=`<div class="cart-select-all"><label><input id="cartSelectAll" type="checkbox" ${selected.length===cart.length?'checked':''}> Selecionar todos</label><span>${selected.length} de ${cart.length} selecionado(s)</span></div>`+cart.map(i=>{const p=find(i.id);if(!p)return '';const img=imageOf(p);return `<div class="cart-item ${selected.includes(p.id)?'selected':''}"><label class="cart-check"><input type="checkbox" data-select-cart="${p.id}" ${selected.includes(p.id)?'checked':''} aria-label="Selecionar ${esc(p.name)}"></label><div class="cart-item-image">${img?`<img src="${img}" alt="">`:'<span class="placeholder-mark">MLX</span>'}</div><div class="cart-item-details"><b>${esc(p.name)}</b><span>${esc(p.category)} · ${p.type==='presale'?'Pré-venda':'Pronta entrega'}</span><strong>${money(p.type==='presale'?p.entry||25:p.price)}</strong>${p.type==='presale'?`<small>Saldo na chegada: ${money(p.balance??p.price-(p.entry||25))}</small>`:''}<div class="cart-item-qty"><button data-minus="${p.id}" aria-label="Diminuir">−</button><b>${i.qty}</b><button data-plus="${p.id}" aria-label="Aumentar">+</button></div></div><button class="button danger" data-remove="${p.id}">Excluir</button></div>`}).join('');
    root.querySelector('#cartSelectAll')?.addEventListener('change',e=>{selected=e.target.checked?cart.map(i=>i.id):[];write('mlx_selected_cart_v3',selected);renderCart()});
    root.querySelectorAll('[data-select-cart]').forEach(b=>b.addEventListener('change',()=>{selected.includes(b.dataset.selectCart)?selected=selected.filter(id=>id!==b.dataset.selectCart):selected.push(b.dataset.selectCart);write('mlx_selected_cart_v3',selected);renderCart()}));
    root.querySelectorAll('[data-minus]').forEach(b=>b.onclick=()=>changeQty(b.dataset.minus,-1));root.querySelectorAll('[data-plus]').forEach(b=>b.onclick=()=>changeQty(b.dataset.plus,1));root.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{cart=cart.filter(x=>x.id!==b.dataset.remove);selected=selected.filter(id=>id!==b.dataset.remove);write('mlx_selected_cart_v3',selected);persist();renderCart()});
    const t=totals();document.querySelector('#cartSummary').innerHTML=`<div class="cart-summary"><h2>Resumo</h2><div class="summary-row"><span>Itens selecionados</span><b>${selected.length}</b></div><div class="summary-row"><span>Total dos produtos</span><b>${money(t.total)}</b></div><div class="summary-row"><span>Pagamento agora</span><b>${money(t.now)}</b></div>${t.balance?`<div class="summary-row"><span>Saldo de pré-venda</span><b>${money(t.balance)}</b></div>`:''}<div class="summary-total"><span>Total agora</span><b>${money(t.now)}</b></div>${selected.length?`<a class="button primary full" href="checkout.html?items=${encodeURIComponent(selected.join(','))}">Continuar para pagamento</a>`:'<button class="button primary full" disabled>Selecione produtos para comprar</button'}</div>`;
  }
  function renderCheckout(){const root=document.querySelector('#checkoutSummary');if(!root)return;const ids=new URLSearchParams(location.search).get('items')?.split(',').filter(Boolean)||read('mlx_selected_cart_v3',cart.map(i=>i.id));const selectedCart=cart.filter(i=>ids.includes(i.id));if(!selectedCart.length){root.innerHTML='<div class="empty-state"><strong>Nenhum produto selecionado.</strong><a class="button primary" href="carrinho.html">Voltar ao carrinho</a></div>';return}const old=cart;cart=selectedCart;const t=cartTotals();root.innerHTML=`<div class="cart-summary"><h2>Resumo do pedido</h2>${selectedCart.map(i=>{const p=find(i.id);return p?`<div class="summary-row"><span>${esc(p.name)} × ${i.qty}</span><b>${money((p.type==='presale'?p.entry||25:p.price)*i.qty)}</b></div>`:''}).join('')}<div class="summary-total"><span>Pagar agora</span><b>${money(t.now)}</b></div>${t.balance?`<p class="checkout-note">Pré-vendas: saldo futuro de ${money(t.balance)} será cobrado somente quando os produtos chegarem.</p>`:''}</div>`;cart=old;document.querySelector('#finishOrder')?.addEventListener('click',finishOrder,{once:true})}
  function finishOrder(){if(!currentUser()){toast('Entre na sua conta antes de finalizar.');setTimeout(()=>location.href='login.html?next=checkout.html',500);return}if(!cart.length)return toast('Carrinho vazio.');const ids=['cep','street','number','city','state'];if(ids.some(id=>!document.querySelector('#'+id)?.value.trim()))return toast('Preencha o endereço completo.');const selectedIds=new URLSearchParams(location.search).get('items')?.split(',').filter(Boolean)||read('mlx_selected_cart_v3',cart.map(i=>i.id));const checkoutCart=cart.filter(i=>selectedIds.includes(i.id));if(!checkoutCart.length)return toast('Selecione pelo menos um produto.');const oldCart=cart;cart=checkoutCart;const t=cartTotals();const order={id:'MLX-'+Math.random().toString(36).slice(2,8).toUpperCase(),date:new Date().toISOString(),status:'Pedido recebido',userId:session.userId,items:cart.map(i=>({...i,product:find(i.id)})),totalNow:t.now,total:t.total,shipping:t.shipping,discount:t.discount,coupon:t.coupon,payouts:buildPayouts(checkoutCart),balance:t.balance,address:Object.fromEntries(ids.map(id=>[id,document.querySelector('#'+id).value.trim()])),payment:document.querySelector('#payment')?.value||'Pix'};sfx.success();orders.unshift(order);order.items.forEach(i=>{const p=find(i.id);if(p){p.stock=Math.max(0,p.stock-i.qty);p.sales=(p.sales||0)+i.qty}});cart=oldCart.filter(i=>!checkoutCart.some(c=>c.id===i.id));write('mlx_selected_cart_v3',cart.map(i=>i.id));write('mlx_coupon_v3',null);persist();notify('Pedido realizado',`Pedido ${order.id} foi recebido com sucesso.`);toast('Pedido criado com sucesso!');const sl=read('mlx_stripe_link_v3','');if((order.payment||'').includes('Stripe')&&sl){setTimeout(()=>{location.href=sl},600)}else{setTimeout(()=>location.href='pedidos.html',500)}}

  function renderFavorites(){const root=document.querySelector('#favorites');if(!root)return;const list=products.filter(p=>favorites.includes(p.id));root.innerHTML=list.length?`<div class="product-grid">${list.map(productCard).join('')}</div>`:'<div class="empty-state"><strong>Nenhum favorito ainda.</strong><p>Use o ícone de favorito em um produto para salvar.</p><a class="button primary" href="index.html">Explorar</a></div>';bindCards(root)}
  function renderNotifications(){const root=document.querySelector('#notifications');if(!root)return;const list=notifications.filter(n=>!n.userId||n.userId===session?.userId);root.innerHTML=list.length?list.map(n=>`<div class="notification-item ${n.read?'':'unread'}"><span class="dot"></span><div><b>${esc(n.title)}</b><p>${esc(n.text)}</p><small>${esc(n.date)}</small></div></div>`).join(''):'<div class="empty-state"><strong>Nenhuma notificação.</strong><p>Atualizações de pedidos e novidades aparecerão aqui.</p></div>';notifications=notifications.map(n=>({...n,read:true}));persist()}
  function renderOrders(){const root=document.querySelector('#orders');if(!root)return;const list=orders.filter(o=>o.userId===session?.userId);root.innerHTML=list.length?list.map(o=>`<article class="order-card" data-oid="${o.id}"><div><b>${esc(o.id)}</b><p>${new Date(o.date).toLocaleString('pt-BR')} · ${esc(o.status)}</p><p>${o.items.map(i=>esc(i.product?.name||'Produto')).join(', ')}</p></div><strong>${money(o.totalNow)}</strong></article>`).join(''):'<div class="empty-state"><strong>Nenhum pedido.</strong><p>Quando você comprar, seus pedidos ficarão aqui.</p></div>'}
  function renderAccount(){const root=document.querySelector('#accountApp');if(!root)return;const u=currentUser();const isAdmin=(u?.email||'').toLowerCase()==='minilinextreme@gmail.com';const cartQty=cart.reduce((a,x)=>a+(+x.qty||0),0);const unread=notifications.filter(n=>!n.read&&(!n.userId||n.userId===session?.userId)).length;const myOrders=orders.filter(o=>o.userId===session?.userId).length;const myAds=products.filter(p=>p.ownerId===session?.userId).length;const initials=(u?.name||'').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
  const quick=(g,ic,label,href,n)=>`<a class="mq" href="${href}"><span class="mq-ic" style="background:${g}">${icon(ic)}${n>0?`<span class="mq-badge">${n}</span>`:''}</span><b>${label}</b></a>`;
  const row=(g,ic,label,href,note)=>`<a class="menu-item" href="${href}"><span class="menu-ic" style="background:${g}">${icon(ic)}</span><b>${label}</b>${note?`<small>${note}</small>`:''}<span class="menu-arrow">›</span></a>`;
  root.innerHTML=`
  <div class="menu-hero">
    <div class="menu-avatar">${u?esc(initials||'ML'):icon('user')}</div>
    <div class="menu-hero-info">
      <span class="menu-hero-tag">MINILINE XTREME</span>
      <h1>${esc(u?.name||'Olá, visitante')}</h1>
      <p>${esc(u?.email||'Entre ou crie sua conta para salvar pedidos, favoritos e anúncios.')}</p>
    </div>
    ${u?`<button class="button danger" id="logoutBtn">Sair</button>`:''}
  </div>
  ${u?'':`<div class="menu-auth">
    <button type="button" class="button google-login" id="menuGoogleBtn">Continuar com Google</button>
    <a class="button primary" href="login.html">Entrar com e-mail</a>
    <a class="menu-auth-alt" href="cadastro.html">Criar conta</a>
  </div>`}
  <h2 class="menu-sec">Atalhos</h2>
  <div class="menu-quick">
    ${quick('linear-gradient(135deg,#ffb02e,#f0670a)','products','Pedidos','pedidos.html',myOrders)}
    ${quick('linear-gradient(135deg,#5be585,#0fa968)','cart','Carrinho','carrinho.html',cartQty)}
    ${quick('linear-gradient(135deg,#ff8fb1,#e5497a)','heart','Favoritos','favoritos.html',favorites.length)}
    ${quick('linear-gradient(135deg,#7ab8ff,#3f7fe0)','bell','Alertas','notificacoes.html',unread)}
    ${quick('linear-gradient(135deg,#a78bfa,#7c3aed)','message','Mensagens','mensagens.html',0)}
    ${quick('linear-gradient(135deg,#ff8fb1,#e5497a)','gift','Cupons','cupons.html',coupons.filter(c=>c.active).length)}
    ${quick('linear-gradient(135deg,#5be585,#0fa968)','collection','Lotes','lotes.html',0)}
    ${quick('linear-gradient(135deg,#b8c0cc,#8d97a6)','gear','Ajustes','configuracoes.html',0)}
  </div>
  <h2 class="menu-sec">Vender</h2>
  <div class="menu-grid">
    ${row('linear-gradient(135deg,#f7c948,#e8a615)','sell','Publicar anúncio','vender.html','Anuncie em 2 minutos')}
    ${row('linear-gradient(135deg,#b8c0cc,#8d97a6)','garage','Painel da loja','conta-vendedor.html','Métricas e personalização')}
    ${myAds?row('linear-gradient(135deg,#ff8a5c,#d63b1f)','star','Meus anúncios','vender.html',myAds+' ativos'):''}
  </div>
  <h2 class="menu-sec">Ajuda</h2>
  <div class="menu-grid">
    ${row('linear-gradient(135deg,#7ab8ff,#3f7fe0)','user','Sobre nós','sobre.html','Quem somos e como funciona')}
    ${row('linear-gradient(135deg,#ff8fb1,#e5497a)','chat','Central de ajuda (FAQ)','faq.html','Dúvidas frequentes')}
    ${row('linear-gradient(135deg,#b8c0cc,#8d97a6)','star','Trocas e reembolso','politica.html','Entrega, devolução e pagamentos')}
  </div>
  <h2 class="menu-sec">Aplicativo</h2>
  <div class="menu-grid">
    ${row('linear-gradient(135deg,#7ab8ff,#3f7fe0)','rocket','Pré-vendas','pre-vendas.html','Lançamentos futuros')}
    ${row('linear-gradient(135deg,#5be585,#0fa968)','collection','Minha coleção','colecao.html','Sua lista pessoal de minis')}
    <button type="button" class="menu-item" id="menuThemeBtn"><span class="menu-ic" style="background:linear-gradient(135deg,#1f2430,#3a4152)">${icon('moon')}</span><b>Modo escuro</b><span class="menu-switch${document.body.classList.contains('dark-mode')?' on':''}"><i></i></span></button>
    ${isAdmin?row('linear-gradient(135deg,#d63b1f,#a01000)','shield','Painel admin','admin.html','Gestão completa'):''}
  </div>`;
  root.querySelector('#logoutBtn')?.addEventListener('click',()=>{session=null;persist();toast('Você saiu da conta.');setTimeout(()=>location.href='index.html',400)});
  root.querySelector('#menuThemeBtn')?.addEventListener('click',()=>{const dark=!document.body.classList.contains('dark-mode');document.body.classList.toggle('dark-mode',dark);write(K.theme,dark?'dark':'light');const sw=root.querySelector('.menu-switch');if(sw)sw.classList.toggle('on',dark);toast(dark?'Modo escuro ativado.':'Modo claro ativado.')});
  root.querySelector('#menuGoogleBtn')?.addEventListener('click', async () => {
    if (typeof sb !== 'undefined' && sb?.auth) {
      const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + '/conta.html' } });
      if (error) toast(error.message);
    } else {
      toast('Para o login com Google, ative o Supabase (veja REAL-SETUP.md).');
      setTimeout(() => location.href = 'login.html', 900);
    }
  });
  }
  function setupAuth(){const l=document.querySelector('#loginForm');if(l)l.addEventListener('submit',e=>{e.preventDefault();const email=l.email.value.trim().toLowerCase(),password=l.password.value;if(password.length<6)return toast('A senha precisa ter pelo menos 6 caracteres.');const u=users.find(x=>x.email===email);if(!u)return toast('Conta não encontrada. Crie uma conta primeiro.');if(u.password!==btoa(unescape(encodeURIComponent(password))))return toast('E-mail ou senha incorretos.');session={userId:u.id};persist();notify('Login realizado','Sua conta foi conectada neste dispositivo.');const next=new URLSearchParams(location.search).get('next');location.href=next||'conta.html'});const r=document.querySelector('#registerForm');if(r)r.addEventListener('submit',e=>{e.preventDefault();const name=r.name.value.trim(),email=r.email.value.trim().toLowerCase(),password=r.password.value;if(name.length<2)return toast('Informe seu nome.');if(password.length<6)return toast('A senha precisa ter pelo menos 6 caracteres.');if(users.some(x=>x.email===email))return toast('Este e-mail já está cadastrado.');const u={id:'u-'+Date.now(),name,email,password:btoa(unescape(encodeURIComponent(password))),createdAt:Date.now()};users.push(u);session={userId:u.id};persist();notify('Conta criada','Bem-vindo ao MiniLine Xtreme!');location.href='conta.html'})}

  function compressImage(file){return new Promise((resolve,reject)=>{if(!file.type.startsWith('image/'))return reject(new Error('Arquivo não é imagem'));const reader=new FileReader();reader.onerror=()=>reject(reader.error);reader.onload=()=>{const im=new Image();im.onload=()=>{const max=1400,scale=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*scale);c.height=Math.round(im.height*scale);const ctx=c.getContext('2d');ctx.drawImage(im,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',.78))};im.onerror=()=>reject(new Error('Imagem inválida'));im.src=reader.result};reader.readAsDataURL(file)})}
  function setupSeller(){const f=document.querySelector('#sellForm');if(!f)return;
  const stBox=document.querySelector('#sellStats');
  if(stBox){const myP=products.filter(p=>p.ownerId===session?.userId);const views=myP.reduce((a,p)=>a+(+p.views||0),0),sales=myP.reduce((a,p)=>a+(+p.sales||0),0),rev=myP.reduce((a,p)=>a+(+p.sales||0)*(+p.price||0),0);
    const stat=(g,ic,label,val)=>`<div class="sell-stat"><span class="sell-stat-ic" style="background:${g}">${icon(ic)}</span><div><small>${label}</small><b>${val}</b></div></div>`;
    stBox.innerHTML='<div class="sell-stats">'+stat('linear-gradient(135deg,#ffb02e,#f0670a)','products','Anúncios ativos',myP.filter(p=>p.type!=='presale').length)+stat('linear-gradient(135deg,#7ab8ff,#3f7fe0)','search','Visualizações',views)+stat('linear-gradient(135deg,#5be585,#0fa968)','cart','Vendas',sales)+stat('linear-gradient(135deg,#f7c948,#e8a615)','heart','Receita',money(rev))+'</div>';}
  const tipsBox=document.querySelector('#sellTips');
  if(tipsBox){tipsBox.innerHTML='<h2 class="menu-sec" style="margin:0 0 10px">Dicas para vender mais</h2><div class="tips-grid">'+
    '<div class="tip"><b>📸 Capa nítida</b><span>Foto centralizada e fundo limpo chamam mais atenção.</span></div>'+
    '<div class="tip"><b>🏷️ Preço competitivo</b><span>Compare com anúncios parecidos antes de publicar.</span></div>'+
    '<div class="tip"><b>⭐ Avaliações</b><span>Entregas rápidas viram 5 estrelas e vendas novas.</span></div>'+
    '<div class="tip"><b>💬 Responda rápido</b><span>Compradores perguntam antes de comprar.</span></div></div>';}const galleryInput=document.querySelector('#photosGallery'),cameraInput=document.querySelector('#photosCamera'),pre=document.querySelector('#photoPreviews'),drop=document.querySelector('#photoDrop');let photos=[];const paint=()=>{pre.innerHTML=photos.map((x,i)=>`<div class="photo-preview"><img src="${x}" alt="Foto ${i+1}"><button type="button" data-photo="${i}" aria-label="Remover foto">×</button></div>`).join('')};const add=async list=>{for(const file of Array.from(list||[]).slice(0,8-photos.length)){try{photos.push(await compressImage(file))}catch{toast('Não foi possível ler uma das imagens.')}}paint()};document.querySelector('#chooseGallery')?.addEventListener('click',()=>galleryInput?.click());document.querySelector('#takePhoto')?.addEventListener('click',()=>cameraInput?.click());galleryInput?.addEventListener('change',e=>add(e.target.files));cameraInput?.addEventListener('change',e=>add(e.target.files));drop?.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('drag')});drop?.addEventListener('dragleave',()=>drop.classList.remove('drag'));drop?.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('drag');add(e.dataTransfer.files)});pre?.addEventListener('click',e=>{const b=e.target.closest('[data-photo]');if(b){photos.splice(+b.dataset.photo,1);paint()}});f.querySelector('[name=type]')?.addEventListener('change',e=>{document.querySelector('#presaleFields').hidden=e.target.value!=='presale'});f.addEventListener('submit',async e=>{e.preventDefault();if(!photos.length)return toast('Adicione pelo menos uma foto pela câmera ou galeria.');const d=new FormData(f),price=+d.get('price'),type=d.get('type'),p={id:'ml-'+Date.now(),ownerId:session?.userId||null,name:d.get('name').trim(),category:d.get('category'),description:d.get('description').trim(),price,stock:+d.get('stock'),condition:d.get('condition'),shipping:d.get('shipping'),type,seller:myStoreName(),storeSlug:myStoreSlug(),ownerId:session?.userId||null,rating:5,sales:0,images:photos,createdAt:Date.now()};if(!p.name||price<=0||p.stock<1)return toast('Preencha nome, preço e estoque corretamente.');if(type==='presale'){p.entry=25;p.balance=Math.max(0,price-25);p.arrival=d.get('arrival');p.time=d.get('time');if(!p.arrival)return toast('Informe a data de chegada da pré-venda.')}products.unshift(p);persist();sfx.success();notify('Anúncio publicado',`“${p.name}” está disponível na loja.`);toast('Anúncio publicado na loja!');setTimeout(()=>location.href='produto.html?id='+encodeURIComponent(p.id),500)})}

function setupAdmin(){
    const f=document.querySelector('#adminProductForm');
    if(f){
      const gallery=document.querySelector('#adminPhotosGallery'),camera=document.querySelector('#adminPhotosCamera'),pre=document.querySelector('#adminProductPreviews'),drop=f.querySelector('.photo-drop');
      let photos=[];
      const paint=()=>pre.innerHTML=photos.map((x,i)=>`<div class="photo-preview"><img src="${x}" alt="Foto ${i+1}"><button type="button" data-admin-photo="${i}">×</button></div>`).join('');
      const add=async list=>{for(const file of Array.from(list||[]).slice(0,8-photos.length)){try{photos.push(await compressImage(file))}catch{toast('Não foi possível ler uma das imagens.')}}paint()};
      document.querySelector('#adminChooseGallery')?.addEventListener('click',()=>gallery?.click());
      document.querySelector('#adminTakePhoto')?.addEventListener('click',()=>camera?.click());
      gallery?.addEventListener('change',e=>add(e.target.files));camera?.addEventListener('change',e=>add(e.target.files));
      drop?.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('drag')});drop?.addEventListener('dragleave',()=>drop.classList.remove('drag'));drop?.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('drag');add(e.dataTransfer.files)});
      pre?.addEventListener('click',e=>{const b=e.target.closest('[data-admin-photo]');if(b){photos.splice(+b.dataset.adminPhoto,1);paint()}});
      f.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(f),price=+d.get('price'),type=d.get('type');if(!d.get('name')?.trim()||price<=0||+d.get('stock')<0)return toast('Preencha os dados obrigatórios.');const p={id:'ml-'+Date.now(),ownerId:null,name:d.get('name').trim(),category:d.get('category').trim(),description:d.get('description')||'',price,stock:+d.get('stock'),type,seller:'MiniLine Xtreme',rating:5,sales:0,images:photos,createdAt:Date.now()};if(type==='presale'){p.entry=25;p.balance=Math.max(0,price-25);p.arrival=d.get('arrival');p.time=d.get('time');if(!p.arrival)return toast('Informe a data de chegada da pré-venda.')}products.unshift(p);persist();sfx.success();notify('Produto publicado',`“${p.name}” foi publicado no catálogo.`);toast('Produto publicado na loja!');f.reset();photos=[];paint();renderAdmin()});
    }
    const hf=document.querySelector('#hotForm');
    if(hf){const input=hf.querySelector('#hotPhotos'),gallery=hf.querySelector('#adminHotGallery'),drop=hf.querySelector('.photo-drop');let pics=[];const paint=()=>gallery.innerHTML=pics.map((x,i)=>`<div class="photo-preview"><img src="${x}" alt="Lote Hot"><button type="button" data-hot-preview="${i}">×</button></div>`).join('');drop?.addEventListener('click',()=>input?.click());input?.addEventListener('change',async e=>{for(const file of Array.from(e.target.files)){try{pics.push(await compressImage(file))}catch{toast('Imagem inválida.')}}paint()});hf.addEventListener('submit',e=>{e.preventDefault();if(!pics.length)return toast('Selecione fotos do Lote Hot.');hot=[...pics.map((image,i)=>({id:'hot-'+Date.now()+i,image,date:new Date().toLocaleDateString('pt-BR')})),...hot];persist();notify('Novo Lote Hot','A galeria foi atualizada.');toast('Lote Hot publicado.');pics=[];paint();renderHot(document.querySelector('#hotGallery'))});gallery?.addEventListener('click',e=>{const b=e.target.closest('[data-hot-preview]');if(b){pics.splice(+b.dataset.hotPreview,1);paint()}})}
  }
  
  function renderAdmin(){const list=document.querySelector('#adminProductsList');if(!list)return;const sales=orders.reduce((s,o)=>s+(o.totalNow||0),0);const set=(id,v)=>{const e=document.querySelector('#'+id);if(e)e.textContent=v};set('adminProducts',products.length);set('adminOrders',orders.length);set('adminUsers',users.length);set('adminSales',money(sales));list.innerHTML=products.map(p=>`<div class="admin-product"><div class="admin-thumb">${imageOf(p)?`<img src="${imageOf(p)}">`:'MLX'}</div><section><b>${esc(p.name)}</b><small>${esc(p.category)} · ${money(p.price)} · estoque ${p.stock} · ${p.type==='presale'?'PRÉ-VENDA':'PRONTA ENTREGA'}</small></section><a class="button ghost" href="produto.html?id=${p.id}">Ver</a><button class="button ghost" data-edit-product="${p.id}">Editar</button><button class="button danger" data-delete-product="${p.id}">Excluir</button></div>`).join('')||'<div class="empty-state">Nenhum produto.</div>';list.querySelectorAll('[data-delete-product]').forEach(b=>b.onclick=()=>{if(confirm('Excluir este anúncio da loja?')){products=products.filter(p=>p.id!==b.dataset.deleteProduct);cart=cart.filter(i=>find(i.id));favorites=favorites.filter(id=>find(id));persist();renderAdmin();toast('Anúncio excluído.')}});list.querySelectorAll('[data-edit-product]').forEach(b=>b.onclick=()=>editProduct(b.dataset.editProduct));document.querySelectorAll('#hotGallery').forEach(renderHot)}
  function editProduct(id){const p=find(id);if(!p)return;const name=prompt('Nome do produto:',p.name);if(name===null)return;const price=prompt('Preço:',p.price);const stock=prompt('Estoque:',p.stock);if(!name.trim()||isNaN(+price)||isNaN(+stock))return toast('Dados inválidos.');p.name=name.trim();p.price=+price;p.stock=Math.max(0,+stock);persist();renderAdmin();renderCatalog();toast('Produto atualizado.')}
  async function renderSeller(){const root=document.querySelector('#sellerStore');if(!root)return;const qs=new URLSearchParams(location.search),id=qs.get('id'),slug=qs.get('loja');let store=null,list=[];try{const r=await fetch('/api/sellers?id='+encodeURIComponent(id||''),{cache:'no-store'});if(r.ok){const j=await r.json();store=j.store;list=j.products||[]}}catch{}if(!store&&slug){store=products.find(p=>p.storeSlug===slug)?.seller?{store_name:products.find(p=>p.storeSlug===slug).seller}:null}if(!store){const u=users.find(x=>(id&&x.id===id)||(slug&&x.storeSlug===slug));if(u&&(u.storeName||u.role==='admin')){store={id:u.id,store_name:u.storeName||u.name,store_bio:u.storeBio||'',store_logo:u.storeLogo||'',store_banner:u.storeBanner||'',rating:5,sales_count:0};list=products.filter(p=>p.ownerId===u.id)}}if(!store){root.innerHTML='<div class="empty-state"><strong>Loja não encontrada.</strong><p>O vendedor pode ainda não ter uma loja ativa.</p><a class="button primary" href="index.html">Voltar aos produtos</a></div>';return}const name=store.store_name||store.display_name||'Loja';root.innerHTML=`<section class="store-hero"><div class="store-banner" style="${store.store_banner?`background-image:url('${esc(store.store_banner)}')`:''}"></div><div class="store-main">${store.store_logo?`<img class="store-logo" src="${esc(store.store_logo)}" alt="Logo da ${esc(name)}">`:`<div class="store-logo store-logo-fallback">${esc(name.slice(0,1).toUpperCase())}</div>`}<div class="store-title"><span class="store-badge">${icon('user')} Vendedor autorizado</span><h1>${esc(name)}</h1><p>${esc(store.store_bio||'Loja de miniaturas e colecionáveis.')}</p><p>${Number(store.sales_count||0)} vendas · avaliação ${Number(store.rating||5).toFixed(1)} / 5</p></div><div class="store-actions"><a class="button ghost" href="mensagens.html?vendedor=${encodeURIComponent(store.id)}">Falar com a loja</a></div></div></section>`;const count=document.querySelector('#storeProductCount');if(count)count.textContent=`${list.length} produto(s)`;const grid=document.querySelector('#sellerProducts');if(grid){const mapped=list.map(p=>({...p,id:p.id,ownerId:p.owner_id,seller:name,images:Array.isArray(p.images)?p.images:[],type:p.type,entry:p.entry_price,balance:p.balance_price,arrival:p.arrival,time:p.arrival_time,rating:store.rating||5,sales:store.sales_count||0}));grid.innerHTML=mapped.length?mapped.map(productCard).join(''):'<div class="empty-state">Esta loja ainda não publicou produtos.</div>';bindCards(grid)}}
  function renderHot(root){if(!root)return;const isAdmin=!!document.querySelector('#hotForm');root.innerHTML=hot.length?hot.map(x=>`<figure class="hot-photo"><img src="${x.image}" alt="Lote Hot"><figcaption>Lote Hot · ${esc(x.date)}${isAdmin?` <button class="text-button" data-delete-hot="${x.id}">Excluir</button>`:''}</figcaption></figure>`).join(''):'<div class="empty-state"><strong>Lote Hot</strong><p>A galeria aparecerá quando o administrador publicar fotos.</p></div>';root.querySelectorAll('[data-delete-hot]').forEach(b=>b.onclick=()=>{if(confirm('Excluir esta foto do Lote Hot?')){hot=hot.filter(x=>x.id!==b.dataset.deleteHot);persist();renderHot(root);toast('Foto removida.')}})}
  function renderSearchPage(){const root=document.querySelector('#searchPage');if(!root)return;const q=(new URLSearchParams(location.search).get('q')||'').trim();const input=document.querySelector('#searchPageInput');if(input)input.value=q;const results=q?products.filter(p=>(p.name+' '+p.category+' '+p.seller).toLowerCase().includes(q.toLowerCase())):[];const recent=searches.length?`<div class="recent-searches"><div class="section-head"><h2>Pesquisas recentes</h2><button class="text-button" id="clearSearches">Limpar</button></div><div class="recent-list">${searches.map(s=>`<a href="search.html?q=${encodeURIComponent(s)}">${icon('search')}<span>${esc(s)}</span></a>`).join('')}</div></div>`:'<div class="empty-state compact"><p>Suas pesquisas recentes aparecerão aqui.</p></div>';root.innerHTML=`${!q?recent:`<div class="search-result-head"><div><span class="eyebrow">PESQUISA</span><h1>Resultados para “${esc(q)}”</h1><p>${results.length} resultado(s)</p></div><a href="search.html" class="button ghost">Nova pesquisa</a></div><div class="product-grid">${results.length?results.map(productCard).join(''):'<div class="empty-state"><strong>Nada encontrado.</strong><p>Tente nome, categoria ou marca diferente.</p></div>'}</div>`}`;bindCards(root);document.querySelector('#clearSearches')?.addEventListener('click',()=>{searches=[];persist();renderSearchPage()})}

  function init(){injectShell(); window.addEventListener('mlx:remote-ready',()=>{try{if(!sessionStorage.getItem('mlx_remote_reloaded')){sessionStorage.setItem('mlx_remote_reloaded','1');location.reload();}}catch{}});const theme=read(K.theme,'light');if(theme==='dark')document.body.classList.add('dark-mode');setupSearch();updateHeader();renderCatalog();renderHomeSections();renderProduct();renderCart();renderCheckout();renderFavorites();renderNotifications();renderOrders();renderAccount();setupAuth();setupSeller();setupAdmin();enhanceXtreme();renderSeller();renderSearchPage();renderCoupons();renderCollection();document.querySelectorAll('#hotGallery').forEach(renderHot);if(document.querySelector('#searchPageInput'))document.querySelector('#searchPageInput').addEventListener('keydown',e=>{if(e.key==='Enter'){const q=e.target.value.trim();if(q)location.href='search.html?q='+encodeURIComponent(q)}})}
  
/* ===== SFX — sons leves e satisfatórios em ações-chave ===== */
const sfx=(()=>{
  let ctx=null;
  const ac=()=>{try{if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();return ctx}catch{return null}};
  function tone(freq,{type='sine',dur=.12,vol=.05,delay=0,slide=0}={}){
    const a=ac();if(!a)return;
    const t=a.currentTime+delay;
    const o=a.createOscillator(),g=a.createGain();
    o.type=type;o.frequency.setValueAtTime(freq,t);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),t+dur);
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(vol,t+.012);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+dur+.02);
  }
  return {
    pop(){tone(660,{type:'triangle',dur:.09,vol:.05});tone(990,{type:'triangle',dur:.07,vol:.02,delay:.05})},
    like(){tone(740,{type:'sine',dur:.10,vol:.045,slide:180})},
    unlike(){tone(500,{type:'sine',dur:.09,vol:.035,slide:-120})},
    success(){tone(523,{dur:.12,vol:.04});tone(659,{dur:.12,vol:.04,delay:.10});tone(784,{dur:.18,vol:.045,delay:.20})},
    block(){tone(240,{type:'square',dur:.06,vol:.02})}
  };
})();

/* =========================================================
   XTREME PRO — admin por e-mail, autorização de vendedor,
   métricas reais e painel de customização da loja
========================================================= */

const ADMIN_EMAIL='minilinextreme@gmail.com';
function isAdminUser(u){return !!u&&(String(u.email||'').toLowerCase()===ADMIN_EMAIL||u.role==='admin')}
function isAdmin(){return isAdminUser(currentUser())}
function myRequest(){const u=currentUser();return u?sellerRequests.find(r=>r.userId===u.id):null}
function mySellerStatus(){if(isAdmin())return 'admin';const r=myRequest();return r?r.status:'none'}
function canSell(){return mySellerStatus()==='admin'||mySellerStatus()==='approved'}
function myStoreName(){const u=currentUser();return u?(u.storeName||u.name||'Minha loja'):'Minha loja'}
function myStoreSlug(){const u=currentUser();if(!u)return '';return (u.storeSlug||(u.storeName||u.name||'loja').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''))}
function slugify(t){return String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}

(function syncAdmin(){
  let ch=false;
  users.forEach(u=>{if(isAdminUser(u)&&u.role!=='admin'){u.role='admin';ch=true}});
  if(ch)persist();
})();

function trackVisit(){
  metrics.visits=(metrics.visits||0)+1;
  persist();
}

function trackProductView(){
  if(!location.pathname.endsWith('produto.html'))return;
  const id=new URLSearchParams(location.search).get('id');const p=find(id);
  if(p){p.views=(p.views||0)+1;metrics.views=metrics.views||{};metrics.views[id]=(metrics.views[id]||0)+1;persist()}
}

function sellerStatusChip(){
  const st=mySellerStatus();
  if(st==='admin')return '<span class="store-badge" style="color:#00a650;background:rgba(0,166,80,.12)">Administrador — venda liberada</span>';
  if(st==='approved')return '<span class="store-badge" style="color:#00a650;background:rgba(0,166,80,.12)">Vendedor autorizado</span>';
  if(st==='pending')return '<span class="store-badge" style="color:#b58900;background:rgba(244,169,0,.12)">Autorização pendente — o administrador vai analisar sua loja</span>';
  if(st==='rejected')return '<span class="store-badge" style="color:#e53935;background:rgba(229,57,53,.10)">Não autorizado — edite e solicite novamente</span>';
  return '<span class="store-badge">Sem autorização de venda ainda</span>';
}

function enhanceVender(){
  const f=document.querySelector('#sellForm');if(!f)return;
  const u=currentUser();
  const box=document.createElement('div');
  box.id='sellGate';box.style.marginBottom='18px';
  const st=mySellerStatus();
  let inner='<div class="card" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">'+
    '<div style="flex:1;min-width:220px">'+sellerStatusChip()+'<p class="page-subtitle" style="margin:10px 0 0">Loja: <b>'+esc(myStoreName())+'</b> · <a class="text-button" href="conta-vendedor.html" style="display:inline">Personalizar painel da loja</a></p></div>';
  if(!u){
    inner+='<a class="button primary" style="width:auto" href="login.html">Entrar para vender</a>';
  }else if(st==='none'||st==='rejected'){
    inner+='<a class="button primary" style="width:auto" href="conta-vendedor.html">Solicitar autorização</a>';
  }
  inner+='</div>';
  box.innerHTML=inner;
  f.parentElement.insertBefore(box,f);
  if(!canSell()){
    f.addEventListener('submit',e=>{e.preventDefault();e.stopPropagation();
      sfx.block();toast(u?'Publique após sua conta de vendedor ser autorizada pelo admin.':'Entre na sua conta para vender.')},true);
  }
}

/* ===== REPASSES SEGUROS POR VENDEDOR (retenção até a entrega) ===== */
function buildPayouts(items){
  const map={};
  items.forEach(i=>{const p=find(i.id);if(!p)return;
    const flash=p.flashEnds>Date.now()&&p.flashPrice;
    const unit=p.type==='presale'?(p.entry||25):(flash?p.flashPrice:p.price);
    const key=p.ownerId||'platform';
    map[key]=map[key]||{sellerId:key,sellerName:p.storeName||p.seller||'Loja oficial',gross:0};
    map[key].gross+=unit*i.qty});
  return Object.values(map).map(x=>{const net=+(x.gross*(1-commission/100)).toFixed(2);x.net=net;x.commission=+(x.gross-net).toFixed(2);x.paid=false;return x});
}
function enhanceOrders(){
  const root=document.querySelector('#orders');if(!root)return;
  root.querySelectorAll('[data-oid]').forEach(el=>{
    if(el.querySelector('.recv-btn'))return;
    const o=orders.find(x=>x.id===el.dataset.oid);
    if(!o||o.status==='Entregue')return;
    const btn=document.createElement('button');
    btn.className='button ghost recv-btn';btn.style.cssText='width:auto;margin-top:10px';
    btn.textContent='✅ Confirmar recebimento';
    btn.onclick=()=>{o.status='Entregue';o.receivedAt=Date.now();persist();sfx.success();
      notify('Entrega confirmada','Pedido '+o.id+' confirmado pelo comprador — o repasse do vendedor foi liberado.');
      toast('Recebimento confirmado! Obrigado.');
      renderOrders();enhanceOrders();};
    el.appendChild(btn);
  });
}
function enhanceAccount(){
  const root=document.querySelector('#accountApp');if(!root)return;
  const u=currentUser();const wrap=document.createElement('div');
  let html='';
  if(isAdmin()){
    html+='<div class="account-section"><h3>Administração</h3><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px"><a class="button primary" style="width:auto" href="admin.html">Abrir painel admin</a><a class="button ghost" style="width:auto" href="conta-vendedor.html">Painel da loja oficial</a></div></div>';
  }
  html+='<div class="account-section"><h3>Vendedor</h3>'+sellerStatusChip()+
    '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px"><a class="button primary" style="width:auto" href="conta-vendedor.html">Painel da loja</a><a class="button ghost" style="width:auto" href="vender.html">Publicar anúncio</a></div></div>';
  wrap.innerHTML=html;root.appendChild(wrap);
}

function enhanceSellerAccount(){
  const root=document.querySelector('#sellerAccountApp');if(!root)return;
  const u=currentUser();
  if(!u){root.innerHTML='<div class="card"><p class="page-subtitle">Entre na sua conta para configurar sua loja.</p><a class="button primary" style="width:auto" href="login.html">Entrar</a></div>';return}
  const myP=products.filter(p=>p.ownerId===u.id);
  const views=myP.reduce((a,p)=>a+(+p.views||0),0);
  const sales=myP.reduce((a,p)=>a+(+p.sales||0),0);
  const revenue=myP.reduce((a,p)=>a+(+p.sales||0)*(+p.price||0),0);
  const active=myP.filter(p=>p.type!=='presale').length;
  const stat=(g,ic,label,val)=>`<div class="sell-stat"><span class="sell-stat-ic" style="background:${g}">${icon(ic)}</span><div><small>${label}</small><b>${val}</b></div></div>`;
  const myPayouts=[];
  orders.forEach(o=>(o.payouts||[]).forEach(po=>{if(po.sellerId===u.id)myPayouts.push({po,o})}));
  const pend=myPayouts.filter(x=>x.o.status!=='Entregue').reduce((a,x)=>a+x.po.net,0);
  const lib=myPayouts.filter(x=>x.o.status==='Entregue'&&!x.po.paid).reduce((a,x)=>a+x.po.net,0);
  const pago=myPayouts.filter(x=>x.po.paid).reduce((a,x)=>a+x.po.net,0);
  root.innerHTML=
    '<div class="sell-hero"><div class="sell-hero-bg"'+(u.storeBanner?' style="background-image:url(\''+u.storeBanner+'\')"':'')+'></div>'+
      '<div class="sell-hero-row"><div class="sell-logo">'+(u.storeLogo?'<img src="'+u.storeLogo+'" alt="Logo da loja">':esc(((u.storeName||u.name||'L').trim()[0]||'L').toUpperCase()))+'</div>'+
      '<div class="sell-hero-info"><span class="eyebrow">PAINEL DA LOJA</span><h1>'+esc(u.storeName||u.name||'Minha loja')+'</h1><p>'+esc(u.storeSlug?'/'+u.storeSlug:'Defina o identificador da sua loja')+'</p><div style="margin-top:10px">'+sellerStatusChip()+'</div></div>'+
      '<a class="button ghost sell-hero-btn" href="loja.html?id='+encodeURIComponent(u.id)+'">Ver minha loja</a></div></div>'+
    '<div class="sell-stats">'+
      stat('linear-gradient(135deg,#ffb02e,#f0670a)','products','Anúncios ativos',active)+
      stat('linear-gradient(135deg,#7ab8ff,#3f7fe0)','search','Visualizações',views)+
      stat('linear-gradient(135deg,#5be585,#0fa968)','cart','Vendas',sales)+
      stat('linear-gradient(135deg,#f7c948,#e8a615)','heart','Receita',money(revenue))+
    '</div>'+
    '<div class="card"><b style="font-size:14px">💰 Saldo e repasses</b>'+
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-top:12px">'+
      '<div class="payout-box"><small>Retido até a entrega</small><b>'+money(pend)+'</b></div>'+
      '<div class="payout-box"><small>Liberado a receber</small><b style="color:#00a650">'+money(lib)+'</b></div>'+
      '<div class="payout-box"><small>Já pago</small><b>'+money(pago)+'</b></div></div>'+
      '<p class="page-subtitle" style="margin:12px 0 0">Cada venda fica retida até o comprador confirmar o recebimento da mini. Depois o administrador repassa pra sua conta — comissão da plataforma: '+commission+'%.</p></div>'+
    '<div class="sell-actions">'+
      '<a class="button primary" href="vender.html">Publicar anúncio</a>'+
      '<a class="button ghost" href="cupons.html">Ver cupons</a>'+
      '<a class="button ghost" href="loja.html?id='+encodeURIComponent(u.id)+'">Ver minha loja</a>'+
    '</div>'+
    '<div class="card seller-form-card" style="max-width:760px"><h2 class="menu-sec" style="margin:2px 0 14px">Personalizar a loja</h2>'+
      '<form id="storeCustomForm"><div class="form-grid">'+
        '<div class="form-group"><label class="form-label">Nome da loja</label><input class="form-input" name="storeName" required maxlength="40" value="'+esc(u.storeName||u.name||'')+'"></div>'+
        '<div class="form-group"><label class="form-label">Identificador (link da loja)</label><input class="form-input" name="storeSlug" maxlength="40" value="'+esc(u.storeSlug||myStoreSlug())+'" placeholder="minha-loja"></div>'+
        '<div class="form-group full"><label class="form-label">Descrição da loja</label><textarea class="form-textarea" name="storeBio" maxlength="280" style="min-height:80px">'+esc(u.storeBio||'')+'</textarea></div>'+
        '<div class="form-group"><label class="form-label">Logo (foto)</label><input class="form-input" type="file" id="storeLogoInput" accept="image/*">'+
        '<div class="photo-previews" id="storeLogoPrev" style="grid-template-columns:96px"></div></div>'+
        '<div class="form-group"><label class="form-label">Banner (foto)</label><input class="form-input" type="file" id="storeBannerInput" accept="image/*">'+
        '<div class="photo-previews" id="storeBannerPrev" style="grid-template-columns:160px"></div></div>'+
      '</div><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px"><button class="button primary" style="width:auto" type="submit">'+(mySellerStatus()==='approved'?'Salvar alterações':'Salvar e enviar para análise')+'</button></div></form>'+
    '</div>';
  const form=root.querySelector('#storeCustomForm');
  let logo=null, banner=null;
  const paint=(el,src)=>{el.innerHTML=src?'<div class="photo-preview"><img src="'+src+'"></div>':''};
  if(u.storeLogo)paint(root.querySelector('#storeLogoPrev'),u.storeLogo);
  if(u.storeBanner)paint(root.querySelector('#storeBannerPrev'),u.storeBanner);
  root.querySelector('#storeLogoInput').addEventListener('change',async e=>{const f=e.target.files[0];if(f){try{logo=await compressImage(f);paint(root.querySelector('#storeLogoPrev'),logo)}catch{toast('Imagem inválida.')}}});
  root.querySelector('#storeBannerInput').addEventListener('change',async e=>{const f=e.target.files[0];if(f){try{banner=await compressImage(f);paint(root.querySelector('#storeBannerPrev'),banner)}catch{toast('Imagem inválida.')}}});
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const d=new FormData(form);
    u.storeName=String(d.get('storeName')||'').trim()||u.name;
    u.storeSlug=slugify(d.get('storeSlug')||u.storeName);
    u.storeBio=String(d.get('storeBio')||'').trim();
    if(logo)u.storeLogo=logo;
    if(banner)u.storeBanner=banner;
    if(!canSell()){
      const r=myRequest();
      if(r){r.status='pending';r.at=Date.now()}else sellerRequests.push({id:'sr-'+Date.now(),userId:u.id,name:u.name,email:u.email,status:'pending',at:Date.now()});
      notify('Solicitação de vendedor enviada','Sua loja "'+u.storeName+'" foi enviada para análise do administrador.');
    }else{notify('Loja atualizada','As informações da sua loja foram salvas.')}
    persist();toast(mySellerStatus()==='approved'?'Loja atualizada!':'Loja enviada para análise do admin!');
    enhanceSellerAccount();
  });
}

function enhanceAdmin(){
  const onAdmin=!!document.querySelector('#adminProductForm,#adminProductsList');
  if(!onAdmin)return;
  const page=document.querySelector('.admin-page');
  if(!isAdmin()){
    if(page){page.innerHTML='<div class="empty-state" style="margin-top:20px"><strong>Área restrita.</strong><p>Este painel é exclusivo do administrador do MiniLine Xtreme.<br>Entre com a conta administradora para acessar.</p><a class="button primary" style="width:auto;margin-top:12px" href="login.html">Entrar como admin</a></div>'}
    return;
  }
  trackVisit();
  const set=(id,v)=>{const e=document.querySelector('#'+id);if(e)e.textContent=v};
  set('adminVisits',(metrics.visits||0));
  let likes=0;Object.values(metrics.views||{}).forEach(()=>{});
  set('adminLikes',favorites.length);
  const req=document.querySelector('#adminSellerRequests');
  if(req){
    const pend=sellerRequests.filter(r=>r.status!=='approved');
    req.innerHTML=pend.length?pend.map(r=>{
      const u=users.find(x=>x.id===r.userId);
      return '<div class="admin-seller-card"><div class="admin-seller-avatar">'+esc((r.name||'V').slice(0,1).toUpperCase())+'</div><section style="min-width:0"><b>'+esc(r.name)+'</b><small style="display:block;color:var(--muted)">'+esc(r.email)+' · loja '+esc((u&&u.storeName)||r.name)+' · '+esc(r.status==='pending'?'aguardando':'recusada')+'</small></section><div class="admin-seller-actions">'+
      (r.status==='pending'?'<button class="button primary" style="width:auto" data-approve-seller="'+r.id+'">Autorizar</button><button class="button danger" style="width:auto" data-reject-seller="'+r.id+'">Recusar</button>':
      '<button class="button ghost" style="width:auto" data-approve-seller="'+r.id+'">Autorizar</button>')+'</div></div>'
    }).join(''):'<div class="empty-state compact"><strong>Nenhuma solicitação pendente.</strong><p>Quando alguém pedir autorização para vender, aparece aqui.</p></div>';
    req.querySelectorAll('[data-approve-seller]').forEach(b=>b.onclick=()=>{
      const r=sellerRequests.find(x=>x.id===b.dataset.approveSeller);if(!r)return;
      r.status='approved';persist();
      const u=users.find(x=>x.id===r.userId);if(u&&!u.storeName)u.storeName=r.name;
      persist();
      notify('Conta de vendedor aprovada','Sua loja "'+((u&&u.storeName)||r.name)+'" já pode publicar anúncios. Boas vendas!');
      sfx.success();toast('Vendedor autorizado!');enhanceAdmin();
    });
    req.querySelectorAll('[data-reject-seller]').forEach(b=>b.onclick=()=>{
      const r=sellerRequests.find(x=>x.id===b.dataset.rejectSeller);if(!r)return;
      r.status='rejected';persist();notify('Solicitação recusada','O administrador não liberou sua loja. Você pode ajustar e pedir novamente.');toast('Solicitação recusada.');enhanceAdmin();
    });
  }
  const top=document.querySelector('#adminTopProducts');
  if(top){
    const rows=[...products].sort((a,b)=>((b.views||0)+(b.sales||0)*10)-((a.views||0)+(a.sales||0)*10)).slice(0,8);
    top.innerHTML=rows.length?rows.map(p=>{
      const sold=orders.flatMap(o=>o.items||[]).filter(i=>i.productId===p.id||i.product?.id===p.id).reduce((s,i)=>s+(+i.qty||1),0)+(p.sales||0);
      return '<div class="admin-product"><div class="admin-thumb">'+(imageOf(p)?'<img src="'+imageOf(p)+'">':'MLX')+'</div><section style="min-width:0"><b>'+esc(p.name)+'</b><small style="display:block;color:var(--muted)">'+esc(p.category)+' · '+(p.views||0)+' visitas · '+sold+' vendas</small></section><a class="button ghost" style="width:auto" href="produto.html?id='+p.id+'">Ver</a></div>'
    }).join(''):'<div class="empty-state compact">Sem métricas ainda.</div>';
  }
  const stores=document.querySelector('#adminStores');
  if(stores){
    const su=users.filter(u=>u.storeName||isAdminUser(u));
    stores.innerHTML=su.length?su.map(u=>{
      const prods=products.filter(p=>p.ownerId===u.id).length;
      return '<div class="admin-seller-card"><div class="admin-seller-avatar">'+esc((u.storeName||u.name||'V').slice(0,1).toUpperCase())+'</div><section style="min-width:0"><b>'+esc(u.storeName||u.name)+'</b><small style="display:block;color:var(--muted)">'+esc(u.email)+' · '+prods+' anúncio(s)'+(isAdminUser(u)?' · ADMIN':'')+'</small></section><a class="button ghost" style="width:auto" href="loja.html?id='+encodeURIComponent(u.id)+'">Ver loja</a></div>'
    }).join(''):'<div class="empty-state compact">Nenhuma loja criada ainda.</div>';
  }
  const lotsBox=document.querySelector('#adminLots');
  if(lotsBox){let at='comum';
    let ay=LOT_YEARS[0], al=LOT_LETTERS[0], pending=[];
    const cur=()=>(lots[lotKey(ay,al)]||[]);
    const paintLotsAdmin=()=>{
      lotsBox.innerHTML='<div class="card"><div class="form-grid"><div class="form-group"><label class="form-label">Ano do lote</label><select class="form-select" id="lotAdminYear">'+LOT_YEARS.map(y=>'<option value="'+y+'"'+(y===ay?' selected':'')+'>'+y+'</option>').join('')+'</select></div><div class="form-group"><label class="form-label">Lote do ano</label><select class="form-select" id="lotAdminLetter">'+LOT_LETTERS.map(l=>'<option value="'+l+'"'+(l===al?' selected':'')+'>'+l+'</option>').join('')+'</select></div><div class="form-group"><label class="form-label">Tipo das fotos</label><select class="form-select" id="lotAdminType"><option value="comum"'+(at==='comum'?' selected':'')+'>Comum (padrão)</option><option value="sth"'+(at==='sth'?' selected':'')+'>🔥 STH — laranja</option><option value="th"'+(at==='th'?' selected':'')+'>TH — prata</option></select></div></div>'+
      '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:8px 0 14px"><input class="form-input" type="file" id="lotAdminFile" accept="image/*" multiple style="width:auto;padding:9px 12px"><button class="button primary" type="button" style="width:auto" id="lotAdminAdd">Adicionar ao lote</button></div>'+
      (pending.length?'<div class="photo-previews">'+pending.map(x=>'<div class="photo-preview"><img src="'+x+'"></div>').join('')+'</div><p class="page-subtitle" style="margin-top:8px">'+pending.length+' foto(s) prontas para adicionar</p>':'')+
      '<div class="hot-gallery" style="margin-top:12px">'+(cur().length?cur().map((x,i)=>{const e=lotEntry(x);return '<figure class="hot-photo"><img src="'+e.src+'" alt="Lote '+al+' de '+ay+'">'+(e.type!=='comum'?'<span class="lot-tag '+(e.type==='sth'?'lot-tag-sth':'lot-tag-th')+'">'+(e.type==='sth'?'🔥 STH':'TH')+'</span>':'')+'<figcaption>Lote '+al+' · '+ay+' · '+(i+1)+' <button class="text-button" data-del-lot="'+i+'">Excluir</button></figcaption></figure>'}).join(''):'<div class="empty-state compact">Sem fotos neste lote — escolha o ano e a letra acima.</div>')+'</div></div>';
      lotsBox.querySelector('#lotAdminYear').onchange=e=>{ay=e.target.value;paintLotsAdmin()};
      lotsBox.querySelector('#lotAdminType').onchange=e=>{at=e.target.value;paintLotsAdmin()};
      lotsBox.querySelector('#lotAdminLetter').onchange=e=>{al=e.target.value;paintLotsAdmin()};
      lotsBox.querySelector('#lotAdminFile').addEventListener('change',async e=>{for(const f of Array.from(e.target.files)){try{pending.push(await compressImage(f))}catch{toast('Imagem inválida.')}}paintLotsAdmin()});
      lotsBox.querySelector('#lotAdminAdd').onclick=()=>{
        if(!pending.length)return toast('Escolha as fotos primeiro.');
        lots[lotKey(ay,al)]=pending.map(src=>({src,type:at})).concat((lots[lotKey(ay,al)]||[]).map(lotEntry));
        persist();pending=[];
        notify('Lote atualizado','Novas fotos no lote '+al+' de '+ay+'.');
        toast('Fotos adicionadas ao lote '+al+' de '+ay+'!');paintLotsAdmin();
      };
      lotsBox.querySelectorAll('[data-del-lot]').forEach(b=>b.onclick=()=>{const arr=lots[lotKey(ay,al)]||[];arr.splice(+b.dataset.delLot,1);persist();paintLotsAdmin()});
    };
    paintLotsAdmin();
  }
  const cpBox=document.querySelector('#adminCoupons');
  if(cpBox){
    const paintCp=()=>{
      cpBox.innerHTML='<div class="card"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end"><div class="form-group" style="min-width:150px;margin:0"><label class="form-label">Código</label><input id="cpCode" class="form-input" style="text-transform:uppercase" maxlength="20" placeholder="PROMO10"></div><div class="form-group" style="min-width:110px;margin:0"><label class="form-label">Desconto %</label><input id="cpPct" class="form-input" type="number" min="1" max="80" value="10"></div><button id="cpAdd" class="button primary" style="width:auto">Criar cupom</button></div>'+
      '<div style="display:grid;gap:10px;margin-top:16px">'+(coupons.length?coupons.map(c=>'<div class="admin-seller-card"><section style="min-width:0"><b>'+esc(c.code)+'</b><small style="display:block;color:var(--muted)">−'+c.percent+'% · '+(c.active?'ativo':'inativo')+'</small></section><div class="admin-seller-actions"><button class="button ghost" style="width:auto" data-cp-toggle="'+c.code+'">'+(c.active?'Desativar':'Ativar')+'</button><button class="button danger" style="width:auto" data-cp-del="'+c.code+'">Excluir</button></div></div>').join(''):'<div class="empty-state compact">Nenhum cupom criado.</div>')+'</div></div>';
      cpBox.querySelector('#cpAdd').onclick=()=>{
        const code=(cpBox.querySelector('#cpCode').value||'').trim().toUpperCase();
        const pct=+cpBox.querySelector('#cpPct').value;
        if(!code||pct<1||pct>80)return toast('Código e % válidos (1-80).');
        if(coupons.some(x=>x.code===code))return toast('Já existe um cupom com esse código.');
        coupons.push({code,percent:pct,active:true});persist();sfx.success();toast('Cupom '+code+' criado!');paintCp();
      };
      cpBox.querySelectorAll('[data-cp-toggle]').forEach(b=>b.onclick=()=>{const c=coupons.find(x=>x.code===b.dataset.cpToggle);c.active=!c.active;persist();paintCp()});
      cpBox.querySelectorAll('[data-cp-del]').forEach(b=>b.onclick=()=>{coupons=coupons.filter(x=>x.code!==b.dataset.cpDel);persist();paintCp()});
    };
    paintCp();
  }
  const flBox=document.querySelector('#adminFlash');
  if(flBox){
    const paintFl=()=>{
      const offers=products.filter(p=>p.flashEnds>Date.now()&&p.flashPrice);
      flBox.innerHTML='<div class="card"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end"><div class="form-group" style="min-width:220px;margin:0;flex:1"><label class="form-label">Produto</label><select id="flProd" class="form-select">'+products.map(p=>'<option value="'+p.id+'">'+esc(p.name)+' — '+money(p.price)+'</option>').join('')+'</select></div><div class="form-group" style="min-width:110px;margin:0"><label class="form-label">Preço oferta</label><input id="flPrice" class="form-input" type="number" min="0.01" step="0.01" placeholder="Ex.: 19.90"></div><div class="form-group" style="min-width:100px;margin:0"><label class="form-label">Duração (h)</label><input id="flHours" class="form-input" type="number" min="1" max="72" value="24"></div><button id="flAdd" class="button primary" style="width:auto">Ativar ⚡</button></div>'+
      '<div style="display:grid;gap:10px;margin-top:16px">'+(offers.length?offers.map(p=>'<div class="admin-seller-card"><div class="admin-thumb">'+(imageOf(p)?'<img src="'+imageOf(p)+'">':'MLX')+'</div><section style="min-width:0"><b>'+esc(p.name)+'</b><small style="display:block;color:var(--muted)">'+money(p.flashPrice)+' (era '+money(p.price)+') · termina '+new Date(p.flashEnds).toLocaleString('pt-BR')+'</small></section><button class="button danger" style="width:auto" data-fl-end="'+p.id+'">Encerrar</button></div>').join(''):'<div class="empty-state compact">Nenhuma oferta ativa. Ative uma promoção relâmpago acima!</div>')+'</div></div>';
      flBox.querySelector('#flAdd').onclick=()=>{
        const p=find(flBox.querySelector('#flProd').value);
        const price=+flBox.querySelector('#flPrice').value;
        const hours=+flBox.querySelector('#flHours').value||24;
        if(!p)return;
        if(!price||price>=p.price)return toast('O preço da oferta deve ser menor que o normal.');
        p.flashPrice=price;p.flashEnds=Date.now()+hours*3.6e6;persist();sfx.success();
        notify('Oferta relâmpago ativa!','"'+p.name+'" por '+money(price)+' — termina em breve!');
        toast('Oferta ativada!');paintFl();
      };
      flBox.querySelectorAll('[data-fl-end]').forEach(b=>b.onclick=()=>{const p=find(b.dataset.flEnd);if(p){delete p.flashPrice;delete p.flashEnds;persist();paintFl()}});
    };
    paintFl();
  }
  const stBox=document.querySelector('#adminStripe');
  if(stBox){
    const cur=read('mlx_stripe_link_v3','');
    stBox.innerHTML='<div class="card"><p class="page-subtitle" style="margin-bottom:10px">Cole aqui o <b>link de pagamento do Stripe</b> (Payment Link criado no painel do Stripe — passo a passo no arquivo STRIPE-SETUP.md). Quando o cliente escolher "Cartão (Stripe)" no checkout, ele será levado pro pagamento de verdade.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><input id="stripeLink" class="form-input" style="flex:1;min-width:240px" placeholder="https://buy.stripe.com/..." value="'+esc(cur)+'"><button id="stripeSave" class="button primary" style="width:auto">Salvar</button></div></div>';
    stBox.querySelector('#stripeSave').onclick=()=>{
      const v=(stBox.querySelector('#stripeLink').value||'').trim();
      write('mlx_stripe_link_v3',v);toast(v?'Link Stripe salvo!':'Link removido.');
    };
  }
  const poBox=document.querySelector('#adminPayouts');
  if(poBox){
    const paintPo=()=>{
      let html='<div class="card" style="margin-bottom:14px"><div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap"><div class="form-group" style="min-width:150px;margin:0"><label class="form-label">Comissão da plataforma (%)</label><input id="poFee" class="form-input" type="number" min="0" max="30" value="'+commission+'"></div><button id="poFeeSave" class="button primary" style="width:auto">Salvar</button><span class="page-subtitle" style="margin:0 0 8px">Cada venda gera um repasse: o vendedor recebe o valor menos essa comissão.</span></div></div>';
      const withPo=orders.filter(o=>o.payouts&&o.payouts.length);
      if(!withPo.length)html+='<div class="empty-state compact">Os repasses por vendedor aparecem aqui conforme as vendas acontecem.</div>';
      else html+=withPo.slice().reverse().map(o=>'<div class="card" style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><b style="font-size:13px">'+esc(o.id)+' · '+esc(o.status)+'</b><small style="color:var(--muted)">'+new Date(o.date).toLocaleDateString('pt-BR')+'</small></div>'+o.payouts.map((po,i)=>'<div class="admin-seller-card" style="margin-top:10px"><section style="min-width:0"><b>'+esc(po.sellerName)+'</b><small style="display:block;color:var(--muted)">Venda '+money(po.gross)+' · comissão '+money(po.commission)+' · <b style="color:#00a650">recebe '+money(po.net)+'</b></small></section><span class="store-badge" style="'+(po.paid?'background:rgba(0,166,80,.12);color:#00a650':'')+'">'+(po.paid?'✓ pago':(o.status==='Entregue'?'liberado p/ pagar':'retido até entrega'))+'</span>'+(o.status==='Entregue'&&!po.paid?'<button class="button ghost" style="width:auto" data-po-pay="'+o.id+'|'+i+'">Marcar como pago</button>':'')+'</div>').join('')+'</div>').join('');
      poBox.innerHTML=html;
      poBox.querySelector('#poFeeSave')?.addEventListener('click',()=>{commission=Math.max(0,Math.min(30,+poBox.querySelector('#poFee').value||10));write('mlx_commission_v3',commission);toast('Comissão salva: '+commission+'%')});
      poBox.querySelectorAll('[data-po-pay]').forEach(b=>b.onclick=()=>{const parts=b.dataset.poPay.split('|');const o=orders.find(x=>x.id===parts[0]);const po=o&&o.payouts[+parts[1]];if(po){po.paid=true;po.paidAt=Date.now();persist();sfx.success();toast('Repasse marcado como pago.');paintPo()}});
    };
    paintPo();
  }
}

function enhanceXtreme(){
  trackVisit();
  trackProductView();
  enhanceHome();
  enhanceLots();
  enhanceCheckout();
  enhanceProductReviews();
  enhanceStoreRating();
  enhanceMessages();
  enhanceOrders();
  enhanceAccount();
  enhanceVender();
  enhanceSellerAccount();
  enhanceAdmin();
}

/* ===== FAIXA DE CATEGORIAS — círculos estilo Shopee ===== */
function catStripRender(){
  const root=document.querySelector('#catStrip');if(!root)return;
  const defs=[
    {c:'Premium', icon:'star', g:'linear-gradient(135deg,#f7c948,#e8a615)'},
    {c:'Silver Series', icon:'shield', g:'linear-gradient(135deg,#b8c0cc,#8d97a6)'},
    {c:'Barbie', icon:'heart', g:'linear-gradient(135deg,#ff8fb1,#e5497a)'},
    {c:'Lightyear', icon:'rocket', g:'linear-gradient(135deg,#7ab8ff,#3f7fe0)'},
    {c:'Transformers', icon:'robot', g:'linear-gradient(135deg,#ff8a5c,#d63b1f)'},
    {c:'Fast & Furious', icon:'flame', g:'linear-gradient(135deg,#ffb02e,#f0670a)'},
    {c:'Raridades', icon:'gem', g:'linear-gradient(135deg,#a78bfa,#7c3aed)'},
    {c:'Hot Wheels', icon:'car', g:'linear-gradient(135deg,#5be585,#0fa968)'}
  ];
  root.innerHTML='<div class="cat-strip-track">'+defs.map(d=>
    '<button type="button" class="cat-circle" data-catstrip="'+esc(d.c)+'">'+
    '<span class="cat-circle-icon" style="background:'+d.g+'">'+icon(d.icon)+'</span>'+
    '<b>'+esc(d.c)+'</b></button>').join('')+'</div>';
  root.querySelectorAll('[data-catstrip]').forEach(b=>b.onclick=()=>{
    sfx.like();filtrarCategoria(b.dataset.catstrip);
    document.querySelector('#produtos')?.scrollIntoView({behavior:'smooth'});
  });
}

/* ===== AVALIAÇÕES ===== */
function starsHTML(avg,count){
  if(avg===null||avg===undefined)return '<span style="color:var(--muted);font-size:12.5px">Sem avaliações ainda</span>';
  const full=Math.round(avg);
  return '<span style="color:#ffb400;font-size:14px;letter-spacing:1px">'+'★'.repeat(full)+'<span style="color:var(--border)">'+'★'.repeat(5-full)+'</span></span> <b style="font-size:12.5px">'+avg.toFixed(1)+'</b> <span style="color:var(--muted);font-size:12px">('+count+')</span>';
}
function productRating(pid){
  const rs=reviews.filter(r=>r.productId===pid);
  if(!rs.length)return{avg:null,count:0};
  return{avg:rs.reduce((a,r)=>a+r.rating,0)/rs.length,count:rs.length};
}
function enhanceProductReviews(){
  const root=document.querySelector('#produto .detail');if(!root)return;
  document.querySelector('#reviewsBlock')?.remove();
  const pid=new URLSearchParams(location.search).get('id');const p=find(pid);if(!p)return;
  const u=currentUser();
  const rs=reviews.filter(r=>r.productId===pid).sort((a,b)=>b.at-a.at);
  const avg=rs.length?rs.reduce((a,r)=>a+r.rating,0)/rs.length:null;
  const owned=orders.some(o=>o.items.some(i=>(i.id===pid)||(i.product&&i.product.id===pid)));
  const mine=u&&rs.find(r=>r.userId===u.id);
  let html='<section id="reviewsBlock" style="margin-top:30px"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px"><div><p class="eyebrow" style="margin-bottom:4px">OPINIÕES</p><h2 style="margin:0">Avaliações</h2></div>'+starsHTML(avg,rs.length)+'</div>';
  if(owned&&!mine&&u){
    html+='<div class="card" style="margin-bottom:16px"><div id="revStars" style="display:flex;gap:6px;margin-bottom:10px">'+[1,2,3,4,5].map(n=>'<button type="button" data-rev-star="'+n+'" style="background:transparent;border:none;font-size:26px;color:var(--border);cursor:pointer">★</button>').join('')+'</div><textarea id="revComment" class="form-textarea" style="min-height:70px" maxlength="300" placeholder="Como foi sua experiência com este produto?"></textarea><button id="revSend" class="button primary" style="width:auto;margin-top:10px">Enviar avaliação</button></div>';
  }else if(!owned){
    html+='<p class="page-subtitle" style="margin-bottom:16px">Compre este produto para poder avaliar.</p>';
  }
  html+=rs.length?'<div style="display:grid;gap:12px">'+rs.map(r=>'<div class="card" style="padding:16px"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><b style="font-size:13.5px">'+esc(r.userName||'Comprador')+'</b><span style="color:#ffb400">'+('★'.repeat(r.rating))+'<span style="color:var(--border)">'+('★'.repeat(5-r.rating))+'</span></span></div><p style="margin:8px 0 0;font-size:13.5px;line-height:1.55">'+esc(r.comment||'')+'</p><small style="color:var(--muted);font-size:11px">'+new Date(r.at).toLocaleDateString('pt-BR')+'</small></div>').join('')+'</div>':'<div class="empty-state compact">Ainda ninguém avaliou este produto.</div>';
  html+='<div style="margin-top:16px"><button id="askSeller" class="button ghost" style="width:auto">💬 Perguntar ao vendedor</button></div></section>';
  root.insertAdjacentHTML('afterend',html);
  document.querySelector('#askSeller')?.addEventListener('click',()=>{
    const key=p.ownerId||'mlx';
    messages[key]=messages[key]||[];
    messages[key].push({from:session?.userId,name:currentUser()?.name||'Você',text:'Olá! Tenho interesse em: '+p.name+' ('+money(p.price)+')',at:Date.now()});
    persist();location.href='mensagens.html?store='+encodeURIComponent(key);
  });
  let sel=0;
  document.querySelectorAll('[data-rev-star]').forEach(b=>b.onclick=()=>{
    sel=+b.dataset.revStar;
    document.querySelectorAll('[data-rev-star]').forEach(x=>x.style.color=(+x.dataset.revStar<=sel)?'#ffb400':'var(--border)');
  });
  document.querySelector('#revSend')?.addEventListener('click',()=>{
    const c=(document.querySelector('#revComment')?.value||'').trim();
    if(!sel)return toast('Escolha de 1 a 5 estrelas.');
    if(!c)return toast('Escreva um comentário.');
    reviews.push({id:'rv-'+Date.now(),productId:pid,userId:u.id,userName:u.name||u.email,rating:sel,comment:c,at:Date.now()});
    persist();sfx.success();notify('Obrigado pela avaliação!','Sua opinião sobre "'+p.name+'" foi publicada.');
    toast('Avaliação enviada!');enhanceProductReviews();
  });
}
function enhanceStoreRating(){
  const head=document.querySelector('.store-title');if(!head)return;
  const params=new URLSearchParams(location.search);
  const id=params.get('id');
  const u=users.find(x=>id&&x.id===id);
  if(!u)return;
  const rs=reviews.filter(r=>products.some(p=>p.ownerId===u.id&&p.id===r.productId));
  if(!rs.length)return;
  const avg=rs.reduce((a,r)=>a+r.rating,0)/rs.length;
  head.querySelector('h1')?.insertAdjacentHTML('afterend','<p class="page-subtitle" style="margin-top:6px">'+starsHTML(avg,rs.length)+'</p>');
}

/* ===== CUPOM + FRETE + CEP (checkout) ===== */
function enhanceCheckout(){
  const sum=document.querySelector('#checkoutSummary');if(!sum)return;
  const cepBtn=document.querySelector('#cepLookup');
  if(cepBtn&&!cepBtn.dataset.on){cepBtn.dataset.on=1;cepBtn.onclick=async()=>{
    const cep=(document.querySelector('#cep')?.value||'').replace(/\D/g,'');
    if(cep.length!==8)return toast('Digite os 8 números do CEP.');
    try{
      const r=await fetch('https://viacep.com.br/ws/'+cep+'/json/');const d=await r.json();
      if(d.erro)return toast('CEP não encontrado — preencha manualmente.');
      if(d.logradouro)document.querySelector('#street').value=d.logradouro;
      if(d.localidade)document.querySelector('#city').value=d.localidade;
      if(d.uf)document.querySelector('#state').value=(d.uf||'').toUpperCase();
      toast('Endereço encontrado!');
    }catch{toast('Sem internet para buscar o CEP — preencha manualmente.')}
  }}
  if(!document.querySelector('#couponBox')){
    const box=document.createElement('div');box.id='couponBox';box.className='card';box.style.marginTop='14px';
    sum.appendChild(box);
    new MutationObserver(()=>{if(!document.querySelector('#couponBox'))paintCoupon()}).observe(sum,{childList:true,subtree:true});
    paintCoupon();
  }
  function paintCoupon(){
    const b=document.querySelector('#couponBox');if(!b)return;
    const t=cartTotals();
    const applied=read('mlx_coupon_v3','');
    b.innerHTML='<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;align-items:center"><b style="font-size:13px">🎟️ Cupom de desconto</b>'+
      (applied?'<span class="store-badge" style="background:rgba(0,166,80,.12);color:#00a650">'+esc(applied)+' aplicado</span>':'')+'</div>'+
      (t.discount?'<p style="margin:8px 0 0;font-size:13px;color:#00a650;font-weight:700">− '+money(t.discount)+' de desconto'+(t.coupon?' ('+esc(t.coupon)+')':'')+'</p>':'')+
      '<p style="margin:6px 0 8px;font-size:12.5px;color:var(--muted)">Frete: '+(t.shipping?money(t.shipping):'<b style="color:#00a650">GRÁTIS</b>')+' · grátis acima de R$ 149,90</p>'+
      '<div style="display:flex;gap:8px"><input id="couponInput" class="form-input" style="text-transform:uppercase" placeholder="Código do cupom" value="'+esc(applied)+'"><button id="couponApply" class="button primary" style="width:auto;white-space:nowrap">Aplicar</button></div>';
    document.querySelector('#couponApply').onclick=()=>{
      const code=(document.querySelector('#couponInput').value||'').trim().toUpperCase();
      if(!code){write('mlx_coupon_v3','');paintCoupon();return}
      const cp=coupons.find(x=>x.active&&String(x.code).toUpperCase()===code);
      if(!cp){sfx.block();return toast('Cupom inválido ou expirado.')}
      write('mlx_coupon_v3',code);sfx.like();toast('Cupom '+code+' aplicado: −'+cp.percent+'%!');paintCoupon();
    };
  }
}

/* ===== CHAT COMPRADOR ↔ VENDEDOR (local) ===== */
function enhanceMessages(){
  const root=document.querySelector('#conversations');if(!root)return;
  const u=currentUser();
  const params=new URLSearchParams(location.search);
  let open=params.get('store');
  const keys=Object.keys(messages);
  if(!u){root.innerHTML='<div class="empty-state"><strong>Entre para conversar.</strong><a class="button primary" style="width:auto" href="login.html">Entrar</a></div>';return}
  const storeName=id=>{const w=users.find(x=>x.id===id);return w?(w.storeName||w.name):'Vendedor'};
  const paint=()=>{
    const thread=open&&messages[open]?messages[open]:null;
    root.innerHTML='<div style="display:grid;gap:10px">'+
      (thread?('<div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><b style="font-size:15px">'+esc(storeName(open))+'</b><button class="button ghost" style="width:auto;padding:7px 12px" id="msgBack">Voltar</button></div>'+
        '<div class="card" style="max-height:340px;overflow:auto;display:grid;gap:10px" id="msgHistory">'+thread.map(m=>'<div style="text-align:'+(m.from===u.id?'right':'left')+'"><span style="display:inline-block;max-width:85%;padding:9px 12px;border-radius:12px;font-size:13.5px;line-height:1.5;background:'+(m.from===u.id?'var(--mlx-black);color:#fff':'var(--card);border:1px solid var(--border-light)')+'">'+esc(m.text)+'</span><small style="display:block;color:var(--muted);font-size:10.5px;margin-top:3px">'+new Date(m.at).toLocaleString('pt-BR')+'</small></div>').join('')+'</div>'+
        '<div style="display:flex;gap:8px"><input id="msgInput" class="form-input" placeholder="Escreva sua mensagem"><button id="msgSend" class="button primary" style="width:auto">Enviar</button></div>')
      :(keys.length?keys.map(k=>{const arr=messages[k]||[];const last=arr[arr.length-1];
        return '<a class="admin-seller-card" style="cursor:pointer" data-thread="'+k+'"><div class="admin-seller-avatar">'+esc(storeName(k).slice(0,1).toUpperCase())+'</div><section style="min-width:0"><b>'+esc(storeName(k))+'</b><small style="display:block;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:70vw">'+esc((last&&last.text)||'')+'</small></section><span class="store-badge">'+arr.length+'</span></a>'}).join(''):'<div class="empty-state"><strong>Nenhuma conversa ainda.</strong><p>Abra um produto e toque em "Perguntar ao vendedor".</p></div>'))+'</div>';
    root.querySelectorAll('[data-thread]').forEach(el=>el.onclick=()=>{open=el.dataset.thread;paint()});
    document.querySelector('#msgBack')?.addEventListener('click',()=>{open=null;paint()});
    document.querySelector('#msgSend')?.addEventListener('click',()=>{
      const v=(document.querySelector('#msgInput')?.value||'').trim();if(!v)return;
      messages[open]=messages[open]||[];messages[open].push({from:u.id,name:u.name,text:v,at:Date.now()});
      persist();sfx.pop();paint();
      const h=document.querySelector('#msgHistory');if(h)h.scrollTop=h.scrollHeight;
    });
    const h=document.querySelector('#msgHistory');if(h)h.scrollTop=h.scrollHeight;
  };
  paint();
}


/* ===== CARROSSEL DE DESTAQUES (home) ===== */
function enhanceHome(){
  const car=document.querySelector('#destaquesCarousel');if(!car)return;
  catStripRender();
  const fs=document.querySelector('#flashSection');
  if(fs){
    const offers=products.filter(p=>p.flashEnds>Date.now()&&p.flashPrice);
    const track=document.querySelector('#flashTrack');
    if(offers.length){
      fs.style.display='';
      track.innerHTML=offers.map(p=>'<a class="product-card" href="produto.html?id='+p.id+'">'+
        '<div class="product-photo">'+(imageOf(p)?'<img src="'+imageOf(p)+'" alt="'+esc(p.name)+'">':'<div class="product-placeholder"><span class="placeholder-mark">MLX</span></div>')+'<span class="store-badge" style="position:absolute;top:10px;left:10px;background:rgba(229,57,53,.92);color:#fff">⚡ OFERTA</span></div>'+
        '<div class="product-body"><span style="font-size:11.5px;color:var(--muted);font-weight:700">'+esc(p.category)+'</span><b>'+esc(p.name)+'</b>'+
        '<div><s style="color:var(--muted);font-size:12px">'+money(p.price)+'</s> <b style="color:#e53935;font-size:17px">'+money(p.flashPrice)+'</b></div></div></a>').join('');
      const cd=document.querySelector('#flashCountdown');
      const tick=()=>{
        const left=Math.max(0,Math.min(...offers.map(p=>p.flashEnds))-Date.now());
        if(left<=0){clearInterval(fs._cd);fs.style.display='none';return}
        const h=String(Math.floor(left/3.6e6)).padStart(2,'0'),m=String(Math.floor(left%3.6e6/6e4)).padStart(2,'0'),sec=String(Math.floor(left%6e4/1e3)).padStart(2,'0');
        if(cd)cd.textContent='Termina em '+h+':'+m+':'+sec;
      };
      clearInterval(fs._cd);fs._cd=setInterval(tick,1000);tick();
    }else{fs.style.display='none'}
  }
  const list=[...products].sort((a,b)=>(((b.sales||0)*10+(b.views||0))-((a.sales||0)*10+(a.views||0)))).slice(0,10);
  car.innerHTML=list.length?list.map(productCard).join(''):'<div class="empty-state">Em breve os destaques da semana.</div>';
  bindCards(car);
  document.querySelectorAll('[data-carousel]').forEach(b=>b.onclick=()=>{
    const vp=b.closest('.carousel-section').querySelector('.carousel-viewport');
    vp.scrollBy({left:(+b.dataset.carousel)*Math.min(760,vp.clientWidth*0.8),behavior:'smooth'});
  });
}

/* ===== LOTES (anos 2024-2026, letras A-Q) ===== */
const LOT_YEARS=['2024','2025','2026'];
const LOT_LETTERS=['A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q'];
function lotKey(y,l){return 'y'+y+'l'+l}
const lotEntry=x=>typeof x==='string'?{src:x,type:'comum'}:x;
async function applyProBg(src, style){
  const im=await new Promise(res=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>res(null);i.src=src});
  if(!im)return src;
  const W=720,H=540,cv=document.createElement('canvas');cv.width=W;cv.height=H;
  const x=cv.getContext('2d');
  const pal={dark:['#262a35','#12141a'],light:['#f6f7f9','#dfe3ea'],gold:['#4a3d1f','#171410'],pista:['#33363b','#1a1c20']};
  const c=pal[style]||pal.dark;
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,c[0]);g.addColorStop(1,c[1]);x.fillStyle=g;x.fillRect(0,0,W,H);
  if(style==='gold'){const r=x.createRadialGradient(W/2,H*0.40,40,W/2,H*0.40,W*0.62);r.addColorStop(0,'rgba(247,201,72,.38)');r.addColorStop(1,'rgba(247,201,72,0)');x.fillStyle=r;x.fillRect(0,0,W,H)}
  if(style==='pista'){x.fillStyle='rgba(247,201,72,.9)';x.fillRect(0,H*0.64,W,5);x.fillStyle='rgba(255,255,255,.55)';x.fillRect(0,H*0.64-8,W,3)}
  if(style==='light'){x.fillStyle='rgba(255,255,255,.5)';x.fillRect(0,H*0.60,W,H*0.40)}
  x.fillStyle='rgba(0,0,0,.30)';x.beginPath();x.ellipse(W/2,H*0.80,150,26,0,0,Math.PI*2);x.fill();
  const maxW=W*0.80,maxH=H*0.60;let dw=maxW,dh=maxW*im.height/im.width;if(dh>maxH){dh=maxH;dw=maxH*im.width/im.height}
  const dx=(W-dw)/2, dy=H*0.80-dh-8;
  x.save();x.shadowColor='rgba(0,0,0,.45)';x.shadowBlur=26;x.shadowOffsetY=12;x.drawImage(im,dx,dy,dw,dh);x.restore();
  return cv.toDataURL('image/jpeg',0.86);
}

function renderCollection(){
  const root=document.querySelector('#collectionApp');if(!root)return;
  let editing=null, img=null, origImg=null, curBg='';
  let fyear='todos', fletter='todas', q='', sort='new';
  const mine=()=>collection.filter(x=>!x.ownerId||!session?.userId||x.ownerId===session?.userId);
  const paintList=()=>{
    const listWrap=root.querySelector('#colList');if(!listWrap)return;
    let list=mine().filter(x=>(fyear==='todos'||String(x.year)===String(fyear))&&(fletter==='todas'||String(x.letter)===String(fletter))&&(!q||(x.name+' '+(x.num||'')+' '+(x.color||'')+' '+(x.note||'')).toLowerCase().includes(q)));
    if(sort==='name')list=[...list].sort((a,b)=>a.name.localeCompare(b.name));
    if(sort==='lot')list=[...list].sort((a,b)=>(String(a.year).localeCompare(String(b.year)))||String(a.letter).localeCompare(String(b.letter))||((+a.num||0)-(+b.num||0)));
    if(sort==='new')list=[...list].sort((a,b)=>b.addedAt-a.addedAt);
    const dupes={};
    mine().forEach(x=>{const k=x.year+'|'+x.letter+'|'+x.num;dupes[k]=(dupes[k]||0)+1});
    const years=[...new Set(mine().map(x=>x.year))];
    const lotePairs=[...new Set(mine().map(x=>x.year+'|'+x.letter))];
    const xp=mine().length*10;
    const LV=[['Iniciante',0],['Aprendiz',100],['Colecionador',250],['Avançado',450],['Expert',700],['Veterano',1000],['Mestre',1400],['Grão-mestre',1900],['Lenda',2500]];
    let li=0;for(let i=0;i<LV.length;i++)if(xp>=LV[i][1])li=i;
    const cur=LV[li],nxt=LV[li+1]||null;
    const pct=nxt?Math.min(100,Math.round((xp-cur[1])/(nxt[1]-cur[1])*100)):100;
    const mAll=mine();
    const ACH=[
      ['🥇','Primeira mini','Cadastrou a 1ª mini',mAll.length>=1],
      ['🔟','Dezena','10 minis na coleção',mAll.length>=10],
      ['⭐','Meio século','50 minis na coleção',mAll.length>=50],
      ['💯','Centurião','100 minis na coleção',mAll.length>=100],
      ['🗓️','Multi-anos','Minis de 2 anos diferentes',[...new Set(mAll.map(x=>x.year))].length>=2],
      ['🧭','Caçador de lotes','Minis em 5 lotes diferentes',[...new Set(mAll.map(x=>x.year+'|'+x.letter))].length>=5],
      ['📸','Organizador','10 minis com foto',mAll.filter(x=>x.img).length>=10],
      ['👥','Duplicata XP','Tem uma mini duplicada',Object.values(dupes).some(v=>v>1)]
    ];
    const lvlCard='<div class="col-level">'+
      '<div class="lvl-top"><span class="lvl-badge lvl-'+li+'">'+cur[0]+'</span>'+
      '<div class="lvl-info"><b>Nível '+(li+1)+' · '+cur[0]+'</b><small>'+(nxt?xp+' / '+nxt[1]+' XP — faltam '+(nxt[1]-xp)+' XP pra '+nxt[0]:xp+' XP — nível máximo!')+'</small></div></div>'+
      '<div class="lvl-bar"><div class="lvl-fill" style="width:'+pct+'%"></div></div>'+
      '<div class="ach-grid">'+ACH.map(a=>'<div class="ach'+(a[3]?' on':'')+'" title="'+a[2]+'"><span>'+a[0]+'</span><b>'+a[1]+'</b><small>'+(a[3]?'Desbloqueada 🔓':'Bloqueada 🔒')+'</small></div>').join('')+'</div>'+
    '</div>';
    listWrap.innerHTML=
      lvlCard+
      '<div class="sell-stats">'+
        '<div class="sell-stat"><span class="sell-stat-ic" style="background:linear-gradient(135deg,#ffb02e,#f0670a)">'+icon('collection')+'</span><div><small>Minis na coleção</small><b>'+mine().length+'</b></div></div>'+
        '<div class="sell-stat"><span class="sell-stat-ic" style="background:linear-gradient(135deg,#7ab8ff,#3f7fe0)">'+icon('search')+'</span><div><small>Anos</small><b>'+years.length+'</b></div></div>'+
        '<div class="sell-stat"><span class="sell-stat-ic" style="background:linear-gradient(135deg,#5be585,#0fa968)">'+icon('star')+'</span><div><small>Lotes</small><b>'+lotePairs.length+'</b></div></div>'+
      '</div>'+
      '<div class="lot-tabs" style="margin:4px 0 12px">'+[['todos','Todos ('+mine().length+')']].concat(LOT_YEARS.map(y=>[y,y+' ('+mine().filter(x=>String(x.year)===String(y)).length+')'])).map(f=>'<button type="button" class="lot-tab'+(String(fyear)===String(f[0])?' active':'')+'" data-col-year="'+f[0]+'">'+f[1]+'</button>').join('')+'</div>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">'+
        '<input class="form-input" id="colSearch" placeholder="Buscar por nome, número, cor..." value="'+esc(q)+'" style="flex:1;min-width:150px;padding:10px 14px">'+
        '<select class="form-select" id="colLetter" style="width:auto"><option value="todas">Todas as letras</option>'+LOT_LETTERS.map(l=>'<option value="'+l+'"'+(fletter===l?' selected':'')+'>Lote '+l+'</option>').join('')+'</select>'+
        '<select class="form-select" id="colSort" style="width:auto"><option value="new"'+(sort==='new'?' selected':'')+'>Recentes</option><option value="name"'+(sort==='name'?' selected':'')+'>Nome A-Z</option><option value="lot"'+(sort==='lot'?' selected':'')+'>Ano + lote + nº</option></select>'+
      '</div>'+
      (list.length?'<div class="col-grid">'+list.map(x=>'<figure class="col-card">'+
        '<span class="col-num">'+(x.num?'Nº '+x.num:'')+'</span>'+
        (dupes[x.year+'|'+x.letter+'|'+x.num]>1?'<span class="col-qty">×'+dupes[x.year+'|'+x.letter+'|'+x.num]+'</span>':'')+
        '<div class="col-ph">'+(x.img?'<img src="'+x.img+'" alt="'+esc(x.name)+'">':'?')+'</div>'+
        '<figcaption><b>'+esc(x.name)+'</b><small>'+x.year+' · Lote '+x.letter+'</small>'+(x.color?'<small>🎨 '+esc(x.color)+'</small>':'')+(x.note?'<small>📝 '+esc(x.note)+'</small>':'')+
        '<div class="col-actions"><button class="text-button" data-col-edit="'+x.id+'">Editar</button><button class="text-button" data-col-del="'+x.id+'">Excluir</button></div></figcaption>'+
      '</figure>').join('')+'</div>':'<div class="empty-state"><strong>Coleção vazia.</strong><p>Cadastre a primeira mini com o formulário acima — nome, número, ano e lote. Depois é só filtrar e acompanhar tudo!</p></div>');
    listWrap.querySelectorAll('[data-col-year]').forEach(b=>b.onclick=()=>{fyear=b.dataset.colYear;paintList()});
    const si=listWrap.querySelector('#colSearch');si?.addEventListener('input',()=>{q=si.value.trim().toLowerCase();const pos=si.selectionStart;paintList();const si2=root.querySelector('#colSearch');si2?.focus();si2?.setSelectionRange(pos,pos)});
    listWrap.querySelector('#colLetter').onchange=e=>{fletter=e.target.value;paintList()};
    listWrap.querySelector('#colSort').onchange=e=>{sort=e.target.value;paintList()};
    listWrap.querySelectorAll('[data-col-del]').forEach(b=>b.onclick=()=>{const idx=collection.findIndex(x=>x.id===b.dataset.colDel);if(idx>-1){collection.splice(idx,1);persist();toast('Removida da coleção.');paintList()}});
    listWrap.querySelectorAll('[data-col-edit]').forEach(b=>b.onclick=()=>{const x=collection.find(y=>y.id===b.dataset.colEdit);if(!x)return;editing=x.id;img=x.img||null;origImg=x.img||null;curBg=x.bg||'';const f=root.querySelector('#colForm');f.name.value=x.name||'';f.num.value=x.num||'';f.year.value=String(x.year);f.letter.value=String(x.letter);f.color.value=x.color||'';f.cond.value=x.cond||'';f.note.value=x.note||'';root.querySelector('#colImgPrev').innerHTML=img?'<div class="photo-preview"><img src="'+img+'"></div>':'';f.querySelector('button[type=submit]').textContent='Salvar alterações';root.querySelector('#colCancel').hidden=false;location.hash='#colForm';paintList()});
  };
  root.innerHTML=
    '<div class="card" style="max-width:760px;margin-bottom:18px"><h2 class="menu-sec" style="margin:0 0 12px" id="colFormTitle">'+(editing?'Editar mini da coleção':'Adicionar mini à coleção')+'</h2>'+
    '<form id="colForm"><div class="form-grid">'+
      '<div class="form-group"><label class="form-label">Nome do carrinho *</label><input class="form-input" name="name" required maxlength="60" placeholder="Ex.: Hot Wheels Ferrari F40"></div>'+
      '<div class="form-group"><label class="form-label">Nº do carrinho</label><input class="form-input" name="num" type="number" min="1" placeholder="Ex.: 34"></div>'+
      '<div class="form-group"><label class="form-label">Ano</label><select class="form-select" name="year">'+LOT_YEARS.map(y=>'<option value="'+y+'">'+y+'</option>').join('')+'</select></div>'+
      '<div class="form-group"><label class="form-label">Lote</label><select class="form-select" name="letter">'+LOT_LETTERS.map(l=>'<option value="'+l+'">Lote '+l+'</option>').join('')+'</select></div>'+
      '<div class="form-group"><label class="form-label">Cor</label><input class="form-input" name="color" maxlength="40" placeholder="Ex.: Vermelho"></div>'+
      '<div class="form-group"><label class="form-label">Condição</label><select class="form-select" name="cond"><option>Novo</option><option>Como novo</option><option>Bom estado</option><option>Usado</option></select></div>'+
      '<div class="form-group full"><label class="form-label">Observação</label><input class="form-input" name="note" maxlength="80" placeholder="Ex.: presente do meu irmão, card danificado..."></div>'+
      '<div class="form-group full"><label class="form-label">Foto da mini</label>'+
      '<div class="col-photo-tools"><label class="button ghost col-tool-btn">📁 Importar foto<input type="file" id="colImg" accept="image/*" hidden></label>'+
      '<button type="button" class="button ghost col-tool-btn" id="colGoogle">🔍 Buscar no Google</button></div>'+
      '<div class="photo-previews" id="colImgPrev" style="grid-template-columns:96px"></div>'+
      '<div id="colBgTools" class="col-bg-tools" hidden>'+
        '<small class="form-label">Fundo profissional:</small>'+
        '<button type="button" class="chip-btn" data-bg="dark">🖤 Estúdio escuro</button>'+
        '<button type="button" class="chip-btn" data-bg="light">⬜️ Showroom claro</button>'+
        '<button type="button" class="chip-btn" data-bg="gold">🥇 Premium dourado</button>'+
        '<button type="button" class="chip-btn" data-bg="pista">🏁 Pista asfalto</button>'+
        '<button type="button" class="chip-btn" data-bg="orig">📷 Foto original</button>'+
      '</div></div>'+
    '</div><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px"><button class="button primary" style="width:auto" type="submit">'+(editing?'Salvar alterações':'Adicionar à coleção')+'</button>'+
    '<button class="button ghost" style="width:auto" type="button" id="colCancel"'+(editing?'':' hidden')+'>Cancelar edição</button></div></form></div>'+
    '<div class="col-tools"><button class="button ghost" type="button" id="colExport">⬇️ Exportar backup</button><label class="button ghost col-import">⬆️ Importar backup<input type="file" id="colImport" accept=".json" hidden></label></div>'+
    '<div id="colList"></div>';
  const form=root.querySelector('#colForm');
  const paintPrev=()=>{root.querySelector('#colImgPrev').innerHTML=img?'<div class="photo-preview"><img src="'+img+'"></div>':'';const bt=root.querySelector('#colBgTools');if(bt)bt.hidden=!img;root.querySelectorAll('.chip-btn').forEach(b=>b.classList.toggle('active',b.dataset.bg===curBg))};
  root.querySelector('#colImg').addEventListener('change',async e=>{const f=e.target.files[0];if(f){try{img=await compressImage(f);origImg=img;curBg='';paintPrev()}catch{toast('Imagem inválida.')}}});
  root.querySelector('#colGoogle').onclick=()=>{const name=form.name.value.trim();if(!name)return toast('Digite o nome do carrinho primeiro.');window.open('https://www.google.com/search?tbm=isch&q='+encodeURIComponent('Hot Wheels '+name+' miniatura 1:64'),'_blank');toast('Abri a busca de imagens — salve a foto e volte pra importar aqui.')};
  root.querySelectorAll('.chip-btn').forEach(b=>b.onclick=async()=>{
    if(!origImg)return toast('Importe ou busque uma foto primeiro.');
    const style=b.dataset.bg;
    if(style===curBg)return;
    if(style==='orig'&&origImg){img=origImg;curBg='';paintPrev();return}
    try{toast('Aplicando fundo...');img=await applyProBg(origImg,style);curBg=style;paintPrev();toast('Fundo '+({dark:'estúdio escuro',light:'showroom claro',gold:'premium dourado',pista:'pista asfalto'}[style])+' aplicado! ✨')}catch{toast('Não deu pra aplicar o fundo nessa foto.')};
  });
  const resetForm=()=>{editing=null;img=null;origImg=null;curBg='';form.reset();paintPrev();form.querySelector('button[type=submit]').textContent='Adicionar à coleção';root.querySelector('#colCancel').hidden=true;root.querySelector('#colFormTitle').textContent='Adicionar mini à coleção'};
  root.querySelector('#colCancel').onclick=()=>{resetForm();paintList()};
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const d=new FormData(form);
    const name=String(d.get('name')||'').trim();if(!name)return toast('Diga o nome do carrinho.');
    const item={id:editing||('col-'+Date.now()),ownerId:session?.userId||null,name,num:+d.get('num')||null,year:d.get('year'),letter:d.get('letter'),color:String(d.get('color')||'').trim(),cond:d.get('cond'),note:String(d.get('note')||'').trim(),img:img,bg:curBg,addedAt:Date.now()};
    const dupe=collection.find(x=>x.id!==item.id&&String(x.year)===String(item.year)&&String(x.letter)===String(item.letter)&&+x.num===item.num);
    if(editing){const i=collection.findIndex(x=>x.id===editing);if(i>-1)collection[i]=item}else collection.unshift(item);
    persist();sfx.success();
    toast(dupe&&!editing?'Essa mini já estava na coleção — duplicada salva!':'Mini adicionada à coleção! 🎉');
    resetForm();paintList();
  });
  root.querySelector('#colExport').onclick=()=>{const data=mine();if(!data.length)return toast('Sua coleção ainda está vazia.');const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='minha-colecao-miniline-xtreme.json';a.click();toast('Backup da coleção exportado!')};
  root.querySelector('#colImport').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const data=JSON.parse(r.result);if(!Array.isArray(data))throw 0;let n=0;data.forEach(x=>{if(x&&x.name&&!collection.find(y=>y.id===x.id)){collection.push({id:x.id||('col-'+Math.random().toString(36).slice(2)),ownerId:session?.userId||null,name:String(x.name).slice(0,60),num:+x.num||null,year:x.year||LOT_YEARS[0],letter:x.letter||LOT_LETTERS[0],color:String(x.color||''),cond:x.cond||'Novo',note:String(x.note||'').slice(0,80),img:x.img||null,bg:x.bg||'',addedAt:x.addedAt||Date.now()});n++}});persist();paintList();toast(n+' mini(s) importada(s) da cópia!')}catch{toast('Arquivo de backup inválido.')}};r.readAsText(f)});
  paintList();
}

function renderCoupons(){
  const root=document.querySelector('#couponsApp');if(!root)return;
  const list=coupons.filter(c=>c.active);
  root.innerHTML=list.length?'<div class="coupons-grid">'+list.map(c=>`<div class="coupon-card">
      <div class="coupon-left"><span class="coupon-pct">${c.percent}%</span><small>OFF</small></div>
      <div class="coupon-body"><b>${esc(c.code)}</b><p>Desconto de ${c.percent}% no checkout${c.min?` em compras acima de ${money(c.min)}`:''}.</p>
      <button type="button" class="button primary" data-copy="${esc(c.code)}">Copiar código</button></div>
    </div>`).join('')+'</div>':'<div class="empty-state"><strong>Nenhum cupom ativo agora.</strong><p>Quando o MiniLine Xtreme liberar cupons, eles aparecem aqui. Fique de olho nas notificações!</p></div>';
  root.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>{const code=b.dataset.copy;const done=()=>{toast('Código '+code+' copiado! Aplique no checkout.');b.textContent='Copiado ✓';setTimeout(()=>b.textContent='Copiar código',1800)};if(navigator.clipboard?.writeText){navigator.clipboard.writeText(code).then(done).catch(()=>done())}else{done()}});
}

function enhanceLots(){
  const root=document.querySelector('#lotsApp');if(!root)return;
  const data=lots||{};
  let year=LOT_YEARS[0], letter=LOT_LETTERS[0];
  const pics=()=>(data[lotKey(year,letter)]||[]).map(lotEntry);let ftype='todos';
  const paint=()=>{
    root.innerHTML=
      '<div class="lot-tabs" id="lotYearTabs">'+LOT_YEARS.map(y=>'<button type="button" class="lot-tab'+((y===year)?' active':'')+'" data-lot-year="'+y+'">'+y+'</button>').join('')+'</div>'+
      '<div class="lot-tabs lot-letters" id="lotLetterTabs">'+LOT_LETTERS.map(l=>'<button type="button" class="lot-tab lot-letter'+((l===letter)?' active':'')+'" data-lot-letter="'+l+'">'+l+'</button>').join('')+'</div>'+
      window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window.__mlxInstall=e;const b=document.getElementById('installAppBtn');if(b)b.hidden=false});
(function(){const L=pics();const sth=L.filter(x=>x.type==='sth').length,th=L.filter(x=>x.type==='th').length;
    return '<div class="lot-tabs" style="margin-top:12px">'+[['todos','Todos'],['comum','Comum'],['sth','🔥 STH'],['th','TH']].map(f=>'<button type="button" class="lot-tab'+(ftype===f[0]?' active':'')+'" data-lot-type="'+f[0]+'">'+f[1]+'</button>').join('')+'</div>'+
      '<p class="page-subtitle">'+L.length+' foto(s) no lote '+letter+' de '+year+(sth?' · <span class="sth-txt">🔥 '+sth+' STH</span>':'')+(th?' · <span class="th-txt">'+th+' TH</span>':'')+'</p>';})()+
      '<div class="lot-photos">'+(function(){const L2=pics().filter(x=>ftype==='todos'||x.type===ftype);return L2.length?L2.map((e,i)=>'<figure class="lot-photo"><img src="'+e.src+'" alt="Lote '+letter+' de '+year+'">'+(e.type!=='comum'?'<span class="lot-tag '+(e.type==='sth'?'lot-tag-sth':'lot-tag-th')+'">'+(e.type==='sth'?'🔥 STH':'TH')+'</span>':'')+'<figcaption>Lote '+letter+' · '+year+'</figcaption></figure>').join(''):'<div class="empty-state"><strong>'+(ftype==='todos'?'Lote vazio.':'Nenhuma foto deste tipo.')+'</strong><p>'+(ftype==='todos'?'As fotos deste lote aparecem aqui quando o admin publicar.':'Troque o filtro acima para ver as outras fotos.')+'</p></div>'})()+'</div>';
    root.querySelectorAll('[data-lot-year]').forEach(b=>b.onclick=()=>{year=b.dataset.lotYear;paint()});
    root.querySelectorAll('[data-lot-letter]').forEach(b=>b.onclick=()=>{letter=b.dataset.lotLetter;paint()});
    root.querySelectorAll('[data-lot-type]').forEach(b=>b.onclick=()=>{ftype=b.dataset.lotType;paint()});
  };
  paint();
}
  
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

