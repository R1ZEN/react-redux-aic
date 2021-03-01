module.exports = (api) => {
  api.cache(true);

  return {
    'presets': [
      [
        '@babel/env',
        {
          targets: {
            esmodules: true,
          },
        },
      ],
      '@babel/preset-react',
      '@babel/typescript',
    ],
    'plugins': ['@babel/plugin-transform-runtime'],
  };
};
