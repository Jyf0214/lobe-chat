import { TextArea } from '@lobehub/ui';
import { FC } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  spacing: {
    cursor: 'text',
    maxHeight: '80vh',
    minHeight: '50vh',
    overflowY: 'auto',
    padding: 16,
  },
});

interface EditorCanvasProps {
  defaultValue?: string;
  onChange?: (value: string) => void;
  value?: string;
}

const EditorCanvas: FC<EditorCanvasProps> = ({ defaultValue, value, onChange }) => {
  return (
    <TextArea
      defaultValue={defaultValue}
      onChange={(e) => {
        onChange?.(e.target.value);
      }}
      style={styles.spacing}
      value={value}
      variant={'borderless'}
    />
  );
};

export default EditorCanvas;
