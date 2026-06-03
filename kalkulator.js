/* ── CONSTANTS & DATA (original engineer code — unchanged) ── */
  const aquachemModels_shoulder = [
    {model:'IBC07',naziv:'Ivapool IBC07',snaga:5.3},
    {model:'IBC09',naziv:'Ivapool IBC09',snaga:6.6},
    {model:'MSC110',naziv:'Mr. Silence',snaga:7.7},
    {model:'IBC11',naziv:'Ivapool IBC11',snaga:7.8},
    {model:'MSC130',naziv:'Mr. Silence',snaga:9.0},
    {model:'IBC14',naziv:'Ivapool IBC14',snaga:9.8},
    {model:'MSC150',naziv:'Mr. Silence',snaga:10.5},
    {model:'IBC18',naziv:'Ivapool IBC18',snaga:12.4},
    {model:'MSC170',naziv:'Mr. Silence',snaga:12.5},
    {model:'MSC210',naziv:'Mr. Silence',snaga:14.5},
    {model:'MSC280',naziv:'Mr. Silence',snaga:19.0},
    {model:'MSC350S',naziv:'Mr. Silence',snaga:24.2},
    {model:'IM60',naziv:'Invermax IM60',snaga:40.1},
    {model:'IM110',naziv:'Invermax IM110',snaga:80.8},
  ];
  const aquachemModels_summer = [
    {model:'IBC07',naziv:'Ivapool IBC07',snaga:7.5},
    {model:'IBC09',naziv:'Ivapool IBC09',snaga:9.5},
    {model:'MSC110',naziv:'Mr. Silence',snaga:11.0},
    {model:'IBC11',naziv:'Ivapool IBC11',snaga:11.0},
    {model:'MSC130',naziv:'Mr. Silence',snaga:13.0},
    {model:'IBC14',naziv:'Ivapool IBC14',snaga:14.0},
    {model:'MSC150',naziv:'Mr. Silence',snaga:15.0},
    {model:'IBC18',naziv:'Ivapool IBC18',snaga:18.0},
    {model:'MSC170',naziv:'Mr. Silence',snaga:17.5},
    {model:'MSC210',naziv:'Mr. Silence',snaga:21.0},
    {model:'MSC280',naziv:'Mr. Silence',snaga:28.0},
    {model:'MSC350S',naziv:'Mr. Silence',snaga:35.2},
    {model:'IM60',naziv:'Invermax IM60',snaga:60.2},
    {model:'IM110',naziv:'Invermax IM110',snaga:115.0},
  ];
  function getModels(){ return val('periodKoristenja')==='summer' ? aquachemModels_summer : aquachemModels_shoulder; }
  const filterCatalog=[{flow:10,diameterMm:500},{flow:15,diameterMm:600},{flow:24,diameterMm:750},{flow:32,diameterMm:900}];
  const K=2.07, Q_ISP=2440, C_WATER=4.187, HOURS_FILTER=6, SOIL_FALLBACK=12;

  const regionSoilTemps = {
    zagreb:   { shoulder: 8.6,  summer: 23.1 },
    osijek:   { shoulder: 9.5,  summer: 23.0 },
    delnice:  { shoulder: 5.6,  summer: 19.1 },
    gospic:   { shoulder: 6.6,  summer: 17.2 },
    rijeka:   { shoulder: 11.8, summer: 23.4 },
    pula:     { shoulder: 13.5, summer: 26.1 },
    zadar:    { shoulder: 13.4, summer: 25.2 },
    split:    { shoulder: 14.1, summer: 26.8 },
    dubrovnik:{ shoulder: 13.9, summer: 26.3 },
  };

  const regionLabels = {
    zagreb:   'Kontinentalna Hrvatska (Zagreb)',
    osijek:   'Slavonija i Baranja (Osijek)',
    delnice:  'Gorska Hrvatska — Sjever (Delnice)',
    gospic:   'Gorska Hrvatska — Jug (Gospić)',
    rijeka:   'Primorje (Rijeka)',
    pula:     'Istra (Pula)',
    zadar:    'Dalmacija Sjeverna (Zadar)',
    split:    'Dalmacija Srednja (Split)',
    dubrovnik:'Dalmacija Južna (Dubrovnik)',
  };

  function updateSoilTempFromRegion(){
    const region = val('regionBazena');
    const period = val('periodKoristenja');
    if(!region){
      $('temperaturaTla').value = SOIL_FALLBACK.toFixed(1);
      $('izvorTemperatureTla').value = 'Nije odabrana regija';
      setStatus('Odaberite regiju bazena.', 'Spremno');
      return;
    }
    const temps = regionSoilTemps[region];
    const temp = period === 'summer' ? temps.summer : temps.shoulder;
    $('temperaturaTla').value = temp.toFixed(1);
    $('izvorTemperatureTla').value = regionLabels[region] + ' · ' + (period === 'summer' ? 'ljetni period' : 'rano proljeće i kasna jesen');
    setStatus('Temperatura tla postavljena prema regiji: ' + regionLabels[region], 'Gotovo');
  }
  const $=id=>document.getElementById(id);
  const num=id=>parseFloat($(id).value)||0;
  const val=id=>$(id).value.trim();
  const fmt=(v,d=2)=>new Intl.NumberFormat('hr-HR',{minimumFractionDigits:d,maximumFractionDigits:d}).format(v);

  /* ── VOLUME DISPLAY (new UI helper) ── */
  function updateVolumeDisplay(){
    const oblik = val('oblikBazena');
    let vol = 0;
    if(oblik==='regular'){
      const s=num('sirina'), d=num('duzina'), db=num('dubinaRegular');
      if(s>0&&d>0&&db>0) vol=s*d*db;
    } else {
      const p=num('povrsinaIrregular'), db=num('dubinaIrregular');
      if(p>0&&db>0) vol=p*db;
    }
    $('volumeDisplay').textContent = vol>0 ? fmt(vol,1)+' m³' : '— m³';
  }

  /* ── STATUS ── */
  function setStatus(text, badge='Gotovo'){
    // Show status text in the info box
    const infoEl = $('infoIzvor');
    if(infoEl) infoEl.textContent = text;
    const el = $('statusBadge');
    if(!el) return;
    el.textContent = badge;
    el.className = 'badge';
    if(badge==='Gotovo'||badge==='Spremno') el.classList.add('ok');
    else if(badge==='Greška'||badge==='Fallback') el.classList.add('error');
    else el.classList.add('warn');
  }

  /* ── BLINK VALIDATION (original engineer code — unchanged) ── */
  function oznaciPraznaPolja(){
    let prazno=false;
    document.querySelectorAll('input:not([readonly]):not([type="hidden"]), select').forEach(el=>{
      if(el.offsetParent===null) return;
      if(!el.value||el.value.trim()===''){
        el.classList.add('blink');
        prazno=true;
        setTimeout(()=>{ el.classList.remove('blink'); },2000);
      }
    });
    return prazno;
  }

  /* ── RENDER ROWS (original engineer code — unchanged) ── */
  function renderRows(rows){ document.querySelector('#rezultatTablica tbody').innerHTML=rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join(''); }

  /* ── CHOOSE PUMP (original engineer code — unchanged) ── */
  function choosePump(requiredKw){
    const models=getModels();
    const single=models.find(p=>p.snaga>=requiredKw);
    if(single) return {type:'single',pumps:[single],totalPower:single.snaga};
    let bestCombo=null;
    for(let i=0;i<models.length;i++){
      for(let j=i;j<models.length;j++){
        const sum=models[i].snaga+models[j].snaga;
        if(sum>=requiredKw){
          if(!bestCombo||sum<bestCombo.totalPower){
            bestCombo={type:'double',pumps:[models[i],models[j]],totalPower:sum};
          }
        }
      }
    }
    return bestCombo;
  }

  /* ── NEAREST FILTER (original engineer code — unchanged) ── */
  function nearestFilter(flowNeeded){ return filterCatalog.reduce((best,item)=>{ const d=Math.abs(item.flow-flowNeeded), bd=Math.abs(best.flow-flowNeeded); if(d<bd) return item; if(d===bd&&item.flow>=flowNeeded&&best.flow<flowNeeded) return item; return best; },filterCatalog[0]); }

  /* ── RENDER CATALOG (adapted for new UI rows) ── */
  const productUrls = {
    'IBC07':  'https://webshop.aquachem.hr/proizvod/24020-toplinska-pumpa-ivapool-75-kw/',
    'IBC09':  'https://webshop.aquachem.hr/proizvod/24021-toplinska-pumpa-ivapool-95-kw/',
    'MSC110': 'https://webshop.aquachem.hr/proizvod/2865-toplinska-pumpa-11-kw-za-bazene-volumena-30-55-m3-vode-temperatura-zraka-27c/',
    'IBC11':  'https://webshop.aquachem.hr/proizvod/24022-toplinska-pumpa-ivapool-11-kw/',
    'MSC130': 'https://webshop.aquachem.hr/proizvod/2308-toplinska-pumpa-13-kw-za-bazene-volumena-35-65-m3-temperatura-zraka-27c-tem/',
    'IBC14':  'https://webshop.aquachem.hr/proizvod/24023-toplinska-pumpa-ivapool-14-kw/',
    'MSC150': 'https://webshop.aquachem.hr/proizvod/2309-toplinska-pumpa-15-kw-za-bazene-volumena-40-70-m3-vode-temperatura-zraka-27c/',
    'IBC18':  'https://webshop.aquachem.hr/proizvod/24024-toplinska-pumpa-ivapool-18-kw/',
    'MSC170': 'https://webshop.aquachem.hr/proizvod/2310-toplinska-pumpa-175-kw-za-bazene-volumena-40-80-m3-vode-temperatura-zraka-27/',
    'MSC210': 'https://webshop.aquachem.hr/proizvod/2311-toplinska-pumpa-21-kw-za-bazene-volumena-50-95-m3-vode-temperatura-zraka-27c/',
    'MSC280': 'https://webshop.aquachem.hr/proizvod/2312-toplinska-pumpa-28-kw-za-bazene-volumena-60-120-m3-vode-temperatura-zraka-27c/',
    'MSC350S':'https://webshop.aquachem.hr/proizvod/2866-toplinska-pumpa-35-kw-3f-za-bazene-volumena-85-160-m3-temperatura-zraka-27c/',
    'IM60':   'https://webshop.aquachem.hr/proizvod/20954-toplinska-pumpa-invermax-t1-60-kw/',
    'IM110':  'https://webshop.aquachem.hr/proizvod/20953-toplinska-pumpa-invermax-t1-115-kw/',
  };

  function renderCatalog(requiredKw, selected){
    if(!selected){
      $('catalogBody').innerHTML = '<div style="padding:20px 8px;text-align:center;font-size:13px;color:var(--muted);">Pokrenite izračun za preporuku modela.</div>';
      return;
    }
    $('catalogBody').innerHTML = selected.pumps.map(p=>{
      const url = productUrls[p.model];
      const btnHtml = url
        ? `<a href="${url}" target="_blank" rel="noopener" style="
            display:inline-flex; align-items:center; gap:6px;
            background:#fff; color:#1D1D1F; text-decoration:none;
            font-size:12px; font-weight:700; padding:6px 12px;
            border-radius:999px; margin-top:10px; transition:opacity .15s;
            white-space:nowrap;"
            onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Pogledaj u webshop
          </a>`
        : '';
      return `<div class="catalog-row highlighted" style="display:flex;flex-direction:column;align-items:flex-start;padding:14px 12px;">
        <div style="display:grid;grid-template-columns:90px 1fr 60px 110px;width:100%;align-items:center;">
          <span class="model-id">${p.model}</span>
          <span class="model-name" style="color:rgba(255,255,255,0.7)">${p.naziv}</span>
          <span style="text-align:right;font-weight:600;">${fmt(p.snaga)} kW</span>
          <span style="text-align:right;"><span class="pill ok">Preporučeno</span></span>
        </div>
        ${btnHtml}
      </div>`;
    }).join('');
  }

  /* ── UPDATE SHAPE FIELDS (original engineer code — unchanged) ── */
  function updateShapeFields(){
    const regular=val('oblikBazena')==='regular';
    $('regularFields').classList.toggle('hidden',!regular);
    $('irregularFields').classList.toggle('hidden',regular);
    updateVolumeDisplay();
  }

  /* ── LOCATION HELPERS (original engineer code — unchanged) ── */
  function normalizeLocationVariants(input){ const raw=input.trim(); if(!raw) return []; const variants=new Set([raw]); variants.add(raw.replace(/\s*-\s*/g,' ')); variants.add(raw.replace(/\s+/g,'-')); variants.add(raw.replace(/-/g,' ')); return Array.from(variants).filter(Boolean); }
  function getSeasonRanges(period){ const year=new Date().getFullYear()-1; if(period==='summer') return [{label:'Ljetni period',start:`${year}-06-01`,end:`${year}-08-31`}]; return [{label:'Rano proljeće',start:`${year}-03-01`,end:`${year}-03-10`},{label:'Kasna jesen',start:`${year}-09-15`,end:`${year}-11-15`}]; }
  async function geocodeLocation(query){ const variants=normalizeLocationVariants(query); let lastError=null; for(const q of variants){ try{ const url=`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=hr&format=json`; const response=await fetch(url); if(!response.ok) throw new Error('Greška pri geokodiranju lokacije.'); const data=await response.json(); if(data&&data.results&&data.results.length){ return data.results.find(r=>(r.name||'').toLowerCase()===q.toLowerCase())||data.results[0]; } }catch(err){ lastError=err; } } throw lastError||new Error('Lokacija nije pronađena.'); }
  async function fetchSoilTempAverage(lat,lon,startDate,endDate){ const url=`https://archive-api.open-meteo.com/v1/archive?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&start_date=${startDate}&end_date=${endDate}&daily=soil_temperature_7_to_28cm_mean&timezone=auto`; const response=await fetch(url); if(!response.ok) throw new Error('Neuspješno dohvaćanje temperature tla.'); const data=await response.json(); const arr=(data&&data.daily&&data.daily.soil_temperature_7_to_28cm_mean)||[]; const valid=arr.filter(v=>typeof v==='number'&&!Number.isNaN(v)); if(!valid.length) throw new Error('Za lokaciju nema dostupnih podataka o temperaturi tla.'); return valid.reduce((a,b)=>a+b,0)/valid.length; }

  /* ── DOHVATI TEMPERATURU TLA (original engineer code — unchanged) ── */
  async function dohvatiTemperaturuTla(){
    const location = val('lokacijaBazena');
    const period = val('periodKoristenja');
    if(!location){
      setStatus('Unesi lokaciju bazena prije dohvaćanja temperature tla.','Greška');
      return SOIL_FALLBACK;
    }
    setStatus('Dohvaćam temperaturu tla prema lokaciji i periodu...','Radim');
    try{
      console.log('[AquaHeat] Geocoding:', location);
      const geo = await geocodeLocation(location);
      console.log('[AquaHeat] Geo result:', geo);
      const ranges = getSeasonRanges(period);
      console.log('[AquaHeat] Date ranges:', ranges);
      const values = [];
      for(const range of ranges){
        const v = await fetchSoilTempAverage(geo.latitude, geo.longitude, range.start, range.end);
        console.log('[AquaHeat] Soil temp for', range.label, ':', v);
        values.push(v);
      }
      const avg = values.reduce((a,b)=>a+b,0)/values.length;
      $('temperaturaTla').value = avg.toFixed(1);
      $('izvorTemperatureTla').value = `${geo.name}${geo.admin1?', '+geo.admin1:''} · ${period==='summer'?'ljetni period':'rano proljeće i kasna jesen'}`;
      setStatus(`Temperatura tla dohvaćena za lokaciju ${geo.name}.`,'Gotovo');
      return avg;
    }catch(err){
      console.error('[AquaHeat] dohvatiTemperaturuTla error:', err);
      $('temperaturaTla').value = SOIL_FALLBACK.toFixed(1);
      $('izvorTemperatureTla').value = 'Fallback 12 °C';
      setStatus('Greška: ' + (err.message || err), 'Greška');
      return SOIL_FALLBACK;
    }
  }

  /* ── IZRAČUNAJ (original engineer code — unchanged) ── */
  function izracunaj(){ try{
    if(oznaciPraznaPolja()){ setStatus('Neka polja nisu unesena!','Greška'); return; }
    const oblik=val('oblikBazena'), tip=val('tipBazena'), sustav=val('sustavBazena'), temperaturaVode=num('temperaturaVode'), customVrijeme=num('customVrijemeZagrijavanja');
    if(temperaturaVode<=0) throw new Error('Unesi željenu temperaturu vode.');
    if(customVrijeme<=0) throw new Error('Vrijeme početnog zagrijavanja mora biti veće od 0 h.');
    let povrsina=0, opseg=0, dubina=0;
    if(oblik==='regular'){ const sirina=num('sirina'), duzina=num('duzina'); dubina=num('dubinaRegular'); if(sirina<=0||duzina<=0||dubina<=0) throw new Error('Unesi širinu, dužinu i dubinu pravilnog bazena.'); povrsina=sirina*duzina; opseg=2*(sirina+duzina); } else { povrsina=num('povrsinaIrregular'); dubina=num('dubinaIrregular'); if(povrsina<=0||dubina<=0) throw new Error('Unesi površinu i dubinu nepravilnog bazena.'); opseg=4*Math.sqrt(povrsina); }
    let temperaturaTla=num('temperaturaTla'); if(!temperaturaTla){ throw new Error('Odaberi regiju bazena kako bi se postavila temperatura tla.'); } if(temperaturaVode<=temperaturaTla) throw new Error('Željena temperatura vode mora biti veća od temperature tla.');
    let volumen=povrsina*dubina; const volumenOsnovni=volumen; if(sustav==='overflow') volumen*=1.10; const brojKupaca=povrsina/2.7, povrsinaZidova=opseg*dubina; let isparavanje=0.3; if(tip==='closed') isparavanje=0.2; if(tip==='windy') isparavanje=0.4; const deltaT=temperaturaVode-temperaturaTla;
    const Qg_kW=((povrsina+povrsinaZidova)*K*deltaT)/1000; let Qi_kW=(isparavanje*povrsina*Q_ISP)/3600; if(val('pokrivkaBazena')==='yes') Qi_kW*=0.60;
    const flowNeeded=volumen/5; const filter=nearestFilter(flowNeeded); const diameterM=filter.diameterMm/1000; const filterArea=Math.PI*Math.pow(diameterM,2)/4; const backwashVolumeM3=filterArea*4; const backwashWaterKg=backwashVolumeM3*1000; const Qpr_kW=(backwashWaterKg*C_WATER*deltaT/HOURS_FILTER)/3600;
    const Qnormal_kW=Qg_kW+Qi_kW+Qpr_kW; const energyToHeat_kWh=(volumen*1000*C_WATER*deltaT)/3600; const autoStartHours=energyToHeat_kWh/Qnormal_kW; const QstartCustom_kW=energyToHeat_kWh/customVrijeme; const Qrequired_kW=Math.max(Qnormal_kW,QstartCustom_kW); const selected=choosePump(Qrequired_kW);
    $('autoVrijemeZagrijavanja').value=autoStartHours.toFixed(1); $('izracunataStartSnaga').value=QstartCustom_kW.toFixed(1);
    $('mStart').textContent=`${fmt(QstartCustom_kW)} kW`; $('mNormal').textContent=`${fmt(Qnormal_kW)} kW`;
    $('mRequired').textContent=`${fmt(Qrequired_kW)}`;
    $('mModel').textContent=selected?(selected.type==='double'?`${selected.pumps[0].model} + ${selected.pumps[1].model}`:`${selected.pumps[0].model}`):'Nema modela';
    $('preporuka').innerHTML=selected?(
        (val('periodKoristenja')==='summer'?`<div>Pri temperaturi zraka 27°C i vlaga 80%</div>`:`<div>Pri temperaturi zraka 15°C i vlaga 70%</div>`)
        +(selected.type==='double'?`Za potrebnu snagu <strong>${fmt(Qrequired_kW)} kW</strong> preporučuju se modeli <strong>${selected.pumps[0].model} + ${selected.pumps[1].model}</strong> (ukupno ${fmt(selected.totalPower)} kW).`:`Za potrebnu snagu <strong>${fmt(Qrequired_kW)} kW</strong> preporučuje se model <strong>${selected.pumps[0].model}</strong> · ${selected.pumps[0].naziv} (${fmt(selected.pumps[0].snaga)} kW).`)
      ):(val('periodKoristenja')==='summer'?`<div>Pri temperaturi zraka 27°C i vlaga 80%</div>`:`<div>Pri temperaturi zraka 15°C i vlaga 70%</div>`)+`Potrebna snaga iznosi <strong>${fmt(Qrequired_kW)} kW</strong>. U trenutačnom katalogu nema dovoljno snažnog modela ni u kombinaciji 2 pumpe.`;
    $('formulaBox').innerHTML=`<strong>Primijenjene formule</strong><br><br>Površina zidova = opseg × dubina = <strong>${fmt(opseg)} × ${fmt(dubina)} = ${fmt(povrsinaZidova)} m²</strong><br>Gubici kroz školjku Qg = (A + Az) × k × ΔT / 1000 = <strong>${fmt(Qg_kW)} kW</strong><br>Isparavanje Qi = e × A × q / 3600 = <strong>${fmt(Qi_kW)} kW</strong><br>Protok filtera = volumen / 5 = <strong>${fmt(flowNeeded)} m³/h</strong><br>Pranje filtera Qpr = mp × c × ΔT / 6 h = <strong>${fmt(Qpr_kW)} kW</strong><br>Energija za početno zagrijavanje = V × 1000 × c × ΔT / 3600 = <strong>${fmt(energyToHeat_kWh)} kWh</strong><br>Vrijeme početnog zagrijavanja pri snazi održavanja = E / Qodrž = <strong>${fmt(autoStartHours)} h</strong><br>Snaga za početno zagrijavanje prema unesenom vremenu = E / t = <strong>${fmt(QstartCustom_kW)} kW</strong><br>Potrebna minimalna snaga = max(Qodrž, Qpočetno) = <strong>${fmt(Qrequired_kW)} kW</strong>`;
    renderRows([
      ['Oblik bazena',oblik==='regular'?'Pravilni':'Nepravilni'],['Tip bazena',tip==='closed'?'Zatvoreni':tip==='windy'?'Otvoreni u vjetrovitom području':'Otvoreni'],['Sustav bazena',sustav==='overflow'?'Preljevni kanal s kompenzacijom':'Skimmer'],['Lokacija bazena',val('lokacijaBazena')||'-'],['Period korištenja',val('periodKoristenja')==='summer'?'Ljetni period':'Rano proljeće i kasna jesen'],['Površina bazena',`${fmt(povrsina)} m²`],['Opseg bazena',`${fmt(opseg)} m`],['Dubina bazena',`${fmt(dubina)} m`],['Površina zidova školjke',`${fmt(povrsinaZidova)} m²`],['Osnovni volumen bazena',`${fmt(volumenOsnovni)} m³`],['Volumen bazena za proračun',`${fmt(volumen)} m³`],['Broj kupača (A / 2,7)',`${fmt(brojKupaca,1)}`],['Koeficijent prolaza topline k','2,07 W/m²K'],['Toplina isparavanja q','2440 kJ/kg'],['Temperatura tla',`${fmt(temperaturaTla,1)} °C`],['Izvor temperature tla',$('izvorTemperatureTla').value],['Faktor isparavanja',`${fmt(isparavanje,1)} l/h·m²`],['Gubici kroz školjku Qg',`${fmt(Qg_kW)} kW`],['Gubici isparavanjem Qi',`${fmt(Qi_kW)} kW`],['Potreban protok filtera (V / 5)',`${fmt(flowNeeded)} m³/h`],['Odabrani filter',`d${filter.diameterMm} mm / ${fmt(filter.flow)} m³/h`],['Poprečni presjek filtera',`${fmt(filterArea,3)} m²`],['Volumen vode za pranje filtera',`${fmt(backwashVolumeM3,3)} m³`],['Vrijeme zagrijavanja nakon pranja filtera','6,00 h'],['Snaga za zagrijavanje vode od pranja filtera Qpr',`${fmt(Qpr_kW)} kW`],['Zagrijavanje dodatne vode za kupače','Ne računa se'],['Energija za početno zagrijavanje',`${fmt(energyToHeat_kWh)} kWh`],['Vrijeme početnog zagrijavanja pri snazi održavanja',`${fmt(autoStartHours)} h`],['Uneseno vrijeme početnog zagrijavanja',`${fmt(customVrijeme)} h`],['Snaga za početno zagrijavanje prema unesenom vremenu',`${fmt(QstartCustom_kW)} kW`],['Ukupna snaga održavanja',`${fmt(Qnormal_kW)} kW`],['Potrebna minimalna snaga',`${fmt(Qrequired_kW)} kW`],['Preporučeni model',selected?(selected.type==='double'?`${selected.pumps[0].model} + ${selected.pumps[1].model} (ukupno ${fmt(selected.totalPower)} kW)`:`${selected.pumps[0].model} · ${selected.pumps[0].naziv} (${fmt(selected.pumps[0].snaga)} kW)`):'Nema modela u katalogu']
    ]);
    renderCatalog(Qrequired_kW, selected);
    setStatus('Izračun je dovršen.','Gotovo');
  }catch(err){ setStatus(err.message||'Došlo je do pogreške.','Greška'); } }

  /* ── UČITAJ PRIMJER (original engineer code — unchanged) ── */
  function ucitajPrimjer(){ $('oblikBazena').value='regular'; $('tipBazena').value='open'; $('sustavBazena').value='skimmer'; $('sirina').value=4; $('duzina').value=8; $('dubinaRegular').value=1.5; $('povrsinaIrregular').value=32; $('dubinaIrregular').value=1.5; $('temperaturaVode').value=28; $('lokacijaBazena').value='Ivanić Grad'; $('periodKoristenja').value='shoulder'; $('regionBazena').value='zagreb'; updateSoilTempFromRegion(); $('customVrijemeZagrijavanja').value=48; $('autoVrijemeZagrijavanja').value=''; $('izracunataStartSnaga').value=''; updateShapeFields(); renderCatalog(null,null); setStatus('Učitani su primjerni podaci.','Spremno'); }

  /* ── OČISTI SVE (original engineer code — unchanged) ── */
  function ocistiSve(){ $('oblikBazena').value='regular'; $('tipBazena').value='open'; $('sustavBazena').value='skimmer'; $('sirina').value=''; $('duzina').value=''; $('dubinaRegular').value=''; $('povrsinaIrregular').value=''; $('dubinaIrregular').value=''; $('temperaturaVode').value='28'; $('lokacijaBazena').value=''; $('periodKoristenja').value='shoulder'; $('regionBazena').value=''; $('temperaturaTla').value=SOIL_FALLBACK.toFixed(1); $('izvorTemperatureTla').value='Nije odabrana regija'; $('customVrijemeZagrijavanja').value='48'; $('autoVrijemeZagrijavanja').value=''; $('izracunataStartSnaga').value=''; $('mStart').textContent='-'; $('mNormal').textContent='-'; $('mRequired').textContent='-'; $('mModel').textContent='-'; $('preporuka').textContent='-'; $('formulaBox').textContent='Formula će biti prikazana nakon izračuna.'; renderRows([]); renderCatalog(null,null); updateShapeFields(); setStatus('Polja su očišćena.','Spremno'); }

  /* ── TOGGLE DETALJI (original engineer code — unchanged) ── */
  function toggleDetalji(){
    ['detailsNapomena','detailsTablica','detailsStartPolja'].forEach(id=>{
      const el=document.getElementById(id);
      if(el) el.classList.toggle('hidden');
    });
  }

  /* ── EVENT LISTENERS (original engineer code — unchanged) ── */
  $('oblikBazena').addEventListener('change', updateShapeFields);
  $('periodKoristenja').addEventListener('change', updateSoilTempFromRegion);


  /* ── Volume live update ── */
  ['sirina','duzina','dubinaRegular','povrsinaIrregular','dubinaIrregular'].forEach(id=>{
    const el=$(id); if(el) el.addEventListener('input', updateVolumeDisplay);
  });

  /* ── INIT ── */
  updateShapeFields();
  renderCatalog(null, null);
  ucitajPrimjer();