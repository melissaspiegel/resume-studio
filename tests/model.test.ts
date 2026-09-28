import {describe,it,expect} from 'vitest';
import {parseResume,textToDraft,sampleResume} from '../src/model';
describe('resume data',()=>{it('round trips a saved resume',()=>{const r=sampleResume();expect(parseResume(JSON.stringify(r))).toEqual(r)});it('rejects malformed JSON data',()=>expect(()=>parseResume('{"name":1,"experience":[]}')).toThrow());it('keeps extracted PDF text for manual review',()=>expect(textToDraft('Alex Morgan\nEngineer\nExample Co.').importedText).toContain('Example Co.'))});
