# Link With Title

This is a plugin for [Obsidian](https://obsidian.md/), which show the link along with the H1 title of the note.

For example,

```bash
[[202412081919]]
```

will be **displayed as**

```markdown
[[title: 202412081919]]
```

,where `title` is the H1 title of the corresponding note. And it only changes the display in the editor, **NO content change** in the note file.

## Data Safety

All changes are **display-only**. And in the implementation, the plugin does not write any data. You can basically treat it as a css snippet (not exactly, but you get the idea).

## Usage

It works out of the box. No configuration needed. Just activate the plugin in your Obsidian community plugins.

### Behaviour

- If alias is set, it will be displayed instead of title.
- It only checks the first H1 title in the note, and only checks the first 30 lines in each note.
- It only works in edit mode.
- When no title is found, it will display only the filename, just like the default behaviour.
- It **will not immediately update the display** when the H1 title is changed. You need to call the command `Reload file headings`.

## Motivation

Why do we need this plugin? Because I prefer to decouple three things: 

- title
- filename
- alias

The plugin ensures that when you update a note's title, the change is visible in other notes. However, filenames and aliases remain unaffected, eliminating the need for additional updates. For more details reasoning, see this [document](docs/241206_000658_467.md).

## Development

As you can see, it is a simple and non-customizable plugin. 

I treat it as a tiny and temporary supplement to the great plugin [front-matter-title](https://github.com/snezhig/obsidian-front-matter-title). Some related FR is already submitted to front-matter-title. If this feature is added, I will archive this repo.

But currently, if you find it useful, feel free to use it, leave a comment, and contribute. A lot of features can be added, like:

- [ ] support personalize display format as the front-matter-title.
- [ ] support display the title in the preview mode.
- [ ] update the display automatically when the title is changed.
- [ ] better way to load the title. Currently it loads the title with the fs module, which is not efficient.

## License

This plugin is released under the GPL-3.0 license. 