import { BRANDING_NAME } from '@lobechat/business-const';
import { Button, Flexbox, Icon, Input, Skeleton, Text } from '@lobehub/ui';
import { Divider, Form } from 'antd';
import type { FormInstance, InputRef } from 'antd';
import { ChevronRight, Mail } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import AuthIcons from '@/components/NextAuth/AuthIcons';
import { PRIVACY_URL, TERMS_URL } from '@/const/url';
import { StyleSheet } from '@/utils/styles';

import AuthCard from '../../../../features/AuthCard';

const styles = StyleSheet.create({
  colored: {
    color: 'inherit',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  spacing: {
    marginBottom: 0,
  },
  spacing1: {
    marginInline: 6,
  },
  spacing2: {
    padding: 6,
  },
  style: {
    left: 12,
    position: 'absolute',
    top: 13,
  },
});

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const USERNAME_REGEX = /^\w+$/;

export interface SignInEmailStepProps {
  form: FormInstance<{ email: string }>;
  loading: boolean;
  oAuthSSOProviders: string[];
  onCheckUser: (values: { email: string }) => Promise<void>;
  onSocialSignIn: (provider: string) => void;
  serverConfigInit: boolean;
  socialLoading: string | null;
}

export const SignInEmailStep = ({
  form,
  loading,
  oAuthSSOProviders,
  serverConfigInit,
  socialLoading,
  onCheckUser,
  onSocialSignIn,
}: SignInEmailStepProps) => {
  const { t } = useTranslation('auth');
  const emailInputRef = useRef<InputRef>(null);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const divider = (
    <Divider>
      <Text fontSize={12} type={'secondary'}>
        {t('betterAuth.signin.orContinueWith')}
      </Text>
    </Divider>
  );

  const getProviderLabel = (provider: string) => {
    const normalized = provider
      .toLowerCase()
      .replaceAll(/(^|[_-])([a-z])/g, (_, __, c) => c.toUpperCase());
    const normalizedKey = normalized.replaceAll(/[^\dA-Za-z]/g, '');
    const key = `betterAuth.signin.continueWith${normalizedKey}`;
    return t(key, { defaultValue: `Continue with ${normalized}` });
  };

  const footer = (
    <Text fontSize={13} type={'secondary'}>
      <Trans
        components={{
          privacy: (
            <a href={PRIVACY_URL} style={styles.colored}>
              {t('footer.terms')}
            </a>
          ),
          terms: (
            <a href={TERMS_URL} style={styles.colored}>
              {t('footer.privacy')}
            </a>
          ),
        }}
        i18nKey={'footer.agreement'}
        ns={'auth'}
      />
    </Text>
  );

  return (
    <AuthCard
      footer={footer}
      subtitle={t('signin.subtitle', { appName: BRANDING_NAME })}
      title={t('signin.title')}
    >
      {!serverConfigInit && (
        <Flexbox gap={12}>
          <Skeleton.Button active block size="large" />
          <Skeleton.Button active block size="large" />
          {divider}
        </Flexbox>
      )}
      {serverConfigInit && oAuthSSOProviders.length > 0 && (
        <Flexbox gap={12}>
          {oAuthSSOProviders.map((provider) => (
            <Button
              block
              icon={<Icon icon={AuthIcons(provider, 18)} style={styles.style} />}
              key={provider}
              loading={socialLoading === provider}
              onClick={() => onSocialSignIn(provider)}
              size="large"
            >
              {getProviderLabel(provider)}
            </Button>
          ))}
          {divider}
        </Flexbox>
      )}
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => onCheckUser(values as { email: string })}
      >
        <Form.Item
          name="email"
          rules={[
            { message: t('betterAuth.errors.emailRequired'), required: true },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                const trimmedValue = (value as string).trim();
                if (EMAIL_REGEX.test(trimmedValue) || USERNAME_REGEX.test(trimmedValue)) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(t('betterAuth.errors.emailInvalid')));
              },
            },
          ]}
          style={styles.spacing}
        >
          <Input
            placeholder={t('betterAuth.signin.emailPlaceholder')}
            prefix={<Icon icon={Mail} style={styles.spacing1} />}
            ref={emailInputRef}
            size="large"
            style={styles.spacing2}
            suffix={
              <Button
                icon={ChevronRight}
                loading={loading}
                onClick={() => form.submit()}
                title={t('betterAuth.signin.nextStep')}
                variant={'filled'}
              />
            }
          />
        </Form.Item>
      </Form>
    </AuthCard>
  );
};
