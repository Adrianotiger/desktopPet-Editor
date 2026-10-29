/**
 * SimpleEditor v1.2.0
 * A lightweight, class-based content editor with custom formatting.
 *
 * Usage (script tag):
 *   <div id="my-editor"></div>
 *   <script src="simple-editor.js"></script>
 *   <script>
 *     var editor = new SimpleEditor('#my-editor', { markdown: true });
 *     editor.setContent('Hello **world**');
 *     console.log(editor.toHTML());
 *     console.log(editor.getContent());
 *   </script>
 *
 * Usage (module):
 *   import SimpleEditor from './simple-editor.js';
 *
 * Custom syntax (always available):
 *   [br]              → Line break
 *   [link:url]        → Link (URL as label)
 *
 * Markdown (when { markdown: true }, rendered visually):
 *   **bold**          → Bold
 *   *italic*          → Italic
 *   __underline__     → Underline
 *   # / ## / ###      → Headings (H1–H3)
 *   - item            → Unordered list item
 *
 * API:
 *   new SimpleEditor(target, options)
 *   editor.getContent()              → raw format string
 *   editor.setContent(text)          → set from raw format
 *   editor.toHTML()                  → current content as HTML
 *   editor.fromHTML(html)            → load HTML (converts back)
 *   editor.setMarkdown(bool)         → toggle visual markdown
 *   editor.isMarkdownEnabled()
 *   editor.undo()                    → undo last change
 *   editor.destroy()
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SimpleEditor = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ─── Embedded CSS (auto-injected once) ────────────────────────
  var CSS = [
    '.simple-editor{font-family:"Segoe UI",system-ui,-apple-system,sans-serif;border:2px solid #e2e8f0;border-radius:8px;overflow:hidden;transition:border-color .2s ease;position:relative}',
    '.simple-editor:focus-within{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.1)}',
    '.simple-editor__toolbar{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:2px;padding:8px;background:#f8fafc;border-bottom:1px solid #e2e8f0}',
    '.simple-editor__toolbar-left{display:flex;flex-wrap:wrap;gap:2px;align-items:center}',
    '.simple-editor__toolbar-right{display:flex;align-items:center;gap:4px;margin-left:auto}',
    '.simple-editor__qwen-logo{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;color:#6366f1;opacity:0.7;transition:opacity .15s ease}',
    '.simple-editor__qwen-logo:hover{opacity:1}',
    '.simple-editor__qwen-logo svg{display:block}',
    '.simple-editor__btn{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border:1px solid transparent;border-radius:6px;background:transparent;cursor:pointer;font-size:14px;color:#475569;transition:all .15s ease;user-select:none}',
    '.simple-editor__btn:hover{background:#e2e8f0;color:#1e293b;border-color:#cbd5e1}',
    '.simple-editor__btn:active{background:#cbd5e1;transform:scale(.95)}',
    '.simple-editor__select{display:inline-flex;align-items:center;justify-content:center;height:34px;padding:0 8px;border:1px solid transparent;border-radius:6px;background:transparent;cursor:pointer;font-size:13px;color:#475569;transition:all .15s ease;user-select:none;outline:none}',
    '.simple-editor__select:hover{background:#e2e8f0;color:#1e293b;border-color:#cbd5e1}',
    '.simple-editor__select:focus{background:#e2e8f0;border-color:#6366f1}',
    '.simple-editor__select option{padding:4px}',
    '.simple-editor__content{min-height:200px;max-height:500px;background-color:#fff;overflow-y:auto;padding:16px;font-size:14px;line-height:1.6;color:#1e293b;white-space:pre-wrap;word-wrap:break-word;outline:none}',
    '.simple-editor__content:empty::before{content:attr(data-placeholder);color:#94a3b8;pointer-events:none}',
    '.simple-editor__content a{color:#6366f1;text-decoration:underline;cursor:pointer}',
    '.simple-editor__content a:hover{color:#4f46e5}',
    '.simple-editor__content h1{font-size:1.6em;font-weight:700;margin:.4em 0 .2em;line-height:1.3}',
    '.simple-editor__content h2{font-size:1.35em;font-weight:600;margin:.3em 0 .2em;line-height:1.3}',
    '.simple-editor__content h3{font-size:1.15em;font-weight:600;margin:.3em 0 .2em;line-height:1.3}',
    '.simple-editor__content ul{list-style-type:disc;padding-left:1.5em;margin:.3em 0}',
    '.simple-editor__content li{margin:.15em 0}',
    '.simple-editor__watermark{position:absolute;bottom:8px;right:12px;font-size:11px;color:#cbd5e1;pointer-events:none;user-select:none;opacity:0.6;font-weight:500;letter-spacing:0.02em}',
    '.simple-editor--dark{border-color:#334155}',
    '.simple-editor--dark:focus-within{border-color:#818cf8;box-shadow:0 0 0 3px rgba(129,140,248,.15)}',
    '.simple-editor--dark .simple-editor__toolbar{background:#1e293b;border-bottom-color:#334155}',
    '.simple-editor--dark .simple-editor__btn{color:#94a3b8}',
    '.simple-editor--dark .simple-editor__btn:hover{background:#334155;color:#e2e8f0;border-color:#475569}',
    '.simple-editor--dark .simple-editor__select{color:#94a3b8}',
    '.simple-editor--dark .simple-editor__select:hover{background:#334155;color:#e2e8f0;border-color:#475569}',
    '.simple-editor--dark .simple-editor__select:focus{background:#334155;border-color:#818cf8}',
    '.simple-editor--dark .simple-editor__content{color:#e2e8f0;background:#0f172a}',
    '.simple-editor--dark .simple-editor__content:empty::before{color:#64748b}',
    '.simple-editor--dark .simple-editor__content a{color:#818cf8}',
    '.simple-editor--dark .simple-editor__watermark{color:#475569}',
    '.simple-editor--dark .simple-editor__qwen-logo{color:#818cf8}'
  ].join('\n');

  var stylesInjected = false;
  function injectStyles() {
    if (stylesInjected) return;
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    stylesInjected = true;
  }

  // ─── Constructor ──────────────────────────────────────────────

  function SimpleEditor(target, options) {
    options = options || {};

    // Resolve target element
    if (typeof target === 'string') {
      this.target = document.querySelector(target);
      if (!this.target) throw new Error('SimpleEditor: Target "' + target + '" not found');
    } else {
      this.target = target;
    }

    this.options = {
      markdown: !!options.markdown,
      toolbar: options.toolbar !== false,
      buttons: options.buttons || ['bold', 'italic', 'underline', 'heading', 'list', 'link', 'linebreak', 'undo'],
      theme: options.theme || 'light',
      placeholder: options.placeholder || 'Start typing...',
      onChange: options.onChange || null,
      className: options.className || '',
      maxheight: options.maxheight || "500px"
    };

    this.lastContent = '';
    this.undoStack = [];
    this.maxUndoSize = 50;

    injectStyles();
    this._build();
    this._bindEvents();
  }

  // ─── Public API ───────────────────────────────────────────────

  SimpleEditor.prototype.getContent = function () {
    if (this.options.markdown) {
      return this._domToFormat(this.editorArea);
    }
    return this.editorArea.innerText || '';
  };

  SimpleEditor.prototype.setContent = function (content) {
    this._saveUndo();
    if (this.options.markdown) {
      this.editorArea.innerHTML = this._formatToHTML(content);
    } else {
      this.editorArea.innerText = content;
    }
    this.lastContent = content;
  };

  SimpleEditor.prototype.toHTML = function () {
    if (this.options.markdown) {
      return this.editorArea.innerHTML;
    }
    return this._formatToHTML(this.getContent());
  };

  SimpleEditor.prototype.fromHTML = function (html) {
    this._saveUndo();
    if (this.options.markdown) {
      this.editorArea.innerHTML = html;
    } else {
      this.setContent(this._htmlToFormat(html));
    }
  };

  SimpleEditor.prototype.getPreview = function () {
    return this.toHTML();
  };

  SimpleEditor.prototype.destroy = function () {
    this._unbindEvents();
    this.target.innerHTML = '';
  };

  SimpleEditor.prototype.setMarkdown = function (enabled) {
    var current = this.getContent();
    this._saveUndo();
    this.options.markdown = !!enabled;
    if (enabled) {
      this.editorArea.innerHTML = this._formatToHTML(current);
    } else {
      this.editorArea.innerText = current;
    }
  };

  SimpleEditor.prototype.isMarkdownEnabled = function () {
    return this.options.markdown;
  };

  SimpleEditor.prototype.undo = function () {
    if (this.undoStack.length > 0) {
      var prev = this.undoStack.pop();
      if (this.options.markdown) {
        this.editorArea.innerHTML = prev;
      } else {
        this.editorArea.innerText = prev;
      }
      this.lastContent = this.getContent();
    }
  };

  // ─── Conversion: Format → HTML ────────────────────────────────

  SimpleEditor.prototype._formatToHTML = function (text) {
    var html = this._escapeHtml(text);

    // [br] → <br>
    html = html.replace(/\[br\]/gi, '<br>');

    // [link:url] → <a>
    html = html.replace(/\[link:([^\]]+)\]/gi, function (_, url) {
      return '<a href="' + url + '">' + url + '</a>';
    });

    if (this.options.markdown) {
      // Headings (must run before inline)
      html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
      html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
      html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

      // Inline: bold, italic, underline
      html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
      html = html.replace(/__(.+?)__/g, '<u>$1</u>');

      // Lists: consecutive "- ..." lines
      html = html.replace(/(^|\n)(- .+(?:\n- .+)*)/g, function (_, prefix, block) {
        var items = block.split('\n').map(function (line) {
          return '<li>' + line.replace(/^- /, '') + '</li>';
        }).join('');
        return prefix + '<ul>' + items + '</ul>';
      });
    }

    // Remaining newlines
    html = html.replace(/\n/g, '<br>');
    return html;
  };

  // ─── Conversion: HTML → Format ────────────────────────────────

  SimpleEditor.prototype._htmlToFormat = function (html) {
    var text = html;

    text = text.replace(/<a\s+href="([^"]*)"[^>]*>[\s\S]*?<\/a>/gi, function (_, url) {
      return '[link:' + url + ']';
    });

    text = text.replace(/<br\s*\/?>/gi, '[br]');

    if (this.options.markdown) {
      text = text.replace(/<h3>([\s\S]*?)<\/h3>/gi, '### $1');
      text = text.replace(/<h2>([\s\S]*?)<\/h2>/gi, '## $1');
      text = text.replace(/<h1>([\s\S]*?)<\/h1>/gi, '# $1');
      text = text.replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**');
      text = text.replace(/<b>([\s\S]*?)<\/b>/gi, '**$1**');
      text = text.replace(/<em>([\s\S]*?)<\/em>/gi, '*$1*');
      text = text.replace(/<i>([\s\S]*?)<\/i>/gi, '*$1*');
      text = text.replace(/<u>([\s\S]*?)<\/u>/gi, '__$1__');
      text = text.replace(/<ul>([\s\S]*?)<\/ul>/gi, function (_, content) {
        return content.replace(/<li>([\s\S]*?)<\/li>/gi, '- $1').replace(/<br\s*\/?>/gi, '\n');
      });
    }

    text = text.replace(/<[^>]+>/g, '');
    text = this._unescapeHtml(text);
    text = text.replace(/(\[br\])+\s*$/, '');
    return text;
  };

  // ─── Conversion: DOM → Format ─────────────────────────────────

  SimpleEditor.prototype._domToFormat = function (root) {
    var result = '';
    var self = this;

    function walk(node) {
      if (node.nodeType === 3) { // TEXT
        result += node.textContent || '';
        return;
      }
      if (node.nodeType !== 1) return;

      var tag = node.tagName.toLowerCase();
      var i;

      switch (tag) {
        case 'br':
          result += '[br]';
          break;

        case 'a': {
          var href = node.getAttribute('href') || '';
          result += '[link:' + href + ']';
          break;
        }

        case 'strong':
        case 'b':
          if (self.options.markdown) {
            result += '**';
            for (i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
            result += '**';
          } else {
            for (i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
          }
          break;

        case 'em':
        case 'i':
          if (self.options.markdown) {
            result += '*';
            for (i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
            result += '*';
          } else {
            for (i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
          }
          break;

        case 'u':
          if (self.options.markdown) {
            result += '__';
            for (i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
            result += '__';
          } else {
            for (i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
          }
          break;

        case 'h1':
          if (self.options.markdown) result += '# ';
          for (i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
          result += '[br]';
          break;

        case 'h2':
          if (self.options.markdown) result += '## ';
          for (i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
          result += '[br]';
          break;

        case 'h3':
          if (self.options.markdown) result += '### ';
          for (i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
          result += '[br]';
          break;

        case 'ul':
          for (i = 0; i < node.childNodes.length; i++) {
            var child = node.childNodes[i];
            if (child.tagName && child.tagName.toLowerCase() === 'li') {
              result += '- ';
              for (var j = 0; j < child.childNodes.length; j++) walk(child.childNodes[j]);
              result += '[br]';
            }
          }
          break;

        case 'div':
        case 'p':
          if (result.length > 0 && result.slice(-4) !== '[br]') result += '[br]';
          for (i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
          break;

        default:
          for (i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
          break;
      }
    }

    for (var i = 0; i < root.childNodes.length; i++) walk(root.childNodes[i]);
    return result.replace(/(\[br\])+\s*$/, '');
  };

  // ─── Toolbar actions ──────────────────────────────────────────

  SimpleEditor.prototype.insertBold = function () {
    if (this.options.markdown) {
      this.editorArea.focus();
      document.execCommand('bold', false);
      this._triggerChange();
    } else {
      this._insertAtCursor('[b]text[/b]');
    }
  };

  SimpleEditor.prototype.insertItalic = function () {
    if (this.options.markdown) {
      this.editorArea.focus();
      document.execCommand('italic', false);
      this._triggerChange();
    } else {
      this._insertAtCursor('[i]text[/i]');
    }
  };

  SimpleEditor.prototype.insertUnderline = function () {
    if (this.options.markdown) {
      this.editorArea.focus();
      document.execCommand('underline', false);
      this._triggerChange();
    } else {
      this._insertAtCursor('[u]text[/u]');
    }
  };

  SimpleEditor.prototype.insertHeading = function (level) {
    if (this.options.markdown) {
      this.editorArea.focus();
      if (level === 'normal' || level === 'p' || level === 'div') {
        document.execCommand('formatBlock', false, 'p');
      } else {
        document.execCommand('formatBlock', false, level);
      }
      this._triggerChange();
    } else {
      if (level === 'normal' || level === 'p' || level === 'div') {
        this._insertAtCursor('text');
      } else {
        this._insertAtCursor('[' + level + ']text[/' + level + ']');
      }
    }
  };

  SimpleEditor.prototype.insertList = function () {
    if (this.options.markdown) {
      this.editorArea.focus();
      document.execCommand('insertUnorderedList', false);
      this._triggerChange();
    } else {
      this._insertAtCursor('[list]\n- item\n[/list]');
    }
  };

  SimpleEditor.prototype.insertLink = function () {
    var url = prompt('Enter URL:');
    if (!url) return;

    if (this.options.markdown) {
      var sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && this.editorArea.contains(sel.getRangeAt(0).commonAncestorContainer)) {
        var range = sel.getRangeAt(0);
        var a = document.createElement('a');
        a.href = url;
        a.textContent = url;
        range.deleteContents();
        range.insertNode(a);
        range.setStartAfter(a);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
      this._triggerChange();
    } else {
      this._insertAtCursor('[link:' + url + ']');
    }
  };

  SimpleEditor.prototype.insertLineBreak = function () {
    if (this.options.markdown) {
      this.editorArea.focus();
      document.execCommand('insertHTML', false, '<br>');
      this._triggerChange();
    } else {
      this._insertAtCursor('[br]');
    }
  };

  // ─── Private: DOM construction ────────────────────────────────

  SimpleEditor.prototype._build = function () {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'simple-editor simple-editor--' + this.options.theme;
    if (this.options.className) this.wrapper.classList.add(this.options.className);

    if (this.options.toolbar) {
      this.toolbar = document.createElement('div');
      this.toolbar.className = 'simple-editor__toolbar';
      this._buildToolbar();
      this.wrapper.appendChild(this.toolbar);
    }

    this.editorArea = document.createElement('div');
    this.editorArea.className = 'simple-editor__content';
    this.editorArea.contentEditable = 'true';
    this.editorArea.spellcheck = true;
    this.editorArea.setAttribute('data-placeholder', this.options.placeholder);
    this.editorArea.style.maxHeight = this.options.maxheight;
    this.wrapper.appendChild(this.editorArea);

    // Add watermark
    this.watermark = document.createElement('div');
    this.watermark.className = 'simple-editor__watermark';
    this.watermark.textContent = 'Powered by Qwen';
    this.wrapper.appendChild(this.watermark);

    this.target.innerHTML = '';
    this.target.appendChild(this.wrapper);
  };

  SimpleEditor.prototype._buildToolbar = function () {
    var self = this;
    var defs = {
      bold:      { icon: '<strong>B</strong>', title: 'Bold',        action: function () { self.insertBold(); } },
      italic:    { icon: '<em>I</em>',       title: 'Italic',      action: function () { self.insertItalic(); } },
      underline: { icon: '<u>U</u>',        title: 'Underline',   action: function () { self.insertUnderline(); } },
      heading:   { type: 'select', title: 'Heading', options: [
        { value: 'p', label: 'Normal' },
        { value: 'h1', label: 'H1' },
        { value: 'h2', label: 'H2' },
        { value: 'h3', label: 'H3' }
      ], action: function (value) { self.insertHeading(value); } },
      list:      { icon: '≡',               title: 'List',        action: function () { self.insertList(); } },
      link:      { icon: '🔗',              title: 'Link',        action: function () { self.insertLink(); } },
      linebreak: { icon: '↵',               title: 'Line Break',  action: function () { self.insertLineBreak(); } },
      undo:      { icon: '↶',               title: 'Undo',        action: function () { self.undo(); } }
    };

    // Create left group (formatting buttons)
    var leftGroup = document.createElement('div');
    leftGroup.className = 'simple-editor__toolbar-left';

    this.options.buttons.forEach(function (id) {
      var def = defs[id];
      if (!def) return;

      if (def.type === 'select') {
        // Create dropdown select
        var select = document.createElement('select');
        select.className = 'simple-editor__select simple-editor__select--' + id;
        select.title = def.title;

        def.options.forEach(function (opt) {
          var option = document.createElement('option');
          option.value = opt.value;
          option.textContent = opt.label;
          select.appendChild(option);
        });

        select.addEventListener('change', function (e) {
          e.preventDefault();
          def.action(this.value);
          // Reset to "Normal" after selection
          this.value = 'p';
        });

        leftGroup.appendChild(select);
      } else {
        // Create button
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'simple-editor__btn simple-editor__btn--' + id;
        btn.innerHTML = def.icon;
        btn.title = def.title;
        btn.addEventListener('mousedown', function (e) {
          e.preventDefault();
          def.action();
        });
        leftGroup.appendChild(btn);
      }
    });

    this.toolbar.appendChild(leftGroup);

    // Create right group (Qwen logo)
    var rightGroup = document.createElement('div');
    rightGroup.className = 'simple-editor__toolbar-right';

    // Qwen logo - minimal inline SVG
    var qwenLogo = document.createElement('div');
    qwenLogo.className = 'simple-editor__qwen-logo';
    qwenLogo.title = 'Created with Qwen.ai';
    qwenLogo.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>' +
      '<path d="M19.713 2.825h-5.907c0-.251-.066-.503-.196-.728L12.819.728A1.46 1.46 0 0 0 11.559 0h-1.58c-.52 0-1 .275-1.26.728l-2.42 4.19a1.45 1.45 0 0 0 0 1.453l.791 1.37c.26.448.74.727 1.26.727h11.36c.52 0 1-.275 1.26-.728l.79-1.37a1.45 1.45 0 0 0 0-1.451l-.79-1.37a1.46 1.46 0 0 0-1.26-.728zM.195 9.905l2.951 5.115a1.46 1.46 0 0 0-.531.531l-.791 1.37a1.45 1.45 0 0 0 0 1.452l.79 1.37c.26.448.74.727 1.26.727h4.84c.52 0 1-.275 1.26-.728l.79-1.37a1.45 1.45 0 0 0 0-1.451L5.086 7.083a1.46 1.46 0 0 0-1.26-.728h-1.58c-.52 0-1 .276-1.26.728l-.79 1.37a1.45 1.45 0 0 0 0 1.452m15.888 13.367 2.951-5.115c.217.125.469.196.728.196h1.582c.52 0 1-.275 1.26-.728l.79-1.37a1.45 1.45 0 0 0 0-1.451l-2.42-4.191a1.46 1.46 0 0 0-1.259-.728h-1.582c-.52 0-1 .276-1.259.728l-5.678 9.838a1.45 1.45 0 0 0 0 1.452l.79 1.37c.26.448.74.727 1.26.727h1.582c.52 0 1-.275 1.26-.728z" fill="#082dff"></path>' +
      '<circle cx="12" cy="14" r="2" fill="white"/>' +
      '</svg>';

    rightGroup.appendChild(qwenLogo);
    this.toolbar.appendChild(rightGroup);
  };

  // ─── Private: text manipulation ───────────────────────────────

  SimpleEditor.prototype._getSelection = function () {
    var sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      var range = sel.getRangeAt(0);
      if (this.editorArea.contains(range.commonAncestorContainer)) return sel.toString();
    }
    return '';
  };

  SimpleEditor.prototype._insertAtCursor = function (text) {
    this._saveUndo();
    this.editorArea.focus();
    document.execCommand('insertText', false, text);
    this._triggerChange();
  };

  SimpleEditor.prototype._replaceSelection = function (text) {
    this._saveUndo();
    this.editorArea.focus();
    document.execCommand('insertText', false, text);
    this._triggerChange();
  };

  // ─── Private: undo management ─────────────────────────────────

  SimpleEditor.prototype._saveUndo = function () {
    var content = this.options.markdown ? this.editorArea.innerHTML : (this.editorArea.innerText || '');

    // Only save if content changed
    if (content !== this.lastContent) {
      this.undoStack.push(this.lastContent);

      // Limit stack size
      if (this.undoStack.length > this.maxUndoSize) {
        this.undoStack.shift();
      }

      // If we save lastcontent, the onChange is not called anymore.
      setTimeout(()=>{ this.lastContent = content; }, 20);
    }
  };

  // ─── Private: utilities ───────────────────────────────────────

  SimpleEditor.prototype._escapeHtml = function (text) {
    var d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  };

  SimpleEditor.prototype._unescapeHtml = function (text) {
    var d = document.createElement('div');
    d.innerHTML = text;
    return d.textContent || '';
  };

  SimpleEditor.prototype._triggerChange = function () {
    var content = this.getContent();
    if (content !== this.lastContent) {
      this.lastContent = content;
      if (this.options.onChange) this.options.onChange(content);
    }
  };

  // ─── Private: events ──────────────────────────────────────────

  SimpleEditor.prototype._onInput = function () {
    var self = this;

    // Save undo state before processing
    this._saveUndo();

    // In plain mode, live-convert [br] and [link:...] to real elements
    if (!this.options.markdown) {
      var html = this.editorArea.innerHTML;
      var modified = html;
      var changed = false;

      if (modified.indexOf('[br]') !== -1) {
        modified = modified.replace(/\[br\]/gi, '<br>');
        changed = true;
      }

      var linkRegex = /\[link:([^\]]+)\]/gi;
      if (linkRegex.test(modified)) {
        modified = modified.replace(linkRegex, function (_, url) {
          return '<a href="' + url + '">' + url + '</a>';
        });
        changed = true;
      }

      if (changed) {
        // Preserve cursor
        var sel = window.getSelection();
        var offset = 0;
        if (sel && sel.rangeCount > 0) {
          var range = sel.getRangeAt(0);
          var pre = document.createRange();
          pre.selectNodeContents(self.editorArea);
          pre.setEnd(range.startContainer, range.startOffset);
          offset = pre.toString().length;
        }
        self.editorArea.innerHTML = modified;
        self._restoreCursor(offset);
      }
    }

    this._triggerChange();
  };

  SimpleEditor.prototype._restoreCursor = function (offset) {
    var sel = window.getSelection();
    if (!sel) return;
    var range = document.createRange();
    var current = 0;
    var found = false;

    function walk(node) {
      if (node.nodeType === 3) {
        var len = (node.textContent || '').length;
        if (current + len >= offset) {
          range.setStart(node, offset - current);
          range.collapse(true);
          found = true;
          return true;
        }
        current += len;
        return false;
      }
      for (var i = 0; i < node.childNodes.length; i++) {
        if (walk(node.childNodes[i])) return true;
      }
      return false;
    }

    walk(this.editorArea);
    if (found) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  SimpleEditor.prototype._onKeydown = function (e) {
    if (e.ctrlKey && e.key === 'b') { e.preventDefault(); this.insertBold(); }
    if (e.ctrlKey && e.key === 'i') { e.preventDefault(); this.insertItalic(); }
    if (e.ctrlKey && e.key === 'u') { e.preventDefault(); this.insertUnderline(); }
    if (e.ctrlKey && e.key === 'z') { e.preventDefault(); this.undo(); }
  };

  SimpleEditor.prototype._onPaste = function (e) {
    e.preventDefault();
    var text = (e.clipboardData || window.clipboardData).getData('text/plain');
    this._saveUndo();
    if (this.options.markdown) {
      document.execCommand('insertHTML', false, this._formatToHTML(text));
    } else {
      document.execCommand('insertText', false, text);
    }
    this._triggerChange();
  };

  SimpleEditor.prototype._bindEvents = function () {
    var self = this;
    this._handleInput = function () { self._onInput(); };
    this._handleKeydown = function (e) { self._onKeydown(e); };
    this._handlePaste = function (e) { self._onPaste(e); };

    this.editorArea.addEventListener('input', this._handleInput);
    this.editorArea.addEventListener('keydown', this._handleKeydown);
    this.editorArea.addEventListener('paste', this._handlePaste);
  };

  SimpleEditor.prototype._unbindEvents = function () {
    this.editorArea.removeEventListener('input', this._handleInput);
    this.editorArea.removeEventListener('keydown', this._handleKeydown);
    this.editorArea.removeEventListener('paste', this._handlePaste);
  };

  return SimpleEditor;
}));
