import { FileSystemTree } from '@webcontainer/api';

export const files: FileSystemTree = {
  'package.json': {
    file: {
      contents: `
      {
        "name": "cli-mmo-web-app",
        "type": "module",
        "scripts": {
          "start": "echo 'nothing here yet'"
        }
      }`,
    },
  },
};
