class XMLAnimationsNext extends XMLNode
{
  #probability;
  #only;
  #value;
  
  constructor(xml)
  {    
    super(xml, "next");

    super.addAttribute(
      "probability", 
      xmlAttrGet(xml, 'probability')??0, 
      XMLValue.Type.INT
    );

    super.addAttribute(
      "only", 
      xmlAttrGet(xml, 'only')??"none", 
      XMLValue.Type.STRING
    );

    super.addValue(
      "_", 
      xml.textContent, 
      XMLValue.Type.INT
    );

    //this.#value = new XMLValue(xml.textContent, XMLValue.Type.INT);
  }
  
  get probability() { return this.getValue("probability"); }
  set probability(value) { this.setValue("probability", value); }
  
  get only() { return this.getValue("only"); }
  set only(value) { this.setValue("only", value); }
  
  get value() { return this.getValue("_"); }
  set value(value) { this.setValue("_", value); }
  
};
