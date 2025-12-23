<template>
  <div class="liquid-glass-chat">
    <!-- Media preview area -->
    <div class="media-preview" :class="{ active: showMediaPreview }">
      <video ref="cameraPreview" autoplay playsinline :class="{ active: cameraActive }"></video>
      <canvas ref="photoCanvas" style="display: none;"></canvas>
      <img ref="capturedPhoto" :src="capturedPhotoSrc" :class="{ active: showCapturedPhoto }" />
      <div class="preview-controls" :class="{ active: showPreviewControls }">
        <button class="preview-btn capture-btn" @click="capturePhoto" v-if="cameraActive">📷 Capture</button>
        <button class="preview-btn close-btn" @click="closePreview">✕ Close</button>
      </div>
      <div class="recording-indicator" :class="{ active: isRecording }">
        <span class="recording-dot"></span>
        Recording...
      </div>
      <div class="file-preview" :class="{ active: uploadedFiles.length > 0 }">
        <div class="file-item" v-for="(file, index) in uploadedFiles" :key="index">
          <img v-if="file.type && file.type.startsWith('image/')" :src="file.preview" />
          <span v-else class="file-icon">{{ getFileIcon(file.type) }}</span>
          <span>{{ truncateFileName(file.name) }}</span>
          <span class="remove-file" @click="removeFile(index)">✕</span>
        </div>
      </div>
    </div>

    <!-- Input container -->
    <div class="input-container" :style="containerStyle">
      <!-- Hidden file input -->
      <input type="file" ref="fileInput" accept="image/*,video/*,.pdf,.doc,.docx" multiple hidden @change="handleFileUpload" />

      <!-- Left icons -->
      <div class="icons" v-if="content.showUploadIcon">
        <svg 
          class="icon icon-stroke" 
          :style="iconStyle" 
          viewBox="0 0 24 24" 
          @click="handleUploadClick"
          @mouseenter="hoveredIcon = 'upload'"
          @mouseleave="hoveredIcon = null"
        >
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </div>

      <!-- Text input -->
      <input 
        type="text" 
        class="text-input" 
        :style="inputStyle"
        :placeholder="content.placeholder || 'Message...'"
        v-model="message"
        @keypress.enter="sendMessage"
      />

      <!-- Right icons -->
      <div class="icons">
        <!-- Camera icon -->
        <svg 
          v-if="content.showCameraIcon"
          class="icon icon-stroke" 
          :class="{ active: cameraActive }" 
          :style="getIconStyle('camera')"
          viewBox="0 0 24 24" 
          @click="handleCameraClick"
          @mouseenter="hoveredIcon = 'camera'"
          @mouseleave="hoveredIcon = null"
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>

        <!-- Microphone icon -->
        <svg 
          v-if="content.showMicIcon"
          class="icon icon-stroke" 
          :class="{ active: isRecording }" 
          :style="getIconStyle('mic')"
          viewBox="0 0 24 24" 
          @click="handleMicClick"
          @mouseenter="hoveredIcon = 'mic'"
          @mouseleave="hoveredIcon = null"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>

        <!-- Sparkle/AI icon -->
        <svg 
          v-if="content.showAiIcon"
          class="icon icon-sparkle" 
          :style="getIconStyle('ai')"
          viewBox="0 0 24 24"
          @click="handleAiClick"
          @mouseenter="hoveredIcon = 'ai'"
          @mouseleave="hoveredIcon = null"
        >
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
        </svg>
      </div>

      <!-- Send button with liquid metal effect -->
      <div class="send-button" :style="buttonStyle" @click="sendMessage">
        <div class="metal-ring" :style="metalRingStyle"></div>
        <div class="prismatic-glow" :style="prismaticStyle"></div>
        <div class="button-inner">
          <svg class="arrow-icon" :style="arrowStyle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 19V5"/>
            <path d="M5 12l7-7 7 7"/>
          </svg>
        </div>
        <div class="shine-overlay"></div>
        <div class="ambient-light"></div>
        <div class="highlight-top"></div>
      </div>
    </div>

    <!-- Toast notification -->
    <div class="toast" :class="{ show: showToast }">{{ toastMessage }}</div>
  </div>
</template>

<script>
export default {
  props: {
    content: { type: Object, required: true },
  },
  emits: ['trigger-event'],
  data() {
    return {
      message: '',
      uploadedFiles: [],
      cameraStream: null,
      cameraActive: false,
      capturedPhotoSrc: '',
      showCapturedPhoto: false,
      showMediaPreview: false,
      showPreviewControls: false,
      isRecording: false,
      mediaRecorder: null,
      audioChunks: [],
      toastMessage: '',
      showToast: false,
      hoveredIcon: null,
    };
  },
  computed: {
    containerStyle() {
      return {
        background: this.content.containerBackground || '#0d0d0d',
        borderRadius: `${this.content.containerBorderRadius || 100}px`,
        padding: `${this.content.containerPadding || 12}px ${this.content.containerPadding + 4 || 16}px ${this.content.containerPadding || 12}px ${this.content.containerPadding + 8 || 20}px`,
      };
    },
    buttonStyle() {
      const size = this.content.buttonSize || 56;
      return {
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
      };
    },
    metalRingStyle() {
      const speed = this.content.animationSpeed || 4;
      const enabled = this.content.animationEnabled !== false;
      return {
        animation: enabled ? `rotate-ring ${speed}s linear infinite` : 'none',
      };
    },
    prismaticStyle() {
      const speed = this.content.animationSpeed || 4;
      const enabled = this.content.animationEnabled !== false;
      return {
        animation: enabled ? `rotate-ring ${speed}s linear infinite` : 'none',
      };
    },
    arrowStyle() {
      const size = this.content.buttonSize || 56;
      const arrowSize = Math.max(16, size * 0.4);
      return {
        width: `${arrowSize}px`,
        height: `${arrowSize}px`,
      };
    },
    iconStyle() {
      const size = this.content.iconSize || 26;
      const color = this.hoveredIcon === 'upload' 
        ? (this.content.iconHoverColor || '#8a8a8a')
        : (this.content.iconColor || '#5a5a5a');
      return {
        width: `${size}px`,
        height: `${size}px`,
        color: color,
      };
    },
    inputStyle() {
      return {
        color: this.content.textColor || '#e0e0e0',
        fontSize: `${this.content.fontSize || 16}px`,
        '--placeholder-color': this.content.placeholderColor || '#5a5a5a',
      };
    },
  },
  methods: {
    getIconStyle(iconName) {
      const size = this.content.iconSize || 26;
      const isHovered = this.hoveredIcon === iconName;
      const color = isHovered 
        ? (this.content.iconHoverColor || '#8a8a8a')
        : (this.content.iconColor || '#5a5a5a');
      return {
        width: `${size}px`,
        height: `${size}px`,
        color: color,
      };
    },

    showToastMessage(msg) {
      this.toastMessage = msg;
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 3000);
    },

    handleUploadClick() {
      this.$emit('trigger-event', { name: 'upload-clicked', event: {} });
      this.$refs.fileInput.click();
    },

    handleCameraClick() {
      this.$emit('trigger-event', { name: 'camera-clicked', event: {} });
      this.toggleCamera();
    },

    handleMicClick() {
      this.$emit('trigger-event', { name: 'mic-clicked', event: {} });
      this.toggleMicrophone();
    },

    handleAiClick() {
      this.$emit('trigger-event', { name: 'ai-clicked', event: {} });
    },

    handleFileUpload(e) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const fileObj = {
          name: file.name,
          type: file.type,
          file: file,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        };
        this.uploadedFiles.push(fileObj);
      });
      if (files.length > 0) {
        this.showMediaPreview = true;
        this.showToastMessage(`${files.length} file(s) selected`);
      }
    },

    removeFile(index) {
      this.uploadedFiles.splice(index, 1);
      if (this.uploadedFiles.length === 0 && !this.cameraActive) {
        this.showMediaPreview = false;
      }
    },

    getFileIcon(type) {
      if (!type) return '📁';
      if (type.includes('pdf')) return '📄';
      if (type.includes('video')) return '🎬';
      if (type.includes('audio')) return '🎵';
      return '📁';
    },

    truncateFileName(name) {
      if (!name) return '';
      return name.length > 15 ? name.substring(0, 15) + '...' : name;
    },

    async toggleCamera() {
      if (this.cameraActive) {
        this.stopCamera();
        return;
      }

      try {
        this.cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        this.$refs.cameraPreview.srcObject = this.cameraStream;
        this.cameraActive = true;
        this.showMediaPreview = true;
        this.showPreviewControls = true;
        this.showToastMessage('Camera activated');
      } catch (err) {
        this.showToastMessage('Camera access denied');
        console.error('Camera error:', err);
      }
    },

    stopCamera() {
      if (this.cameraStream) {
        this.cameraStream.getTracks().forEach(track => track.stop());
        this.cameraStream = null;
      }
      if (this.$refs.cameraPreview) {
        this.$refs.cameraPreview.srcObject = null;
      }
      this.cameraActive = false;
      this.showPreviewControls = this.showCapturedPhoto;
      if (this.uploadedFiles.length === 0 && !this.showCapturedPhoto) {
        this.showMediaPreview = false;
      }
    },

    capturePhoto() {
      if (!this.cameraStream) return;

      const canvas = this.$refs.photoCanvas;
      const video = this.$refs.cameraPreview;
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      this.capturedPhotoSrc = canvas.toDataURL('image/png');
      this.showCapturedPhoto = true;
      this.stopCamera();
      this.showPreviewControls = true;
      this.showToastMessage('Photo captured!');
    },

    closePreview() {
      this.stopCamera();
      this.showCapturedPhoto = false;
      this.capturedPhotoSrc = '';
      if (this.uploadedFiles.length === 0) {
        this.showMediaPreview = false;
        this.showPreviewControls = false;
      }
    },

    async toggleMicrophone() {
      if (this.isRecording) {
        this.stopRecording();
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];

        this.mediaRecorder.ondataavailable = (e) => {
          this.audioChunks.push(e.data);
        };

        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const audioFile = {
            name: `recording-${Date.now()}.webm`,
            type: 'audio/webm',
            file: audioBlob,
            preview: null,
          };
          this.uploadedFiles.push(audioFile);
          this.showMediaPreview = true;
          this.showToastMessage('Audio recorded!');
          stream.getTracks().forEach(track => track.stop());
        };

        this.mediaRecorder.start();
        this.isRecording = true;
        this.showMediaPreview = true;
        this.showToastMessage('Recording started...');
      } catch (err) {
        this.showToastMessage('Microphone access denied');
        console.error('Microphone error:', err);
      }
    },

    stopRecording() {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop();
        this.isRecording = false;
      }
    },

    sendMessage() {
      const hasContent = this.message.trim() || this.uploadedFiles.length > 0 || this.showCapturedPhoto;
      
      if (hasContent) {
        this.$emit('trigger-event', {
          name: 'message-sent',
          event: {
            message: this.message,
            files: this.uploadedFiles,
            photo: this.capturedPhotoSrc || null,
          },
        });

        this.showToastMessage('Message sent! ✨');

        // Clear everything
        this.message = '';
        this.uploadedFiles = [];
        this.showCapturedPhoto = false;
        this.capturedPhotoSrc = '';
        this.showMediaPreview = false;
        this.showPreviewControls = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.liquid-glass-chat {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.4),
    inset 0 1px 1px rgba(255, 255, 255, 0.03);
  position: relative;
  max-width: 600px;
  width: 100%;
}

.icons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon {
  cursor: pointer;
  transition: all 0.2s ease;

  &.active {
    color: #ff6b6b !important;
    animation: pulse 1.5s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.icon-stroke {
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}

.icon-sparkle {
  fill: currentColor;
}

.text-input {
  flex: 1;
  min-width: 120px;
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;
  padding: 8px 0;

  &::placeholder {
    color: var(--placeholder-color, #5a5a5a);
  }

  &:focus::placeholder {
    opacity: 0.7;
  }
}

/* Send button with liquid metal effect */
.send-button {
  border-radius: 50%;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.02);

    .arrow-icon {
      color: #9a9a9a;
    }

    .shine-overlay {
      opacity: 1;
    }
  }

  &:active {
    transform: scale(0.98);
  }
}

.metal-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  padding: 3px;
  background: conic-gradient(
    from 180deg,
    #1a1a1a 0deg,
    #3a3a3a 30deg,
    #6a6a6a 60deg,
    #9a9a9a 90deg,
    #c0c0c0 120deg,
    #e0e0e0 140deg,
    #ffffff 160deg,
    #e0e0e0 180deg,
    #c0c0c0 200deg,
    #9a9a9a 230deg,
    #6a6a6a 270deg,
    #3a3a3a 310deg,
    #1a1a1a 360deg
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

@keyframes rotate-ring {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.prismatic-glow {
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  background: conic-gradient(
    from 200deg,
    transparent 0deg,
    transparent 140deg,
    rgba(255, 200, 150, 0.5) 160deg,
    rgba(255, 140, 100, 0.4) 180deg,
    rgba(255, 100, 80, 0.3) 200deg,
    rgba(100, 120, 255, 0.4) 220deg,
    rgba(80, 150, 255, 0.3) 240deg,
    transparent 260deg,
    transparent 360deg
  );
  filter: blur(3px);
  opacity: 1;
}

.button-inner {
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at 30% 30%,
    #2a2a2a 0%,
    #1a1a1a 40%,
    #0d0d0d 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    inset 0 2px 4px rgba(255, 255, 255, 0.05),
    inset 0 -2px 4px rgba(0, 0, 0, 0.3);
}

.arrow-icon {
  color: #6a6a6a;
  transition: color 0.2s ease;
}

.shine-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    transparent 40%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.ambient-light {
  position: absolute;
  top: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 8px;
  background: radial-gradient(
    ellipse,
    rgba(255, 255, 255, 0.15) 0%,
    transparent 70%
  );
  border-radius: 50%;
}

.highlight-top {
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 50%;
  height: 20px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.08) 0%,
    transparent 100%
  );
  border-radius: 50%;
  pointer-events: none;
}

/* Media preview */
.media-preview {
  display: none;
  position: relative;
  width: 100%;
  max-width: 600px;
  margin-bottom: 20px;
  border-radius: 20px;
  overflow: hidden;
  background: #0d0d0d;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);

  &.active {
    display: block;
  }

  video, img {
    width: 100%;
    max-height: 300px;
    object-fit: cover;
    display: none;

    &.active {
      display: block;
    }
  }
}

.preview-controls {
  display: none;
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  gap: 12px;

  &.active {
    display: flex;
  }
}

.preview-btn {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.05);
  }
}

.capture-btn {
  background: rgba(255, 100, 100, 0.8);

  &:hover {
    background: rgba(255, 80, 80, 0.95);
  }
}

.recording-indicator {
  display: none;
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(255, 0, 0, 0.8);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  align-items: center;
  gap: 8px;

  &.active {
    display: flex;
  }
}

.recording-dot {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.file-preview {
  display: none;
  padding: 16px;
  gap: 12px;
  flex-wrap: wrap;

  &.active {
    display: flex;
  }
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #1a1a1a;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  color: #b0b0b0;

  img {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 8px;
    display: block;
  }

  .file-icon {
    font-size: 20px;
  }

  .remove-file {
    color: #666;
    cursor: pointer;
    margin-left: 8px;

    &:hover {
      color: #ff6b6b;
    }
  }
}

.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background: #1a1a1a;
  color: #e0e0e0;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);

  &.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
