class XsdNode {
  constructor() {
    this.name = "";
    this.type = "";
    this.valueType = null;
    this.documentation = "";
    this.attributes = [];
    this.children = [];
    this.choices = [];
    this.minOccurs = 1;
    this.maxOccurs = 1;
  }
  getChildren(key)
  {
    for(let j=0;j<this.children.length;j++) if(this.children[j].name == key) return this.children[j];
    // not found? try on choices
    for(let j=0;j<this.choices.length;j++) {
      for(let k=0;j<this.choices[j].options.length;k++) {
        if(this.choices[j].options[k].name == key) return this.choices[j].options[k];
      }
    }
    return null;
  }
}

class XsdChoice {
  constructor() {
    this.options = [];
    this.minOccurs = 1;
    this.maxOccurs = 1;
  }
}

class XsdAttribute {
  constructor() {
    this.name = "";
    this.type = "";
    this.required = false;
    this.documentation = "";
  }
}

const XSD = new class
{
  #xsdDoc = null;
  #elements = [];
  #groups = {};

  constructor()
  {
  }

  async fetchXSD()
  {
    let xsdPromise = await fetch("https://adrianotiger.github.io/desktopPet/Resources/animations.xsd");
    let xsdString = await xsdPromise.text();

    const parser = new DOMParser();
    this.#xsdDoc = parser.parseFromString(xsdString, "text/xml");

    const schema = this.#xsdDoc.documentElement;

    this.#elements = [];
    this.#groups = {};

    for (const node of schema.children) {
      if(node.localName == "group")
      {
        const name = node.getAttribute("name");
        if(name) this.#groups[name] = node;
      }
    }

    for (const node of schema.children) {
      if (this.isElement(node, "element")) {
        this.#elements.push(this.parseElement(node));
      }
    }

    console.log(this.#elements);
  }

  xsdNode(path, element=null)
  {
    if(!Array.isArray(path)) path = path.split(".");
    if(element == null) element = this.#elements;

    const name = path.shift();
    let node1 = null;
    let node2 = null;
    if(!Array.isArray(element)) 
    {
      element.children.forEach(elc=>{if(elc.name == name) node1 = elc;});
      if(element.choices.length > 0)
        element.choices[0].options.forEach(elc=>{if(elc.name == name) node2 = elc;});
    }
    else
    {
      element.forEach(el=>{
        if(el.name == name) node1 = el;
      });
    }
    if(!node1 && !node2) return null;
    if(path.length == 0) return node1 || node2;
    if(name == "sequence")
    {
      node2 = "sequence";
    }
    let retNode = this.xsdNode(path, node1);
    if(retNode == null) // not found by children, try choice
    {
      console.log("A");
      for(let j=0;j<node1.choices[0].options.length;j++)
      {
        retNode = this.xsdNode(path, node1.choices[0].options[j]);
        if(retNode) return retNode;
      }
    }
    return retNode; 
  }

  isElement(node, localName) 
  {
    return node.localName === localName;
  }

  parseElement(elementNode) 
  {
    const result = new XsdNode();

    result.name = elementNode.getAttribute("name") || elementNode.getAttribute("ref") || "";
    result.type = elementNode.getAttribute("type") || "";
    result.documentation = this.getDocumentation(elementNode);

    const complexType = Array
        .from(elementNode.children)
        .find(x => x.localName === "complexType");

    if (complexType) {
        this.parseComplexType(complexType, result);
    }

    return result;
  }

  parseComplexType(complexTypeNode, target) 
  {
    for (const child of complexTypeNode.children) 
    {
      switch (child.localName) 
      {
        case "sequence":
          target.compositor = "sequence";
          this.parseSequence(child, target);
          break;

        case "all":
          target.compositor = "all";
          this.parseAll(child, target);
          break;

        case "choice":
          target.compositor = "choice";
          this.parseChoice(child, target);
          break;

        case "attribute":
          target.attributes.push(
              this.parseAttribute(child)
          );
          break;

        case "group":
          //target.compositor = "group";
          this.parseGroup(child, target);
          break;

        case "simpleContent":
          this.parseSimpleContent(child, target);
          break;
        
        default:
          console.error(`Error on XSD: ${child.localName} not defined`);
      }
    }
  }

  parseSequence(sequenceNode, parent) 
  {
    for (const child of sequenceNode.children) 
    {
      if (child.localName === "element") 
      {
        const node = this.parseElement(child);
        node.minOccurs =
            Number(child.getAttribute("minOccurs") || 1);
        node.maxOccurs =
            child.getAttribute("maxOccurs") || 1;
        parent.children.push(node);
      }
    }
  }

  parseAll(allNode, parent)
  {
    for (const child of allNode.children)
    {
      if (child.localName === "element")
      {
        parent.children.push(
            this.parseElement(child)
        );
      }
    }
  }

  parseChoice(choiceNode, parent)
  {
    const choice = new XsdChoice();
    choice.minOccurs =
      Number(choiceNode.getAttribute("minOccurs") || 1);
    choice.maxOccurs =
      choiceNode.getAttribute("maxOccurs") || 1;

    for (const child of choiceNode.children)
    {
      if (child.localName === "element")
      {
        choice.options.push(
            this.parseElement(child)
        );
      }
    }
    parent.choices.push(choice);
  }

  parseAttribute(attributeNode) 
  {
    const attr = new XsdAttribute();
    attr.name =
        attributeNode.getAttribute("name") || "";
    attr.type =
        attributeNode.getAttribute("type") || "";
    attr.required =
        attributeNode.getAttribute("use") === "required";
    attr.documentation =
        this.getDocumentation(attributeNode);
    return attr;
  }

  parseGroup(groupNode, target)
  {
    const ref = groupNode.getAttribute("ref");
    if(!ref)
      return;

    const definition = this.#groups[ref];
    if(!definition)
      return;

    for(const child of definition.children)
    {
      switch(child.localName)
      {
        case "sequence":
            this.parseSequence(child, target);
            break;
        case "all":
            this.parseAll(child, target);
            break;
        case "choice":
            this.parseChoice(child, target);
            break;
      }
    }
  }

  parseSimpleContent(simpleContentNode, target)
  {
    const extension =
      Array.from(simpleContentNode.children)
        .find(x => x.localName === "extension");

    if(!extension)
      return;

    target.valueType =
      extension.getAttribute("base");

    for(const child of extension.children)
    {
      if(child.localName === "attribute")
      {
        target.attributes.push(
          this.parseAttribute(child)
        );
      }
    }
  }

  getDocumentation(node) 
  {
    const annotation = Array
        .from(node.children)
        .find(x => x.localName === "annotation");

    if (!annotation)
        return "";

    const doc = Array
        .from(annotation.children)
        .find(x => x.localName === "documentation");

    return doc?.textContent?.trim() ?? "";
  }
}