export default {
  editor: {
    label: {
      en: "Liquid Glass Chat Input",
    },
    icon: "chat",
    bubble: {
      icon: "chat",
    },
  },
  triggerEvents: [
    {
      name: 'message-sent',
      label: { en: 'On message sent' },
      event: {
        message: '',
        files: [],
        photo: null,
      },
    },
    {
      name: 'camera-clicked',
      label: { en: 'On camera clicked' },
      event: {},
    },
    {
      name: 'mic-clicked',
      label: { en: 'On microphone clicked' },
      event: {},
    },
    {
      name: 'upload-clicked',
      label: { en: 'On upload clicked' },
      event: {},
    },
    {
      name: 'ai-clicked',
      label: { en: 'On AI icon clicked' },
      event: {},
    },
  ],
  properties: {
    // Text Input
    placeholder: {
      label: { en: "Placeholder text" },
      type: "Text",
      defaultValue: "Message...",
      bindable: true,
      section: "settings",
    },

    // Container Styling
    containerBackground: {
      label: { en: "Container background" },
      type: "Color",
      defaultValue: "#0d0d0d",
      section: "style",
    },
    containerBorderRadius: {
      label: { en: "Container border radius" },
      type: "Number",
      options: {
        min: 0,
        max: 100,
        step: 1,
      },
      defaultValue: 100,
      section: "style",
    },
    containerPadding: {
      label: { en: "Container padding" },
      type: "Number",
      options: {
        min: 4,
        max: 32,
        step: 2,
      },
      defaultValue: 12,
      section: "style",
    },

    // Send Button
    buttonSize: {
      label: { en: "Send button size" },
      type: "Number",
      options: {
        min: 32,
        max: 100,
        step: 4,
      },
      defaultValue: 56,
      section: "style",
    },
    animationSpeed: {
      label: { en: "Animation speed (seconds)" },
      type: "Number",
      options: {
        min: 1,
        max: 10,
        step: 0.5,
      },
      defaultValue: 4,
      section: "style",
    },
    animationEnabled: {
      label: { en: "Enable animation" },
      type: "OnOff",
      defaultValue: true,
      section: "style",
    },

    // Icon Sizes
    iconSize: {
      label: { en: "Icon size" },
      type: "Number",
      options: {
        min: 16,
        max: 48,
        step: 2,
      },
      defaultValue: 26,
      section: "style",
    },
    iconColor: {
      label: { en: "Icon color" },
      type: "Color",
      defaultValue: "#5a5a5a",
      section: "style",
    },
    iconHoverColor: {
      label: { en: "Icon hover color" },
      type: "Color",
      defaultValue: "#8a8a8a",
      section: "style",
    },

    // Show/Hide Icons
    showUploadIcon: {
      label: { en: "Show upload (+) icon" },
      type: "OnOff",
      defaultValue: true,
      section: "settings",
    },
    showCameraIcon: {
      label: { en: "Show camera icon" },
      type: "OnOff",
      defaultValue: true,
      section: "settings",
    },
    showMicIcon: {
      label: { en: "Show microphone icon" },
      type: "OnOff",
      defaultValue: true,
      section: "settings",
    },
    showAiIcon: {
      label: { en: "Show AI sparkle icon" },
      type: "OnOff",
      defaultValue: true,
      section: "settings",
    },

    // Text Styling
    textColor: {
      label: { en: "Text color" },
      type: "Color",
      defaultValue: "#e0e0e0",
      section: "style",
    },
    placeholderColor: {
      label: { en: "Placeholder color" },
      type: "Color",
      defaultValue: "#5a5a5a",
      section: "style",
    },
    fontSize: {
      label: { en: "Font size" },
      type: "Number",
      options: {
        min: 12,
        max: 24,
        step: 1,
      },
      defaultValue: 16,
      section: "style",
    },
  },
};
