import chapters from './career-chapters.json';
import lines from './career-lines.json';
const requiredLevels=['intern','junior','mid','senior','tech_lead','architect'];
if(chapters.length!==requiredLevels.length||new Set(chapters.map(item=>item.levelId)).size!==requiredLevels.length||requiredLevels.some(id=>!chapters.some(item=>item.levelId===id))||chapters.some(item=>Object.values(item).some(value=>typeof value!=='string'||!value.trim())))throw new Error('Invalid career chapter content');
if(Object.values(lines).some(value=>typeof value!=='string'||!value.trim()))throw new Error('Invalid career lines');
export const careerChapters=chapters;
export const careerLines=lines;
