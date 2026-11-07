class XMLAnimationsSpawnNext extends XMLNode
{  
  constructor(xml, path)
  {        
    path += ".next";
    super(xml, path);

    super.addValue(
      "_", 
      xml.textContent, 
      XMLValue.Type.INT
    );
  }
      
  get value() { return this.getValue("_"); }
  set value(value) { this.setValue("_", value); }

};
