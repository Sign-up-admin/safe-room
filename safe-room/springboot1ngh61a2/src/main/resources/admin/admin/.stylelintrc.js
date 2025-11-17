export default {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-recess-order'
  ],
  plugins: ['stylelint-scss'],
  rules: {
    // Allow SCSS syntax
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': true,
    'scss/at-import-partial-extension': null,
    'scss/dollar-variable-pattern': null,
    'scss/selector-no-redundant-nesting-selector': null,

    // Allow modern color functions but also legacy rgba() for compatibility
    'color-function-notation': null,
    'alpha-value-notation': null,

    // Allow vendor prefixes for compatibility
    'value-no-vendor-prefix': null,

    // Relax property ordering for complex SCSS mixins
    'order/properties-order': null,

    // Allow empty lines in SCSS
    'declaration-empty-line-before': null,
    'rule-empty-line-before': null,

    // Allow hex color length variations
    'color-hex-length': null,

    // Allow non-standard linear-gradient directions for compatibility
    'function-linear-gradient-no-nonstandard-direction': null,

    // Allow hue degree notation variations
    'hue-degree-notation': null,

    // Allow Element Plus BEM selectors (they use underscores)
    'selector-class-pattern': null,

    // Allow Vue 3 pseudo-classes (:deep, :slotted, :global)
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['deep', 'slotted', 'global']
      }
    ],

    // Allow Vue 3 pseudo-elements (::v-deep, ::v-slotted, ::v-global)
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['v-deep', 'v-slotted', 'v-global']
      }
    ],

    // Allow argumentless mixin calls with parentheses for consistency
    'scss/at-mixin-argumentless-call-parentheses': null,

    // Allow global SCSS functions like map-get
    'scss/no-global-function-names': null,

    // Allow empty style blocks in Vue files (for scoped styles)
    'no-empty-source': null,

    // Disable descending specificity check for complex components
    // This rule can produce false positives in complex Vue components with multiple states
    'no-descending-specificity': null,
  },
  ignoreFiles: [
    'dist/**',
    'node_modules/**',
    'coverage/**',
    'test-results/**',
    'playwright-report/**',
    '**/*.js',
    '**/*.ts'
    // Vue files are now included for style checking
  ],
  overrides: [
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html'
    }
  ]
}
