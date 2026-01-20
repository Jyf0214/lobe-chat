import {
  IEditor,
  ReactCodePlugin,
  ReactCodemirrorPlugin,
  ReactHRPlugin,
  ReactLinkPlugin,
  ReactListPlugin,
  ReactMathPlugin,
  ReactTablePlugin,
} from '@lobehub/editor';
import { Editor } from '@lobehub/editor/react';
import { Flexbox } from '@lobehub/ui';
import { FC } from 'react';

import { StyleSheet } from '@/utils/styles';

import TypoBar from './Typobar';

const styles = StyleSheet.create({
  spacing: {
    paddingBottom: 120,
  },
  style: {
    cursor: 'text',
    maxHeight: '80vh',
    minHeight: '50vh',
    overflowY: 'auto',
  },
});

interface EditorCanvasProps {
  defaultValue?: string;
  editor?: IEditor;
}

const EditorCanvas: FC<EditorCanvasProps> = ({ defaultValue, editor }) => {
  return (
    <>
      <TypoBar editor={editor} />
      <Flexbox padding={16} style={styles.style}>
        <Editor
          autoFocus
          content={''}
          editor={editor}
          onInit={(editor) => {
            if (!editor || !defaultValue) return;
            try {
              editor?.setDocument('markdown', defaultValue);
            } catch (e) {
              console.error('setDocument error:', e);
            }
          }}
          plugins={[
            ReactListPlugin,
            ReactCodePlugin,
            ReactCodemirrorPlugin,
            ReactHRPlugin,
            ReactLinkPlugin,
            ReactTablePlugin,
            ReactMathPlugin,
          ]}
          style={styles.spacing}
          type={'text'}
          variant={'chat'}
        />
      </Flexbox>
    </>
  );
};

export default EditorCanvas;
