class XMLValue
{
  #value;
  #formulavalue;
  #valuetype;
  
  static Type = Object.freeze({
    INT: "int",
    DOUBLE: "double",
    STRING: "string",
    FORMULA: "formula",
    ACTION: "action"
  });
  
  static Action = Object.freeze({
    NONE: "none",
    FLIP: "flip"
  });

  static Only = Object.freeze({
    NONE: "none",
    VERTICAL: "vertical",
    HORIZONTAL: "horizontal",
    TASKBAR: "taskbar",
    WINDOW: "window",
    VERTICAL_PLUS: "vertical+"
  });
  
  constructor(str, type=XMLValue.Type.STRING)
  {    
    this.#value = str;
    this.#valuetype = type;
    this.#formulavalue = parseInt(str);
    
    if(this.#valuetype == XMLValue.Type.FORMULA) this.#calculateFormula();
  }
  
  #calculateFormula()
  {
    const dimensions = {
      screenW: window.innerWidth,
      screenH: window.innerHeight,
      areaW: window.innerWidth,
      areaH: window.innerHeight,
      imageW: 10,
      imageH: 10,
      imageX: 0,
      imageY: 0,
      random: 50,
      randS: 50
    };
    let expr = this.#value;
    
    Object.keys(dimensions).forEach(keyword => {
      expr = expr.replaceAll(keyword, dimensions[keyword]);
    });
    
    try
    {
      this.#formulavalue = eval(expr);
    }
    catch(e)
    {
      console.error(`Unable to evaluate '${expr}'`, e);
      this.#formulavalue = 100;
    }
  }
  
  get original()
  {
    return this.#value;
  }
  
  get value()
  {
    switch(this.#valuetype)
    {
      case XMLValue.Type.INT: return parseInt(this.#value);
      case XMLValue.Type.DOUBLE: return parseFloat(this.#value);
      case XMLValue.Type.STRING: return this.#value;
      case XMLValue.Type.FORMULA: return this.#formulavalue;
      default: return this.#value;
    }
  }
  
  set value(value)
  {
    this.#value = value;
    if(this.#valuetype == XMLValue.Type.FORMULA) this.#calculateFormula();
  }

  check()
  {
    if(this.#value == "")
      return "Value can't be empty";
    
    switch(this.#valuetype)
    {
      case XMLValue.Type.INT: 
        if(Number.isNaN(this.#value) || parseInt(this.#value) != this.#value)
          return `'${this.#value}' is not an INT`;
        break;
      case XMLValue.Type.DOUBLE: 
        if(Number.isNaN(this.#value) || parseFloat(this.#value) != this.#value)
          return `'${this.#value} is not a DOUBLE`;
        break;
      case XMLValue.Type.STRING: 
        break;
      case XMLValue.Type.FORMULA: 
        // todo: check formula!
        break;
      default: 
    }
    return null;
  }
  
};
