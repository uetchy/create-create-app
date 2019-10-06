#!/usr/bin/env node

import {resolve} from 'path';
import {create} from '.';

create('create-whatever', resolve(__dirname, '../templates'));
