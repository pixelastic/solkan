import { parse } from 'unbash';

const testCases = [
  'time echo hello',
  'time FOO=bar echo hello',
  'FOO=bar time echo hello',
  'echo start && time echo hello',
];

testCases.forEach((commandLine) => {
  console.log('\n' + '='.repeat(80));
  console.log('Command:', commandLine);
  console.log('='.repeat(80));
  try {
    const ast = parse(commandLine);
    console.log(JSON.stringify(ast, null, 2));
  } catch (e) {
    console.log('ERROR:', e.message);
  }
});
