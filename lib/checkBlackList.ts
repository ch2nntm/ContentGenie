// import blacklistData from '../blacklist.json';

// export function checkBlacklist(text: string) {
//   const violations: Record<string, string[]> = {};

//   const lowerText = text.toLowerCase();

//   for (const [category, words] of Object.entries(blacklistData.blacklist)) {
//     const found = words.filter((word) => {
//       const regex = new RegExp(`\\b${word.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')}\\b`, 'iu');
//       return regex.test(lowerText);
//     });

//     if (found.length > 0) {
//       violations[category] = found;
//     }
//   }

//   return violations;
// }


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
