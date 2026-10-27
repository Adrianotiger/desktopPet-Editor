class AnimationTabClass extends TabClass
{
  #currentAni = null;
  #canv = null;
  #isAnimating = true;

  constructor()
  {
    super("Animation");
    _CN("h1", {}, ["Animation"], this.div);
    _CN("script", {src:"js/edit.frames.js"}, [], document.head);
    _CN("script", {src:"js/edit.next.js"}, [], document.head);
  }
  
  show(params)
  {
    super.show();
    if(params?.ani != null)
    {
      console.log(params.ani);
      this.#currentAni = params.ani.clone();

      console.log("Cloned", this.#currentAni);
      this.#createDiv();
      console.log()
    }
  }

  hide()
  {
    super.hide();
    try{this.#canv?.animate(false);}catch(e){};
  }
  
  #createDiv()
  {
    this.div.innerHTML = "";
    _CN("button", {style:"position:absolute;right:10px;top:0px;"}, [_CN("img", {class:"icon", "data-icon":"filesave"})], this.div).addEventListener("click", ()=>{
      const parser = new DOMParser();
      const xml = parser.parseFromString(this.#currentAni.getXml(), "text/xml");
      const replaceId = this.#currentAni.id;
      const replaceNode = new XMLAnimationsAnimation(xml.documentElement);
      XML.setAnimation(replaceId, replaceNode);
      Menu.execute("animations");
      AnimationsTab.reload();
      //Tabs.removeTop();
    });
    _CN("button", {style:"position:absolute;left:10px;top:0px;"}, [_CN("img", {class:"icon", "data-icon":"cancel"})], this.div).addEventListener("click", ()=>{
      Tabs.removeTop();
    });
    _CN("h1", {}, ["Animation"], this.div);
    const ani = this.#currentAni;
    const seq = ani.sequence;
    const canv = new AniCanvasClass(ani, XML.getImage().getFrameWidth(), XML.getImage().getFrameHeight());
    const baseInfo = _CN("div", {class:"infobox aniinfobox", style:"width:20vw;height:30vh;position:relative;"}, [_CN("h3", {}, ["Animation Key"])], this.div);
    const sel = _CN("select", {name:"id"}, [_CN("option", {}, [ani.id])]);
    const inputId =  _CN("input", {type:"text", name:"name", value:ani.name, placeholder:"Unique name"});
    const canvCont = _CN("div", {style:"position:absolute;bottom:-2px;left:0px;width:20vw;height:15vh;"}, [canv.getCanvas()], baseInfo);
    canvCont.addEventListener("click", ()=>{
      this.#isAnimating = !this.#isAnimating;
      this.#canv.animate(this.#isAnimating);
    });
    
    _CN("div", {}, [_CN("span", {style:"width:50px;display:inline-block;"}, ["Id:"]), sel], baseInfo);
    _CN("div", {}, [_CN("span", {style:"width:50px;display:inline-block;"}, ["Name:"]), inputId], baseInfo);
   
    const sequenceInfo = _CN("div", {class:"infobox aniinfobox", id:"sequence", style:"width:70vw;height:30vh;"}, [_CN("h3", {}, ["Sequence"])], this.div);
    const inputRepeats =  _CN("input", {type:"text", name:"sequence.repeat", value:seq.repeatOriginal, placeholder:"0"});
    const inputRepeatsFrom =  _CN("input", {type:"number", name:"sequence.repeatfrom", value:seq.repeatfrom, placeholder:"0"});
    const inputEndEffect = _CN("select", {name:"sequence.action"});
    Object.entries(XMLValue.Action).forEach(([okey, oval]) => {
      const so = _CN("option", {value:oval}, [okey], inputEndEffect);
      if(seq.action == so.value) {so.selected = true; inputEndEffect.value=so.value; }
    });
    _CN("table", {style:"width:100%;"}, [_CN("tr", {}, [
      _CN("td", {}, ["Repeats: ", inputRepeats]),
      _CN("td", {}, ["From: ", inputRepeatsFrom]),
      _CN("td", {}, ["End action: ", inputEndEffect])
    ])], sequenceInfo);
    const fe = new FrameEditor(seq, canv, sequenceInfo);

    ["start", "end"].forEach((p,j)=>{
      const paramInfo = _CN("div", {class:"infobox aniinfobox", id:p, style:"width:45vw;"}, [_CN("h3", {}, ["Parameters " + p])], this.div);
      const pos = (j==0?ani.start:ani.end);
      const inputX =  _CN("input", {type:"text", name:`${p}.x`, value:pos.x, placeholder:"-1"});
      const inputY =  _CN("input", {type:"text", name:`${p}.y`, value:pos.y, placeholder:"0"});
      const inputInt =  _CN("input", {type:"text", name:`${p}.interval`, value:pos.interval, placeholder:"200"});
      const inputOff =  _CN("input", {type:"number", name:`${p}.offsety`, value:pos.offsety, placeholder:"0"});
      const inputO =  _CN("input", {type:"number", name:`${p}.opacity`, value:pos.opacity, placeholder:"1.0"});

      _CN("table", {}, [
        _CN("tr", {}, [_CN("td", {}, ["X: "]), _CN("td", {}, [inputX]), _CN("td", {}, ["Offset Y: "]), _CN("td", {}, [inputOff])]),
        _CN("tr", {}, [_CN("td", {}, ["Y: "]), _CN("td", {}, [inputY])]),
        _CN("tr", {}, [_CN("td", {}, ["Interval: "]), _CN("td", {}, [inputInt]), _CN("td", {}, ["Opacity: "]), _CN("td", {}, [inputO])]),
      ], paramInfo);
    });

    const nexts = ["sequence", "border", "gravity"];
    const divw = parseInt(90 / nexts.length) + "vw";

    nexts.forEach(nk=>{
      const nextInfo = _CN("div", {class:"infobox aniinfobox", id:nk, style:`width:${divw};`}, [_CN("h3", {}, ["Next " + nk])], this.div);
      const nexts = ani[nk];

      const ne = new NextEditor(ani[nk], nextInfo);
      if(Array.isArray(nexts.next))
      {
        nexts.next.forEach(ns=>{
          console.log(ns);
        });
      }
    });
    
    canv.animate(true);  
    this.#canv = canv;

    [...this.div.querySelectorAll("input, select")].forEach(i=>{
      const original = i.value;
      let oldValue = original;
      i.addEventListener("change", ()=>{
        const newValue = i.value;
        console.log(`ELEMENT changed, from ${original} to ${newValue}`);
        oldValue = this.changeValue(i, i.name, newValue);
        if(oldValue == original)
          i.style.backgroundColor = "white";
        else if(oldValue != newValue)
          i.style.backgroundColor = "#fad";
        else {
          i.style.backgroundColor = "#bf8";
          this.#checkAni();
        }
      });
    });

    this.#checkAni();
    setTimeout(()=>{
      const rect = canvCont.getBoundingClientRect();
      this.#canv.resizeCanvasToEmulateScreen(parseInt(rect.width), parseInt(rect.height));
    }, 100);
  }

  #checkAni()
  {
    const errors = this.#currentAni.check();
    if(errors.length > 0)
    {
      console.error(errors);
    }
  }
  
  changeValue(element, key, value)
  {
    let failed = null;
    let node = this.#currentAni;
    for (const key2 of key.split(".")) 
      node = node?.[key2];

    if(value == null || value.length == 0)
    {
      failed = `Value for '${key}' can't be empty!`;
    }
    else if(key == "name") 
    {
      if(checkAniNameExists(this.#currentAni.id, value)) failed = `Animation name '${value}' is already used!`;
    }
    if(failed) 
    {
      value = element.value = node;
      console.error(failed);
    }
    else
    {
      if(key.split(".").length==1) this.#currentAni[key] = value;
      else if(key.split(".").length==2) this.#currentAni[key.split(".")[0]][key.split(".")[1]] = value;
      this.#canv.updateAni(this.#currentAni);
    }
    //node = value;
    console.log(this.#currentAni);
    return value;
  }
  
};

const AnimationTab = new AnimationTabClass();