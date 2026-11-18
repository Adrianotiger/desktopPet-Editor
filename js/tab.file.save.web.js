class SaveProjectFolderWebClass extends SaveProjectFolderClass
{
  #currentProject = 0;
  #webDiv = null;

  constructor(parentDiv)
  {
    super(parentDiv);
  }

  show()
  {
    let buttSave = _CN("button", {style:"width:200px;"}, ["💾 Save"], this.div);

    this.#webDiv = _CN("div", {style:"margin:0 auto;"}, [], this.div);
    this.#currentProject = OpenTab.projectFolder;

    buttSave.addEventListener("click", ()=>{
      this.saveAnimation();
    });

    let value = Supabase.getPublicLink(this.#currentProject.folder);
    _CN("h3", {}, ["Public link:"], this.div);
    _CN("p", {}, ["Your project folder is public and can be used in desktoppet.", _CN("br"), "Set this developer link:"], this.div);
    _CN("input", {type:"text", style:"display:block;margin:0 auto;width:80vw;", value}, [], this.div);

    // load new files
    this.showDirectory();
  }

  async showDirectory()
  {
    this.#webDiv.innerHTML = "";
    if(this.#currentProject != null)
      _CN("h2", {}, ["Web project", " - ", this.#currentProject.folder.name], this.#webDiv);

    let div = _CN("div", {class:"aniframeeditor", style:"height:120px;width:60vw;padding-top:30px;overflow-y:scroll;margin:0 auto;background:rgba(255,255,255,0.5);"}, [], this.#webDiv);
    _CN("i", {}, ["Project items"], div);


    [["animations.xml", "fileanimations"], ["README.md", "filereadme"], ["icon.png", "fileicon"]].forEach((file)=>{
      _CN("span", {}, [_CN("img", {class:"icon", "data-icon":file[1]}), _CN("br"), file[0]], div);
    });
    
    /*
    let divIcon = _CN("div", {}, ["Re-generate icon from the xml-icon.", _CN("br")], this.div);
    _CN("button", {}, ["Replace image.png using xml-icon"], divIcon).addEventListener("click", ()=>{
      this.#generateIcon();
    });
    */
  }

  async saveAnimation()
  {
    const xml = XML.getXml();
    
    const { data, error } = await Supabase.saveXML(this.#currentProject.folder.name, xml);

    if(error)
    {
      Msg.show({title:"Web-Error", content:error.message});
    }
    else
    {
      console.log(data);
      Msg.show({title:"Success", content:"Animation was successfully updated."});
    }
  }
}
