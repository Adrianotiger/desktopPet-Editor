let lastFilterText = "";

class TextFilterIcon
{
  #func = null;

  constructor(div)
  {
    let input = _CN("input", {type:"text", value:"", placeholder:"filter text", style:"width:20px;"}, [], div);
    let button = _CN("button", {}, [_CN("img", {class:"icon", "data-icon":"editfilter", style:""})], div);

    button.addEventListener("click", ()=>{
      if(parseInt(input.style.width) < 50)
      {
        input.style.width = "150px";
        input.value = lastFilterText;
        input.selectionStart = 0;
        input.focus();

        if(typeof this.#func != 'undefined')
          this.#func(input.value);
      }
      else
      {
        input.style.width = "0px";
        if(typeof this.#func != 'undefined')
          this.#func("");
      }
    });

    input.addEventListener("input", (ev)=>{
      lastFilterText = input.value;
      if(typeof this.#func != 'undefined')
        this.#func(input.value);
    });
  }

  onEdit(func)
  {
    this.#func = func;
  }

}
