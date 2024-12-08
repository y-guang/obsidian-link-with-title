import { App, getLinkpath, Plugin } from 'obsidian';
import { syntaxTree } from '@codemirror/language';
import { RangeSetBuilder } from '@codemirror/state';
import * as fs from 'fs';
import {
	Decoration,
	DecorationSet,
	EditorView,
	PluginSpec,
	PluginValue,
	ViewPlugin,
	ViewUpdate,
	WidgetType,
} from '@codemirror/view';

let staticApp: App;
let headingCache: Record<string, string> = {};

class DynamicSuffixWidget extends WidgetType {
	private linkContent: string;
	private suffix: string;

	constructor(linkContent: string, suffix: string) {
		super();
		this.linkContent = linkContent;
		this.suffix = suffix;
	}

	toDOM(view: EditorView): HTMLElement {
		const div = document.createElement('span');
		div.innerText = `${this.suffix}: `;
		div.addClass('cm-hmd-internal-link')
		return div;
	}
}

class DynamicSuffixPlugin implements PluginValue {
	decorations: DecorationSet;
	constructor(view: EditorView) {
		this.decorations = this.buildDecorations(view);
	}

	update(update: ViewUpdate) {
		if (update.docChanged || update.viewportChanged) {
			this.decorations = this.buildDecorations(update.view);
		}
	}

	destroy() { }

	buildDecorations(view: EditorView): DecorationSet {
		const builder = new RangeSetBuilder<Decoration>();

		for (const { from, to } of view.visibleRanges) {
			syntaxTree(view.state).iterate({
				from,
				to,
				enter: (node) => {
					if (node.type.name.startsWith('hmd-internal-link')) {
						const linkText = view.state.doc.sliceString(node.from, node.to);
						const linkPath = getLinkpath(linkText);
						const file = staticApp.metadataCache.getFirstLinkpathDest(linkPath, '');

						if (!file) return;

						try {
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							const fullPath = (staticApp.vault.adapter as any).getFullPath(file.path);
							let heading = headingCache[fullPath];
							if (heading === undefined) {  // Check cache
								const content = fs.readFileSync(fullPath, 'utf8');
								heading = content.split('\n').slice(0, 30).find((line) => line.startsWith('# ')) || '';
								if (heading) {
									heading = heading.substring(2).trim();
								}
								headingCache[fullPath] = heading || '';  
							}

							if (heading) {  // Only create decoration if heading exists
								builder.add(
									node.from,
									node.from,
									Decoration.replace({
										widget: new DynamicSuffixWidget(linkText, heading),
									})
								);
							}
						} catch (error) {
							console.error('Error reading file:', error);
						}
					}
				},
			});
		}
		return builder.finish();
	}
}

const pluginSpec: PluginSpec<DynamicSuffixPlugin> = {
	decorations: (value: DynamicSuffixPlugin) => value.decorations,
};

export const dynamicSuffixPlugin = ViewPlugin.fromClass(
	DynamicSuffixPlugin,
	pluginSpec
);

export const createDynamicSuffixPlugin = (app: App) => {
	staticApp = app;
	return ViewPlugin.fromClass(DynamicSuffixPlugin, {
		decorations: v => v.decorations,
	});
};

export default class MyPlugin extends Plugin {
	async onload() {
		this.registerEditorExtension(createDynamicSuffixPlugin(this.app));
		this.addCommand({
			id: 'reload-file-headings',
			name: 'Reload file headings',
			callback: () => {
				headingCache = {};
			}
		});
	}

	onunload() {
	}
}
