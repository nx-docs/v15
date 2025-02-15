import { cypressProjectGenerator } from '@nrwl/cypress';
import type { Tree } from '@nrwl/devkit';
import {
  addDependenciesToPackageJson,
  readProjectConfiguration,
  updateProjectConfiguration,
} from '@nrwl/devkit';
import { nxVersion } from '../../../utils/versions';
import type { NormalizedSchema } from './normalized-schema';
import { removeScaffoldedE2e } from './remove-scaffolded-e2e';

export async function addE2e(tree: Tree, options: NormalizedSchema) {
  removeScaffoldedE2e(tree, options, options.ngCliSchematicE2ERoot);

  if (options.e2eTestRunner === 'cypress') {
    // TODO: This can call `@nrwl/web:static-config` generator when ready
    addFileServerTarget(tree, options, 'serve-static');

    await cypressProjectGenerator(tree, {
      name: options.e2eProjectName,
      directory: options.directory,
      project: options.name,
      linter: options.linter,
      standaloneConfig: options.standaloneConfig,
      skipPackageJson: options.skipPackageJson,
      skipFormat: true,
    });
  }
}

function addFileServerTarget(
  tree: Tree,
  options: NormalizedSchema,
  targetName: string
) {
  addDependenciesToPackageJson(tree, {}, { '@nrwl/web': nxVersion });

  const projectConfig = readProjectConfiguration(tree, options.name);
  projectConfig.targets[targetName] = {
    executor: '@nrwl/web:file-server',
    options: {
      buildTarget: `${options.name}:build`,
      port: options.port,
    },
  };
  updateProjectConfiguration(tree, options.name, projectConfig);
}
