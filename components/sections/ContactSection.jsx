'use client';

import { useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Section } from '@/components/layout/Section';
import { TurnstileWidget } from '@/components/contact/TurnstileWidget';
import { useStore } from '@/components/StoreProvider';
import { BUSINESS } from '@/lib/constants';
import { formatPhoneAsYouType } from '@/lib/formatPhone';
import { trackCtaClick, sendGaEvent } from '@/services/client/analyticsClientService';

export const ContactSection = observer(() => {
  const store = useStore();
  const { contact } = store;

  const handleVerify = useCallback(
    (token) => {
      contact.setTurnstileToken(token);
    },
    [contact],
  );

  const handleExpire = useCallback(() => {
    contact.clearTurnstileToken();
  }, [contact]);

  const handleTurnstileUnavailable = useCallback(() => {
    contact.setTurnstileUnavailable();
  }, [contact]);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      contact.setTurnstileUnavailable();
    }
  }, [contact]);

  const isFormDisabled = contact.isContactFormDisabled;
  const isTurnstileUnavailable = contact.turnstileUnavailable;

  const handleCallClick = () => {
    trackCtaClick('/#contact', { cta: 'call' });
    sendGaEvent('cta_call', { location: 'contact_section' });
  };

  const handleEmailClick = () => {
    trackCtaClick('/#contact', { cta: 'email' });
    sendGaEvent('cta_email', { location: 'contact_section' });
  };

  let submitButtonLabel = 'Send Message';

  if (contact.isSubmitting) {
    submitButtonLabel = 'Sending…';
  } else if (contact.submitSuccess) {
    submitButtonLabel = 'Message sent';
  }

  return (
    <Section id="contact" title="Contact">
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 4, md: 5 }}
        sx={{ width: '100%', alignItems: 'flex-start' }}
      >
        <Box sx={{ width: { xs: '100%', md: '38%' }, minWidth: 0 }}>
          <Stack spacing={2}>
            <Typography variant="body1" color="text.secondary">
              Tell us about your part, problem, or project. Drawings are helpful but not required -
              photos and a clear description work well. We use what you send only to evaluate whether
              we can take the job on. We do not sell your information or add you to marketing lists.
            </Typography>
            <Typography variant="body1">
              <Link href={BUSINESS.phoneHref} underline="hover" onClick={handleCallClick}>
                {BUSINESS.phone}
              </Link>
            </Typography>
            <Typography variant="body1">
              <Link href={BUSINESS.emailHref} underline="hover" onClick={handleEmailClick}>
                {BUSINESS.email}
              </Link>
            </Typography>
          </Stack>
        </Box>

        <Box
          component="form"
          sx={{ width: { xs: '100%', md: '62%' }, minWidth: 0, flex: 1 }}
          onSubmit={(event) => {
            event.preventDefault();

            if (!contact.submitSuccess) {
              contact.submit();
            }
          }}
        >
          <Stack spacing={2}>
            {contact.submitSuccess && (
              <Alert severity="success">
                Thank you. Your message has been received and we will follow up soon.
              </Alert>
            )}

            {contact.errorMessage && <Alert severity="error">{contact.errorMessage}</Alert>}

            <TextField
              label="Name"
              required
              fullWidth
              disabled={isFormDisabled}
              value={contact.name}
              onChange={(event) => contact.setName(event.target.value)}
              error={Boolean(contact.fieldErrors.name)}
              helperText={contact.fieldErrors.name}
            />

            <TextField
              label="Email"
              type="email"
              required
              fullWidth
              disabled={isFormDisabled}
              value={contact.email}
              onChange={(event) => contact.setEmail(event.target.value)}
              error={Boolean(contact.fieldErrors.email)}
              helperText={contact.fieldErrors.email}
            />

            <TextField
              label="Phone (optional)"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              fullWidth
              disabled={isFormDisabled}
              value={contact.phone}
              onChange={(event) => {
                contact.setPhone(formatPhoneAsYouType(event.target.value));
              }}
              placeholder="(555) 555-0100"
            />

            <TextField
              label="Message"
              required
              fullWidth
              multiline
              minRows={5}
              disabled={isFormDisabled}
              value={contact.message}
              onChange={(event) => contact.setMessage(event.target.value)}
              error={Boolean(contact.fieldErrors.message)}
              helperText={contact.fieldErrors.message}
              placeholder="Describe the part, problem, material, quantity, or attach photos/drawings below."
            />

            <Box sx={{ width: '100%', minWidth: 0 }}>
              <Button variant="outlined" component="label" fullWidth disabled={isFormDisabled}>
                Attach files (optional)
                <input
                  hidden
                  multiple
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.heic,.pdf,.stp,.step,.dxf,.sla"
                  onChange={(event) => {
                    contact.setFiles(event.target.files);
                  }}
                />
              </Button>
              {contact.files.length > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, wordBreak: 'break-word' }}>
                  {contact.files.map((file) => file.name).join(', ')}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Photos, PDF drawings, STEP, and DXF files accepted.
              </Typography>
            </Box>

            {isTurnstileUnavailable ? (
              <Alert severity="warning">
                The contact form is temporarily unavailable. Please email us at{' '}
                <Link href={BUSINESS.emailHref} underline="hover" onClick={handleEmailClick}>
                  {BUSINESS.email}
                </Link>{' '}
                with your project details instead.
              </Alert>
            ) : null}

            {!isTurnstileUnavailable && !contact.submitSuccess && (
              <Box sx={{ width: '100%', minWidth: 0 }}>
                <TurnstileWidget
                  key={contact.turnstileKey}
                  onVerify={handleVerify}
                  onExpire={handleExpire}
                  onUnavailable={handleTurnstileUnavailable}
                />
              </Box>
            )}

            <Typography variant="body2" color="text.secondary">
              Your details and files are used only to assess whether we can help with your project.
            </Typography>

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={
                isFormDisabled ||
                contact.isSubmitting ||
                (!contact.submitSuccess && !contact.turnstileToken)
              }
            >
              {submitButtonLabel}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Section>
  );
});
