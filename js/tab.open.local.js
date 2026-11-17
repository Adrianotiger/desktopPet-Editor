
class OpenProjectFolderLocalClass extends OpenProjectFolderClass
{
  #folderHandler = null;
  #db = null;


  constructor(parentDiv)
  {
    super(
      parentDiv,
      "Local folder is a folder accessible by the browser. This is the root folder, every subfolder is another animation project containing a animations.xml file.",
      [
        _CN("img", {class:"icon", "data-icon":"fileopenlocal", style:"float:left;"}), 
        "Open local Pet folder..."
      ],
      "After pressing the button, select the root folder to use for your projects."
    );

    this.#getFolderHandler().then(()=>{
      this.loadFolders();
    }).catch(()=>{
      // nothing, wait for button press.
    });
  }

  buttonPressed()
  {
    this.#checkPermission().then(async()=>{
      await this.loadFolders();
    }).catch((err)=>{
      console.error("No permission to load folder", err);
      Msg.show({title:"Permissions error", content:"No permission to load folders from this browser. Please grant access to use this functionality."});
    });
  }

  async loadFolders()
  {
    if(this.#folderHandler == null) return;

    this.projects = [];
    let folders = this.#folderHandler.entries();

    var f, f2;
    while((f = await folders.next()))
    {
      if(f.done) break;
      
      if(f.value[1].kind === "directory")
      {	
        const project = new ProjectClass();
        project.folder = f.value[1];
        project.files = [];
        project.isLocal = true;

        this.projects.push(project);
      }
    }
    this.showProjects("Open Local Project");
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


