class ProjectClass
{
  folder = null;
  files = null;
  projType = "";

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
  folderDiv = null;

  constructor(folderDiv)
  {
    this.folderDiv = folderDiv;
  }

  get div() { return this.#div; };

  buttonPressed() {}
  async loadFolders() {}
  loadFiles() {}
  async getFile(project, filename) {}

  showProjects(title = "Open Project") 
  {
    if(this.#div == null)
    {
      this.#div = _CN("div", {class:"aniframeeditor", style:"height:100%;width:80vw;overflow-y:scroll;margin:0 auto;padding-right:64px;padding-top:10px;"});
      _CN("i", {}, [title], this.#div);
      this.projects.forEach(async p=>{
        p.span = _CN("span", {style:"opacity:0.2;min-width:128px;"}, [_CN("img", {class:"icon", "data-icon":"folder"}), _CN("br"), p.folder.name], this.#div);
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

    this.folderDiv.innerHTML = "";
    this.folderDiv.appendChild(this.#div);
  }
};

class OpenTabClass extends TabClass
{  
  #localFolder = null;
  #webFolder = null;
  #gitHubFolder = null;

  #currentProject = null;

  constructor()
  {
    super("Open");
    
    _CN("h1", {}, ["Open"], this.div);
    _CN("hr", {}, [], this.div);

    const iconsDiv = _CN("div", {style:"height:120px;"}, [], this.div);
    const infoDiv = _CN("div", {style:"width:80vw;height:50px;margin:8px auto;border-radius:5px;line-height:16px;border:1px solid #66f;box-shadow:2px 2px 4px #33a;"}, ["Open a single animations.xml or a project from local PC, webfolder or GitHub."], this.div);
    _CN("hr", {}, [], this.div);
    const folderDiv = _CN("div", {style:"height:40vh;width:80vw;margin:0 auto;"}, [], this.div);

    let butt = _CN("button", {style:"margin:10px;line-height:32px;width:128px;"}, [
      _CN("img", {class:"icon icon64", "data-icon":"fileopenxml"}), 
      _CN("br"),
      "Open file..."
    ], iconsDiv);
    butt.addEventListener("click", ()=>{this.openFileDialog();});
    butt.addEventListener("mousemove", ()=>{
      infoDiv.textContent = "Open a single animation.xml file from your PC.";
    });

    _CN("hr", {style:"width:80%;margin:10px auto;"}, [], this.div);

    loadScripts(["tab.file.open.local", "tab.file.open.web", "tab.file.open.github"], true).then(()=>{
      this.#localFolder = new OpenProjectFolderLocalClass(iconsDiv, infoDiv, folderDiv);
      this.#webFolder = new OpenProjectFolderWebClass(iconsDiv, infoDiv, folderDiv);
      this.#gitHubFolder = new OpenProjectFolderGitHubClass(iconsDiv, infoDiv, folderDiv);
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

    Menu.enableSubmenu(['Save', 'Export', 'Import', 'XML viewer', 'DOT viewer']);

    if(this.#currentProject != null)
    {
      setTitle(0, ` - [${this.#currentProject.projType}] `);
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