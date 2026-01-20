import { Button, Icon, InputPassword, Text } from '@lobehub/ui';
import { Form } from 'antd';
import type { FormInstance, InputRef } from 'antd';
import { cssVar } from 'antd-style';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { StyleSheet } from '@/utils/styles';

import AuthCard from '../../../../features/AuthCard';

const styles = StyleSheet.create({
  colored: {
    color: 'inherit',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  colored1: {
    color: cssVar.colorPrimary,
  },
  spacing: {
    marginTop: 16,
  },
  spacing1: {
    marginTop: 12,
  },
  spacing2: {
    marginBottom: 0,
  },
  spacing3: {
    marginInline: 6,
  },
  spacing4: {
    padding: 6,
  },
});

export interface SignInPasswordStepProps {
  email: string;
  form: FormInstance<{ password: string }>;
  loading: boolean;
  onBackToEmail: () => void;
  onForgotPassword: () => Promise<void>;
  onSubmit: (values: { password: string }) => Promise<void>;
}

export const SignInPasswordStep = ({
  email,
  form,
  loading,
  onBackToEmail,
  onForgotPassword,
  onSubmit,
}: SignInPasswordStepProps) => {
  const { t } = useTranslation('auth');
  const passwordInputRef = useRef<InputRef>(null);

  useEffect(() => {
    passwordInputRef.current?.focus();
  }, []);

  return (
    <AuthCard
      footer={
        <>
          <Text fontSize={13} type={'secondary'}>
            <a onClick={onForgotPassword} style={styles.colored}>
              {t('betterAuth.signin.forgotPassword')}
            </a>
          </Text>
          <Button icon={ChevronLeft} onClick={onBackToEmail} size={'large'} style={styles.spacing}>
            {t('betterAuth.signin.backToEmail')}
          </Button>
        </>
      }
      subtitle={t('betterAuth.signin.passwordStep.subtitle')}
      title={t('signin.title')}
    >
      <Text fontSize={20}>{email}</Text>
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => onSubmit(values as { password: string })}
        style={styles.spacing1}
      >
        <Form.Item
          name="password"
          rules={[{ message: t('betterAuth.errors.passwordRequired'), required: true }]}
          style={styles.spacing2}
        >
          <InputPassword
            placeholder={t('betterAuth.signin.passwordPlaceholder')}
            prefix={<Icon icon={Lock} style={styles.spacing3} />}
            ref={passwordInputRef}
            size="large"
            style={styles.spacing4}
            suffix={
              <Button
                icon={ChevronRight}
                loading={loading}
                onClick={() => form.submit()}
                style={styles.colored1}
                title={t('betterAuth.signin.submit')}
                variant={'filled'}
              />
            }
          />
        </Form.Item>
      </Form>
    </AuthCard>
  );
};
