# DesktopPet Editor

DesktopPet Editor is a browser-based application for creating and editing XML-defined DesktopPet animations. It provides a visual interface for defining animated pets that run on the DesktopPet platform.

The editor follows a straightforward workflow: open a project, edit its animation data, configure sprite images and behavior, and save the result for reuse by compatible DesktopPet applications.

## Project purpose

The editor helps developers, hobbyists, and artists:

- design and fine-tune animated pets
- edit XML configuration and animation nodes visually
- manage sprite/image assets and animation timing
- prepare content for reuse in other projects
- share editable pet definitions

The generated XML is stored in a plain, inspectable format and can be reused by compatible DesktopPet applications.

## Main features

- Open and edit DesktopPet project files
- Save projects and individual files in the editor
- Edit animation sequences and frame data
- Modify project metadata
- Manage spritesheets and image data
- Configure spawn behavior and placement settings
- Use formulas for dynamic values
- Work in a browser without local installation

## Supported editor areas

The interface is organized around several editing sections, including:

- Animation editor
- Header editor
- Image/Spritesheet editor
- Spawn editor
- Formula editor
- XML viewer for inspecting raw project data
- File and project management tools

Some features are still in development, including child elements and advanced sound configuration.

## How it works

The editor reads and writes XML-based DesktopPet definitions. These documents describe:

- metadata and headers
- animation frames and timing
- movements and sequences
- imagery and sprite references
- spawn conditions and placement logic

This visual workflow keeps the resulting XML compatible with DesktopPet applications.

## Browser requirements

DesktopPet Editor requires a modern browser with support for the relevant web APIs.

Recommended usage:

- use an up-to-date browser
- keep JavaScript enabled
- run the project from a local web server or the GitHub Pages deployment

Local project-folder access requires a browser that implements the File System Access API, such as Chrome or Edge.

## Typical workflow

1. Open an existing project or create a new one.
2. Review or edit the animation and header data.
3. Adjust image, spawn, and behavior-related nodes.
4. Use the formula editor where custom logic is needed.
5. Save the project or export the edited file content.
6. Reuse the XML in compatible DesktopPet implementations.

## Project status

This project is in preview and continues to evolve. The main editing tools are available, while some advanced features are still being added.

## Tutorials

- [Application tutorial](tutorial_app.md) — workspace and menu overview
- [File tutorial](tutorial_editor_file.md) — opening, saving, importing, and exporting projects
- [Animation tutorial](tutorial_editor_anim.md) — header, spritesheet, spawns, and animations
- [XML tutorial](tutorial_xml.md) — XML structure and node fields
- [General tutorial](tutorial3.md) — project ideas and a creation checklist


