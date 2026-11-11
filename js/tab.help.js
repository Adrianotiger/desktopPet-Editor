class HelpTabClass extends TabClass
{ 
  #menuAdded = false;
  #basePath = "";

  constructor()
  {
    super("Help");

    //_CN("h1", {}, ["Save"], this.div);
    //_CN("hr", {}, [], this.div);

    loadScripts(["../3thparty/showdown"], true);
    this.#basePath = window.location.href || window.location.pathname; 
    //console.log("origin", window.location.origin);
    //console.log("href", window.location.href);

  }

  show(params)
  {
    super.show(params);

    this.div.innerHTML = "";
    _CN("h1", {}, [params?.title??"Help"], this.div);
    _CN("hr", {style:"margin:30px;"}, [], this.div);

    this.div.style.backgroundColor = "var(--bg-panel)";
    this.div.style.borderRadius = "20px";
    this.div.style.boxShadow = "inset 3px 3px 5px #fff, inset -3px -3px 5px #880";
    this.div.style.padding = "20px";
    this.div.style.textAlign = "left";
    this.div.classList.add("markdown");

    if(!this.#menuAdded)
    {
      this.#menuAdded = true;
      TabMenu.addIcon("editclose", "Close Help", ()=>{
        Tabs.removeTop();
      });
    }

    if(params?.link)
    {
      const link = `help/${params.link.split('#')[0].toLowerCase()}.md`;
      const converter = new showdown.Converter({smartIndentationFix:'false', simpleLineBreaks:'true'});
      fetch(link).then(res=>{
        return res.text();
      }).then(txt=>{
        let html = converter.makeHtml(txt);
        
        // replace any md file to a link for this editor...
        html = html.replace(/\.\.\/help\/([^#"\s>]+)\.md(#[^"\s>]+)?/g, "javascript:HelpTab.show({title:'Link', link:'$1$2'})");
        // replace every ../ link to an absolute link
        html = html.replace(/(\.\.\/)/g, `${this.#basePath}/`);

        this.div.innerHTML = html;

        if(params?.link?.indexOf('#') > 0)
        {
          setTimeout(()=>{
            const id = params.link.split('#')[1].toLowerCase();
            if(document.getElementById(id))
            {
              document.getElementById(id).scrollIntoView({
                behavior: "smooth",
                block: "start",  
                inline: "nearest"
              });
            }
          }, 200);
        }
      }).catch(err =>{
        console.error(err);
      });
      
    }

  }

  hide()
  {
    super.hide();
    this.#menuAdded = false;
  }
  
};

const HelpTab = new HelpTabClass();