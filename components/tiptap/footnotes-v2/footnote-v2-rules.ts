import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { ReplaceStep } from '@tiptap/pm/transform';
import { Fragment } from '@tiptap/pm/model';
import { minMax } from '@tiptap/core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function updateFootnoteV2References(tr: any) {
  let count = 1;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodes: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tr.doc.descendants((node: any, pos: number) => {
    if (node.type.name === 'footnoteReferenceV2') {
      tr.setNodeAttribute(pos, 'referenceNumber', `${count}`);
      nodes.push(node);
      count += 1;
    }
  });
  return nodes;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getFootnotesV2(tr: any) {
  let footnotesRange: { from: number; to: number } | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const footnotes: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tr.doc.descendants((node: any, pos: number) => {
    if (node.type.name === 'footnoteV2') {
      footnotes.push(node);
    } else if (node.type.name === 'footnotesV2') {
      footnotesRange = { from: pos, to: pos + node.nodeSize };
    } else {
      return false;
    }
  });
  return { footnotesRange, footnotes };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function updateFootnotesV2List(tr: any, state: any) {
  console.log('🔧 FootnoteV2Rules: updateFootnotesV2List called');
  
  const footnoteReferences = updateFootnoteV2References(tr);
  console.log('📝 Footnote references found:', footnoteReferences.length, footnoteReferences.map(r => ({ id: r.attrs.footnoteId, num: r.attrs.referenceNumber })));
  
  const footnoteType = state.schema.nodes.footnoteV2;
  const footnotesType = state.schema.nodes.footnotesV2;
  const emptyParagraph = state.schema.nodeFromJSON({
    type: 'paragraph',
    content: [],
  });

  const { footnotesRange, footnotes } = getFootnotesV2(tr);
  console.log('📚 Existing footnotes found:', footnotes.length, footnotes.map(f => ({ id: f.attrs.id, hasContent: f.content.size > 0 })));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const footnoteIds = footnotes.reduce((obj: any, footnote: any) => {
    obj[footnote.attrs.id] = footnote;
    return obj;
  }, {});

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newFootnotes: any[] = [];
  const footnoteRefIds = new Set(
    footnoteReferences.map((ref) => ref.attrs.footnoteId)
  );
  const deleteFootnoteIds = new Set();

  for (const footnote of footnotes) {
    const id = footnote.attrs.id;
    if (!footnoteRefIds.has(id) || deleteFootnoteIds.has(id)) {
      deleteFootnoteIds.add(id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      footnote.content.descendants((node: any) => {
        if (node.type.name === 'footnoteReferenceV2') {
          deleteFootnoteIds.add(node.attrs.footnoteId);
        }
      });
    }
  }

  for (let i = 0; i < footnoteReferences.length; i++) {
    const refId = footnoteReferences[i].attrs.footnoteId;
    if (deleteFootnoteIds.has(refId)) continue;

    if (refId in footnoteIds) {
      const footnote = footnoteIds[refId];
      console.log(`♻️ Preserving existing footnote ${i + 1} (${refId}):`, {
        contentSize: footnote.content.size,
        hasContent: footnote.content.size > 0
      });
      newFootnotes.push(
        footnoteType.create(
          { ...footnote.attrs, id: refId },
          footnote.content
        )
      );
    } else {
      console.log(`🆕 Creating new footnote ${i + 1} (${refId})`);
      const newNode = footnoteType.create(
        {
          id: refId,
        },
        [emptyParagraph]
      );
      newFootnotes.push(newNode);
    }
  }

  console.log('🔄 Final footnotes to update:', newFootnotes.length, newFootnotes.map((f, i) => ({ 
    index: i + 1, 
    id: f.attrs.id, 
    contentSize: f.content.size 
  })));

  if (newFootnotes.length === 0) {
    if (footnotesRange) {
      tr.delete(footnotesRange.from, footnotesRange.to);
    }
  } else if (!footnotesRange) {
    tr.insert(
      tr.doc.content.size,
      footnotesType.create(undefined, Fragment.from(newFootnotes))
    );
  } else {
    tr.replaceWith(
      footnotesRange.from + 1, // add 1 to point at the position after the opening div tag
      footnotesRange.to - 1, // subtract 1 to point to the position before the closing div tag
      Fragment.from(newFootnotes)
    );
  }
}

export const FootnoteV2Rules = Extension.create({
  name: 'footnoteV2Rules',
  priority: 1000,

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('footnoteV2Rules'),

        filterTransaction(tr) {
          const { from, to } = tr.selection;
          const minPos = TextSelection.atStart(tr.doc).from;
          const maxPos = TextSelection.atEnd(tr.doc).to;
          const resolvedFrom = minMax(0, minPos, maxPos);
          const resolvedEnd = minMax(tr.doc.content.size, minPos, maxPos);

          if (from === resolvedFrom && to === resolvedEnd) return true;

          let selectedFootnotes = false;
          let selectedContent = false;
          let footnoteCount = 0;

          tr.doc.nodesBetween(from, to, (node, _, parent) => {
            if (parent?.type.name === 'doc' && node.type.name !== 'footnotesV2') {
              selectedContent = true;
            } else if (node.type.name === 'footnoteV2') {
              footnoteCount += 1;
            } else if (node.type.name === 'footnotesV2') {
              selectedFootnotes = true;
            }
          });

          const overSelected = selectedContent && selectedFootnotes;
          return !overSelected && footnoteCount <= 1;
        },

        // if there are changes to the footnote references (added/deleted/dragged), append a transaction that updates the footnotes list accordingly
        appendTransaction(transactions, oldState, newState) {
          const newTr = newState.tr;
          let refsChanged = false;

          for (const tr of transactions) {
            if (!tr.docChanged) continue;
            if (refsChanged) break;

            for (const step of tr.steps) {
              if (!(step instanceof ReplaceStep)) continue;
              if (refsChanged) break;

              const isDelete = step.from !== step.to;
              const isInsert = step.slice.size > 0;

              if (isInsert) {
                step.slice.content.descendants((node) => {
                  if (node?.type.name === 'footnoteReferenceV2') {
                    refsChanged = true;
                    return false;
                  }
                });
              }

              if (isDelete && !refsChanged) {
                tr.before.nodesBetween(
                  step.from,
                  Math.min(tr.before.content.size, step.to), // make sure to not go over the old document's limit
                  (node) => {
                    if (node.type.name === 'footnoteReferenceV2') {
                      refsChanged = true;
                      return false;
                    }
                  }
                );
              }
            }
          }

          if (refsChanged) {
            updateFootnotesV2List(newTr, newState);
            return newTr;
          }

          return null;
        },
      }),
    ];
  },
});