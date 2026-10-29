class XMLValue
{
  // Keep the XML text and its parsed/evaluated form together. `original` is used when
  // preserving or serializing the XML; `value` gives the editor a typed value to work with.
  #value;
  #formulavalue;
  #valuetype;
  
  // These types control how XML text is interpreted and validated by the editor.
  static Type = Object.freeze({
    INT: "int",
    DOUBLE: "double",
    STRING: "string",
    CDATA: "cdata",
    FORMULA: "formula",
    ACTION: "action"
  });
  
  // Values used by animation sequences and transition rules.
  static Action = Object.freeze({
    NONE: "none",
    FLIP: "flip" 
  });

  // `only` restricts which screen/edge contexts can use a transition.
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
    // Formula values keep both their source expression and a computed result.
    this.#formulavalue = parseInt(str);
    
    if(this.#valuetype == XMLValue.Type.FORMULA) this.#calculateFormula();
  }
  
  #calculateFormula()
  {
    // Replace the formula language's keywords with the current screen size or the
    // editor's current placeholder values before evaluating the expression.
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
    
    // Keep an invalid formula from breaking the editor; report it and use a visible
    // fallback value so the problem can be diagnosed in the console.
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
    if(this.#valuetype == XMLValue.Type.CDATA) return `<![CDATA[${this.#value}]]>`;
    // Preserve the text as written (especially formulas) for XML output.
    return this.#value;
  }
  
  get value()
  {
    // UI code gets a number for numeric fields and the evaluated result for formulas.
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
    // Re-evaluate formulas immediately when the editor changes their source text.
    this.#value = value;
    if(this.#valuetype == XMLValue.Type.FORMULA) this.#calculateFormula();
  }

  check()
  {
    // Return a message for invalid values, or null when the value passes its type check.
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
