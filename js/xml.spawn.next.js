class XMLAnimationsSpawnNext extends XMLNode
{
  probability = 100;
  _value = "";
  
  constructor(xml)
  {        
    super(xml, "next");
    this.probability = new XMLValue(xmlAttrGet(xml, 'probability')??0, XMLValue.Type.INT);
    
    this._value = new XMLValue(xml.textContent, XMLValue.Type.INT);
  }
  
};
