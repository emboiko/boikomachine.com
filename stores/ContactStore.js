import { types, flow } from 'mobx-state-tree';
import { submitContactForm } from '@/services/client/contactClientService';
import { trackFormSubmit, sendGaEvent } from '@/services/client/analyticsClientService';
import {
  MAX_FILE_SIZE_BYTES,
  MAX_TOTAL_UPLOAD_BYTES,
  ALLOWED_FILE_EXTENSIONS,
} from '@/lib/constants';

const validateFiles = (files) => {
  if (!files || files.length === 0) {
    return null;
  }

  let totalSize = 0;

  for (const file of files) {
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;

    if (!ALLOWED_FILE_EXTENSIONS.includes(extension)) {
      return `${file.name} has a file type that is not allowed.`;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `${file.name} exceeds the 10 MB per-file limit.`;
    }

    totalSize += file.size;
  }

  if (totalSize > MAX_TOTAL_UPLOAD_BYTES) {
    return 'Total upload size exceeds the 25 MB limit.';
  }

  return null;
};

export const ContactStore = types
  .model('ContactStore', {
    name: types.optional(types.string, ''),
    email: types.optional(types.string, ''),
    phone: types.optional(types.string, ''),
    message: types.optional(types.string, ''),
    files: types.optional(types.frozen(), []),
    turnstileToken: types.optional(types.string, ''),
    isSubmitting: types.optional(types.boolean, false),
    submitSuccess: types.optional(types.boolean, false),
    errorMessage: types.optional(types.string, ''),
    fieldErrors: types.optional(types.frozen(), {}),
    turnstileKey: types.optional(types.number, 0),
    turnstileUnavailable: types.optional(types.boolean, false),
  })
  .views((self) => ({
    get isContactFormDisabled() {
      return self.turnstileUnavailable || self.submitSuccess;
    },
  }))
  .actions((self) => ({
    setName(value) {
      self.name = value;
    },
    setEmail(value) {
      self.email = value;
    },
    setPhone(value) {
      self.phone = value;
    },
    setMessage(value) {
      self.message = value;
    },
    setFiles(fileList) {
      self.files = Array.from(fileList || []);
    },
    setTurnstileToken(token) {
      self.turnstileToken = token;
    },
    clearTurnstileToken() {
      self.turnstileToken = '';
    },
    setTurnstileUnavailable() {
      self.turnstileUnavailable = true;
      self.turnstileToken = '';
    },
    resetForm() {
      self.name = '';
      self.email = '';
      self.phone = '';
      self.message = '';
      self.files = [];
      self.turnstileToken = '';
      self.submitSuccess = false;
      self.errorMessage = '';
      self.fieldErrors = {};
    },
    submit: flow(function* submit() {
      self.isSubmitting = true;
      self.errorMessage = '';
      self.fieldErrors = {};
      self.submitSuccess = false;

      if (self.turnstileUnavailable) {
        self.isSubmitting = false;
        return;
      }

      if (!self.name.trim()) {
        self.fieldErrors = { name: 'Name is required.' };
        self.isSubmitting = false;
        return;
      }

      if (!self.email.trim()) {
        self.fieldErrors = { email: 'Email is required.' };
        self.isSubmitting = false;
        return;
      }

      if (!self.message.trim()) {
        self.fieldErrors = { message: 'Message is required.' };
        self.isSubmitting = false;
        return;
      }

      if (!self.turnstileToken) {
        self.errorMessage = 'Please complete the verification challenge.';
        self.isSubmitting = false;
        return;
      }

      const fileError = validateFiles(self.files);

      if (fileError) {
        self.errorMessage = fileError;
        self.isSubmitting = false;
        return;
      }

      try {
        yield submitContactForm({
          name: self.name.trim(),
          email: self.email.trim(),
          phone: self.phone.trim(),
          message: self.message.trim(),
          files: self.files,
          turnstileToken: self.turnstileToken,
        });

        self.submitSuccess = true;
        trackFormSubmit('/#contact');
        sendGaEvent('form_submit', { form_name: 'contact' });

        self.name = '';
        self.email = '';
        self.phone = '';
        self.message = '';
        self.files = [];
        self.turnstileToken = '';
      } catch (error) {
        if (error.details?.fieldErrors) {
          self.fieldErrors = error.details.fieldErrors;
        }

        self.errorMessage = error.message || 'Failed to submit the form.';
      } finally {
        self.isSubmitting = false;
      }
    }),
  }));
