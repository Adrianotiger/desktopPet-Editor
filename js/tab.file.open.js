class ProjectClass
{
  folder = null;
  files = null;
  isLocal = null;

  span = null;
  icon = null;

  xmlFile = false;
  imageFile = false;
  mdFile = false;
}

class OpenProjectFolderClass
{
  projects = [];
  #div = null;

  constructor(parentDiv, description, buttonElements, postDescription="")
  {
    if(this.#div != null) this.#div.innerHTML = "";

    this.#div = _CN("div", {style:"margin:10px auto;border:outset 1px var(--border);border-radius:10px;"}, [], parentDiv);
    _CN("p", {}, [description], this.#div);
    let buttLoad = _CN("button", {style:"width:30vw;line-height:32px;"}, buttonElements, this.#div);
    _CN("p", {}, [postDescription], this.#div);

    buttLoad.addEventListener("click", ()=>{this.buttonPressed();});
  }

  get div() { return this.#div; };

  buttonPressed() {}
  async loadFolders() {}
  loadFiles() {}
  async getFile(project, filename) {}

  showProjects(title = "Open Project") 
  {
    this.#div.innerHTML = "";
    let div = _CN("div", {class:"aniframeeditor", style:"height:30vh;width:80vw;overflow-y:scroll;margin:0 auto;"}, [], this.#div);
    _CN("i", {}, [title], div);
    this.projects.forEach(async p=>{
      p.span = _CN("span", {style:"opacity:0.2"}, [_CN("img", {class:"icon", "data-icon":"folder"}), _CN("br"), p.folder.name], div);
    });

    this.loadFiles().then(()=>{
      this.projects.forEach(async p=>{
        p.files.forEach(pf=>{
          switch(pf.toLowerCase())
          {
            case "animations.xml": p.xml = true; break;
            case "readme.md": p.readme = true; break;
            case "icon.png": p.image = true; break;
          }
        });
        
        if(p.xml)
        {
          p.span.style.opacity = 1;
          if(p.icon)
          {
            p.span.getElementsByTagName("img")[0].src = URL.createObjectURL( p.icon );
            p.span.getElementsByTagName("img")[0].style.content = "none";
          }

          p.span.addEventListener("click", async ()=>{
            OpenTab.setProject(p);
            OpenTab.openFile(await this.getFile(p, "animations.xml"));
          });
        }
      });
      console.log(this.projects);
    });
  }
};

class OpenTabClass extends TabClass
{  
  #localFolder = null;
  #webFolder = null;

  #currentProject = null;

  constructor()
  {
    super("Open");
    
    _CN("h1", {}, ["Open"], this.div);
    _CN("hr", {}, [], this.div);

    let butt = _CN("button", {style:"width:30vw;margin:10px;line-height:32px;"}, [_CN("img", {class:"icon", "data-icon":"fileopenxml", style:"float:left;"}), "Open file..."], this.div);
    butt.addEventListener("click", ()=>{this.openFileDialog();});

    _CN("hr", {style:"width:80%;margin:10px auto;"}, [], this.div);

    loadScripts(["tab.file.open.local", "tab.file.open.web"], true).then(()=>{
      this.#localFolder = new OpenProjectFolderLocalClass(this.div);
      this.#webFolder = new OpenProjectFolderWebClass(this.div);
    });

    
    // If new was pressed, open the template xml file
    document.body.addEventListener("menu", (ev)=>{
      if(ev?.detail?.action == "new")
      {
        this.#currentProject = null;

        fetch("template/animations.xml").then(r=>{
          return r.blob();
        }).then(b=>{
          const f = new File([b], "animations.xml", { type: b.type });
          this.openFile(f);
        });
      }
    });
  }

  get projectFolder() { return this.#currentProject; }
  get rootFolder() { return this.#localFolder.rootFolder; }

  setProject(project)
  {
    this.#currentProject = project;
  }

  show(params)
  {
    super.show(params);
  }

  hide()
  {
    super.hide();
  }
  
  async openFileDialog()
  {    
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        suggestedName: 'animations.xml',
        id: 'e-sheep-openfolder',
        startIn: 'downloads',
        excludeAcceptAllOption: true,
        multiple: false,
        types: [{
          description: 'Animation file',
          accept: { 'text/xml': ['.xml', '.xml'] }
        }]
      });

      const file = await fileHandle.getFile();

      this.#currentProject = null;

      this.openFile(file);

    } catch (err) {
      console.log("Canceled by user");
      return;
    }
  }

  async openFile(file)
  {
    let xmlString = await file.text();

    Menu.enableSubmenu(['Save', 'Export', 'Import', 'XML viewer']);

    if(this.#currentProject != null)
    {
      setTitle(0, this.#currentProject.isLocal ? " - [local] " : " - [web] ");
      setTitle(1, (this.#currentProject.folder?.name??"?") + "-project");
    }
    else
    {
      setTitle(0, " - [single]");
      setTitle(1, "animations.xml");
    }
      
    console.log("File opened via API:", file.name);

    XML.loadXML(xmlString);
  }
  
};

const OpenTab = new OpenTabClass();