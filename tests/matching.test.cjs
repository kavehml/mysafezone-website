const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8');
const context = {};
vm.runInNewContext(source.slice(source.indexOf('const matchTherapists ='), source.indexOf('const matchForm =')) + '\nthis.api = {matchTherapists, availableMatchLanguages, rankMatches};', context);
const {matchTherapists, availableMatchLanguages, rankMatches} = context.api;
const languages = availableMatchLanguages();
assert.equal(languages.includes('other'), false);
assert.equal(languages.includes('Arabic'), true);
assert.equal(availableMatchLanguages([{languages:['French']}]).join(','), 'French');
assert.equal(availableMatchLanguages([]).length, 0);
const topics = ['anxiety','depression','stress','relationships','trauma','grief','transitions','newcomer'];
let cases = 0;
for (const language of languages) {
  for (const age of ['child','teen','adult']) {
    const eligible = matchTherapists.filter(t => t.languages.includes(language) && t.ages.includes(age));
    for (let mask = 0; mask < 256; mask++) {
      const selected = topics.filter((_, i) => mask & (1 << i));
      for (const style of ['', 'tools', 'understand', 'listen']) {
        const matches = rankMatches({language, age, topics:selected, style}, () => 0.5);
        assert.equal(matches.length, Math.min(2, eligible.length), `${language}/${age}/${selected}`);
        assert.ok(matches.every(t => t.languages.includes(language) && t.ages.includes(age)));
        assert.ok(matches.every(t => t.matched.every(topic => t.topics.includes(topic))));
        if (matches.length > 1) assert.ok(matches[0].score >= matches[1].score);
        cases++;
      }
    }
  }
}
assert.equal(rankMatches({language:'Arabic',age:'adult',topics:['depression'],style:''})[0].name, 'Sana Choghri');
assert.equal(rankMatches({language:'Unsupported',age:'adult',topics:[],style:''}).length, 0);
console.log(`Passed ${cases} language/age/concern/style combinations and source-list checks.`);
