import {readFileSync} from 'node:fs';
import * as input from './inputs/ctc-pages.mjs';

const source=JSON.parse(readFileSync(new URL('./inputs/ctc-pages.json',import.meta.url),'utf8'));
console.log(JSON.stringify({名称:'笔迹页与词图修订',首项:source['frames'],字段:Object.keys(source),取数函数:Object.keys(input)},null,2));
