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
    super(xml, "header");
    console.log(xml);

    super.addValue(
      "author", 
      xmlNodeGet(xml, 'author')??"Unknown", 
      XMLValue.Type.STRING
    );

    super.addValue(
      "title", 
      xmlNodeGet(xml, 'title')??"Unknown Title", 
      XMLValue.Type.STRING
    );

    super.addValue(
      "version", 
      xmlNodeGet(xml, 'version')??"0.1", 
      XMLValue.Type.STRING
    );

    super.addValue(
      "info", 
      xmlNodeGet(xml, 'info')??"No info", 
      XMLValue.Type.STRING
    );

    super.addValue(
      "application", 
      xmlNodeGet(xml, 'application')??1, 
      XMLValue.Type.INT
    );
    
    super.addValue(
      "icon", 
      xmlNodeGet(xml, 'icon')??"AAABAAEAMDAAAAAAIACJAAAAFgAAAIlQTkcNChoKAAAADUlIRFIAAAAwAAAAMAgGAAAAVwL5hwAAAFBJREFUeJztz0ENACAQwLAD/55BBI+GZFWwrZk587GtA141oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgNaA1oDWgXfd6AV/xEwpFAAAAAElFTkSuQmCC", 
      XMLValue.Type.CDATA
    );

    //  petname is here, as the .net application saved it here
    super.addValue(
      "petname", 
      xmlNodeGet(xml, 'petname')??"Unknown Pet name", 
      XMLValue.Type.STRING
    );

  }

  get author() { return this.getValue("author"); }
  set author(value) { this.setValue("author", value); }

  get title() { return this.getValue("title"); }
  set title(value) { this.setValue("title", value); }

  get petname() { return this.getValue("petname"); }
  set petname(value) { this.setValue("petname", value); }

  get version() { return this.getValue("version"); }
  set version(value) { this.setValue("version", value); }

  get info() { return this.getValue("info"); }
  set info(value) { this.setValue("info", value); }

  get application() { return this.getValue("application"); }
  set application(value) { this.setValue("application", value); }

  get icon() { return this.getValue("icon"); }
  set icon(value) { this.setValue("icon", value); }
  
};
