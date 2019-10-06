#!/usr/bin/env node

import {resolve} from 'path';
import {create} from 'create-whatever';

const templateRoot = resolve(__dirname, '../templates');

create('{{name}}', templateRoot);
