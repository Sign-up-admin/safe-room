module.exports = {
  '*.{js,ts,jsx,tsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  '*.vue': [
    'eslint --fix',
    'prettier --write',
    'stylelint --fix',
  ],
  '*.{json,md,html}': [
    'prettier --write',
  ],
  '*.{css,scss}': [
    'stylelint --fix',
    'prettier --write',
  ],
}

