class XMLAnimationsSpawnNext extends XMLNode
{  
  constructor(xml)
  {        
    super(xml, "next");

    super.addAttribute(
      "probability", 
      xmlAttrGet(xml, 'probability')??100, 
      XMLValue.Type.INT
    );

    super.addValue(
      "_", 
      xml.textContent, 
      XMLValue.Type.INT
    );
  }
  
  get probability() { return this.getValue("probability"); }
  set probability(value) { this.setValue("probability", value); }
    
  get value() { return this.getValue("_"); }
  set value(value) { this.setValue("_", value); }

};
