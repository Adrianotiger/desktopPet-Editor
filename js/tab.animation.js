class AnimationTabClass extends TabClass
{
  #currentAni = null;
  
  constructor()
  {
    super("Animation");
    _CN("h1", {}, ["Animation"], this.div);
    
  }
  
  show(params)
  {
    super.show();
    if(params?.ani != null)
    {
      console.log(params.ani);
      this.#currentAni = params.ani;
      this.#createDiv();
    }
  }
  
  #createDiv()
  {
    const ani = this.#currentAni;
    const canv = new AniCanvasClass(ani, XML.getImage().getFrameWidth(), XML.getImage().getFrameHeight());
    const baseInfo = _CN("div", {class:"infobox", style:"width:20vw;text-align:left;"}, [_CN("h3", {}, ["Animation Key", _CN("span", {style:"float:right;"}, [canv.getCanvas()])])], this.div);
    const sel = _CN("select", {}, [_CN("option", {}, [ani.id])]);
    const inputId =  _CN("input", {type:"text", value:ani.name, placeholder:"Unique name"});
    _CN("div", {}, [_CN("span", {style:"width:50px;display:inline-block;"}, ["Id:"]), sel], baseInfo);
    _CN("div", {}, [_CN("span", {style:"width:50px;display:inline-block;"}, ["Name:"]), inputId], baseInfo);
   
    
    canv.animate(true);    
  }
  
  
};

const AnimationTab = new AnimationTabClass();