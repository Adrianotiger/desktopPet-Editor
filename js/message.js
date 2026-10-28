const Msg = new class{
  #divs = [];

  constructor()
  {

  }

  show(options, ok, cancel)
  {
    const div = _CN("div", {class:"messageoverlay"}, [], document.body);
    this.#divs.push(div);
    const msg = _CN("div", {class:"messagebox", style:"transform:translate(-50%, -50%) scale(0.01)"}, [], div);
    if(options?.title)
        _CN("h2", {}, [options.title], msg);
    if(options?.content)
    {
      if(typeof options.content == "string")
        _CN("p", {}, [options.content], msg);
      else
        msg.appendChild(options.content);
    }

    let butt = _CN("button", {}, [Array.isArray(options?.buttons) ? options?.buttons[0]  : "OK"]);
    let buttDiv = _CN("div", {class:"messageboxbuttons"}, [butt], msg);
    if(ok)
    {
        butt.addEventListener("click", ()=>{ok();});
    }
    if(cancel || options.buttons.length > 1)
    {
        let butt2 = _CN("button", {}, [Array.isArray(options?.buttons) && options.buttons.length > 1 ? options?.buttons[1]  : "Cancel"], buttDiv);
        //_CN("td", {}, [butt2], buttTr);
        if(cancel) butt2.addEventListener("click", ()=>{cancel();});
        butt2.addEventListener("click", ()=>{this.close()});
    }
    if(options.buttons.length > 2)
    {
        let butt3 = _CN("button", {}, [options.buttons[2]], buttDiv);
        //_CN("td", {}, [butt3], buttTr);
        butt3.addEventListener("click", ()=>{this.close()});
    }
    //_CN("table", {style:"width:90%;"}, [buttTr], msg);
    butt.addEventListener("click", ()=>{this.close()});
    setTimeout(()=>{msg.style.transform = "translate(-50%, -50%) scale(1)";}, 20);
  }

  close()
  {
    const div = this.#divs.pop();
    div.getElementsByTagName("div")[0].style.transform = "translate(-50%, -50%) scale(0.01)";
    div.style.opacity = 0.1;
    setTimeout(()=>{
        document.body.removeChild(div);
    }, 400); 
  }
};

window.addEventListener("load", ()=>{
  Msg.show({
    title: "Preview",
    content: "This is just a preview. It doesn't fully works and you can't save your project, it just a preview of the development of this project.",
    buttons: ["OK"]
  });

});