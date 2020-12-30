import parseArgs from "minimist";
import { cli } from './scrape.js';

const argv = parseArgs(process.argv.slice(2), {});
console.log(argv);

cli(argv);