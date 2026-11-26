
class OpenProjectFolderLocalClass extends OpenProjectFolderClass
{
  #folderHandler = null;
  #db = null;

  constructor(iconsDiv, infoDiv, folderDiv)
  {
    super(
      folderDiv
    );

    let butt = _CN("button", {style:"margin:10px;line-height:32px;width:128px;"}, [
      _CN("img", {class:"icon icon64", "data-icon":"fileopenlocal"}), 
      _CN("br"),
      "Open local project"
    ], iconsDiv);
    butt.addEventListener("click", ()=>{this.buttonPressed();});
    butt.addEventListener("mousemove", ()=>{
      infoDiv.textContent = "Local folder is a folder accessible by the browser. This is the root folder, every subfolder is another animation project containing a animations.xml file. After pressing the button, select the root folder to use for your projects.";
    });

    /*
    this.#getFolderHandler().then(()=>{
      this.loadFolders();
    }).catch(()=>{
      // nothing, wait for button press.
    });
    */
  }

  get rootFolder() { return this.#folderHandler; }

  buttonPressed()
  {
    if(this.#db == null)
    {
      this.#getFolderHandler().then(()=>{
        this.loadFolders();
      }).catch(()=>{
        // nothing, wait for button press.
      });
    }
    else
    {
      this.#checkPermission().then(async()=>{
        await this.loadFolders();
      }).catch((err)=>{
        console.error("No permission to load folder", err);
        Msg.show({title:"Permissions error", content:"No permission to load folders from this browser. Please grant access to use this functionality."});
      });
    }
  }

  async loadFolders()
  {
    if(this.#folderHandler == null) return;

    this.projects = [];
    let folders = this.#folderHandler.entries();

    let folderHandlerValid = false;

    setTimeout(()=>{
      if(!folderHandlerValid)
      {
        console.error("Unable to open files - Timeout");
        this.#folderHandler = null;
      }
    }, 2000);

    try
    {
      var f;
      while((f = await folders.next()))
      {
        folderHandlerValid = true;
        if(f.done) break;
        
        if(f.value[1].kind === "directory")
        {	
          const project = new ProjectClass();
          project.folder = f.value[1];
          project.files = [];
          project.projType = "local";

          this.projects.push(project);
        }
      }
      const div = this.showProjects("Open Local Project");
      _CN("div", {class:"aniframeeditoradd", title:"New Project"}, ["＋ "], div).addEventListener("click", ()=>{
        this.#createNewProject();
      });
    }
    catch(ex)
    {
      console.error("Unable to open files", ex);
      this.#folderHandler = null;
    }
  }

  loadFiles() 
  {
    return new Promise(async (res)=>{
      for(let j=0;j<this.projects.length;j++)
      {
        const p = this.projects[j];
        var files = p.folder.entries();
        var f2;

        while((f2 = await files.next())) 
        {						
          if(f2.done) break;
          p.files.push(f2.value[1].name);

          if(f2.value[1].name == "icon.png") p.icon = await this.getFile(p, "icon.png");
        }
      }      
      res();
    });
  }

  async getFile(project, filename) 
  {
    var files2 = await project.folder.entries();
    var f2;
    while((f2 = await files2.next())) 
    {						
      if(f2.done) break;
      if(f2.value[1].name.toLowerCase() == filename.toLowerCase())
      {
        return f2.value[1].getFile();
      }
    }
    return null;
  }

  #createNewProject()
  {
    let form = _CN("div");
    _CN("p", {}, ["Create new pet. Please give the name of the pet (folder name):"], form);
    let inp1 = _CN("input", {type:"text", value:"", placeholder:"petname"}, [], form);

    Msg.show({content:form, title:"New Pet", buttons:["Create"]}, async ()=>{
      const newFolderHandle = await this.#folderHandler.getDirectoryHandle(inp1.value, {create: true});
      fetch("../template/animations.xml").then(res=>{
        return res.text();
      }).then(async (txt)=>{
        const destFileHandle = await newFolderHandle.getFileHandle("animations.xml", {create: true});
        const writable = await destFileHandle.createWritable();
        await writable.write(txt);
        await writable.close();

        await this.loadFolders();
      }).catch(e=>{
        console.error("Unable to create project", e);
      });
    });
  }

  #getFolderHandler()
  {
    return new Promise(async (res, rej)=>{
      // If handler is already open
      if(this.#folderHandler != null) 
      {
        res();
        return;
      }

      // Open it from Database
      await this.#openHandlers();	

      // Is it loaded?
      if(this.#folderHandler != null) 
        res();
      else
        rej();
    });
  }

  #checkPermission()
  {
    const opts = {mode: "readwrite"};

    return new Promise(async (res, rej)=>{
      if(!this.#folderHandler)
      {
        if(typeof window.showDirectoryPicker === 'undefined')
        {
          Msg.show({title:"Browser error", content:"You need a new browser for this! It works only on browsers with directory access.", buttons:["OK"]});
          rej();
          return;
        }

        window.showDirectoryPicker().then(fh =>{
          this.#folderHandler = fh;
          console.log(this.#folderHandler);
          if(this.#db == null) {console.error("Database not loaded"); rej(); return;}

          var transaction = this.#db.transaction(["folder"], "readwrite");
          var objStore = transaction.objectStore("folder");
          var request = objStore.get("1");

          request.onsuccess = async (e)=>{
            var data = e.target.result;
            if(typeof data === 'undefined')
            {
              objStore.add({indkey:"1", indval:this.#folderHandler});
            }
            else
            {
              data.indval = this.#folderHandler;
              objStore.put(data);
            }

            if ((await this.#folderHandler.queryPermission(opts)) === "granted") {res(); return;}
            if ((await this.#folderHandler.requestPermission(opts)) === "granted") {res(); return;}
          };
          request.onerror = (e)=>{
            console.error("Unable to save to DB.");
            rej();
          };
        }).catch(err=>{
          console.log(err);
          rej();
        });
      }
      else
      {
        if ((await this.#folderHandler.queryPermission(opts)) === "granted") {res(); return;}
        if ((await this.#folderHandler.requestPermission(opts)) === "granted") {res(); return;}
        
        rej();
      }
    });
  }

  // File and Folder handlers can be saved only in Databases!
  #openHandlers()
  {
		return new Promise((res, rej)=>{
			let request = indexedDB.open("eventsFileHandlers", 1);

			request.onupgradeneeded = (event)=> {
				console.warn("Database upgraded: ", event);
				this.#db = event.target.result;
				var objStore = this.#db.createObjectStore("folder", { keyPath: "indkey" });
				objStore.createIndex("indval", "indval", { unique: false });
				res(event);
			};
			request.onsuccess = (event)=> {
				this.#db = event.target.result;

				console.log("Database loaded: ", event);

				var transaction = this.#db.transaction("folder", "readonly");
				var objectStore = transaction.objectStore("folder");
				var request2 = objectStore.openCursor();
				request2.onsuccess = (e) => {
					var cursor = e.target.result;
					if(cursor) {
						this.#folderHandler = cursor.value.indval;
						cursor.continue();
					}
					res(event);
				};
			};
			request.onerror = (event)=> {
				console.error("Database error: ", event);
				rej(event);
			};
		});
  }

};


