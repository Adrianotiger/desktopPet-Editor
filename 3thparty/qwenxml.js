
        /**
         * XmlNotepad Library
         * Renders XML as a TreeGrid (Node | Value) similar to XML Notepad.
         */
class XmlNotepad {
    constructor(targetSelector, xmlString) {
        this.container = typeof targetSelector === 'string' 
            ? document.querySelector(targetSelector) 
            : targetSelector;
        
        if (!this.container) return console.error('Target not found.');

        this.container.classList.add('xml-notepad');
        this.xmlString = xmlString;
        this.render();
    }

    // Future-proof: Update XML dynamically
    updateXml(newXmlString) {
        this.xmlString = newXmlString;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="np-header">
                <div class="np-col-node">Node</div>
                <div class="np-col-value">Value</div>
            </div>
            <div class="np-body"></div>
        `;

        const body = this.container.querySelector('.np-body');
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(this.xmlString, "application/xml");

        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
            body.innerHTML = `<div class="np-error">Invalid XML: ${parseError.textContent}</div>`;
            return;
        }

        // Render root children
        for (let child of xmlDoc.childNodes) {
            if (child.nodeType === Node.TEXT_NODE && !child.nodeValue.trim()) continue;
            this._renderNode(child, body, 0);
        }
    }

    compare(original)
    {
        const rowsOriginal = [...original.container.getElementsByClassName("np-row")];
        const rowsThis = [...this.container.getElementsByClassName("np-row")];
        let diffs = 0;
        rowsOriginal.forEach((ro, j) => {
            if(j >= rowsThis.length) return;
            if(ro.textContent != rowsThis[j].textContent)
            {
                diffs++;
                rowsThis[j].classList.add("error");
            }
        });
        [...original.container.getElementsByClassName("np-collapsed")].forEach(d=>{
            d.classList.remove("np-collapsed");
        });
        [...this.container.getElementsByClassName("np-collapsed")].forEach(d=>{
            d.classList.remove("np-collapsed");
        });
        console.log("Total differences: " + diffs);
    }

    _renderNode(node, parentContainer, depth) {
        const indentPx = depth * 24;

        switch (node.nodeType) {
            case Node.ELEMENT_NODE:
                if(node.attributes?.length == 0 && node.childNodes.length == 1 && node.childNodes[0].nodeType == Node.TEXT_NODE)
                {
                    if(node.tagName == "base64")
                        //this._renderCData(node.childNodes[0]??node, parentContainer, indentPx, "base64");
                        this._renderElement(node, parentContainer, depth, indentPx);
                    else
                        this._renderText(node.childNodes[0], parentContainer, indentPx, node.tagName);
                }
                else
                  this._renderElement(node, parentContainer, depth, indentPx);
                break;
            case Node.ATTRIBUTE_NODE:
                this._renderAttribute(node, parentContainer, indentPx);
                break;
            case Node.TEXT_NODE:
                if (node.nodeValue.trim()) {
                    if(node.parentElement.tagName=="base64")
                        this._renderCData(node, parentContainer, indentPx);
                    else
                        this._renderText(node, parentContainer, indentPx);
                }
                break;
            case Node.CDATA_SECTION_NODE:
                this._renderCData(node, parentContainer, indentPx);
                break;
            case Node.COMMENT_NODE:
                this._renderComment(node, parentContainer, indentPx);
                break;
            case Node.DOCUMENT_TYPE_NODE:
                this._renderDoctype(node, parentContainer, indentPx);
                break;
            case Node.PROCESSING_INSTRUCTION_NODE:
                // e.g., <?xml version="1.0"?>
                this._renderPI(node, parentContainer, indentPx);
                break;
            default: console.error("Invalid node type: ", node.nodeType);
        }
    }

    _createRow(depth, indentPx) {
        const row = document.createElement('div');
        row.className = 'np-row';
        
        const cellNode = document.createElement('div');
        cellNode.className = 'np-cell-node';
        
        const indent = document.createElement('span');
        indent.className = 'np-indent';
        indent.style.width = `${indentPx}px`;
        cellNode.appendChild(indent);

        const cellValue = document.createElement('div');
        cellValue.className = 'np-cell-value';

        row.appendChild(cellNode);
        row.appendChild(cellValue);
        return { row, cellNode, cellValue };
    }

    _renderElement(node, parentContainer, depth, indentPx) {
        const wrapper = document.createElement('div');
        if(depth > 0)
            wrapper.className = 'np-element-wrapper np-collapsed';
        else 
            wrapper.className = 'np-element-wrapper';
        
        const { row, cellNode, cellValue } = this._createRow(depth, indentPx);
        
        // Toggle
        const hasChildren = node.childNodes.length > 0;
        const toggle = document.createElement('span');
        toggle.className = hasChildren ? 'np-toggle' : 'np-toggle-placeholder';
        toggle.textContent = ' ';
        cellNode.appendChild(toggle);

        // Icon
        //const icon = document.createElement('span');
        //icon.className = 'np-icon';
        //icon.textContent = '🟢';
        //cellNode.appendChild(icon);

        // Name
        const name = document.createElement('span');
        name.className = 'np-name';
        name.textContent = node.nodeName;
        cellNode.appendChild(name);

        wrapper.appendChild(row);

        // Render Attributes
        for (let attr of node.attributes) {
            this._renderAttribute(attr, wrapper, indentPx + 24);
        }

        // Children Container
        if (hasChildren) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'np-children';
            
            for (let child of node.childNodes) {
                this._renderNode(child, childrenContainer, depth + 1);
            }
            wrapper.appendChild(childrenContainer);

            // Toggle Logic
            row.addEventListener('click', (e) => {
                // Don't toggle if clicking inside an expanded CDATA content
                if (e.target.closest('.np-cdata-content')) return;
                wrapper.classList.toggle('np-collapsed');
            });
        }

        parentContainer.appendChild(wrapper);
    }

    _renderAttribute(node, parentContainer, indentPx) {
        const { row, cellNode, cellValue } = this._createRow(0, indentPx);
        
        //const placeholder = document.createElement('span');
        //placeholder.className = 'np-toggle-placeholder';
        //cellNode.appendChild(placeholder);

        const icon = document.createElement('span');
        icon.className = 'np-icon';
        icon.textContent = '🔴';
        cellNode.appendChild(icon);

        const name = document.createElement('span');
        name.className = 'np-name attr';
        name.textContent = node.name;
        cellNode.appendChild(name);

        cellValue.textContent = node.value;

        parentContainer.appendChild(row);
    }

    _renderText(node, parentContainer, indentPx, tagName) {
        const { row, cellNode, cellValue } = this._createRow(0, indentPx);
        
        //const placeholder = document.createElement('span');
        //placeholder.className = 'np-toggle-placeholder';
        //cellNode.appendChild(placeholder);

        const icon = document.createElement('span');
        icon.className = 'np-icon';
        icon.textContent = '🔵';
        cellNode.appendChild(icon);

        const name = document.createElement('span');
        name.className = 'np-name';
        name.textContent = tagName??'#text';
        cellNode.appendChild(name);

        cellValue.textContent = node.nodeValue;

        parentContainer.appendChild(row);
    }

    _renderComment(node, parentContainer, indentPx) {
        const { row, cellNode, cellValue } = this._createRow(0, indentPx);
        
        //const placeholder = document.createElement('span');
        //placeholder.className = 'np-toggle-placeholder';
        //cellNode.appendChild(placeholder);

        const icon = document.createElement('span');
        icon.className = 'np-icon';
        icon.style.background = '#BCAAA4'; // Muted gold/grey for comments
        icon.textContent = '//';
        cellNode.appendChild(icon);

        const name = document.createElement('span');
        name.className = 'np-name comment';
        name.textContent = '<!-- -->';
        cellNode.appendChild(name);

        cellValue.textContent = node.nodeValue;

        parentContainer.appendChild(row);
    }

    _renderCData(node, parentContainer, indentPx, tagName) {
        const text = node.nodeValue ?? node.textContent;
        const sizeBytes = new TextEncoder().encode(text).length;
        const sizeStr = sizeBytes > 1024 ? `${(sizeBytes/1024).toFixed(1)} KB` : `${sizeBytes} B`;

        const wrapper = document.createElement('div');
        const { row, cellNode, cellValue } = this._createRow(0, indentPx);
        
        //const placeholder = document.createElement('span');
        //placeholder.className = 'np-toggle-placeholder';
        //cellNode.appendChild(placeholder);

        const icon = document.createElement('span');
        icon.className = 'np-icon';
        icon.textContent = 'CD';
        cellNode.appendChild(icon);

        const name = document.createElement('span');
        name.className = 'np-name cdata';
        name.textContent = '#cdata-section';
        cellNode.appendChild(name);

        // Compact Gold Badge
        const badge = document.createElement('span');
        badge.className = 'np-cdata-badge';
        badge.textContent = `[CDATA: ${sizeStr}]`;
        cellValue.appendChild(badge);

        // Expandable Content
        const content = document.createElement('pre');
        content.className = 'np-cdata-content';
        content.style.display = 'none';
        content.textContent = text;

        wrapper.appendChild(row);
        wrapper.appendChild(content);

        badge.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = content.style.display === 'none';
            content.style.display = isHidden ? 'block' : 'none';
            badge.textContent = isHidden ? `[Hide CDATA]` : `[CDATA: ${sizeStr}]`;
        });

        parentContainer.appendChild(wrapper);
    }

    _renderDoctype(node, parentContainer, indentPx) {
        const { row, cellNode, cellValue } = this._createRow(0, indentPx);
        
        const placeholder = document.createElement('span');
        placeholder.className = 'np-toggle-placeholder';
        cellNode.appendChild(placeholder);

        const icon = document.createElement('span');
        icon.className = 'np-icon';
        icon.style.background = '#BCAAA4';
        icon.textContent = 'DT';
        cellNode.appendChild(icon);

        const name = document.createElement('span');
        name.className = 'np-name comment';
        name.textContent = '<!DOCTYPE>';
        cellNode.appendChild(name);

        cellValue.textContent = node.name;
        parentContainer.appendChild(row);
    }

    _renderPI(node, parentContainer, indentPx) {
        const { row, cellNode, cellValue } = this._createRow(0, indentPx);
        
        const placeholder = document.createElement('span');
        placeholder.className = 'np-toggle-placeholder';
        cellNode.appendChild(placeholder);

        const icon = document.createElement('span');
        icon.className = 'np-icon';
        icon.style.background = '#BCAAA4';
        icon.textContent = '?';
        cellNode.appendChild(icon);

        const name = document.createElement('span');
        name.className = 'np-name comment';
        name.textContent = `<?${node.target}?>`;
        cellNode.appendChild(name);

        cellValue.textContent = node.data;
        parentContainer.appendChild(row);
    }
}

        // ==========================================
        // Example Usage
        // ==========================================
const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- This is a sample XML document for the Notepad Viewer -->
<!DOCTYPE catalog SYSTEM "catalog.dtd">
<catalog>
</catalog>`;

// Initialize the Notepad Viewer
//const notepad = new XmlNotepad('#my-xml-notepad', sampleXml);
