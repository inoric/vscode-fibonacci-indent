'use strict';

import {
  ExtensionContext,
  TextEditor,
  TextEditorEdit,
  workspace,
  Range,
  Position,
  Selection,
  window,
  commands
} from 'vscode';

function firstPosition(positionA: Position, positionB: Position): Position {
  if (positionA.line === positionB.line) {
    return positionA.character <= positionB.character ? positionA : positionB;
  } else {
    return positionA.line <= positionB.line ? positionA : positionB;
  }
}

function getPositionFromSelection(selection: Selection): Position {
  return firstPosition(selection.start, selection.end);
}

const beginsWithWhitespace = new RegExp(/^[\t ]+$/);
const changeIsAutoindented = new RegExp(/^\n[\t ]+$/m);

function indent(
  editor: TextEditor,
  edit: TextEditorEdit,
  untilPosition: Position,
  addOne: boolean = true
) {
  const tabSize: number = workspace.getConfiguration('editor').tabSize;
  const lineStart = editor.document.lineAt(untilPosition.line).range.start;
  const textBeforeCursor = editor.document.getText(
    new Range(lineStart, untilPosition)
  );

  const match = textBeforeCursor.match(beginsWithWhitespace);
  if (!match) {
    edit.insert(untilPosition, ' '.repeat(tabSize));
    return;
  }

  // Count indent until cursor position
  let linePos = 0;
  let indentLength = 0;
  while (linePos < untilPosition.character) {
    const char = textBeforeCursor.charAt(linePos);
    if (char === '\t') {
      indentLength += tabSize;
    } else if (char === ' ') {
      indentLength += 1;
    }
    linePos++;
  }

  // Do the fibonacci thing until we reach the current indent level.
  let current = tabSize;
  let next = tabSize;
  let tmp = current + next;
  while (next <= indentLength) {
    tmp = current + next;
    current = next;
    next = tmp;
  }

  // We either fix indent to match closest fibonacci sequence number or add one level even if reached.
  let indentTo: number;
  if (!addOne && indentLength === current) {
    indentTo = current;
  } else {
    indentTo = next;
  }
  const indentAdd = ' '.repeat(indentTo - indentLength);
  edit.insert(untilPosition, indentAdd);
}

export function activate(context: ExtensionContext) {
  console.log('Fibonacci indent activated');

  let activeEditor = window.activeTextEditor;
  window.onDidChangeActiveTextEditor(newEditor => (activeEditor = newEditor));

  // Normal tab indent
  const indentCommand = commands.registerTextEditorCommand(
    'extension.fibonacciIndent',
    editor => {
      editor.edit(edit => {
        editor!.selections.forEach(selection => {
          const position = getPositionFromSelection(selection);
          indent(editor, edit, position);
        });
      });
    }
  );

  // Detect autoindent and "fix" it
  workspace.onDidChangeTextDocument(event => {
    if (!activeEditor) {
      return;
    }

    activeEditor.edit(edit => {
      event.contentChanges.forEach(change => {
        if (!activeEditor) {
          return;
        }
        if (change.text.match(changeIsAutoindented)) {
          const lineRange = event.document.lineAt(change.range.start.line + 1)
            .range;
          indent(activeEditor, edit, lineRange.end, false);
        }
      });
    });
  });

  context.subscriptions.push(indentCommand);
}

export function deactivate() {}
