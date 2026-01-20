import { Segmented } from '@lobehub/ui';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGenerationConfigParam } from '@/store/image/slices/generationConfig/hooks';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
});

const ResolutionSelect = memo(() => {
  const { t } = useTranslation('image');
  const { value, setValue, enumValues } = useGenerationConfigParam('resolution');

  const handleChange = useCallback(
    (resolution: string | number) => {
      setValue(String(resolution));
    },
    [setValue],
  );

  const options = useMemo(() => {
    if (!enumValues || enumValues.length === 0) return [];
    return enumValues.map((resolution) => ({
      label: t(`config.resolution.options.${resolution}`, { defaultValue: resolution }),
      value: resolution,
    }));
  }, [enumValues, t]);

  if (options.length === 0) {
    return null;
  }

  return (
    <Segmented
      block
      onChange={handleChange}
      options={options}
      style={styles.fullWidth}
      value={value}
      variant="filled"
    />
  );
});

export default ResolutionSelect;
