'use client';

import { SiGithub, SiX } from '@icons-pack/react-simple-icons';
import { Center, Flexbox, Icon, Input, Modal, Text, TextArea, Tooltip } from '@lobehub/ui';
import { App, Form, Upload, type UploadProps } from 'antd';
import { cssVar } from 'antd-style';
import { CircleHelp, Globe, ImagePlus, Trash2 } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import EmojiPicker from '@/components/EmojiPicker';
import { lambdaClient } from '@/libs/trpc/client';
import { useFileStore } from '@/store/file';
import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';
import { useServerConfigStore } from '@/store/serverConfig';
import { serverConfigSelectors } from '@/store/serverConfig/selectors';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';
import { StyleSheet } from '@/utils/styles';

import { type MarketUserProfile } from './types';

const styles = StyleSheet.create({
  colored: {
    color: cssVar.colorTextSecondary,
  },
  colored1: {
    color: cssVar.colorTextSecondary,
    fontSize: 12,
  },
  colored2: {
    color: cssVar.colorError,
    cursor: 'pointer',
    fontSize: 12,
  },
  fullWidth: {
    display: 'block',
    width: '100%',
  },
  fullWidth1: {
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    borderRadius: cssVar.borderRadiusLG,
    cursor: 'pointer',
    height: 120,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  fullWidth2: {
    height: '100%',
    transition: 'opacity 0.2s',
    width: '100%',
  },
  spacing: {
    marginTop: 16,
  },
  spacing1: {
    display: 'block',
    marginBottom: 24,
  },
  spacing2: {
    display: 'block',
    marginBottom: 12,
  },
  spacing3: {
    marginRight: 8,
  },
  style: {
    cursor: 'help',
    opacity: 0.5,
  },
});

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB limit

interface ProfileSetupModalProps {
  accessToken: string | null;
  /**
   * Default display name to use (typically from OIDC)
   */
  defaultDisplayName?: string;
  /**
   * Whether this is the first-time setup (after initial sign in)
   */
  isFirstTimeSetup?: boolean;
  onClose: () => void;
  /**
   * Callback when profile is successfully updated
   */
  onSuccess?: (profile: MarketUserProfile) => void;
  open: boolean;
  /**
   * Current user profile (for editing existing profile)
   */
  userProfile?: MarketUserProfile | null;
}

interface FormValues {
  description?: string;
  displayName: string;
  github?: string;
  twitter?: string;
  userName: string;
  website?: string;
}

const ProfileSetupModal = memo<ProfileSetupModalProps>(
  ({
    open,
    onClose,
    onSuccess,
    accessToken,
    defaultDisplayName,
    userProfile,
    isFirstTimeSetup = false,
  }) => {
    const { t } = useTranslation('marketAuth');
    const { message } = App.useApp();
    const [form] = Form.useForm<FormValues>();
    const [loading, setLoading] = useState(false);
    const locale = useGlobalStore(globalGeneralSelectors.currentLanguage);

    // 检查是否是自动授权模式
    const enableMarketTrustedClient = useServerConfigStore(
      serverConfigSelectors.enableMarketTrustedClient,
    );

    // 获取当前用户头像作为默认值
    const currentUserAvatar = useUserStore(userProfileSelectors.userAvatar);

    // Avatar state
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarUploading, setAvatarUploading] = useState(false);

    // Banner state
    const [bannerUrl, setBannerUrl] = useState<string | null>(null);
    const [bannerUploading, setBannerUploading] = useState(false);

    // File upload
    const uploadWithProgress = useFileStore((s) => s.uploadWithProgress);

    // Dynamic styles based on bannerUrl
    const fullWidth1Style = {
      ...styles.fullWidth1,
      backgroundColor: bannerUrl ? undefined : cssVar.colorFillTertiary,
      backgroundImage: bannerUrl ? `url(${bannerUrl})` : undefined,
    };

    const fullWidth2Style = {
      ...styles.fullWidth2,
      background: bannerUrl ? 'rgba(0,0,0,0.4)' : 'transparent',
      opacity: bannerUrl ? 0 : 1,
    };

    const coloredStyle = {
      ...styles.colored,
      color: bannerUrl ? '#fff' : cssVar.colorTextSecondary,
    };

    const colored1Style = {
      ...styles.colored1,
      color: bannerUrl ? '#fff' : cssVar.colorTextSecondary,
    };

    // Reset form when modal opens
    useEffect(() => {
      if (open) {
        // For userName default: use existing userName, or generate from displayName
        const existingUserName = userProfile?.userName;
        const existingDisplayName = userProfile?.displayName || defaultDisplayName || '';
        // Generate default userName from displayName (remove invalid chars, lowercase)
        const generatedUserName = existingDisplayName
          .toLowerCase()
          .replaceAll(/[^\w-]/g, '')
          .slice(0, 32);

        form.setFieldsValue({
          description: userProfile?.description || '',
          displayName: existingDisplayName,
          github: userProfile?.socialLinks?.github || '',
          twitter: userProfile?.socialLinks?.twitter || '',
          userName: existingUserName || generatedUserName,
          website: userProfile?.socialLinks?.website || '',
        });

        // Reset avatar and banner
        // 如果 userProfile 有 avatarUrl 就用它，否则用当前用户头像作为默认值
        setAvatarUrl(userProfile?.avatarUrl || currentUserAvatar || null);
        setBannerUrl(userProfile?.bannerUrl || null);
      }
    }, [open, userProfile, defaultDisplayName, form, currentUserAvatar]);

    // Handle avatar change (emoji)
    const handleAvatarChange = useCallback((emoji: string) => {
      setAvatarUrl(emoji);
    }, []);

    // Handle avatar upload
    const handleAvatarUpload = useCallback(
      async (file: File) => {
        if (file.size > MAX_FILE_SIZE) {
          message.error(t('profileSetup.errors.fileTooLarge'));
          return;
        }

        setAvatarUploading(true);
        try {
          const result = await uploadWithProgress({ file });
          if (result?.url) {
            setAvatarUrl(result.url);
          }
        } catch (error) {
          console.error('[ProfileSetupModal] Avatar upload failed:', error);
          message.error(t('profileSetup.errors.uploadFailed'));
        } finally {
          setAvatarUploading(false);
        }
      },
      [uploadWithProgress, message, t],
    );

    // Handle avatar delete
    const handleAvatarDelete = useCallback(() => {
      setAvatarUrl(null);
    }, []);

    // Handle banner upload
    const handleBannerUpload: UploadProps['customRequest'] = useCallback(
      async (options: Parameters<NonNullable<UploadProps['customRequest']>>[0]) => {
        const file = options.file as File;

        if (file.size > MAX_FILE_SIZE) {
          message.error(t('profileSetup.errors.fileTooLarge'));
          options.onError?.(new Error('File too large'));
          return;
        }

        setBannerUploading(true);
        try {
          const result = await uploadWithProgress({ file });
          if (result?.url) {
            setBannerUrl(result.url);
            options.onSuccess?.(result);
          }
        } catch (error) {
          console.error('[ProfileSetupModal] Banner upload failed:', error);
          message.error(t('profileSetup.errors.uploadFailed'));
          options.onError?.(error as Error);
        } finally {
          setBannerUploading(false);
        }
      },
      [uploadWithProgress, message, t],
    );

    // Handle banner delete
    const handleBannerDelete = useCallback(() => {
      setBannerUrl(null);
    }, []);

    const handleSubmit = useCallback(async () => {
      // 如果不是自动授权模式，需要校验 accessToken
      if (!enableMarketTrustedClient && !accessToken) {
        message.error(t('profileSetup.errors.notAuthenticated'));
        return;
      }

      try {
        const values = await form.validateFields();
        setLoading(true);

        // Build socialLinks object (only include non-empty values)
        const socialLinks: { github?: string; twitter?: string; website?: string } = {};
        if (values.github) socialLinks.github = values.github;
        if (values.twitter) socialLinks.twitter = values.twitter;
        if (values.website) socialLinks.website = values.website;

        // Build meta object (socialLinks should be inside meta)
        const meta: {
          bannerUrl?: string;
          description?: string;
          socialLinks?: { github?: string; twitter?: string; website?: string };
        } = {};
        if (values.description) meta.description = values.description;
        if (bannerUrl) meta.bannerUrl = bannerUrl;
        if (Object.keys(socialLinks).length > 0) meta.socialLinks = socialLinks;

        const result = await lambdaClient.market.user.updateUserProfile.mutate({
          avatarUrl: avatarUrl || undefined,
          displayName: values.displayName,
          meta: Object.keys(meta).length > 0 ? meta : undefined,
          userName: values.userName,
        });

        message.success(t('profileSetup.success'));
        // Cast result.user to MarketUserProfile with required fields
        const userProfile: MarketUserProfile = {
          avatarUrl: result.user?.avatarUrl || avatarUrl || null,
          bannerUrl: bannerUrl || null,
          createdAt: result.user?.createdAt || new Date().toISOString(),
          description: values.description || null,
          displayName: values.displayName || null,
          id: result.user?.id || 0,
          namespace: result.user?.namespace || '',
          socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : null,
          type: result.user?.type || null,
          userName: values.userName || null,
        };
        onSuccess?.(userProfile);
        onClose();
      } catch (error) {
        console.error('[ProfileSetupModal] Update failed:', error);
        if (error instanceof Error && error.message !== 'Validation failed') {
          // Check for username taken error (tRPC CONFLICT code)
          const errorMessage = error.message || '';
          if (
            errorMessage.toLowerCase().includes('already taken') ||
            errorMessage.includes('CONFLICT')
          ) {
            message.error(t('profileSetup.errors.usernameTaken'));
          } else {
            message.error(t('profileSetup.errors.updateFailed'));
          }
        }
      } finally {
        setLoading(false);
      }
    }, [
      accessToken,
      avatarUrl,
      bannerUrl,
      enableMarketTrustedClient,
      form,
      message,
      onClose,
      onSuccess,
      t,
    ]);

    const handleCancel = useCallback(() => {
      if (!isFirstTimeSetup) {
        onClose();
      }
    }, [isFirstTimeSetup, onClose]);

    return (
      <Modal
        cancelButtonProps={isFirstTimeSetup ? { style: { display: 'none' } } : undefined}
        cancelText={t('profileSetup.cancel')}
        centered
        closable={!isFirstTimeSetup}
        confirmLoading={loading}
        keyboard={!isFirstTimeSetup}
        maskClosable={!isFirstTimeSetup}
        okText={isFirstTimeSetup ? t('profileSetup.getStarted') : t('profileSetup.save')}
        onCancel={handleCancel}
        onOk={handleSubmit}
        open={open}
        title={false}
        width={640}
      >
        <Text fontSize={20} strong style={styles.spacing}>
          {isFirstTimeSetup ? t('profileSetup.titleFirstTime') : t('profileSetup.titleEdit')}
        </Text>
        <Text style={styles.spacing1} type="secondary">
          {isFirstTimeSetup
            ? t('profileSetup.descriptionFirstTime')
            : t('profileSetup.descriptionEdit')}
        </Text>

        <Form form={form} layout="vertical">
          <Flexbox gap={24} horizontal>
            <Flexbox flex={1}>
              <Form.Item
                label={t('profileSetup.fields.displayName.label')}
                name="displayName"
                rules={[
                  { message: t('profileSetup.fields.displayName.required'), required: true },
                  {
                    max: 50,
                    message: t('profileSetup.fields.displayName.maxLength'),
                  },
                ]}
              >
                <Input
                  maxLength={50}
                  placeholder={t('profileSetup.fields.displayName.placeholder')}
                  showCount
                />
              </Form.Item>
              <Form.Item
                label={
                  <Flexbox align="center" gap={4} horizontal>
                    {t('profileSetup.fields.userName.label')}
                    <Tooltip title={t('profileSetup.fields.userName.tooltip')}>
                      <CircleHelp size={14} style={styles.style} />
                    </Tooltip>
                  </Flexbox>
                }
                name="userName"
                rules={[
                  { message: t('profileSetup.fields.userName.required'), required: true },
                  {
                    message: t('profileSetup.fields.userName.pattern'),
                    pattern: /^[\w-]+$/,
                  },
                  {
                    max: 32,
                    message: t('profileSetup.fields.userName.maxLength'),
                  },
                  {
                    message: t('profileSetup.fields.userName.minLength'),
                    min: 3,
                  },
                ]}
              >
                <Input
                  maxLength={32}
                  placeholder={t('profileSetup.fields.userName.placeholder')}
                  prefix="@"
                  showCount
                />
              </Form.Item>
            </Flexbox>
            {/* Avatar Section */}
            <Form.Item>
              <EmojiPicker
                allowDelete={!!avatarUrl}
                allowUpload={{
                  enableEmoji: false,
                }}
                loading={avatarUploading}
                locale={locale}
                onChange={handleAvatarChange}
                onDelete={handleAvatarDelete}
                onUpload={handleAvatarUpload}
                shape="square"
                size={80}
                value={avatarUrl || undefined}
              />
            </Form.Item>
          </Flexbox>
          <Form.Item
            label={t('profileSetup.fields.description.label')}
            name="description"
            rules={[
              {
                max: 200,
                message: t('profileSetup.fields.description.maxLength'),
              },
            ]}
          >
            <TextArea
              maxLength={200}
              placeholder={t('profileSetup.fields.description.placeholder')}
              rows={3}
              showCount
            />
          </Form.Item>

          {/* Only show banner and social links in edit mode, not first-time setup */}
          {!isFirstTimeSetup && (
            <>
              {/* Banner Upload Section */}
              <Form.Item
                label={
                  <Flexbox align="center" gap={4} horizontal>
                    {t('profileSetup.fields.bannerUrl.label')}
                    <Tooltip title={t('profileSetup.fields.bannerUrl.tooltip')}>
                      <CircleHelp size={14} style={styles.style} />
                    </Tooltip>
                  </Flexbox>
                }
              >
                <Flexbox gap={8} width="100%">
                  <Upload
                    accept="image/*"
                    customRequest={handleBannerUpload}
                    maxCount={1}
                    showUploadList={false}
                    style={styles.fullWidth}
                  >
                    <div style={fullWidth1Style}>
                      <Center
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                          if (bannerUrl) e.currentTarget.style.opacity = '0';
                        }}
                        style={fullWidth2Style}
                      >
                        <Flexbox align="center" gap={8}>
                          <ImagePlus size={24} style={coloredStyle} />
                          <Text style={colored1Style}>
                            {bannerUploading
                              ? t('profileSetup.fields.bannerUrl.uploading')
                              : t('profileSetup.fields.bannerUrl.clickToUpload')}
                          </Text>
                        </Flexbox>
                      </Center>
                    </div>
                  </Upload>
                  {bannerUrl && (
                    <Flexbox align="center" gap={8} horizontal justify="flex-end">
                      <Text
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBannerDelete();
                        }}
                        style={styles.colored2}
                      >
                        <Flexbox align="center" gap={4} horizontal>
                          <Trash2 size={12} />
                          {t('profileSetup.fields.bannerUrl.remove')}
                        </Flexbox>
                      </Text>
                    </Flexbox>
                  )}
                </Flexbox>
              </Form.Item>

              <Text style={styles.spacing2} type="secondary">
                {t('profileSetup.socialLinks.title')}
              </Text>

              <Form.Item name="github">
                <Input
                  placeholder={t('profileSetup.fields.github.placeholder')}
                  prefix={
                    <Icon
                      fill={cssVar.colorTextSecondary}
                      icon={SiGithub}
                      style={styles.spacing3}
                    />
                  }
                />
              </Form.Item>

              <Form.Item name="twitter">
                <Input
                  placeholder={t('profileSetup.fields.twitter.placeholder')}
                  prefix={
                    <Icon fill={cssVar.colorTextSecondary} icon={SiX} style={styles.spacing3} />
                  }
                />
              </Form.Item>

              <Form.Item
                name="website"
                rules={[
                  {
                    message: t('profileSetup.fields.website.invalidUrl'),
                    type: 'url',
                  },
                ]}
              >
                <Input
                  placeholder={t('profileSetup.fields.website.placeholder')}
                  prefix={
                    <Icon color={cssVar.colorTextSecondary} icon={Globe} style={styles.spacing3} />
                  }
                />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    );
  },
);

ProfileSetupModal.displayName = 'ProfileSetupModal';

export default ProfileSetupModal;
