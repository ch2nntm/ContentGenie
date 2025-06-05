

import blacklistData from '../blacklist.json';

export function checkBlacklist(text: string) {
  const violations: string[] = [];  
  const lowerText = text.toLowerCase();

  for (const words of Object.values(blacklistData.blacklist)) {
    const found = words.filter((word) => {
      const regex = new RegExp(`\\b${word.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')}\\b`, 'iu');
      return regex.test(lowerText);
    });

    violations.push(...found);
  }

  return violations;
}
