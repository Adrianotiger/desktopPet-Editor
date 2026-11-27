/*
  Open pets from a GitHub repository: paste the link of a repository, of a folder or of a single pet.
  The editor reads the repository's pets.json (in Pets/ or at the root); without one, it lists every
  folder that has an animations.xml (GitHub's file tree, 60 requests an hour without signing in).
*/
const GitHubPets =
{
  // github.com/owner/repo, .../tree/branch/folder, .../blob/branch/folder/animations.xml or owner/repo
  parse(text)
  {
    text = (text || "").trim().replace(/\/+$/, "");
    const name = "[A-Za-z0-9][A-Za-z0-9._-]{0,99}";
    let m = new RegExp(`^(?:https?://)?(?:www\\.)?github\\.com/(${name})/(${name})(?:/(tree|blob)/([^/?#]+)(/[^?#]*)?)?/?(?:[?#].*)?$`, "i").exec(text);
    if(m == null)
    {
      m = new RegExp(`^(${name})/(${name})$`).exec(text);
      return m ? {owner:m[1], repo:m[2], branch:null, path:null} : null;
    }
    let path = null;
    if(m[5])
    {
      const rest = decodeURIComponent(m[5]).replace(/^\/+|\/+$/g, "");
      // a link to a file (animations.xml, pets.json, a readme...) means its folder
      path = m[3].toLowerCase() === "blob" ? rest.substring(0, Math.max(0, rest.lastIndexOf("/"))) : rest;
    }
    if(path && path.split("/").some(s => s === "" || s === "." || s === "..")) return null;
    return {owner:m[1], repo:m[2].replace(/\.git$/i, ""), branch:m[4] ? decodeURIComponent(m[4]) : null, path};
  },

  encode(path)
  {
    return path.split("/").filter(s => s).map(encodeURIComponent).join("/");
  },

  // the folder of a source on raw.githubusercontent.com (no request limit there)
  baseUrl(source)
  {
    return `https://raw.githubusercontent.com/${source.owner}/${source.repo}/${this.encode(source.branch)}/` +
      (source.path ? this.encode(source.path) + "/" : "");
  },

  folderUrl(source, pet)
  {
    return this.baseUrl(source) + (pet.dir ? this.encode(pet.dir) + "/" : "");
  },

  async api(what)
  {
    const r = await fetch("https://api.github.com/" + what, {headers:{Accept:"application/vnd.github+json"}});
    if((r.status === 403 || r.status === 429) && r.headers.get("x-ratelimit-remaining") === "0")
    {
      const reset = new Date((+r.headers.get("x-ratelimit-reset") || 0) * 1000);
      throw new Error(`GitHub allows 60 searches an hour without signing in. Try again after ${reset.toLocaleTimeString()}.`);
    }
    if(r.status === 404) return null;
    if(!r.ok) throw new Error(`GitHub answered ${r.status}.`);
    return r.json();
  },

  // the list the author keeps: pets.json
  async petsJson(source)
  {
    try
    {
      const r = await fetch(this.baseUrl(source) + "pets.json", {cache:"no-cache"});
      if(!r.ok) return null;
      const list = (await r.json()).pets;
      if(!Array.isArray(list)) return null;
      const pets = list
        .filter(p => p && typeof p.folder === "string" && p.folder.trim() !== "")
        .map(p => ({name: p.name || p.folder.split("/").pop(), dir: p.folder.replace(/^\/+|\/+$/g, "")}))
        .filter(p => !p.dir.split("/").some(s => s === "." || s === ".."));
      return pets.length > 0 ? pets : null;
    }
    catch(err)
    {
      return null;   // a file with that name that is not a list of pets
    }
  },

  // no list: every folder with an animations.xml (inside source.path; when it is null, Pets/ or the root)
  async tree(source)
  {
    const json = await this.api(`repos/${source.owner}/${source.repo}/git/trees/${encodeURIComponent(source.branch)}?recursive=1`);
    if(json == null || !Array.isArray(json.tree)) return null;
    const xmls = json.tree
      .filter(e => e.type === "blob" && (e.path === "animations.xml" || e.path.endsWith("/animations.xml")))
      .map(e => e.path);
    if(source.path == null) source.path = xmls.length > 0 && xmls.every(p => p.startsWith("Pets/")) ? "Pets" : "";
    const prefix = source.path ? source.path + "/" : "";
    const pets = xmls.filter(p => p.startsWith(prefix)).map(p => {
      const dir = p.substring(prefix.length, p.length - "animations.xml".length).replace(/\/+$/, "");
      return {name: (dir || source.path || source.repo).split("/").pop(), dir};
    });
    return pets.length > 0 ? pets : null;
  },

  // Finds what the link does not say: the branch (the default one), the folder (Pets/, then the root) and the list.
  async find(given)
  {
    let branches = given.branch ? [given.branch] : null;
    if(branches == null)
    {
      let info;
      try { info = await this.api(`repos/${given.owner}/${given.repo}`); }
      catch(err) { info = undefined; }   // limit reached: try the usual branches
      if(info === null) throw new Error(`The repository ${given.owner}/${given.repo} does not exist or is private.`);
      branches = info?.default_branch ? [info.default_branch] : ["master", "main"];
    }
    const folders = given.path != null ? [given.path] : ["Pets", ""];
    for(const branch of branches)
      for(const path of folders)
      {
        const source = {...given, branch, path};
        const pets = await this.petsJson(source);
        if(pets) return {source, pets};
      }
    let lastError = null;
    for(const branch of branches)
    {
      const source = {...given, branch};
      try
      {
        const pets = await this.tree(source);
        if(pets) return {source, pets};
      }
      catch(err) { lastError = err; }
    }
    throw lastError || new Error(`No pets in ${given.owner}/${given.repo}: there is no pets.json and no folder with an animations.xml.`);
  }
};

class OpenProjectFolderGitHubClass extends OpenProjectFolderClass
{
  #input = null;
  #source = null;

  constructor(iconsDiv, infoDiv, folderDiv)
  {
    super(
      folderDiv
    );

    let butt = _CN("button", {style:"margin:10px;line-height:32px;width:128px;"}, [
      _CN("img", {class:"icon icon64", "data-icon":"fileopengithub"}), 
      _CN("br"),
      "Search on github"
    ], iconsDiv);
    butt.addEventListener("click", ()=>{this.buttonPressed();});
    butt.addEventListener("mousemove", ()=>{
      infoDiv.textContent = "GitHub gallery: the pets of a GitHub repository. Paste the link of the repository, of a folder or of a single pet.";
    });
  }

  async buttonPressed(value)
  {
    if(this.#source)
    {
      this.showProjects("GitHub project");
    }
    else if(!value)
    {
      this.folderDiv.innerHTML = "";

      this.#input = _CN("input", {type:"url", placeholder:"https://github.com/owner/repository", style:"width:70vw;margin:5px;"}, [], this.folderDiv);
      this.#input.value = localStorage.getItem("github-pet-source") || "https://github.com/Adrianotiger/desktopPet";
      this.#input.addEventListener("keydown", ev=>{ if(ev.key === "Enter") this.buttonPressed(this.#input.value); });
      _CN("button", {}, ["Search"], this.folderDiv).addEventListener("click", ()=>{
        this.buttonPressed(this.#input.value);
      })
      _CN("p", {}, ["The editor reads the pets.json of the repository (in Pets/ or at the root). Without it, it lists every folder with an animations.xml."], this.folderDiv);
    }
    else
    {
      const source = GitHubPets.parse(value);
      if(source == null)
      {
        Msg.show({title:"GitHub", content:"This is not the link of a GitHub repository (github.com/owner/repository)."});
        return;
      }
      localStorage.setItem("github-pet-source", value.trim());
      this.#source = source;
      await this.loadFolders();
    }
  }

  async loadFolders()
  {
    if(this.#source == null) return;
    let found;
    try
    {
      found = await GitHubPets.find(this.#source);
    }
    catch(err)
    {
      Msg.show({title:"GitHub", content:err.message});
      return;
    }
    this.projects = [];
    found.pets.sort((a, b) => a.name.localeCompare(b.name)).forEach(pet=>{
      const project = new ProjectClass();
      project.folder = {name: pet.name, url: GitHubPets.folderUrl(found.source, pet)};
      project.files = [];
      project.projType = "github";
      this.projects.push(project);
    });
    this.folderDiv.innerHTML = "";
    this.showProjects(`Open from github.com/${found.source.owner}/${found.source.repo}`);
  }

  // the list replaces the button: keep the link above it, to search another repository
  showProjects(title)
  {
    super.showProjects(title);
/*
    const again = _CN("button", {}, ["Search"]);
    again.addEventListener("click", ()=>{this.buttonPressed();});
    this.div.prepend(_CN("p", {}, [this.#input, again]));
*/
  }

  async loadFiles()
  {
    await Promise.all(this.projects.map(async p=>{
      p.files = ["animations.xml"];
      const icon = await this.getFile(p, "icon.png");
      if(icon)
      {
        p.files.push("icon.png");
        p.icon = icon;
      }
    }));
  }

  async getFile(project, filename)
  {
    try
    {
      const r = await fetch(project.folder.url + filename);
      if(!r.ok) return null;
      return new File([await r.blob()], filename);
    }
    catch(err)
    {
      return null;
    }
  }
};