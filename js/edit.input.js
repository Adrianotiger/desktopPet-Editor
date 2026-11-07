const INPUT = new class
{
  #div = null;
  #node = null;

  constructor()
  {

  }

  setContainer(div)
  {
    this.#div = div;
  }

  setNode(node)
  {
    this.#node = node;
  }

  createInput(valueKey, placeholder = "", options={})
  {
    let type = "text";
    let name = valueKey[0].toString().toUpperCase() + valueKey.substring(1);
    let value = this.#node[valueKey];
    let node = this.#node.xsd.getChildren(valueKey);
    if(node && node.type)
    {
      switch(node.type)
      {
        case 'xsd:string': type = "text"; break;
        case 'xsd:integer': type = "number"; break;
      }
    }

    const input = _CN("input", {type, name, placeholder, value, ...options});

    this.getHelpSpan(input, valueKey);
    
    return input;
  }

  getHelpSpan(element, valueKey)
  {
    let doc = this.#node.xsd?.getChildren(valueKey);
    if(doc?.documentation)
    {
      const isInput = (element.tagName == "INPUT");
      if(isInput) element.style.backgroundImage = 'url(images/inputinfo.png)';

      const span = _CN("span", {class:"inputInfo"}, [
        _CN("div", {}, [doc.documentation])
      ], this.#div);
      const r0 = this.#div.getBoundingClientRect();
      element.addEventListener("mousemove", (ev)=>{
        const rect = element.getBoundingClientRect();
        span.style.display = "inline-block";
        if(isInput)
        {
          span.style.left = parseInt(rect.x + rect.width - r0.x) + "px";
          span.style.top = parseInt(rect.y - r0.y) + "px";
        }
        else
        {
          if(ev.clientX < window.clientWidth * 0.65)
            span.style.left = parseInt(ev.clientX + 10 - r0.x) + "px";
          else
            span.style.left = parseInt(ev.clientX - rect.width - 10 - r0.x) + "px";
          span.style.top = parseInt(ev.clientY + 10 - r0.y) + "px";
        }
        setTimeout(()=>{span.style.opacity = 1.0;}, 20);
      });

      element.addEventListener("mouseleave", ()=>{
        span.style.display = "none";
        span.style.opacity = 0;
      });
    }
  }

  getHelp(valueKey)
  {
    let doc = this.#node.xsd?.getChildren(valueKey);
    let txt = doc?.documentation??"No HELP FOUND";
    return _CN("span", {style:"white-space:normal;font-size:14px;text-align:left;"}, [
      _CN("img", {src:"images/inputinfo.png", style:`float:left;height:${txt.length > 100?"32px":"64px"}`}),
      txt
    ]);
  }
};