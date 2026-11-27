class OpenProjectFolderWebClass extends OpenProjectFolderClass
{
  #folderHandler = null;
  #webContentLoaded = false;
  #supabasedomain = "jurrsvjhvldxcbtrvdrf";

  constructor(iconsDiv, infoDiv, folderDiv)
  {
    super(
      folderDiv
    );

    let butt = _CN("button", {style:"margin:10px;line-height:32px;width:128px;"}, [
      _CN("img", {class:"icon icon64", "data-icon":"fileopenweb"}), 
      _CN("br"),
      "Open web project"
    ], iconsDiv);
    butt.addEventListener("click", ()=>{this.buttonPressed();});
    butt.addEventListener("mousemove", ()=>{
      infoDiv.textContent = "Web folder is a virtual folder on the web, stored on Supabase.co. Note: Pets stored here are public and accessible to everyone. You can share the link to other users or ask to upload them to github.";
    });

    let token = localStorage.getItem(`sb-${this.#supabasedomain}-auth-token`);
    if(token != null)
    {
      token = JSON.parse(token);
      let data = token.user?.user_metadata?.full_name || token.user?.user_metadata?.name || token.user?.email;
      let logout = _CN("a", {href:"javascript:;", style:"float:right;"}, ["Logout"]);
      _CN("p", {style:"padding:5px;border:2px ridge;"}, [`Hi ${data} !`, logout], this.div);
      logout.addEventListener("click", ()=>{
        localStorage.removeItem(`sb-${this.#supabasedomain}-auth-token`);
        this.div.innerHTML = "Bye, you where successfully logged out! To remove also this application from Google-Account, you need to do it in your Google console.";
      });
    }
  }

  buttonPressed()
  {
    const token = localStorage.getItem(`sb-${this.#supabasedomain}-auth-token`);

    if(token != null)
    {
      if(this.#webContentLoaded)
      {
        this.showProjects();
      }
      else
      {
        this.folderDiv.innerHTML = "Loading Web content...";
        this.#loadWebPath().then(async ()=>{
          await this.loadFolders();
        }).catch(err=>{
          console.error(err);
          Msg.show({title:"Error loading Supabase", content:"Unable to load webcontent"});
        });
      }
    }
    else
    {
      this.folderDiv.innerHTML = "Signing in...";
      this.#loadWebPath().then(()=>{
        let scriptTimeout = 4;
        let loginTimeout = -1;
        let timeoutInt = setInterval(async ()=>{
          if(scriptTimeout >= 0)
          {
            this.folderDiv.innerHTML = `Load script... (${scriptTimeout})`;
            scriptTimeout--;
            if(scriptTimeout < 0)
            {
              clearInterval(timeoutInt);
              this.folderDiv.innerHTML = `Unable to load Supabase script!`;
              return;
            }
            else if(Supabase.isScriptLoaded)
            {
              scriptTimeout = -1;
              loginTimeout = 4;
              Supabase.login();
            }
          }
          if(loginTimeout >= 0)
          {
            this.folderDiv.innerHTML = `Signing in... (${loginTimeout})`;
            loginTimeout--;
            if(loginTimeout < 0)
            {
              clearInterval(timeoutInt);
              this.folderDiv.innerHTML = `Unable to sign in!`;
              return;
            }
            /*
            else if(Supabase.isSignedIn)
            {
              clearInterval(timeoutInt);
              this.div.innerHTML = `Signed in! Loading folders...`;
              await this.loadFolders();
            }*/
          }
        }, 1000);
      }).catch(err=>{
        console.error(err);
        Msg.show({title:"Error loading Supabase", content:"Unable to load webcontent"});
      });
    }
  }

  async loadFolders(retries = 5)
  {
    if(!Supabase.isScriptLoaded || !Supabase.isSignedIn)
    {
      if(retries > 0)
      {
        setTimeout(()=>{this.loadFolders(retries-1);}, 500);
      }
      return;
    }
    let dirs = await Supabase.getDirectoryFiles();
    dirs.forEach(d=>{
      if(d.id === null)
      {
        const project = new ProjectClass();
        project.folder = d;
        project.files = [];
        project.projType = "web";

        this.projects.push(project);
      }
    });

    this.#webContentLoaded = true;
    this.showProjects("Open Web Project");
  }

  loadFiles()
  {
    return new Promise(async (res)=>{
      for(let j=0;j<this.projects.length;j++)
      {
        const p = this.projects[j];
        var files = await Supabase.getDirectoryFiles(p.folder.name);

        for(let k=0;k<files.length;k++)
        {
          p.files.push(files[k].name);

          if(files[k].name == "icon.png") p.icon = await this.getFile(p, "icon.png");
        }
      }      
      res();
    });
  }

  async getFile(project, filename)
  {
    return await Supabase.downloadFile(project.folder.name + "/" + filename);
  }

  #loadWebPath()
  {
    return loadScripts(["extra.supabase"], true);
  }
};