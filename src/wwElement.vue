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

      <!-- Send button with WebGL liquid metal -->
      <div class="send-button" :style="buttonStyle" @click="sendMessage">
        <canvas ref="metalCanvas" class="metal-canvas"></canvas>
        <div class="button-inner">
          <svg class="arrow-icon" :style="arrowStyle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 19V5"/>
            <path d="M5 12l7-7 7 7"/>
          </svg>
        </div>
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
    metalRing2Style() {
      const speed = this.content.animationSpeed || 4;
      const enabled = this.content.animationEnabled !== false;
      // Same speed as ring 1 - they rotate together
      return {
        animation: enabled ? `rotate-ring ${speed}s linear infinite` : 'none',
      };
    },
    metalRing3Style() {
      const speed = this.content.animationSpeed || 4;
      const enabled = this.content.animationEnabled !== false;
      // Same speed - unified rotation
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

    // ========== WebGL Liquid Metal Shader ==========
    initWebGL() {
      const canvas = this.$refs.metalCanvas;
      if (!canvas) return;

      const size = this.content.buttonSize || 56;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = size * dpr;
      canvas.height = size * dpr;

      const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
      if (!gl) {
        console.warn('WebGL not supported');
        return;
      }

      this.gl = gl;
      this.startTime = performance.now();

      // Vertex shader
      const vsSource = `
        attribute vec2 aPosition;
        varying vec2 vUv;
        void main() {
          vUv = aPosition * 0.5 + 0.5;
          gl_Position = vec4(aPosition, 0.0, 1.0);
        }
      `;

      // Fragment shader - Clean Liquid Metal with Chromatic Refraction
      const fsSource = `
        precision highp float;
        varying vec2 vUv;
        uniform float uTime;
        uniform float uSpeed;
        uniform float uSoftness;
        uniform float uDistortion;

        #define PI 3.14159265359
        #define TAU 6.28318530718

        // Smooth noise (minimal, for subtle surface variation)
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
            f.y
          );
        }

        // Smooth fbm for gentle surface undulation
        float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          for (int i = 0; i < 3; i++) {
            v += a * noise(p);
            p *= 2.0;
            a *= 0.5;
          }
          return v;
        }

        void main() {
          vec2 uv = vUv * 2.0 - 1.0;
          float dist = length(uv);
          float angle = atan(uv.y, uv.x);

          // Ring mask with crisp edges
          float ringOuter = 1.0;
          float ringInner = 0.82;
          float ringMask = smoothstep(ringOuter, ringOuter - 0.015, dist) * 
                          smoothstep(ringInner - 0.015, ringInner, dist);

          // Smooth animation speed
          float time = uTime * uSpeed * 0.5;

          // === ROTATING CHROME GRADIENT ===
          float rotatingAngle = angle + time;
          
          // Main chrome reflection - smooth rotating gradient
          float chrome = sin(rotatingAngle * 2.0) * 0.5 + 0.5;
          chrome = smoothstep(0.15, 0.85, chrome);
          
          // Secondary reflection layer
          float chrome2 = sin(rotatingAngle * 1.0 + PI * 0.5) * 0.5 + 0.5;
          chrome2 = smoothstep(0.2, 0.8, chrome2);
          
          // Blend for smooth metallic gradient
          float metallic = mix(chrome, chrome2, 0.35);

          // === BASE METAL COLORS === (Pure neutral silver/chrome)
          vec3 darkMetal = vec3(0.05, 0.05, 0.05);   // Deep black shadow
          vec3 brightMetal = vec3(0.95, 0.95, 0.95); // Pure white highlight

          // High contrast metallic gradient
          vec3 baseColor = mix(darkMetal, brightMetal, metallic);

          // === CHROMATIC ABERRATION / REFRACTION ===
          // Color fringing at transition edges
          float chromeR = sin((angle + 0.15 + time) * 2.0) * 0.5 + 0.5;
          float chromeB = sin((angle - 0.15 + time) * 2.0) * 0.5 + 0.5;
          
          chromeR = smoothstep(0.15, 0.85, chromeR);
          chromeB = smoothstep(0.15, 0.85, chromeB);

          // Warm color (orange/gold)
          vec3 warmRefract = vec3(1.0, 0.65, 0.25);
          // Cool color (light blue)
          vec3 coolRefract = vec3(0.6, 0.8, 1.0);

          // Apply at edges where chrome transitions
          float warmMask = max(0.0, chromeR - chrome) * 0.8;
          float coolMask = max(0.0, chrome - chromeB) * 0.6;
          
          vec3 color = baseColor;
          color = mix(color, warmRefract, warmMask * 0.4);
          color = mix(color, coolRefract, coolMask * 0.3);

          // === SPECULAR HIGHLIGHTS ===
          // Main rotating highlight
          float highlightAngle = time * 1.2;
          float highlight = cos(angle - highlightAngle);
          highlight = pow(max(0.0, highlight), 16.0);
          
          // Secondary highlight opposite side
          float highlight2 = cos(angle - highlightAngle + PI);
          highlight2 = pow(max(0.0, highlight2), 6.0) * 0.3;
          
          // Pure white highlights
          color += vec3(1.0) * highlight * 1.0;
          color += vec3(0.85) * highlight2;

          // === SUBTLE SURFACE VARIATION ===
          float surfaceNoise = fbm(vec2(angle * 2.0, dist * 8.0) + time * 0.15);
          color *= 0.96 + surfaceNoise * 0.08;

          // === RING DEPTH / 3D CURVATURE ===
          float ringDepth = sin((dist - ringInner) / (ringOuter - ringInner) * PI);
          color *= 0.75 + 0.25 * ringDepth;

          // === RIM HIGHLIGHTS ===
          // Pure silver edges
          float innerRim = smoothstep(ringInner + 0.025, ringInner, dist);
          float outerRim = smoothstep(ringOuter - 0.025, ringOuter, dist);
          color += vec3(0.8) * innerRim * 0.5;
          color += vec3(0.7) * outerRim * 0.4;

          // === FRESNEL EDGE BRIGHTENING ===
          float ringEdgeDist = abs((dist - ringInner) / (ringOuter - ringInner) - 0.5) * 2.0;
          float fresnelEdge = pow(ringEdgeDist, 2.0) * 0.12;
          color += vec3(0.85) * fresnelEdge;

          // === FINAL OUTPUT ===
          // Boost contrast for more metallic look
          color = pow(color, vec3(0.92));
          
          // Clamp
          color = min(color, vec3(1.15));

          gl_FragColor = vec4(color, ringMask);
        }
      `;

      // Compile shaders
      const vs = this.createShader(gl, gl.VERTEX_SHADER, vsSource);
      const fs = this.createShader(gl, gl.FRAGMENT_SHADER, fsSource);
      if (!vs || !fs) return;

      // Create program
      const program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return;
      }

      this.program = program;
      gl.useProgram(program);

      // Geometry - fullscreen quad
      const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      const aPosition = gl.getAttribLocation(program, 'aPosition');
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

      // Uniforms
      this.uniforms = {
        uTime: gl.getUniformLocation(program, 'uTime'),
        uSpeed: gl.getUniformLocation(program, 'uSpeed'),
        uSoftness: gl.getUniformLocation(program, 'uSoftness'),
        uDistortion: gl.getUniformLocation(program, 'uDistortion'),
      };

      // Enable blending
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      // Start animation
      this.animate();
    },

    createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    },

    animate() {
      if (!this.gl || !this.program) return;

      const gl = this.gl;
      const speed = this.content.animationSpeed || 4;
      const enabled = this.content.animationEnabled !== false;

      const elapsed = enabled ? (performance.now() - this.startTime) / 1000 : 0;

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(this.uniforms.uTime, elapsed);
      gl.uniform1f(this.uniforms.uSpeed, 2.0 / speed);  // Fast visible rotation
      gl.uniform1f(this.uniforms.uSoftness, 0.65);      // Sharper highlights
      gl.uniform1f(this.uniforms.uDistortion, 1.0);     // Strong liquid movement

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      this.rafId = requestAnimationFrame(() => this.animate());
    },

    destroyWebGL() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
      }
      if (this.gl && this.program) {
        this.gl.deleteProgram(this.program);
      }
      this.gl = null;
      this.program = null;
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.initWebGL();
    });
  },

  beforeUnmount() {
    this.destroyWebGL();
  },

  watch: {
    'content.buttonSize'() {
      this.destroyWebGL();
      this.$nextTick(() => this.initWebGL());
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

/* Send button - WebGL liquid metal */
.send-button {
  border-radius: 50%;
  position: relative;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.03);

    .arrow-icon {
      color: #c0c0c0;
    }
  }

  &:active {
    transform: scale(0.97);
  }
}

/* WebGL canvas */
.metal-canvas {
  position: absolute;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  border-radius: 50%;
  pointer-events: none;
}

/* Inner button face */
.button-inner {
  position: absolute;
  inset: 9%;
  border-radius: 50%;
  background: 
    radial-gradient(ellipse 80% 60% at 35% 30%, rgba(45, 45, 50, 0.9) 0%, transparent 50%),
    linear-gradient(180deg, #18181a 0%, #0c0c0e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    inset 0 1px 4px rgba(255, 255, 255, 0.06),
    inset 0 -2px 8px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(0, 0, 0, 0.3);
}

/* Arrow icon */
.arrow-icon {
  color: #707070;
  transition: color 0.3s ease;
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
