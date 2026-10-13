import type { E2EConfig } from 'e2e';
import { web } from '@e2e-dev/web';
import { createGoogle } from '@ai-sdk/google';

const google = createGoogle({
  apiKey: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export default {
  agents: {
    default: {
      model: google('gemini-3.8-flash'),
      providerOptions: {
        google: {
          thinkingConfig: {
            thinkingLevel: 'high',
          },
        },
      },
      system: 'You are a thorough QA agent. Verify every outcome on screen.',
    },
  },
  targets: [{
    engine: web(),
    app: {
      url: process.env.APP_URL ?? 'http://localhost:5173',
      command: {
        executable: 'npm',
        args: ['run', 'dev'],
        log: '.e2e/logs/app.log',
        reuseExisting: true,
      },
    },
  }],
} satisfies E2EConfig;
