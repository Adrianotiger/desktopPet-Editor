let Supabase = new class
{
  #supabase = null;
  #user = null;
  #scriptloaded = false;
  #signedin = false;

  #bucket = "pets";
  #downloadver = 1;

  get isSignedIn() { return this.#signedin; }
  get isScriptLoaded() {return this.#scriptloaded; }
  
  constructor()
  {
    const s = _CN("script", {src:"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"}, [], document.head);

    s.addEventListener("load", ()=>{
      const SUPABASE_KEY = "sb_publishable_p7uoGhY6Nn2GvTm-b_H9aw_cdKScCPy";
      const SUPABASE_URL = "https://jurrsvjhvldxcbtrvdrf.supabase.co"
      this.#supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

      this.#supabase.auth.onAuthStateChange((event, session) => {
        console.log("Supabase event: ", event);
        if(event == "SIGNED_IN" || event == "TOKEN_REFRESHED") this.#authStateChanged(session);
      });

      console.warn(this.#supabase);

      this.#scriptloaded = true;
    });
  }

  login()
  {
    if(!this.#scriptloaded)
    {
      setTimeout(()=>{this.login();}, 500);
      return;
    }

    this.#supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname
      }
    }).then(r=>{
      this.#signedin = true;
      console.warn("logged in", r);
    });
  }

  #authStateChanged(session)
  {
    const userInfoEl = document.getElementById('user-info');

    if(this.#user == null) this.#supabase.auth.getUser().then(ud=>{ 
      this.#user = ud.data.user || ud.data.error; 
      if(ud.data.user) this.#signedin = true;
    });
    if(userInfoEl == null) return;

    userInfoEl.innerHTML = "";
        
    if (session && session.user) 
    {
      const user = session.user;

      if(this.#user == null) this.#user = user;
      
      const name = user.user_metadata?.full_name || user.email;
      const email = user.email;
      const avatar = user.user_metadata?.avatar_url;

      _CN("img", {src:`${avatar??''}`, style:"width:32px;height:32px;border-radius:50%;vertical-align:middle;"}, [], userInfoEl);
      _CN("span", {}, [` Hi ${name} (${email})!`], userInfoEl);
    } 
    else 
    {
      userInfoEl.textContent = 'Not logged in';
    }
  }

  async getDirectoryFiles(path = "")
  {
    let storage = await this.#supabase.storage
      .from(this.#bucket)
      .list(this.#user.id + "/" + path);

    if(storage?.data?.length == 0) // new user!
    {
      const { data, error } = await this.#supabase.functions.invoke('create-pet-folder', {
        body: {"folderName":"TestPet"}
      });
      
      console.log(data, error);

      storage = await this.#supabase.storage
        .from(this.#bucket)
        .list(this.#user.id);
    }

    return storage.data || [];
  }

  getPublicLink(folder)
  {
    console.warn(this.#supabase);
    return `${this.#supabase.supabaseUrl}/storage/v1/object/public/${this.#bucket}/${this.#user.id}`;
  }

  async downloadFile(path = "")
  {
    const { data, error } = await this.#supabase.storage
      .from(this.#bucket)
      .download(`${this.#user.id}/${path}`, {cacheNonce:this.#downloadver}, {cache:"no-cache"});

    this.#downloadver++;

    return data;
  }

  saveXML(path, xml)
  {
    return this.#supabase.functions.invoke('replace-animations-xml', {
      body: {content:xml, path:path}
    });
  }

} 