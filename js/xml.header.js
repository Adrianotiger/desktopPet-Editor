class XMLAnimationsHeader extends XMLNode
{
  #author = "";
  #title = "";
  #petname = "";
  #version = "";
  #info = "";
  #application = 1;
  #icon = "";
  
  constructor(xml)
  {
    super();
    console.log(xml);
    
    this.#author = new XMLValue(xmlNodeGet(xml, 'author')??"Unknown", XMLValue.Type.STRING);
    this.#title = new XMLValue(xmlNodeGet(xml, 'title')??"Unknown Title", XMLValue.Type.STRING);
    this.#petname = new XMLValue(xmlNodeGet(xml, 'petname')??"Unknown Pet name", XMLValue.Type.STRING);
    this.#version = new XMLValue(xmlNodeGet(xml, 'version')??"0.1", XMLValue.Type.STRING);
    this.#info = new XMLValue(xmlNodeGet(xml, 'info')??"No info", XMLValue.Type.STRING);
    this.#application = new XMLValue(xmlNodeGet(xml, 'application')??1, XMLValue.Type.INT);
    this.#icon = new XMLValue(xmlNodeGet(xml, 'icon')??"AAABAAEAMDAAAAAAIACJAAAAFgAAAIlQTkcNChoKAAAADUlIRFIAAAAwAAAAMAgGAAAAVwL5hwAAAFBJREFUeJztz0ENACAQwLAD/55BBI+GZFWwrZk587GtA141oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgXfd6AV/xEwpFAAAAAElFTkSuQmCC", XMLValue.Type.STRING);
  }
  
  get author() { return this.#author.value; }
  set author(value) { this.#author.value = value; }
  
  // continue...
  
};
