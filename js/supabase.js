let Supabase = new class
{
  #supabase = null;
  
  constructor()
  {
    const s = _CN("script", {src:"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"}, [], document.head);
    s.addEventListener("load", ()=>{
      this.login();
    });
  }

  login()
  {
    const SUPABASE_KEY = "sb_publishable_p7uoGhY6Nn2GvTm-b_H9aw_cdKScCPy";
    const SUPABASE_URL = "https://jurrsvjhvldxcbtrvdrf.supabase.co"
    this.#supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    console.warn(this.#supabase);

    this.#supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    }).then(r=>{
      console.warn("logged in", r);
    });
  }
} 