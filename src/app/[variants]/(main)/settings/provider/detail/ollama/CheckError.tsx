import { type ChatMessageError } from '@lobechat/types';
import { Skeleton } from '@lobehub/ui';
import { type ReactNode } from 'react';

import dynamic from '@/libs/next/dynamic';
import { StyleSheet } from '@/utils/styles';

import Container from './Container';

const styles = StyleSheet.create({
  style: {
    width: 400,
  },
});

const loading = () => <Skeleton active style={styles.style} />;

const OllamaSetupGuide = dynamic(() => import('@/features/OllamaSetupGuide'), {
  loading,
  ssr: false,
});

const InvalidModel = dynamic(() => import('@/features/OllamaModelDownloader'), {
  loading,
  ssr: false,
});

interface OllamaError {
  code: string | null;
  message: string;
  param?: any;
  type: string;
}

interface OllamaErrorResponse {
  error: OllamaError;
}

const UNRESOLVED_MODEL_REGEXP = /model "([\w+,-_]+)" not found/;

const CheckError = ({
  defaultError,
  error,
  setError,
}: {
  defaultError: ReactNode;
  error?: ChatMessageError;
  setError: (error?: ChatMessageError) => void;
}) => {
  const errorBody: OllamaErrorResponse = error?.body;

  const errorMessage = errorBody.error?.message;

  if (error?.type === 'OllamaServiceUnavailable') return <OllamaSetupGuide />;

  // error of not pull the model
  const unresolvedModel = errorMessage?.match(UNRESOLVED_MODEL_REGEXP)?.[1];

  if (unresolvedModel) {
    return (
      <Container setError={setError}>
        <InvalidModel model={unresolvedModel} />
      </Container>
    );
  }

  // error of not enable model or not set the CORS rules
  if (errorMessage?.includes('Failed to fetch') || errorMessage?.includes('fetch failed')) {
    return (
      <Container setError={setError}>
        <OllamaSetupGuide />
      </Container>
    );
  }

  return defaultError;
};

export default CheckError;
