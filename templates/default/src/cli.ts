#!/usr/bin/env node

import {resolve} from 'path';
import {create} from 'create-whatever';

const templateRoot = resolve(__dirname, '../templates');
const caveat = `This is a caveat!
You can find this section in "src/cli.ts".
`;

create('{{name}}', templateRoot, {caveat});
