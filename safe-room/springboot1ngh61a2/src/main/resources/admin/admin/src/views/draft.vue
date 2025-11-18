<template>
  <!-- Draft Page - Self-contained Microsoft Copilot Composer -->
  <div class="draft-page">
    <div class="composer-container">
      <!-- Main Composer Container -->
      <div class="composer-main" data-testid="composer">
        <!-- Outer glow effect -->
        <div class="composer-glow"></div>

        <!-- Main composer body -->
        <div class="composer-body">
          <!-- Content area -->
          <div class="composer-content" data-testid="composer-content">
            <!-- Inner composer with gradient background -->
            <div class="composer-inner">
              <!-- White overlay -->
              <div class="composer-white-overlay">
                <!-- Input area container -->
                <div class="composer-input-container">
                  <!-- Spacer -->
                  <div class="composer-spacer"></div>

                  <!-- Input section -->
                  <div class="composer-input-section">
                    <div class="composer-input-wrapper">
                      <!-- Text input area -->
                      <div class="composer-text-area">
                        <div class="composer-scroll-area">
                          <div class="composer-input-relative">
                            <!-- Hidden label for accessibility -->
                            <label class="composer-label" for="userInput">
                              Message Copilot
                            </label>
                            <!-- Main textarea -->
                            <textarea
                              class="composer-textarea"
                              placeholder="Message Copilot"
                              id="userInput"
                              role="textbox"
                              aria-autocomplete="both"
                              spellcheck="false"
                              enterkeyhint="enter"
                              data-testid="composer-input"
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Bottom spacing -->
                    <div class="composer-bottom-spacer"></div>
                  </div>
                </div>

                <!-- Bottom controls -->
                <div class="composer-controls">
                  <!-- Left controls -->
                  <div class="composer-left-controls">
                    <!-- Home button -->
                    <div class="composer-home-button">
                      <button
                        type="button"
                        class="composer-button composer-home-btn"
                        disabled
                        aria-hidden="true"
                        aria-label="Go to home"
                        title="Go to home"
                        data-testid="home-button"
                      >
                        <svg class="composer-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M22.9253 4.97196C22.5214 3.79244 21.4126 3 20.1658 3L18.774 3C17.3622 3 16.1532 4.01106 15.9033 5.40051L14.4509 13.4782L15.0163 11.5829C15.3849 10.347 16.5215 9.5 17.8112 9.5L23.0593 9.5L25.3054 10.809L27.4705 9.5H26.5598C25.313 9.5 24.2042 8.70756 23.8003 7.52804L22.9253 4.97196Z" fill="url(#home-gradient-0)"></path>
                          <path d="M9.39637 27.0147C9.79613 28.2011 10.9084 29 12.1604 29H14.5727C16.1772 29 17.4805 27.704 17.4893 26.0995L17.5315 18.4862L16.9699 20.4033C16.6058 21.6461 15.4659 22.5 14.1708 22.5H8.88959L6.96437 21.0214L4.88007 22.5H5.78013C7.03206 22.5 8.14435 23.299 8.54411 24.4853L9.39637 27.0147Z" fill="url(#home-gradient-1)"></path>
                          <path d="M19.7501 3H8.81266C5.68767 3 3.81268 7.08916 2.56269 11.1783C1.08177 16.0229 -0.856044 22.5021 4.75017 22.5021H9.66051C10.9615 22.5021 12.105 21.6415 12.4657 20.3915C13.2784 17.5759 14.7501 12.4993 15.9014 8.65192C16.4758 6.73249 16.9543 5.08404 17.6886 4.05749C18.1003 3.48196 18.7864 3 19.7501 3Z" fill="url(#home-gradient-2)"></path>
                          <path d="M19.7501 3H8.81266C5.68767 3 3.81268 7.08916 2.56269 11.1783C1.08177 16.0229 -0.856044 22.5021 4.75017 22.5021H9.66051C10.9615 22.5021 12.105 21.6415 12.4657 20.3915C13.2784 17.5759 14.7501 12.4993 15.9014 8.65192C16.4758 6.73249 16.9543 5.08404 17.6886 4.05749C18.1003 3.48196 18.7864 3 19.7501 3Z" fill="url(#home-gradient-3)"></path>
                          <path d="M12.2478 29H23.1852C26.3102 29 28.1852 24.9103 29.4352 20.8207C30.9161 15.9755 32.854 9.49548 27.2477 9.49548H22.3375C21.0364 9.49548 19.893 10.3562 19.5322 11.6062C18.7196 14.4221 17.2479 19.4994 16.0965 23.3474C15.5221 25.2671 15.0436 26.9157 14.3093 27.9424C13.8976 28.518 13.2115 29 12.2478 29Z" fill="url(#home-gradient-4)"></path>
                          <path d="M12.2478 29H23.1852C26.3102 29 28.1852 24.9103 29.4352 20.8207C30.9161 15.9755 32.854 9.49548 27.2477 9.49548H22.3375C21.0364 9.49548 19.893 10.3562 19.5322 11.6062C18.7196 14.4221 17.2479 19.4994 16.0965 23.3474C15.5221 25.2671 15.0436 26.9157 14.3093 27.9424C13.8976 28.518 13.2115 29 12.2478 29Z" fill="url(#home-gradient-5)"></path>
                          <defs>
                            <radialGradient id="home-gradient-0" cx="0" cy="0" r="1" gradientTransform="matrix(-7.37821 -8.55084 -7.96607 7.17216 25.5747 13.5466)" gradientUnits="userSpaceOnUse">
                              <stop offset="0.0955758" stop-color="#00AEFF"></stop>
                              <stop offset="0.773185" stop-color="#2253CE"></stop>
                              <stop offset="1" stop-color="#0736C4"></stop>
                            </radialGradient>
                            <radialGradient id="home-gradient-1" cx="0" cy="0" r="1" gradientTransform="matrix(6.61516 7.92888 7.80904 -6.47171 7.1753 21.9482)" gradientUnits="userSpaceOnUse">
                              <stop stop-color="#FFB657"></stop>
                              <stop offset="0.633728" stop-color="#FF5F3D"></stop>
                              <stop offset="0.923392" stop-color="#C02B3C"></stop>
                            </radialGradient>
                            <radialGradient id="home-gradient-2" cx="0" cy="0" r="1" gradientTransform="matrix(-0.990905 -17.2799 98.0282 -5.51056 8.54161 22.4952)" gradientUnits="userSpaceOnUse">
                              <stop offset="0.03" stop-color="#FFC800"></stop>
                              <stop offset="0.31" stop-color="#98BD42"></stop>
                              <stop offset="0.49" stop-color="#52B471"></stop>
                              <stop offset="0.843838" stop-color="#0D91E1"></stop>
                            </radialGradient>
                            <linearGradient id="home-gradient-3" x1="9.52186" y1="3" x2="10.3572" y2="22.5029" gradientUnits="userSpaceOnUse">
                              <stop stop-color="#3DCBFF"></stop>
                              <stop offset="0.246674" stop-color="#0588F7" stop-opacity="0"></stop>
                            </linearGradient>
                            <radialGradient id="home-gradient-4" cx="0" cy="0" r="1" gradientTransform="matrix(-8.64067 24.4636 -29.4075 -10.797 27.8096 7.58585)" gradientUnits="userSpaceOnUse">
                              <stop offset="0.0661714" stop-color="#8C48FF"></stop>
                              <stop offset="0.5" stop-color="#F2598A"></stop>
                              <stop offset="0.895833" stop-color="#FFB152"></stop>
                            </radialGradient>
                            <linearGradient id="home-gradient-5" x1="28.6736" y1="8.30469" x2="28.6627" y2="13.617" gradientUnits="userSpaceOnUse">
                              <stop offset="0.0581535" stop-color="#F8ADFA"></stop>
                              <stop offset="0.708063" stop-color="#A86EDD" stop-opacity="0"></stop>
                            </linearGradient>
                          </defs>
                        </svg>
                      </button>
                    </div>

                    <!-- Action buttons -->
                    <div class="composer-action-buttons">
                      <!-- Open button -->
                      <div class="composer-button-wrapper">
                        <button
                          aria-label="Open"
                          type="button"
                          class="composer-button composer-open-btn"
                          title="Open"
                          data-testid="composer-create-button"
                        >
                          <div class="composer-icon-add">
                            <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="composer-icon-small">
                              <path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C12.5523 4 13 4.44772 13 5V11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H13V19C13 19.5523 12.5523 20 12 20C11.4477 20 11 19.5523 11 19V13H5C4.44772 13 4 12.5523 4 12C4 11.4477 4.44772 11 5 11H11V5C11 4.44772 11.4477 4 12 4Z"></path>
                            </svg>
                          </div>
                        </button>
                      </div>

                      <!-- Smart mode button -->
                      <div class="composer-button-wrapper">
                        <button
                          aria-label="Smart (GPT-5)"
                          type="button"
                          class="composer-button composer-smart-btn"
                          title="Smart (GPT-5)"
                          data-testid="composer-chat-mode-smart-button"
                        >
                          <span class="composer-smart-text">Smart (GPT-5)</span>
                          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="composer-icon-arrow">
                            <path d="M8.46967 4.21967C8.17678 4.51256 8.17678 4.98744 8.46967 5.28033L15.1893 12L8.46967 18.7197C8.17678 19.0126 8.17678 19.4874 8.46967 19.7803C8.76256 20.0732 9.23744 20.0732 9.53033 19.7803L16.7803 12.5303C17.0732 12.2374 17.0732 11.7626 16.7803 11.4697L9.53033 4.21967C9.23744 3.92678 8.76256 3.92678 8.46967 4.21967Z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Right controls -->
                  <div class="composer-right-controls">
                    <!-- Voice call button -->
                    <div class="composer-button-wrapper">
                      <button
                        aria-label="Talk to Copilot"
                        type="button"
                        class="composer-button composer-voice-btn"
                        title="Talk to Copilot"
                        data-testid="audio-call-button"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="composer-icon">
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M16.7673 6.54284C16.7673 3.91128 14.634 1.77799 12.0024 1.77799C9.37089 1.77799 7.2376 3.91129 7.2376 6.54284L7.2376 13.5647C7.2376 16.1963 9.37089 18.3296 12.0024 18.3296C14.634 18.3296 16.7673 16.1963 16.7673 13.5647L16.7673 6.54284ZM12.0024 3.28268C13.803 3.28268 15.2626 4.7423 15.2626 6.54284L15.2626 13.5647C15.2626 15.3652 13.803 16.8249 12.0024 16.8249C10.2019 16.8249 8.74229 15.3652 8.74229 13.5647L8.74229 6.54284C8.74229 4.7423 10.2019 3.28268 12.0024 3.28268Z"></path>
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M20.0274 8.79987C19.6119 8.79987 19.2751 9.1367 19.2751 9.55221V13.5647C19.2751 17.5813 16.019 20.8374 12.0024 20.8374C7.98587 20.8374 4.72979 17.5813 4.72979 13.5647L4.72979 9.55221C4.72979 9.1367 4.39295 8.79987 3.97744 8.79987C3.56193 8.79987 3.2251 9.1367 3.2251 9.55221L3.2251 13.5647C3.2251 18.4123 7.15485 22.3421 12.0024 22.3421C16.85 22.3421 20.7798 18.4123 20.7798 13.5647V9.55221C20.7798 9.1367 20.443 8.79987 20.0274 8.79987Z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Draft Page Layout */
.draft-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: rgb(241 245 249);
}

.dark .draft-page {
  background-color: rgb(15 23 42);
}

/* Composer Container */
.composer-container {
  width: 100%;
  max-width: 48rem;
  min-width: 4rem;
}

/* Main Composer */
.composer-main {
  position: relative;
  border-radius: 1.75rem;
  min-height: 4rem;
  max-height: 100%;
  min-width: 4rem;
  max-width: 100%;
}

/* Glow Effect */
.composer-glow {
  position: absolute;
  inset: 0;
  border-radius: 32px;
  box-shadow: rgba(248, 188, 140, 0.18) 0px 16px 48px 0px;
  z-index: 0;
}

/* Main Body */
.composer-body {
  position: relative;
  border-radius: 32px;
  box-shadow: rgba(0, 0, 0, 0.08) 0px 16px 24px 0px;
  backdrop-filter: blur(32px) saturate(200%);
  background: rgba(172, 182, 229, 0.36);
  z-index: 1;
}

/* Content Area */
.composer-content {
  position: relative;
  border-radius: 32px;
  box-shadow: rgb(255, 255, 255) 0px 0px 0px 1px inset;
  padding: 6px;
}

/* Inner Composer */
.composer-inner {
  position: relative;
  border-radius: 32px;
  background: linear-gradient(to bottom, rgba(226, 232, 240, 0.05), rgba(226, 232, 240, 0.08));
}

/* White Overlay */
.composer-white-overlay {
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.9);
}

/* Input Container */
.composer-input-container {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 26px;
}

/* Spacer */
.composer-spacer {
  width: 100%;
  height: 0;
}

/* Input Section */
.composer-input-section {
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: auto;
  flex-grow: 1;
  margin-top: 4px;
}

/* Input Wrapper */
.composer-input-wrapper {
  position: relative;
  flex-grow: 1;
  overflow: hidden;
  cursor: text;
}

/* Text Area */
.composer-text-area {
  position: relative;
  display: flex;
  height: 100%;
  flex-direction: column;
  color: rgb(0, 0, 0);
}

.dark .composer-text-area {
  color: rgb(255, 255, 255);
}

/* Scroll Area */
.composer-scroll-area {
  flex-grow: 1;
  overflow-y: auto;
  padding-left: 1rem;
  padding-right: 1rem;
  max-height: 240px;
}

/* Input Relative */
.composer-input-relative {
  position: relative;
}

/* Label */
.composer-label {
  position: absolute;
  top: 0;
  left: 0;
  height: 0;
  width: 0;
  overflow: hidden;
  white-space: nowrap;
}

/* Textarea */
.composer-textarea {
  width: 100%;
  height: 22px !important;
  resize: none;
  overflow-y: hidden;
  white-space: pre-wrap;
  background: transparent;
  outline: none;
  border: none;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.625rem;
  color: inherit;
  padding: 0;
  margin: 0;
}

.composer-textarea::placeholder {
  color: rgb(107, 114, 128);
}

.dark .composer-textarea::placeholder {
  color: rgb(209, 213, 219);
}

/* Bottom Spacer */
.composer-bottom-spacer {
  position: relative;
  height: 36px;
  flex: none;
}

/* Controls */
.composer-controls {
  position: relative;
  display: flex;
  justify-content: space-between;
  padding: 2px 10px 4px 6px;
}

/* Left Controls */
.composer-left-controls {
  display: flex;
  gap: 4px;
}

/* Home Button */
.composer-home-button {
  position: relative;
  flex-shrink: 0;
  height: 36px;
  overflow: hidden;
}

/* Action Buttons */
.composer-action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Button Wrapper */
.composer-button-wrapper {
  position: relative;
}

/* Base Button */
.composer-button {
  position: relative;
  display: flex;
  align-items: center;
  color: rgb(31, 41, 55);
  fill: rgb(31, 41, 55);
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  justify-content: center;
  min-height: 36px;
  min-width: 36px;
  border-radius: 16px;
  padding: 0;
  transition: all 0.15s ease;
}

.composer-button:hover {
  background: rgba(0, 0, 0, 0.05);
}

.composer-button:active {
  background: rgba(0, 0, 0, 0.03);
  color: rgb(55, 65, 81);
  fill: rgb(55, 65, 81);
}

.dark .composer-button {
  color: rgb(209, 213, 219);
  fill: rgb(209, 213, 219);
}

.dark .composer-button:hover {
  background: rgba(0, 0, 0, 0.3);
}

.dark .composer-button:active {
  background: rgba(0, 0, 0, 0.2);
  color: rgb(156, 163, 175);
  fill: rgb(156, 163, 175);
}

/* Home Button */
.composer-home-btn {
  position: absolute;
  padding: 2px;
}

.composer-home-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Open Button */
.composer-open-btn {
  gap: 4px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.dark .composer-open-btn {
  border-color: rgba(255, 255, 255, 0.08);
}

/* Smart Button */
.composer-smart-btn {
  padding-left: 10px;
  padding-right: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.dark .composer-smart-btn {
  border-color: rgba(255, 255, 255, 0.08);
}

/* Smart Text */
.composer-smart-text {
  font-size: 0.875rem;
}

/* Right Controls */
.composer-right-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Voice Button */
.composer-voice-btn {
  padding: 0;
}

/* Icons */
.composer-icon {
  width: 24px;
  height: 24px;
}

.composer-icon-small {
  width: 20px;
  height: 20px;
}

.composer-icon-arrow {
  width: 16px;
  height: 16px;
  transform: rotate(90deg);
}

.composer-icon-add {
  width: 24px;
  height: 24px;
  color: currentColor;
}
</style>