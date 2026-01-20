import { type MenuRenderProps } from '@lobehub/editor/es/plugins/slash/react/type';
import { Flexbox } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { type ReactNode, memo, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { StyleSheet } from '@/utils/styles';

import { type MentionListOption } from './types';

const styles = StyleSheet.create({
  colored: {
    background: cssVar.colorBgElevated,
    border: `1px solid ${cssVar.colorBorderSecondary}`,
    borderRadius: 12,
    boxShadow: cssVar.boxShadowSecondary,
    maxHeight: 260,
    maxWidth: 400,
    minWidth: 150,
    overflow: 'hidden auto',
    position: 'fixed',
    zIndex: 9999,
  },
  colored1: {
    borderTop: `1px solid ${cssVar.colorBorderSecondary}`,
  },
  colored2: {
    cursor: 'pointer',
  },
  colored3: {
    color: cssVar.colorText,
    fontSize: 14,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  flexContainer: {
    flex: 'none',
  },
});

/**
 * Get cursor position from browser selection API
 */
const getCursorPosition = (): { x: number; y: number } | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  return {
    x: rect.left,
    y: rect.bottom,
  };
};

const MentionDropdown = memo<MenuRenderProps>(
  ({ activeKey, onSelect, open, options, setActiveKey }) => {
    const activeItemRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

    // Capture cursor position when menu opens
    useLayoutEffect(() => {
      if (open) {
        const pos = getCursorPosition();
        if (pos) {
          setPosition(pos);
        }
      }
    }, [open]);

    useEffect(() => {
      if (activeItemRef.current) {
        activeItemRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }, [activeKey]);

    if (!open || !options.length || !position) return null;

    const positionedStyle = {
      ...styles.colored,
      left: position.x,
      top: position.y,
    };

    return (
      <Flexbox style={positionedStyle}>
        {options.map((option) => {
          if ((option as any)?.type === 'divider') {
            return (
              <div key={`divider-${(option as any)?.key ?? 'divider'}`} style={styles.colored1} />
            );
          }

          const item = option as MentionListOption;
          const isActive = activeKey === item.key;
          const itemStyle = {
            ...styles.colored2,
            background: isActive ? cssVar.colorFillSecondary : undefined,
          };

          return (
            <Flexbox
              align="center"
              direction="horizontal"
              gap={8}
              key={String(item.key)}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect?.(item);
              }}
              onMouseEnter={() => setActiveKey?.(String(item.key))}
              paddingBlock={8}
              paddingInline={12}
              ref={isActive ? activeItemRef : null}
              style={itemStyle}
            >
              {item.icon && (
                <Flexbox style={styles.flexContainer}>{item?.icon as ReactNode}</Flexbox>
              )}
              <div style={styles.colored3}>{item.label}</div>
            </Flexbox>
          );
        })}
      </Flexbox>
    );
  },
);

MentionDropdown.displayName = 'MentionDropdown';

export default MentionDropdown;
