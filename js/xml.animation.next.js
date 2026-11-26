class XMLAnimationsNext extends XMLNode
{  
  constructor(xml, path)
  {    
    path += ".next";
    super(xml, path);
    let onlyAttr = "";

    (this.xsd.children.length > 0 ? this.xsd.children[0].attributes : this.xsd.attributes).forEach(ca=>{
      switch(ca.name)
      {
        case 'probability':
          super.addAttribute(
            ca.name, 
            xmlAttrGet(xml, ca.name)??0, 
            XMLValue.Type.INT
          );
          break;
        case 'only':
          onlyAttr = xmlAttrGet(xml, ca.name);
          super.addAttribute(
            ca.name, 
            xmlHasAttribute(xml, ca.name) ? onlyAttr:"none", 
            XMLValue.Type.STRING,
          );
          break;
        case 'direction':
          const dirAttr = xmlAttrGet(xml, ca.name);
          super.addAttribute(
            ca.name, 
            xmlHasAttribute(xml, ca.name) ? dirAttr:"any", 
            XMLValue.Type.STRING,
          );
          break;
        case 'trigger':
          super.addAttribute(
            ca.name, 
            xmlAttrGet(xml, ca.name)??1, 
            XMLValue.Type.INT
          );
          break;
      }
    });
    
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

  get trigger() { return this.getValue("trigger"); }
  set trigger(value) { this.setValue("trigger", value); }

  get direction() { return this.getValue("direction"); }
  set direction(value) { this.setValue("direction", value); }
  
};
