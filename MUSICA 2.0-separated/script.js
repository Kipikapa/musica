const KEY='musica-v2-library', SETTINGS='musica-v2-api-settings', SPOTIFY_TOKEN='musica-v2-spotify-token';
let items=read(), filter='all', activeTracksId=null;
let apiSettings=readSettings();
function readSettings(){try{return JSON.parse(localStorage.getItem(SETTINGS)||'{}')}catch{return {}}}
function saveApiSettings(){localStorage.setItem(SETTINGS,JSON.stringify(apiSettings))}
function redirectUri(){return location.origin==='null'?'':location.origin+location.pathname}
const $=id=>document.getElementById(id);
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return []}}
function persist(){localStorage.setItem(KEY,JSON.stringify(items));stats()}
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function initials(s){return esc(s.split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase())}
function stats(){$('total').textContent=items.length;$('favs').textContent=items.filter(x=>x.favorite).length;$('platforms').textContent=new Set(items.map(x=>x.platform)).size;$('statusText').textContent=items.length?`${items.length} playlists collected`:'Ready for your music.';$('statusSub').textContent=items.length?'Your music universe is growing.':'Add your first playlist to get started.'}
function render(){
 const q=$('search').value.toLowerCase().trim();
 const list=items.filter(p=>{
  const matches=[p.name,p.genre,p.platform,p.note].join(' ').toLowerCase().includes(q);
  const platformMatch=filter==='all'||(filter==='favorite'?p.favorite:filter==='other'? !['Spotify','YouTube Music'].includes(p.platform):p.platform===filter);
  return matches&&platformMatch;
 });
 $('sectionTitle').textContent=filter==='favorite'?'Your favorites':filter==='all'?'Your collection':filter==='other'?'Other platforms':filter;
 $('countLabel').textContent=`${list.length} ${list.length===1?'playlist':'playlists'}`;
 $('grid').innerHTML=list.length?list.map(p=>`<article class="card">
 <div class="cover">${p.cover?`<img src="${esc(p.cover)}" alt="" onerror="this.remove()">`:`<div class="cover-letter">${initials(p.name)}</div>`}<span class="platform">${esc(p.platform)}</span><button class="heart ${p.favorite?'on':''}" data-action="fav" data-id="${p.id}">${p.favorite?'♥':'♡'}</button></div>
 <div class="card-info"><div class="card-title" title="${esc(p.name)}">${esc(p.name)}</div><div class="card-note">${esc(p.note||p.genre||'Your personal soundtrack')}</div>
 <div class="card-bottom"><span class="genre">${esc(p.genre||'Unsorted')}</span><div class="card-actions"><button class="tiny" title="Edit" data-action="edit" data-id="${p.id}">✎</button><button class="tiny" title="Delete" data-action="delete" data-id="${p.id}">⌫</button><button class="tracks-btn" data-action="tracks" data-id="${p.id}">TRACKS ☷</button><button class="play" data-action="play" data-id="${p.id}">PLAY ▶</button></div></div></div></article>`).join(''):`<div class="empty"><strong>No playlists found</strong>${q?'Coba kata kunci lain.':'Tambahkan playlist pertamamu dan mulai bangun library musikmu.'}</div>`;
 stats();
}
function modal(p=null){$('form').reset();$('itemId').value=p?.id||'';$('modalTitle').textContent=p?'Edit playlist':'Add a playlist';if(p){$('name').value=p.name;$('platform').value=p.platform;$('genre').value=p.genre||'';$('url').value=p.url;$('cover').value=p.cover||'';$('note').value=p.note||'';$('tracks').value=Array.isArray(p.tracks)?p.tracks.map(t=>typeof t==='string'?t:[t.title,t.artist].filter(Boolean).join(' — ')).join('\n'):''}$('backdrop').classList.add('show');$('name').focus()}
function closeModal(){$('backdrop').classList.remove('show')}
function toast(s){$('toast').textContent=s;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2200)}
function validUrl(raw){try{const u=new URL(raw);return ['http:','https:'].includes(u.protocol)?u:null}catch{return null}}
function embedFor(p){
 const u=validUrl(p.url);if(!u)return null;const host=u.hostname.replace(/^www\./,'');
 if(host==='open.spotify.com'||host==='play.spotify.com'){const path=u.pathname.replace(/^\/embed/,'');return `https://open.spotify.com/embed${path}${u.search}`}
 if(host==='music.youtube.com'||host==='youtube.com'||host==='m.youtube.com'||host==='youtu.be'){
   const list=u.searchParams.get('list');const video=u.searchParams.get('v')||(host==='youtu.be'?u.pathname.slice(1):'');
   if(list)return `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(list)}`;
   if(video)return `https://www.youtube.com/embed/${encodeURIComponent(video)}`;
 }
 if(host==='music.apple.com'){return `https://embed.music.apple.com${u.pathname}${u.search}`}
 if(host==='soundcloud.com'||host==='m.soundcloud.com')return `https://w.soundcloud.com/player/?url=${encodeURIComponent(u.href)}&color=%23c1f477&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true`;
 return null;
}
function normalizeTrack(t){return typeof t==='string'?{title:t,artist:'',url:''}:{title:String(t.title||'Unknown track'),artist:String(t.artist||''),url:String(t.url||'')}}
function renderTracks(p){
 const tracks=Array.isArray(p.tracks)?p.tracks.map(normalizeTrack):[];
 $('tracksSubtitle').textContent=`${tracks.length} ${tracks.length===1?'lagu':'lagu'} · ${p.platform}`;
 $('tracksList').innerHTML=tracks.length?tracks.map((raw,i)=>{const t=normalizeTrack(raw);return `<div class="track-item"><span class="track-number">${String(i+1).padStart(2,'0')}</span><div class="track-main"><div class="track-title">${esc(t.title)}</div>${t.artist?`<div class="track-artist">${esc(t.artist)}</div>`:''}</div>${t.url?`<a class="track-link" href="${esc(t.url)}" target="_blank" rel="noopener">Open ↗</a>`:''}</div>`}).join(''):'<div class="track-empty">Daftar lagu belum tersedia. Periksa pengaturan API, lalu tekan Refresh daftar lagu.</div>';
}
async function showTracks(p){activeTracksId=p.id;$('tracksTitle').textContent=p.name;renderTracks(p);$('tracksBackdrop').classList.add('show');if(!Array.isArray(p.tracks)||!p.tracks.length)await syncPlaylistTracks(p,false)}
function closeTracks(){$('tracksBackdrop').classList.remove('show')}
function parseSpotifyPlaylistId(raw){try{const u=new URL(raw);if(!u.hostname.endsWith('spotify.com'))return null;const m=u.pathname.match(/\/playlist\/([A-Za-z0-9]+)/);return m?m[1]:null}catch{return null}}
function parseYouTubePlaylistId(raw){try{const u=new URL(raw);if(!['youtube.com','www.youtube.com','music.youtube.com','m.youtube.com'].includes(u.hostname)&&!u.hostname.endsWith('.youtube.com'))return null;return u.searchParams.get('list')}catch{return null}}
function base64url(bytes){return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
async function sha256(text){return await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))}
function randomString(n=64){const a=new Uint8Array(n);crypto.getRandomValues(a);return Array.from(a,b=>('0'+b.toString(16)).slice(-2)).join('')}
function readSpotifyToken(){try{return JSON.parse(localStorage.getItem(SPOTIFY_TOKEN)||'null')}catch{return null}}
function storeSpotifyToken(t){localStorage.setItem(SPOTIFY_TOKEN,JSON.stringify(t))}
async function spotifyLogin(){
 if(!apiSettings.spotifyClientId){toast('Isi Spotify Client ID di API Setup.');return}
 const uri=redirectUri();if(!uri){toast('Buka MUSICA melalui localhost atau HTTPS, bukan file://');return}
 const verifier=randomString(48),state=randomString(16),challenge=base64url(await sha256(verifier));
 localStorage.setItem('musica-pkce-verifier',verifier);localStorage.setItem('musica-pkce-state',state);
 const params=new URLSearchParams({client_id:apiSettings.spotifyClientId,response_type:'code',redirect_uri:uri,code_challenge_method:'S256',code_challenge:challenge,state,scope:'playlist-read-private playlist-read-collaborative'});
 location.href='https://accounts.spotify.com/authorize?'+params.toString();
}
async function spotifyTokenFromCode(){
 const params=new URLSearchParams(location.search),code=params.get('code');if(!code)return;
 const state=params.get('state'),expected=localStorage.getItem('musica-pkce-state'),verifier=localStorage.getItem('musica-pkce-verifier');
 if(!state||state!==expected||!verifier){toast('Autentikasi Spotify gagal: state tidak cocok.');history.replaceState({},'',location.pathname);return}
 try{const body=new URLSearchParams({client_id:apiSettings.spotifyClientId,grant_type:'authorization_code',code,redirect_uri:redirectUri(),code_verifier:verifier});const r=await fetch('https://accounts.spotify.com/api/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});const d=await r.json();if(!r.ok)throw Error(d.error_description||d.error||'Token gagal');storeSpotifyToken({access_token:d.access_token,refresh_token:d.refresh_token,expires_at:Date.now()+d.expires_in*1000});toast('Spotify berhasil dihubungkan!');
 }catch(e){toast('Spotify: '+e.message)}finally{localStorage.removeItem('musica-pkce-verifier');localStorage.removeItem('musica-pkce-state');history.replaceState({},'',location.pathname);}
}
async function spotifyAccessToken(){let t=readSpotifyToken();if(!t)return null;if(t.expires_at>Date.now()+60000)return t.access_token;if(!t.refresh_token)return null;
 const body=new URLSearchParams({client_id:apiSettings.spotifyClientId,grant_type:'refresh_token',refresh_token:t.refresh_token});const r=await fetch('https://accounts.spotify.com/api/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});const d=await r.json();if(!r.ok)throw Error(d.error_description||d.error||'Token Spotify kedaluwarsa');t={...t,access_token:d.access_token,expires_at:Date.now()+d.expires_in*1000,refresh_token:d.refresh_token||t.refresh_token};storeSpotifyToken(t);return t.access_token}
async function fetchSpotifyTracks(p){const id=parseSpotifyPlaylistId(p.url);if(!id)throw Error('Link Spotify bukan playlist yang dikenali.');const token=await spotifyAccessToken();if(!token)throw Error('Hubungkan akun Spotify melalui API Setup terlebih dahulu.');let url=`https://api.spotify.com/v1/playlists/${id}/items?limit=50`;const tracks=[];while(url){const r=await fetch(url,{headers:{Authorization:'Bearer '+token}});const d=await r.json();if(!r.ok)throw Error(d.error?.message||'Gagal membaca playlist Spotify.');for(const row of d.items||[]){const x=row.item||row.track;if(x?.name)tracks.push({title:x.name,artist:(x.artists||[]).map(a=>a.name).join(', '),url:x.external_urls?.spotify||''})}url=d.next}return tracks}
async function fetchYouTubeTracks(p){const id=parseYouTubePlaylistId(p.url);if(!id)throw Error('URL YouTube Music harus berupa link playlist dengan parameter list=.');if(!apiSettings.youtubeApiKey)throw Error('Masukkan YouTube Data API key melalui API Setup.');let pageToken='',tracks=[];do{const q=new URLSearchParams({part:'snippet',playlistId:id,maxResults:'50',key:apiSettings.youtubeApiKey});if(pageToken)q.set('pageToken',pageToken);const r=await fetch('https://www.googleapis.com/youtube/v3/playlistItems?'+q);const d=await r.json();if(!r.ok)throw Error(d.error?.message||'Gagal membaca playlist YouTube.');for(const row of d.items||[]){const sn=row.snippet||{};if(sn.title&&sn.title!=='Private video'&&sn.title!=='Deleted video')tracks.push({title:sn.title,artist:sn.videoOwnerChannelTitle||sn.channelTitle||'',url:sn.resourceId?.videoId?'https://www.youtube.com/watch?v='+sn.resourceId.videoId:''})}pageToken=d.nextPageToken||''}while(pageToken);return tracks}
async function syncPlaylistTracks(p,quiet=false){try{let tracks;if(p.platform==='Spotify'||parseSpotifyPlaylistId(p.url))tracks=await fetchSpotifyTracks(p);else if(['YouTube Music','YouTube'].includes(p.platform)||parseYouTubePlaylistId(p.url))tracks=await fetchYouTubeTracks(p);else throw Error('Sinkronisasi otomatis hanya tersedia untuk Spotify dan YouTube Music.');p.tracks=tracks;persist();render();if(activeTracksId===p.id)renderTracks(p);if(!quiet)toast(`${tracks.length} lagu berhasil disinkronkan.`);return true}catch(e){if(!quiet)toast(e.message);if(activeTracksId===p.id)$('tracksList').innerHTML=`<div class="track-empty">${esc(e.message)}</div>`;return false}}
function openSettings(){ $('spotifyClientId').value=apiSettings.spotifyClientId||'';$('youtubeApiKey').value=apiSettings.youtubeApiKey||'';$('redirectUriDisplay').value=redirectUri()||'Gunakan localhost atau hosting HTTPS';$('settingsBackdrop').classList.add('show') }
function closeSettings(){ $('settingsBackdrop').classList.remove('show') }
function play(p){
 const src=embedFor(p);$('playerTitle').textContent=p.name;$('playerPlatform').textContent=p.platform;
 $('embed').innerHTML=src?`<iframe src="${esc(src)}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" title="${esc(p.name)}"></iframe>`:`<div style="padding:28px;text-align:center;color:#aab0bd;font-size:12px">Embedded player belum tersedia untuk link ini.<br><a href="${esc(p.url)}" target="_blank" rel="noopener" style="display:inline-block;margin-top:12px;color:#c1f477">Open on ${esc(p.platform)} ↗</a></div>`;
 $('player').classList.add('show');$('player').scrollIntoView({behavior:'smooth',block:'nearest'});
}
$('addBtn').onclick=()=>modal();$('close').onclick=closeModal;$('cancel').onclick=closeModal;$('backdrop').onclick=e=>{if(e.target===$('backdrop'))closeModal()};
$('search').addEventListener('input',render);$('filters').onclick=e=>{const b=e.target.closest('[data-filter]');if(!b)return;filter=b.dataset.filter;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===b));render()};
$('grid').onclick=e=>{const b=e.target.closest('[data-action]');if(!b)return;const p=items.find(x=>x.id===b.dataset.id);if(!p)return;
 if(b.dataset.action==='fav'){p.favorite=!p.favorite;persist();render()}
 if(b.dataset.action==='edit')modal(p);
 if(b.dataset.action==='delete'&&confirm(`Hapus "${p.name}" dari library?`)){items=items.filter(x=>x.id!==p.id);persist();render();toast('Playlist deleted')}
 if(b.dataset.action==='play')play(p);
  if(b.dataset.action==='tracks')showTracks(p);
};
$('form').onsubmit=e=>{e.preventDefault();const url=$('url').value.trim();if(!validUrl(url)){toast('Masukkan URL playlist yang valid.');return}
 const id=$('itemId').value;const old=items.find(x=>x.id===id);const p={id:id||'m'+Date.now(),name:$('name').value.trim(),platform:$('platform').value,genre:$('genre').value.trim(),url,cover:$('cover').value.trim(),note:$('note').value.trim(),tracks:$('tracks').value.trim()?$('tracks').value.split(/\r?\n/).map(t=>t.trim()).filter(Boolean):(old?.tracks||[]),favorite:old?.favorite||false};
 if(id)items=items.map(x=>x.id===id?p:x);else items.unshift(p);persist();render();closeModal();toast(id?'Playlist updated!':'Playlist added!');if(parseSpotifyPlaylistId(p.url)||parseYouTubePlaylistId(p.url))syncPlaylistTracks(p,true)};
$('closePlayer').onclick=()=>{$('embed').innerHTML='';$('player').classList.remove('show')};
 $('closeTracks').onclick=closeTracks;$('closeTracksBottom').onclick=closeTracks;$('tracksBackdrop').onclick=e=>{if(e.target===$('tracksBackdrop'))closeTracks()};$('refreshTracks').onclick=()=>{const p=items.find(x=>x.id===activeTracksId);if(p)syncPlaylistTracks(p,false)};
 $('settingsBtn').onclick=openSettings;$('closeSettings').onclick=closeSettings;$('cancelSettings').onclick=closeSettings;$('settingsBackdrop').onclick=e=>{if(e.target===$('settingsBackdrop'))closeSettings()};$('saveSettings').onclick=()=>{apiSettings={spotifyClientId:$('spotifyClientId').value.trim(),youtubeApiKey:$('youtubeApiKey').value.trim()};saveApiSettings();closeSettings();toast('Pengaturan API disimpan.');};$('connectSpotify').onclick=()=>{apiSettings={spotifyClientId:$('spotifyClientId').value.trim(),youtubeApiKey:$('youtubeApiKey').value.trim()};saveApiSettings();spotifyLogin()};$('disconnectSpotify').onclick=()=>{localStorage.removeItem(SPOTIFY_TOKEN);toast('Akun Spotify diputuskan.');};
$('exportBtn').onclick=()=>{const blob=new Blob([JSON.stringify({app:'MUSICA',version:2,exportedAt:new Date().toISOString(),playlists:items},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='musica-backup.json';a.click();URL.revokeObjectURL(a.href);toast('Backup exported!')};
$('importBtn').onclick=()=>$('fileInput').click();
$('fileInput').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());const incoming=Array.isArray(data)?data:data.playlists;if(!Array.isArray(incoming))throw Error('invalid');if(!confirm(`Import ${incoming.length} playlist? Data library saat ini akan diganti.`))return;items=incoming.filter(p=>p&&p.name&&p.url&&validUrl(p.url)).map(p=>({id:String(p.id||'m'+Math.random().toString(36).slice(2)),name:String(p.name),platform:String(p.platform||'Other'),genre:String(p.genre||''),url:String(p.url),cover:String(p.cover||''),note:String(p.note||''),tracks:Array.isArray(p.tracks)?p.tracks.map(t=>typeof t==='string'?t:{title:String(t.title||''),artist:String(t.artist||''),url:String(t.url||'')}):[],favorite:Boolean(p.favorite)}));persist();render();toast('Backup imported!')}catch{toast('File backup tidak valid.')}e.target.value=''};
render();
spotifyTokenFromCode();
