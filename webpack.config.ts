// webpack.config.ts
import type { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import grafanaConfig from './.config/webpack/webpack.config';
import path from 'path';  // Add this import

const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

/**
 * Config
 */
const config = async (env): Promise<Configuration> => {
  const baseConfig = await grafanaConfig(env);

  return merge(baseConfig, {
    output: {
      asyncChunks: true,
      // Ensure source map paths reference @volkovlabs correctly
      devtoolModuleFilenameTemplate: (info) =>
        info.resourcePath.startsWith('.') ?
        `webpack:///${info.resourcePath}` :
        `webpack://@volkovlabs/${path.relative(path.resolve(__dirname, 'node_modules'), info.resourcePath)}`,
    },
    // devtool: env.production ? 'source-map' : 'eval-source-map',  // Force source maps
    devtool: 'eval-source-map',
    module: {
      rules: [
        {
          test: /\.(js|ts)x?$/,
          include: [
            // Explicitly include volkovlabs components source maps
            path.resolve(__dirname, 'node_modules/@volkovlabs/components'),
          ],
          use: ['source-map-loader'],
          enforce: 'pre',
        },
      ],
    },
    resolve: {
      plugins: [
        new TsconfigPathsPlugin({
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          configFile: path.resolve(__dirname, 'tsconfig.json'),
        })
      ],
    },
  });
};

export default config;
