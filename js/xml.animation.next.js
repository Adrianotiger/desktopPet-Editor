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

    const onlyAttr = xmlAttrGet(xml, 'only');
    super.addAttribute(
      "only", 
      xmlHasAttribute(xml, 'only')?onlyAttr:"none", 
      XMLValue.Type.STRING
    );

    super.addValue(
      "_", 
      xml.textContent, 
      XMLValue.Type.INT
    );

    // upgrade XML (if a xml is not compatible with this editor)
    //if (!Object.values(XMLValue.Only).includes(onlyAttr))
    if(onlyAttr == null)
    {
      console.warn(`Upgrading only attribute from '${onlyAttr}' to '${XMLValue.Only.NONE}'`);
      super.setValue('only', XMLValue.Only.NONE)
    }
  }
  
  get probability() { return this.getValue("probability"); }
  set probability(value) { this.setValue("probability", value); }
  
  get only() { return this.getValue("only"); }
  set only(value) { this.setValue("only", value); }
  
  get value() { return this.getValue("_"); }
  set value(value) { this.setValue("_", value); }
  
};
